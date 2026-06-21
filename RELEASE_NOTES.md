# Release Notes

## v1.0.0 — Initial Release (2026-06-21)

### 🎉 First Public Release

Flight Monitor Agent — a multi-language, AI-powered flight price monitoring dashboard with real-time data, TimesFM forecasting, and global airport coverage.

---

### 🌟 Highlights

#### Real-Time Flight Price Monitoring
- Track any airport pair worldwide (432 airports, 182 countries)
- Live web search prices from Skyscanner, Expedia, Google Flights, and airline websites
- AI-estimated prices with real airline pricing models (50+ airlines)
- Click-to-buy deep links to booking sites
- 30-minute auto-refresh + manual refresh

#### TimesFM 2.5 AI Forecasting
- 14-day price forecast using Google Research's TimesFM 2.5 (200M parameters)
- Quantile forecast bands (80% confidence interval)
- Buy now / Wait / Keep monitoring recommendations
- Multilingual reasoning (6 languages)
- Statistical fallback (STL decomposition) when TimesFM unavailable

#### 6-Language Support
- English, Russian, Georgian, Hebrew, Arabic, Spanish
- Automatic RTL/LTR layout switching
- Locale-aware date formatting
- All UI strings and AI reasoning translated

#### Zero-Setup Database
- localStorage persists all data (trackers, price history, alerts, logs)
- No database creation needed — works immediately on any deployment
- Export/import for backup

#### Smart Alerts
- Price drop alerts (>5% decrease)
- Target price alerts (price hits your threshold)
- New historical low alerts
- All alerts stored with full context

#### Mobile-First Design
- All touch targets ≥44px
- Responsive layouts (mobile stacked → desktop side-by-side)
- Touch-friendly dialogs and charts
- Active-state animations for tactile feedback

---

### 📊 Numbers

| Metric | Value |
|--------|-------|
| Airports | 432 |
| Countries | 182 |
| Languages | 6 |
| Airlines (estimator) | 50+ |
| Translation keys per language | 180+ |
| TimesFM parameters | 200M |
| Forecast horizon | 14 days |
| Auto-refresh interval | 30 minutes |
| localStorage capacity | ~5-10MB |
| Max snapshots stored | 1000 |
| Max alerts stored | 200 |
| Max logs stored | 300 |

---

### 🐛 Notable Bug Fixes

1. **Forecast blinking**: Fixed by using stable primitive dependencies instead of object references
2. **Airport search not filtering**: Fixed by replacing cmdk with plain HTML elements
3. **Missing countries (Georgia, etc.)**: Fixed by expanding airport database from 152 to 432 airports
4. **Mobile touch targets**: Fixed by increasing all interactive elements to ≥44px
5. **Mobile layout overflow**: Fixed with responsive widths and stacked layouts
6. **Chart X-axis overlap**: Fixed with `interval="preserveStartEnd"` and `minTickGap`
7. **Z-AI config on Vercel**: Fixed with `ensureZaiConfig()` writing to `/tmp`
8. **Missing deep links**: Fixed by generating Skyscanner URLs for all quotes

---

### 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State**: Zustand (with persist)
- **AI**: TimesFM 2.5 (JAX/Flax) + z-ai-web-dev-sdk
- **Database**: localStorage (zero-setup)
- **Deployment**: Vercel

---

### 📦 Installation

```bash
git clone https://github.com/your-username/flight-monitor-agent.git
cd flight-monitor-agent
bun install
bun run dev
```

### 🚀 Deployment

```bash
vercel --prod
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.

---

### 🙏 Acknowledgments

- [TimesFM](https://github.com/google-research/timesfm) — Google Research
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Recharts](https://recharts.org/) — Charts
- [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) — AI SDK
- [Lucide](https://lucide.dev/) — Icons

---

### 📄 Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete changelog.
