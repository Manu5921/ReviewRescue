# Quick Start Guide: Review Rescue Chrome Extension

**Feature**: Review Rescue Chrome Extension
**Date**: 2025-10-08
**Purpose**: Developer onboarding and local development setup

---

## Overview

Review Rescue is a Chrome extension that helps users manage and export their Google reviews with AI-powered insights. This guide will get you up and running with local development in under 15 minutes.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ and npm 9+ installed ([download](https://nodejs.org/))
- **Google Chrome** browser 120+ ([download](https://www.google.com/chrome/))
- **Git** installed ([download](https://git-scm.com/))
- A **Google Cloud Console** account for OAuth2 credentials ([console](https://console.cloud.google.com/))
- An **Anthropic API key** or **OpenAI API key** for AI insights ([get key](https://console.anthropic.com/))

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/review-rescue.git
cd review-rescue

# Install dependencies
npm install

# Verify installation
npm run check
```

**Expected output**: All dependencies installed, TypeScript compiler ready.

---

## Step 2: Configure Environment

Create environment configuration file:

```bash
# Copy example config
cp config/.env.example config/.env

# Edit with your credentials
nano config/.env  # or use your preferred editor
```

**Required environment variables**:

```env
# Google OAuth2 (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Service (choose one)
ANTHROPIC_API_KEY=sk-ant-api03-...  # Claude API key
# OR
OPENAI_API_KEY=sk-...  # OpenAI API key

# Extension Configuration
EXTENSION_ID=  # Leave empty for local development
NODE_ENV=development
```

### Getting Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google My Business API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Chrome Extension**
6. Add authorized redirect URI: `https://<extension-id>.chromiumapp.org/`
   - For local dev, use any ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)
7. Copy **Client ID** and **Client Secret** to `.env`

### Getting AI API Keys

**Claude (recommended)**:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account and add payment method
3. Generate API key → Copy to `.env` as `ANTHROPIC_API_KEY`

**OpenAI (fallback)**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and add payment method
3. Generate API key → Copy to `.env` as `OPENAI_API_KEY`

---

## Step 3: Build the Extension

```bash
# Development build (with watch mode)
npm run dev

# Production build (minified)
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

**Output directory**: `dist/` - This is the compiled extension ready to load in Chrome.

**Development build output**:
```
dist/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── styles/
    └── popup.css
```

---

## Step 4: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` directory from your project
5. Extension should now appear with Review Rescue icon

**Verify installation**:
- Extension icon appears in Chrome toolbar
- Click icon → popup opens showing login screen
- No console errors in popup (right-click → Inspect)

---

## Step 5: Test Authentication

1. Click the extension icon
2. Click **Sign in with Google**
3. Complete OAuth flow (select Google account)
4. Grant permissions:
   - ✅ View and manage your Google My Business data
   - ✅ View your email address
5. Popup should show "Syncing reviews..." message

**Troubleshooting**:
- If OAuth fails: Check `GOOGLE_CLIENT_ID` in `.env`
- If no reviews appear: Verify you have Google reviews on your account
- If sync hangs: Check browser console (F12) for API errors

---

## Step 6: Run Tests (Optional)

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test structure**:
- `tests/unit/` - Fast, isolated unit tests
- `tests/integration/` - API and storage integration tests
- `tests/e2e/` - Full user flow tests (requires Chrome driver)

---

## Development Workflow

### Hot Reload

Development mode (`npm run dev`) includes automatic reloading:

1. Make code changes in `extension/` directory
2. Webpack detects changes and rebuilds
3. Chrome extension reloads automatically (for most changes)
4. **Exception**: `manifest.json` changes require manual reload

**Manual reload**: Go to `chrome://extensions/` → Click reload icon on Review Rescue card.

### Debugging

**Popup debugging**:
1. Click extension icon to open popup
2. Right-click in popup → **Inspect**
3. DevTools opens showing popup console

**Background script debugging**:
1. Go to `chrome://extensions/`
2. Find Review Rescue → Click **Inspect views: background page**
3. DevTools opens showing background script console

**Content script debugging**:
1. Open any Google Maps page
2. Open browser DevTools (F12)
3. Content script logs appear in console with `[ReviewRescue]` prefix

### Common Tasks

**Add a new UI component**:
```bash
# Create component file
touch extension/popup/components/NewComponent.tsx

# Import in popup.tsx
# npm run dev will auto-rebuild
```

**Add a new API service**:
```bash
# Create service file
touch extension/lib/api/new-service.ts

# Implement interface from contracts/
# Add tests in tests/unit/lib/
```

**Update data model**:
1. Edit `extension/lib/types.ts`
2. Update `contracts/types.ts` to match
3. Run `npm run typecheck` to verify
4. Update tests if needed

---

## Project Structure Reference

```
review-rescue/
├── extension/               # Extension source code
│   ├── manifest.json       # Chrome extension manifest
│   ├── popup/              # Popup UI (React)
│   │   ├── popup.tsx       # Main popup component
│   │   ├── components/     # React components
│   │   └── styles/         # CSS styles
│   ├── background/         # Background service worker
│   │   ├── service-worker.ts
│   │   ├── auth.ts
│   │   ├── sync.ts
│   │   └── storage.ts
│   ├── content/            # Content scripts
│   │   └── google-maps.ts
│   └── lib/                # Shared utilities
│       ├── types.ts
│       ├── api/            # API clients
│       ├── export/         # Export generators
│       ├── analytics/      # AI insights
│       └── utils/          # Helper functions
├── tests/                  # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── config/                 # Configuration files
│   ├── webpack.config.js
│   ├── tsconfig.json
│   └── .env.example
├── specs/                  # Design documentation
│   └── 001-review-rescue-a/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       └── contracts/
└── dist/                   # Built extension (generated)
```

---

## Key Files Explained

| File | Purpose |
|------|---------|
| `extension/manifest.json` | Chrome extension configuration (permissions, scripts, icons) |
| `extension/popup/popup.tsx` | Main UI entry point (React root component) |
| `extension/background/service-worker.ts` | Background script (handles auth, sync, API calls) |
| `extension/lib/types.ts` | TypeScript type definitions (matches data-model.md) |
| `config/webpack.config.js` | Build configuration (TypeScript → JavaScript bundling) |
| `config/tsconfig.json` | TypeScript compiler options |
| `.env` | Environment variables (API keys, secrets - DO NOT commit) |

---

## Environment Modes

### Development Mode
```bash
npm run dev
```
- Source maps enabled
- Hot reload active
- Verbose logging
- No minification
- Fast builds

### Production Mode
```bash
npm run build
```
- Source maps disabled
- Minified code
- Error logging only
- Tree-shaking enabled
- Optimized bundles

---

## Troubleshooting

### Problem: "Module not found" errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: Extension won't load in Chrome

**Check**:
1. Is `dist/manifest.json` present? Run `npm run build`
2. Are there syntax errors? Check browser console
3. Is Developer Mode enabled in `chrome://extensions/`?

### Problem: OAuth redirect fails

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` matches Google Cloud Console
2. Check redirect URI in console matches extension ID
3. For local dev, use any 32-char ID in manifest.json

### Problem: Reviews not syncing

**Check**:
1. Do you have Google reviews on your account?
2. Open DevTools → Network tab → Check for 403/401 errors
3. Verify Google My Business API is enabled in Cloud Console
4. Check OAuth scopes include `business.manage`

### Problem: AI insights not generating

**Check**:
1. Is `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` set in `.env`?
2. Do you have credits/billing enabled on AI provider account?
3. Check background script console for API errors
4. Verify you have at least 5 reviews (minimum for insights)

### Problem: TypeScript errors

**Solution**:
```bash
# Check all type errors
npm run typecheck

# Common fix: Regenerate types
npm run build:types
```

---

## Next Steps

After completing the quick start:

1. **Read the spec**: See `specs/001-review-rescue-a/spec.md` for feature requirements
2. **Review contracts**: Check `specs/001-review-rescue-a/contracts/` for API interfaces
3. **Explore research**: Read `specs/001-review-rescue-a/research.md` for technology decisions
4. **Check tasks**: When available, see `specs/001-review-rescue-a/tasks.md` for implementation tasks

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start development mode with watch
npm run build            # Production build
npm run typecheck        # Check TypeScript types
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # End-to-end tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report

# Utilities
npm run clean            # Remove dist/ and node_modules/
npm run check            # Verify installation
npm run format           # Format code with Prettier
```

---

## Getting Help

- **Documentation**: See `specs/` directory for detailed design docs
- **Issues**: Check GitHub Issues for known problems
- **API Docs**: See `contracts/` for interface definitions
- **Chrome Extension Docs**: [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions/)

---

**Quick Start Completed!** 🚀

You should now have:
- ✅ Extension built and loaded in Chrome
- ✅ Google OAuth configured
- ✅ AI API keys set up
- ✅ Development environment running
- ✅ Ready to implement features

**Next**: Run `/speckit.tasks` to generate implementation tasks.
