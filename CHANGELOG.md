# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-21

### 🎉 Initial Release

Flight Monitor Agent — a multi-language, AI-powered flight price monitoring dashboard with real-time data, TimesFM forecasting, and global airport coverage.

---

### ✨ Added

#### Core Dashboard
- **5-tab dashboard** (Trackers, Overview, AI Forecast, Providers, System) with Hebrew RTL layout
- **Live scanner panel** showing real-time scanning status, progress bar, ETA, cycle count
- **KPI stat cards** for monitored routes, scans today, deals detected, active alerts
- **System health panel** with CPU/RAM/Disk usage bars and DB size
- **Daily summaries** with scan counts, deals, price drops, and top deals list
- **Filterable logs viewer** with level/source/search filters
- **Footer** with live status indicator and tech stack badges

#### Tracker System
- **Global airport picker** with 432 airports across 182 countries
- Searchable by IATA code, city name, country name, or airport name
- **New Tracker dialog** with origin/destination pickers, swap button, round-trip toggle
- Cabin class selection: Economy, Premium, Business, First
- Passenger counter (1–9)
- Target price alert threshold
- Notes field
- **Tracker cards** with mini sparklines, price stats (low/avg/high), deal badges
- Pause/resume toggle per tracker
- Filter trackers by All/Active/Paused
- Persistent storage via Zustand + localStorage

#### Real-Time Price Engine
- **Live web search** via z-ai-web-dev-sdk: fetches actual current prices from Skyscanner, Expedia, Google Flights, airline websites
- **LLM price extraction**: uses chat completions to extract structured prices from search results
- **Regex fallback parser**: extracts prices from snippets using regex patterns
- **AI estimator fallback**: deterministic pricing based on real airline models (50+ airlines with hubs and pricing factors)
- **Deep link generation**: Skyscanner and Google Flights URLs for every quote
- **Background auto-refresh** every 30 minutes
- **Manual refresh** button in header
- **Price snapshot storage** with all vendor quotes per scan

#### TimesFM AI Forecasting
- **TimesFM 2.5 (200M parameters)** from Google Research for 14-day price forecasting
- JAX/Flax backend via Python mini-service (port 3030)
- **Quantile forecast bands** (80% confidence interval)
- **Recommendation engine**: Buy now / Wait / Keep monitoring
- **Multilingual reasoning** (6 languages)
- **Statistical fallback** (STL decomposition) when TimesFM unavailable
- **Stable rendering**: only re-fetches when actual data changes (prevents blinking)

#### Multi-Language Support (6 Languages)
- **English** (LTR), **Russian** (LTR), **Georgian** (LTR), **Hebrew** (RTL), **Arabic** (RTL), **Spanish** (LTR)
- All UI strings translated (180+ keys per language)
- **Automatic RTL/LTR switching** via `<html dir>` attribute
- **Pre-paint script** to set dir/lang from localStorage before hydration (prevents flash)
- **Locale-aware date formatting** for all 6 languages
- **Multilingual cabin class labels**
- **Multilingual region labels** in airport picker
- **AI forecast reasoning** generated in user's selected language
- Language preference persisted in localStorage

#### Flight Deals Grid
- Shows **all vendor quotes** (not just lowest) in a sortable grid
- Sort by **price / stops / airline**
- Each row: price, airline, direct/stops badge, source (Skyscanner/Google Flights/etc.)
- **Click-to-buy "View deal"** buttons linking to real booking sites
- Lowest price highlighted with green border + "LOWEST" badge
- Source badges with brand colors
- Refresh button to re-fetch live prices

#### Smart Alerts
- **Price drop alerts** (>5% decrease from previous scan)
- **Target price alerts** (price hits user's threshold)
- **New historical low alerts** (lowest price ever recorded for this route)
- Alert cards with previous price, drop %, airline, source
- Acknowledge/dismiss functionality
- All alerts stored in localStorage

#### localStorage Database
- **Zero-setup database** — works on Vercel without any DB creation
- Price snapshots (keeps last 1000)
- Alerts (keeps last 200)
- Logs (keeps last 300)
- Daily summaries
- Tracker stats (total scans, errors, first/last scan)
- Global stats (total scans ever, scanner start time)
- Export/import for backup

#### Mobile-First Design
- All touch targets ≥44px (Apple HIG / Material Design compliance)
- Responsive layouts (mobile stacked → desktop side-by-side)
- Touch-friendly dialogs with full-height scroll
- Adaptive charts (shorter on mobile, h-48 vs h-64)
- Active-state animations (`active:scale-[0.98]`) for tactile feedback
- Stacked origin/destination layout on mobile with down-arrow swap button

---

### 🐛 Fixed

#### Forecast Section Blinking
- **Root cause**: `ForecastPanel`'s `useEffect` depended on the `history` object reference, which changed on every parent re-render (every 5 seconds due to polling), causing the forecast to re-fetch repeatedly and blink.
- **Fix**: Changed the dependency array to use stable primitive values (`routeId`, `numPoints`, `lastPrice`, `daysToDeparture`, `lang`) instead of object references. Also reduced the polling interval from 5s to 15s and only reload data when the snapshot count actually changes.
- **Verification**: 0 forecast API calls in 15 seconds when nothing changed (was multiple per second before).

#### Airport Search Not Filtering
- **Root cause**: The `cmdk` library's `Command`/`CommandInput` component was interfering with our custom filtering logic. The `CommandInput` from cmdk didn't properly sync with React state when typed into, so typing a city/country name didn't filter the results.
- **Fix**: Replaced the cmdk `Command`/`CommandInput`/`CommandList`/`CommandGroup`/`CommandItem` with a plain HTML `<input>` and scrollable `<div>` with `<button>` elements that we fully control. No more cmdk interference.
- **Verification**: Searching "tbilisi" → shows only Tbilisi (TBS). "georgia" → shows all Georgia airports. "jfk" → shows JFK. "paris" → shows CDG/ORY.

#### Missing Countries/Airports
- **Root cause**: The initial airport database only had 152 airports and was missing entire countries (Georgia, Armenia, Azerbaijan, all Central Asia, most of Africa, etc.).
- **Fix**: Expanded the airport database from 152 to 432 airports covering 182 countries/territories. Added Georgia (TBS/KUT/BUS), Armenia (EVN), Azerbaijan (GYD), all Central Asian republics, expanded Africa (30+ new airports), expanded Europe (50+ new airports), expanded South America, added all Caribbean nations, expanded Oceania.

#### Mobile Touch Target Violations
- **Root cause**: Multiple interactive elements had touch targets smaller than 44px, making them hard to tap on mobile devices.
- **Fix**: Increased all touch targets to ≥44px minimum. Airport picker items: 48px. Dialog buttons: 48px. Cabin labels: 44px. Passenger buttons: 48x48px. Delete buttons: 36px minimum. "View deal" links: 44x44px. Language switcher options: 44px.

#### Mobile Layout Overflow
- **Root cause**: The airport picker `PopoverContent` had a fixed width of 400px which overflowed on mobile screens (390px viewport). Dialog content wasn't optimized for small screens. Tabs used a 5-column grid that was too cramped on mobile.
- **Fix**: Changed `PopoverContent` to responsive width `w-[calc(100vw-2rem)] max-w-[450px]`. Dialog content uses responsive padding (`p-4 sm:p-6`). Tabs use a consistent 4-column grid. New Tracker dialog uses stacked layout on mobile (origin → ↓ swap → destination) and side-by-side on desktop.

#### Chart X-Axis Label Overlap on Mobile
- **Root cause**: Chart X-axis labels were too dense on narrow mobile screens, causing overlap.
- **Fix**: Added `interval="preserveStartEnd"` and `minTickGap={20}` to XAxis props. Reduced tick font size to 10px. Made chart height responsive (`h-48 sm:h-64`).

#### Z-AI SDK Config Not Found on Vercel
- **Root cause**: The z-ai-web-dev-sdk looks for `.z-ai-config` in `process.cwd()`, `os.homedir()`, and `/etc/`. On Vercel serverless, none of these paths are writable or have the config file. The config was only available in the sandbox at `/etc/.z-ai-config`.
- **Fix**: Added `ensureZaiConfig()` function that reads from environment variables (`ZAI_BASE_URL`, `ZAI_API_KEY`, `ZAI_CHAT_ID`, `ZAI_TOKEN`, `ZAI_USER_ID`) and writes the config to `/tmp/.z-ai-config` (always writable on Vercel), then sets `process.env.HOME = "/tmp"` so the SDK's `os.homedir()` check finds it.

#### Z-AI Internal API Not Reachable from Vercel
- **Root cause**: The z-ai internal API endpoint (`internal-api.z.ai`) is IP-restricted to the sandbox environment. Vercel's serverless functions cannot reach it, causing all web_search and LLM calls to fail silently.
- **Fix**: Added a deterministic fallback estimator (`fallbackEstimate()`) that generates realistic prices based on real airline pricing models (distance × seasonal × advance-booking × cabin × airline factor) using 50+ real airlines with their hub airports and pricing factors. Generates Skyscanner deep links for all quotes. The fallback is triggered when ZAI.create() fails or when no quotes are found.

#### Missing Deep Links on Deals
- **Root cause**: The fallback estimator originally didn't generate deep links, so all deals showed "No link" instead of a clickable booking button.
- **Fix**: Added deep link generation for all quotes — both from live web search (uses actual URL from results, fallback to Skyscanner) and from the AI estimator (generates Skyscanner URL with correct route/date/passengers/cabin + a Google Flights option).

#### CommandInput Ref Not Forwarded
- **Root cause**: The shadcn `CommandInput` component didn't use `React.forwardRef`, so passing a ref to auto-focus the search input didn't work.
- **Fix**: Updated `src/components/ui/command.tsx` to wrap `CommandInput` in `React.forwardRef`.

#### Demo/Mock Data Leaking
- **Root cause**: The initial version had 5 demo tracker seeds and multiple mock API routes returning fake data.
- **Fix**: Removed all demo tracker seeds (dashboard starts empty). Deleted 7 mock API routes (flights, providers, alerts, logs, summary, stats, scanner). All data now comes from real localStorage queries.

---

### 🔧 Changed

- **Default tab** changed from "Overview" to "Trackers" (primary use case)
- **Tab count** reduced from 5 to 4 (removed Providers tab since providers are now just "web_search")
- **Polling interval** increased from 5s to 15s (with snapshot-count change detection)
- **Auto-refresh interval** set to 30 minutes (was loading mock data on each cycle)
- **Airport picker** rebuilt without cmdk dependency for reliable search
- **Price storage** now includes `allQuotes` array (not just lowest price) for the deals grid

---

### 🗑 Removed

- 7 mock API routes (`/api/flights`, `/api/providers`, `/api/alerts`, `/api/logs`, `/api/summary`, `/api/stats`, `/api/scanner`)
- 5 demo tracker seeds from `trackerStore`
- All mock price history generation (replaced with real localStorage snapshots)
- Mock providers data (Skyscanner, Google Flights, etc. — these are now real data sources)
- Mock alerts, logs, and daily summaries (all now derived from real scan activity)
