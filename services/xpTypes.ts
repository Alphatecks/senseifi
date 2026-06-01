export const XP_COST_TX_ANALYSIS =
  Number(process.env.NEXT_PUBLIC_XP_COST_TX_ANALYSIS) || 5;
export const XP_COST_DAPP_CHECK =
  Number(process.env.NEXT_PUBLIC_XP_COST_DAPP_CHECK) || 3;
export const XP_COST_CONTRACT_SCAN =
  Number(process.env.NEXT_PUBLIC_XP_COST_CONTRACT_SCAN) || 10;

export class InsufficientXpError extends Error {
  xpBalance: number;
  xpCost: number;
  actionType: string;

  constructor(payload: {
    message: string;
    xpBalance: number;
    xpCost: number;
    actionType: string;
  }) {
    super(payload.message);
    this.name = "InsufficientXpError";
    this.xpBalance = payload.xpBalance;
    this.xpCost = payload.xpCost;
    this.actionType = payload.actionType;
  }
}

export function isInsufficientXpError(error: unknown): error is InsufficientXpError {
  return error instanceof InsufficientXpError;
}

export function parseInsufficientXpResponse(
  status: number,
  data: unknown
): InsufficientXpError | null {
  if (status !== 402 || !data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (typeof body.error !== "string") return null;
  return new InsufficientXpError({
    message: body.error,
    xpBalance: typeof body.xp_balance === "number" ? body.xp_balance : 0,
    xpCost: typeof body.xp_cost === "number" ? body.xp_cost : 0,
    actionType: typeof body.action_type === "string" ? body.action_type : "unknown",
  });
}

export function formatInsufficientXpMessage(error: InsufficientXpError): string {
  return `${error.message} (need ${error.xpCost} XP, you have ${error.xpBalance})`;
}
