export interface DashboardSecurityStatus {
  score: number;
  status: string;
  message: string;
  last_scan_at: string | null;
}

export interface DashboardSummaryData {
  security_status: DashboardSecurityStatus;
  threats_this_month: number;
  threats_trend_percent: number;
  scans_this_month: number;
  scans_trend_percent: number;
  total_asset_usd: string;
  total_asset_trend_percent: number;
  unread_alerts: number;
  high_risk_alerts: number;
  alerts_trend_percent: number;
  issues_this_month: number;
}

const DASHBOARD_API_BASE_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || 'https://senseifi-backend.onrender.com/api';

export interface ScanObservation {
  observation_type: string;
  title: string;
  description: string;
  severity: string;
  detail?: Record<string, unknown>;
}

export interface RunFullScanData {
  scan_id: string;
  wallet_id: string;
  score: number;
  status: string;
  scanned_at: string;
  observations: ScanObservation[];
}

export interface WalletAsset {
  id: string;
  wallet_id: string;
  symbol: string;
  name: string;
  balance: string;
  usd_value: number;
  change_percent: number;
  created_at: string;
  updated_at: string;
}

async function dashboardFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const url = `${DASHBOARD_API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
    ...options,
  });
  const data = res.ok ? await res.json().catch(() => null) : null;
  return { ok: res.ok, status: res.status, data };
}

export async function getDashboardSummary(address: string): Promise<DashboardSummaryData | null> {
  if (!address) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: DashboardSummaryData }>(
    `/dashboard/${encodeURIComponent(address)}/summary`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  console.log('[Dashboard API] Summary response:', data);
  return data.data;
}

export interface UnreadAlertItem {
  id: string;
  wallet_id: string;
  threat_id: string | null;
  severity: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface UnreadAlertsData {
  wallet_address: string;
  wallet_type: string;
  alerts: UnreadAlertItem[];
}

export interface ThreatIntelligenceItem {
  title: string;
  description: string;
  severity: string;
}

export async function getThreatIntelligence(): Promise<ThreatIntelligenceItem[] | null> {
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ThreatIntelligenceItem[] }>(
    '/dashboard/threat-intelligence'
  );
  if (status === 404) return null;
  if (!ok || !data?.success || !Array.isArray(data.data)) return null;
  return data.data;
}

// --- Security Overview (Threat Intelligence) ---
export interface SecurityOverviewData {
  overall_risk: { risk_score: number; risk_level: string };
  active_threats: { networks_affected: number; count: number };
  scam_pattern_insights: {
    period: string;
    daily: Array<{ day: string; count: number }>;
  };
  scam_patterns: { status: string; detected_count: number };
  reported_threats: { verified: number; detected: number };
  live_scam_signals: Array<{
    address: string;
    threat_type: string;
    detected_at: string;
    risk_level: string;
  }>;
  ai_threat_explanation?: {
    description: string;
    risk_level: string;
    view_summary_available: boolean;
    reasons: string[];
    signals: string[];
  };
}

export async function getSecurityOverview(walletAddress: string): Promise<SecurityOverviewData | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({ wallet_address: walletAddress.trim() });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: SecurityOverviewData }>(
    `/dashboard/security-overview?${params}`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: SecurityOverviewData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

export async function getUnreadAlerts(address: string, limit: number = 20): Promise<UnreadAlertsData | null> {
  if (!address) return null;
  const params = new URLSearchParams({ limit: String(limit) });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: UnreadAlertsData }>(
    `/dashboard/${encodeURIComponent(address)}/alerts/unread?${params}`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return data.data;
}

export async function runFullScan(address: string): Promise<RunFullScanData | null> {
  if (!address) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: RunFullScanData }>(
    `/dashboard/${encodeURIComponent(address)}/scan`,
    { method: 'POST', body: '{}' }
  );
  if (status === 404) return null;
  if (!ok || !data?.success || !data.data) return null;
  console.log('[Dashboard API] Run full scan response:', data);
  return data.data;
}

export async function getWalletAssets(address: string): Promise<WalletAsset[] | null> {
  if (!address) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: WalletAsset[] }>(
    `/dashboard/${encodeURIComponent(address)}/assets`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return data.data ?? null;
}

/** Moralis → DB token sync per chain (POST /dashboard/:address/assets/sync). */
export interface IndexedTokenSyncChainOutcome {
  chain_id: number;
  status: string;
  tokens_upserted: number;
  detail?: string;
}

export interface WalletAssetsSyncData {
  chains: IndexedTokenSyncChainOutcome[];
}

export async function syncWalletAssets(
  address: string
): Promise<{ ok: true; data: WalletAssetsSyncData } | { ok: false; message: string }> {
  if (!address) return { ok: false, message: "Connect a wallet first." };
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data?: WalletAssetsSyncData }>(
    `/dashboard/${encodeURIComponent(address)}/assets/sync`,
    { method: "POST", body: "{}" }
  );
  if (status === 404) return { ok: false, message: "Sync endpoint not found." };
  if (!ok || !data?.success || !data.data?.chains) {
    return { ok: false, message: "Token sync failed. Try again." };
  }
  return { ok: true, data: data.data };
}

export interface DashboardActivity {
  id?: string;
  activity_type: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export async function getDashboardActivity(address: string): Promise<DashboardActivity[] | null> {
  if (!address) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: DashboardActivity[] }>(
    `/dashboard/${encodeURIComponent(address)}/activity`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return Array.isArray(data.data) ? data.data : null;
}

export interface DashboardMetricItem {
  value: number | string;
  change_percent: number;
}

export interface DashboardMetricsData {
  malicious_transaction: DashboardMetricItem;
  phishing_indicators: DashboardMetricItem;
  risky_tokens: DashboardMetricItem;
  active_threat_level: DashboardMetricItem;
}

export async function getDashboardMetrics(address: string): Promise<DashboardMetricsData | null> {
  if (!address) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: DashboardMetricsData }>(
    `/dashboard/${encodeURIComponent(address)}/metrics`
  );
  if (status === 404) return null;
  if (!ok || !data?.success || !data.data) return null;
  return data.data;
}

export interface DashboardApproval {
  id: string;
  wallet_id: string;
  contract_address: string;
  approval_type: string;
  risk_level: string;
  detected_at: string;
  created_at: string;
}

export async function getDashboardApprovals(address: string, period: string = "this_month"): Promise<DashboardApproval[] | null> {
  if (!address) return null;
  const params = new URLSearchParams({ period });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: DashboardApproval[] }>(
    `/dashboard/${encodeURIComponent(address)}/approvals?${params}`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return Array.isArray(data.data) ? data.data : null;
}

export interface WalletListItem {
  id: string;
  address: string;
  provider: string;
  currency: string;
  connected_at: string;
  /** Optional logo URL from the API (e.g. MetaMask, exchange logo). */
  logo_url?: string | null;
}

export interface WalletsPagination {
  page: number;
  per_page: number;
  total: number;
}

export async function getWalletsForAddress(forAddress: string): Promise<{ data: WalletListItem[]; pagination: WalletsPagination } | null> {
  if (!forAddress) return null;
  const params = new URLSearchParams({ for_address: forAddress });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: WalletListItem[]; pagination: WalletsPagination }>(
    `/wallets?${params}`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return { data: Array.isArray(data.data) ? data.data : [], pagination: data.pagination ?? { page: 1, per_page: 1, total: 0 } };
}

export interface TransactionMonitoringItem {
  id: string;
  wallet_id: string;
  title: string;
  risk_level: string;
  detected_at: string;
  created_at: string;
}

export async function getTransactionMonitoring(address: string, page: number = 1, perPage: number = 10): Promise<{ data: TransactionMonitoringItem[]; pagination: WalletsPagination } | null> {
  if (!address) return null;
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: TransactionMonitoringItem[]; pagination: WalletsPagination }>(
    `/dashboard/${encodeURIComponent(address)}/transaction-monitoring?${params}`
  );
  if (status === 404) return null;
  if (!ok || !data?.success) return null;
  return { data: Array.isArray(data.data) ? data.data : [], pagination: data.pagination ?? { page: 1, per_page: perPage, total: 0 } };
}

// --- Risky Tokens ---
export interface RiskyTokenItem {
  id: string;
  wallet_id: string;
  severity: string;
  title: string;
  source_contract: string;
  detected_at: string;
  created_at: string;
  threat_type: string;
  surface: string;
  explanation: string | null;
  risk_breakdown: Record<string, unknown> | null;
}

export async function getRiskyTokens(walletAddress: string, limit: number = 20): Promise<RiskyTokenItem[]> {
  if (!walletAddress?.trim()) return [];
  const params = new URLSearchParams({ limit: String(limit) });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: RiskyTokenItem[] }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/risky-tokens?${params}`
  );
  if (!ok || !data) return [];
  const parsed = data as { success?: boolean; data?: RiskyTokenItem[] } | null;
  const list = parsed?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}

// --- Analyze Transaction (Protection) ---

export interface AnalyzeTransactionRequest {
  wallet_address: string;
  to: string;
  value: string;
  data: string;
  chain_id: number;
}

export interface AnalyzeTransactionResponse {
  skipped: boolean;
  risk_score: number;
  band: string;
  threat_types: string[] | null;
  explanation: string;
  recommendation: string;
  risk_breakdown: {
    approval_risk: number;
    simulation_drain: number;
  };
}

export async function analyzeTransaction(body: AnalyzeTransactionRequest): Promise<AnalyzeTransactionResponse | null> {
  const { ok, data } = await dashboardFetch<AnalyzeTransactionResponse>(
    '/protection/transaction/analyze',
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!ok || !data) return null;
  return data;
}

// --- Scan Contract (Smart Wallet Scanner) ---

export interface ScanContractDetails {
  simulation?: {
    drains_full_balance?: boolean;
    hidden_internal_calls?: number;
    approval_scope?: string;
    dangerous_functions?: string[];
  };
  owner_privileges?: {
    mint?: boolean;
    pause?: boolean;
    upgradeable?: boolean;
    withdraw_liquidity?: boolean;
    blacklist?: boolean;
  };
  reputation?: {
    reported_scam?: boolean;
    community_flags?: number;
    verified_source?: boolean;
  };
  trend?: {
    scans_today?: number;
    wallets_affected?: number;
    risk_trend?: string;
  };
  risk_breakdown?: {
    simulation?: number;
    owner_privileges?: number;
    reputation?: number;
    anomaly?: number;
    token_control_scope?: number;
    contract_age?: number;
  };
  user_anomaly_score?: number;
  rug_pull_probability?: string;
  ai_summary?: string;
  abi_source?: string;
}

export interface ScanContractResult {
  scan_id: string;
  contract_address: string;
  trust_score: number;
  critical_risk_flags: number;
  token_controlled: string;
  owner_admin_count: number;
  scanned_at: string;
  details?: ScanContractDetails;
  ai_summary?: string;
}

export async function scanContract(contractAddress: string, forAddress?: string | null, chainId: number = 1): Promise<ScanContractResult | null> {
  if (!contractAddress?.trim()) return null;
  const body: { contract_address: string; for_address?: string; chain_id?: number } = { contract_address: contractAddress.trim(), chain_id: chainId };
  if (forAddress?.trim()) body.for_address = forAddress.trim();
  const { ok, status, data } = await dashboardFetch<ScanContractResult | { success: boolean; data: ScanContractResult }>(
    '/scan-contract',
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!ok) return null;
  const result = data && typeof data === 'object' && 'scan_id' in data ? (data as ScanContractResult) : (data as { data?: ScanContractResult })?.data ?? null;
  return result ?? null;
}

export interface ScanContractDetailResponse {
  id: string;
  contract_address: string;
  trust_score: number;
  critical_risk_flags: number;
  token_controlled: string;
  owner_admin_count: number;
  details?: ScanContractDetails;
  scanned_at: string;
  created_at?: string;
  scanned_for_address?: string | null;
}

export async function getScanContractDetails(scanId: string): Promise<ScanContractDetailResponse | null> {
  if (!scanId?.trim()) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ScanContractDetailResponse }>(
    `/scan-contract/${encodeURIComponent(scanId.trim())}`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ScanContractDetailResponse } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

// --- Risk profile (scan history for wallet) ---
export interface RiskProfileCachedContract {
  contract_address: string;
  trust_score: number;
  critical_risk_flags: number;
  scanned_at: string;
}

export interface RiskProfileData {
  wallet_state_risk: number;
  approval_summary: { total: number };
  cached_contract_risks: RiskProfileCachedContract[];
  last_score: number;
}

export async function getRiskProfile(walletAddress: string): Promise<RiskProfileData | null> {
  if (!walletAddress?.trim()) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: RiskProfileData }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/risk-profile`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: RiskProfileData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

// --- Contract scam pattern, activity, liquidity, community signals ---
export interface ContractScamPatternData {
  honeypot: boolean;
  approval_drain: boolean;
  delayed_rug: boolean;
  fee_escalation: boolean;
  similarity_score_percent: number;
}

export async function getContractScamPattern(contractAddress: string): Promise<ContractScamPatternData | null> {
  if (!contractAddress?.trim()) return null;
  const addr = contractAddress.trim();
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ContractScamPatternData }>(
    `/scan-contract/contract/${encodeURIComponent(addr)}/scam-pattern`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ContractScamPatternData } | null;
  return parsed?.data ?? null;
}

export interface ContractActivityData {
  avg_tx_per_day: number | null;
  largest_tx_usd: number | null;
  abnormal_activity: boolean;
}

export async function getContractActivity(contractAddress: string): Promise<ContractActivityData | null> {
  if (!contractAddress?.trim()) return null;
  const addr = contractAddress.trim();
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ContractActivityData }>(
    `/scan-contract/contract/${encodeURIComponent(addr)}/activity`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ContractActivityData } | null;
  return parsed?.data ?? null;
}

export interface ContractLiquidityData {
  initial_lp_usd: number | null;
  current_lp_usd: number | null;
  sudden_pulls: number | null;
}

export async function getContractLiquidity(contractAddress: string): Promise<ContractLiquidityData | null> {
  if (!contractAddress?.trim()) return null;
  const addr = contractAddress.trim();
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ContractLiquidityData }>(
    `/scan-contract/contract/${encodeURIComponent(addr)}/liquidity`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ContractLiquidityData } | null;
  return parsed?.data ?? null;
}

export interface ContractCommunitySignalsData {
  report_count: number;
  confirmed_exploits: number;
  users_flagged_count: number;
}

export async function getContractCommunitySignals(contractAddress: string): Promise<ContractCommunitySignalsData | null> {
  if (!contractAddress?.trim()) return null;
  const addr = contractAddress.trim();
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ContractCommunitySignalsData }>(
    `/scan-contract/contract/${encodeURIComponent(addr)}/community-signals`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ContractCommunitySignalsData } | null;
  return parsed?.data ?? null;
}

// --- Protection scan history (full wallet scans) ---
export interface ProtectionScanHistoryItem {
  id: string;
  wallet_address: string;
  scan_type: string;
  risk_score: number;
  issues_found: number;
  details: Record<string, unknown>;
  scanned_at: string;
}

export async function getProtectionScanHistory(walletAddress: string, limit: number = 20): Promise<ProtectionScanHistoryItem[]> {
  if (!walletAddress?.trim()) return [];
  const params = new URLSearchParams({ wallet_address: walletAddress.trim(), limit: String(limit) });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: ProtectionScanHistoryItem[] }>(
    `/protection/scan-history?${params}`
  );
  if (!ok || !data) return [];
  const parsed = data as { success?: boolean; data?: ProtectionScanHistoryItem[] } | null;
  const list = parsed?.data ?? [];
  return Array.isArray(list) ? list : [];
}

// --- Protection settings ---

export interface ProtectionSettingsData {
  wallet_address: string;
  auto_security_scan: boolean;
  high_risk_tx_warnings: boolean;
  new_approval_alerts: boolean;
  new_dapp_connection_alerts: boolean;
  auto_block_high_risk: boolean;
  updated_at: string;
  emergency_lock?: boolean;
}

const PROTECTION_ID_TO_API_KEY: Record<string, keyof Omit<ProtectionSettingsData, 'wallet_address' | 'updated_at'>> = {
  'auto-scan': 'auto_security_scan',
  'high-risk': 'high_risk_tx_warnings',
  'approval': 'new_approval_alerts',
  'dapp': 'new_dapp_connection_alerts',
  'auto-block-contract': 'auto_block_high_risk',
};

const PROTECTION_LABELS: Record<string, string> = {
  'auto-scan': 'Auto Security Scan',
  'high-risk': 'High-Risk Tx Warnings',
  'approval': 'New Approval Alerts',
  'dapp': 'New dApp Connection Alerts',
  'auto-block-contract': 'Auto block malicious smart contract',
  'emergency-lock': 'Emergency lock (firewall)',
};

export function protectionSettingsToControls(data: ProtectionSettingsData | null): Array<{ id: string; label: string; on: boolean }> {
  const base = (Object.entries(PROTECTION_ID_TO_API_KEY) as Array<[string, keyof ProtectionSettingsData]>).map(([id, key]) => ({
    id,
    label: PROTECTION_LABELS[id] ?? id,
    on: data ? Boolean(data[key]) : true,
  }));
  const emergencyOn = data?.emergency_lock ?? false;
  return [...base, { id: 'emergency-lock', label: PROTECTION_LABELS['emergency-lock'], on: emergencyOn }];
}

export async function getProtectionSettings(walletAddress: string): Promise<ProtectionSettingsData | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({ wallet_address: walletAddress.trim() });
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ProtectionSettingsData }>(
    `/protection/settings?${params}`
  );
  if (status === 404 || !ok) return null;
  const parsed = data as { success?: boolean; data?: ProtectionSettingsData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

export async function updateProtectionSettings(
  walletAddress: string,
  payload: Partial<Omit<ProtectionSettingsData, 'wallet_address' | 'updated_at'>>
): Promise<ProtectionSettingsData | null> {
  if (!walletAddress?.trim()) return null;
  const { ok, status, data } = await dashboardFetch<{ success: boolean; data: ProtectionSettingsData }>(
    '/protection/settings',
    { method: 'PUT', body: JSON.stringify({ wallet_address: walletAddress.trim(), ...payload }) }
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: ProtectionSettingsData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

export interface EmergencyLockData {
  wallet_address: string;
  emergency_lock: boolean;
  whitelisted_addresses: string[];
}

export async function setEmergencyLock(
  walletAddress: string,
  lock: boolean,
  whitelistedAddresses: string[] = []
): Promise<EmergencyLockData | null> {
  if (!walletAddress?.trim()) return null;
  const body = { wallet_address: walletAddress.trim(), lock, whitelisted_addresses: whitelistedAddresses };
  const { ok, data } = await dashboardFetch<{ success: boolean; data: EmergencyLockData }>(
    '/protection/emergency-lock',
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: EmergencyLockData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

// --- Security Alerts (protection) ---

export type SecurityAlertItem =
  | {
      id: string;
      type: 'high_risk_approval';
      title: string;
      contract: string;
      contract_truncated: string;
      token_address: string;
      risk_score: number;
      created_at: string;
    }
  | {
      id: string;
      type: 'alert';
      title: string;
      severity: string;
      body: string;
      created_at: string;
    };

export async function getSecurityAlerts(
  walletAddress: string,
  limit: number = 10
): Promise<SecurityAlertItem[] | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({
    wallet_address: walletAddress.trim(),
    limit: String(limit),
  });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: SecurityAlertItem[] }>(
    `/protection/security-alerts?${params}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: SecurityAlertItem[] } | null;
  if (parsed?.success && Array.isArray(parsed.data)) return parsed.data;
  return null;
}

// --- Address Safety (protection) ---

export interface AddressSafetyItem {
  address: string;
  address_truncated: string;
  safety_score: number;
  risk_level: string;
}

export async function getAddressSafety(walletAddress: string): Promise<AddressSafetyItem[] | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({ wallet_address: walletAddress.trim() });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: AddressSafetyItem[] }>(
    `/protection/address-safety?${params}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: AddressSafetyItem[] } | null;
  if (parsed?.success && Array.isArray(parsed.data)) return parsed.data;
  return null;
}

// --- Approval ingest (feeds Security Alerts) ---

export interface ApprovalIngestPayload {
  wallet_address: string;
  spender_address: string;
  token_address: string;
  amount_raw: string;
}

export interface ApprovalIngestResponse {
  success: boolean;
  risk_score: number;
  should_alert: boolean;
  warning: string | null;
}

export async function ingestApproval(payload: ApprovalIngestPayload): Promise<ApprovalIngestResponse | null> {
  if (!payload.wallet_address?.trim() || !payload.spender_address?.trim()) return null;
  const { ok, data } = await dashboardFetch<ApprovalIngestResponse>(
    '/protection/approvals/ingest',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  if (!ok) return null;
  const parsed = data as ApprovalIngestResponse | null;
  if (parsed?.success !== undefined) return parsed;
  return null;
}

// --- Dashboard overview (activity monitor) ---

export interface DashboardOverviewWalletStatus {
  active_wallet_count: number;
  status: string;
  last_scan_at: string;
}

export interface DashboardOverviewActiveAlerts {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface DashboardOverviewTimelineItem {
  id: string;
  wallet_id: string;
  wallet_address: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardOverviewRecentActivity {
  transactions_24h: number;
  contract_calls_24h: number;
  suspicious_events_24h: number;
}

export interface DashboardOverviewConnectedRisk {
  total_risk_items: number;
  high_risk_connections: number;
  active_dapps: number;
}

export interface DashboardOverviewData {
  wallet_status: DashboardOverviewWalletStatus;
  active_alerts: DashboardOverviewActiveAlerts;
  activity_timeline: DashboardOverviewTimelineItem[];
  recent_activity: DashboardOverviewRecentActivity;
  connected_risk: DashboardOverviewConnectedRisk;
}

export async function getDashboardOverview(timelineLimit: number = 20): Promise<DashboardOverviewData | null> {
  const limit = Math.min(100, Math.max(1, timelineLimit));
  const params = new URLSearchParams({ timeline_limit: String(limit) });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: DashboardOverviewData }>(
    `/dashboard/overview?${params}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: DashboardOverviewData } | null;
  if (parsed?.success && parsed.data) return parsed.data;
  return null;
}

// --- Activity monitor: connected wallets & dApps ---

export interface ActivityMonitorWalletItem {
  address: string;
  wallet_type_display: string;
  chain_id: number;
  chain_name: string;
  status: string;
  security_level: string;
  last_activity: string;
}

export interface ActivityMonitorDappItem {
  dapp_name: string;
  description: string;
  tokens: string;
  status: string;
  connected_wallet_address: string;
  last_activity: string;
}

export async function getActivityMonitorWallets(params?: { user_id?: string; wallet_address?: string }): Promise<ActivityMonitorWalletItem[] | null> {
  const search = new URLSearchParams();
  if (params?.user_id?.trim()) search.set('user_id', params.user_id.trim());
  if (params?.wallet_address?.trim()) search.set('wallet_address', params.wallet_address.trim());
  const qs = search.toString();
  const { ok, data } = await dashboardFetch<{ success: boolean; data: ActivityMonitorWalletItem[] }>(
    `/dashboard/activity-monitor/wallets${qs ? `?${qs}` : ''}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: ActivityMonitorWalletItem[] } | null;
  if (parsed?.success && Array.isArray(parsed.data)) return parsed.data;
  return null;
}

export async function getActivityMonitorDapps(params?: { user_id?: string; wallet_address?: string }): Promise<ActivityMonitorDappItem[] | null> {
  const search = new URLSearchParams();
  if (params?.user_id?.trim()) search.set('user_id', params.user_id.trim());
  if (params?.wallet_address?.trim()) search.set('wallet_address', params.wallet_address.trim());
  const qs = search.toString();
  const { ok, data } = await dashboardFetch<{ success: boolean; data: ActivityMonitorDappItem[] }>(
    `/dashboard/activity-monitor/dapps${qs ? `?${qs}` : ''}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: ActivityMonitorDappItem[] } | null;
  if (parsed?.success && Array.isArray(parsed.data)) return parsed.data;
  return null;
}

// --- Activity feed (live activity feed) ---

export interface ActivityFeedItem {
  id: string;
  time: string;
  wallet: string;
  wallet_address: string;
  type: string;
  asset: string;
  amount: string;
  counterparty: string;
  risk_level: string;
  status: string;
  title: string;
  description: string | null;
}

export interface ActivityFeedPagination {
  page: number;
  per_page: number;
  total: number;
}

export async function getActivityFeed(
  userId: string,
  page: number = 1,
  perPage: number = 10
): Promise<{ data: ActivityFeedItem[]; pagination: ActivityFeedPagination } | null> {
  if (!userId?.trim()) return null;
  const params = new URLSearchParams({
    user_id: userId.trim(),
    page: String(Math.max(1, page)),
    per_page: String(Math.min(100, Math.max(1, perPage))),
  });
  const { ok, data } = await dashboardFetch<{ success: boolean; data: ActivityFeedItem[]; pagination: ActivityFeedPagination }>(
    `/dashboard/activity/feed?${params}`
  );
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: ActivityFeedItem[]; pagination?: ActivityFeedPagination } | null;
  if (parsed?.success && Array.isArray(parsed.data)) {
    return { data: parsed.data, pagination: parsed.pagination ?? { page: 1, per_page: perPage, total: 0 } };
  }
  return null;
}
