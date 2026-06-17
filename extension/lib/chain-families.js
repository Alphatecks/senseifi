/* SenseiGuard chain family registry — shared across background + content script.
 * Add new non-EVM families here; each family gets its own in-page hook module.
 */
(function (global) {
  'use strict';

  var CHAIN_FAMILIES = {
    evm: {
      id: 'evm',
      label: 'EVM',
      connectMethods: ['eth_requestAccounts', 'wallet_requestPermissions'],
      strictMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_requestPermissions',
        'wallet_sendCalls',
      ],
      methodWeights: {
        eth_requestAccounts: 15,
        eth_sendTransaction: 35,
        eth_sign: 25,
        personal_sign: 20,
        eth_signTypedData: 20,
        eth_signTypedData_v3: 20,
        eth_signTypedData_v4: 20,
        wallet_requestPermissions: 20,
        wallet_sendCalls: 30,
      },
      hookScript: 'inpage-hook.js',
    },
    solana: {
      id: 'solana',
      label: 'Solana',
      connectMethods: ['connect', 'wallet_standard_connect'],
      strictMethods: [
        'connect',
        'wallet_standard_connect',
        'signTransaction',
        'signAllTransactions',
        'signMessage',
        'signAndSendTransaction',
        'wallet_standard_signTransaction',
        'wallet_standard_signMessage',
      ],
      methodWeights: {
        connect: 15,
        wallet_standard_connect: 15,
        signTransaction: 35,
        signAllTransactions: 40,
        signMessage: 25,
        signAndSendTransaction: 40,
        wallet_standard_signTransaction: 35,
        wallet_standard_signMessage: 25,
      },
      hookScript: 'solana-hook.js',
    },
    cosmos: {
      id: 'cosmos',
      label: 'Cosmos',
      connectMethods: ['enable', 'experimentalSuggestChain'],
      strictMethods: [
        'enable',
        'experimentalSuggestChain',
        'signAmino',
        'signDirect',
        'signArbitrary',
        'sendTx',
        'signICNSAdr36',
      ],
      methodWeights: {
        enable: 15,
        experimentalSuggestChain: 20,
        signAmino: 30,
        signDirect: 35,
        signArbitrary: 25,
        sendTx: 40,
        signICNSAdr36: 20,
      },
      hookScript: 'cosmos-hook.js',
      trapGlobals: ['keplr', 'leap', 'cosmostation'],
    },
    bitcoin: {
      id: 'bitcoin',
      label: 'Bitcoin',
      connectMethods: ['requestAccounts', 'connect'],
      strictMethods: [
        'requestAccounts',
        'connect',
        'signPsbt',
        'signPsbts',
        'signMessage',
        'sendBitcoin',
        'pushTx',
        'signTransaction',
      ],
      methodWeights: {
        requestAccounts: 15,
        connect: 15,
        signPsbt: 35,
        signPsbts: 40,
        signMessage: 25,
        sendBitcoin: 40,
        pushTx: 35,
        signTransaction: 35,
      },
      hookScript: 'bitcoin-hook.js',
      trapGlobals: ['unisat', 'XverseProviders'],
    },
  };

  var HOOK_SCRIPTS = ['inpage-hook.js', 'solana-hook.js', 'cosmos-hook.js', 'bitcoin-hook.js'];

  function toSet(values) {
    var set = new Set();
    if (!Array.isArray(values)) return set;
    values.forEach(function (value) {
      set.add(value);
    });
    return set;
  }

  var CONNECT_METHODS_BY_FAMILY = {};
  var STRICT_METHODS_BY_FAMILY = {};
  Object.keys(CHAIN_FAMILIES).forEach(function (familyId) {
    var family = CHAIN_FAMILIES[familyId];
    CONNECT_METHODS_BY_FAMILY[familyId] = toSet(family.connectMethods);
    STRICT_METHODS_BY_FAMILY[familyId] = toSet(family.strictMethods);
  });

  function resolveChainFamily(value) {
    if (typeof value === 'string' && CHAIN_FAMILIES[value]) return value;
    return 'evm';
  }

  function getFamily(chainFamily) {
    return CHAIN_FAMILIES[resolveChainFamily(chainFamily)];
  }

  function isConnectMethod(chainFamily, method) {
    var familyId = resolveChainFamily(chainFamily);
    return CONNECT_METHODS_BY_FAMILY[familyId].has(method);
  }

  function isStrictMethod(chainFamily, method) {
    var familyId = resolveChainFamily(chainFamily);
    return STRICT_METHODS_BY_FAMILY[familyId].has(method);
  }

  function getMethodWeight(chainFamily, method) {
    var family = getFamily(chainFamily);
    if (!family || !family.methodWeights) return 5;
    return typeof family.methodWeights[method] === 'number' ? family.methodWeights[method] : 5;
  }

  function getScanSubtitle(chainFamily, method) {
    var familyId = resolveChainFamily(chainFamily);
    var family = getFamily(familyId);
    if (family && isConnectMethod(familyId, method)) {
      return family.label + ' wallet connection risk';
    }
    if (familyId === 'solana') {
      if (method === 'signTransaction' || method === 'signAllTransactions' || method === 'signAndSendTransaction' || method === 'wallet_standard_signTransaction') {
        return 'Solana transaction signing risk';
      }
      if (method === 'signMessage' || method === 'wallet_standard_signMessage') {
        return 'Solana message signing risk';
      }
      return 'Solana wallet risks';
    }
    if (familyId === 'cosmos') {
      if (method === 'signAmino' || method === 'signDirect' || method === 'sendTx') {
        return 'Cosmos transaction signing risk';
      }
      if (method === 'signArbitrary' || method === 'signICNSAdr36') {
        return 'Cosmos message signing risk';
      }
      return 'Cosmos wallet risks';
    }
    if (familyId === 'bitcoin') {
      if (method === 'signPsbt' || method === 'signPsbts' || method === 'sendBitcoin' || method === 'pushTx' || method === 'signTransaction') {
        return 'Bitcoin transaction signing risk';
      }
      if (method === 'signMessage') {
        return 'Bitcoin message signing risk';
      }
      return 'Bitcoin wallet risks';
    }
    if (method === 'eth_sendTransaction') return 'transaction and approval risk';
    if (method && method.indexOf('eth_signTypedData') === 0) return 'typed-signature and phishing risk';
    return 'real-time wallet risks';
  }

  function normalizeWalletAddress(value, chainFamily) {
    if (typeof value !== 'string') return null;
    var trimmed = value.trim();
    if (!trimmed) return null;
    var familyId = resolveChainFamily(chainFamily);
    if (familyId === 'solana') {
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return trimmed;
      return null;
    }
    if (familyId === 'cosmos') {
      if (/^[a-z]{1,10}1[a-z0-9]{20,}$/i.test(trimmed)) return trimmed;
      return null;
    }
    if (familyId === 'bitcoin') {
      if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/.test(trimmed)) return trimmed;
      return null;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
    return trimmed;
  }

  function getTrapGlobals() {
    var props = [];
    Object.keys(CHAIN_FAMILIES).forEach(function (familyId) {
      var family = CHAIN_FAMILIES[familyId];
      if (!family || !Array.isArray(family.trapGlobals)) return;
      family.trapGlobals.forEach(function (prop) {
        props.push({ prop: prop, family: familyId });
      });
    });
    return props;
  }

  function connectApprovalKey(chainFamily, domain) {
    return resolveChainFamily(chainFamily) + '::' + String(domain || '').trim().toLowerCase();
  }

  global.SenseiGuardChainFamilies = {
    CHAIN_FAMILIES: CHAIN_FAMILIES,
    HOOK_SCRIPTS: HOOK_SCRIPTS,
    resolveChainFamily: resolveChainFamily,
    getFamily: getFamily,
    isConnectMethod: isConnectMethod,
    isStrictMethod: isStrictMethod,
    getMethodWeight: getMethodWeight,
    getScanSubtitle: getScanSubtitle,
    normalizeWalletAddress: normalizeWalletAddress,
    connectApprovalKey: connectApprovalKey,
    getTrapGlobals: getTrapGlobals,
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window);
