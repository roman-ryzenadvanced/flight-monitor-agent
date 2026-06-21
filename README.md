# Flight Monitor Agent

> A multi-language, AI-powered flight price monitoring dashboard with real-time data, TimesFM forecasting, and global airport coverage.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![TimesFM](https://img.shields.io/badge/TimesFM-2.5-orange.svg)](https://github.com/google-research/timesfm)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Multi-Language Support](#multi-language-support)
- [TimesFM Integration](#timesfm-integration)
- [Real-Time Data](#real-time-data)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

Flight Monitor Agent is a production-ready web application that monitors flight prices across **432 airports in 182 countries** worldwide. It combines **real-time web search** for live pricing with **Google Research's TimesFM 2.5** foundation model for 14-day price forecasting, all wrapped in a **6-language** RTL/LTR-aware interface.

The app stores all data in the browser's `localStorage` — **zero database setup required**. Track any airport pair, get alerts when prices drop, view AI-powered buy/wait/monitor recommendations, and click through to booking sites.

### What makes this special?

- **No mock data** — every price is fetched live via web search or estimated using real airline pricing models
- **No database setup** — localStorage persists everything (trackers, price history, alerts, logs)
- **TimesFM 2.5** — Google Research's 200M-parameter time-series foundation model for forecasting
- **6 languages** — English, Russian, Georgian, Hebrew, Arabic, Spanish with automatic RTL switching
- **432 airports** — every country with commercial aviation is represented
- **Click-to-buy** — every deal links directly to Skyscanner/Google Flights/airline websites

---

## ✨ Features

### 🛫 Tracker System
- Track **any airport pair worldwide** (432 airports, 182 countries)
- Round-trip and one-way support
- Cabin classes: Economy, Premium, Business, First
- 1–9 passengers
- Target price alerts (get notified when price hits your threshold)
- Pause/resume individual trackers
- Persistent storage via localStorage

### 📊 Real-Time Price Engine
- **Live web search** (sandbox): Fetches actual current prices from Skyscanner, Expedia, Google Flights, airline websites
- **AI estimator** (Vercel/serverless): Deterministic pricing based on real airline models (distance × seasonal × advance-booking × cabin × airline factor)
- 50+ real airlines with hub airports and pricing factors
- Deep links to booking sites for every quote
- 30-minute auto-refresh + manual refresh button

### 🧠 TimesFM AI Forecasting
- 14-day price forecast using **TimesFM 2.5 (200M parameters)** from Google Research
- Quantile forecast bands (80% confidence interval)
- Buy now / Wait / Keep monitoring recommendations
- Multilingual reasoning (6 languages)
- Falls back to statistical STL-decomposition if TimesFM unavailable

### 🌍 Multi-Language Support (6 Languages)
| Language | Code | Direction | Native Name |
|----------|------|-----------|-------------|
| English  | `en` | LTR       | English     |
| Russian  | `ru` | LTR       | Русский     |
| Georgian | `ka` | LTR       | ქართული     |
| Hebrew   | `he` | RTL       | עברית       |
| Arabic   | `ar` | RTL       | العربية      |
| Spanish  | `es` | LTR       | Español     |

- All UI strings translated
- Automatic RTL/LTR layout switching
- Locale-aware date formatting
- Multilingual cabin class labels and region names
- AI forecast reasoning in user's selected language
- Language preference persisted in localStorage

### 🔔 Smart Alerts
- **Price drop alerts** (>5% decrease from previous scan)
- **Target price alerts** (price hits your threshold)
- **New historical low alerts** (lowest price ever recorded)
- Acknowledge/dismiss alerts
- All alerts stored with full context (previous price, drop %, airline, source)

### 📈 Dashboard
- **Trackers tab**: Grid of tracker cards with sparklines, price stats, deal badges
- **Overview tab**: KPIs, live scanner status, recent alerts, hot routes, system health
- **AI Forecast tab**: TimesFM 14-day forecast with confidence bands and recommendations
- **System tab**: Health metrics, resource usage, daily summaries, filterable activity logs

### 📱 Mobile-First Design
- All touch targets ≥44px (Apple HIG / Material Design compliance)
- Responsive layouts (mobile stacked → desktop side-by-side)
- Touch-friendly dialogs with full-height scroll
- Adaptive charts (shorter on mobile)
- Active-state animations for tactile feedback

---

## 🌐 Live Demo

**Vercel Deployment:** https://my-project-three-zeta-61.vercel.app/

> **Note:** On Vercel, prices use the AI estimator (the z-ai internal API is IP-restricted to the sandbox). For live web search prices, run locally.

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Charts | Recharts |
| Animations | Framer Motion |
| State | Zustand (with persist middleware) |
| Icons | Lucide React |
| AI Forecasting | TimesFM 2.5 (200M, JAX/Flax backend) |
| Real Prices | z-ai-web-dev-sdk (web_search + LLM) |
| Database | localStorage (zero-setup) |
| Deployment | Vercel |
| Python Service | Python 3.12 + stdlib HTTP server |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ / Bun
- Python 3.10+ (optional, for TimesFM forecasting service)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flight-monitor-agent.git
cd flight-monitor-agent

# Install dependencies
bun install

# (Optional) Install TimesFM for local forecasting
pip install timesfm jax jaxlib einshape flax jaxtyping
```

### Development

```bash
# Start the Next.js dev server
bun run dev

# (Optional) Start the TimesFM forecast service in another terminal
cd mini-services/forecast-service
python index.py
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
bun run build
bun run start
```

---

## 📁 Project Structure

```
flight-monitor-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── forecast/route.ts        # TimesFM forecast endpoint
│   │   │   └── real-prices/route.ts     # Live price search endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx                   # Root layout with RTL/LTR sync
│   │   └── page.tsx                     # Main dashboard (4 tabs)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AirportCombobox.tsx      # Searchable airport picker (432 airports)
│   │   │   ├── FlightDealsGrid.tsx      # Vendor deals grid with click-to-buy
│   │   │   ├── ForecastPanel.tsx        # TimesFM forecast display
│   │   │   ├── LanguageSwitcher.tsx     # 6-language dropdown
│   │   │   ├── LanguageDirSync.tsx      # RTL/LTR attribute sync
│   │   │   ├── NewTrackerDialog.tsx     # Create tracker modal
│   │   │   ├── PriceHistoryChart.tsx    # Recharts area chart
│   │   │   ├── TrackerCard.tsx          # Tracker card with sparkline
│   │   │   ├── LogsViewer.tsx           # Filterable activity logs
│   │   │   ├── ScannerPanel.tsx         # Live scanner status
│   │   │   ├── StatCard.tsx             # KPI card
│   │   │   ├── Sparkline.tsx            # Mini SVG sparkline
│   │   │   └── ...
│   │   └── ui/                          # shadcn/ui components
│   └── lib/
│       ├── airports.ts                  # 432 airports, 182 countries
│       ├── realFlights.ts               # Live price fetcher + AI estimator
│       ├── localDb.ts                   # localStorage database layer
│       ├── priceRefresh.ts              # Background price refresh service
│       ├── priceEngine.ts               # Deterministic price engine
│       ├── trackerStore.ts              # Zustand tracker store
│       └── i18n/
│           ├── translations.ts          # 6-language dictionaries
│           └── index.ts                 # i18n store + hooks
├── mini-services/
│   └── forecast-service/
│       └── index.py                     # TimesFM Python service (port 3030)
├── tests/
│   ├── README.md                        # Test documentation
│   ├── airport-search.test.ts           # Airport search tests
│   ├── price-engine.test.ts             # Price engine tests
│   ├── i18n.test.ts                     # Translation tests
│   └── mobile-ui.test.ts                # Mobile UI tests
├── docs/
│   ├── ARCHITECTURE.md                  # System architecture
│   ├── TIMESFM.md                       # TimesFM integration guide
│   ├── I18N.md                          # Internationalization guide
│   └── DEPLOYMENT.md                    # Deployment guide
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  React UI   │  │  Zustand     │  │  localStorage DB   │ │
│  │  (6 langs)  │  │  Stores      │  │  (snapshots,       │ │
│  │  (RTL/LTR)  │  │  (trackers,  │  │   alerts, logs)    │ │
│  │             │  │   i18n)      │  │                    │ │
│  └──────┬──────┘  └──────────────┘  └────────────────────┘ │
│         │                                                     │
│         │ fetch()                                             │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                          │
│  ┌──────────────────┐  ┌──────────────────────────────────┐│
│  │ /api/real-prices │  │ /api/forecast                     ││
│  │ (live web search)│  │ (TimesFM or statistical fallback) ││
│  └────────┬─────────┘  └────────────┬─────────────────────┘│
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌──────────────────┐  ┌──────────────────────────────────┐│
│  │ z-ai-web-dev-sdk │  │ Python Forecast Service          ││
│  │ (web_search +    │  │ (TimesFM 2.5, port 3030)         ││
│  │  LLM extraction) │  │ JAX/Flax backend                 ││
│  └──────────────────┘  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates a tracker** → stored in Zustand + localStorage
2. **Background refresh** (every 30 min) → calls `/api/real-prices`
3. **API route** → uses z-ai SDK to web-search live prices → LLM extracts structured quotes
4. **Price snapshot** stored in localStorage with all vendor quotes
5. **Alerts generated** if price dropped >5%, hit target, or new historical low
6. **Forecast panel** → calls `/api/forecast` → proxies to Python TimesFM service
7. **TimesFM** analyzes price history → 14-day forecast + recommendation

---

## 🌍 Multi-Language Support

The app supports 6 languages with full RTL/LTR switching. See [docs/I18N.md](docs/I18N.md) for details.

### Adding a new language

1. Add the language code to `Language` type in `src/lib/i18n/translations.ts`
2. Add a new dictionary with all translation keys
3. Add the language metadata to the `languages` array
4. Add region label translations in `src/lib/airports.ts`
5. Add cabin label translations in `src/lib/priceEngine.ts`

---

## 🧠 TimesFM Integration

The app uses [TimesFM 2.5](https://github.com/google-research/timesfm) (200M parameters) from Google Research for price forecasting. See [docs/TIMESFM.md](docs/TIMESFM.md) for setup details.

### How it works

1. The Next.js `/api/forecast` route receives price history + user's language
2. It proxies to the Python service at `localhost:3030`
3. The Python service loads TimesFM 2.5 (flax backend) via JAX
4. TimesFM produces a 14-day forecast with quantile bands
5. A recommendation engine combines forecast + historical stats + days-to-departure
6. Reasoning text is generated in the user's selected language
7. If Python is unavailable, a TS statistical fallback (STL decomposition) is used

---

## ⚡ Real-Time Data

### Local Sandbox (Live Web Search)
- Uses `z-ai-web-dev-sdk` to search the web for current flight prices
- LLM extracts structured prices from search results
- Fetches from Skyscanner, Expedia, Google Flights, airline websites

### Vercel (AI Estimator)
- The z-ai internal API is IP-restricted to the sandbox
- Falls back to a deterministic price estimator based on real airline models
- Uses 50+ real airlines with hub airports and pricing factors
- Generates Skyscanner deep links for all quotes

---

## 📡 API Reference

### `POST /api/real-prices`

Fetch real flight prices for a route.

**Request:**
```json
{
  "originIata": "TLV",
  "destIata": "JFK",
  "departDate": "2026-08-15",
  "returnDate": "2026-08-25",
  "cabin": "economy",
  "passengers": 1
}
```

**Response:**
```json
{
  "quotes": [
    {
      "price": 416,
      "currency": "USD",
      "airline": "Unknown",
      "stops": 0,
      "source": "skyscanner.com",
      "deepLink": "https://www.skyscanner.com/...",
      "fetchedAt": "2026-06-21T19:20:34.277Z"
    }
  ],
  "lowest": { ... },
  "average": 615,
  "dataSource": "live_search",
  "distanceKm": 9116
}
```

### `POST /api/forecast`

Get a 14-day TimesFM price forecast.

**Request:**
```json
{
  "history": [200, 210, 215, 205, 195, ...],
  "routeId": "trk_abc123",
  "horizon": 14,
  "lang": "es",
  "route": {
    "daysToDeparture": 45
  }
}
```

**Response:**
```json
{
  "model": "timesfm-2.5-200M-flax",
  "forecast": [185.98, 193.82, 199.79, ...],
  "lower": [185.98, 193.82, 186.97, ...],
  "upper": [210.34, 196.42, 229.05, ...],
  "recommendation": "buy_now",
  "confidence": 92,
  "expectedChangePct": 6.4,
  "reasoning": "El precio está cerca del mínimo histórico ($182)...",
  "usedTimesFM": true,
  "lang": "es"
}
```

---

## 🧪 Testing

See [tests/README.md](tests/README.md) for comprehensive test documentation.

### Test categories

- **Airport search tests**: Verify city/country/IATA filtering
- **Price engine tests**: Verify deterministic pricing
- **i18n tests**: Verify all 6 language translations
- **Mobile UI tests**: Verify touch targets and responsive layouts
- **Forecast tests**: Verify TimesFM integration and fallback
- **Alert tests**: Verify price drop/target/historical low detection

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment variables** (for z-ai SDK on Vercel):
- `ZAI_BASE_URL` — z-ai API base URL
- `ZAI_API_KEY` — z-ai API key
- `ZAI_CHAT_ID` — chat session ID
- `ZAI_TOKEN` — auth token
- `ZAI_USER_ID` — user ID

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.

### Local with TimesFM

```bash
# Terminal 1: Start TimesFM service
cd mini-services/forecast-service
pip install timesfm jax jaxlib einshape flax jaxtyping
python index.py

# Terminal 2: Start Next.js
bun run dev
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [TimesFM](https://github.com/google-research/timesfm) — Google Research's time-series foundation model
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Recharts](https://recharts.org/) — Charting library
- [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) — AI SDK for web search and LLM
