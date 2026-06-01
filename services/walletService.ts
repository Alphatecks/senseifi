import { ApiService } from './index';

export interface ConnectWalletRequest {
  address: string;
  chain_id: number;
  wallet_type: 'metamask' | 'coinbase';
}

export interface WalletStatusResponse {
  address: string;
  chain_id: number;
  is_active: boolean;
  monitoring_status: string;
  connected_at: string;
}

export interface WalletResponse {
  id: string;
  address: string;
  chain_id: number;
  wallet_type: string;
  connected_at: string;
  is_active: boolean;
}

export interface DashboardUser {
  user_id: string;
  display_name: string;
  user_number: number;
  user_label: string;
}

export interface ConnectWalletResponse {
  success: boolean;
  data: WalletResponse;
  dashboard_user: DashboardUser;
}

export interface ClaimWaitlistXpResult {
  xp: number;
  successfulReferrals: number;
  message?: string;
}

export interface WaitlistClaimData {
  user_id: string;
  wallet_address: string;
  email: string;
  waitlist_entry_id: number;
  direct_referrals: number;
  successfulCount: number;
  level2_referrals: number;
  level2Count: number;
  xp: number;
  claimed_at: string;
}

export interface WaitlistStatusResponse {
  success: boolean;
  claimed: boolean;
  data: WaitlistClaimData | null;
}

function isAlreadyClaimedMessage(message: string): boolean {
  return /already claimed/i.test(message);
}

export interface WalletModalDetails {
  provider: string;
  wallet_address: string;
  network: string;
  connected_at: string;
  wallet_type: string;
  connected_via: string;
  security_status: string;
}

export interface WalletModalAsset {
  symbol: string;
  name: string;
  balance: string;
  usd_value: number;
  change_percent: number;
}

export interface WalletModalBalance {
  total_usd: number;
  native_balance_eth: number;
  native_balance_wei: string;
  assets: WalletModalAsset[];
}

export interface WalletModalSecurity {
  two_fa: string | null;
  active_approvals: number;
  last_scan_at: string;
  last_scan_ago: string;
  threat_level: string;
  risk_exposure_percent: number;
}

export interface WalletModalActivityItem {
  id: string;
  wallet_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface WalletModalData {
  details: WalletModalDetails;
  balance: WalletModalBalance;
  security: WalletModalSecurity;
  activity: WalletModalActivityItem[];
}

// Create a wallet-specific API service instance with the correct base URL
const WALLET_API_BASE_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || 'https://senseifi-backend.onrender.com/api';
const walletApiService = new ApiService(WALLET_API_BASE_URL);

export class WalletService {
  async connectWallet(
    address: string,
    chainId: number,
    walletType: 'metamask' | 'coinbase'
  ): Promise<{ data: WalletResponse; dashboard_user: DashboardUser }> {
    const response = await walletApiService.post<ConnectWalletResponse>(
      '/wallets/connect',
      {
        address,
        chain_id: chainId,
        wallet_type: walletType,
      }
    );

    if (!response.success) {
      throw new Error('Failed to connect wallet');
    }

    return { data: response.data, dashboard_user: response.dashboard_user };
  }

  async claimWaitlistXp(email: string, walletAddress: string): Promise<ClaimWaitlistXpResult> {
    const response = await fetch(`${WALLET_API_BASE_URL}/waitlist/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        wallet_address: walletAddress.trim(),
      }),
    });

    const json = await response.json().catch(() => ({} as Record<string, unknown>));
    console.log("[Claim XP] API response", {
      status: response.status,
      statusText: response.statusText,
      data: json,
    });
    if (!response.ok) {
      const message =
        (typeof json.message === 'string' && json.message) ||
        (typeof json.error === 'string' && json.error) ||
        'Failed to claim XP. Check your waitlist email and try again.';
      throw new Error(message);
    }

    const payload = (json.data ?? json) as Record<string, unknown>;
    const message =
      (typeof json.message === 'string' && json.message) ||
      (typeof payload.message === 'string' && (payload.message as string)) ||
      undefined;

    if (message && isAlreadyClaimedMessage(message)) {
      throw new Error(message);
    }

    const xp =
      typeof payload.xp === 'number'
        ? payload.xp
        : typeof json.xp === 'number'
          ? json.xp
          : 0;
    const successfulReferrals =
      typeof payload.successfulCount === 'number'
        ? payload.successfulCount
        : typeof payload.successful_referrals === 'number'
          ? payload.successful_referrals
          : typeof payload.direct_referrals === 'number'
            ? payload.direct_referrals
            : typeof payload.successful_count === 'number'
              ? payload.successful_count
              : typeof json.successfulReferrals === 'number'
                ? json.successfulReferrals
                : 0;

    return {
      xp,
      successfulReferrals,
      message,
    };
  }

  async getWaitlistStatus(
    walletAddress?: string,
    userId?: string
  ): Promise<WaitlistStatusResponse> {
    const params = new URLSearchParams();
    if (walletAddress?.trim()) {
      params.set('wallet_address', walletAddress.trim());
    } else if (userId?.trim()) {
      params.set('user_id', userId.trim());
    } else {
      throw new Error('wallet_address or user_id is required');
    }

    const response = await fetch(`${WALLET_API_BASE_URL}/waitlist/status?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const json = (await response.json().catch(() => ({}))) as WaitlistStatusResponse & {
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      const message =
        (typeof json.message === 'string' && json.message) ||
        (typeof json.error === 'string' && json.error) ||
        'Failed to load waitlist status.';
      throw new Error(message);
    }

    return {
      success: Boolean(json.success),
      claimed: Boolean(json.claimed),
      data: json.data ?? null,
    };
  }

  async getWalletStatus(address: string): Promise<WalletStatusResponse> {
    const response = await walletApiService.get<{ success: boolean; data: WalletStatusResponse }>(
      `/wallets/${address}/status`
    );

    if (!response.success) {
      throw new Error('Failed to get wallet status');
    }

    return response.data;
  }

  async getWallet(address: string): Promise<WalletResponse> {
    const response = await walletApiService.get<{ success: boolean; data: WalletResponse }>(
      `/wallets/${address}`
    );

    if (!response.success) {
      throw new Error('Failed to get wallet');
    }

    return response.data;
  }

  /** Wallet modal: details, balance, security, activity for Connected Wallet modal */
  async getWalletModal(walletAddress: string): Promise<WalletModalData | null> {
    if (!walletAddress?.trim()) return null;
    const encoded = encodeURIComponent(walletAddress.trim());
    const response = await walletApiService.get<{ success: boolean; data: WalletModalData }>(
      `/wallets/${encoded}/modal`
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async disconnectWallet(address: string): Promise<void> {
    const url = `${WALLET_API_BASE_URL}/wallets/${address}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle both JSON and empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return; // Success with no content
      }

      // Try to parse JSON if there's content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        await response.json();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
