const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function isValidEvmAddress(value: string): boolean {
  return EVM_ADDRESS_REGEX.test(value.trim());
}

/** Accepts raw 0x address or explorer URL containing an address. */
export function normalizeEvmAddressInput(raw: string): string | null {
  const input = raw.trim();
  if (isValidEvmAddress(input)) return input;

  const pathMatch = input.match(/\/(?:address|token)\/(0x[a-fA-F0-9]{40})/i);
  if (pathMatch?.[1]) return pathMatch[1];

  const hexMatch = input.match(/(0x[a-fA-F0-9]{40})/i);
  return hexMatch?.[1] ?? null;
}

const RPC_URLS: Record<number, string> = {
  1: "https://eth.llamarpc.com",
  56: "https://bsc-dataseed.binance.org",
};

export async function isContractAddressOnChain(address: string, chainId = 1): Promise<boolean> {
  const rpc = RPC_URLS[chainId] ?? RPC_URLS[1];
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "latest"],
      }),
    });
    const json = (await res.json()) as { result?: string };
    const code = json.result;
    return typeof code === "string" && code !== "0x" && code !== "0x0" && code.length > 2;
  } catch {
    return false;
  }
}

export function truncateEvmAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
