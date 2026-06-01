import { parseInsufficientXpResponse } from './xpTypes';

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
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
      ...options,
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('[Dashboard API] Network error:', {
      endpoint,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: 0, data: null };
  }
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

export interface ExtensionOverviewData {
  scans_this_month?: number;
  scans_trend_percent?: number;
  unread_alerts?: number;
  alerts_trend_percent?: number;
  high_risk_alerts?: number;
}

export interface ExtensionTradeInsightsFilters {
  wallet_address: string;
  page?: number;
  per_page?: number;
  period?: string;
  risk_level?: string;
  search?: string;
}

export interface ExtensionTradeInsightItem {
  title?: string;
  type?: string;
  action?: string;
  event?: string;
  id?: string;
  tx_id?: string;
  tx_hash?: string;
  transaction_hash?: string;
  wallet?: string;
  wallet_address?: string;
  status?: string;
  risk_level?: string;
  risk_band?: string;
  severity?: string;
  risk_score?: number;
  riskScore?: number;
  score?: number;
  time?: string;
  detected_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExtensionTradeInsightsWrapped {
  items?: ExtensionTradeInsightItem[];
  rows?: ExtensionTradeInsightItem[];
  results?: ExtensionTradeInsightItem[];
}

export async function getExtensionOverview(walletAddress: string): Promise<ExtensionOverviewData | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({ wallet_address: walletAddress.trim() });
  const { ok, status, data } = await dashboardFetch<{
    success?: boolean;
    data?: ExtensionOverviewData;
  }>(`/dashboard/extension/overview?${params.toString()}`);
  if (status === 404 || !ok || !data) return null;
  const wrapped = data as { success?: boolean; data?: ExtensionOverviewData };
  if (wrapped.success && wrapped.data) return wrapped.data;
  if (wrapped.data) return wrapped.data;
  return data as ExtensionOverviewData;
}

export async function getExtensionTradeInsights(
  filters: ExtensionTradeInsightsFilters
): Promise<ExtensionTradeInsightItem[]> {
  if (!filters.wallet_address?.trim()) return [];
  const params = new URLSearchParams({
    wallet_address: filters.wallet_address.trim(),
    page: String(filters.page ?? 1),
    per_page: String(filters.per_page ?? 10),
  });
  if (filters.period?.trim()) params.set("period", filters.period.trim());
  if (filters.risk_level?.trim()) params.set("risk_level", filters.risk_level.trim());
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  const { ok, status, data } = await dashboardFetch<
    | { success?: boolean; data?: ExtensionTradeInsightItem[] | ExtensionTradeInsightsWrapped }
    | ExtensionTradeInsightItem[]
    | ExtensionTradeInsightsWrapped
  >(`/dashboard/extension/trade-insights?${params.toString()}`);
  if (status === 404 || !ok || !data) return [];

  if (Array.isArray(data)) return data as ExtensionTradeInsightItem[];

  const wrapped = data as {
    success?: boolean;
    data?: ExtensionTradeInsightItem[] | ExtensionTradeInsightsWrapped;
  };
  const payload = wrapped.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidate = payload as ExtensionTradeInsightsWrapped;
  if (Array.isArray(candidate.items)) return candidate.items;
  if (Array.isArray(candidate.rows)) return candidate.rows;
  if (Array.isArray(candidate.results)) return candidate.results;
  return [];
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

// --- Domain threat feed (threat intelligence) ---
export interface DomainThreatFeedSources {
  from_activity_feed: number;
  from_env_blocklist: number;
  static_trusted: number;
}

export interface DomainThreatFeedData {
  malicious_domains: string[];
  trusted_domains: string[];
  sources: DomainThreatFeedSources;
  updated_at: string;
}

export async function getDomainThreatFeed(): Promise<DomainThreatFeedData | null> {
  const { ok, status, data } = await dashboardFetch<DomainThreatFeedData>(
    '/protection/domain-threat-feed'
  );
  if (status === 404 || !ok || !data) return null;
  return data;
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
    id?: string;
    signal_id?: string;
    threat_id?: string;
    uuid?: string;
    address: string;
    threat_type: string;
    detected_at: string;
    risk_level: string;
    [key: string]: unknown;
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

export interface LiveScamSignalSummary {
  id?: string;
  signal_id?: string;
  threat_id?: string;
  uuid?: string;
  address: string;
  threat_type: string;
  detected_at: string;
  risk_level: string;
  [key: string]: unknown;
}

export async function getLiveScamSignalsSummary(
  walletAddress?: string,
  limit: number = 50
): Promise<LiveScamSignalSummary[]> {
  const params = new URLSearchParams({ limit: String(Math.min(100, Math.max(1, limit))) });
  if (walletAddress?.trim()) {
    params.set('wallet_address', walletAddress.trim());
  }
  const endpoint = `/dashboard/live-scam-signals/summary?${params}`;
  const url = `${DASHBOARD_API_BASE_URL}${endpoint}`;
  console.log('[Dashboard API] Live scam signals summary — request:', {
    walletAddress: walletAddress?.trim() || null,
    limit,
    method: 'GET',
    url,
    endpoint,
  });
  const { ok, status, data } = await dashboardFetch<{ success?: boolean; data?: LiveScamSignalSummary[] }>(
    endpoint
  );
  console.log('[Dashboard API] Live scam signals summary — response:', { ok, status, data, endpoint });
  if (!data) return [];
  const parsed = data as { success?: boolean; data?: LiveScamSignalSummary[] };
  if (Array.isArray(parsed.data)) return parsed.data;
  if (Array.isArray(data)) return data as LiveScamSignalSummary[];
  return [];
}

export interface LiveScamSignalDetailsData {
  id?: string;
  signal_id?: string;
  wallet_address?: string;
  title?: string;
  description?: string;
  threat_type?: string;
  risk_level?: string;
  recommendation?: string;
  detected_at?: string;
  [key: string]: unknown;
}

export async function getLiveScamSignalDetails(
  signalId: string,
  walletAddress?: string
): Promise<LiveScamSignalDetailsData | null> {
  if (!signalId?.trim()) return null;
  const endpoint = walletAddress?.trim()
    ? `/dashboard/live-scam-signals/${encodeURIComponent(signalId.trim())}?${new URLSearchParams({ wallet_address: walletAddress.trim() })}`
    : `/dashboard/live-scam-signals/${encodeURIComponent(signalId.trim())}`;
  const url = `${DASHBOARD_API_BASE_URL}${endpoint}`;
  console.log('[Dashboard API] Live scam signal details — request:', {
    signalId: signalId.trim(),
    walletAddress: walletAddress?.trim() || null,
    method: 'GET',
    url,
    endpoint,
  });
  const { ok, status, data } = await dashboardFetch<{ success?: boolean; data?: LiveScamSignalDetailsData } | LiveScamSignalDetailsData>(
    endpoint
  );
  console.log('[Dashboard API] Live scam signal details — response:', { ok, status, data, endpoint });
  if (!data) return null;
  const wrapped = data as { success?: boolean; data?: LiveScamSignalDetailsData };
  if (wrapped.success && wrapped.data) return wrapped.data;
  if (wrapped.success === false) return null;
  return data as LiveScamSignalDetailsData;
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

// --- Threat correlation (shared across protection + dashboard APIs) ---

export interface ThreatCorrelation {
  campaign_id: string;
  campaign_type: string;
  confidence_score: number;
  risk_score: number;
  narrative: string;
  evidence_count: number;
  last_seen_at: string;
}

export interface ThreatCampaign {
  id: string;
  wallet_address: string;
  campaign_type: string;
  status: string;
  confidence_score: number;
  risk_score: number;
  narrative: string;
  signal_categories: string[];
  evidence_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export async function getThreatCampaigns(walletAddress?: string): Promise<ThreatCampaign[]> {
  const params = new URLSearchParams();
  if (walletAddress?.trim()) {
    params.set('wallet_address', walletAddress.trim());
  }
  const qs = params.toString();
  const endpoint = `/dashboard/threat-campaigns${qs ? `?${qs}` : ''}`;
  const { ok, status, data } = await dashboardFetch<{ success?: boolean; data?: ThreatCampaign[] }>(endpoint);
  console.log('[Dashboard API] Threat campaigns response:', { ok, status, data, endpoint });
  if (!data) return [];
  const parsed = data as { success?: boolean; data?: ThreatCampaign[] };
  if (Array.isArray(parsed.data)) return parsed.data;
  if (Array.isArray(data)) return data as ThreatCampaign[];
  return [];
}

// --- Analyze Transaction (Protection / Dashboard) ---

export interface AnalyzeTransactionRequest {
  wallet_address: string;
  to: string;
  value: string;
  data: string;
  chain_id: number;
}

export interface AnalyzeTransactionRiskBreakdown {
  approval_risk: number;
  delegatecall_risk?: number;
  destination_risk?: number;
  value_exposure_risk?: number;
  simulation_drain: number;
}

export interface AnalyzeTransactionResponse {
  skipped: boolean;
  risk_score: number;
  band: string;
  threat_types: string[] | null;
  explanation: string;
  recommendation: string;
  warning?: string;
  recommended_action?: string;
  risk_breakdown: AnalyzeTransactionRiskBreakdown;
  correlation?: ThreatCorrelation | null;
}

export async function analyzeTransaction(body: AnalyzeTransactionRequest): Promise<AnalyzeTransactionResponse | null> {
  const walletAddress = body.wallet_address?.trim();
  if (!walletAddress) return null;
  const endpoint = `/dashboard/${encodeURIComponent(walletAddress)}/analyze-tx`;
  const { ok, status, data } = await dashboardFetch<AnalyzeTransactionResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      to: body.to,
      value: body.value,
      data: body.data,
      chain_id: body.chain_id,
    }),
  });
  console.log('[Dashboard API] Analyze transaction response:', { ok, status, data, endpoint });
  const xpError = parseInsufficientXpResponse(status, data);
  if (xpError) throw xpError;
  if (!ok || !data) return null;
  return data;
}

export interface DappConnectionCheckRequest {
  wallet_address: string;
  url: string;
}

export async function checkDappConnection(body: DappConnectionCheckRequest): Promise<Record<string, unknown> | null> {
  const walletAddress = body.wallet_address?.trim();
  const url = body.url?.trim();
  if (!walletAddress || !url) return null;
  const { ok, status, data } = await dashboardFetch<Record<string, unknown>>(
    '/protection/dapp/connection-check',
    {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress, url }),
    }
  );
  const xpError = parseInsufficientXpResponse(status, data);
  if (xpError) throw xpError;
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
  const xpError = parseInsufficientXpResponse(status, data);
  if (xpError) throw xpError;
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

function parseScanContractResult(
  data: ScanContractResult | { success?: boolean; data?: ScanContractResult } | null | undefined
): ScanContractResult | null {
  if (!data || typeof data !== "object") return null;
  if ("scan_id" in data && typeof (data as ScanContractResult).scan_id === "string") {
    return data as ScanContractResult;
  }
  const wrapped = data as { success?: boolean; data?: ScanContractResult };
  if (wrapped.success && wrapped.data?.scan_id) return wrapped.data;
  if (wrapped.data?.scan_id) return wrapped.data;
  return null;
}

/** Load the most recent scan for a contract without creating a new scan (when backend supports it). */
export async function getLatestContractScan(
  contractAddress: string,
  forAddress?: string | null
): Promise<ScanContractResult | null> {
  if (!contractAddress?.trim()) return null;
  const params = new URLSearchParams();
  if (forAddress?.trim()) params.set("for_address", forAddress.trim());
  const qs = params.toString() ? `?${params.toString()}` : "";
  const { ok, status, data } = await dashboardFetch<
    ScanContractResult | { success: boolean; data: ScanContractResult }
  >(`/scan-contract/contract/${encodeURIComponent(contractAddress.trim())}${qs}`);
  if (status === 404 || !ok) return null;
  return parseScanContractResult(data);
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
  console.log('[Dashboard API] Security alerts response:', {
    endpoint: `/protection/security-alerts?${params}`,
    ok,
    data,
  });
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: SecurityAlertItem[] } | null;
  if (parsed?.success && Array.isArray(parsed.data)) return parsed.data;
  return null;
}

// --- Threat lifecycle (active / history / resolve / dismiss) ---

export interface WalletThreatItem {
  id: string;
  title: string;
  severity: string;
  threat_type: string;
  surface: string;
  source_contract: string | null;
  detected_at: string;
  status?: string;
  where_to_fix?: string;
  recommended_action?: string;
  fix_steps?: string[];
  resolved_at?: string | null;
  dismissed_at?: string | null;
}

export interface ActiveThreatsMeta {
  count: number;
  high_priority_count?: number;
}

export interface ActiveThreatsResponse {
  data: WalletThreatItem[];
  meta: ActiveThreatsMeta;
}

export interface ThreatHistoryMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ThreatHistoryResponse {
  data: WalletThreatItem[];
  meta: ThreatHistoryMeta;
}

export interface ThreatActionResponse {
  success: boolean;
  data?: WalletThreatItem;
  message?: string;
}

export interface WalletHealthRefreshData {
  security_status: DashboardSecurityStatus;
  open_threats_count?: number;
}

export interface ThreatVerifyResponse {
  success: boolean;
  data?: {
    verified?: boolean;
    resolved?: boolean;
    threat?: WalletThreatItem;
    message?: string;
  };
  message?: string;
}

export interface VerifyAllThreatsResponse {
  success: boolean;
  data?: {
    verified_count?: number;
    resolved_count?: number;
    still_open_count?: number;
    results?: Array<{ threat_id: string; verified: boolean; resolved: boolean }>;
  };
  message?: string;
}

export type ThreatRemediationAction =
  | 'revoke_approval'
  | 'block_contract'
  | 'disconnect_dapp'
  | 'hide_token';

export interface ThreatRemediationPayload {
  action: ThreatRemediationAction;
  metadata: Record<string, unknown>;
}

export interface ThreatRemediationRecordResponse {
  success: boolean;
  data?: WalletThreatItem;
  message?: string;
}

export function inferThreatRemediation(item: WalletThreatItem): ThreatRemediationPayload | null {
  const type = String(item.threat_type || '').toLowerCase();
  const contract = item.source_contract?.trim() || undefined;

  if (type.includes('approval') || type.includes('allowance')) {
    return {
      action: 'revoke_approval',
      metadata: {
        spender_address: contract,
        note: 'Recorded via SenseiGuard dashboard',
        chain_id: 1,
      },
    };
  }
  if (type.includes('contract') || type.includes('malicious') || type.includes('drainer') || type.includes('block')) {
    return {
      action: 'block_contract',
      metadata: {
        contract_address: contract,
        note: 'Recorded via SenseiGuard dashboard',
      },
    };
  }
  if (type.includes('phishing') || type.includes('dapp') || type.includes('domain') || type.includes('connect')) {
    const domain = String(item.surface || item.where_to_fix || '').trim();
    if (!domain) return null;
    return {
      action: 'disconnect_dapp',
      metadata: {
        domain,
        note: 'Recorded via SenseiGuard dashboard',
      },
    };
  }
  if (type.includes('token') || type.includes('scam') || type.includes('rug')) {
    if (!contract) return null;
    return {
      action: 'hide_token',
      metadata: {
        token_address: contract,
        note: 'Recorded via SenseiGuard dashboard',
      },
    };
  }
  return null;
}

export async function verifyThreat(
  walletAddress: string,
  threatId: string
): Promise<ThreatVerifyResponse | null> {
  if (!walletAddress?.trim() || !threatId?.trim()) return null;
  const endpoint = `/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/${encodeURIComponent(threatId.trim())}/verify`;
  const url = `${DASHBOARD_API_BASE_URL}${endpoint}`;
  console.log('[Dashboard API] Verify threat — request:', {
    walletAddress: walletAddress.trim(),
    threatId: threatId.trim(),
    method: 'POST',
    url,
    endpoint,
  });
  const { ok, status, data } = await dashboardFetch<ThreatVerifyResponse>(endpoint, {
    method: 'POST',
    body: '{}',
  });
  console.log('[Dashboard API] Verify threat — response:', { ok, status, data, endpoint });
  if (!data) return null;
  return data;
}

export async function verifyAllThreats(
  walletAddress: string
): Promise<VerifyAllThreatsResponse | null> {
  if (!walletAddress?.trim()) return null;
  const { ok, data } = await dashboardFetch<VerifyAllThreatsResponse>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/verify-all`,
    { method: 'POST', body: '{}' }
  );
  if (!ok || !data) return null;
  return data;
}

export async function recordThreatRemediationAction(
  walletAddress: string,
  threatId: string,
  payload: ThreatRemediationPayload
): Promise<ThreatRemediationRecordResponse | null> {
  if (!walletAddress?.trim() || !threatId?.trim()) return null;
  const { ok, data } = await dashboardFetch<ThreatRemediationRecordResponse>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/${encodeURIComponent(threatId.trim())}/actions`,
    { method: 'POST', body: JSON.stringify(payload) }
  );
  if (!ok || !data) return null;
  return data;
}

export async function getActiveThreats(
  walletAddress: string,
  limit: number = 20
): Promise<ActiveThreatsResponse | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({ limit: String(Math.min(50, Math.max(1, limit))) });
  const { ok, data } = await dashboardFetch<{
    success?: boolean;
    data?: WalletThreatItem[];
    meta?: ActiveThreatsMeta;
  }>(`/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/active?${params}`);
  if (!ok || !data) return null;
  const parsed = data as { success?: boolean; data?: WalletThreatItem[]; meta?: ActiveThreatsMeta };
  const list = Array.isArray(parsed.data) ? parsed.data : [];
  const meta = parsed.meta ?? {
    count: list.length,
    high_priority_count: list.filter((item) => String(item.severity).toLowerCase() === 'high').length,
  };
  return { data: list, meta };
}

export async function getThreatHistory(
  walletAddress: string,
  page: number = 1,
  perPage: number = 10
): Promise<ThreatHistoryResponse | null> {
  if (!walletAddress?.trim()) return null;
  const params = new URLSearchParams({
    page: String(Math.max(1, page)),
    per_page: String(Math.min(50, Math.max(1, perPage))),
  });
  const { ok, data } = await dashboardFetch<{
    success?: boolean;
    data?: WalletThreatItem[];
    meta?: ThreatHistoryMeta;
  }>(`/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/history?${params}`);
  if (!ok || !data) return null;
  const parsed = data as { success?: boolean; data?: WalletThreatItem[]; meta?: ThreatHistoryMeta };
  const list = Array.isArray(parsed.data) ? parsed.data : [];
  const meta = parsed.meta ?? { page, per_page: perPage, total: list.length };
  return { data: list, meta };
}

export async function resolveThreat(
  walletAddress: string,
  threatId: string,
  resolutionNote?: string
): Promise<ThreatActionResponse | null> {
  if (!walletAddress?.trim() || !threatId?.trim()) return null;
  const body = resolutionNote?.trim()
    ? JSON.stringify({ resolution_note: resolutionNote.trim() })
    : '{}';
  const { ok, data } = await dashboardFetch<ThreatActionResponse>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/${encodeURIComponent(threatId.trim())}/resolve`,
    { method: 'POST', body }
  );
  if (!ok || !data) return null;
  return data;
}

export async function dismissThreat(
  walletAddress: string,
  threatId: string,
  dismissReason?: string
): Promise<ThreatActionResponse | null> {
  if (!walletAddress?.trim() || !threatId?.trim()) return null;
  const body = dismissReason?.trim()
    ? JSON.stringify({ dismiss_reason: dismissReason.trim() })
    : '{}';
  const { ok, data } = await dashboardFetch<ThreatActionResponse>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/threats/${encodeURIComponent(threatId.trim())}/dismiss`,
    { method: 'POST', body }
  );
  if (!ok || !data) return null;
  return data;
}

export async function refreshWalletHealth(
  walletAddress: string
): Promise<WalletHealthRefreshData | null> {
  if (!walletAddress?.trim()) return null;
  const { ok, data } = await dashboardFetch<{ success?: boolean; data?: WalletHealthRefreshData }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/health/refresh`,
    { method: 'POST', body: '{}' }
  );
  if (!ok || !data) return null;
  const parsed = data as { success?: boolean; data?: WalletHealthRefreshData };
  if (parsed?.success && parsed.data) return parsed.data;
  if (parsed?.data?.security_status) return parsed.data;
  return null;
}

export async function markAlertRead(
  walletAddress: string,
  alertId: string
): Promise<boolean> {
  if (!walletAddress?.trim() || !alertId?.trim()) return false;
  const { ok, data } = await dashboardFetch<{ success?: boolean }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/alerts/${encodeURIComponent(alertId.trim())}/read`,
    { method: 'POST', body: '{}' }
  );
  if (!ok) return false;
  const parsed = data as { success?: boolean } | null;
  return parsed?.success !== false;
}

export async function markAllAlertsRead(walletAddress: string): Promise<boolean> {
  if (!walletAddress?.trim()) return false;
  const { ok, data } = await dashboardFetch<{ success?: boolean }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/alerts/read-all`,
    { method: 'POST', body: '{}' }
  );
  if (!ok) return false;
  const parsed = data as { success?: boolean } | null;
  return parsed?.success !== false;
}

// --- How to fix (emergency remediation) ---

export interface HowToFixThreatItem extends WalletThreatItem {
  where_to_fix: string;
  recommended_action: string;
  fix_steps: string[];
}

export interface HowToFixThreatMeta {
  count: number;
  high_priority_count: number;
}

export interface HowToFixThreatsResponse {
  data: HowToFixThreatItem[];
  meta: HowToFixThreatMeta;
}

export async function getHowToFixThreats(
  walletAddress: string,
  page: number = 1,
  perPage: number = 3
): Promise<HowToFixThreatsResponse | null> {
  if (!walletAddress?.trim()) return null;
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(20, Math.max(1, perPage));
  // Backend endpoint is /dashboard/:address/where-to-fix?limit=3.
  // To support client pagination when backend does not expose page/per_page,
  // request up to page * perPage items, then slice the current page locally.
  const serverLimit = safePage * safePerPage;
  const params = new URLSearchParams({
    limit: String(serverLimit),
  });

  const { ok, data } = await dashboardFetch<{
    success?: boolean;
    data?: HowToFixThreatItem[];
    meta?: HowToFixThreatMeta;
  }>(
    `/dashboard/${encodeURIComponent(walletAddress.trim())}/where-to-fix?${params}`
  );

  if (!ok || !data) return null;

  const parsed = data as {
    success?: boolean;
    data?: HowToFixThreatItem[];
    meta?: HowToFixThreatMeta;
  };

  const rawList = Array.isArray(parsed.data) ? parsed.data : [];
  const meta = parsed.meta ?? {
    count: rawList.length,
    high_priority_count: rawList.filter((item) => String(item.severity).toLowerCase() === "high").length,
  };

  const pageData = rawList.slice((safePage - 1) * safePerPage, safePage * safePerPage);

  return {
    data: pageData,
    meta,
  };
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
  correlation?: ThreatCorrelation | null;
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

export async function getDashboardOverview(
  timelineLimit: number = 20,
  params?: { user_id?: string; wallet_address?: string }
): Promise<DashboardOverviewData | null> {
  const limit = Math.min(100, Math.max(1, timelineLimit));
  const search = new URLSearchParams({ timeline_limit: String(limit) });
  if (params?.user_id?.trim()) search.set("user_id", params.user_id.trim());
  if (params?.wallet_address?.trim()) search.set("wallet_address", params.wallet_address.trim());
  const { ok, data } = await dashboardFetch<{ success: boolean; data: DashboardOverviewData }>(
    `/dashboard/overview?${search}`
  );
  console.log('[Activity Monitor API] /dashboard/overview response:', {
    endpoint: `/dashboard/overview?${search}`,
    ok,
    data,
  });
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
  console.log('[Dashboard API] Activity monitor wallets response:', {
    endpoint: `/dashboard/activity-monitor/wallets${qs ? `?${qs}` : ''}`,
    ok,
    data,
  });
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
  console.log('[Dashboard API] Activity monitor dapps response:', {
    endpoint: `/dashboard/activity-monitor/dapps${qs ? `?${qs}` : ''}`,
    ok,
    data,
  });
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
  console.log('[Dashboard API] Activity feed response:', {
    endpoint: `/dashboard/activity/feed?${params}`,
    ok,
    data,
  });
  if (!ok) return null;
  const parsed = data as { success?: boolean; data?: ActivityFeedItem[]; pagination?: ActivityFeedPagination } | null;
  if (parsed?.success && Array.isArray(parsed.data)) {
    return { data: parsed.data, pagination: parsed.pagination ?? { page: 1, per_page: perPage, total: 0 } };
  }
  return null;
}
