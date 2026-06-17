/* SenseiGuard in-page hook
 * Wraps EIP-1193 request calls and asks extension for allow/warn/block decisions.
 */

(function () {
  'use strict';

  if (window.__senseiguardInpageHookLoaded) {
    if (typeof window.__senseiguardInstallHook === 'function') {
      window.__senseiguardInstallHook('reload');
    }
    return;
  }
  window.__senseiguardInpageHookLoaded = true;

  const WATCHED_METHODS = new Set([
    'eth_requestAccounts',
    'eth_sendTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'wallet_requestPermissions',
    'wallet_sendCalls',
  ]);
  const PAGE_TO_EXTENSION = 'SENSEIGUARD_TX_REQUEST';
  const EXTENSION_TO_PAGE = 'SENSEIGUARD_TX_DECISION';
  const DEBUG_TO_EXTENSION = 'SENSEIGUARD_DEBUG_EVENT';
  const DEFAULT_DECISION_TIMEOUT_MS = 45000;
  const CONNECT_DECISION_TIMEOUT_MS = 90000;
  const STATE_KEY = '__senseiguardInpageState';
  /** Set by SenseiGuard popup wallet-connect on the injection tab — must not trigger dApp defense. */
  const EXTENSION_CONNECT_BYPASS_KEY = '__senseiguardExtensionWalletConnect';

  function isSenseifiExtensionConnectPage() {
    try {
      var host = String(window.location.hostname || '').toLowerCase();
      var isSenseifiHost =
        host === 'senseifi.io' ||
        host === 'www.senseifi.io' ||
        host === 'localhost' ||
        host === '127.0.0.1';
      if (!isSenseifiHost) return false;
      var path = window.location.pathname || '';
      var params = new URLSearchParams(window.location.search || '');
      return path.indexOf('/connect-wallet') !== -1 && params.get('extension') === '1';
    } catch (_error) {
      return false;
    }
  }
  const state =
    window[STATE_KEY] ||
    (window[STATE_KEY] = {
      decisionWaiters: new Map(),
      listenersAttached: false,
      retryTimer: null,
      retryAttempts: 0,
      retryMaxAttempts: 40,
      retryIntervalMs: 250,
      observerAttached: false,
      wrappedProvidersCount: 0,
      eip6963Attached: false,
    });

  function randomId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function emitDebug(eventName, extra) {
    window.postMessage(
      {
        source: DEBUG_TO_EXTENSION,
        event: eventName,
        details: extra || null,
      },
      '*'
    );
  }

  function awaitDecision(requestId, timeoutMs) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        state.decisionWaiters.delete(requestId);
        emitDebug('tx_decision_timeout', { requestId });
        resolve({
          action: 'block',
          riskScore: 95,
          reason: 'SenseiGuard decision timeout - blocked for safety',
          findings: ['No risk decision received in time'],
        });
      }, timeoutMs);
      state.decisionWaiters.set(requestId, {
        resolve(decision) {
          clearTimeout(timer);
          resolve(decision);
        },
      });
    });
  }

  function getDecisionTimeoutMs(method) {
    if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
      return CONNECT_DECISION_TIMEOUT_MS;
    }
    return DEFAULT_DECISION_TIMEOUT_MS;
  }

  function attachListenersOnce() {
    if (state.listenersAttached) return;
    state.listenersAttached = true;
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== EXTENSION_TO_PAGE || !data.requestId) return;
      const waiter = state.decisionWaiters.get(data.requestId);
      if (!waiter) return;
      state.decisionWaiters.delete(data.requestId);
      waiter.resolve(data.decision || { action: 'allow', riskScore: 0, reason: 'Default allow' });
    });
  }

  async function interceptWalletCall(method, params, invokeOriginal) {
    if (window[EXTENSION_CONNECT_BYPASS_KEY] || isSenseifiExtensionConnectPage()) {
      return invokeOriginal();
    }

    const requestId = randomId();
    window.postMessage(
      {
        source: PAGE_TO_EXTENSION,
        chainFamily: 'evm',
        requestId,
        method,
        params: Array.isArray(params) ? params : [],
      },
      '*'
    );
    emitDebug('tx_intercepted_inpage', { method });

    const decision = await awaitDecision(requestId, getDecisionTimeoutMs(method));
    if (decision.action === 'block') {
      const err = new Error(
        `Blocked by SenseiGuard (${decision.riskScore || 0}/100): ${decision.reason || 'High risk detected'}`
      );
      err.code = 4001;
      throw err;
    }

    if (decision.action === 'warn' && Array.isArray(decision.findings) && decision.findings.length) {
      console.warn('[SenseiGuard warning]', decision.riskScore, decision.findings.join('; '));
    }

    return invokeOriginal();
  }

  function wrapProvider(provider) {
    if (!provider || typeof provider !== 'object' || provider.__senseiguardWrapped) return;
    var didWrap = false;

    if (typeof provider.request === 'function') {
      const originalRequest = provider.request.bind(provider);

      provider.request = async function wrappedRequest(args) {
        const method = args && args.method;
        if (!WATCHED_METHODS.has(method)) {
          return originalRequest(args);
        }

        const params = args && Array.isArray(args.params) ? args.params : [];
        return interceptWalletCall(method, params, function () {
          return originalRequest(args);
        });
      };
      didWrap = true;
    }

    if (typeof provider.enable === 'function' && !provider.__senseiguardEnableWrapped) {
      const originalEnable = provider.enable.bind(provider);
      provider.__senseiguardEnableWrapped = true;
      provider.enable = async function wrappedEnable() {
        return interceptWalletCall('eth_requestAccounts', [], function () {
          return originalEnable();
        });
      };
      didWrap = true;
    }

    if (wrapLegacySendMethods(provider)) {
      didWrap = true;
    }

    if (!didWrap) return;

    provider.__senseiguardWrapped = true;
    state.wrappedProvidersCount += 1;
    emitDebug('provider_wrapped', {
      wrappedProvidersCount: state.wrappedProvidersCount,
      isTrust: !!(provider.isTrust || provider.isTrustWallet),
      isMetaMask: !!provider.isMetaMask,
    });
  }

  function normalizeLegacyPayload(payload) {
    if (Array.isArray(payload)) return payload[0] || {};
    return payload || {};
  }

  function wrapLegacySendMethods(provider) {
    if (!provider || provider.__senseiguardLegacySendWrapped) return false;
    var wrappedAny = false;

    if (typeof provider.sendAsync === 'function') {
      const originalSendAsync = provider.sendAsync.bind(provider);
      provider.sendAsync = function wrappedSendAsync(payload, callback) {
        const item = normalizeLegacyPayload(payload);
        const method = item && item.method;
        if (!WATCHED_METHODS.has(method)) {
          return originalSendAsync(payload, callback);
        }
        const params = item && Array.isArray(item.params) ? item.params : [];
        interceptWalletCall(method, params, function () {
          return new Promise(function (resolve, reject) {
            originalSendAsync(payload, function (error, result) {
              if (error) reject(error);
              else resolve(result);
            });
          });
        })
          .then(function (result) {
            if (typeof callback === 'function') callback(null, result);
            return result;
          })
          .catch(function (error) {
            if (typeof callback === 'function') callback(error, null);
            throw error;
          });
      };
      wrappedAny = true;
    }

    if (typeof provider.send === 'function') {
      const originalSend = provider.send.bind(provider);
      provider.send = function wrappedSend(payload, callback) {
        const item = normalizeLegacyPayload(payload);
        const method = item && item.method;
        if (!WATCHED_METHODS.has(method)) {
          return originalSend(payload, callback);
        }
        const params = item && Array.isArray(item.params) ? item.params : [];
        if (typeof callback === 'function') {
          interceptWalletCall(method, params, function () {
            return new Promise(function (resolve, reject) {
              originalSend(payload, function (error, result) {
                if (error) reject(error);
                else resolve(result);
              });
            });
          })
            .then(function (result) {
              callback(null, result);
            })
            .catch(function (error) {
              callback(error, null);
            });
          return;
        }
        throw new Error('SenseiGuard blocked synchronous legacy send for watched methods');
      };
      wrappedAny = true;
    }

    if (wrappedAny) {
      provider.__senseiguardLegacySendWrapped = true;
    }
    return wrappedAny;
  }

  function collectInjectedProviders() {
    const providers = [];
    const seen = new Set();

    function pushProvider(provider) {
      if (!provider || typeof provider !== 'object' || seen.has(provider)) return;
      seen.add(provider);
      providers.push(provider);
    }

    function readGlobal(name) {
      try {
        return window[name];
      } catch (_error) {
        return null;
      }
    }

    const ethereum = readGlobal('ethereum');
    if (ethereum) {
      pushProvider(ethereum);
      if (Array.isArray(ethereum.providers)) {
        ethereum.providers.forEach(pushProvider);
      }
      if (ethereum.provider) pushProvider(ethereum.provider);
    }

    [
      'trustwallet',
      'trustWallet',
      'coinbaseWalletExtension',
      'rabby',
      'okxwallet',
      'bitkeep',
    ].forEach(function (name) {
      const candidate = readGlobal(name);
      if (!candidate) return;
      if (typeof candidate.request === 'function' || typeof candidate.sendAsync === 'function') {
        pushProvider(candidate);
      }
      if (candidate.ethereum) pushProvider(candidate.ethereum);
      if (candidate.provider) pushProvider(candidate.provider);
    });

    return providers;
  }

  function drainPendingProviders() {
    const pending = window.__senseiguardPendingProviders;
    if (!Array.isArray(pending) || !pending.length) return;
    pending.forEach(function (entry) {
      if (entry && entry.provider) wrapProvider(entry.provider);
    });
    window.__senseiguardPendingProviders = [];
  }

  function installHook(reason) {
    let wrapped = false;
    collectInjectedProviders().forEach(function (provider) {
      const before = !!provider.__senseiguardWrapped;
      wrapProvider(provider);
      if (!before && provider.__senseiguardWrapped) wrapped = true;
    });
    if (!wrapped) {
      emitDebug('provider_not_ready', { reason: reason || 'unknown' });
    } else {
      emitDebug('provider_wrap_success', { reason: reason || 'unknown' });
    }
    return wrapped;
  }

  function startRetryLoop() {
    if (state.retryTimer) clearInterval(state.retryTimer);
    state.retryAttempts = 0;
    state.retryTimer = setInterval(() => {
      state.retryAttempts += 1;
      const wrapped = installHook('retry_loop');
      if (wrapped || state.retryAttempts >= state.retryMaxAttempts) {
        clearInterval(state.retryTimer);
        state.retryTimer = null;
        emitDebug('retry_loop_stopped', {
          attempts: state.retryAttempts,
          wrapped,
        });
      }
    }, state.retryIntervalMs);
  }

  function attachEip6963ListenersOnce() {
    if (state.eip6963Attached) return;
    state.eip6963Attached = true;
    window.addEventListener(
      'eip6963:announceProvider',
      (event) => {
        const provider = event && event.detail ? event.detail.provider : null;
        if (!provider) return;
        wrapProvider(provider);
        emitDebug('eip6963_provider_announced', {
          name:
            event && event.detail && event.detail.info && event.detail.info.name
              ? event.detail.info.name
              : 'unknown',
          rdns:
            event && event.detail && event.detail.info && event.detail.info.rdns
              ? event.detail.info.rdns
              : 'unknown',
        });
      },
      true
    );
    try {
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    } catch (_error) {
      // Ignore environments where this event cannot be dispatched.
    }
  }

  function attachMutationObserverOnce() {
    if (state.observerAttached) return;
    state.observerAttached = true;
    const observer = new MutationObserver(() => installHook('dom_mutation'));
    observer.observe(document.documentElement || document, { childList: true, subtree: true });
  }

  window.__senseiguardInstallHook = installHook;
  window.__senseiguardWrapEvmProvider = wrapProvider;

  attachListenersOnce();
  attachEip6963ListenersOnce();
  installHook('initial');
  drainPendingProviders();
  attachMutationObserverOnce();
  startRetryLoop();
})();
