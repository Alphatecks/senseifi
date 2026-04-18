/* SenseiGuard Background Service Worker
 * Real-time security orchestrator for tx risk, domain risk, policy enforcement, and telemetry.
 */

const STORAGE_KEYS = {
  session: 'senseiguard_session',
  walletAddress: 'senseiguard_wallet_address',
  settings: 'senseiguard_settings',
  alerts: 'senseiguard_alerts',
  riskCache: 'senseiguard_risk_cache',
  telemetryQueue: 'senseiguard_telemetry_queue',
  activeDomains: 'senseiguard_active_domains',
};

const MESSAGE_TYPES = {
  evaluateTx: 'SENSEIGUARD_EVALUATE_TX',
  txDecision: 'SENSEIGUARD_TX_DECISION',
  getState: 'SENSEIGUARD_GET_STATE',
  setSettings: 'SENSEIGUARD_SET_SETTINGS',
  registerWallet: 'SENSEIGUARD_REGISTER_WALLET',
  clearWalletSession: 'SENSEIGUARD_CLEAR_WALLET_SESSION',
  markAlertRead: 'SENSEIGUARD_MARK_ALERT_READ',
  userDecision: 'SENSEIGUARD_USER_DECISION',
  debugEvent: 'SENSEIGUARD_DEBUG_EVENT',
  getDebugStatus: 'SENSEIGUARD_GET_DEBUG_STATUS',
};

const TELEMETRY_EVENT_TYPES = {
  txEvaluated: 'tx_evaluated',
  txBlocked: 'tx_blocked',
  txWarned: 'tx_warned',
  domainRisk: 'domain_risk_detected',
  userDecision: 'user_decision',
};

const METHOD_WEIGHTS = {
  eth_requestAccounts: 15,
  eth_sendTransaction: 35,
  eth_sign: 25,
  personal_sign: 20,
  eth_signTypedData: 20,
  eth_signTypedData_v3: 20,
  eth_signTypedData_v4: 20,
  wallet_requestPermissions: 20,
  wallet_sendCalls: 30,
};

const SUSPICIOUS_SELECTORS = {
  '0x095ea7b3': 20, // approve(address,uint256)
  '0xa22cb465': 20, // setApprovalForAll(address,bool)
  '0x23b872dd': 25, // transferFrom(address,address,uint256)
};

const KNOWN_SCAM_CONTRACTS = [
  '0x000000000000000000000000000000000000dead',
  '0x1111111254eeb25477b68fb85ed929f73a960582',
];

const PHISHING_DOMAINS = [
  'metamask-security.com',
  'coinbase-wallet-auth.net',
  'opensea-airdrop.claims',
];

const DEFAULT_SETTINGS = {
  enabled: true,
  strictMode: true,
  failClosedOnBackendUnavailable: false,
  autoBlockDangerous: true,
  warningThreshold: 45,
  blockThreshold: 75,
  blockUnknownContracts: false,
  approvalRequiresConfirmation: true,
  maxTxUsd: 15000,
};

const STRICT_METHODS = new Set([
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'wallet_requestPermissions',
  'wallet_sendCalls',
]);

const CONNECT_METHODS = new Set(['eth_requestAccounts', 'wallet_requestPermissions']);

const INJECTION_DEBOUNCE_MS = 1500;
const BACKEND_RISK_TIMEOUT_MS = 1200;
const injectionAttempts = new Map();
const runtimeDiagnostics = {
  hookInjected: 0,
  injectionFailures: 0,
  txIntercepted: 0,
  inpageDebugEvents: 0,
  lastMethod: null,
  lastDomain: null,
  lastFailureReason: null,
  lastInjectionAt: null,
  lastDebugEvent: null,
};

function getApiBase() {
  return 'https://senseifi-backend.onrender.com/api';
}

function shouldInjectUrl(url) {
  return typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
}

function shouldSkipRecentInjection(tabId, url) {
  const key = `${tabId}:${url}`;
  const now = Date.now();
  const lastAt = injectionAttempts.get(key) || 0;
  if (now - lastAt < INJECTION_DEBOUNCE_MS) {
    return true;
  }
  injectionAttempts.set(key, now);
  return false;
}

/** User-granted optional host access (http/https) — required for programmatic MAIN-world injection. */
async function hasBroadSiteAccess() {
  try {
    return await chrome.permissions.contains({
      origins: ['http://*/*', 'https://*/*'],
    });
  } catch (_e) {
    return false;
  }
}

async function injectProtectionHook(tabId, url) {
  if (!tabId || !shouldInjectUrl(url)) return;
  if (!(await hasBroadSiteAccess())) return;
  if (shouldSkipRecentInjection(tabId, url)) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      files: ['inpage-hook.js'],
    });
    runtimeDiagnostics.hookInjected += 1;
    runtimeDiagnostics.lastInjectionAt = nowIso();
    runtimeDiagnostics.lastFailureReason = null;
  } catch (error) {
    runtimeDiagnostics.injectionFailures += 1;
    runtimeDiagnostics.lastFailureReason = String(error && error.message ? error.message : error);
    console.warn('[SenseiGuard] hook injection failed:', runtimeDiagnostics.lastFailureReason);
  }
}

function nowIso() {
  return new Date().toISOString();
}

async function storageGet(keys) {
  return chrome.storage.local.get(keys);
}

async function storageSet(patch) {
  return chrome.storage.local.set(patch);
}

async function storageRemove(keys) {
  return chrome.storage.local.remove(keys);
}

function normalizeWalletAddress(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  return trimmed;
}

function clampRisk(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function makeDecision(score, settings) {
  const riskScore = clampRisk(score);
  if (!settings.enabled) {
    return { action: 'allow', riskScore, reason: 'SenseiGuard disabled' };
  }
  if (settings.autoBlockDangerous && riskScore >= settings.blockThreshold) {
    return { action: 'block', riskScore, reason: 'Risk score exceeds block threshold' };
  }
  if (riskScore >= settings.warningThreshold) {
    return { action: 'warn', riskScore, reason: 'Risk score exceeds warning threshold' };
  }
  return { action: 'allow', riskScore, reason: 'Risk below thresholds' };
}

function extractTxObject(payload) {
  const params = Array.isArray(payload?.params) ? payload.params : [];
  if (!params.length) return null;
  return typeof params[0] === 'object' && params[0] ? params[0] : null;
}

function computeHeuristicRisk(payload, settings) {
  const findings = [];
  const tx = extractTxObject(payload);
  let score = METHOD_WEIGHTS[payload.method] || 5;

  if (tx && tx.to) {
    const to = String(tx.to).toLowerCase();
    if (KNOWN_SCAM_CONTRACTS.includes(to)) {
      score += 70;
      findings.push('Known scam contract');
    }
    if (settings.blockUnknownContracts && !(to.startsWith('0x') && to.length === 42)) {
      score += 40;
      findings.push('Unknown contract format');
    }
  }

  if (tx && typeof tx.data === 'string' && tx.data.length >= 10) {
    const selector = tx.data.slice(0, 10).toLowerCase();
    if (SUSPICIOUS_SELECTORS[selector]) {
      score += SUSPICIOUS_SELECTORS[selector];
      findings.push(`Suspicious function selector: ${selector}`);
    }
    if (selector === '0x095ea7b3' && tx.data.endsWith('f'.repeat(64))) {
      score += 35;
      findings.push('Unlimited approval detected');
    }
  }

  if (payload.method === 'eth_sign' || payload.method.startsWith('eth_signTypedData')) {
    score += 10;
    findings.push('Signing request can be replay-abused');
  }

  return {
    score: clampRisk(score),
    findings,
    source: 'local_heuristics',
  };
}

function txValueToUsd(payload) {
  const tx = extractTxObject(payload);
  if (!tx || typeof tx.value !== 'string') return 0;
  try {
    const wei = BigInt(tx.value);
    const weiPerEth = 10n ** 18n;
    const whole = wei / weiPerEth;
    const fractional = wei % weiPerEth;
    const wholeEth = Number(whole) + Number(fractional) / Number(weiPerEth);
    const ethUsdEstimate = 3000;
    return wholeEth * ethUsdEstimate;
  } catch (_error) {
    return 0;
  }
}

async function callRiskBackend(payload, context) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_RISK_TIMEOUT_MS);
  try {
    const res = await fetch(`${getApiBase()}/protection/transaction/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        method: payload.method,
        params: payload.params || [],
        url: context.url || '',
        domain: context.domain || '',
        wallet_address: context.walletAddress || null,
        chain_id: context.chainId || null,
        source: 'senseiguard_extension',
      }),
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (!res.ok || !json) {
      throw new Error(`Backend risk call failed: ${res.status}`);
    }
    const websiteScan =
      json.website_scan && typeof json.website_scan === 'object' ? json.website_scan : null;
    const websiteScanFindings = Array.isArray(websiteScan && websiteScan.findings)
      ? websiteScan.findings.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [];
    const findings = [
      ...(Array.isArray(json.findings) ? json.findings : []),
      ...websiteScanFindings,
    ];
    const rawRiskLevel10 =
      typeof json.risk_level_10 === 'number'
        ? json.risk_level_10
        : typeof json.riskScore === 'number'
          ? (json.riskScore <= 10 ? json.riskScore : json.riskScore / 10)
          : typeof json.risk_score === 'number'
            ? (json.risk_score <= 10 ? json.risk_score : json.risk_score / 10)
            : null;
    return {
      ok: true,
      score: clampRisk(json.risk_score ?? json.riskScore ?? 0),
      findings,
      breakdown: json.breakdown || null,
      band: typeof json.band === 'string' ? json.band : null,
      siteSafety: typeof json.site_safety === 'string' ? json.site_safety : null,
      siteSafe: typeof json.site_safe === 'boolean' ? json.site_safe : null,
      websiteScanSummary:
        typeof json.website_scan === 'string'
          ? json.website_scan
          : json.website_scan && typeof json.website_scan.summary === 'string'
            ? json.website_scan.summary
            : websiteScan && typeof websiteScan.safety === 'string'
              ? websiteScan.safety
            : null,
      websiteScanFindings,
      recommendation: typeof json.recommendation === 'string' ? json.recommendation : null,
      maliciousContractDetected: !!json.malicious_contract_detected,
      riskLevel10: rawRiskLevel10,
      reportedIncidents:
        typeof json.reported_incidents === 'number' ? json.reported_incidents : null,
      walletsDrainedEstimate:
        typeof json.wallets_drained_estimate === 'number' ? json.wallets_drained_estimate : null,
      raw: json,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const isAbort = error && (error.name === 'AbortError' || String(error.message || '').includes('aborted'));
    const backendErrorMessage = isAbort
      ? `Backend timeout after ${BACKEND_RISK_TIMEOUT_MS}ms`
      : `Backend unavailable: ${String(error && error.message ? error.message : error)}`;
    return {
      ok: false,
      score: 0,
      findings: [backendErrorMessage],
      breakdown: null,
      band: null,
      siteSafety: null,
      siteSafe: null,
      websiteScanSummary: null,
      websiteScanFindings: [],
      recommendation: null,
      maliciousContractDetected: false,
      riskLevel10: null,
      reportedIncidents: null,
      walletsDrainedEstimate: null,
      raw: null,
    };
  }
}

async function callDappConnectionCheck(context) {
  try {
    const url = context.url || '';
    const domain = context.domain || '';
    const walletAddress = normalizeWalletAddress(context.walletAddress) || null;
    const res = await fetch(`${getApiBase()}/protection/dapp/connection-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        domain,
        wallet_address: walletAddress,
        max_pages: 2,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json) {
      throw new Error(`Dapp connection check failed: ${res.status}`);
    }
    const websiteScan =
      json.website_scan && typeof json.website_scan === 'object' ? json.website_scan : null;
    const websiteScanFindings = Array.isArray(websiteScan && websiteScan.findings)
      ? websiteScan.findings.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [];
    const rawSiteSafety = typeof json.site_safety === 'string' ? json.site_safety : '';
    const siteSafety =
      rawSiteSafety ||
      (typeof json.band === 'string' ? json.band : null) ||
      (websiteScan && typeof websiteScan.safety === 'string' ? websiteScan.safety : null);
    const findings = [
      ...(Array.isArray(json.findings) ? json.findings : []),
      ...websiteScanFindings,
    ];
    const dappRiskScoreRaw =
      typeof json.risk_score === 'number'
        ? json.risk_score
        : typeof json.riskScore === 'number'
          ? json.riskScore
          : websiteScan && typeof websiteScan.risk_score === 'number'
            ? websiteScan.risk_score
            : 0;
    const riskLevel10Raw =
      typeof json.risk_level_10 === 'number'
        ? json.risk_level_10
        : dappRiskScoreRaw <= 10
          ? dappRiskScoreRaw
          : dappRiskScoreRaw / 10;
    const websiteScanSummary =
      typeof json.website_scan === 'string'
        ? json.website_scan
        : json.website_scan && typeof json.website_scan.summary === 'string'
          ? json.website_scan.summary
          : websiteScan && typeof websiteScan.safety === 'string'
            ? websiteScan.safety
          : null;
    return {
      ok: true,
      siteSafety,
      siteSafe: typeof json.site_safe === 'boolean' ? json.site_safe : null,
      riskScore: clampRisk(dappRiskScoreRaw),
      riskLevel10: Math.max(0, Math.min(10, riskLevel10Raw)),
      findings,
      websiteScanSummary,
      websiteScanFindings,
      raw: json,
    };
  } catch (_error) {
    return {
      ok: false,
      siteSafety: null,
      siteSafe: null,
      riskScore: 0,
      riskLevel10: null,
      findings: [],
      websiteScanSummary: null,
      websiteScanFindings: [],
      raw: null,
    };
  }
}

async function appendAlert(alert) {
  const stored = await storageGet([STORAGE_KEYS.alerts]);
  const alerts = Array.isArray(stored[STORAGE_KEYS.alerts]) ? stored[STORAGE_KEYS.alerts] : [];
  alerts.unshift(alert);
  const trimmed = alerts.slice(0, 100);
  await storageSet({ [STORAGE_KEYS.alerts]: trimmed });
}

async function queueTelemetry(event) {
  const stored = await storageGet([STORAGE_KEYS.telemetryQueue]);
  const queue = Array.isArray(stored[STORAGE_KEYS.telemetryQueue]) ? stored[STORAGE_KEYS.telemetryQueue] : [];
  queue.push({ ...event, at: nowIso() });
  await storageSet({ [STORAGE_KEYS.telemetryQueue]: queue.slice(-500) });
}

async function sendNotification(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/scaled_logo.png',
      title,
      message,
      priority: 2,
    });
  } catch (_error) {
    // Ignore notification failures in restricted environments.
  }
}

async function loadSettings() {
  const stored = await storageGet([STORAGE_KEYS.settings]);
  return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEYS.settings] || {}) };
}

async function loadSession() {
  const stored = await storageGet([STORAGE_KEYS.session, 'senseiguard_wallet_connect']);
  if (stored[STORAGE_KEYS.session]) return stored[STORAGE_KEYS.session];
  const legacy = stored.senseiguard_wallet_connect;
  if (!legacy) return null;
  const migrated = {
    connectedWallets: legacy.wallet ? [legacy.wallet] : [],
    dashboardUser: legacy.dashboard_user || null,
    updatedAt: nowIso(),
  };
  await storageSet({ [STORAGE_KEYS.session]: migrated });
  return migrated;
}

async function loadPersistedWalletAddress() {
  const stored = await storageGet([STORAGE_KEYS.walletAddress, STORAGE_KEYS.session, 'senseiguard_wallet_connect']);
  const direct = normalizeWalletAddress(stored[STORAGE_KEYS.walletAddress]);
  if (direct) return direct;

  const session = stored[STORAGE_KEYS.session];
  const sessionWallet =
    session && Array.isArray(session.connectedWallets) && session.connectedWallets.length > 0
      ? normalizeWalletAddress(session.connectedWallets[0] && session.connectedWallets[0].address)
      : null;
  if (sessionWallet) {
    await storageSet({ [STORAGE_KEYS.walletAddress]: sessionWallet });
    return sessionWallet;
  }

  const legacy = stored.senseiguard_wallet_connect;
  const legacyWallet = normalizeWalletAddress(legacy && legacy.wallet ? legacy.wallet.address : null);
  if (legacyWallet) {
    await storageSet({ [STORAGE_KEYS.walletAddress]: legacyWallet });
    return legacyWallet;
  }

  return null;
}

async function loadRiskCache() {
  const stored = await storageGet([STORAGE_KEYS.riskCache]);
  const cache = stored[STORAGE_KEYS.riskCache] || {};
  return {
    maliciousContracts: Array.isArray(cache.maliciousContracts) ? cache.maliciousContracts.map((x) => String(x).toLowerCase()) : [],
    maliciousDomains: Array.isArray(cache.maliciousDomains) ? cache.maliciousDomains.map((x) => String(x).toLowerCase()) : [],
  };
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (_error) {
    return '';
  }
}

function domainRisk(domain, riskCache) {
  if (!domain) return { score: 0, findings: [] };
  const findings = [];
  let score = 0;
  if (PHISHING_DOMAINS.includes(domain)) {
    score += 95;
    findings.push('Known phishing domain');
  }
  if (riskCache.maliciousDomains.includes(domain)) {
    score += 95;
    findings.push('Backend threat feed flagged this domain');
  }
  if (domain.includes('metamask') && !domain.endsWith('metamask.io')) {
    score += 40;
    findings.push('Potential MetaMask typosquat');
  }
  if (domain.includes('coinbase') && !domain.endsWith('coinbase.com')) {
    score += 40;
    findings.push('Potential Coinbase typosquat');
  }
  return { score: clampRisk(score), findings };
}

async function evaluateTransaction(payload, sender) {
  runtimeDiagnostics.txIntercepted += 1;
  runtimeDiagnostics.lastMethod = payload && payload.method ? payload.method : null;
  const settings = await loadSettings();
  const session = await loadSession();
  const riskCache = await loadRiskCache();
  const connectedWallet = session?.connectedWallets?.[0] || null;
  const sessionWalletAddress = normalizeWalletAddress(connectedWallet?.address);
  const persistedWalletAddress = await loadPersistedWalletAddress();
  const walletAddress = sessionWalletAddress || persistedWalletAddress;
  const chainId = connectedWallet?.chain_id || null;
  const url = sender?.tab?.url || '';
  const domain = domainFromUrl(url);
  runtimeDiagnostics.lastDomain = domain || null;
  const currentDomainRisk = domainRisk(domain, riskCache);

  const local = computeHeuristicRisk(payload, settings);
  const tx = extractTxObject(payload);
  if (tx && tx.to) {
    const to = String(tx.to).toLowerCase();
    if (riskCache.maliciousContracts.includes(to)) {
      local.score = clampRisk(local.score + 75);
      local.findings.push('Backend threat feed flagged destination contract');
    }
  }
  const isConnectMethod = CONNECT_METHODS.has(payload.method);
  if (isConnectMethod) {
    console.info('[SenseiGuard][scan][connect]', {
      method: payload.method,
      domain,
      sessionWalletAddress: sessionWalletAddress || null,
      persistedWalletAddress: persistedWalletAddress || null,
      effectiveWalletAddress: walletAddress || null,
    });
  }
  let backend = null;
  let dappCheck = null;
  if (isConnectMethod) {
    dappCheck = await callDappConnectionCheck({ url, domain, walletAddress });
  } else {
    backend = await callRiskBackend(payload, { url, domain, walletAddress, chainId });
  }

  const combinedScore = clampRisk(
    Math.max(
      local.score,
      backend && backend.ok ? backend.score : 0,
      dappCheck && dappCheck.ok ? dappCheck.riskScore : 0
    )
  );
  const findings = [...local.findings];
  if (backend) {
    findings.push(...(backend.findings || []));
    if (backend.websiteScanSummary) {
      findings.push(`Website scan: ${backend.websiteScanSummary}`);
    }
  }
  if (dappCheck && dappCheck.ok) {
    if (Array.isArray(dappCheck.findings) && dappCheck.findings.length) {
      findings.push(...dappCheck.findings);
    }
    if (dappCheck.websiteScanSummary) {
      findings.push(`Connection scan: ${dappCheck.websiteScanSummary}`);
    }
  }
  const txUsd = txValueToUsd(payload);

  if ((payload.method === 'eth_sendTransaction' || payload.method === 'eth_signTypedData' || payload.method === 'eth_signTypedData_v4') && settings.approvalRequiresConfirmation) {
    const tx = extractTxObject(payload);
    if (tx && tx.data && tx.data.slice(0, 10).toLowerCase() === '0x095ea7b3') {
      findings.push('Approval requires explicit confirmation');
      backend = {
        ...backend,
        score: Math.max(backend.score || 0, settings.warningThreshold),
      };
    }
  }

  let decision = makeDecision(combinedScore, settings);
  if (currentDomainRisk.score >= 70) {
    decision = {
      action: 'block',
      riskScore: Math.max(decision.riskScore, currentDomainRisk.score),
      reason: 'Blocked due to high-risk domain',
    };
    findings.push(...currentDomainRisk.findings);
  }

  if (backend) {
    const backendSiteSafety = String(backend.siteSafety || '').toLowerCase();
    if (backend.siteSafe === false || backendSiteSafety === 'dangerous') {
      decision = {
        action: 'warn',
        riskScore: Math.max(decision.riskScore, settings.warningThreshold),
        reason: backend.recommendation || 'Site safety scan flagged this dApp as risky',
      };
    }
    if (backendSiteSafety === 'block') {
      decision = {
        action: 'block',
        riskScore: Math.max(decision.riskScore, settings.blockThreshold),
        reason: backend.recommendation || 'Site safety scan blocked this dApp',
      };
    }
  }

  if (dappCheck && dappCheck.ok) {
    const dappSiteSafety = String(dappCheck.siteSafety || '').toLowerCase();
    if (dappCheck.siteSafe === false || dappSiteSafety === 'dangerous') {
      decision = {
        action: 'warn',
        riskScore: Math.max(decision.riskScore, settings.warningThreshold, dappCheck.riskScore || 0),
        reason: decision.reason || 'Connection check marked this site as risky',
      };
    }
    if (dappSiteSafety === 'block') {
      decision = {
        action: 'block',
        riskScore: Math.max(decision.riskScore, settings.blockThreshold, dappCheck.riskScore || 0),
        reason: 'Connection check marked this site as blocked',
      };
    }
  }

  if (
    settings.strictMode &&
    settings.failClosedOnBackendUnavailable &&
    !(
      (isConnectMethod && dappCheck && dappCheck.ok) ||
      (!isConnectMethod && backend && backend.ok)
    ) &&
    STRICT_METHODS.has(payload.method)
  ) {
    decision = {
      action: 'warn',
      riskScore: Math.max(decision.riskScore, settings.warningThreshold),
      reason: 'Backend risk check unavailable. Review carefully before proceeding.',
    };
    findings.push('Backend unavailable: proceeding with caution using local checks only');
  }

  if (
    settings.strictMode &&
    CONNECT_METHODS.has(payload.method) &&
    decision.action === 'allow'
  ) {
    const strictReviewRiskScore =
      dappCheck && dappCheck.ok
        ? clampRisk(dappCheck.riskScore || 0)
        : decision.riskScore;
    decision = {
      action: 'warn',
      riskScore: strictReviewRiskScore,
      reason: 'Strict mode: wallet connection request requires review',
    };
    findings.push('Wallet connection request reviewed by SenseiGuard');
  }

  const maliciousEvidence =
    !!(backend && backend.maliciousContractDetected) ||
    String(backend && backend.band ? backend.band : '').toLowerCase() === 'block';

  if (maliciousEvidence) {
    decision = {
      action: 'block',
      riskScore: Math.max(decision.riskScore, backend.score || settings.blockThreshold),
      reason: backend.recommendation || 'Malicious contract detected by backend intelligence',
    };
    findings.push('Malicious contract detected');
  } else if (backend && String(backend.band || '').toLowerCase() === 'warning' && decision.action === 'allow') {
    decision = {
      action: 'warn',
      riskScore: Math.max(decision.riskScore, backend.score || settings.warningThreshold),
      reason: backend.recommendation || 'Backend raised a warning',
    };
  }
  if (txUsd > settings.maxTxUsd) {
    decision = {
      action: 'block',
      riskScore: Math.max(decision.riskScore, settings.blockThreshold),
      reason: `Transaction value estimate $${Math.round(txUsd)} exceeds max policy $${settings.maxTxUsd}`,
    };
    findings.push('Policy rule triggered: max transaction USD');
  }
  const event = {
    id: crypto.randomUUID(),
    type: 'transaction_risk',
    domain,
    method: payload.method,
    decision: decision.action,
    riskScore: decision.riskScore,
    reason: decision.reason,
    findings,
    txUsdEstimate: txUsd,
    maliciousContractDetected: !!(backend && backend.maliciousContractDetected),
    maliciousEvidence,
    riskLevel10:
      backend && typeof backend.riskLevel10 === 'number'
        ? backend.riskLevel10
        : dappCheck && typeof dappCheck.riskLevel10 === 'number'
          ? dappCheck.riskLevel10
          : null,
    reportedIncidents: backend ? backend.reportedIncidents : null,
    walletsDrainedEstimate: backend ? backend.walletsDrainedEstimate : null,
    backendBand: backend ? backend.band : null,
    websiteScanFindings:
      backend && Array.isArray(backend.websiteScanFindings) && backend.websiteScanFindings.length
        ? backend.websiteScanFindings
        : dappCheck && Array.isArray(dappCheck.websiteScanFindings)
          ? dappCheck.websiteScanFindings
          : [],
    at: nowIso(),
    tabId: sender?.tab?.id || null,
  };

  await appendAlert(event);
  await queueTelemetry({
    type:
      decision.action === 'block'
        ? TELEMETRY_EVENT_TYPES.txBlocked
        : decision.action === 'warn'
          ? TELEMETRY_EVENT_TYPES.txWarned
          : TELEMETRY_EVENT_TYPES.txEvaluated,
    riskScore: decision.riskScore,
    domain,
    method: payload.method,
    findings,
    maliciousContractDetected: !!(backend && backend.maliciousContractDetected),
    maliciousEvidence,
    riskLevel10:
      backend && typeof backend.riskLevel10 === 'number'
        ? backend.riskLevel10
        : dappCheck && typeof dappCheck.riskLevel10 === 'number'
          ? dappCheck.riskLevel10
          : null,
    reportedIncidents: backend ? backend.reportedIncidents : null,
    walletsDrainedEstimate: backend ? backend.walletsDrainedEstimate : null,
    backendBand: backend ? backend.band : null,
    websiteScanFindings:
      backend && Array.isArray(backend.websiteScanFindings) && backend.websiteScanFindings.length
        ? backend.websiteScanFindings
        : dappCheck && Array.isArray(dappCheck.websiteScanFindings)
          ? dappCheck.websiteScanFindings
          : [],
  });

  if (decision.action === 'block') {
    await sendNotification('SenseiGuard blocked a transaction', `${domain || 'Unknown site'} risk ${decision.riskScore}/100`);
  } else if (decision.action === 'warn') {
    await sendNotification('SenseiGuard warning', `${domain || 'Unknown site'} risk ${decision.riskScore}/100`);
  }

  return {
    ok: true,
    decision: {
      action: decision.action,
      riskScore: decision.riskScore,
      reason: decision.reason,
      findings,
      txUsdEstimate: txUsd,
      maliciousContractDetected: !!(backend && backend.maliciousContractDetected),
      maliciousEvidence,
      riskLevel10:
        backend && typeof backend.riskLevel10 === 'number'
          ? backend.riskLevel10
          : dappCheck && typeof dappCheck.riskLevel10 === 'number'
            ? dappCheck.riskLevel10
            : decision.riskScore <= 10
              ? decision.riskScore
              : decision.riskScore / 10,
      reportedIncidents: backend ? backend.reportedIncidents : null,
      walletsDrainedEstimate: backend ? backend.walletsDrainedEstimate : null,
      backendBand: backend ? backend.band : null,
      websiteScanFindings:
        backend && Array.isArray(backend.websiteScanFindings) && backend.websiteScanFindings.length
          ? backend.websiteScanFindings
          : dappCheck && Array.isArray(dappCheck.websiteScanFindings)
            ? dappCheck.websiteScanFindings
            : [],
      recommendation: backend ? backend.recommendation : null,
      siteSafety: backend ? backend.siteSafety : dappCheck ? dappCheck.siteSafety : null,
      siteSafe: backend ? backend.siteSafe : dappCheck ? dappCheck.siteSafe : null,
      websiteScanSummary:
        backend && backend.websiteScanSummary
          ? backend.websiteScanSummary
          : dappCheck
            ? dappCheck.websiteScanSummary
            : null,
      connectionCheck: dappCheck
        ? {
            ok: dappCheck.ok,
            siteSafety: dappCheck.siteSafety,
            siteSafe: dappCheck.siteSafe,
            riskScore: dappCheck.riskScore,
            websiteScanSummary: dappCheck.websiteScanSummary,
          }
        : null,
      backend: {
        ok: backend ? backend.ok : null,
        score: backend ? backend.score : null,
        breakdown: backend ? backend.breakdown : null,
      },
      local: {
        score: local.score,
        findings: local.findings,
      },
    },
  };
}

async function flushTelemetryQueue() {
  const stored = await storageGet([STORAGE_KEYS.telemetryQueue]);
  const queue = Array.isArray(stored[STORAGE_KEYS.telemetryQueue]) ? stored[STORAGE_KEYS.telemetryQueue] : [];
  if (!queue.length) return;

  try {
    const res = await fetch(`${getApiBase()}/telemetry/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
    });
    if (res.ok) {
      await storageSet({ [STORAGE_KEYS.telemetryQueue]: [] });
    }
  } catch (_error) {
    // Keep queue for retry.
  }
}

async function syncThreatIntel() {
  try {
    const res = await fetch(`${getApiBase()}/protection/threat-feed`, { method: 'GET' });
    if (!res.ok) return;
    const json = await res.json();
    if (!json || typeof json !== 'object') return;
    const riskCache = {
      updatedAt: nowIso(),
      maliciousContracts: Array.isArray(json.malicious_contracts) ? json.malicious_contracts : [],
      maliciousDomains: Array.isArray(json.malicious_domains) ? json.malicious_domains : [],
    };
    await storageSet({ [STORAGE_KEYS.riskCache]: riskCache });
  } catch (_error) {
    // Keep previous cache if sync fails.
  }
}

async function monitorDomain(url, tabId) {
  const domain = domainFromUrl(url);
  if (!domain) return;
  const riskCache = await loadRiskCache();

  const result = domainRisk(domain, riskCache);
  const stored = await storageGet([STORAGE_KEYS.activeDomains]);
  const activeDomains = stored[STORAGE_KEYS.activeDomains] || {};
  activeDomains[String(tabId)] = {
    domain,
    score: result.score,
    findings: result.findings,
    updatedAt: nowIso(),
  };
  await storageSet({ [STORAGE_KEYS.activeDomains]: activeDomains });

  if (result.score >= 70) {
    const alert = {
      id: crypto.randomUUID(),
      type: 'domain_risk',
      domain,
      decision: 'warn',
      riskScore: result.score,
      reason: 'Potential phishing domain',
      findings: result.findings,
      at: nowIso(),
      tabId,
    };
    await appendAlert(alert);
    await queueTelemetry({
      type: TELEMETRY_EVENT_TYPES.domainRisk,
      domain,
      riskScore: result.score,
      findings: result.findings,
    });
    await sendNotification('SenseiGuard domain warning', `${domain} flagged as suspicious`);
  }
}

async function handleMessage(message, sender) {
  switch (message?.type) {
    case MESSAGE_TYPES.evaluateTx:
      return evaluateTransaction(message.payload || {}, sender);

    case MESSAGE_TYPES.getState: {
      const [settings, session, alerts] = await Promise.all([
        loadSettings(),
        loadSession(),
        storageGet([STORAGE_KEYS.alerts]),
      ]);
      return {
        ok: true,
        settings,
        session: session || { connectedWallets: [], dashboardUser: null, updatedAt: null },
        alerts: Array.isArray(alerts[STORAGE_KEYS.alerts]) ? alerts[STORAGE_KEYS.alerts] : [],
      };
    }

    case MESSAGE_TYPES.setSettings: {
      const settings = await loadSettings();
      const next = { ...settings, ...(message.settings || {}) };
      await storageSet({ [STORAGE_KEYS.settings]: next });
      return { ok: true, settings: next };
    }

    case MESSAGE_TYPES.registerWallet: {
      const current = (await loadSession()) || { connectedWallets: [], dashboardUser: null, updatedAt: null };
      const wallet = message.wallet || null;
      const walletAddress = normalizeWalletAddress(wallet && wallet.address);
      if (walletAddress) {
        const sanitizedWallet = { ...wallet, address: walletAddress };
        const withoutCurrent = current.connectedWallets.filter((w) => w.address !== walletAddress);
        const updated = {
          connectedWallets: [sanitizedWallet, ...withoutCurrent].slice(0, 5),
          dashboardUser: message.dashboardUser || current.dashboardUser || null,
          updatedAt: nowIso(),
        };
        await storageSet({
          [STORAGE_KEYS.session]: updated,
          [STORAGE_KEYS.walletAddress]: walletAddress,
        });
        return { ok: true, session: updated };
      }
      return { ok: false, error: 'Invalid wallet payload' };
    }

    case MESSAGE_TYPES.clearWalletSession: {
      await storageRemove([STORAGE_KEYS.session, STORAGE_KEYS.walletAddress, 'senseiguard_wallet_connect']);
      return { ok: true };
    }

    case MESSAGE_TYPES.markAlertRead: {
      const id = message.id;
      if (!id) return { ok: false, error: 'Missing alert id' };
      const stored = await storageGet([STORAGE_KEYS.alerts]);
      const alerts = Array.isArray(stored[STORAGE_KEYS.alerts]) ? stored[STORAGE_KEYS.alerts] : [];
      const next = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
      await storageSet({ [STORAGE_KEYS.alerts]: next });
      return { ok: true };
    }

    case MESSAGE_TYPES.userDecision: {
      await queueTelemetry({
        type: TELEMETRY_EVENT_TYPES.userDecision,
        decision: message.decision || 'unknown',
        context: message.context || null,
      });
      return { ok: true };
    }

    case MESSAGE_TYPES.debugEvent: {
      runtimeDiagnostics.inpageDebugEvents += 1;
      runtimeDiagnostics.lastDebugEvent = {
        event: message && message.payload ? message.payload.event || 'unknown' : 'unknown',
        details: message && message.payload ? message.payload.details || null : null,
        at: nowIso(),
      };
      return { ok: true };
    }

    case MESSAGE_TYPES.getDebugStatus: {
      return {
        ok: true,
        diagnostics: {
          ...runtimeDiagnostics,
        },
      };
    }

    default:
      return null;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await storageGet([STORAGE_KEYS.settings, STORAGE_KEYS.alerts, STORAGE_KEYS.riskCache]);
  if (!stored[STORAGE_KEYS.settings]) {
    await storageSet({ [STORAGE_KEYS.settings]: DEFAULT_SETTINGS });
  }
  if (!Array.isArray(stored[STORAGE_KEYS.alerts])) {
    await storageSet({ [STORAGE_KEYS.alerts]: [] });
  }
  if (!stored[STORAGE_KEYS.riskCache]) {
    await storageSet({ [STORAGE_KEYS.riskCache]: {} });
  }
  chrome.alarms.create('senseiguard_sync_loop', { periodInMinutes: 3 });
  chrome.alarms.create('senseiguard_telemetry_flush', { periodInMinutes: 2 });
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map((tab) => injectProtectionHook(tab.id, tab.url))
  );
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('senseiguard_sync_loop', { periodInMinutes: 3 });
  chrome.alarms.create('senseiguard_telemetry_flush', { periodInMinutes: 2 });
  chrome.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      injectProtectionHook(tab.id, tab.url);
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((response) => {
      if (response !== null) sendResponse(response);
    })
    .catch((error) => {
      sendResponse({ ok: false, error: String(error && error.message ? error.message : error) });
    });
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab?.url) {
    injectProtectionHook(tabId, tab.url);
  }
  if (changeInfo.status === 'complete' && tab?.url) {
    monitorDomain(tab.url, tabId);
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url) {
    injectProtectionHook(details.tabId, details.url);
  }
  if (details.frameId === 0 && details.url) {
    monitorDomain(details.url, details.tabId);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'senseiguard_telemetry_flush') {
    flushTelemetryQueue();
    return;
  }
  if (alarm.name === 'senseiguard_sync_loop') {
    syncThreatIntel();
    queueTelemetry({ type: 'sync_heartbeat' });
  }
});
