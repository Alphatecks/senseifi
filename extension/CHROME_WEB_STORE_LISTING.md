# Chrome Web Store — listing copy (SenseiFi Trade Insight)

Use the sections below in the Developer Dashboard where each field applies. Wording matches the current manifest and runtime behavior.

## Single purpose

SenseiFi Trade Insight has one purpose: **help protect you when using a crypto wallet on websites** by analyzing wallet-related actions (such as transactions and site connections), estimating risk, and **warning or blocking** activity that looks dangerous using SenseiFi security checks and on-device alerts.

## Broad host / site access — short justification

**`http://*/*` and `https://*/*` (optional)** — Wallet usage happens on many different dApp URLs we cannot list ahead of time. Optional broad site access lets us inject our packaged protection script on pages you visit **after you choose to allow it**, monitor risky signing flows, and (when you connect a wallet) reach the page’s injected wallet provider. We do not load remote executable code from websites; scripts ship inside the extension package.

**`https://senseifi-backend.onrender.com/*`** — Our API performs transaction and site risk analysis, serves a threat-intelligence feed, receives queued security telemetry, and handles wallet registration when you connect. Calls use HTTPS JSON APIs only.

## Permission justifications (paste per field)

**activeTab** — When you connect a wallet from the popup, we need access to the tab you currently have open so we can run a short script in that page’s main world and talk to the wallet provider the site injected.

**scripting** — We inject our packaged `inpage-hook.js` into pages (and refresh it on navigation) for transaction monitoring and prompts. We also run a small main-world function when you connect a wallet. All code is bundled in the extension.

**storage** — Stores your settings, alert history, risk cache, wallet session, and a small telemetry queue locally so the extension works after restarts.

**tabs** — We read tab IDs and URLs to inject protection on the correct pages, react when you navigate, and target the active tab when you connect a wallet.

**webNavigation** — We react when a navigation commits so we can attach protection early and evaluate top-level domains for phishing signals.

**notifications** — Alerts you when we block or warn on a risky transaction or flag a suspicious domain (not used for ads).

**alarms** — Wakes the service worker on a schedule to sync threat intelligence and flush queued telemetry (background scripts can sleep when idle).

## Privacy policy

Publish a **public HTTPS URL** to your privacy policy. It must describe extension data practices; the site policy should include section **2.6** (SenseiFi Trade Insight extension) in `views/PrivacyPolicyScreen.tsx` or equivalent legal page.

## Optional site permission (reviewer note)

Broad `http(s)://*/*` access is declared as **`optional_host_permissions`**. The popup prompts the user to **Allow** site protection; wallet connect also requests this permission if needed. The API host remains a **required** `host_permission` for backend calls.
