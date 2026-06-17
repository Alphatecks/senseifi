/* SenseiGuard early provider trap — MAIN world @ document_start
 * Captures wallet globals before dApp bundles cache provider references.
 */

(function () {
  'use strict';

  if (window.__senseiguardEarlyTrapInstalled) return;
  window.__senseiguardEarlyTrapInstalled = true;

  var PENDING_KEY = '__senseiguardPendingProviders';
  var PENDING_WALLETS_KEY = '__senseiguardPendingWalletStandard';
  var nativeDefineProperty = Object.defineProperty;
  var nativeAddEventListener = EventTarget.prototype.addEventListener;
  var nativeDispatchEvent = EventTarget.prototype.dispatchEvent;

  var TRAPPED_PROPS = [
    { prop: 'ethereum', family: 'evm' },
    { prop: 'trustwallet', family: 'evm' },
    { prop: 'trustWallet', family: 'evm' },
    { prop: 'coinbaseWalletExtension', family: 'evm' },
    { prop: 'solana', family: 'solana' },
    { prop: 'phantom', family: 'solana' },
    { prop: 'metamask', family: 'solana' },
    { prop: 'keplr', family: 'cosmos' },
    { prop: 'leap', family: 'cosmos' },
    { prop: 'cosmostation', family: 'cosmos' },
    { prop: 'unisat', family: 'bitcoin' },
    { prop: 'XverseProviders', family: 'bitcoin' },
  ];

  var TRAPPED_PROP_SET = {};
  TRAPPED_PROPS.forEach(function (entry) {
    TRAPPED_PROP_SET[entry.prop] = entry.family;
  });

  function notifyInstallHooks(source) {
    Object.keys(window).forEach(function (key) {
      if (
        key.indexOf('__senseiguardInstall') === 0 &&
        key.lastIndexOf('Hook') === key.length - 4 &&
        typeof window[key] === 'function'
      ) {
        window[key](source || 'early_trap');
      }
    });
  }

  function queueProvider(provider, source) {
    if (!provider || typeof provider !== 'object') return;
    var pending = window[PENDING_KEY];
    if (!Array.isArray(pending)) {
      pending = [];
      window[PENDING_KEY] = pending;
    }
    pending.push({ provider: provider, source: source || 'unknown' });
    notifyInstallHooks(source || 'queued_provider');
  }

  function trapProperty(prop, family) {
    var current = window[prop];
    if (current) queueProvider(current, family + ':existing');

    try {
      nativeDefineProperty(window, prop, {
        configurable: true,
        enumerable: true,
        get: function () {
          return current;
        },
        set: function (next) {
          current = next;
          queueProvider(next, family + ':setter');
        },
      });
    } catch (_err) {
      if (current) queueProvider(current, family + ':existing_fallback');
    }
  }

  TRAPPED_PROPS.forEach(function (entry) {
    trapProperty(entry.prop, entry.family);
  });

  Object.defineProperty = function (obj, prop, descriptor) {
    var result = nativeDefineProperty.apply(this, arguments);
    try {
      if (obj === window && descriptor && TRAPPED_PROP_SET[prop]) {
        var provider = descriptor.value;
        if (!provider && typeof descriptor.get === 'function') {
          try {
            provider = descriptor.get.call(window);
          } catch (_getErr) {
            provider = null;
          }
        }
        queueProvider(provider, TRAPPED_PROP_SET[prop] + ':defineProperty');
      }
    } catch (_err) {
      // Never break page scripts if trap bookkeeping fails.
    }
    return result;
  };

  try {
    Object.defineProperty.toString = function () {
      return nativeDefineProperty.toString();
    };
  } catch (_err) {
    // Ignore environments that lock Function.prototype.
  }

  function queueWalletStandard(wallet) {
    if (!wallet || typeof wallet !== 'object') return;
    var pending = window[PENDING_WALLETS_KEY];
    if (!Array.isArray(pending)) {
      pending = [];
      window[PENDING_WALLETS_KEY] = pending;
    }
    pending.push(wallet);
    notifyInstallHooks('wallet_standard_register');
  }

  function guardWalletStandardOnRegister(wallet) {
    if (typeof window.__senseiguardGuardWalletStandard === 'function') {
      return window.__senseiguardGuardWalletStandard(wallet) || wallet;
    }
    queueWalletStandard(wallet);
    return wallet;
  }

  function patchRegisterApi(api) {
    if (!api || typeof api.register !== 'function') return api;
    if (api.__senseiguardRegisterPatched) return api;

    var originalRegister = api.register.bind(api);
    var patchedRegister = function patchedRegister() {
      var args = Array.prototype.slice.call(arguments);
      var guarded = args.map(function (wallet) {
        return guardWalletStandardOnRegister(wallet);
      });
      return originalRegister.apply(api, guarded);
    };

    try {
      api.register = patchedRegister;
      api.__senseiguardRegisterPatched = true;
      return api;
    } catch (_freezeError) {
      return new Proxy(api, {
        get: function (target, prop) {
          if (prop === 'register') return patchedRegister;
          var value = target[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    }
  }

  function proxyRegisterWalletListener(event, listener) {
    if (!event || typeof event.detail !== 'function') {
      return listener.call(this, event);
    }
    var originalDetail = event.detail;
    var proxyEvent = new Proxy(event, {
      get: function (target, prop) {
        if (prop === 'detail') {
          return function (api) {
            return originalDetail(patchRegisterApi(api));
          };
        }
        var value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    return listener.call(this, proxyEvent);
  }

  function proxyAppReadyListener(event, listener) {
    if (!event || !event.detail || typeof event.detail.register !== 'function') {
      return listener.call(this, event);
    }
    var proxyEvent = new Proxy(event, {
      get: function (target, prop) {
        if (prop === 'detail') return patchRegisterApi(target.detail);
        var value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    return listener.call(this, proxyEvent);
  }

  function guardEvmProviderOnAnnounce(provider) {
    if (!provider || typeof provider !== 'object') return provider;
    if (typeof window.__senseiguardWrapEvmProvider === 'function') {
      window.__senseiguardWrapEvmProvider(provider);
      return provider;
    }
    queueProvider(provider, 'eip6963:pending');
    return provider;
  }

  function proxyEip6963Listener(event, listener) {
    if (!event || !event.detail || !event.detail.provider) {
      return listener.call(this, event);
    }
    guardEvmProviderOnAnnounce(event.detail.provider);
    return listener.call(this, event);
  }

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof listener === 'function' && (this === window || this === document)) {
      if (type === 'eip6963:announceProvider') {
        var wrappedAnnounce = function (event) {
          return proxyEip6963Listener.call(this, event, listener);
        };
        return nativeAddEventListener.call(this, type, wrappedAnnounce, options);
      }
      if (type === 'wallet-standard:register-wallet') {
        var wrappedRegister = function (event) {
          return proxyRegisterWalletListener.call(this, event, listener);
        };
        return nativeAddEventListener.call(this, type, wrappedRegister, options);
      }
      if (type === 'wallet-standard:app-ready') {
        var wrappedReady = function (event) {
          return proxyAppReadyListener.call(this, event, listener);
        };
        return nativeAddEventListener.call(this, type, wrappedReady, options);
      }
    }
    return nativeAddEventListener.call(this, type, listener, options);
  };

  EventTarget.prototype.dispatchEvent = function (event) {
    if (
      event &&
      event.type === 'eip6963:announceProvider' &&
      event.detail &&
      event.detail.provider
    ) {
      guardEvmProviderOnAnnounce(event.detail.provider);
    }
    if (
      event &&
      event.type === 'wallet-standard:app-ready' &&
      event.detail &&
      typeof event.detail.register === 'function'
    ) {
      patchRegisterApi(event.detail);
    }
    return nativeDispatchEvent.call(this, event);
  };

  try {
    EventTarget.prototype.addEventListener.toString = function () {
      return nativeAddEventListener.toString();
    };
    EventTarget.prototype.dispatchEvent.toString = function () {
      return nativeDispatchEvent.toString();
    };
  } catch (_err) {
    // Ignore environments that lock Function.prototype.
  }
})();
