# Applyr Extension Mockup

A fully working browser extension (Chrome / Firefox / Edge) for the **Applyr** job application tracker.

## What's Included

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration (Manifest V3) |
| `popup.html` | Main extension popup UI |
| `popup.css` | Styles matching your Applyr design system |
| `popup.js` | Logic: auth, theme, add application, stats, recent list |
| `icons/` | Extension icons (16, 32, 48, 128 px) |

## Features

- **Sign In** — Clean login screen with email/password (mock auth via `localStorage`).
- **Register Link** — "Create one now" link at the bottom opens your web app's registration page (set `REGISTER_URL` in `popup.js`).
- **New Application** — Complete form with all fields from your web app:
  - Company * & Position *
  - Status (Wishlist → Accepted)
  - Applied Date, Link, Source
  - Reminder Date, Notes, Tags
- **Live Stats** — Total, In Progress, Rejections, Accepted.
- **Recent Activity** — Last 4 applications with status badges and quick-delete.
- **Dark / Light Mode** — Toggle with persistent preference.
- **Data Persistence** — Uses `localStorage` so data survives browser restarts.

## Design Match

- Monospace font (`JetBrains Mono`) throughout.
- Light mode: white cards with **thick black offset borders** (matches your screenshots).
- Dark mode: near-black background with subtle borders.
- Status badges use the same color mapping as your web dashboard.

## How to Install (Chrome)

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `applyr-extension` folder
5. Click the Applyr icon in your toolbar

## How to Install (Firefox)

1. Open `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` inside the `applyr-extension` folder

## Configuration

Open `popup.js` and edit this line near the top:

```js
const REGISTER_URL = 'https://your-actual-domain.com/register';
```

## Production Notes

- Replace `localStorage` with `chrome.storage.local` / `browser.storage.local` for proper extension isolation.
- Wire `handleLogin()` to your backend API.
- Add service-worker background scripts if you want reminder notifications.

---

Built to match the Applyr design language from your screenshots.
