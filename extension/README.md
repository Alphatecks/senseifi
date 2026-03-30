# SenseiFi Trade Insight – Chrome Extension

SenseiGuard extension for real-time wallet protection. The current runtime now includes:

- A popup UX for onboarding + wallet connection
- A background service worker as the security coordinator
- A content script + in-page provider hook to intercept signing/transaction methods
- Policy enforcement, alerting, domain monitoring, and telemetry queueing

## Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder (this directory)

## Runtime architecture

- **Popup (`popup.html`, `popup.js`):** onboarding flow and wallet connect controls, current protection toggle, latest alert snapshot.
- **Background (`background.js`):** central brain for message routing, tx risk decisions, domain risk checks, policy logic, state/session, notifications, and telemetry.
- **Content script (`content-script.js`):** bridge between page context and background worker.
- **In-page hook (`inpage-hook.js`):** wraps `ethereum.request` for:
  - `eth_sendTransaction`
  - `eth_sign`
  - `eth_signTypedData`
  - `eth_signTypedData_v3`
  - `eth_signTypedData_v4`

## Branding

- **Extension icon (toolbar + `chrome://extensions`):** **`manifest.json`** → `icons` and `action.default_icon` use **`assets/scaled_logo.png`** (16/32/48/128; Chrome scales the same asset).
- Popup uses **`assets/scaled_logo.png`** — same file as the web app’s **`public/images/scaled_logo.png`** (Header + guard layout). Copy it again if the frontend logo is updated.
- Typography: **Satoshi** (`assets/fonts/satoshi/*.otf`) — same as **`app/globals.css`**. Re-copy from **`public/fonts/satoshi/`** if fonts are updated.
- **Shield** icon: **`assets/icons/Shield.png`** — copy from **`assets/icons/Shield.png`** in the repo if updated.
- **Connect Wallet** step loads wallet logos + QR from HTTPS URLs allowed in **`manifest.json`** `content_security_policy` (`upload.wikimedia.org`, `pbs.twimg.com`, `api.qrserver.com`). Update CSP if you change image hosts.

## Wallet + backend

- Same contract as **`services/walletService.ts`**: **`POST {base}/wallets/connect`** with `{ address, chain_id, wallet_type }`. Base URL: **`config.js`** → `SENSEIGUARD.WALLET_API_BASE_URL` (default matches `NEXT_PUBLIC_WALLET_API_URL`).
- **Permissions:** `activeTab`, `scripting`, `storage`, `tabs`, `webNavigation`, `notifications`, `alarms`.
- **Host permissions:** API origin + `http/https` web pages for monitoring/interception.
- **`wallet-connect.js`** runs `eth_requestAccounts` in the **active tab’s MAIN world** (wallets inject on web pages, not in the popup), then notifies background with `SENSEIGUARD_REGISTER_WALLET`.
- **Usage:** Focus a normal **`https://`** tab → open the popup → **Connect** (pick MetaMask or Coinbase, or use the main button after a row sets the provider). Approve in the wallet.
- Response is stored under **`chrome.storage.local`** key **`senseiguard_wallet_connect`**.

## Decision flow (high level)

1. Page calls a watched wallet method.
2. `inpage-hook.js` sends payload to `content-script.js`.
3. Content script forwards to `background.js` (`SENSEIGUARD_EVALUATE_TX`).
4. Background computes local heuristics, calls backend risk API, applies policy thresholds.
5. Decision (`allow`/`warn`/`block`) returns to page and is enforced before signing proceeds.

## Next steps

- Integrate signed user decision prompts (approve/deny) for warning-level events.
- Wire dynamic backend feeds for scam contracts/phishing domains.
- Add e2e tests around interception and policy enforcement.
