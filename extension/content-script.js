/* SenseiGuard content script
 * Bridges page-level wallet interception events to the background service worker.
 */

(function () {
  'use strict';
  if (globalThis.__senseiguardContentBridgeInstalled) return;
  globalThis.__senseiguardContentBridgeInstalled = true;

  const PAGE_TO_EXTENSION = 'SENSEIGUARD_TX_REQUEST';
  const EXTENSION_TO_PAGE = 'SENSEIGUARD_TX_DECISION';
  const DEBUG_TO_EXTENSION = 'SENSEIGUARD_DEBUG_EVENT';
  const OVERLAY_ID = 'senseiguard-scan-overlay';
  const ALERT_OVERLAY_ID = 'senseiguard-alert-overlay';
  const STYLE_ID = 'senseiguard-scan-overlay-style';
  const pendingRequests = new Set();
  /** Domains approved in-page this session — skips re-scan UI when wallet re-requests connect. */
  const locallyApprovedConnectDomains = new Set();
  const chainFamilies =
    globalThis.SenseiGuardChainFamilies ||
    (globalThis.SenseiGuardChainFamilies = {
      resolveChainFamily: function (value) {
        return value === 'solana' ? 'solana' : 'evm';
      },
      isConnectMethod: function (chainFamily, method) {
        if (chainFamily === 'solana') {
          return method === 'connect' || method === 'wallet_standard_connect';
        }
        if (chainFamily === 'cosmos') {
          return method === 'enable' || method === 'experimentalSuggestChain';
        }
        if (chainFamily === 'bitcoin') {
          return method === 'requestAccounts' || method === 'connect';
        }
        return method === 'eth_requestAccounts' || method === 'wallet_requestPermissions';
      },
      getScanSubtitle: function (chainFamily, method) {
        return 'real-time wallet risks';
      },
      connectApprovalKey: function (chainFamily, domain) {
        return (chainFamily || 'evm') + '::' + String(domain || '').trim().toLowerCase();
      },
      HOOK_SCRIPTS: ['inpage-hook.js', 'solana-hook.js'],
    });
  /** Risk scores at or below this (out of 10) show "Safe to proceed" only. */
  const RISK_LEVEL10_REVIEW_THRESHOLD = 3;
  /** Keep the scanning overlay visible long enough to read during wallet connect. */
  const CONNECT_SCAN_MIN_VISIBLE_MS = 900;

  function resolveChainFamily(value) {
    return chainFamilies.resolveChainFamily(value);
  }

  function isConnectMethod(chainFamily, method) {
    return chainFamilies.isConnectMethod(resolveChainFamily(chainFamily), method);
  }

  function getRiskLevel10(decision) {
    const riskScore = typeof decision?.riskScore === 'number' ? decision.riskScore : 0;
    const riskLevel10 =
      typeof decision?.riskLevel10 === 'number'
        ? decision.riskLevel10
        : Math.max(0, Math.min(10, riskScore <= 10 ? riskScore : riskScore / 10));
    return Math.max(0, Math.min(10, riskLevel10));
  }

  function isLowRiskDecision(decision) {
    return getRiskLevel10(decision) <= RISK_LEVEL10_REVIEW_THRESHOLD;
  }

  function currentDomain() {
    try {
      return window.location && window.location.hostname
        ? String(window.location.hostname).toLowerCase()
        : '';
    } catch (_error) {
      return '';
    }
  }

  function isExtensionContextAlive() {
    return typeof chrome !== 'undefined' && !!(chrome.runtime && chrome.runtime.id);
  }

  function safeRuntimeGetUrl(path) {
    if (!isExtensionContextAlive()) return '';
    try {
      return chrome.runtime.getURL(path);
    } catch (_error) {
      return '';
    }
  }

  function sendRuntimeMessage(message) {
    if (!isExtensionContextAlive()) {
      return Promise.reject(new Error('Extension context invalidated'));
    }
    try {
      return chrome.runtime.sendMessage(message);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function ensureScanOverlay() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #${OVERLAY_ID} {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(2, 5, 20, 0.62);
          backdrop-filter: blur(2px);
        }
        #${OVERLAY_ID}.senseiguard-visible {
          display: flex;
        }
        #${OVERLAY_ID} .senseiguard-card {
          width: min(400px, 100%);
          border-radius: 20px;
          border: 1px solid #1f4bff;
          background: radial-gradient(120% 140% at 50% 10%, #0a1032 0%, #060a24 40%, #030516 100%);
          box-shadow: 0 0 0 1px rgba(30, 63, 255, 0.35) inset, 0 20px 48px rgba(0, 0, 0, 0.45);
          color: #ffffff;
          overflow: hidden;
          font-family: "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1.45;
        }
        #${OVERLAY_ID} .senseiguard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        #${OVERLAY_ID} .senseiguard-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        #${OVERLAY_ID} .senseiguard-logo {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }
        #${OVERLAY_ID} .senseiguard-close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
        }
        #${OVERLAY_ID} .senseiguard-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        #${OVERLAY_ID} .senseiguard-body {
          padding: 16px 20px 22px;
          text-align: center;
        }
        #${OVERLAY_ID} .senseiguard-progress-track {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(8, 14, 39, 0.9);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }
        #${OVERLAY_ID} .senseiguard-progress-bar {
          width: 72%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0d41ff 0%, #0034ff 100%);
          animation: senseiguard-progress 1.2s ease-in-out infinite alternate;
        }
        #${OVERLAY_ID} .senseiguard-title {
          margin: 18px 0 4px;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        #${OVERLAY_ID} .senseiguard-subtitle {
          margin: 0 0 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.92);
        }
        #${OVERLAY_ID} .senseiguard-list {
          margin: 6px auto 0;
          padding: 0;
          list-style: none;
          max-width: 100%;
        }
        #${OVERLAY_ID} .senseiguard-list li {
          margin: 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.22);
          letter-spacing: -0.01em;
        }
        @keyframes senseiguard-progress {
          from {
            width: 56%;
          }
          to {
            width: 86%;
          }
        }
        #${ALERT_OVERLAY_ID} {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(2, 5, 20, 0.66);
          backdrop-filter: blur(2px);
        }
        #${ALERT_OVERLAY_ID}.senseiguard-visible {
          display: flex;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-card {
          width: min(400px, 100%);
          border-radius: 20px;
          border: 1px solid #1f4bff;
          background: radial-gradient(120% 140% at 50% 10%, #0a1032 0%, #060a24 40%, #030516 100%);
          box-shadow: 0 0 0 1px rgba(30, 63, 255, 0.35) inset, 0 20px 48px rgba(0, 0, 0, 0.45);
          color: #ffffff;
          overflow: hidden;
          font-family: "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1.45;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-logo {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-body {
          padding: 16px 18px 18px;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-detected-title {
          margin: 0 0 10px;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-critical {
          color: #ff3131;
          margin: 0 0 14px;
          font-size: 14px;
          font-weight: 700;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-critical-warning {
          color: #ffcc66;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-critical-safe {
          color: #32bb1d;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 8px;
          background: linear-gradient(180deg, rgba(19, 28, 66, 0.95) 0%, rgba(12, 19, 46, 0.95) 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
          font-size: 13px;
          font-weight: 600;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-row-muted {
          color: rgba(255, 255, 255, 0.32);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-finding-low {
          color: #32bb1d !important;
          font-weight: 700;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          margin-top: 8px;
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-btn-block {
          color: #ffffff;
          background: linear-gradient(180deg, #2862ff 0%, #1249ff 100%);
          box-shadow: 0 0 0 2px rgba(173, 198, 255, 0.25) inset;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-btn-proceed {
          color: #ffffff;
          background: linear-gradient(180deg, rgba(20, 28, 62, 0.95) 0%, rgba(13, 20, 48, 0.95) 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          font-weight: 600;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-support {
          margin: 12px 2px 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.96);
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      const logoUrl = safeRuntimeGetUrl('assets/scaled_logo.png');
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.innerHTML = `
        <div class="senseiguard-card" role="dialog" aria-modal="true" aria-label="SenseiGuard scan in progress">
          <div class="senseiguard-header">
            <div class="senseiguard-brand">
              <img class="senseiguard-logo" src="${logoUrl}" alt="SenseiGuard" />
              <span>SenseiGuard</span>
            </div>
            <button type="button" class="senseiguard-close" aria-label="Close">×</button>
          </div>
          <div class="senseiguard-body">
            <div class="senseiguard-progress-track">
              <div class="senseiguard-progress-bar"></div>
            </div>
            <h2 class="senseiguard-title">Scanning for</h2>
            <p class="senseiguard-subtitle">real-time wallet risks</p>
            <ul class="senseiguard-list">
              <li>Existing token approvals</li>
              <li>Suspicious tokens</li>
              <li>Contract interactions</li>
              <li>Wallet risk history</li>
            </ul>
          </div>
        </div>
      `;
      overlay.querySelector('.senseiguard-close').addEventListener('click', function () {
        overlay.classList.remove('senseiguard-visible');
      });
      (document.body || document.documentElement).appendChild(overlay);
    }

    return overlay;
  }

  function ensureAlertOverlay() {
    ensureScanOverlay();
    let overlay = document.getElementById(ALERT_OVERLAY_ID);
    if (!overlay) {
      const logoUrl = safeRuntimeGetUrl('assets/scaled_logo.png');
      overlay = document.createElement('div');
      overlay.id = ALERT_OVERLAY_ID;
      overlay.innerHTML = `
        <div class="senseiguard-card" role="dialog" aria-modal="true" aria-label="SenseiGuard malicious contract warning">
          <div class="senseiguard-header">
            <div class="senseiguard-brand">
              <img class="senseiguard-logo" src="${logoUrl}" alt="SenseiGuard" />
              <span>SenseiGuard</span>
            </div>
            <button type="button" class="senseiguard-close" aria-label="Close">×</button>
          </div>
          <div class="senseiguard-body">
            <h2 class="senseiguard-detected-title">Malicious Contract Detected</h2>
            <p class="senseiguard-critical" id="senseiguard-alert-critical">🚨 Critical Warning</p>
            <div class="senseiguard-row">
              <span>Risk Level:</span>
              <span id="senseiguard-alert-risk">9.6 / 10</span>
            </div>
            <div class="senseiguard-row senseiguard-row-muted">
              <span id="senseiguard-alert-meta-label">Detected incidents:</span>
              <span id="senseiguard-alert-incidents">Multiple wallets drained</span>
            </div>
            <button type="button" class="senseiguard-btn senseiguard-btn-block" id="senseiguard-btn-block">
              Block Transaction (recommended)
            </button>
            <button type="button" class="senseiguard-btn senseiguard-btn-proceed" id="senseiguard-btn-proceed">
              Proceed at your own risk
            </button>
            <p class="senseiguard-support">ⓘ Need help? Talk to Support</p>
          </div>
        </div>
      `;

      overlay.querySelector('.senseiguard-close').addEventListener('click', function () {
        overlay.classList.remove('senseiguard-visible');
      });
      (document.body || document.documentElement).appendChild(overlay);
    }
    return overlay;
  }

  function hideScanOverlayImmediately() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.classList.remove('senseiguard-visible');
  }

  function markConnectApproved(chainFamily, domain) {
    const key = chainFamilies.connectApprovalKey(resolveChainFamily(chainFamily), domain);
    if (key) locallyApprovedConnectDomains.add(key);
  }

  function isConnectApprovedLocally(chainFamily, domain) {
    const key = chainFamilies.connectApprovalKey(resolveChainFamily(chainFamily), domain);
    return key ? locallyApprovedConnectDomains.has(key) : false;
  }

  async function recordUserDecision(choice, decision, requestContext) {
    const chainFamily = resolveChainFamily(requestContext?.chainFamily);
    const isConnect = isConnectMethod(chainFamily, requestContext?.method);
    const showSafeProceedOnly = isLowRiskDecision(decision) && !isMaliciousDecision(decision);
    try {
      await sendRuntimeMessage({
        type: 'SENSEIGUARD_USER_DECISION',
        decision: choice === 'proceed' ? 'proceed' : 'block',
        context: {
          chainFamily: chainFamily,
          method: requestContext?.method || null,
          riskScore: decision?.riskScore || null,
          domain: currentDomain(),
          safeProceed: showSafeProceedOnly,
        },
      });
    } catch (_error) {
      // Best-effort telemetry/approval persistence — do not block wallet flow.
    }
  }

  function showScanOverlay(requestId, method, chainFamily) {
    if (!requestId) return;
    pendingRequests.add(requestId);
    const overlay = ensureScanOverlay();
    const subtitle = overlay.querySelector('.senseiguard-subtitle');
    if (subtitle) {
      subtitle.textContent = chainFamilies.getScanSubtitle(resolveChainFamily(chainFamily), method);
    }
    overlay.classList.add('senseiguard-visible');
  }

  function hideScanOverlay(requestId) {
    if (requestId) pendingRequests.delete(requestId);
    if (pendingRequests.size > 0) return;
    hideScanOverlayImmediately();
  }

  function completeScanRequest(requestId) {
    if (requestId) pendingRequests.delete(requestId);
    hideScanOverlayImmediately();
  }

  function isMaliciousDecision(decision) {
    if (!decision) return false;
    if (decision.maliciousEvidence) return true;
    if (decision.maliciousContractDetected) return true;
    const backendBand = String(decision.backendBand || '').toLowerCase();
    return backendBand === 'block';
  }

  function showMaliciousOverlay(decision, requestContext) {
    return new Promise((resolve) => {
    hideScanOverlayImmediately();
    const overlay = ensureAlertOverlay();
    const riskTextNode = overlay.querySelector('#senseiguard-alert-risk');
    const incidentsNode = overlay.querySelector('#senseiguard-alert-incidents');
    const incidentsLabelNode = overlay.querySelector('#senseiguard-alert-meta-label');
    const criticalNode = overlay.querySelector('#senseiguard-alert-critical');
    const blockBtn = overlay.querySelector('#senseiguard-btn-block');
    const proceedBtn = overlay.querySelector('#senseiguard-btn-proceed');
    const titleNode = overlay.querySelector('.senseiguard-detected-title');
    const findingPrefixRegex = /^\s*\[(low|medium|high|critical)\]\s*/i;
    function parseFinding(rawFinding) {
      const source = typeof rawFinding === 'string' ? rawFinding : '';
      const match = source.match(findingPrefixRegex);
      const severity = match ? String(match[1] || '').toLowerCase() : null;
      const cleaned = source.replace(findingPrefixRegex, '').trim();
      return {
        severity,
        cleaned: cleaned || source.trim(),
      };
    }

    const malicious = isMaliciousDecision(decision);
    const normalizedRiskLevel10 = getRiskLevel10(decision);
    const isConnect = isConnectMethod(resolveChainFamily(requestContext?.chainFamily), requestContext?.method);
    const showSafeProceedOnly = isLowRiskDecision(decision) && !malicious;

    if (riskTextNode) {
      riskTextNode.textContent = `${normalizedRiskLevel10.toFixed(1)} / 10`;
    }

    const websiteScanFindings = Array.isArray(decision?.websiteScanFindings)
      ? decision.websiteScanFindings
      : [];
    const preferredRawFinding =
      websiteScanFindings.length > 0
        ? websiteScanFindings[0]
        : Array.isArray(decision?.findings) && decision.findings.length > 0
          ? decision.findings[0]
          : '';
    const parsedTopFinding = parseFinding(preferredRawFinding);
    const hasLowTopFinding = parsedTopFinding.severity === 'low';

    if (titleNode) {
      if (showSafeProceedOnly) {
        titleNode.textContent = isConnect ? 'Connection Check Complete' : 'Scan Complete';
      } else if (malicious) {
        titleNode.textContent = 'Malicious Contract Detected';
      } else if (isConnect) {
        titleNode.textContent = 'Risky Connection Detected';
      } else {
        titleNode.textContent = 'Scan Issue Detected';
      }
    }
    if (criticalNode) {
      criticalNode.classList.remove('senseiguard-critical-warning', 'senseiguard-critical-safe');
      if (showSafeProceedOnly) {
        criticalNode.textContent = '✓ Safe to proceed';
        criticalNode.classList.add('senseiguard-critical-safe');
      } else if (malicious) {
        criticalNode.textContent = '🚨 Critical Warning';
      } else {
        criticalNode.textContent = '⚠ Review required before proceeding';
        criticalNode.classList.add('senseiguard-critical-warning');
      }
    }
    if (incidentsLabelNode) {
      incidentsLabelNode.textContent = showSafeProceedOnly
        ? 'Summary:'
        : malicious
          ? 'Detected incidents:'
          : 'Top finding:';
    }
    if (incidentsNode) {
      incidentsNode.classList.remove('senseiguard-finding-low');
    }

    if (blockBtn) {
      blockBtn.style.display = showSafeProceedOnly ? 'none' : 'block';
      blockBtn.textContent = isConnect
        ? 'Block Connection (recommended)'
        : 'Block Transaction (recommended)';
    }
    if (proceedBtn) {
      proceedBtn.style.display = 'block';
      proceedBtn.textContent = showSafeProceedOnly ? 'Safe to proceed' : 'Proceed at your own risk';
    }

    if (incidentsNode) {
      if (showSafeProceedOnly) {
        incidentsNode.textContent = isConnect
          ? 'No significant risks detected for this connection.'
          : 'No significant risks detected.';
        incidentsNode.classList.add('senseiguard-finding-low');
      } else if (malicious && (
        typeof decision?.walletsDrainedEstimate === 'number' &&
        Number.isFinite(decision.walletsDrainedEstimate)
      )) {
        incidentsNode.textContent = `${decision.walletsDrainedEstimate} wallets drained`;
      } else if (
        malicious &&
        typeof decision?.reportedIncidents === 'number' &&
        Number.isFinite(decision.reportedIncidents)
      ) {
        incidentsNode.textContent = `${decision.reportedIncidents} detected incidents`;
      } else {
        const fallback =
          malicious ? 'Critical malicious contract activity' : 'Suspicious activity reported';
        const preferredFinding = parsedTopFinding.cleaned || fallback;
        incidentsNode.textContent = preferredFinding;
        if (hasLowTopFinding) {
          incidentsNode.classList.add('senseiguard-finding-low');
        }
      }
    }

    if (blockBtn) {
      blockBtn.onclick = function () {
        overlay.classList.remove('senseiguard-visible');
        resolve('block');
      };
    }

    if (proceedBtn) {
      proceedBtn.onclick = function () {
        overlay.classList.remove('senseiguard-visible');
        resolve('proceed');
      };
    }

    const closeBtn = overlay.querySelector('.senseiguard-close');
    if (closeBtn) {
      closeBtn.onclick = function () {
        overlay.classList.remove('senseiguard-visible');
        resolve('dismiss');
      };
    }

    overlay.classList.add('senseiguard-visible');
    });
  }

  function injectHookScript(scriptId, hookFile) {
    if (document.getElementById(scriptId)) return;
    const hookUrl = safeRuntimeGetUrl(hookFile);
    if (!hookUrl) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = hookUrl;
    script.async = false;
    (document.documentElement || document.head).appendChild(script);
    script.onload = function () {
      script.remove();
    };
  }

  function injectProtectionHooks() {
    (chainFamilies.HOOK_SCRIPTS || ['inpage-hook.js', 'solana-hook.js']).forEach(function (hookFile) {
      injectHookScript('senseiguard-hook-' + hookFile.replace(/\.js$/, ''), hookFile);
    });
  }

  async function askBackgroundForDecision(payload) {
    return sendRuntimeMessage({
      type: 'SENSEIGUARD_EVALUATE_TX',
      payload,
    });
  }

  function sendDebugEvent(eventName, details) {
    sendRuntimeMessage({
      type: 'SENSEIGUARD_DEBUG_EVENT',
      payload: {
        event: eventName,
        details: details || null,
      },
    }).catch(function () {});
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (data && data.source === DEBUG_TO_EXTENSION) {
      sendDebugEvent(data.event || 'inpage_debug', data.details || null);
      return;
    }
    if (!data || data.source !== PAGE_TO_EXTENSION) return;

    const requestId = data.requestId;
    if (!requestId) return;
    const domain = currentDomain();
    const chainFamily = resolveChainFamily(data.chainFamily);
    const isConnect = isConnectMethod(chainFamily, data.method);
    const skipScanUi = isConnect && isConnectApprovedLocally(chainFamily, domain);
    sendDebugEvent('tx_request_received', {
      chainFamily: chainFamily,
      method: data.method || 'unknown',
      frameHref: window.location ? window.location.href : '',
    });
    const scanStartedAt = Date.now();
    if (!skipScanUi) {
      showScanOverlay(requestId, data.method, chainFamily);
    }

    try {
      const response = await askBackgroundForDecision({
        chainFamily: chainFamily,
        method: data.method,
        params: data.params,
        meta: data.meta || null,
      });

      if (!skipScanUi && isConnect) {
        const elapsed = Date.now() - scanStartedAt;
        if (elapsed < CONNECT_SCAN_MIN_VISIBLE_MS) {
          await new Promise(function (resolve) {
            setTimeout(resolve, CONNECT_SCAN_MIN_VISIBLE_MS - elapsed);
          });
        }
      }

      const decision = response?.decision || {
        action: 'allow',
        riskScore: 0,
        reason: 'No decision returned',
      };

      const requiresUserGate =
        (isConnect && !decision.skipUserGate) ||
        decision.action === 'warn' ||
        isMaliciousDecision(decision);

      let finalDecision = decision;

      if (requiresUserGate) {
        hideScanOverlayImmediately();
        const userChoice = await showMaliciousOverlay(decision, {
          chainFamily: chainFamily,
          method: data.method,
        });
        await recordUserDecision(
          userChoice === 'proceed' ? 'proceed' : 'block',
          decision,
          { chainFamily: chainFamily, method: data.method }
        );
        if (userChoice === 'proceed' && isConnect) {
          markConnectApproved(chainFamily, domain);
        }
        if (userChoice === 'block' || userChoice === 'dismiss') {
          finalDecision = {
            ...decision,
            action: 'block',
            reason:
              userChoice === 'dismiss'
                ? isConnect
                  ? 'Blocked: wallet connection dismissed in SenseiGuard review'
                  : 'Blocked: user dismissed SenseiGuard review'
                : decision.reason || 'Blocked by user via SenseiGuard review',
          };
        } else {
          finalDecision = {
            ...decision,
            action: 'allow',
            reason: decision.reason || 'Allowed by user after SenseiGuard review',
          };
        }
      } else if (decision.action === 'block') {
        // Non-connect requests with a hard block still fail closed without a modal.
        finalDecision = decision;
      }

      completeScanRequest(requestId);

      window.postMessage(
        {
          source: EXTENSION_TO_PAGE,
          requestId,
          decision: finalDecision,
        },
        '*'
      );
      sendDebugEvent('tx_decision_sent', {
        method: data.method || 'unknown',
        action: finalDecision.action || 'allow',
        riskScore: finalDecision.riskScore || 0,
      });
    } catch (error) {
      completeScanRequest(requestId);
      sendDebugEvent('tx_decision_error', {
        method: data.method || 'unknown',
        message: String(error && error.message ? error.message : error),
      });
      window.postMessage(
        {
          source: EXTENSION_TO_PAGE,
          requestId,
          decision: {
            action: 'warn',
            riskScore: 50,
            reason: `Background unavailable: ${String(error && error.message ? error.message : error)}`,
            findings: ['SenseiGuard fallback warning'],
          },
        },
        '*'
      );
    } finally {
      hideScanOverlay(requestId);
    }
  });

  const EXTENSION_WALLET_BRIDGE_SOURCE = 'senseifi-connect-wallet';
  const EXTENSION_WALLET_BRIDGE_TYPE = 'SENSEIGUARD_EXTENSION_WALLET_CONNECTED';
  const EXTENSION_WALLET_BRIDGE_DISCONNECTED = 'SENSEIGUARD_EXTENSION_WALLET_DISCONNECTED';
  const EXTENSION_REQUEST_SOURCE = 'senseiguard-extension';
  const EXTENSION_REQUEST_WALLET_SESSION = 'SENSEIGUARD_REQUEST_WALLET_SESSION';

  function isSenseifiWebAppPage() {
    try {
      var host = currentDomain();
      return (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === 'senseifi.io' ||
        host === 'www.senseifi.io' ||
        host.endsWith('.senseifi.io')
      );
    } catch (_error) {
      return false;
    }
  }

  function persistWebWalletSession(payload) {
    var wallet = payload.wallet || null;
    var address = payload.address || (wallet && wallet.address) || null;
    var chainId = payload.chainId || (wallet && wallet.chain_id) || null;
    if (!address || !chainId) return;
    var chainFamily =
      (payload && payload.chainFamily) ||
      (wallet && wallet.chain_family) ||
      (chainId === 101 ? 'solana' : 'evm');

    var response = {
      success: true,
      data: wallet || {
        address: address,
        chain_id: chainId,
        chain_family: chainFamily,
        wallet_type: payload.walletType || 'walletconnect',
        connected_at: new Date().toISOString(),
        is_active: true,
      },
      dashboard_user: payload.dashboard_user || null,
    };

    chrome.storage.local.set({
      senseiguard_wc_bridge_result: {
        ok: true,
        address: address,
        chainId: chainId,
        response: response,
        completedAt: Date.now(),
      },
      senseiguard_wc_bridge_pending: false,
      senseiguard_wallet_connect: {
        wallet: response.data,
        dashboard_user: response.dashboard_user,
        savedAt: Date.now(),
      },
      senseiguard_wallet_address: address,
    });

    sendRuntimeMessage({
      type: 'SENSEIGUARD_REGISTER_WALLET',
      wallet: response.data,
      dashboardUser: response.dashboard_user,
    }).catch(function () {
      // Keep web sync resilient if background is unavailable.
    });
  }

  function clearWebWalletSession() {
    chrome.storage.local.remove([
      'senseiguard_wc_bridge_result',
      'senseiguard_wc_bridge_pending',
      'senseiguard_wallet_connect',
      'senseiguard_wallet_address',
      'senseiguard_session',
    ]);
    sendRuntimeMessage({
      type: 'SENSEIGUARD_CLEAR_WALLET_SESSION',
    }).catch(function () {
      // Keep disconnect sync resilient if background is unavailable.
    });
  }

  function handleExtensionWalletBridgeMessage(event) {
    if (!isSenseifiWebAppPage()) return;
    if (event.source !== window) return;
    var data = event.data;
    if (!data || data.source !== EXTENSION_WALLET_BRIDGE_SOURCE) return;

    if (data.type === EXTENSION_WALLET_BRIDGE_DISCONNECTED) {
      clearWebWalletSession();
      return;
    }

    if (data.type !== EXTENSION_WALLET_BRIDGE_TYPE) return;
    persistWebWalletSession(data.payload || {});
  }

  window.addEventListener('message', handleExtensionWalletBridgeMessage);

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
      if (!message || message.type !== 'SENSEIGUARD_REQUEST_WEB_WALLET_SYNC') {
        return false;
      }
      if (!isSenseifiWebAppPage()) {
        sendResponse({ ok: false, error: 'Not a SenseiFi page' });
        return false;
      }
      try {
        window.postMessage(
          {
            source: EXTENSION_REQUEST_SOURCE,
            type: EXTENSION_REQUEST_WALLET_SESSION,
          },
          window.location.origin
        );
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
      return false;
    });
  }

  injectProtectionHooks();
})();
