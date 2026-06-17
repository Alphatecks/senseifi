export type ContractScanChainFamily = "evm" | "solana";

export type SolanaNetwork = "mainnet-beta" | "devnet" | "testnet";

export interface ParsedContractScanTarget {
  contractAddress: string;
  chainFamily: ContractScanChainFamily;
  chainId?: number;
  network?: SolanaNetwork;
  rawInput: string;
}

export interface ScanContractRequestBody {
  contract_address: string;
  for_address?: string;
  chain_id?: number;
  chain_family?: ContractScanChainFamily;
  network?: string;
}

export type ScanContractOptions = {
  chainId?: number;
  chainFamily?: ContractScanChainFamily;
  network?: SolanaNetwork | string;
};

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isEvmContractAddress(value: string): boolean {
  return EVM_ADDRESS_RE.test(String(value || "").trim());
}

export function isSolanaProgramAddress(value: string): boolean {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed.startsWith("0x")) return false;
  return SOLANA_BASE58_RE.test(trimmed);
}

export function extractEvmAddressFromExplorerLink(link: string): string {
  const input = String(link || "").trim();
  const pathMatch = input.match(/\/(?:address|token)\/(0x[a-fA-F0-9]{40})/i);
  if (pathMatch) return pathMatch[1];
  const hexMatch = input.match(/(0x[a-fA-F0-9]{40})/i);
  return hexMatch ? hexMatch[1] : "";
}

export function extractSolanaAddressFromExplorerLink(link: string): string {
  const input = String(link || "").trim();
  const pathMatch = input.match(/\/(?:account|token|program)\/([1-9A-HJ-NP-Za-km-z]{32,44})/i);
  if (pathMatch && isSolanaProgramAddress(pathMatch[1])) return pathMatch[1];
  const base58Match = input.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
  if (base58Match && isSolanaProgramAddress(base58Match[1])) return base58Match[1];
  return "";
}

export function inferEvmChainIdFromExplorerLink(link: string): number {
  const host = String(link || "").toLowerCase();
  if (host.includes("bscscan")) return 56;
  if (host.includes("polygonscan")) return 137;
  if (host.includes("basescan")) return 8453;
  if (host.includes("arbiscan")) return 42161;
  if (host.includes("optimistic.etherscan") || host.includes("optimism")) return 10;
  return 1;
}

export function inferSolanaNetworkFromExplorerLink(link: string): SolanaNetwork {
  const value = String(link || "").toLowerCase();
  if (value.includes("devnet")) return "devnet";
  if (value.includes("testnet")) return "testnet";
  return "mainnet-beta";
}

function isSolanaExplorerHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes("solscan") || host.includes("solana.fm") || host.includes("explorer.solana.com");
}

export function parseContractScanInput(raw: string): ParsedContractScanTarget | null {
  const trimmed = raw.trim();
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
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    if (isSolanaExplorerHost(url.hostname)) {
      const solanaAddress = extractSolanaAddressFromExplorerLink(trimmed);
      if (solanaAddress) {
        return {
          contractAddress: solanaAddress,
          chainFamily: "solana",
          network: inferSolanaNetworkFromExplorerLink(trimmed),
          rawInput: trimmed,
        };
      }
    }

    const evmAddress = extractEvmAddressFromExplorerLink(trimmed);
    if (evmAddress) {
      return {
        contractAddress: evmAddress,
        chainFamily: "evm",
        chainId: inferEvmChainIdFromExplorerLink(url.hostname),
        rawInput: trimmed,
      };
    }
  } catch {
    return null;
  }

  return null;
}

/** Prefer raw explorer URL for Solana when backend can extract the program id. */
export function resolveScanContractAddressForApi(target: ParsedContractScanTarget): string {
  if (target.rawInput.includes("://") && isSolanaExplorerHost(new URL(target.rawInput).hostname)) {
    return target.rawInput;
  }
  return target.contractAddress;
}

export function buildScanContractRequestBody(
  target: ParsedContractScanTarget,
  forAddress?: string | null,
  overrides?: ScanContractOptions
): ScanContractRequestBody {
  const body: ScanContractRequestBody = {
    contract_address: resolveScanContractAddressForApi(target),
  };

  if (forAddress?.trim()) {
    body.for_address = forAddress.trim();
  }

  if (target.chainFamily === "solana") {
    body.chain_family = "solana";
    body.network = String(overrides?.network ?? target.network ?? "mainnet-beta");
  } else {
    body.chain_id = overrides?.chainId ?? target.chainId ?? 1;
  }

  return body;
}

export function formatContractScanNetworkLabel(result?: {
  network?: string | null;
  chain_id?: number | null;
  details?: { chain_family?: string; network?: string } | null;
} | null): string {
  if (!result) return "—";
  if (result.network?.trim()) return result.network.trim();
  if (result.details?.network?.trim()) return result.details.network.trim();
  if (result.details?.chain_family === "solana") return "Solana";
  if (typeof result.chain_id === "number" && result.chain_id === 101) return "Solana Mainnet";
  if (typeof result.chain_id === "number") {
    const map: Record<number, string> = {
      1: "Ethereum Mainnet",
      56: "BNB Smart Chain",
      137: "Polygon",
      8453: "Base",
      42161: "Arbitrum One",
      10: "Optimism",
    };
    return map[result.chain_id] ?? `Chain ${result.chain_id}`;
  }
  return "—";
}

export function normalizeContractAddressForCompare(addr: string | null | undefined): string {
  const trimmed = String(addr ?? "").trim();
  if (!trimmed) return "";
  if (isSolanaProgramAddress(trimmed)) return trimmed;
  return trimmed.toLowerCase();
}
