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

// Create a wallet-specific API service instance with the correct base URL
const WALLET_API_BASE_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || 'https://senseifi-backend.onrender.com/api';
const walletApiService = new ApiService(WALLET_API_BASE_URL);

export class WalletService {
  async connectWallet(
    address: string,
    chainId: number,
    walletType: 'metamask' | 'coinbase'
  ): Promise<WalletResponse> {
    const response = await walletApiService.post<{ success: boolean; data: WalletResponse }>(
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

    return response.data;
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
