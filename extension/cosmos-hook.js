/* SenseiGuard Cosmos in-page hook — Keplr, Leap, and compatible wallets. */

(function () {
  'use strict';

  var base = window.SenseiGuardProviderHookBase;
  if (!base || typeof base.createProviderHook !== 'function') return;

  function isCosmosLikeProvider(provider) {
    return !!(
      provider &&
      (typeof provider.enable === 'function' ||
        typeof provider.signAmino === 'function' ||
        typeof provider.signDirect === 'function' ||
        typeof provider.signArbitrary === 'function' ||
        typeof provider.sendTx === 'function')
    );
  }

  function readGlobal(path) {
    try {
      if (path === 'window.keplr') return window.keplr;
      if (path === 'window.leap') return window.leap;
      if (path === 'window.cosmostation') return window.cosmostation && window.cosmostation.cosmos;
      return null;
    } catch (_error) {
      return null;
    }
  }

  base.createProviderHook({
    chainFamily: 'cosmos',
    label: 'Cosmos',
    stateKey: '__senseiguardCosmosHookState',
    loadedFlag: '__senseiguardCosmosHookLoaded',
    installGlobalKey: '__senseiguardInstallCosmosHook',
    connectMethods: ['enable', 'experimentalSuggestChain'],
    watchedMethods: [
      'enable',
      'experimentalSuggestChain',
      'signAmino',
      'signDirect',
      'signArbitrary',
      'sendTx',
      'signICNSAdr36',
    ],
    isLikeProvider: isCosmosLikeProvider,
    discoverProviders: function () {
      return [
        { label: 'window.keplr', provider: readGlobal('window.keplr') },
        { label: 'window.leap', provider: readGlobal('window.leap') },
        { label: 'window.cosmostation.cosmos', provider: readGlobal('window.cosmostation') },
      ].filter(function (entry) {
        return entry.provider && isCosmosLikeProvider(entry.provider);
      });
    },
  });
})();
