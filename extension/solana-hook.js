/* SenseiGuard Solana in-page hook
 * Wraps Solana wallet providers (Phantom-style globals + Wallet Standard) for any Solana dApp.
 */

(function () {
  'use strict';

  if (window.__senseiguardSolanaHookLoaded) {
    if (typeof window.__senseiguardInstallSolanaHook === 'function') {
      window.__senseiguardInstallSolanaHook('reload');
    }
    return;
  }
  window.__senseiguardSolanaHookLoaded = true;

  var CHAIN_FAMILY = 'solana';
  var PAGE_TO_EXTENSION = 'SENSEIGUARD_TX_REQUEST';
  var EXTENSION_TO_PAGE = 'SENSEIGUARD_TX_DECISION';
  var DEBUG_TO_EXTENSION = 'SENSEIGUARD_DEBUG_EVENT';
  var DEFAULT_DECISION_TIMEOUT_MS = 45000;
  var CONNECT_DECISION_TIMEOUT_MS = 90000;
  var STATE_KEY = '__senseiguardSolanaHookState';
  /** Set by SenseiGuard popup wallet-connect on the injection tab — must not trigger dApp defense. */
  var EXTENSION_CONNECT_BYPASS_KEY = '__senseiguardExtensionWalletConnect';

  function isSenseifiHost() {
    try {
      var host = String(window.location.hostname || '').toLowerCase();
      return (
        host === 'senseifi.io' ||
        host === 'www.senseifi.io' ||
        host === 'localhost' ||
        host === '127.0.0.1'
      );
    } catch (_error) {
      return false;
    }
  }

  function isSenseifiExtensionConnectPage() {
    try {
      if (!isSenseifiHost()) return false;
      var path = window.location.pathname || '';
      var params = new URLSearchParams(window.location.search || '');
      return path.indexOf('/connect-wallet') !== -1 && params.get('extension') === '1';
    } catch (_error) {
      return false;
    }
  }

  function shouldBypassSolanaConnect(method) {
    if (method !== 'connect' && method !== 'wallet_standard_connect') return false;
    if (window[EXTENSION_CONNECT_BYPASS_KEY] || isSenseifiExtensionConnectPage()) return true;
    if (!isSenseifiHost()) return false;
    return (window.location.pathname || '').indexOf('/connect-wallet') !== -1;
  }

  var WATCHED_PROVIDER_METHODS = new Set([
    'connect',
    'signTransaction',
    'signAllTransactions',
    'signMessage',
    'signAndSendTransaction',
  ]);

  var state =
    window[STATE_KEY] ||
    (window[STATE_KEY] = {
      decisionWaiters: new Map(),
      listenersAttached: false,
      wrappedProviders: new WeakSet(),
      wrappedWallets: new WeakSet(),
      guardedProxies: new WeakMap(),
      retryTimer: null,
      retryAttempts: 0,
      retryMaxAttempts: 80,
      retryIntervalMs: 250,
      observerAttached: false,
      walletStandardAttached: false,
      wrappedCount: 0,
    });

  var WALLET_STANDARD_METHODS = [
    'connect',
    'signTransaction',
    'signMessage',
    'signAndSendTransaction',
    'signIn',
  ];

  function randomId() {
    return Date.now() + '-' + Math.random().toString(16).slice(2);
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
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        state.decisionWaiters.delete(requestId);
        emitDebug('solana_tx_decision_timeout', { requestId: requestId });
        resolve({
          action: 'block',
          riskScore: 95,
          reason: 'SenseiGuard decision timeout - blocked for safety',
          findings: ['No risk decision received in time'],
        });
      }, timeoutMs);
      state.decisionWaiters.set(requestId, {
        resolve: function (decision) {
          clearTimeout(timer);
          resolve(decision);
        },
      });
    });
  }

  function getDecisionTimeoutMs(method) {
    if (method === 'connect' || method === 'wallet_standard_connect') {
      return CONNECT_DECISION_TIMEOUT_MS;
    }
    return DEFAULT_DECISION_TIMEOUT_MS;
  }

  function serializeParams(params) {
    if (!Array.isArray(params)) return [];
    return params.map(function (item) {
      if (item == null) return item;
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        return item;
      }
      if (typeof item === 'object') {
        try {
          if (typeof item.serialize === 'function') {
            var serialized = item.serialize();
            if (serialized && typeof serialized.toString === 'function') {
              return { kind: 'serialized_tx', data: serialized.toString('base64') };
            }
          }
          if (typeof item.message === 'string') return { kind: 'message', message: item.message };
          if (item instanceof Uint8Array) {
            return { kind: 'bytes', length: item.length };
          }
        } catch (_error) {
          // Fall through to generic object snapshot.
        }
        return { kind: 'object', keys: Object.keys(item).slice(0, 12) };
      }
      return String(item);
    });
  }

  function postIntercept(method, params, meta) {
    var requestId = randomId();
    window.postMessage(
      {
        source: PAGE_TO_EXTENSION,
        chainFamily: CHAIN_FAMILY,
        requestId: requestId,
        method: method,
        params: serializeParams(params),
        meta: meta || null,
      },
      '*'
    );
    emitDebug('solana_tx_intercepted_inpage', {
      method: method,
      provider: meta && meta.provider ? meta.provider : 'unknown',
    });
    return requestId;
  }

  function applyDecision(decision, method) {
    if (decision.action === 'block') {
      var err = new Error(
        'Blocked by SenseiGuard (' +
          (decision.riskScore || 0) +
          '/100): ' +
          (decision.reason || 'High risk detected')
      );
      err.code = 4001;
      throw err;
    }
    if (decision.action === 'warn' && Array.isArray(decision.findings) && decision.findings.length) {
      console.warn('[SenseiGuard Solana warning]', decision.riskScore, decision.findings.join('; '));
    }
    return decision;
  }

  async function guardCall(method, params, invoke, meta) {
    if (shouldBypassSolanaConnect(method)) {
      return invoke();
    }

    var requestId = postIntercept(method, params, meta);
    var decision = await awaitDecision(requestId, getDecisionTimeoutMs(method));
    applyDecision(decision, method);
    return invoke();
  }

  function attachListenersOnce() {
    if (state.listenersAttached) return;
    state.listenersAttached = true;
    window.addEventListener('message', function (event) {
      if (event.source !== window) return;
      var data = event.data;
      if (!data || data.source !== EXTENSION_TO_PAGE || !data.requestId) return;
      var waiter = state.decisionWaiters.get(data.requestId);
      if (!waiter) return;
      state.decisionWaiters.delete(data.requestId);
      waiter.resolve(data.decision || { action: 'allow', riskScore: 0, reason: 'Default allow' });
    });
  }

  function wrapProviderMethod(provider, methodName, providerLabel) {
    if (!provider || typeof provider[methodName] !== 'function') return false;
    var markerKey = '__senseiguardSolanaWrapped_' + methodName;
    if (provider[markerKey]) return false;
    var original = provider[methodName].bind(provider);
    provider[methodName] = async function wrappedSolanaMethod() {
      var args = Array.prototype.slice.call(arguments);
      return guardCall(
        methodName,
        args,
        function () {
          return original.apply(provider, args);
        },
        { provider: providerLabel || 'solana_provider', api: 'provider' }
      );
    };
    provider[markerKey] = true;
    return true;
  }

  function isSolanaLikeProvider(provider) {
    if (!provider || typeof provider.connect !== 'function') return false;
    return !!(
      provider.isPhantom ||
      provider.isMetaMask ||
      provider.isTrust ||
      provider.isTrustWallet ||
      provider.isSolflare ||
      provider.isBackpack ||
      provider.isGlow ||
      typeof provider.signTransaction === 'function' ||
      typeof provider.signMessage === 'function' ||
      typeof provider.signAndSendTransaction === 'function' ||
      provider.publicKey !== undefined
    );
  }

  function registerWalletStandardWallet(wallet) {
    if (!wallet) return false;
    return !!guardWalletStandardWallet(wallet);
  }

  function guardWalletStandardFeatureOnAccess(feature, walletName) {
    if (!feature || typeof feature !== 'object') return feature;
    var wrappedAny = false;
    WALLET_STANDARD_METHODS.forEach(function (methodName) {
      if (wrapWalletStandardFeature(feature, methodName, walletName)) wrappedAny = true;
    });
    if (wrappedAny) {
      emitDebug('wallet_standard_feature_wrapped', { wallet: walletName || 'wallet_standard' });
    }
    return feature;
  }

  function guardWalletStandardWallet(wallet) {
    if (!wallet || typeof wallet !== 'object') return wallet;
    if (state.guardedProxies.has(wallet)) return state.guardedProxies.get(wallet);

    var walletName =
      wallet.name ||
      (wallet.chains && wallet.chains[0]) ||
      (wallet.features && Object.keys(wallet.features).join(',')) ||
      'wallet_standard';

    if (typeof wallet.connect === 'function') {
      wrapSolanaProvider(wallet, walletName);
    }

    var proxy = new Proxy(wallet, {
      get: function (target, prop) {
        if (prop === 'features') {
          var rawFeatures = target.features;
          if (!rawFeatures || typeof rawFeatures !== 'object') return rawFeatures;
          return new Proxy(rawFeatures, {
            get: function (_featuresContainer, featureKey) {
              var feature = rawFeatures[featureKey];
              return guardWalletStandardFeatureOnAccess(feature, walletName || String(featureKey));
            },
          });
        }
        var value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });

    state.guardedProxies.set(wallet, proxy);
    state.wrappedWallets.add(wallet);
    state.wrappedCount += 1;
    emitDebug('wallet_standard_wrapped', {
      wallet: walletName,
      wrappedCount: state.wrappedCount,
      proxy: true,
    });
    return proxy;
  }

  window.__senseiguardGuardWalletStandard = guardWalletStandardWallet;

  function drainPendingWalletStandardQueue() {
    var pending = window.__senseiguardPendingWalletStandard;
    if (!Array.isArray(pending) || !pending.length) return false;
    var wrapped = false;
    while (pending.length) {
      var wallet = pending.shift();
      if (guardWalletStandardWallet(wallet)) wrapped = true;
    }
    return wrapped;
  }

  function createWalletStandardRegisterApi() {
    return {
      register: function (wallet) {
        registerWalletStandardWallet(wallet);
      },
    };
  }

  function handleWalletStandardRegisterCallback(callback) {
    if (typeof callback !== 'function') return false;
    try {
      callback(createWalletStandardRegisterApi());
      return true;
    } catch (_error) {
      return false;
    }
  }

  function scanNavigatorWallets() {
    var wrapped = false;
    var navigatorWallets = null;
    try {
      navigatorWallets =
        window.navigator && Array.isArray(window.navigator.wallets) ? window.navigator.wallets : null;
    } catch (_error) {
      navigatorWallets = null;
    }
    if (!navigatorWallets || !navigatorWallets.length) return wrapped;
    navigatorWallets.forEach(function (entry) {
      if (!entry || typeof entry.register !== 'function') return;
      try {
        entry.register(createWalletStandardRegisterApi());
        wrapped = true;
      } catch (_error) {
        // Ignore legacy navigator.wallets entries that reject synthetic APIs.
      }
    });
    return wrapped;
  }

  function wrapSolanaProvider(provider, providerLabel) {
    if (!provider || state.wrappedProviders.has(provider)) return false;
    var wrappedAny = false;
    WATCHED_PROVIDER_METHODS.forEach(function (methodName) {
      if (wrapProviderMethod(provider, methodName, providerLabel)) wrappedAny = true;
    });
    if (wrappedAny) {
      state.wrappedProviders.add(provider);
      state.wrappedCount += 1;
      emitDebug('solana_provider_wrapped', {
        provider: providerLabel,
        wrappedCount: state.wrappedCount,
      });
    }
    return wrappedAny;
  }

  function wrapWalletStandardFeature(feature, methodName, walletName) {
    if (!feature || typeof feature[methodName] !== 'function') return false;
    var markerKey = '__senseiguardSolanaWrapped_' + methodName;
    if (feature[markerKey]) return false;
    var original = feature[methodName].bind(feature);
    var routedMethod = 'wallet_standard_' + methodName;
    feature[methodName] = async function wrappedWalletStandardMethod() {
      var args = Array.prototype.slice.call(arguments);
      return guardCall(
        routedMethod,
        args,
        function () {
          return original.apply(feature, args);
        },
        { provider: walletName || 'wallet_standard', api: 'wallet_standard' }
      );
    };
    feature[markerKey] = true;
    return true;
  }

  function wrapWalletStandardWallet(wallet) {
    return !!guardWalletStandardWallet(wallet);
  }

  function discoverNamedGlobals() {
    var wrapped = false;
    var candidates = [
      ['solana', 'window.solana'],
      ['phantom.solana', 'window.phantom.solana'],
      ['metamask.solana', 'window.metamask.solana'],
      ['trustwallet.solana', 'window.trustwallet.solana'],
      ['trustWallet.solana', 'window.trustWallet.solana'],
      ['solflare', 'window.solflare'],
      ['backpack', 'window.backpack'],
      ['glow', 'window.glow'],
    ];
    candidates.forEach(function (entry) {
      var provider = null;
      try {
        if (entry[0] === 'phantom.solana') provider = window.phantom && window.phantom.solana;
        else if (entry[0] === 'metamask.solana') provider = window.metamask && window.metamask.solana;
        else if (entry[0] === 'trustwallet.solana') provider = window.trustwallet && window.trustwallet.solana;
        else if (entry[0] === 'trustWallet.solana') provider = window.trustWallet && window.trustWallet.solana;
        else if (entry[0] === 'solana') provider = window.solana;
        else if (entry[0] === 'solflare') provider = window.solflare;
        else if (entry[0] === 'backpack') provider = window.backpack;
        else if (entry[0] === 'glow') provider = window.glow;
      } catch (_error) {
        provider = null;
      }
      if (provider && isSolanaLikeProvider(provider)) {
        if (wrapSolanaProvider(provider, entry[1])) wrapped = true;
      }
    });
    return wrapped;
  }

  function dispatchWalletStandardAppReady() {
    try {
      window.dispatchEvent(
        new CustomEvent('wallet-standard:app-ready', {
          detail: createWalletStandardRegisterApi(),
        })
      );
      return true;
    } catch (_error) {
      try {
        window.dispatchEvent(new Event('wallet-standard:app-ready'));
      } catch (_error2) {
        return false;
      }
      return true;
    }
  }

  function attachWalletStandardListenersOnce() {
    if (state.walletStandardAttached) return;
    state.walletStandardAttached = true;
    window.addEventListener('wallet-standard:register-wallet', function (event) {
      var callback = event && event.detail;
      if (typeof callback === 'function') {
        handleWalletStandardRegisterCallback(callback);
        return;
      }
      var legacyWallet = callback && callback.wallet ? callback.wallet : null;
      if (legacyWallet) registerWalletStandardWallet(legacyWallet);
    });
    dispatchWalletStandardAppReady();
    scanNavigatorWallets();
  }

  function installHook(reason) {
    var wrapped = discoverNamedGlobals();
    if (scanNavigatorWallets()) wrapped = true;
    if (drainPendingWalletStandardQueue()) wrapped = true;
    dispatchWalletStandardAppReady();
    if (wrapped) {
      emitDebug('solana_provider_wrap_success', { reason: reason || 'unknown' });
    } else {
      emitDebug('solana_provider_not_ready', { reason: reason || 'unknown' });
    }
    return wrapped;
  }

  function startRetryLoop() {
    if (state.retryTimer) clearInterval(state.retryTimer);
    state.retryAttempts = 0;
    state.retryTimer = setInterval(function () {
      state.retryAttempts += 1;
      var wrapped = installHook('retry_loop');
      if (wrapped || state.retryAttempts >= state.retryMaxAttempts) {
        clearInterval(state.retryTimer);
        state.retryTimer = null;
        emitDebug('solana_retry_loop_stopped', {
          attempts: state.retryAttempts,
          wrapped: wrapped,
        });
      }
    }, state.retryIntervalMs);
  }

  function attachMutationObserverOnce() {
    if (state.observerAttached) return;
    state.observerAttached = true;
    var observer = new MutationObserver(function () {
      installHook('dom_mutation');
    });
    observer.observe(document.documentElement || document, { childList: true, subtree: true });
  }

  window.__senseiguardInstallSolanaHook = installHook;

  attachListenersOnce();
  attachWalletStandardListenersOnce();
  installHook('initial');
  attachMutationObserverOnce();
  startRetryLoop();
})();
