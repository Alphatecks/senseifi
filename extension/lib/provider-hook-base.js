/* Shared in-page hook factory for non-EVM wallet providers (MAIN world). */

(function (global) {
  'use strict';

  var PAGE_TO_EXTENSION = 'SENSEIGUARD_TX_REQUEST';
  var EXTENSION_TO_PAGE = 'SENSEIGUARD_TX_DECISION';
  var DEBUG_TO_EXTENSION = 'SENSEIGUARD_DEBUG_EVENT';
  var DEFAULT_DECISION_TIMEOUT_MS = 45000;
  var CONNECT_DECISION_TIMEOUT_MS = 90000;

  function createProviderHook(config) {
    if (!config || !config.chainFamily || !config.stateKey || !config.loadedFlag || !config.installGlobalKey) {
      throw new Error('Invalid provider hook config');
    }

    if (global[config.loadedFlag]) {
      if (typeof global[config.installGlobalKey] === 'function') {
        global[config.installGlobalKey]('reload');
      }
      return;
    }
    global[config.loadedFlag] = true;

    var watchedMethods = config.watchedMethods || [];
    var connectMethods = config.connectMethods || [];
    var watchedSet = {};
    watchedMethods.forEach(function (method) {
      watchedSet[method] = true;
    });
    var connectSet = {};
    connectMethods.forEach(function (method) {
      connectSet[method] = true;
    });

    var state =
      global[config.stateKey] ||
      (global[config.stateKey] = {
        decisionWaiters: new Map(),
        listenersAttached: false,
        wrappedProviders: new WeakSet(),
        retryTimer: null,
        retryAttempts: 0,
        retryMaxAttempts: config.retryMaxAttempts || 40,
        retryIntervalMs: config.retryIntervalMs || 250,
        observerAttached: false,
        wrappedCount: 0,
      });

    function randomId() {
      return Date.now() + '-' + Math.random().toString(16).slice(2);
    }

    function emitDebug(eventName, extra) {
      global.postMessage(
        {
          source: DEBUG_TO_EXTENSION,
          event: eventName,
          details: extra || null,
        },
        '*'
      );
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
            return { kind: 'object', keys: Object.keys(item).slice(0, 16) };
          } catch (_error) {
            return { kind: 'object' };
          }
        }
        return String(item);
      });
    }

    function awaitDecision(requestId, timeoutMs) {
      return new Promise(function (resolve) {
        var timer = setTimeout(function () {
          state.decisionWaiters.delete(requestId);
          emitDebug(config.chainFamily + '_tx_decision_timeout', { requestId: requestId });
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
      if (connectSet[method]) return CONNECT_DECISION_TIMEOUT_MS;
      return DEFAULT_DECISION_TIMEOUT_MS;
    }

    function postIntercept(method, params, meta) {
      var requestId = randomId();
      global.postMessage(
        {
          source: PAGE_TO_EXTENSION,
          chainFamily: config.chainFamily,
          requestId: requestId,
          method: method,
          params: serializeParams(params),
          meta: meta || null,
        },
        '*'
      );
      emitDebug(config.chainFamily + '_tx_intercepted_inpage', {
        method: method,
        provider: meta && meta.provider ? meta.provider : 'unknown',
      });
      return requestId;
    }

    function applyDecision(decision) {
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
        console.warn('[SenseiGuard ' + config.label + ' warning]', decision.riskScore, decision.findings.join('; '));
      }
    }

    async function guardCall(method, params, invoke, meta) {
      var requestId = postIntercept(method, params, meta);
      var decision = await awaitDecision(requestId, getDecisionTimeoutMs(method));
      applyDecision(decision);
      return invoke();
    }

    function attachListenersOnce() {
      if (state.listenersAttached) return;
      state.listenersAttached = true;
      global.addEventListener('message', function (event) {
        if (event.source !== global) return;
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
      var markerKey = '__senseiguardWrapped_' + config.chainFamily + '_' + methodName;
      if (provider[markerKey]) return false;
      var original = provider[methodName].bind(provider);
      provider[methodName] = async function wrappedProviderMethod() {
        var args = Array.prototype.slice.call(arguments);
        return guardCall(
          methodName,
          args,
          function () {
            return original.apply(provider, args);
          },
          { provider: providerLabel || config.chainFamily + '_provider', api: 'provider' }
        );
      };
      provider[markerKey] = true;
      return true;
    }

    function wrapProvider(provider, providerLabel) {
      if (!provider || state.wrappedProviders.has(provider)) return false;
      if (typeof config.isLikeProvider === 'function' && !config.isLikeProvider(provider)) return false;
      var wrappedAny = false;
      watchedMethods.forEach(function (methodName) {
        if (wrapProviderMethod(provider, methodName, providerLabel)) wrappedAny = true;
      });
      if (wrappedAny) {
        state.wrappedProviders.add(provider);
        state.wrappedCount += 1;
        emitDebug(config.chainFamily + '_provider_wrapped', {
          provider: providerLabel,
          wrappedCount: state.wrappedCount,
        });
      }
      return wrappedAny;
    }

    function installHook(reason) {
      var wrapped = false;
      var candidates = typeof config.discoverProviders === 'function' ? config.discoverProviders() : [];
      candidates.forEach(function (entry) {
        if (!entry || !entry.provider) return;
        if (wrapProvider(entry.provider, entry.label || config.chainFamily)) wrapped = true;
      });
      if (wrapped) {
        emitDebug(config.chainFamily + '_provider_wrap_success', { reason: reason || 'unknown' });
      } else {
        emitDebug(config.chainFamily + '_provider_not_ready', { reason: reason || 'unknown' });
      }
      return wrapped;
    }

    function startRetryLoop() {
      if (state.retryTimer) clearInterval(state.retryTimer);
      state.retryAttempts = 0;
      state.retryTimer = setInterval(function () {
        state.retryAttempts += 1;
        var didWrap = installHook('retry_loop');
        if (didWrap || state.retryAttempts >= state.retryMaxAttempts) {
          clearInterval(state.retryTimer);
          state.retryTimer = null;
          emitDebug(config.chainFamily + '_retry_loop_stopped', {
            attempts: state.retryAttempts,
            wrapped: didWrap,
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
      observer.observe(global.document.documentElement || global.document, {
        childList: true,
        subtree: true,
      });
    }

    global[config.installGlobalKey] = installHook;
    attachListenersOnce();
    installHook('initial');
    attachMutationObserverOnce();
    startRetryLoop();
  }

  global.SenseiGuardProviderHookBase = {
    createProviderHook: createProviderHook,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
