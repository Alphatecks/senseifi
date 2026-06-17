/**
 * SenseiGuard extension wallet flow:
 * 1) Request accounts via injected provider on a SenseiFi https tab (MAIN world).
 *    Extension popup connect always uses senseifi.io so MetaMask shows the correct origin.
 * 2) POST /wallets/connect — same contract as frontend services/walletService.ts
 */

(function () {
  'use strict';

  function getApiBase() {
    var g = window.SENSEIGUARD || {};
    return (g.WALLET_API_BASE_URL || 'https://senseifi-backend.onrender.com/api').replace(/\/$/, '');
  }

  /**
   * Optional broad site access — required for executeScript on arbitrary https tabs.
   * @returns {Promise<boolean>}
   */
  function ensureBroadSiteAccess() {
    if (typeof chrome === 'undefined' || !chrome.permissions) {
      return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
      chrome.permissions.contains({ origins: ['http://*/*', 'https://*/*'] }, function (has) {
        if (has) return resolve(true);
        chrome.permissions.request({ origins: ['http://*/*', 'https://*/*'] }, resolve);
      });
    });
  }

  function isInjectableTabUrl(url) {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  }

  function getInjectedWalletBridgeUrl() {
    var g = window.SENSEIGUARD || {};
    var bridge =
      g.INJECTED_WALLET_BRIDGE_URL || g.WALLET_CONNECT_BRIDGE_URL || g.DASHBOARD_URL || 'https://senseifi.io/guard';
    return String(bridge).replace(/\/$/, '') || 'https://senseifi.io/guard';
  }

  function getWalletConnectBridgeUrl() {
    var g = window.SENSEIGUARD || {};
    var bridge = g.WALLET_CONNECT_BRIDGE_URL || 'https://senseifi.io/connect-wallet';
    var url = String(bridge).replace(/\/$/, '') || 'https://senseifi.io/connect-wallet';
    if (url.indexOf('connect-wallet') === -1) {
      url = url.replace(/\/guard\/?$/, '') + '/connect-wallet';
    }
    return url.indexOf('extension=1') >= 0 ? url : url + (url.indexOf('?') >= 0 ? '&' : '?') + 'extension=1';
  }

  function getWalletBridgeUrl() {
    return getInjectedWalletBridgeUrl();
  }

  function isSenseifiTabUrl(url) {
    try {
      var host = new URL(url).hostname.toLowerCase();
      return host === 'senseifi.io' || host === 'www.senseifi.io';
    } catch (_err) {
      return false;
    }
  }

  function waitForTabComplete(tabId, timeoutMs) {
    var timeout = timeoutMs || 15000;
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        reject(new Error('Wallet bridge page took too long to load. Try again.'));
      }, timeout);

      function onUpdated(id, info) {
        if (id !== tabId || info.status !== 'complete') return;
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }

      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.get(tabId, function (tab) {
        if (chrome.runtime.lastError) {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          reject(new Error(chrome.runtime.lastError.message || 'Could not open wallet bridge tab.'));
          return;
        }
        if (tab && tab.status === 'complete') {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve();
        }
      });
    });
  }

  /**
   * Extension popup connect must run on senseifi.io only.
   * MetaMask displays the origin of the page where eth_requestAccounts runs — never use another site.
   * @returns {Promise<{ tabId: number, created: boolean }>}
   */
  async function resolveExtensionWalletBridgeTab() {
    var tabs = await chrome.tabs.query({});
    for (var i = 0; i < tabs.length; i += 1) {
      var existing = tabs[i];
      if (existing && existing.id && isSenseifiTabUrl(existing.url || '')) {
        return { tabId: existing.id, created: false };
      }
    }

    var bridgeUrl = getWalletBridgeUrl();
    if (!isInjectableTabUrl(bridgeUrl)) {
      throw new Error('Invalid SenseiFi wallet bridge URL.');
    }
    // Background tab keeps the extension popup open; MetaMask still shows senseifi.io as origin.
    var createdTab = await chrome.tabs.create({ url: bridgeUrl, active: false });
    if (!createdTab || !createdTab.id) {
      throw new Error('Could not open SenseiFi to connect your wallet.');
    }
    await waitForTabComplete(createdTab.id);
    return { tabId: createdTab.id, created: true };
  }

  function closeBridgeTabIfNeeded(tabId, created) {
    if (!created || !tabId || typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.remove) {
      return;
    }
    chrome.tabs.remove(tabId).catch(function () {
      // Ignore if the user already closed the bridge tab.
    });
  }

  /**
   * Opens the web app connect page (Reown AppKit) and waits for WalletConnect completion.
   * @returns {Promise<{ address: string, chainId: number, json: object|null }>}
   */
  async function connectViaWalletConnectBridge() {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.storage) {
      throw new Error('Extension APIs unavailable. Reload the extension.');
    }

    await chrome.storage.local.remove(['senseiguard_wc_bridge_result']);
    await chrome.storage.local.set({ senseiguard_wc_bridge_pending: true });

    var bridgeUrl = getWalletConnectBridgeUrl();
    if (!isInjectableTabUrl(bridgeUrl)) {
      throw new Error('Invalid SenseiFi WalletConnect bridge URL.');
    }

    await chrome.tabs.create({ url: bridgeUrl, active: true });

    return new Promise(function (resolve, reject) {
      var timeoutMs = 5 * 60 * 1000;
      var timer = setTimeout(function () {
        chrome.storage.onChanged.removeListener(onChanged);
        chrome.storage.local.remove(['senseiguard_wc_bridge_pending']);
        reject(
          new Error(
            'WalletConnect timed out. Finish connecting on the SenseiFi tab, then reopen the extension.'
          )
        );
      }, timeoutMs);

      function onChanged(changes, area) {
        if (area !== 'local') return;
        var bridgeChange = changes.senseiguard_wc_bridge_result;
        if (!bridgeChange || !bridgeChange.newValue) return;

        var result = bridgeChange.newValue;
        if (result.ok) {
          clearTimeout(timer);
          chrome.storage.onChanged.removeListener(onChanged);
          chrome.storage.local.remove(['senseiguard_wc_bridge_pending']);
          resolve({
            address: result.address,
            chainId: result.chainId,
            json: result.response || null,
          });
          return;
        }
        if (result.error) {
          clearTimeout(timer);
          chrome.storage.onChanged.removeListener(onChanged);
          chrome.storage.local.remove(['senseiguard_wc_bridge_pending']);
          reject(new Error(result.error));
        }
      }

      chrome.storage.onChanged.addListener(onChanged);

      chrome.storage.local.get(['senseiguard_wc_bridge_result'], function (stored) {
        var existing = stored && stored.senseiguard_wc_bridge_result;
        if (existing && existing.ok) {
          onChanged({ senseiguard_wc_bridge_result: { newValue: existing } }, 'local');
        }
      });
    });
  }

  /**
   * @param {'metamask'|'coinbase'} walletType
   * @returns {Promise<{ address: string, chainId: number }>}
   */
  async function connectViaActiveTab(walletType) {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      throw new Error('Extension APIs unavailable. Reload the extension.');
    }
    var allowed = await ensureBroadSiteAccess();
    if (!allowed) {
      throw new Error(
        'Allow SenseiGuard site access so we can reach your wallet provider.'
      );
    }

    var injection = await resolveExtensionWalletBridgeTab();
    var tabId = injection.tabId;
    var createdBridgeTab = injection.created;

    var results;
    try {
      results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN',
      func: async function (preferred) {
        window.__senseiguardExtensionWalletConnect = true;
        try {
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
        } finally {
          window.__senseiguardExtensionWalletConnect = false;
        }
      },
      args: [walletType],
      });
    } finally {
      closeBridgeTabIfNeeded(tabId, createdBridgeTab);
    }

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
   * @param {'metamask'|'coinbase'|'walletconnect'} walletType
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
   * @param {'walletconnect'} walletType
   */
  async function connectAndRegister(walletType) {
    if (walletType !== 'walletconnect') {
      throw new Error('Only WalletConnect is supported in the extension.');
    }

    var bridgeResult = await connectViaWalletConnectBridge();
    if (bridgeResult.json) {
      await persistSession(bridgeResult.json);
      return bridgeResult.json;
    }
    var fallbackJson = await registerWalletWithBackend(
      bridgeResult.address,
      bridgeResult.chainId,
      'walletconnect'
    );
    await persistSession(fallbackJson);
    return fallbackJson;
  }

  window.SenseiGuardWallet = {
    connectViaActiveTab: connectViaActiveTab,
    connectViaWalletConnectBridge: connectViaWalletConnectBridge,
    registerWalletWithBackend: registerWalletWithBackend,
    connectAndRegister: connectAndRegister,
    clearStoredWalletSession: clearStoredWalletSession,
  };
})();
