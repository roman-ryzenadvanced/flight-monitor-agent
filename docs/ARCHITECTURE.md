# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │   React UI   │  │   Zustand    │  │   localStorage DB      ││
│  │  (6 langs)   │  │   Stores     │  │   (snapshots, alerts,  ││
│  │  (RTL/LTR)   │  │  (trackers,  │  │    logs, summaries)    ││
│  │              │  │   i18n)      │  │                        ││
│  └──────┬───────┘  └──────────────┘  └────────────────────────┘│
│         │                                                        │
│         │ fetch()                                                │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes (Server)                    │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │ /api/real-prices   │  │ /api/forecast                       │ │
│  │ (live web search)  │  │ (TimesFM or statistical fallback)   │ │
│  └─────────┬──────────┘  └──────────────┬─────────────────────┘ │
│            │                             │                        │
│            ▼                             ▼                        │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │ z-ai-web-dev-sdk   │  │ Python Forecast Service            │ │
│  │ (web_search +      │  │ (TimesFM 2.5, port 3030)           │ │
│  │  LLM extraction)   │  │ JAX/Flax backend                   │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Tracker Creation
```
User → NewTrackerDialog → trackerStore.addTracker()
                                    ↓
                         Zustand store + localStorage
                                    ↓
                         Background refresh triggers
```

### 2. Price Refresh Cycle
```
startAutoRefresh() (every 30 min)
    ↓
refreshAllTrackers()
    ↓
For each active tracker:
    refreshTrackerPrice(tracker)
        ↓
    POST /api/real-prices
        ↓
    ┌─ ZAI.create() available? (sandbox)
    │   YES → web_search + LLM extraction → real prices
    │   NO  → fallbackEstimate() → AI-estimated prices
    └─
        ↓
    addSnapshot() → localStorage
        ↓
    Generate alerts (price drop, target hit, new low)
        ↓
    addLog() → localStorage
        ↓
    Update daily summary
```

### 3. Forecast Generation
```
User selects tracker → ForecastPanel renders
    ↓
useEffect (deps: routeId, numPoints, lastPrice, daysToDep, lang)
    ↓
POST /api/forecast
    ↓
┌─ Python service (localhost:3030) reachable?
│   YES → TimesFM 2.5 forecast (JAX/Flax)
│   NO  → TS statistical fallback (STL decomposition)
└─
    ↓
buildRecommendation(history, forecast, lower, upper, daysToDep, lang)
    ↓
Return: { forecast, lower, upper, recommendation, confidence, reasoning }
```

## Key Design Decisions

### 1. localStorage as Database
**Why**: Zero-setup — works on Vercel without any DB creation. Each user's data stays in their browser.

**Trade-offs**:
- ✅ No server costs, no DB management
- ✅ Works offline after initial load
- ✅ No privacy concerns (data never leaves browser)
- ❌ Data is per-device (not synced across devices)
- ❌ Limited storage (~5-10MB per origin)

**Mitigation**: Automatic cleanup (keeps last 1000 snapshots, 200 alerts, 300 logs). Export/import for backup.

### 2. Dual Price Source (Live Search + AI Estimator)
**Why**: The z-ai internal API is IP-restricted to the sandbox. Vercel serverless can't reach it.

**Strategy**:
- **Sandbox (local dev)**: Live web search via z-ai SDK → real prices from Skyscanner/Expedia/airlines
- **Vercel (production)**: AI estimator with real airline pricing models → realistic prices + Skyscanner deep links

### 3. TimesFM Python Service
**Why**: TimesFM requires JAX/Python which can't run in Next.js serverless functions.

**Architecture**: Separate Python HTTP service (port 3030) that loads TimesFM 2.5 at startup. The Next.js `/api/forecast` route proxies to it with an 8-second timeout, falling back to a TS statistical forecaster if unreachable.

### 4. cmdk Replacement
**Why**: The cmdk library's Command component interfered with our custom airport filtering — typed text didn't sync with React state.

**Solution**: Replaced cmdk's Command/CommandInput/CommandList with plain HTML `<input>` + `<div>` + `<button>` elements that we fully control. This ensures reliable search on all platforms.

### 5. Stable Forecast Dependencies
**Why**: The forecast panel was blinking because `useEffect` depended on object references that changed on every parent re-render.

**Solution**: Changed dependency array to use stable primitive values (routeId, numPoints, lastPrice, daysToDeparture, lang) instead of the `history` object reference.

## File Responsibilities

| File | Responsibility |
|------|---------------|
| `src/lib/airports.ts` | 432 airports across 182 countries + region labels |
| `src/lib/realFlights.ts` | Live price fetcher (z-ai SDK) + AI estimator fallback |
| `src/lib/localDb.ts` | localStorage CRUD layer for all persistent data |
| `src/lib/priceRefresh.ts` | Background price refresh service + alert generation |
| `src/lib/priceEngine.ts` | Deterministic price engine + date utilities |
| `src/lib/trackerStore.ts` | Zustand store for trackers (with localStorage persist) |
| `src/lib/i18n/translations.ts` | 6-language translation dictionaries |
| `src/lib/i18n/index.ts` | i18n Zustand store + hooks |
| `src/app/page.tsx` | Main dashboard with 4 tabs |
| `src/app/api/real-prices/route.ts` | Live price search endpoint |
| `src/app/api/forecast/route.ts` | TimesFM forecast endpoint (with fallback) |
| `mini-services/forecast-service/index.py` | TimesFM Python service |
