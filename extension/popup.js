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

  function showConnectOnlyView() {
    if (viewWelcome) viewWelcome.classList.add('view-hidden');
    if (viewActivate) viewActivate.classList.add('view-hidden');
    if (viewConnect) viewConnect.classList.remove('view-hidden');
    if (shell) shell.classList.add('welcome-scroll-shell--connect');
    scrollShellTop();
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
      setCwStatus('Connected: ' + label, 'success');
      window.setTimeout(function () {
        window.close();
      }, 900);
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
        showConnectOnlyView();
        setCwStatus('Connected: ' + getConnectedWalletLabel(state.session), 'success');
      }
      if (state.alerts) {
        renderLatestAlert(state.alerts);
      }
      return;
    }

    getLegacyConnectedSession().then(function (legacySession) {
      if (!legacySession) return;
      showConnectOnlyView();
      setCwStatus('Connected: ' + getConnectedWalletLabel(legacySession), 'success');
    });
  });

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
});
