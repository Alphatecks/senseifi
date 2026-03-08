# SenseiFi Trade Insight – Chrome Extension

Trade insight dashboard UI for the SenseiFi Chrome extension. Matches the design: summary cards (Active Extensions, Contract Scanned, Connected Wallet, Unread Alerts) and a Trade insight table with search, filter, and time range.

## Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder (this directory)

## UI

- **Header:** SenseiFi + “Trade insight” badge
- **4 cards:** Active Extensions (3, +2.3%), Contract Scanned (12, +2.3%), Connected Wallet (6), Unread Alerts (6, −2.3%, 1 high risk)
- **Trade insight:** Search bar, filter icon, 7 days dropdown, table (Wallet/dApp, Network, Activity Type, Risk Level, AI Insight Shown, Date)
- **Theme:** Dark (#0a0a1a, #191d35) aligned with the main app

## Next steps

- Add icons: place `icon16.png`, `icon48.png`, `icon128.png` in an `icons/` folder and add the `icons` and `action.default_icon` entries back to `manifest.json`.
- Wire `popup.js` to your API for real trade insight data (e.g. dashboard/activity-monitor or a dedicated extension endpoint).
