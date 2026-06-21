# Deployment Guide

## Vercel (Recommended)

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod --yes
```

### Environment Variables

Set these in the Vercel dashboard (Settings → Environment Variables) or via CLI:

```bash
vercel env add ZAI_BASE_URL production
vercel env add ZAI_API_KEY production
vercel env add ZAI_CHAT_ID production
vercel env add ZAI_TOKEN production
vercel env add ZAI_USER_ID production
```

| Variable | Description | Required |
|----------|-------------|----------|
| `ZAI_BASE_URL` | z-ai API base URL (e.g., `https://internal-api.z.ai/v1`) | Yes* |
| `ZAI_API_KEY` | z-ai API key | Yes* |
| `ZAI_CHAT_ID` | Chat session ID | Optional |
| `ZAI_TOKEN` | Auth token | Optional |
| `ZAI_USER_ID` | User ID | Optional |

*Required only for live web search. If not set, the app uses the AI estimator fallback.

### How Z-AI Config Works on Vercel

The z-ai-web-dev-sdk looks for `.z-ai-config` in `process.cwd()`, `os.homedir()`, and `/etc/`. On Vercel serverless, none of these are writable by default.

The app includes `ensureZaiConfig()` in `src/lib/realFlights.ts` which:
1. Reads env vars `ZAI_BASE_URL` and `ZAI_API_KEY`
2. Writes a `.z-ai-config` JSON file to `/tmp/` (always writable on Vercel)
3. Sets `process.env.HOME = "/tmp"` so the SDK finds the config

> **Note**: Even with correct config, the z-ai internal API may be IP-restricted. On Vercel, the app falls back to the AI estimator automatically.

---

## Local Development with TimesFM

### Prerequisites

- Node.js 18+ or Bun
- Python 3.10+

### Setup

```bash
# Install Node dependencies
bun install

# Install Python dependencies for TimesFM
pip install timesfm jax jaxlib einshape flax jaxtyping numpy
```

### Run

```bash
# Terminal 1: Start TimesFM forecast service
cd mini-services/forecast-service
python index.py
# → Service starts on http://localhost:3030

# Terminal 2: Start Next.js dev server
bun run dev
# → App starts on http://localhost:3000
```

### Verify

```bash
# Check TimesFM service health
curl http://localhost:3030/health
# → {"status":"ok","model_loaded":true,...}

# Test live prices (requires z-ai SDK)
curl -X POST http://localhost:3000/api/real-prices \
  -H "Content-Type: application/json" \
  -d '{"originIata":"TLV","destIata":"TBS","departDate":"2026-08-15","cabin":"economy","passengers":1}'

# Test forecast
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"history":[200,210,215,205,195],"horizon":7,"lang":"en","daysToDeparture":45}'
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

### Docker Compose (with TimesFM)

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ZAI_BASE_URL=https://internal-api.z.ai/v1
      - ZAI_API_KEY=your-key

  forecast:
    image: python:3.12-slim
    working_dir: /app
    volumes:
      - ./mini-services/forecast-service:/app
      - forecast-models:/root/.cache
    command: pip install timesfm jax jaxlib einshape flax jaxtyping numpy && python index.py
    ports:
      - "3030:3030"

volumes:
  forecast-models:
```

---

## Coolify Deployment

The original project was designed to run on Coolify (self-hosted PaaS). Configuration:

1. **Service Type**: Dockerfile
2. **Port**: 3000
3. **Health Check**: `GET /` (returns 200)
4. **Volumes**: None required (localStorage is client-side)
5. **Environment**: Set `ZAI_*` variables as needed

### With TimesFM Sidecar

Add a second service for the Python forecast service:
- **Service Type**: Dockerfile (Python)
- **Port**: 3030
- **Health Check**: `GET /health`
- **Internal Network**: Connect to main app via `forecast:3030`

Update `src/lib/realFlights.ts` to point to `http://forecast:3030` instead of `localhost:3030`.

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `ZAI_BASE_URL` | — | z-ai API base URL |
| `ZAI_API_KEY` | — | z-ai API key |
| `ZAI_CHAT_ID` | — | Chat session ID |
| `ZAI_TOKEN` | — | Auth token |
| `ZAI_USER_ID` | — | User ID |
| `DATABASE_URL` | `file:./db/custom.db` | Prisma DB URL (unused — localStorage is primary) |

---

## Troubleshooting

### "Configuration file not found" on Vercel
The `ensureZaiConfig()` function should handle this. If it persists, verify the env vars are set in the Vercel dashboard.

### TimesFM service unreachable
Check that `http://localhost:3030/health` returns `{"status":"ok"}`. If not, restart the Python service.

### Forecast falls back to statistical
This is expected on Vercel (Python service not available). The statistical fallback produces reasonable forecasts using STL decomposition.

### Prices show "No link"
This happens when the AI estimator doesn't generate deep links. The latest version generates Skyscanner URLs for all quotes. Make sure you're running the latest code.
