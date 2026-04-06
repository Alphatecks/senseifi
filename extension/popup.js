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

  function showAnalysisEngineView() {
    if (!analysisEngineView) return;
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
    try {
      const res = await fetch(getWalletApiBase() + '/dashboard/' + encodeURIComponent(address) + '/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const json = await res.json().catch(function () {
        return null;
      });
      if (!res.ok || !json || !json.success || !json.data) return null;
      return json.data;
    } catch (_err) {
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
    const imgs = document.querySelectorAll('#view-connect-wallet img[data-remote-src]');
    imgs.forEach(function (img) {
      const remoteSrc = img.getAttribute('data-remote-src');
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
    });
  });

  scamToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
    });
  });

  autoBlockToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
    });
  });

  if (walletScanDoneBtn) {
    walletScanDoneBtn.addEventListener('click', function () {
      showRiskPanelView();
    });
  }

  if (walletScanLearnMoreBtn) {
    walletScanLearnMoreBtn.addEventListener('click', function () {
      setCwStatus('Detailed wallet risk report coming soon.', '');
    });
  }

  if (riskPanelDoneBtn) {
    riskPanelDoneBtn.addEventListener('click', function () {
      showAnalysisEngineView();
    });
  }

  if (analysisEngineDoneBtn) {
    analysisEngineDoneBtn.addEventListener('click', function () {
      showMaliciousContractView();
    });
  }

  if (analysisEngineLearnBtn) {
    analysisEngineLearnBtn.addEventListener('click', function () {
      showRiskPanelView();
    });
  }

  if (maliciousBlockBtn) {
    maliciousBlockBtn.addEventListener('click', function () {
      showScamTokenView();
    });
  }

  if (maliciousProceedBtn) {
    maliciousProceedBtn.addEventListener('click', function () {
      setCwStatus('You chose to proceed at your own risk.', 'error');
      setConnectedDashboardMode(true);
    });
  }

  if (contractScanBackBtn) {
    contractScanBackBtn.addEventListener('click', function () {
      setConnectedDashboardMode(true);
    });
  }

  if (contractScanStartBtn) {
    contractScanStartBtn.addEventListener('click', function () {
      const raw = contractLinkInput ? contractLinkInput.value.trim() : '';
      if (!raw) {
        setContractScanFeedback('Please enter a smart contract link.', 'error');
        return;
      }

      let parsed = null;
      try {
        parsed = new URL(raw);
      } catch (_err) {
        parsed = null;
      }
      if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
        setContractScanFeedback('Enter a valid http(s) smart contract URL.', 'error');
        return;
      }

      setContractScanFeedback('Analysis started for ' + parsed.hostname, 'success');
      contractScanStartBtn.disabled = true;
      contractScanStartBtn.textContent = 'Analyzing...';
      contractScanStartBtn.style.opacity = '0.78';
      if (contractScanTimerId) clearTimeout(contractScanTimerId);
      contractScanTimerId = setTimeout(function () {
        showAnalysisEngineView();
      }, 900);
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
    scamDoneBtn.addEventListener('click', function () {
      setCwStatus('Scam token actions saved.', 'success');
      setConnectedDashboardMode(true);
    });
  }

  if (scamProceedBtn) {
    scamProceedBtn.addEventListener('click', function () {
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
