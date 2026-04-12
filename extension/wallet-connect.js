/**
 * SenseiGuard extension wallet flow:
 * 1) Request accounts via injected provider on the active https tab (MAIN world).
 * 2) POST /wallets/connect — same contract as frontend services/walletService.ts
 */

(function () {
  'use strict';

  function getApiBase() {
    var g = window.SENSEIGUARD || {};
    return (g.WALLET_API_BASE_URL || 'https://senseifi-backend.onrender.com/api').replace(/\/$/, '');
  }

  /**
   * @param {'metamask'|'coinbase'} walletType
   * @returns {Promise<{ address: string, chainId: number }>}
   */
  async function connectViaActiveTab(walletType) {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      throw new Error('Extension APIs unavailable. Reload the extension.');
    }
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    var tab = tabs[0];
    if (!tab || !tab.id) {
      throw new Error('No active tab.');
    }
    var u = tab.url || '';
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      throw new Error(
        'Open a normal website tab (https://…). Wallets inject there, not on chrome:// or the new-tab page.'
      );
    }

    var results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      func: async function (preferred) {
        function pickProvider(type) {
          var eth = window.ethereum;
          if (!eth) return null;
          var providers = eth.providers;
          if (providers && providers.length > 0) {
            if (type === 'coinbase') {
              var cb = providers.find(function (x) {
                return x.isCoinbaseWallet;
              });
              if (cb) return cb;
            }
            if (type === 'metamask') {
              var mm = providers.find(function (x) {
                return x.isMetaMask;
              });
              if (mm) return mm;
            }
            return providers[0];
          }
          if (type === 'coinbase' && eth.isCoinbaseWallet) return eth;
          if (type === 'metamask' && eth.isMetaMask) return eth;
          return eth;
        }
        var provider = pickProvider(preferred);
        if (!provider) {
          return {
            ok: false,
            error: 'No wallet found on this page. Install MetaMask or Coinbase Wallet.',
          };
        }
        try {
          var accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (!accounts || !accounts[0]) {
            return { ok: false, error: 'No account returned.' };
          }
          var chainIdHex = await provider.request({ method: 'eth_chainId' });
          var chainId = parseInt(chainIdHex, 16);
          return {
            ok: true,
            address: accounts[0],
            chainId: chainId || 1,
          };
        } catch (err) {
          var msg = (err && (err.message || err.reason)) || String(err);
          return { ok: false, error: msg };
        }
      },
      args: [walletType],
    });

    var first = results && results[0];
    var result = first && first.result;
    if (!result || !result.ok) {
      throw new Error((result && result.error) || 'Could not connect wallet.');
    }
    return { address: result.address, chainId: result.chainId };
  }

  /**
   * @param {string} address
   * @param {number} chainId
   * @param {'metamask'|'coinbase'} walletType
   */
  async function registerWalletWithBackend(address, chainId, walletType) {
    var url = getApiBase() + '/wallets/connect';
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: address,
        chain_id: chainId,
        wallet_type: walletType,
      }),
    });

    var text = await res.text();
    var json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error('Invalid response from server (' + res.status + ').');
    }

    if (!res.ok) {
      throw new Error(
        'Server error ' + res.status + (json && json.message ? ': ' + json.message : text ? ': ' + text.slice(0, 160) : '')
      );
    }

    if (!json || !json.success) {
      throw new Error((json && json.message) || 'Failed to connect wallet');
    }

    return json;
  }

  async function persistSession(payload) {
    var walletAddress = payload && payload.data && typeof payload.data.address === 'string'
      ? payload.data.address
      : null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        senseiguard_wallet_connect: {
          wallet: payload.data,
          dashboard_user: payload.dashboard_user,
          savedAt: Date.now(),
        },
        senseiguard_wallet_address: walletAddress,
      });
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        await chrome.runtime.sendMessage({
          type: 'SENSEIGUARD_REGISTER_WALLET',
          wallet: payload && payload.data ? payload.data : null,
          dashboardUser: payload && payload.dashboard_user ? payload.dashboard_user : null,
        });
      } catch (_err) {
        // Keep connect flow resilient even if background message fails.
      }
    }
  }

  async function clearStoredWalletSession() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove([
        'senseiguard_wallet_connect',
        'senseiguard_wallet_address',
        'senseiguard_session',
      ]);
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        await chrome.runtime.sendMessage({
          type: 'SENSEIGUARD_CLEAR_WALLET_SESSION',
        });
      } catch (_err) {
        // Keep disconnect flow resilient even if background message fails.
      }
    }
  }

  /**
   * @param {'metamask'|'coinbase'} walletType
   */
  async function connectAndRegister(walletType) {
    var session = await connectViaActiveTab(walletType);
    var json = await registerWalletWithBackend(session.address, session.chainId, walletType);
    await persistSession(json);
    return json;
  }

  window.SenseiGuardWallet = {
    connectViaActiveTab: connectViaActiveTab,
    registerWalletWithBackend: registerWalletWithBackend,
    connectAndRegister: connectAndRegister,
    clearStoredWalletSession: clearStoredWalletSession,
  };
})();
