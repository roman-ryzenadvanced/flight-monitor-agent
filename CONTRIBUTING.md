# Contributing

Thank you for your interest in contributing to Flight Monitor Agent! This document outlines the guidelines for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/flight-monitor-agent.git
   cd flight-monitor-agent
   ```
3. **Install dependencies**:
   ```bash
   bun install
   ```
4. **Start the dev server**:
   ```bash
   bun run dev
   ```
5. **(Optional) Start TimesFM service** for AI forecasting:
   ```bash
   cd mini-services/forecast-service
   pip install timesfm jax jaxlib einshape flax jaxtyping
   python index.py
   ```

## 🛠 Development Workflow

### Code Style

- **TypeScript** throughout with strict typing
- **ESLint** — run `bun run lint` before committing
- **shadcn/ui** components preferred over custom implementations
- **Tailwind CSS 4** for styling (no inline styles)
- Use `'use client'` directive for client-side components

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new tracker filter option
fix: resolve airport search not filtering by city name
docs: update TimesFM integration guide
test: add price engine unit tests
refactor: simplify forecast API route
```

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes** and ensure linting passes:
   ```bash
   bun run lint
   ```
3. **Test your changes** thoroughly in the browser
4. **Commit with a clear message** (see above)
5. **Push to your fork** and create a Pull Request

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Test improvement

## Testing
Describe how you tested this change.

## Checklist
- [ ] Code follows the style guidelines (lint passes)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings introduced
```

## 📋 Code Organization

### Adding a New Component

1. Create the component in `src/components/dashboard/`
2. Use `"use client"` directive if it needs client-side features
3. Use shadcn/ui components where possible
4. Add i18n support via `useT()` hook
5. Ensure mobile responsiveness (touch targets ≥44px)
6. Export from the component file

### Adding a New Translation Key

1. Add the key to ALL 6 language dictionaries in `src/lib/i18n/translations.ts`
2. Use the key in components via `t("yourKey")`
3. Test in all 6 languages

### Adding a New Airport

1. Add the airport to the `airports` array in `src/lib/airports.ts`
2. Use the correct IATA code, coordinates, country code, and region
3. Verify it appears in the airport picker search

### Modifying the Price Engine

1. Edit `src/lib/priceEngine.ts` for deterministic pricing
2. Edit `src/lib/realFlights.ts` for live/AI-estimated pricing
3. Test with multiple routes to verify reasonable prices
4. Ensure prices are deterministic (same inputs → same outputs)

## 🧪 Testing

### Manual Testing

1. **Airport search**: Search by IATA code, city, country, and partial names
2. **Tracker creation**: Create trackers for various routes
3. **Price refresh**: Verify prices appear after refresh
4. **Forecast**: Verify TimesFM forecast displays correctly
5. **Alerts**: Verify price drop and target alerts fire
6. **Mobile**: Test at 390x844 viewport (iPhone 14 Pro)
7. **Languages**: Switch between all 6 languages
8. **RTL**: Verify Hebrew and Arabic layout

### Automated Tests

```bash
# Install test dependencies
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom

# Run tests
bun run test
```

Test files are in `tests/` directory.

## 🌍 Internationalization

When adding UI text:
1. **Never hardcode strings** — always use translation keys
2. **Add to all 6 languages** — English, Russian, Georgian, Hebrew, Arabic, Spanish
3. **Consider RTL** — test Hebrew and Arabic layouts
4. **Use locale-aware dates** — see `formatDateShort()` in `priceEngine.ts`

## 📱 Mobile Guidelines

- All touch targets must be ≥44px (Apple HIG / Material Design)
- Use responsive prefixes (`sm:`, `md:`, `lg:`)
- Test on 390px viewport (iPhone width)
- Dialogs should be full-height with scroll on mobile
- Charts should be shorter on mobile (`h-48 sm:h-64`)

## 🐛 Bug Reports

When filing a bug report, include:
1. **Description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment** (browser, OS, language setting)
7. **Console errors** (if any)

## 💡 Feature Requests

Feature requests are welcome! Please:
1. Check if the feature already exists
2. Describe the use case
3. Explain why it would be valuable
4. Consider implementation approach

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
