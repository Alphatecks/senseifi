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
          width: min(980px, 100%);
          border-radius: 34px;
          border: 1px solid #1f4bff;
          background: radial-gradient(120% 140% at 50% 10%, #0a1032 0%, #060a24 40%, #030516 100%);
          box-shadow: 0 0 0 1px rgba(30, 63, 255, 0.35) inset, 0 30px 80px rgba(0, 0, 0, 0.45);
          color: #ffffff;
          overflow: hidden;
          font-family: "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        #${OVERLAY_ID} .senseiguard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        #${OVERLAY_ID} .senseiguard-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(26px, 4vw, 54px);
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        #${OVERLAY_ID} .senseiguard-logo {
          width: clamp(38px, 4vw, 56px);
          height: clamp(38px, 4vw, 56px);
          object-fit: contain;
        }
        #${OVERLAY_ID} .senseiguard-close {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 24px;
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
        }
        #${OVERLAY_ID} .senseiguard-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        #${OVERLAY_ID} .senseiguard-body {
          padding: clamp(18px, 3vw, 34px) clamp(22px, 4vw, 38px) clamp(34px, 4vw, 52px);
          text-align: center;
        }
        #${OVERLAY_ID} .senseiguard-progress-track {
          width: 100%;
          height: 26px;
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
          margin: 28px 0 8px;
          font-size: clamp(36px, 5.5vw, 66px);
          line-height: 1.06;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        #${OVERLAY_ID} .senseiguard-subtitle {
          margin: 0 0 10px;
          font-size: clamp(18px, 2.4vw, 28px);
          color: rgba(255, 255, 255, 0.92);
        }
        #${OVERLAY_ID} .senseiguard-list {
          margin: 8px auto 0;
          padding: 0;
          list-style: none;
          max-width: 660px;
        }
        #${OVERLAY_ID} .senseiguard-list li {
          margin: 7px 0;
          font-size: clamp(20px, 3vw, 30px);
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
          width: min(980px, 100%);
          border-radius: 34px;
          border: 1px solid #1f4bff;
          background: radial-gradient(120% 140% at 50% 10%, #0a1032 0%, #060a24 40%, #030516 100%);
          box-shadow: 0 0 0 1px rgba(30, 63, 255, 0.35) inset, 0 30px 80px rgba(0, 0, 0, 0.45);
          color: #ffffff;
          overflow: hidden;
          font-family: "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(26px, 4vw, 54px);
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-logo {
          width: clamp(38px, 4vw, 56px);
          height: clamp(38px, 4vw, 56px);
          object-fit: contain;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-close {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 24px;
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-body {
          padding: clamp(18px, 3vw, 34px) clamp(22px, 4vw, 38px) clamp(22px, 4vw, 30px);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-detected-title {
          margin: 0 0 18px;
          font-size: clamp(24px, 3.8vw, 54px);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-critical {
          color: #ff3131;
          margin: 0 0 22px;
          font-size: clamp(24px, 3.4vw, 44px);
          font-weight: 700;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 28px;
          border-radius: 18px;
          margin-bottom: 14px;
          background: linear-gradient(180deg, rgba(19, 28, 66, 0.95) 0%, rgba(12, 19, 46, 0.95) 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
          font-size: clamp(20px, 2.8vw, 44px);
          font-weight: 600;
        }
        #${ALERT_OVERLAY_ID} .senseiguard-row-muted {
          color: rgba(255, 255, 255, 0.32);
        }
        #${ALERT_OVERLAY_ID} .senseiguard-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          margin-top: 10px;
          padding: 24px;
          cursor: pointer;
          font-size: clamp(20px, 2.7vw, 42px);
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
          margin: 18px 4px 0;
          font-size: clamp(16px, 2.1vw, 33px);
          color: rgba(255, 255, 255, 0.96);
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.innerHTML = `
        <div class="senseiguard-card" role="dialog" aria-modal="true" aria-label="SenseiGuard scan in progress">
          <div class="senseiguard-header">
            <div class="senseiguard-brand">
              <img class="senseiguard-logo" src="${chrome.runtime.getURL('assets/scaled_logo.png')}" alt="SenseiGuard" />
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
      overlay = document.createElement('div');
      overlay.id = ALERT_OVERLAY_ID;
      overlay.innerHTML = `
        <div class="senseiguard-card" role="dialog" aria-modal="true" aria-label="SenseiGuard malicious contract warning">
          <div class="senseiguard-header">
            <div class="senseiguard-brand">
              <img class="senseiguard-logo" src="${chrome.runtime.getURL('assets/scaled_logo.png')}" alt="SenseiGuard" />
              <span>SenseiGuard</span>
            </div>
            <button type="button" class="senseiguard-close" aria-label="Close">×</button>
          </div>
          <div class="senseiguard-body">
            <h2 class="senseiguard-detected-title">Malicious Contract Detected</h2>
            <p class="senseiguard-critical">🚨 Critical Warning</p>
            <div class="senseiguard-row">
              <span>Risk Level:</span>
              <span id="senseiguard-alert-risk">9.6 / 10</span>
            </div>
            <div class="senseiguard-row senseiguard-row-muted">
              <span>Reported incidents:</span>
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

  function showScanOverlay(requestId, method) {
    if (!requestId) return;
    pendingRequests.add(requestId);
    const overlay = ensureScanOverlay();
    const subtitle = overlay.querySelector('.senseiguard-subtitle');
    if (subtitle) {
      subtitle.textContent =
        method === 'eth_sendTransaction'
          ? 'transaction and approval risk'
          : method && method.startsWith('eth_signTypedData')
            ? 'typed-signature and phishing risk'
            : 'real-time wallet risks';
    }
    overlay.classList.add('senseiguard-visible');
  }

  function hideScanOverlay(requestId) {
    if (requestId) pendingRequests.delete(requestId);
    if (pendingRequests.size > 0) return;
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.classList.remove('senseiguard-visible');
  }

  function isMaliciousDecision(decision) {
    if (!decision) return false;
    if (decision.maliciousContractDetected) return true;
    if (decision.action === 'block') return true;
    const findings = Array.isArray(decision.findings) ? decision.findings.join(' ').toLowerCase() : '';
    const reason = String(decision.reason || '').toLowerCase();
    const backendBand = String(decision.backendBand || '').toLowerCase();
    return (
      backendBand === 'block' ||
      findings.includes('malicious') ||
      findings.includes('scam') ||
      findings.includes('drain') ||
      reason.includes('malicious') ||
      reason.includes('scam')
    );
  }

  function showMaliciousOverlay(decision, requestContext) {
    const overlay = ensureAlertOverlay();
    const riskTextNode = overlay.querySelector('#senseiguard-alert-risk');
    const incidentsNode = overlay.querySelector('#senseiguard-alert-incidents');
    const blockBtn = overlay.querySelector('#senseiguard-btn-block');
    const proceedBtn = overlay.querySelector('#senseiguard-btn-proceed');
    const titleNode = overlay.querySelector('.senseiguard-detected-title');

    const riskScore = Number(decision && decision.riskScore ? decision.riskScore : 96);
    const riskLevel10 =
      typeof decision?.riskLevel10 === 'number'
        ? decision.riskLevel10
        : Math.max(0, Math.min(10, riskScore / 10));
    if (riskTextNode) {
      riskTextNode.textContent = `${Math.max(0, Math.min(10, riskLevel10)).toFixed(1)} / 10`;
    }

    if (titleNode && decision && decision.action === 'warn') {
      titleNode.textContent = 'High-Risk Contract Detected';
    }

    if (incidentsNode) {
      if (
        typeof decision?.walletsDrainedEstimate === 'number' &&
        Number.isFinite(decision.walletsDrainedEstimate)
      ) {
        incidentsNode.textContent = `${decision.walletsDrainedEstimate} wallets drained`;
      } else if (
        typeof decision?.reportedIncidents === 'number' &&
        Number.isFinite(decision.reportedIncidents)
      ) {
        incidentsNode.textContent = `${decision.reportedIncidents} reported incidents`;
      } else {
        const fallback =
          decision && decision.action === 'block' ? 'Critical malicious contract activity' : 'Suspicious activity reported';
        incidentsNode.textContent =
          Array.isArray(decision?.findings) && decision.findings.length > 0 ? decision.findings[0] : fallback;
      }
    }

    if (blockBtn) {
      blockBtn.onclick = function () {
        chrome.runtime.sendMessage({
          type: 'SENSEIGUARD_USER_DECISION',
          decision: 'block',
          context: {
            method: requestContext?.method || null,
            riskScore: decision?.riskScore || null,
          },
        });
        overlay.classList.remove('senseiguard-visible');
      };
    }

    if (proceedBtn) {
      proceedBtn.onclick = function () {
        chrome.runtime.sendMessage({
          type: 'SENSEIGUARD_USER_DECISION',
          decision: 'proceed',
          context: {
            method: requestContext?.method || null,
            riskScore: decision?.riskScore || null,
          },
        });
        overlay.classList.remove('senseiguard-visible');
      };
      proceedBtn.style.display = decision?.action === 'block' ? 'none' : 'block';
    }

    overlay.classList.add('senseiguard-visible');
  }

  function injectInpageHook() {
    if (document.getElementById('senseiguard-inpage-hook')) return;
    const script = document.createElement('script');
    script.id = 'senseiguard-inpage-hook';
    script.src = chrome.runtime.getURL('inpage-hook.js');
    script.async = false;
    (document.documentElement || document.head).appendChild(script);
    script.onload = function () {
      script.remove();
    };
  }

  async function askBackgroundForDecision(payload) {
    return chrome.runtime.sendMessage({
      type: 'SENSEIGUARD_EVALUATE_TX',
      payload,
    });
  }

  function sendDebugEvent(eventName, details) {
    if (!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)) return;
    chrome.runtime.sendMessage({
      type: 'SENSEIGUARD_DEBUG_EVENT',
      payload: {
        event: eventName,
        details: details || null,
      },
    });
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
    sendDebugEvent('tx_request_received', {
      method: data.method || 'unknown',
      frameHref: window.location ? window.location.href : '',
    });
    showScanOverlay(requestId, data.method);

    try {
      const response = await askBackgroundForDecision({
        method: data.method,
        params: data.params,
      });

      const decision = response?.decision || {
        action: 'allow',
        riskScore: 0,
        reason: 'No decision returned',
      };

      window.postMessage(
        {
          source: EXTENSION_TO_PAGE,
          requestId,
          decision,
        },
        '*'
      );
      if (isMaliciousDecision(decision)) {
        showMaliciousOverlay(decision, { method: data.method });
      }
      sendDebugEvent('tx_decision_sent', {
        method: data.method || 'unknown',
        action: decision.action || 'allow',
        riskScore: decision.riskScore || 0,
      });
    } catch (error) {
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

  injectInpageHook();
})();
