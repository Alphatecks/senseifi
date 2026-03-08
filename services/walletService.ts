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
