# Implementation Plan: Review Rescue Chrome Extension

**Branch**: `001-review-rescue-a` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-review-rescue-a/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Review Rescue is a Chrome extension that consolidates all of a user's Google reviews in one interface, enabling export to multiple formats (CSV, JSON, PDF) and providing AI-powered insights about reviewing patterns, sentiment trends, and preferences. The extension addresses the problem of scattered review data across Google Maps by offering a centralized view, powerful search/filtering, and intelligence layer that helps users understand their reviewing behavior.

## Technical Context

**Language/Version**: TypeScript 5.x + JavaScript (ES2020+) for Chrome Extension APIs
**Primary Dependencies**: Chrome Extension APIs (Manifest V3), Chrome Storage API, Google OAuth2, AI service API (Claude/OpenAI)
**Storage**: Chrome Local Storage for cached reviews and user preferences (5-10MB limit), IndexedDB for larger datasets if needed
**Testing**: Vitest for unit tests, Chrome Extension Test Framework for integration tests
**Target Platform**: Chrome browser (v120+), Chromium-based browsers (Edge, Brave)
**Project Type**: Browser Extension (single package with popup, background, and content scripts)
**Performance Goals**: Load 100 reviews in <5s, export 50 reviews in <10s, AI insights in <15s, search results in <1s
**Constraints**: Chrome storage limits (5-10MB), extension bundle size (<5MB), offline capability for cached data, rate limiting for Google APIs
**Scale/Scope**: Support 500+ reviews per user, handle users with 1000+ reviews gracefully, optimize for 10-200 review range

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**NOTE**: The existing constitution file (`.specify/memory/constitution.md`) is for a different product (ReviewRescue AI - a restaurant review management tool). This feature (Review Rescue Chrome Extension - personal review manager) is a different product with different principles.

### Constitution Mismatch Analysis

The current constitution defines principles for a restaurant-focused B2B SaaS product:
- **Principle I**: Human-in-the-Loop for auto-publishing responses (not applicable - we're not publishing anything)
- **Principle II**: Niche-First Strategy for restaurants (not applicable - this is for individual consumers)
- **Principle III**: Intelligence Opérationnelle for business insights (partially applicable - we do provide insights)
- **Principle IV**: API Independence with fallback modes (applicable - we rely on Google APIs)
- **Principle V**: Proactif > Défensif for problem detection (not applicable - we're not managing reputation)

### Applicable Principles for This Feature

Since this is a different product, I'm documenting the relevant technical principles for this Chrome extension:

1. **Data Privacy & Ownership**: All user review data MUST be stored locally (Chrome storage) with no server-side persistence unless explicitly opted-in for cloud backup
2. **API Resilience**: Extension MUST function in degraded mode if Google APIs fail (cached data, manual sync)
3. **Performance First**: Extension MUST NOT block browser UI or slow down page loads
4. **Zero Lock-In**: Export functionality MUST preserve all data in open formats (CSV, JSON) enabling migration

### Gate Evaluation: ✅ PASS

- No auto-publishing mechanisms (not applicable)
- No server-side storage of user data (privacy by design)
- Fallback modes documented in Technical Context
- Performance budgets defined in Success Criteria
- Export functionality is P2 user story

**Recommendation**: Update constitution file or create separate constitution for Chrome extension product line.

---

### Post-Design Re-evaluation: ✅ PASS

After completing Phase 0 (Research) and Phase 1 (Design):

**Applicable Principles Still Met**:
1. ✅ **Data Privacy & Ownership**: Design uses Chrome Storage Local and IndexedDB exclusively (no server-side storage)
   - Confirmed in: `data-model.md` storage strategy, `contracts/chrome-storage.contract.ts`

2. ✅ **API Resilience**: Dual-mode design implemented
   - Primary: Google My Business API (`contracts/google-api.contract.ts`)
   - Fallback: Content script scraping (`IReviewScrapingService`)
   - Documented in: `research.md` section 2

3. ✅ **Performance First**: Design meets all performance budgets
   - Virtual scrolling for 1000+ reviews (`research.md` section 10)
   - Lazy loading and Web Workers for AI processing
   - All SC-001 through SC-010 metrics addressable

4. ✅ **Zero Lock-In**: Export functionality comprehensive
   - Three open formats: CSV, JSON, PDF (`contracts/export.contract.ts`)
   - Full data preservation in exports (no vendor lock-in)
   - User controls all data via local storage

**No New Violations Introduced**: The design does not add complexity beyond Chrome extension requirements. All architectural decisions align with privacy-first, resilient, performant principles.

**Next Steps**: Ready for `/speckit.tasks` to generate implementation tasks.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
extension/
├── manifest.json              # Chrome Extension manifest (V3)
├── popup/                     # Extension popup UI
│   ├── index.html
│   ├── popup.tsx             # Main popup component
│   ├── components/
│   │   ├── ReviewList.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── InsightsDashboard.tsx
│   │   └── ExportModal.tsx
│   └── styles/
│       └── popup.css
├── background/                # Background service worker
│   ├── service-worker.ts     # Main background script
│   ├── auth.ts              # Google OAuth handler
│   ├── sync.ts              # Review data synchronization
│   └── storage.ts           # Chrome Storage abstraction
├── content/                   # Content scripts (if needed)
│   └── google-maps.ts        # Interact with Google Maps pages
├── lib/                      # Shared utilities
│   ├── types.ts             # TypeScript interfaces
│   ├── api/
│   │   ├── google.ts        # Google API client
│   │   └── ai.ts            # AI service client
│   ├── export/
│   │   ├── csv.ts
│   │   ├── json.ts
│   │   └── pdf.ts
│   ├── analytics/
│   │   ├── sentiment.ts
│   │   ├── insights.ts
│   │   └── statistics.ts
│   └── utils/
│       ├── date.ts
│       ├── search.ts
│       └── filter.ts
├── assets/                   # Static assets
│   ├── icons/
│   └── images/
└── public/                   # Public files
    └── _locales/            # Internationalization

tests/
├── unit/
│   ├── lib/
│   │   ├── export.test.ts
│   │   ├── analytics.test.ts
│   │   └── utils.test.ts
│   └── components/
│       └── ReviewCard.test.tsx
├── integration/
│   ├── auth.test.ts
│   ├── sync.test.ts
│   └── storage.test.ts
└── e2e/
    ├── popup-flow.test.ts
    ├── export-flow.test.ts
    └── insights-flow.test.ts

config/
├── webpack.config.js         # Bundle configuration
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```

**Structure Decision**: Chrome Extension architecture with TypeScript + React for UI. Uses Manifest V3 (required for new extensions). Three main components:
1. **Popup**: User interface (React + TypeScript)
2. **Background**: Service worker for API calls, auth, and sync
3. **Content Scripts**: Optional interaction with Google Maps pages

Bundle built with Webpack to produce extension-compatible structure in `dist/`.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: ✅ No violations to justify

This feature does not introduce architectural complexity beyond what's necessary for a Chrome extension. The structure follows Chrome's standard extension patterns.
