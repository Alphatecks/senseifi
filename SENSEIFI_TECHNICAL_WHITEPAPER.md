# SenseiFi Technical White Paper

Version: 1.0  
Date: 2026-03-29  
Scope: Repository-backed assessment of the SenseiFi frontend and SenseiGuard extension codebase.

---

## 1) Executive Overview

SenseiFi is a wallet-security product with two user-facing surfaces:

- A Next.js web application for onboarding, wallet connection, dashboarding, and security operations.
- A Chrome extension (SenseiGuard / SenseiFi Trade Insight) that currently implements popup-based wallet connection and backend registration.

The codebase already delivers meaningful user value (wallet onboarding, dashboard retrieval, security scan triggers, and backend-driven guard views), but the extension is not yet at the full "wallet firewall" architecture described in product messaging. Specifically, no background service worker and no persistent content scripts are currently implemented in `extension/`.

This white paper documents the actual shipped architecture, current capabilities, risk model, and the highest-impact roadmap to achieve production-grade wallet firewall behavior.

---

## 2) Product Definition and Goals

SenseiFi's technical objective is to reduce wallet loss events by:

- Detecting risky or malicious transaction patterns before signing.
- Monitoring wallet and contract exposure over time.
- Centralizing threat insights (approvals, contract risk, suspicious activity).
- Providing actionable controls (rescan, protection settings, emergency actions).

The core differentiation is not UI alone; it is transaction interpretation quality, risk scoring accuracy, and response speed.

---

## 3) System Surfaces

### 3.1 Web Application (Next.js)

Primary role: onboarding + security intelligence dashboard.

Key routes include:

- `/` marketing/waitlist entry.
- `/connect-wallet` wallet connect and backend registration.
- `/guard` dashboard shell and wallet security views.
- `/guard/wallet-security`, `/guard/threat-intelligence`, `/guard/activity-monitor`, `/guard/contract-scanner`, `/guard/settings`.

Main files:

- `app/layout.tsx`
- `app/providers.tsx`
- `app/guard/layout.tsx`
- `app/guard/*.tsx`
- `hooks/useWallet.ts`
- `services/dashboardService.ts`
- `services/walletService.ts`
- `context/*.tsx`

### 3.2 Browser Extension (Manifest V3)

Primary role today: popup UX + wallet connect through active tab + backend registration.

Main files:

- `extension/manifest.json`
- `extension/popup.html`
- `extension/popup.css`
- `extension/popup.js`
- `extension/wallet-connect.js`
- `extension/config.js`

Current architecture is popup-centric and does not yet include background analytics execution or persistent dApp instrumentation.

---

## 4) Reference Architecture (Current Implementation)

### 4.1 Web Layered Architecture

1. Presentation Layer
   - Next.js App Router pages and React components in `app/` and `views/`.

2. State/Session Layer
   - Wallet session via wagmi hooks in `hooks/useWallet.ts`.
   - Dashboard user context via `context/DashboardUserContext.tsx`.
   - Modal orchestration via `context/RescanModalContext.tsx` and `context/ConnectWalletsModalContext.tsx`.

3. Service Layer
   - `services/walletService.ts`: wallet connect/disconnect/status APIs.
   - `services/dashboardService.ts`: security and dashboard API clients.

4. External API Layer
   - Browser-side `fetch` requests to backend endpoints (no in-repo Next.js API handlers).

### 4.2 Extension Runtime Architecture

1. Popup UI Layer
   - Multi-view onboarding flow managed by `popup.js`.

2. Injection Layer
   - Programmatic `chrome.scripting.executeScript` into the active tab, MAIN world, to access `window.ethereum`.

3. Backend Registration Layer
   - POST to `/wallets/connect` with `address`, `chain_id`, `wallet_type`.

4. Local Session Layer
   - Stores connect payload in `chrome.storage.local` under `senseiguard_wallet_connect`.

Not present today:

- `background.service_worker` registration in manifest.
- Declarative `content_scripts`.
- Persistent interception/analysis lifecycle across browsing sessions.

---

## 5) Data Flow

### 5.1 Web App Wallet Connect Flow

1. User connects MetaMask/Coinbase through wagmi.
2. App extracts wallet address and chain ID.
3. App calls backend `POST /wallets/connect`.
4. Backend response is persisted in dashboard user context.
5. Guard routes fetch summary/risk/asset/activity/security datasets from backend APIs.

### 5.2 Extension Wallet Connect Flow

1. User opens popup and selects wallet provider.
2. Extension verifies current tab protocol is HTTP(S).
3. Extension injects script into page MAIN world.
4. Injected script requests `eth_requestAccounts` and `eth_chainId`.
5. Extension posts registration payload to `/wallets/connect`.
6. Result is stored locally via `chrome.storage.local`.

---

## 6) Security Model and Controls

### 6.1 Current Security Positives

- Extension uses minimal permissions (`activeTab`, `scripting`, `storage`) rather than broad host control.
- Extension CSP restricts script execution and narrows allowed network targets.
- Wallet access uses standard EIP-1193 request flow.
- Web app centralizes security intelligence through backend APIs rather than hardcoding trust decisions in UI.

### 6.2 Security Gaps and Operational Risks

1. Web route protection and auth hardening
   - Guard pages are client-driven; no in-repo middleware enforcement is present.

2. Extension architecture depth
   - No background worker or persistent content script means no continuous threat analysis in extension runtime.

3. MAIN-world injection tradeoff
   - Required for provider access but increases dependency on page context integrity.

4. Local storage sensitivity
   - Wallet session metadata is stored in `chrome.storage.local` without additional cryptographic controls.

5. Validation and resilience
   - API payload parsing is largely manual; strict schema validation and network retry/timeouts are limited.

6. Logging hygiene
   - Some client-side debug logging remains in service/UI flows.

---

## 7) Capability Maturity Assessment

### 7.1 Implemented and Functional

- Wallet connection and backend registration (web + extension).
- Backend-driven dashboard summaries and security pages in web app.
- Contract scan and activity/threat views in web routes.
- Referral/waitlist acquisition and persistence.

### 7.2 Partially Implemented or UX Placeholder

- Some notification/threat blocks are static/demo content in guard pages.
- Extension "activate" toggle is visual and not wired to operational controls.
- Extension QR panel is currently placeholder-style behavior.

### 7.3 Not Yet Implemented in Extension

- Persistent content script sensor model.
- Background analyst process for continuous detection.
- Client-side transaction decoding/risk interpretation pipeline.

Conclusion: the web platform is materially ahead of the extension runtime in implemented depth.

---

## 8) Production Readiness: Priority Roadmap

### P0 (Immediate)

1. Extension runtime completion
   - Add `background.service_worker` and robust message bus.
   - Add content script strategy for dApp event capture.

2. Security baseline hardening
   - Remove non-essential debug logs.
   - Standardize API error handling and response validation.
   - Confirm strict CSP/host permissions for every target environment.

3. Environment contract cleanup
   - Fully document required environment variables (including wallet API base URL).
   - Enforce explicit configuration for production/staging separation.

### P1 (Near Term)

1. Detection pipeline quality
   - Introduce strict schemas for inbound/outbound API contracts.
   - Implement deterministic transaction pre-sign analysis response contracts.

2. State and data orchestration
   - Normalize query lifecycle for dashboard data fetching and caching.
   - Reduce monolithic page components into testable modules.

3. UX consistency
   - Eliminate static/demo data from production surfaces or clearly tag as simulation mode.

### P2 (Scale)

1. Telemetry and observability
   - Add structured client telemetry for connect failures, analysis latency, and API error rates.

2. Automated quality gates
   - Add unit/integration tests for services, hooks, and extension flows.
   - Add E2E coverage for wallet connect and guard critical paths.

3. Performance controls
   - Add request timeout/retry policy and graceful degradation for backend partial failures.

---

## 9) Recommended Target Architecture (SenseiGuard Full Model)

To align product promise with implementation, the extension should evolve to a three-brain model:

1. Content Brain (Sensor)
   - Observe dApp interaction context, contract targets, and signing intent.

2. Background Brain (Analyst)
   - Normalize events, call SenseiFi backend intelligence APIs, maintain risk state.

3. Popup Brain (Voice)
   - Render concise verdicts, explain risks, and present safe alternatives/actions.

The backend remains the primary intelligence engine; the extension should focus on fast collection, accurate context delivery, and trustworthy warning UX.

---

## 10) Technical Positioning Statement

SenseiFi currently operates as a hybrid security platform where:

- The web app provides strong user-facing security operations connected to backend intelligence.
- The extension currently delivers onboarding and wallet registration scaffolding.
- The path to a full wallet firewall is clear and feasible but requires architectural completion in extension runtime, stricter validation, and higher test coverage.

This makes SenseiFi production-capable for dashboard-driven security workflows today, while extension-based pre-signing defense should be treated as an active buildout track rather than fully complete capability.

---

## 11) Appendix: Core Files Reviewed

- `app/layout.tsx`
- `app/providers.tsx`
- `app/page.tsx`
- `app/connect-wallet/page.tsx`
- `app/guard/layout.tsx`
- `app/guard/page.tsx`
- `app/guard/wallet-security/page.tsx`
- `app/guard/threat-intelligence/page.tsx`
- `app/guard/activity-monitor/page.tsx`
- `app/guard/contract-scanner/page.tsx`
- `app/guard/settings/page.tsx`
- `hooks/useWallet.ts`
- `services/dashboardService.ts`
- `services/walletService.ts`
- `services/index.ts`
- `context/DashboardUserContext.tsx`
- `context/RescanModalContext.tsx`
- `context/ConnectWalletsModalContext.tsx`
- `extension/manifest.json`
- `extension/popup.html`
- `extension/popup.css`
- `extension/popup.js`
- `extension/wallet-connect.js`
- `extension/config.js`
- `extension/README.md`

