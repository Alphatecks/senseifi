/* SenseiGuard Bitcoin in-page hook — Unisat, Xverse, and compatible wallets. */

(function () {
  'use strict';

  var base = window.SenseiGuardProviderHookBase;
  if (!base || typeof base.createProviderHook !== 'function') return;

  function isBitcoinLikeProvider(provider) {
    return !!(
      provider &&
      (typeof provider.requestAccounts === 'function' ||
        typeof provider.connect === 'function' ||
        typeof provider.signPsbt === 'function' ||
        typeof provider.signMessage === 'function' ||
        typeof provider.sendBitcoin === 'function')
    );
  }

  function readXverseBitcoinProvider() {
    try {
      var providers = window.XverseProviders;
      if (providers && providers.BitcoinProvider) return providers.BitcoinProvider;
      if (providers && typeof providers.getBitcoinProvider === 'function') {
        return providers.getBitcoinProvider();
      }
      return null;
    } catch (_error) {
      return null;
    }
  }

  base.createProviderHook({
    chainFamily: 'bitcoin',
    label: 'Bitcoin',
    stateKey: '__senseiguardBitcoinHookState',
    loadedFlag: '__senseiguardBitcoinHookLoaded',
    installGlobalKey: '__senseiguardInstallBitcoinHook',
    connectMethods: ['requestAccounts', 'connect'],
    watchedMethods: [
      'requestAccounts',
      'connect',
      'signPsbt',
      'signPsbts',
      'signMessage',
      'sendBitcoin',
      'pushTx',
      'signTransaction',
    ],
    isLikeProvider: isBitcoinLikeProvider,
    discoverProviders: function () {
      var candidates = [];
      try {
        if (window.unisat) candidates.push({ label: 'window.unisat', provider: window.unisat });
        if (window.okxwallet && window.okxwallet.bitcoin) {
          candidates.push({ label: 'window.okxwallet.bitcoin', provider: window.okxwallet.bitcoin });
        }
        var xverse = readXverseBitcoinProvider();
        if (xverse) candidates.push({ label: 'window.XverseProviders.BitcoinProvider', provider: xverse });
      } catch (_error) {
        // Ignore read errors on hardened pages.
      }
      return candidates.filter(function (entry) {
        return entry.provider && isBitcoinLikeProvider(entry.provider);
      });
    },
  });
})();
