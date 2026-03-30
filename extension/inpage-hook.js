/* SenseiGuard in-page hook
 * Wraps EIP-1193 request calls and asks extension for allow/warn/block decisions.
 */

(function () {
  'use strict';

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
  const DECISION_TIMEOUT_MS = 3500;
  const STATE_KEY = '__senseiguardInpageState';
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

  function wrapProvider(provider) {
    if (!provider || typeof provider.request !== 'function' || provider.__senseiguardWrapped) return;
    const originalRequest = provider.request.bind(provider);
    provider.__senseiguardWrapped = true;

    provider.request = async function wrappedRequest(args) {
      const method = args && args.method;
      if (!WATCHED_METHODS.has(method)) {
        return originalRequest(args);
      }

      const requestId = randomId();
      window.postMessage(
        {
          source: PAGE_TO_EXTENSION,
          requestId,
          method,
          params: args && Array.isArray(args.params) ? args.params : [],
        },
        '*'
      );
      emitDebug('tx_intercepted_inpage', { method });

      const decision = await awaitDecision(requestId, DECISION_TIMEOUT_MS);
      if (decision.action === 'block') {
        const err = new Error(
          `Blocked by SenseiGuard (${decision.riskScore || 0}/100): ${decision.reason || 'High risk detected'}`
        );
        err.code = 4001;
        throw err;
      }

      if (decision.action === 'warn' && Array.isArray(decision.findings) && decision.findings.length) {
        // Let request continue but keep a console signal for power users.
        console.warn('[SenseiGuard warning]', decision.riskScore, decision.findings.join('; '));
      }

      return originalRequest(args);
    };
    state.wrappedProvidersCount += 1;
    emitDebug('provider_wrapped', { wrappedProvidersCount: state.wrappedProvidersCount });
  }

  function installHook(reason) {
    const eth = window.ethereum;
    if (!eth) {
      emitDebug('provider_not_ready', { reason: reason || 'unknown' });
      return false;
    }
    let wrapped = false;
    if (Array.isArray(eth.providers) && eth.providers.length) {
      eth.providers.forEach((provider) => {
        const before = !!provider.__senseiguardWrapped;
        wrapProvider(provider);
        if (!before && provider.__senseiguardWrapped) wrapped = true;
      });
    }
    const beforeRoot = !!eth.__senseiguardWrapped;
    wrapProvider(eth);
    if (!beforeRoot && eth.__senseiguardWrapped) wrapped = true;
    if (wrapped) emitDebug('provider_wrap_success', { reason: reason || 'unknown' });
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
    window.addEventListener('eip6963:announceProvider', (event) => {
      const provider = event && event.detail ? event.detail.provider : null;
      if (!provider) return;
      wrapProvider(provider);
      emitDebug('eip6963_provider_announced', {
        name:
          event && event.detail && event.detail.info && event.detail.info.name
            ? event.detail.info.name
            : 'unknown',
      });
    });
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

  attachListenersOnce();
  attachEip6963ListenersOnce();
  installHook('initial');
  attachMutationObserverOnce();
  startRetryLoop();
})();
