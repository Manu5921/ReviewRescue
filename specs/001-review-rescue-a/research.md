# Research & Technology Decisions: Review Rescue Chrome Extension

**Feature**: Review Rescue Chrome Extension
**Date**: 2025-10-08
**Purpose**: Document technology choices, patterns, and resolved unknowns

## Overview

This document captures research findings and technology decisions for building a Chrome extension that helps users manage and export their Google reviews with AI-powered insights.

---

## 1. Chrome Extension Architecture

### Decision: Manifest V3 with TypeScript + React

**Rationale**:
- **Manifest V3** is mandatory for new Chrome extensions (Google deprecated V2 in January 2023)
- **TypeScript** provides type safety critical for Chrome APIs and reduces runtime errors
- **React** enables component reusability for complex UI (review cards, filters, insights dashboard)
- Service Workers replace background pages in V3 (required architectural change)

**Alternatives Considered**:
- **Vanilla JavaScript**: Rejected - too error-prone for complex state management and Chrome API typing
- **Vue.js/Svelte**: Rejected - React has better Chrome extension tooling (create-react-app templates, webpack configs)
- **Manifest V2**: Rejected - deprecated by Google, will stop working in 2024+

**Key References**:
- [Chrome Extension Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [TypeScript Chrome Extension Template](https://github.com/chibat/chrome-extension-typescript-starter)

---

## 2. Google Review Data Retrieval

### Decision: Google My Business API + Content Script Scraping (Fallback)

**Rationale**:
- **Google My Business API** (official) requires OAuth2 and provides structured review data
- **Content Script Scraping** as fallback when API unavailable or rate-limited (FR-017: offline mode)
- Chrome Identity API simplifies OAuth2 flow for Google sign-in
- Scraping Google Maps pages is against TOS but necessary for degraded mode per constitution API Independence principle

**Alternatives Considered**:
- **Google Places API**: Rejected - only returns reviews about businesses, not reviews written BY users
- **Google Takeout**: Rejected - batch export only, no programmatic access, poor UX (user must manually download)
- **Pure Scraping**: Rejected as primary - fragile to Google UI changes, TOS violation, poor reliability

**Implementation Approach**:
1. Primary: Use Google My Business API v4.9 with OAuth2 (chrome.identity.getAuthToken)
2. Fallback: Content script injected into google.com/maps/contrib pages to parse DOM
3. Cache all data in Chrome Storage for offline access (FR-017)

**API Constraints**:
- Rate limit: 1000 queries per day per user (Google My Business API)
- OAuth scopes needed: `https://www.googleapis.com/auth/business.manage` (read reviews)
- Content Security Policy must allow Google API domains in manifest.json

**Key References**:
- [Google My Business API Documentation](https://developers.google.com/my-business/reference/rest)
- [Chrome Identity API for OAuth2](https://developer.chrome.com/docs/extensions/reference/identity/)

---

## 3. Data Storage Strategy

### Decision: Chrome Storage API (sync) + IndexedDB (large datasets)

**Rationale**:
- **Chrome Storage Sync**: Automatically syncs across user's Chrome browsers (great UX), 100KB quota per item, 102KB total
- **Chrome Storage Local**: No sync, 5-10MB quota, faster for large datasets
- **IndexedDB**: For users with 500+ reviews exceeding storage limits, structured queries for search/filter
- No server-side storage aligns with constitution "Data Privacy & Ownership" principle

**Storage Schema**:
```
chrome.storage.sync:
  - user_preferences (filters, view settings)
  - auth_tokens (encrypted Google OAuth tokens)

chrome.storage.local:
  - reviews_cache (up to 200 reviews)
  - insights_cache (AI-generated analysis)
  - last_sync_timestamp

IndexedDB (if > 200 reviews):
  - reviews table (full dataset with indexes on rating, date, business_name)
  - insights table (keyed by review_id)
```

**Alternatives Considered**:
- **LocalStorage**: Rejected - 5-10MB total limit, synchronous API blocks UI, no structured queries
- **Server-side database**: Rejected - violates privacy principle, adds backend complexity
- **Pure Chrome Storage Sync**: Rejected - 102KB limit insufficient for 100+ reviews

**Migration Strategy**:
- Start with Chrome Storage Local (simple)
- Auto-migrate to IndexedDB when review count > 200 or storage quota exceeded
- Show user notification: "Large dataset detected, optimizing storage..."

**Key References**:
- [Chrome Storage API Documentation](https://developer.chrome.com/docs/extensions/reference/storage/)
- [IndexedDB in Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/storage-and-cookies/)

---

## 4. Export Formats Implementation

### Decision: Papa Parse (CSV), Native JSON, jsPDF (PDF)

**Rationale**:
- **Papa Parse**: Industry standard for CSV generation, handles escaping/quoting correctly, 5KB gzipped
- **Native JSON.stringify**: Built-in, zero dependencies, sufficient for JSON export
- **jsPDF**: Most popular PDF library for browser (25K stars), supports Unicode, table formatting

**Export Architecture**:
```typescript
// lib/export/csv.ts
import Papa from 'papaparse';
export function exportToCSV(reviews: Review[]): string {
  return Papa.unparse(reviews, {
    columns: ['business_name', 'rating', 'review_text', 'date', 'location'],
    quotes: true
  });
}

// lib/export/json.ts
export function exportToJSON(reviews: Review[]): string {
  return JSON.stringify(reviews, null, 2);
}

// lib/export/pdf.ts
import jsPDF from 'jspdf';
export function exportToPDF(reviews: Review[]): Blob {
  const doc = new jsPDF();
  // Table formatting with autoTable plugin
  doc.autoTable({ head: [...], body: [...] });
  return doc.output('blob');
}
```

**Alternatives Considered**:
- **XLSX (Excel)**: Rejected - 500KB+ bundle size too large for extension, CSV sufficient for Excel import
- **Markdown export**: Rejected - not requested in spec, low user demand
- **PDF via server rendering**: Rejected - requires backend, violates privacy principle

**Download Strategy**:
- Use Chrome Downloads API (chrome.downloads.download)
- Filename format: `google-reviews-export-{YYYY-MM-DD}.{csv|json|pdf}`
- Show download notification in extension popup

**Key References**:
- [Papa Parse Documentation](https://www.papaparse.com/docs)
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)

---

## 5. AI Insights Service

### Decision: Claude API (Anthropic) with OpenAI GPT-4 Fallback

**Rationale**:
- **Claude 3.5 Sonnet**: Best sentiment analysis quality, 200K context window (handles 100+ reviews), $3 per million tokens
- **OpenAI GPT-4 Turbo**: Fallback option, widely available, $10 per million tokens
- API key stored in extension storage (user provides own key) OR backend proxy (optional)
- Insights generated on-demand (not cached) to reflect latest reviews

**Insight Types**:
1. **Sentiment Analysis**: Overall trend (positive/negative/neutral) over time
2. **Category Breakdown**: Most reviewed business types (restaurants, hotels, shops)
3. **Rating Patterns**: Average rating, distribution, outliers
4. **Personalized Insights**: AI-generated observations (e.g., "You rate coffee shops 20% higher than average")

**Prompt Engineering**:
```typescript
const prompt = `Analyze these Google reviews and provide:
1. Sentiment trend over time (monthly breakdown)
2. Top 3 most reviewed categories
3. Rating patterns (average, distribution, outliers)
4. 5 personalized insights about reviewing behavior

Reviews: ${JSON.stringify(reviews)}

Format response as JSON with keys: sentiment_trend, top_categories, rating_stats, insights`;
```

**Alternatives Considered**:
- **Local ML models** (TensorFlow.js): Rejected - 5MB+ bundle size, poor accuracy vs GPT-4/Claude
- **Rule-based sentiment**: Rejected - too simplistic, misses nuance, no personalized insights
- **Server-side analysis**: Rejected - requires backend, violates privacy principle (though could use privacy-preserving aggregation)

**Cost Management**:
- Insights generated only when user clicks "Insights" tab (not automatic)
- Cache insights for 24 hours (invalidate on new reviews)
- Estimate: $0.01-0.05 per insight generation (100 reviews = ~20K tokens)

**API Key Management**:
- **Option A (MVP)**: User provides own API key (stored encrypted in chrome.storage)
- **Option B (Future)**: Backend proxy with rate limiting and cost tracking

**Key References**:
- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [OpenAI GPT-4 API Documentation](https://platform.openai.com/docs/api-reference)

---

## 6. Search & Filter Implementation

### Decision: Fuse.js (Fuzzy Search) + Client-Side Filtering

**Rationale**:
- **Fuse.js**: Lightweight (12KB), fuzzy search (tolerates typos), fast (1000 reviews in <50ms)
- **Client-side filtering**: No backend needed, works offline, instant results
- Index reviews on: business_name, review_text, location

**Search Configuration**:
```typescript
const fuse = new Fuse(reviews, {
  keys: ['business_name', 'review_text', 'location'],
  threshold: 0.4, // Fuzzy match tolerance
  includeScore: true,
  minMatchCharLength: 2
});

// Search query: "pizza restaurant"
const results = fuse.search(query);
```

**Filter Types**:
- **Rating**: Exact match (1-5 stars), multi-select allowed
- **Date Range**: From/To date pickers, presets (Last week, Last month, Last year)
- **Category**: Business category tags (auto-extracted from Google data)
- **Text Search**: Fuzzy search across business name and review text

**Performance Optimization**:
- Debounce search input (300ms delay) to avoid excessive re-renders
- Virtual scrolling for review list (react-window) to handle 500+ reviews
- Pre-compute search index on data load (one-time cost)

**Alternatives Considered**:
- **Native Array.filter**: Rejected - no fuzzy matching, exact string match only
- **Lunr.js**: Rejected - larger bundle size (30KB), overkill for our use case
- **Server-side search**: Rejected - requires backend, slower than client-side for small datasets

**Key References**:
- [Fuse.js Documentation](https://fusejs.io/)
- [React Window for Virtual Scrolling](https://github.com/bvaughn/react-window)

---

## 7. UI Component Library

### Decision: Tailwind CSS + shadcn/ui Components

**Rationale**:
- **Tailwind CSS**: Utility-first CSS, small bundle size (with PurgeCSS), fast development
- **shadcn/ui**: Copy-paste components (not npm package), customizable, accessible (ARIA)
- No large UI library dependencies (Material-UI = 300KB+, Ant Design = 600KB+)

**Component Architecture**:
```
popup/components/
├── ReviewList.tsx       # Virtual scrolling list
├── ReviewCard.tsx       # Individual review card (rating, text, date)
├── SearchBar.tsx        # Search input with debounce
├── FilterPanel.tsx      # Rating, date, category filters
├── InsightsDashboard.tsx # AI insights charts (Chart.js)
├── ExportModal.tsx      # Export format selector
└── ui/                  # shadcn/ui primitives
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── select.tsx
    └── dialog.tsx
```

**Design System**:
- Color palette: Blue primary (#3B82F6), Gray neutrals, Red for negative sentiment
- Typography: Inter font family (Google Fonts)
- Icons: Lucide React (tree-shakeable, 1KB per icon)

**Alternatives Considered**:
- **Material-UI**: Rejected - too heavy (300KB+), over-styled for extension popup
- **Bootstrap**: Rejected - jQuery dependency, not React-first
- **Ant Design**: Rejected - 600KB+ bundle, Chinese-first design language

**Key References**:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Component Library](https://ui.shadcn.com/)

---

## 8. Build & Bundle Configuration

### Decision: Webpack 5 + TypeScript + React

**Rationale**:
- **Webpack 5**: Industry standard for Chrome extensions, code splitting, asset optimization
- **TypeScript**: Compile-time type checking reduces Chrome API errors
- **Bundle size target**: <500KB total (popup + background), <5MB with dependencies

**Webpack Configuration**:
```javascript
// webpack.config.js
module.exports = {
  entry: {
    popup: './popup/popup.tsx',
    background: './background/service-worker.ts',
    content: './content/google-maps.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: { chunks: 'all' }
  }
};
```

**Build Process**:
1. `npm run build` → Webpack compiles TS/React to JS
2. Output to `dist/` folder matching Chrome extension structure
3. Copy `manifest.json`, `assets/`, `public/` to `dist/`
4. Generate source maps for debugging (development only)

**Development Workflow**:
- `npm run dev` → Webpack watch mode + hot reload
- Load unpacked extension from `dist/` in Chrome
- Chrome automatically reloads extension on file changes

**Alternatives Considered**:
- **Vite**: Rejected - limited Chrome extension support, ESM module issues with service workers
- **Parcel**: Rejected - poor TypeScript performance, less mature extension tooling
- **Rollup**: Rejected - more complex config, Webpack has better Chrome extension community

**Key References**:
- [Webpack Chrome Extension Guide](https://webpack.js.org/guides/chrome-extension/)
- [TypeScript Chrome Extension Template](https://github.com/chibat/chrome-extension-typescript-starter)

---

## 9. Testing Strategy

### Decision: Vitest (Unit) + Playwright (E2E)

**Rationale**:
- **Vitest**: Fast (ESM-native), Jest-compatible API, great TypeScript support
- **Playwright**: Supports Chrome extension testing, cross-browser, reliable selectors
- Testing only if explicitly requested (per constitution workflow)

**Test Coverage Targets** (if tests requested):
- Unit tests: Export functions, analytics logic, search/filter utilities (>80% coverage)
- Integration tests: Chrome Storage API, OAuth flow, sync logic (mocked Chrome APIs)
- E2E tests: Full user flows (view reviews → search → export → insights)

**Test Structure**:
```
tests/
├── unit/
│   ├── lib/export.test.ts       # CSV/JSON/PDF generation
│   ├── lib/analytics.test.ts    # Sentiment analysis, insights
│   └── lib/utils.test.ts        # Date formatting, search
├── integration/
│   ├── auth.test.ts             # OAuth flow (mocked Google API)
│   ├── sync.test.ts             # Review synchronization
│   └── storage.test.ts          # Chrome Storage abstraction
└── e2e/
    ├── popup-flow.test.ts       # Open popup → view reviews
    ├── export-flow.test.ts      # Select reviews → export CSV
    └── insights-flow.test.ts    # Generate AI insights
```

**Alternatives Considered**:
- **Jest**: Rejected - slow startup, poor ESM support, requires babel config
- **Cypress**: Rejected - no native Chrome extension support, must use workarounds
- **Manual testing only**: Rejected - risky for Chrome API interactions, regression-prone

**Key References**:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Chrome Extension Testing](https://playwright.dev/docs/chrome-extensions)

---

## 10. Performance Optimization

### Decision: Virtual Scrolling + Lazy Loading + Web Workers

**Rationale**:
- **Virtual Scrolling** (react-window): Render only visible reviews, handle 1000+ reviews without lag
- **Lazy Loading**: Load reviews in batches (50 at a time), paginate if > 500 reviews
- **Web Workers**: Offload AI analysis to background thread (don't block UI)

**Performance Budgets** (from spec):
- Load 100 reviews: <5 seconds (SC-001)
- Export 50 reviews: <10 seconds (SC-002)
- AI insights: <15 seconds (SC-003)
- Search results: <1 second (SC-005)

**Optimization Techniques**:
1. **Code Splitting**: Lazy load InsightsDashboard component (only when tab clicked)
2. **Memoization**: React.memo for ReviewCard components (prevent unnecessary re-renders)
3. **Debouncing**: Search input debounced 300ms (avoid excessive filtering)
4. **Caching**: Cache AI insights for 24 hours (avoid redundant API calls)
5. **Indexing**: Pre-compute Fuse.js search index on data load

**Bundle Size Targets**:
- Popup bundle: <300KB (with React + Tailwind)
- Background script: <100KB (Chrome APIs + utilities)
- Total extension: <500KB (excluding assets)

**Alternatives Considered**:
- **Server-side rendering**: Rejected - not applicable for Chrome extension popup
- **Preact instead of React**: Rejected - smaller bundle (3KB vs 40KB) but worse ecosystem, harder to find developers

**Key References**:
- [React Window Documentation](https://github.com/bvaughn/react-window)
- [Web Workers in Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/background_pages/)

---

## Summary of Key Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Extension Framework** | Manifest V3 + TypeScript + React | Mandatory V3, type safety, component reusability |
| **Data Retrieval** | Google My Business API + Scraping fallback | Official API primary, scraping for degraded mode |
| **Storage** | Chrome Storage API + IndexedDB | Sync across devices, offline support, large datasets |
| **Export** | Papa Parse (CSV), JSON native, jsPDF (PDF) | Industry standards, small bundles, good Unicode support |
| **AI Insights** | Claude API with OpenAI fallback | Best sentiment analysis, 200K context, cost-effective |
| **Search** | Fuse.js fuzzy search | Fast, tolerates typos, 12KB bundle |
| **UI** | Tailwind CSS + shadcn/ui | Small bundle, customizable, accessible |
| **Build** | Webpack 5 | Industry standard, code splitting, Chrome extension support |
| **Testing** | Vitest + Playwright | Fast, modern, native Chrome extension support |
| **Performance** | Virtual scrolling + lazy loading + Web Workers | Handle 1000+ reviews, meet performance budgets |

---

## Open Questions & Risks

### Risks
1. **Google API Access**: Google may restrict My Business API access or increase rate limits
   - **Mitigation**: Content script scraping as fallback (degraded mode)

2. **Chrome Storage Limits**: 5-10MB may be insufficient for users with 1000+ reviews + images
   - **Mitigation**: Auto-migrate to IndexedDB, compress images before caching

3. **AI API Costs**: Claude/OpenAI costs may be prohibitive for heavy users
   - **Mitigation**: Cache insights 24h, only generate on explicit user action, user provides own API key

4. **Extension Bundle Size**: React + dependencies may exceed Chrome's informal 5MB limit
   - **Mitigation**: Code splitting, Tailwind PurgeCSS, exclude unnecessary deps

### Open Questions (for future clarification)
1. Should we support importing reviews from other platforms (Yelp, TripAdvisor)?
   - **Current answer**: No (marked out of scope in spec)

2. Should insights include comparisons with other users (benchmarking)?
   - **Current answer**: No (marked out of scope in spec)

3. Should we support cloud backup/sync beyond Chrome's built-in sync?
   - **Current answer**: No for MVP (privacy principle), but could offer opt-in later

---

**Research Completed**: 2025-10-08
**Next Phase**: Phase 1 - Design & Contracts (data-model.md, API contracts, quickstart.md)
