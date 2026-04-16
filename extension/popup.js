/**
 * SenseiGuard popup — welcome → activate → connect wallet (+ backend /wallets/connect)
 */

function scrollShellTop() {
  const shell = document.querySelector('.welcome-scroll-shell');
  if (shell) shell.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', function () {
  const viewWelcome = document.getElementById('view-welcome');
  const viewActivate = document.getElementById('view-activate');
  const viewConnect = document.getElementById('view-connect-wallet');
  const shell = document.querySelector('.welcome-scroll-shell');
  const ctaWelcome = document.getElementById('cta-welcome-connect');
  const ctaActivate = document.getElementById('cta-activate-connect');
  const ctaConnectMain = document.getElementById('cta-connect-wallet-main');
  const cwStatus = document.getElementById('cw-status');
  const activateToggle = document.getElementById('activate-extension-toggle');
  const connectFlow = document.getElementById('cw-connect-flow');
  const connectedDashboard = document.getElementById('cw-connected-dashboard');
  const walletScanView = document.getElementById('cw-wallet-scan-view');
  const walletScanResultView = document.getElementById('cw-wallet-scan-result-view');
  const riskPanelView = document.getElementById('cw-risk-panel-view');
  const analysisEngineView = document.getElementById('cw-analysis-engine-view');
  const maliciousContractView = document.getElementById('cw-malicious-contract-view');
  const scamTokenView = document.getElementById('cw-scam-token-view');
  const contractScanView = document.getElementById('cw-contract-scan-view');
  const autoBlockView = document.getElementById('cw-autoblock-view');
  const walletScanProgressFill = document.getElementById('cw-wallet-scan-progress-fill');
  const walletScoreBadge = document.getElementById('cw-wallet-score-badge');
  const walletFindingApprovals = document.getElementById('cw-wallet-finding-approvals');
  const walletFindingAirdrops = document.getElementById('cw-wallet-finding-airdrops');
  const walletFindingDrainer = document.getElementById('cw-wallet-finding-drainer');
  const walletGaugeNeedle = document.querySelector('.cw-wallet-result-gauge-needle');
  const connectFooter = document.querySelector('#view-connect-wallet .cw-footer');
  const walletScanDoneBtn = document.querySelector('[data-action="wallet-scan-done"]');
  const walletScanLearnMoreBtn = document.querySelector('[data-action="wallet-scan-learn-more"]');
  const riskPanelDoneBtn = document.querySelector('[data-action="risk-panel-done"]');
  const analysisEngineDoneBtn = document.querySelector('[data-action="analysis-engine-done"]');
  const analysisEngineLearnBtn = document.querySelector('[data-action="analysis-engine-learn"]');
  const maliciousBlockBtn = document.querySelector('[data-action="malicious-block"]');
  const maliciousProceedBtn = document.querySelector('[data-action="malicious-proceed"]');
  const scamDoneBtn = document.querySelector('[data-action="scam-done"]');
  const scamProceedBtn = document.querySelector('[data-action="scam-proceed"]');
  const contractScanStartBtn = document.querySelector('[data-action="contract-scan-start"]');
  const contractScanBackBtn = document.querySelector('[data-action="contract-scan-back"]');
  const contractLinkInput = document.getElementById('cw-contract-link-input');
  const contractScanFeedback = document.getElementById('cw-contract-scan-feedback');
  const chainSelectWrap = document.getElementById('cw-chain-select-wrap');
  const chainSelectToggle = document.getElementById('cw-chain-select-toggle');
  const chainSelectMenu = document.getElementById('cw-chain-select-menu');
  const chainSelectCurrentLogo = document.getElementById('cw-chain-select-current-logo');
  const chainSelectCurrentName = document.getElementById('cw-chain-select-current-name');
  const chainOptionButtons = document.querySelectorAll('.cw-chain-option');
  const analysisTransactionDetails = document.getElementById('cw-analysis-transaction-details');
  const analysisTransactionRisk = document.getElementById('cw-analysis-transaction-risk');
  const analysisRiskLevel = document.getElementById('cw-analysis-risk-level');
  const analysisRecommendation = document.getElementById('cw-analysis-recommendation');
  const riskSiteReputation = document.getElementById('cw-risk-site-reputation');
  const riskContractRisk = document.getElementById('cw-risk-contract-risk');
  const riskUserReports = document.getElementById('cw-risk-user-reports');
  const maliciousTitle = document.getElementById('cw-malicious-title');
  const maliciousRiskLevel = document.getElementById('cw-malicious-risk-level');
  const maliciousIncidents = document.getElementById('cw-malicious-incidents');
  const maliciousWarningText = document.getElementById('cw-malicious-warning-text');
  const scamTokenSymbol = document.getElementById('cw-scam-token-symbol');
  const scamTokenRiskLevel = document.getElementById('cw-scam-token-risk-level');
  const scamTokenTitleText = document.getElementById('cw-scam-token-title-text');
  const scamTokenWarningText = document.getElementById('cw-scam-token-warning-text');
  const autoBlockSaveBtn = document.querySelector('[data-action="autoblock-save"]');
  const autoBlockBackBtn = document.querySelector('[data-action="autoblock-back"]');
  const walletScanToggleBtns = document.querySelectorAll('.cw-wallet-result-switch[data-action^="toggle-"]');
  const walletResultToggleRows = document.querySelectorAll('#cw-wallet-scan-result-view .cw-wallet-result-switch-row');
  const analysisToggleBtns = document.querySelectorAll('.cw-wallet-result-switch[data-action^="analysis-"]');
  const scamToggleBtns = document.querySelectorAll('.cw-wallet-result-switch[data-action^="scam-"]');
  const autoBlockToggleBtns = document.querySelectorAll('.cw-wallet-result-switch[data-action^="autoblock-"]');
  let connectAssetsHydrated = false;
  let walletScanTimerId = null;
  let contractScanTimerId = null;
  let currentWalletAddress = '';
  let walletHealthScoreSource = 'wallet';
  let analysisEngineSource = 'wallet';
  let selectedChainId = 1;
  let lastContractScanPayload = null;
  let lastAnalysisPayload = null;
  let lastRiskPanelPayload = null;
  let lastScamPayload = null;

  /** Main CTA uses last row chosen, else MetaMask */
  let lastWalletType = 'metamask';

  function setCwStatus(text, kind) {
    if (!cwStatus) return;
    cwStatus.textContent = text || '';
    cwStatus.classList.remove('cw-status--error', 'cw-status--success');
    if (kind === 'error') cwStatus.classList.add('cw-status--error');
    if (kind === 'success') cwStatus.classList.add('cw-status--success');
  }

  function setConnectBusy(busy) {
    const buttons = document.querySelectorAll(
      '#view-connect-wallet .welcome-cta, #view-connect-wallet [data-action^="connect-"]'
    );
    buttons.forEach(function (b) {
      b.disabled = !!busy;
      b.style.opacity = busy ? '0.65' : '';
    });
  }

  function getWalletApiBase() {
    const g = window.SENSEIGUARD || {};
    const raw = g.WALLET_API_BASE_URL || 'https://senseifi-backend.onrender.com/api';
    return String(raw).replace(/\/$/, '');
  }

  function clampScore(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function extractApiData(json) {
    if (!json || typeof json !== 'object') return null;
    if (json.success && typeof json.data !== 'undefined') return json.data;
    if (typeof json.data !== 'undefined') return json.data;
    return json;
  }

  function formatRiskOutOf10(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback || 'None';
    const normalized = n > 10 ? n / 10 : n;
    return Math.max(0, Math.min(10, normalized)).toFixed(1) + ' / 10';
  }

  function pickFirstText(values, fallback) {
    for (let i = 0; i < values.length; i += 1) {
      const v = values[i];
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) return String(v);
    }
    return fallback || 'None';
  }

  function pickFirstNumber(values) {
    for (let i = 0; i < values.length; i += 1) {
      const n = Number(values[i]);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  function extractContractAddressFromLink(link) {
    const input = String(link || '');
    const m = input.match(/\/address\/(0x[a-fA-F0-9]{40})/);
    return m ? m[1] : '';
  }

  function isContractAddress(value) {
    return /^0x[a-fA-F0-9]{40}$/.test(String(value || '').trim());
  }

  function syncChainDropdownVisibility() {
    const raw = contractLinkInput ? contractLinkInput.value.trim() : '';
    if (!chainSelectWrap) return;
    const show = isContractAddress(raw);
    chainSelectWrap.classList.toggle('view-hidden', !show);
    if (!show && chainSelectMenu) {
      chainSelectMenu.classList.add('view-hidden');
      if (chainSelectToggle) chainSelectToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function pickFirstNonEmptyString(values) {
    for (let i = 0; i < values.length; i += 1) {
      const v = values[i];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  }

  async function callExtensionApi(path, payload) {
    const isScanContractExtensionApi =
      typeof path === 'string' && path.indexOf('/protection/extension/') === 0;
    try {
      const res = await fetch(getWalletApiBase() + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      const json = await res.json().catch(function () {
        return null;
      });
      if (isScanContractExtensionApi) {
        console.log('[SenseiGuard popup][extension api]', {
          path: path,
          request: payload || {},
          status: res.status,
          ok: res.ok,
          response: json,
        });
      }
      if (!res.ok || !json) return null;
      return extractApiData(json);
    } catch (err) {
      if (isScanContractExtensionApi) {
        console.error('[SenseiGuard popup][extension api][error]', {
          path: path,
          request: payload || {},
          error: err && err.message ? err.message : String(err),
        });
      }
      return null;
    }
  }

  async function sendScreenAction(action, extra) {
    if (!currentWalletAddress) return null;
    const payload = {
      wallet_address: currentWalletAddress,
      action: action,
      chain_id: 1,
      ...(extra || {}),
    };
    return callExtensionApi('/protection/extension/screen-action', payload);
  }

  function renderAnalysisEngine(data) {
    const source = data || {};
    if (analysisTransactionDetails) {
      analysisTransactionDetails.textContent = pickFirstText(
        [source.transaction_details, source.details, source.summary, source.reason],
        'None'
      );
    }
    if (analysisTransactionRisk) {
      const txRiskValue = pickFirstNumber([
        source.transaction_risk_score,
      ]);
      analysisTransactionRisk.textContent = formatRiskOutOf10(
        txRiskValue,
        'None'
      );
    }
    if (analysisRiskLevel) {
      const riskValue = pickFirstNumber([
        source.final_decision_score,
        source.risk_score,
        source.riskScore,
      ]);
      analysisRiskLevel.textContent = formatRiskOutOf10(
        riskValue,
        'None'
      );
    }
    if (analysisRecommendation) {
      analysisRecommendation.textContent = pickFirstText(
        [source.recommendation, source.action_hint, source.next_step],
        'None'
      );
    }
  }

  function renderRiskPanel(data) {
    const source = data || {};
    const findings =
      source.findings && typeof source.findings === 'object' ? source.findings : {};
    if (riskSiteReputation) {
      const siteReputationValue = pickFirstText(
        [
          findings.site_reputation,
          source.site_reputation,
          source.safety,
          source.site_safety,
          source.domain_safety,
        ],
        'None'
      );
      riskSiteReputation.textContent = siteReputationValue;
      const isWarning = String(siteReputationValue || '').trim().toLowerCase() === 'warning';
      riskSiteReputation.classList.toggle('cw-risk-value-warning', isWarning);
    }
    if (riskContractRisk) {
      const panelRiskValue = pickFirstNumber([
        source.risk_level_10,
        source.risk_score,
        source.riskScore,
      ]);
      if (panelRiskValue !== null) {
        riskContractRisk.textContent = formatRiskOutOf10(panelRiskValue, 'None');
      } else {
        riskContractRisk.textContent = pickFirstText(
          [
            findings.contract_risk,
            source.contract_risk,
            source.risk_level,
            source.risk_band,
          ],
          'None'
        );
      }
    }
    if (riskUserReports) {
      const incidents = pickFirstText(
        [
          findings.user_reports,
          source.user_reports,
          source.reported_incidents,
          source.alert_count,
        ],
        ''
      );
      riskUserReports.textContent = incidents || 'None';
    }
  }

  function renderMaliciousContract(data) {
    const source = data || {};
    const scoreRaw = pickFirstNumber([
      source.contract_risk_score,
      source.risk_level_10,
      source.risk_score,
      source.riskScore,
    ]);
    const riskPercent =
      scoreRaw === null
        ? null
        : scoreRaw <= 10
          ? Math.round(scoreRaw * 10)
          : Math.round(scoreRaw);
    if (maliciousRiskLevel) {
      const riskValue = pickFirstNumber([
        source.contract_risk_score,
        source.risk_level_10,
        source.risk_score,
        source.riskScore,
      ]);
      maliciousRiskLevel.textContent = formatRiskOutOf10(
        riskValue,
        'None'
      );
    }
    const titleRiskValue = pickFirstNumber([
      source.contract_risk_score,
      source.risk_level_10,
      source.risk_score,
      source.riskScore,
    ]);
    const titleRiskOutOf10 =
      titleRiskValue === null ? null : (titleRiskValue > 10 ? titleRiskValue / 10 : titleRiskValue);
    const titleDrained = pickFirstNumber([source.wallets_drained_estimate]);
    if (maliciousTitle) {
      const shouldUseSuspiciousTitle =
        titleRiskOutOf10 !== null &&
        titleRiskOutOf10 < 5 &&
        titleDrained === 1;
      maliciousTitle.textContent = shouldUseSuspiciousTitle
        ? 'Quite Suspicious but not Malicious'
        : 'Malicious Contract Detected';
    }
    if (maliciousWarningText) {
      maliciousWarningText.classList.remove(
        'cw-malicious-contract-warning--moderate',
        'cw-malicious-contract-warning--good'
      );
      if (riskPercent !== null && riskPercent <= 50) {
        maliciousWarningText.textContent = 'Critical level is good';
        maliciousWarningText.classList.add('cw-malicious-contract-warning--good');
      } else if (riskPercent !== null && riskPercent <= 60) {
        maliciousWarningText.textContent = 'Critical level is moderate';
        maliciousWarningText.classList.add('cw-malicious-contract-warning--moderate');
      } else {
        maliciousWarningText.textContent = '🚨 Critical Warning';
      }
    }
    if (maliciousIncidents) {
      const drained = pickFirstNumber([source.wallets_drained_estimate]);
      if (drained !== null) {
        maliciousIncidents.textContent = String(drained) + ' wallets drained';
      } else {
        const reported = pickFirstNumber([source.reported_incidents]);
        if (reported !== null) {
          maliciousIncidents.textContent = String(reported) + ' detected incidents';
        } else {
          maliciousIncidents.textContent = pickFirstText(
            [source.reported_incidents_text, source.top_finding],
            'None'
          );
        }
      }
    }
  }

  function renderScamToken(data) {
    const source = data || {};
    const isCriticalWarning = source.critical_warning === true;
    if (scamTokenTitleText) {
      scamTokenTitleText.textContent = isCriticalWarning
        ? 'Scam Token Detected'
        : 'Safe Token detected';
    }
    if (scamTokenWarningText) {
      scamTokenWarningText.classList.remove('cw-scam-token-warning--safe');
      if (isCriticalWarning) {
        scamTokenWarningText.textContent = '🚨 Critical Warning';
      } else {
        scamTokenWarningText.textContent = '✅ Safe Token';
        scamTokenWarningText.classList.add('cw-scam-token-warning--safe');
      }
    }
    if (scamTokenSymbol) {
      scamTokenSymbol.textContent = pickFirstText(
        [source.token, source.token_symbol, source.symbol],
        'None'
      );
    }
    if (scamTokenRiskLevel) {
      const riskLevelText = pickFirstNonEmptyString([source.risk_level]);
      if (/^\d+(\.\d+)?\s*\/\s*10$/i.test(riskLevelText)) {
        scamTokenRiskLevel.textContent = riskLevelText.replace(/\s*\/\s*/, ' / ');
        return;
      }
      const riskValue = pickFirstNumber([
        source.risk_level_10,
        source.risk_score,
        source.riskScore,
      ]);
      scamTokenRiskLevel.textContent = formatRiskOutOf10(
        riskValue,
        'None'
      );
    }
  }

  function showConnectOnlyView() {
    if (viewWelcome) viewWelcome.classList.add('view-hidden');
    if (viewActivate) viewActivate.classList.add('view-hidden');
    if (viewConnect) viewConnect.classList.remove('view-hidden');
    if (shell) shell.classList.add('welcome-scroll-shell--connect');
    scrollShellTop();
  }

  function setConnectedDashboardMode(isConnected) {
    if (connectFlow) connectFlow.classList.toggle('view-hidden', !!isConnected);
    if (connectedDashboard) connectedDashboard.classList.toggle('view-hidden', !isConnected);
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (maliciousContractView) maliciousContractView.classList.add('view-hidden');
    if (scamTokenView) scamTokenView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (autoBlockView) autoBlockView.classList.add('view-hidden');
    if (cwStatus) cwStatus.classList.remove('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function showWalletScanResultView() {
    if (!walletScanResultView) return;
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    walletScanResultView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
  }

  function setWalletResultTogglesVisible(visible) {
    walletResultToggleRows.forEach(function (row) {
      row.classList.toggle('view-hidden', !visible);
    });
  }

  function showRiskPanelView() {
    if (!riskPanelView) return;
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (maliciousContractView) maliciousContractView.classList.add('view-hidden');
    if (scamTokenView) scamTokenView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (autoBlockView) autoBlockView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    riskPanelView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function showAnalysisEngineView(source) {
    if (!analysisEngineView) return;
    analysisEngineSource = source === 'contract' ? 'contract' : 'wallet';
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    analysisEngineView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function showMaliciousContractView() {
    if (!maliciousContractView) return;
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    maliciousContractView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function showScamTokenView() {
    if (!scamTokenView) return;
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (maliciousContractView) maliciousContractView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    scamTokenView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function setContractScanFeedback(text, kind) {
    if (!contractScanFeedback) return;
    contractScanFeedback.textContent = text || '';
    contractScanFeedback.classList.remove('is-error', 'is-success');
    if (kind === 'error') contractScanFeedback.classList.add('is-error');
    if (kind === 'success') contractScanFeedback.classList.add('is-success');
  }

  function showContractScanView() {
    if (!contractScanView) return;
    walletHealthScoreSource = 'contract';
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (maliciousContractView) maliciousContractView.classList.add('view-hidden');
    if (scamTokenView) scamTokenView.classList.add('view-hidden');
    if (autoBlockView) autoBlockView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    contractScanView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
    if (contractScanStartBtn) {
      contractScanStartBtn.disabled = false;
      contractScanStartBtn.textContent = 'Analyze Contract';
      contractScanStartBtn.style.opacity = '';
    }
    setContractScanFeedback('', '');
    syncChainDropdownVisibility();
  }

  function showAutoBlockView() {
    if (!autoBlockView) return;
    if (walletScanView) walletScanView.classList.add('view-hidden');
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (riskPanelView) riskPanelView.classList.add('view-hidden');
    if (analysisEngineView) analysisEngineView.classList.add('view-hidden');
    if (maliciousContractView) maliciousContractView.classList.add('view-hidden');
    if (scamTokenView) scamTokenView.classList.add('view-hidden');
    if (contractScanView) contractScanView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    autoBlockView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.remove('view-hidden');
    if (walletScanTimerId) {
      clearTimeout(walletScanTimerId);
      walletScanTimerId = null;
    }
    if (contractScanTimerId) {
      clearTimeout(contractScanTimerId);
      contractScanTimerId = null;
    }
  }

  function showWalletScanView() {
    if (!walletScanView) return;
    if (walletScanTimerId) clearTimeout(walletScanTimerId);
    if (walletScanResultView) walletScanResultView.classList.add('view-hidden');
    if (connectedDashboard) connectedDashboard.classList.add('view-hidden');
    walletScanView.classList.remove('view-hidden');
    if (cwStatus) cwStatus.classList.add('view-hidden');
    if (connectFooter) connectFooter.classList.add('view-hidden');
    if (walletScanProgressFill) {
      walletScanProgressFill.style.width = '0%';
      requestAnimationFrame(function () {
        walletScanProgressFill.style.width = '79%';
      });
    }
  }

  function renderWalletScanResult(scanData) {
    const score = clampScore(scanData && scanData.score);
    if (walletScoreBadge) walletScoreBadge.textContent = score + ' / 100';

    if (walletGaugeNeedle) {
      const angle = -160 + (score / 100) * 140;
      walletGaugeNeedle.style.transform = 'rotate(' + angle + 'deg)';
    }

    const observations = Array.isArray(scanData && scanData.observations) ? scanData.observations : [];
    const approvals = observations.filter(function (o) {
      const t = String((o && o.title) || '') + ' ' + String((o && o.description) || '');
      return /approval/i.test(t);
    }).length;
    const airdrops = observations.filter(function (o) {
      const t = String((o && o.title) || '') + ' ' + String((o && o.description) || '');
      return /(airdrop|token)/i.test(t);
    }).length;
    const drainer = observations.some(function (o) {
      const t = String((o && o.title) || '') + ' ' + String((o && o.description) || '');
      return /(drainer|drain)/i.test(t);
    });

    if (walletFindingApprovals) walletFindingApprovals.textContent = String(approvals);
    if (walletFindingAirdrops) walletFindingAirdrops.textContent = String(airdrops);
    if (walletFindingDrainer) walletFindingDrainer.textContent = drainer ? 'Yes' : 'No';
  }

  async function runWalletScan(address) {
    if (!address) return null;
    const path = '/dashboard/' + encodeURIComponent(address) + '/scan';
    try {
      const res = await fetch(getWalletApiBase() + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const json = await res.json().catch(function () {
        return null;
      });
      console.log('[SenseiGuard popup][wallet scan api]', {
        path: path,
        request: { wallet_address: address },
        status: res.status,
        ok: res.ok,
        response: json,
      });
      if (!res.ok || !json || !json.success || !json.data) return null;
      return json.data;
    } catch (err) {
      console.error('[SenseiGuard popup][wallet scan api][error]', {
        path: path,
        request: { wallet_address: address },
        error: err && err.message ? err.message : String(err),
      });
      return null;
    }
  }

  async function startWalletScanFlow() {
    if (!currentWalletAddress) {
      setCwStatus('Connect wallet first to scan.', 'error');
      return;
    }
    walletHealthScoreSource = 'wallet';
    showWalletScanView();
    const startedAt = Date.now();
    const scanData = await runWalletScan(currentWalletAddress);
    const elapsed = Date.now() - startedAt;
    const minDelayMs = 1200;
    if (elapsed < minDelayMs) {
      await new Promise(function (resolve) {
        setTimeout(resolve, minDelayMs - elapsed);
      });
    }
    if (!scanData) {
      setCwStatus('Wallet scan failed. Please try again.', 'error');
      setConnectedDashboardMode(true);
      return;
    }
    renderWalletScanResult(scanData);
    setWalletResultTogglesVisible(walletHealthScoreSource === 'contract');
    showWalletScanResultView();
  }

  function hydrateConnectAssets() {
    if (connectAssetsHydrated) return;
    const fallbackSrc = 'assets/scaled_logo.png';
    const imgs = document.querySelectorAll('img[data-remote-src]');
    imgs.forEach(function (img) {
      const remoteSrc = img.getAttribute('data-remote-src');
      img.onerror = function () {
        if (img.getAttribute('src') !== fallbackSrc) {
          img.setAttribute('src', fallbackSrc);
        }
      };
      if (remoteSrc) {
        img.setAttribute('src', remoteSrc);
      }
    });
    connectAssetsHydrated = true;
  }

  async function getSecurityState() {
    if (!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)) return null;
    try {
      return await chrome.runtime.sendMessage({ type: 'SENSEIGUARD_GET_STATE' });
    } catch (_err) {
      return null;
    }
  }

  async function getDebugStatus() {
    if (!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)) return null;
    try {
      return await chrome.runtime.sendMessage({ type: 'SENSEIGUARD_GET_DEBUG_STATUS' });
    } catch (_err) {
      return null;
    }
  }

  async function getLegacyConnectedSession() {
    if (!(typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)) return null;
    try {
      const stored = await chrome.storage.local.get(['senseiguard_wallet_connect']);
      const legacy = stored && stored.senseiguard_wallet_connect ? stored.senseiguard_wallet_connect : null;
      if (!legacy || !legacy.wallet) return null;
      return {
        connectedWallets: [legacy.wallet],
        dashboardUser: legacy.dashboard_user || null,
      };
    } catch (_err) {
      return null;
    }
  }

  async function setSecuritySettings(settings) {
    if (!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)) return null;
    try {
      return await chrome.runtime.sendMessage({ type: 'SENSEIGUARD_SET_SETTINGS', settings: settings });
    } catch (_err) {
      return null;
    }
  }

  function renderLatestAlert(alerts) {
    if (!Array.isArray(alerts) || alerts.length === 0) return;
    const top = alerts[0];
    if (top && top.type === 'transaction_risk') {
      setCwStatus(
        'Latest tx check: ' +
          String(top.decision || 'allow').toUpperCase() +
          ' (' +
          String(top.riskScore || 0) +
          '/100)',
        top.decision === 'block' ? 'error' : top.decision === 'warn' ? '' : 'success'
      );
      return;
    }
    if (top && top.type === 'domain_risk') {
      setCwStatus('Domain warning: ' + (top.domain || 'unknown domain'), 'error');
    }
  }

  function getConnectedWalletLabel(session) {
    const userLabel = session && session.dashboardUser && session.dashboardUser.user_label;
    if (userLabel) return userLabel;
    const firstWallet =
      session && Array.isArray(session.connectedWallets) && session.connectedWallets.length > 0
        ? session.connectedWallets[0]
        : null;
    if (firstWallet && firstWallet.address) {
      return firstWallet.address.slice(0, 6) + '…' + firstWallet.address.slice(-4);
    }
    return 'Wallet';
  }

  async function runBackendConnect(walletType) {
    const api = window.SenseiGuardWallet;
    if (!api || typeof api.connectAndRegister !== 'function') {
      setCwStatus('Wallet module failed to load. Reload the extension.', 'error');
      return;
    }
    setCwStatus('Connecting… Approve the request in your wallet if prompted.', '');
    setConnectBusy(true);
    try {
      const json = await api.connectAndRegister(walletType);
      const label =
        json && json.dashboard_user && json.dashboard_user.user_label
          ? json.dashboard_user.user_label
          : json && json.data && json.data.address
            ? json.data.address.slice(0, 6) + '…' + json.data.address.slice(-4)
            : 'Wallet';
      currentWalletAddress = json && json.data && json.data.address ? String(json.data.address) : currentWalletAddress;
      setCwStatus('Connected: ' + label, 'success');
      showConnectOnlyView();
      setConnectedDashboardMode(true);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      setCwStatus(msg, 'error');
    } finally {
      setConnectBusy(false);
    }
  }

  document.querySelectorAll('.welcome-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.close();
    });
  });

  if (ctaWelcome && viewWelcome && viewActivate) {
    ctaWelcome.addEventListener('click', function () {
      viewWelcome.classList.add('view-hidden');
      viewActivate.classList.remove('view-hidden');
      if (shell) shell.classList.remove('welcome-scroll-shell--connect');
      scrollShellTop();
    });
  }

  if (ctaActivate && viewActivate && viewConnect) {
    ctaActivate.addEventListener('click', function () {
      hydrateConnectAssets();
      viewActivate.classList.add('view-hidden');
      viewConnect.classList.remove('view-hidden');
      if (shell) shell.classList.add('welcome-scroll-shell--connect');
      scrollShellTop();
    });
  }

  if (ctaConnectMain) {
    ctaConnectMain.addEventListener('click', function () {
      runBackendConnect(lastWalletType);
    });
  }

  if (activateToggle) {
    activateToggle.addEventListener('change', function () {
      const enabled = !!activateToggle.checked;
      setSecuritySettings({ enabled: enabled }).then(function () {
        setCwStatus(
          enabled
            ? 'SenseiGuard protection is enabled.'
            : 'SenseiGuard protection is disabled.',
          enabled ? 'success' : ''
        );
      });
    });
  }

  document.querySelectorAll('[data-action="connect-metamask"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastWalletType = 'metamask';
      runBackendConnect('metamask');
    });
  });

  document.querySelectorAll('[data-action="connect-coinbase"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastWalletType = 'coinbase';
      runBackendConnect('coinbase');
    });
  });

  document.querySelectorAll('[data-action^="card-"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.getAttribute('data-action') || '';
      if (action === 'card-scan-wallet') {
        startWalletScanFlow();
        return;
      }
      if (action === 'card-scan-contract') {
        showContractScanView();
        return;
      }
      if (action === 'card-autoblock') {
        showAutoBlockView();
        return;
      }
      const copy =
        'Analyse Chart coming soon.';
      setCwStatus(copy, '');
    });
  });

  walletScanToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
    });
  });

  analysisToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
      const action = btn.getAttribute('data-action') || '';
      if (action === 'analysis-cancel-toggle') {
        sendScreenAction('cancel');
      } else if (action === 'analysis-proceed-toggle') {
        sendScreenAction('proceed');
      }
    });
  });

  scamToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
      const action = btn.getAttribute('data-action') || '';
      if (action === 'scam-hide-toggle') {
        sendScreenAction('hide_token', {
          token_symbol:
            pickFirstNonEmptyString([
              lastScamPayload && lastScamPayload.token,
              lastScamPayload && lastScamPayload.token_symbol,
            ]) || undefined,
          token_address:
            pickFirstNonEmptyString([
              lastScamPayload && lastScamPayload.token_address,
              lastContractScanPayload && lastContractScanPayload.contract_address,
            ]) || undefined,
        });
      } else if (action === 'scam-analyze-toggle') {
        sendScreenAction('analyze_contract', {
          contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : undefined,
        });
      } else if (action === 'scam-report-toggle') {
        sendScreenAction('report_scam', {
          token_symbol:
            pickFirstNonEmptyString([
              lastScamPayload && lastScamPayload.token,
              lastScamPayload && lastScamPayload.token_symbol,
            ]) || undefined,
          token_address:
            pickFirstNonEmptyString([
              lastScamPayload && lastScamPayload.token_address,
              lastContractScanPayload && lastContractScanPayload.contract_address,
            ]) || undefined,
        });
      }
    });
  });

  autoBlockToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
    });
  });

  if (walletScanDoneBtn) {
    walletScanDoneBtn.addEventListener('click', function () {
      setConnectedDashboardMode(true);
    });
  }

  if (walletScanLearnMoreBtn) {
    walletScanLearnMoreBtn.addEventListener('click', function () {
      setCwStatus('Open the dashboard to view full wallet risk details.', '');
    });
  }

  if (riskPanelDoneBtn) {
    riskPanelDoneBtn.addEventListener('click', async function () {
      await sendScreenAction('done', {
        contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : undefined,
      });
      renderMaliciousContract(lastContractScanPayload || lastAnalysisPayload || lastRiskPanelPayload);
      showMaliciousContractView();
    });
  }

  if (analysisEngineDoneBtn) {
    analysisEngineDoneBtn.addEventListener('click', async function () {
      await sendScreenAction('done', {
        contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : undefined,
      });
      if (analysisEngineSource === 'contract') {
        const riskPayload = {
          wallet_address: currentWalletAddress,
          contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : '',
          domain: lastContractScanPayload && lastContractScanPayload.domain ? lastContractScanPayload.domain : '',
        };
        const riskData = await callExtensionApi('/protection/extension/risk-panel', riskPayload);
        if (riskData) {
          lastRiskPanelPayload = riskData;
          renderRiskPanel(riskData);
        }
        showRiskPanelView();
        return;
      }
      showMaliciousContractView();
    });
  }

  if (analysisEngineLearnBtn) {
    analysisEngineLearnBtn.addEventListener('click', async function () {
      await sendScreenAction('go_back');
      showRiskPanelView();
    });
  }

  if (maliciousBlockBtn) {
    maliciousBlockBtn.addEventListener('click', async function () {
      await sendScreenAction('analyze_contract', {
        contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : undefined,
      });
      const scamTokenSymbolValue = pickFirstNonEmptyString([
        lastContractScanPayload && lastContractScanPayload.token,
        lastContractScanPayload && lastContractScanPayload.token_symbol,
        lastContractScanPayload && lastContractScanPayload.contract_name,
      ]);
      const scamTokenAddressValue = pickFirstNonEmptyString([
        lastContractScanPayload && lastContractScanPayload.token_address,
        lastContractScanPayload && lastContractScanPayload.contract_address,
      ]);
      const scamPayload = {
        wallet_address: currentWalletAddress,
        token_symbol: scamTokenSymbolValue || undefined,
        token_address: scamTokenAddressValue || undefined,
        contract_address:
          (lastContractScanPayload && lastContractScanPayload.contract_address) || scamTokenAddressValue || '',
        chain_id: selectedChainId,
      };
      const scamData = await callExtensionApi('/protection/extension/scam-token-detected', scamPayload);
      if (scamData) {
        lastScamPayload = scamData;
        renderScamToken(scamData);
      }
      showScamTokenView();
    });
  }

  if (maliciousProceedBtn) {
    maliciousProceedBtn.addEventListener('click', async function () {
      await sendScreenAction('proceed', {
        contract_address: lastContractScanPayload && lastContractScanPayload.contract_address ? lastContractScanPayload.contract_address : undefined,
      });
      setCwStatus('You chose to proceed at your own risk.', 'error');
      setConnectedDashboardMode(true);
    });
  }

  if (contractScanBackBtn) {
    contractScanBackBtn.addEventListener('click', async function () {
      await sendScreenAction('go_back');
      setConnectedDashboardMode(true);
    });
  }

  if (contractLinkInput) {
    contractLinkInput.addEventListener('input', function () {
      syncChainDropdownVisibility();
    });
  }

  if (chainSelectToggle) {
    chainSelectToggle.addEventListener('click', function () {
      if (!chainSelectMenu || !chainSelectWrap || chainSelectWrap.classList.contains('view-hidden')) return;
      const isOpen = !chainSelectMenu.classList.contains('view-hidden');
      chainSelectMenu.classList.toggle('view-hidden', isOpen);
      chainSelectToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  chainOptionButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const chainId = Number(btn.getAttribute('data-chain-id'));
      const chainName = btn.getAttribute('data-chain-name') || '';
      const logo = btn.querySelector('img');
      if (Number.isFinite(chainId)) selectedChainId = chainId;
      chainOptionButtons.forEach(function (b) {
        b.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');
      if (chainSelectCurrentName) chainSelectCurrentName.textContent = chainName || 'Select network';
      if (chainSelectCurrentLogo && logo) {
        const src = logo.getAttribute('src');
        if (src) chainSelectCurrentLogo.setAttribute('src', src);
      }
      if (chainSelectMenu) chainSelectMenu.classList.add('view-hidden');
      if (chainSelectToggle) chainSelectToggle.setAttribute('aria-expanded', 'false');
    });
  });

  if (contractScanStartBtn) {
    contractScanStartBtn.addEventListener('click', async function () {
      const raw = contractLinkInput ? contractLinkInput.value.trim() : '';
      if (!raw) {
        setContractScanFeedback('Please enter a smart contract link.', 'error');
        return;
      }

      const isAddressInput = isContractAddress(raw);
      let parsed = null;
      if (!isAddressInput) {
        try {
          parsed = new URL(raw);
        } catch (_err) {
          parsed = null;
        }
      }
      if (!isAddressInput && (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:'))) {
        setContractScanFeedback('Enter a valid smart contract URL or contract address.', 'error');
        return;
      }

      setContractScanFeedback(
        isAddressInput
          ? 'Analysis started for contract address'
          : 'Analysis started for ' + parsed.hostname,
        'success'
      );
      contractScanStartBtn.disabled = true;
      contractScanStartBtn.textContent = 'Analyzing...';
      contractScanStartBtn.style.opacity = '0.78';
      const contractAddress = isAddressInput ? raw : extractContractAddressFromLink(raw);
      const scanContractPayload = {
        wallet_address: currentWalletAddress,
        contract_link: raw,
        chain_id: selectedChainId,
      };
      const scanResult = await callExtensionApi('/protection/extension/scan-smart-contract', scanContractPayload);
      if (!scanResult) {
        setContractScanFeedback('Contract scan failed. Please try again.', 'error');
        contractScanStartBtn.disabled = false;
        contractScanStartBtn.textContent = 'Analyze Contract';
        contractScanStartBtn.style.opacity = '';
        return;
      }
      lastContractScanPayload = {
        ...scanResult,
        contract_address: scanResult.contract_address || contractAddress,
        domain: parsed ? parsed.hostname : '',
        contract_link: raw,
      };
      await sendScreenAction('analyze_contract', {
        contract_address: lastContractScanPayload.contract_address || undefined,
      });
      const analyzePayload = {
        wallet_address: currentWalletAddress,
        method: 'eth_sendTransaction',
        to: lastContractScanPayload.contract_address || contractAddress,
        value: '0x0',
        data: '0x',
        chain_id: selectedChainId,
      };
      const analyzeResult = await callExtensionApi(
        '/protection/extension/analyze-transaction-screen',
        analyzePayload
      );
      if (analyzeResult) {
        lastAnalysisPayload = analyzeResult;
        renderAnalysisEngine(analyzeResult);
      } else {
        renderAnalysisEngine(lastContractScanPayload);
      }
      showAnalysisEngineView('contract');
      contractScanStartBtn.disabled = false;
      contractScanStartBtn.textContent = 'Analyze Contract';
      contractScanStartBtn.style.opacity = '';
    });
  }

  if (autoBlockSaveBtn) {
    autoBlockSaveBtn.addEventListener('click', function () {
      setCwStatus('AutoBlock settings saved.', 'success');
      setConnectedDashboardMode(true);
    });
  }

  if (autoBlockBackBtn) {
    autoBlockBackBtn.addEventListener('click', function () {
      setConnectedDashboardMode(true);
    });
  }

  if (scamDoneBtn) {
    scamDoneBtn.addEventListener('click', async function () {
      await sendScreenAction('done', {
        token_symbol:
          pickFirstNonEmptyString([
            lastScamPayload && lastScamPayload.token,
            lastScamPayload && lastScamPayload.token_symbol,
          ]) || undefined,
        token_address:
          pickFirstNonEmptyString([
            lastScamPayload && lastScamPayload.token_address,
            lastContractScanPayload && lastContractScanPayload.contract_address,
          ]) || undefined,
      });
      setCwStatus('Scam token actions saved.', 'success');
      setConnectedDashboardMode(true);
    });
  }

  if (scamProceedBtn) {
    scamProceedBtn.addEventListener('click', async function () {
      await sendScreenAction('proceed', {
        token_symbol:
          pickFirstNonEmptyString([
            lastScamPayload && lastScamPayload.token,
            lastScamPayload && lastScamPayload.token_symbol,
          ]) || undefined,
        token_address:
          pickFirstNonEmptyString([
            lastScamPayload && lastScamPayload.token_address,
            lastContractScanPayload && lastContractScanPayload.contract_address,
          ]) || undefined,
      });
      setCwStatus('You chose to proceed at your own risk.', 'error');
      setConnectedDashboardMode(true);
    });
  }

  getSecurityState().then(function (state) {
    if (state && state.ok) {
      if (activateToggle && state.settings) {
        activateToggle.checked = !!state.settings.enabled;
      }
      const isConnected =
        state.session &&
        Array.isArray(state.session.connectedWallets) &&
        state.session.connectedWallets.length > 0;
      if (isConnected) {
        const firstWallet = state.session.connectedWallets[0];
        currentWalletAddress = firstWallet && firstWallet.address ? String(firstWallet.address) : '';
        hydrateConnectAssets();
        showConnectOnlyView();
        setConnectedDashboardMode(true);
        setCwStatus('Connected: ' + getConnectedWalletLabel(state.session), 'success');
      } else {
        setConnectedDashboardMode(false);
      }
      if (state.alerts) {
        renderLatestAlert(state.alerts);
      }
      return;
    }

    getLegacyConnectedSession().then(function (legacySession) {
      if (!legacySession) return;
      const firstWallet = legacySession.connectedWallets && legacySession.connectedWallets[0];
      currentWalletAddress = firstWallet && firstWallet.address ? String(firstWallet.address) : '';
      hydrateConnectAssets();
      showConnectOnlyView();
      setConnectedDashboardMode(true);
      setCwStatus('Connected: ' + getConnectedWalletLabel(legacySession), 'success');
    });
  });

  setTimeout(function () {
    getDebugStatus().then(function (debugState) {
      if (!debugState || !debugState.ok || !debugState.diagnostics) return;
      window.__senseiguardDebugStatus = debugState.diagnostics;
      if (document && document.body) {
        document.body.dataset.sgIntercepted = String(debugState.diagnostics.txIntercepted || 0);
        document.body.dataset.sgHookInjected = String(debugState.diagnostics.hookInjected || 0);
        document.body.dataset.sgLastMethod = String(debugState.diagnostics.lastMethod || '');
        document.body.dataset.sgLastFailure = String(debugState.diagnostics.lastFailureReason || '');
      }
    });
  }, 1200);
});
