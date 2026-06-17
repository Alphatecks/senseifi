/* Shared contract / program scan helpers for EVM + Solana (extension popup). */
(function (global) {
  "use strict";

  var EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
  var SOLANA_BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  function isEvmContractAddress(value) {
    return EVM_ADDRESS_RE.test(String(value || "").trim());
  }

  function isSolanaProgramAddress(value) {
    var trimmed = String(value || "").trim();
    if (!trimmed || trimmed.indexOf("0x") === 0) return false;
    return SOLANA_BASE58_RE.test(trimmed);
  }

  function extractEvmAddressFromExplorerLink(link) {
    var input = String(link || "").trim();
    var pathMatch = input.match(/\/(?:address|token)\/(0x[a-fA-F0-9]{40})/i);
    if (pathMatch) return pathMatch[1];
    var hexMatch = input.match(/(0x[a-fA-F0-9]{40})/i);
    return hexMatch ? hexMatch[1] : "";
  }

  function extractSolanaAddressFromExplorerLink(link) {
    var input = String(link || "").trim();
    var pathMatch = input.match(/\/(?:account|token|program)\/([1-9A-HJ-NP-Za-km-z]{32,44})/i);
    if (pathMatch && isSolanaProgramAddress(pathMatch[1])) return pathMatch[1];
    var base58Match = input.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (base58Match && isSolanaProgramAddress(base58Match[1])) return base58Match[1];
    return "";
  }

  function inferEvmChainIdFromExplorerLink(link) {
    var host = String(link || "").toLowerCase();
    if (host.indexOf("bscscan") !== -1) return 56;
    if (host.indexOf("polygonscan") !== -1) return 137;
    if (host.indexOf("basescan") !== -1) return 8453;
    if (host.indexOf("arbiscan") !== -1) return 42161;
    if (host.indexOf("optimistic.etherscan") !== -1 || host.indexOf("optimism") !== -1) return 10;
    return 1;
  }

  function inferSolanaNetworkFromExplorerLink(link) {
    var value = String(link || "").toLowerCase();
    if (value.indexOf("devnet") !== -1) return "devnet";
    if (value.indexOf("testnet") !== -1) return "testnet";
    return "mainnet-beta";
  }

  function isSolanaExplorerHost(hostname) {
    var host = String(hostname || "").toLowerCase();
    return host.indexOf("solscan") !== -1 || host.indexOf("solana.fm") !== -1 || host.indexOf("explorer.solana.com") !== -1;
  }

  function parseContractScanInput(raw) {
    var trimmed = String(raw || "").trim();
    if (!trimmed) return null;

    if (isEvmContractAddress(trimmed)) {
      return {
        contractAddress: trimmed,
        chainFamily: "evm",
        chainId: 1,
        rawInput: trimmed,
      };
    }

    if (isSolanaProgramAddress(trimmed)) {
      return {
        contractAddress: trimmed,
        chainFamily: "solana",
        network: "mainnet-beta",
        rawInput: trimmed,
      };
    }

    try {
      var url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;

      if (isSolanaExplorerHost(url.hostname)) {
        var solanaAddress = extractSolanaAddressFromExplorerLink(trimmed);
        if (solanaAddress) {
          return {
            contractAddress: solanaAddress,
            chainFamily: "solana",
            network: inferSolanaNetworkFromExplorerLink(trimmed),
            rawInput: trimmed,
          };
        }
      }

      var evmAddress = extractEvmAddressFromExplorerLink(trimmed);
      if (evmAddress) {
        return {
          contractAddress: evmAddress,
          chainFamily: "evm",
          chainId: inferEvmChainIdFromExplorerLink(url.hostname),
          rawInput: trimmed,
        };
      }
    } catch (_error) {
      return null;
    }

    return null;
  }

  function resolveScanContractAddressForApi(target) {
    if (target.rawInput.indexOf("://") !== -1) {
      try {
        if (isSolanaExplorerHost(new URL(target.rawInput).hostname)) {
          return target.rawInput;
        }
      } catch (_error) {
        // Fall through to extracted address.
      }
    }
    return target.contractAddress;
  }

  function buildScanContractRequestBody(target, forAddress, overrides) {
    var body = {
      contract_address: resolveScanContractAddressForApi(target),
    };
    if (forAddress && String(forAddress).trim()) {
      body.for_address = String(forAddress).trim();
    }
    if (target.chainFamily === "solana") {
      body.chain_family = "solana";
      body.network =
        (overrides && overrides.network) || target.network || "mainnet-beta";
    } else {
      body.chain_id = (overrides && overrides.chainId) || target.chainId || 1;
    }
    return body;
  }

  global.SenseiGuardContractScan = {
    isEvmContractAddress: isEvmContractAddress,
    isSolanaProgramAddress: isSolanaProgramAddress,
    parseContractScanInput: parseContractScanInput,
    buildScanContractRequestBody: buildScanContractRequestBody,
    inferEvmChainIdFromExplorerLink: inferEvmChainIdFromExplorerLink,
    inferSolanaNetworkFromExplorerLink: inferSolanaNetworkFromExplorerLink,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
