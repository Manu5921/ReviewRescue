# Tasks: Review Rescue Chrome Extension

**Input**: Design documents from `/specs/001-review-rescue-a/`
**Prerequisites**: plan.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are NOT included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths follow Chrome extension structure defined in plan.md

## Path Conventions
Extension follows Chrome Extension structure:
- `extension/` - Extension source code
  - `popup/` - React UI components
  - `background/` - Service worker scripts
  - `lib/` - Shared utilities and services
  - `content/` - Content scripts
- `config/` - Build configuration
- `tests/` - Test suites (when requested)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Chrome extension structure

- [ ] **T001** Create project directory structure matching plan.md (extension/, config/, tests/, assets/)
- [ ] **T002** Initialize Node.js project with package.json (dependencies: typescript, react, webpack, tailwind)
- [ ] **T003** [P] Configure TypeScript (tsconfig.json) with strict mode and Chrome extension types
- [ ] **T004** [P] Configure Webpack (config/webpack.config.js) for extension bundling (popup, background, content scripts)
- [ ] **T005** [P] Configure Tailwind CSS (tailwind.config.js) with PostCSS for popup styling
- [ ] **T006** [P] Configure ESLint and Prettier for code quality
- [ ] **T007** Create Chrome extension manifest.json (Manifest V3) with permissions, icons, and scripts declarations
- [ ] **T008** [P] Add extension icons (16x16, 48x48, 128x128) to assets/icons/
- [ ] **T009** [P] Setup npm scripts in package.json (dev, build, typecheck, lint)
- [ ] **T010** [P] Create .env.example with required environment variables (GOOGLE_CLIENT_ID, ANTHROPIC_API_KEY)
- [ ] **T011** Verify build system works: run `npm run build` and confirm dist/ directory generates correctly

**Checkpoint**: Project structure ready, build system functional

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions (Shared by All Stories)

- [ ] **T012** [P] Create shared TypeScript types in extension/lib/types.ts (Review, Photo, Insight, ExportJob, UserSession, UserPreferences) matching data-model.md
- [ ] **T013** [P] Create filter and pagination types in extension/lib/types.ts (FilterCriteria, SortOptions, PaginationOptions)

### Storage Foundation (Required by US1, US2, US3, US4)

- [ ] **T014** Implement Chrome Storage service interface in extension/background/storage.ts (IStorageService from contracts/chrome-storage.contract.ts)
- [ ] **T015** Implement setLocal, getLocal, setSync, getSync methods with error handling for quota exceeded
- [ ] **T016** Implement storage stats method (getStorageStats) to check available quota
- [ ] **T017** Implement ReviewCacheService in extension/background/storage.ts (cacheReviews, getCachedReviews, addReview, updateReview, deleteReview)
- [ ] **T018** Implement SessionService in extension/background/storage.ts (setSession, getSession, updateSession, clearSession, isAuthenticated)
- [ ] **T019** Implement PreferencesService in extension/background/storage.ts (setPreferences, getPreferences, updatePreferences with defaults)
- [ ] **T020** Add storage error handling (StorageError class) for quota exceeded, permission denied, serialization errors

### Google Authentication Foundation (Required by US1)

- [ ] **T021** Implement Google OAuth service in extension/background/auth.ts (IGoogleAuthService from contracts/google-api.contract.ts)
- [ ] **T022** Implement authenticate() method using chrome.identity.getAuthToken with Google OAuth2 scopes
- [ ] **T023** Implement getAccessToken() with automatic token refresh logic
- [ ] **T024** Implement refreshAccessToken() using refresh token
- [ ] **T025** Implement logout() to revoke tokens and clear session
- [ ] **T026** Add OAuth error handling (AuthError class) for auth failed, token expired, permission denied

### Background Service Worker Setup (Required by All Stories)

- [ ] **T027** Create background service worker entry point in extension/background/service-worker.ts
- [ ] **T028** Setup message passing between popup and background (chrome.runtime.onMessage listener)
- [ ] **T029** Implement background script lifecycle handlers (onInstalled, onStartup)
- [ ] **T030** Add global error handler for unhandled background script errors

### Basic UI Foundation (Required by All Stories with UI)

- [ ] **T031** Create popup HTML entry point (extension/popup/index.html) with root div and React script
- [ ] **T032** Create popup React root component (extension/popup/popup.tsx) with React Router setup
- [ ] **T033** [P] Create base UI components from shadcn/ui in extension/popup/components/ui/ (button, card, input, select)
- [ ] **T034** [P] Setup Tailwind base styles in extension/popup/styles/popup.css (colors, typography, spacing)
- [ ] **T035** Create loading state component (extension/popup/components/LoadingSpinner.tsx) for async operations
- [ ] **T036** Create error boundary component (extension/popup/components/ErrorBoundary.tsx) for React error handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View All Google Reviews in One Place (Priority: P1) 🎯 MVP

**Goal**: Enable users to see all their Google reviews consolidated in the extension popup with business names, ratings, review text, and dates

**Independent Test**: User can install extension, authenticate with Google account, and see all their reviews listed with complete information within 5 seconds (for up to 100 reviews)

### Google Reviews API Integration (US1 Core)

- [ ] **T037** [US1] Create Google Reviews API client in extension/lib/api/google.ts (IGoogleReviewsService from contracts/google-api.contract.ts)
- [ ] **T038** [US1] Implement fetchUserReviews() method to call Google My Business API and map response to Review type
- [ ] **T039** [US1] Implement fetchReviewById() method for single review retrieval
- [ ] **T040** [US1] Implement fetchReviewsSince() for incremental syncing (fetch reviews modified after timestamp)
- [ ] **T041** [US1] Add rate limit handling (getRateLimitStatus) and exponential backoff retry logic
- [ ] **T042** [US1] Add API error handling (ReviewsFetchError) for 401, 403, 429, 500 errors

### Content Script Scraping (US1 Fallback)

- [ ] **T043** [P] [US1] Create content script for Google Maps in extension/content/google-maps.ts (IReviewScrapingService from contracts/google-api.contract.ts)
- [ ] **T044** [P] [US1] Implement canScrape() to detect if user is on Google Maps contrib page
- [ ] **T045** [P] [US1] Implement scrapeReviews() to extract reviews from DOM (business name, rating, text, date)
- [ ] **T046** [P] [US1] Add scraping error handling (ScrapingError) for parse errors, wrong page, no data

### Review Sync Service (US1 Core)

- [ ] **T047** [US1] Create sync service in extension/background/sync.ts (ISyncService from contracts/google-api.contract.ts)
- [ ] **T048** [US1] Implement syncReviews() full sync (fetch all reviews, deduplicate, store in cache)
- [ ] **T049** [US1] Implement incrementalSync() to fetch only new/modified reviews since last sync
- [ ] **T050** [US1] Implement shouldSync() logic based on last sync time and user preferences (sync interval)
- [ ] **T051** [US1] Implement sync status tracking (getSyncStatus with progress percentage, current operation)
- [ ] **T052** [US1] Add automatic sync on extension open (if auto_sync_enabled preference is true)
- [ ] **T053** [US1] Add manual sync trigger via button in popup UI
- [ ] **T054** [US1] Store last_sync_at timestamp in UserSession after successful sync

### Review List UI (US1 Core)

- [ ] **T055** [US1] Create ReviewList component in extension/popup/components/ReviewList.tsx with virtual scrolling (react-window)
- [ ] **T056** [US1] Create ReviewCard component in extension/popup/components/ReviewCard.tsx displaying business name, rating (stars), text, date
- [ ] **T057** [US1] Add photo display in ReviewCard (thumbnail gallery) if show_photos preference is true
- [ ] **T058** [US1] Implement list/grid view toggle in ReviewList based on default_view preference
- [ ] **T059** [US1] Add pagination controls (results_per_page from preferences, default 50)
- [ ] **T060** [US1] Add empty state component when no reviews found (message + guidance)
- [ ] **T061** [US1] Add loading state during initial sync (LoadingSpinner with "Syncing reviews..." message)

### Authentication UI (US1 Prerequisite)

- [ ] **T062** [P] [US1] Create LoginScreen component in extension/popup/components/LoginScreen.tsx with "Sign in with Google" button
- [ ] **T063** [P] [US1] Implement Google OAuth flow trigger on button click (calls background auth service)
- [ ] **T064** [P] [US1] Handle OAuth success (store session, redirect to review list)
- [ ] **T065** [P] [US1] Handle OAuth failure (display error message, allow retry)
- [ ] **T066** [P] [US1] Add logout button in popup header (calls background logout service)

### Date and Utility Helpers (US1 Support)

- [ ] **T067** [P] [US1] Create date formatting utility in extension/lib/utils/date.ts (formatDate with relative time "2 days ago")
- [ ] **T068** [P] [US1] Create rating display utility (renderStars to show 1-5 star icons)

**Checkpoint**: User Story 1 complete - users can view all their reviews in the extension ✅

**MVP Scope**: Stop here for minimum viable product - users can authenticate and view reviews

---

## Phase 4: User Story 4 - Search and Filter My Reviews (Priority: P2)

**Goal**: Enable users to quickly find specific reviews by searching for keywords, filtering by rating, date range, or business category

**Independent Test**: User can search for a business name, filter by 5-star rating, set date range to "Last year", and see results update within 1 second

**Note**: US4 implemented before US2 because search/filter enhances core viewing experience (US1) and has no dependencies on export or insights

### Search Implementation (US4 Core)

- [ ] **T069** [US4] Install Fuse.js dependency for fuzzy search (npm install fuse.js)
- [ ] **T070** [US4] Create search utility in extension/lib/utils/search.ts wrapping Fuse.js
- [ ] **T071** [US4] Configure Fuse.js with keys (business_name, review_text, location), threshold 0.4, minMatchCharLength 2
- [ ] **T072** [US4] Implement searchReviews(query, reviews) function returning filtered results
- [ ] **T073** [US4] Add search result highlighting (mark matched text in ReviewCard)

### Filter Implementation (US4 Core)

- [ ] **T074** [US4] Create filter utility in extension/lib/utils/filter.ts
- [ ] **T075** [US4] Implement filterByRating(reviews, minRating, maxRating) function
- [ ] **T076** [US4] Implement filterByDateRange(reviews, startDate, endDate) function
- [ ] **T077** [US4] Implement filterByCategory(reviews, categories[]) function
- [ ] **T078** [US4] Implement combineFilters() to apply multiple filters simultaneously

### Search & Filter UI (US4 Core)

- [ ] **T079** [US4] Create SearchBar component in extension/popup/components/SearchBar.tsx with debounced input (300ms)
- [ ] **T080** [US4] Add search icon and clear button to SearchBar
- [ ] **T081** [US4] Create FilterPanel component in extension/popup/components/FilterPanel.tsx
- [ ] **T082** [US4] Add rating filter controls (checkboxes for 1-5 stars, multi-select enabled)
- [ ] **T083** [US4] Add date range picker with presets (Last week, Last month, Last year, Custom)
- [ ] **T084** [US4] Add category filter dropdown (categories extracted from reviews)
- [ ] **T085** [US4] Add "Clear all filters" button to reset FilterPanel
- [ ] **T086** [US4] Display active filter count badge ("3 filters active")
- [ ] **T087** [US4] Update ReviewList to show filtered/searched results
- [ ] **T088** [US4] Add "No results found" message when filters return empty set
- [ ] **T089** [US4] Save active filters to session state (persist across popup closes)

**Checkpoint**: User Story 4 complete - users can search and filter reviews ✅

---

## Phase 5: User Story 2 - Export Reviews to Multiple Formats (Priority: P2)

**Goal**: Enable users to download their reviews in CSV, JSON, or PDF format for backup, portfolio, or migration purposes

**Independent Test**: User can select 5 reviews, click "Export Selected to JSON", and download a properly formatted JSON file with all review data in under 10 seconds

### CSV Export Implementation (US2 Core)

- [ ] **T090** [US2] Install Papa Parse dependency (npm install papaparse @types/papaparse)
- [ ] **T091** [US2] Create CSV generator service in extension/lib/export/csv.ts (ICSVGeneratorService from contracts/export.contract.ts)
- [ ] **T092** [US2] Implement generate() method using Papa Parse to convert Review[] to CSV string
- [ ] **T093** [US2] Implement formatRow() to handle field escaping (quotes, commas in text)
- [ ] **T094** [US2] Implement generateHeaders() for CSV column names
- [ ] **T095** [US2] Add support for custom column selection (CSVColumn enum from contract)
- [ ] **T096** [US2] Add support for delimiter options (comma, semicolon, tab)

### JSON Export Implementation (US2 Core)

- [ ] **T097** [P] [US2] Create JSON generator service in extension/lib/export/json.ts (IJSONGeneratorService from contracts/export.contract.ts)
- [ ] **T098** [P] [US2] Implement generate() method using JSON.stringify with pretty-print option
- [ ] **T099** [P] [US2] Implement generateWithMetadata() to wrap reviews with export metadata (date, count, version)
- [ ] **T100** [P] [US2] Add support for indent options (2 or 4 spaces)

### PDF Export Implementation (US2 Core)

- [ ] **T101** [P] [US2] Install jsPDF dependency (npm install jspdf)
- [ ] **T102** [P] [US2] Create PDF generator service in extension/lib/export/pdf.ts (IPDFGeneratorService from contracts/export.contract.ts)
- [ ] **T103** [P] [US2] Implement generate() method using jsPDF to create PDF document
- [ ] **T104** [P] [US2] Implement addHeader() to add document title, logo, export date
- [ ] **T105** [P] [US2] Implement addFooter() with page numbers
- [ ] **T106** [P] [US2] Implement addReview() to format each review as PDF section (business name, stars, text, date)
- [ ] **T107** [P] [US2] Add support for page size options (A4, Letter)
- [ ] **T108** [P] [US2] Add support for orientation options (portrait, landscape)

### Export Service Orchestration (US2 Core)

- [ ] **T109** [US2] Create export service in extension/lib/export/index.ts (IExportService from contracts/export.contract.ts)
- [ ] **T110** [US2] Implement exportReviews() method that dispatches to CSV/JSON/PDF generators based on format
- [ ] **T111** [US2] Implement validateReviews() to check required fields before export
- [ ] **T112** [US2] Implement estimateFileSize() to warn user if export exceeds 10MB
- [ ] **T113** [US2] Implement generateFilename() with format "google-reviews-export-YYYY-MM-DD.{csv|json|pdf}"
- [ ] **T114** [US2] Add export error handling (ExportError class) for validation failed, generation failed, file too large

### Download Manager (US2 Core)

- [ ] **T115** [US2] Create download manager service in extension/lib/export/download.ts (IDownloadManagerService from contracts/export.contract.ts)
- [ ] **T116** [US2] Implement download() method using chrome.downloads.download API
- [ ] **T117** [US2] Implement getDownloadStatus() to track download progress
- [ ] **T118** [US2] Implement onDownloadComplete() listener to notify user of success/failure
- [ ] **T119** [US2] Add download error handling (DownloadError class) for permission denied, disk full

### Export History Tracking (US2 Support)

- [ ] **T120** [P] [US2] Implement ExportHistoryService in extension/background/storage.ts (addExportJob, getExportHistory, updateExportJob)
- [ ] **T121** [P] [US2] Store ExportJob entity after each export (format, review_ids, file_name, timestamp, status)
- [ ] **T122** [P] [US2] Limit export history to last 50 exports (auto-cleanup old entries)

### Export UI (US2 Core)

- [ ] **T123** [US2] Create ExportModal component in extension/popup/components/ExportModal.tsx
- [ ] **T124** [US2] Add format selector (radio buttons for CSV, JSON, PDF)
- [ ] **T125** [US2] Add selection mode toggle ("Export All" vs "Export Selected")
- [ ] **T126** [US2] Add review selection checkboxes in ReviewCard component
- [ ] **T127** [US2] Add "Select All" / "Deselect All" buttons in ReviewList
- [ ] **T128** [US2] Add export options panel (delimiter for CSV, indent for JSON, page size for PDF)
- [ ] **T129** [US2] Show estimated file size in modal before export
- [ ] **T130** [US2] Show progress indicator during export generation (loading spinner with percentage)
- [ ] **T131** [US2] Show success toast notification with "Open File" button after download completes
- [ ] **T132** [US2] Add export history view (last 10 exports with format, date, file size)
- [ ] **T133** [US2] Handle empty selection error (show message "Please select at least one review")

**Checkpoint**: User Story 2 complete - users can export reviews to CSV/JSON/PDF ✅

---

## Phase 6: User Story 3 - AI-Powered Review Insights and Analytics (Priority: P3)

**Goal**: Enable users to understand patterns in their reviewing behavior through AI analysis (sentiment trends, category breakdown, rating patterns, personalized insights)

**Independent Test**: User can click "Insights" tab, wait up to 15 seconds, and see 5+ meaningful AI-generated observations about their reviews with charts and statistics

### AI Service Foundation (US3 Core)

- [ ] **T134** [US3] Create AI insights service in extension/lib/api/ai.ts (IAIInsightsService from contracts/ai-insights.contract.ts)
- [ ] **T135** [US3] Implement generateInsights() method that calls Claude API (or OpenAI fallback)
- [ ] **T136** [US3] Implement AIModelConfig management (store API key, model name, max tokens in preferences)
- [ ] **T137** [US3] Add AI provider switching (switchProvider method to toggle between Claude and OpenAI)
- [ ] **T138** [US3] Add API error handling (AIServiceError class) for invalid key, rate limit, timeout

### Prompt Engineering (US3 Core)

- [ ] **T139** [US3] Create prompt template service in extension/lib/analytics/prompts.ts (IPromptTemplateService from contracts/ai-insights.contract.ts)
- [ ] **T140** [US3] Implement getSentimentPrompt() for sentiment analysis (detects positive/negative/neutral trends over time)
- [ ] **T141** [US3] Implement getCategoryPrompt() for category breakdown (groups reviews by business type)
- [ ] **T142** [US3] Implement getPatternPrompt() for rating patterns (analyzes distribution, frequency, review length)
- [ ] **T143** [US3] Implement getPersonalizedPrompt() for personalized insights (detects user preferences, traits)
- [ ] **T144** [US3] Implement formatReviews() to convert Review[] to AI-readable text (truncate if exceeds token limit)

### Sentiment Analysis (US3 Feature)

- [ ] **T145** [US3] Implement analyzeSentiment() method in AI service
- [ ] **T146** [US3] Parse AI response into SentimentInsight type (overall sentiment, positive/negative/neutral counts, monthly trend)
- [ ] **T147** [US3] Store SentimentInsight in insights cache (InsightsCacheService)

### Category Analysis (US3 Feature)

- [ ] **T148** [P] [US3] Implement categorizeReviews() method in AI service
- [ ] **T149** [P] [US3] Parse AI response into CategoryInsight type (top categories with counts, percentages, avg rating per category)
- [ ] **T150** [P] [US3] Store CategoryInsight in insights cache

### Pattern Detection (US3 Feature)

- [ ] **T151** [P] [US3] Implement detectPatterns() method in AI service
- [ ] **T152** [P] [US3] Parse AI response into PatternInsight type (rating distribution, avg rating, review frequency, length stats)
- [ ] **T153** [P] [US3] Store PatternInsight in insights cache

### Personalized Insights (US3 Feature)

- [ ] **T154** [P] [US3] Implement generatePersonalizedInsights() method in AI service
- [ ] **T155** [P] [US3] Parse AI response into PersonalizedInsight type (observations, recommendations, personality traits)
- [ ] **T156** [P] [US3] Store PersonalizedInsight in insights cache

### Response Parsing & Validation (US3 Support)

- [ ] **T157** [US3] Create AI response parser in extension/lib/analytics/parser.ts (IAIResponseParser from contracts/ai-insights.contract.ts)
- [ ] **T158** [US3] Implement parseInsight() to convert AI JSON response to Insight type
- [ ] **T159** [US3] Implement validateInsight() to check required fields (title, insight_text, review_count)
- [ ] **T160** [US3] Implement extractConfidence() to parse confidence score from AI response
- [ ] **T161** [US3] Add parse error handling (ParseError, ValidationError classes)

### Insights Caching (US3 Performance)

- [ ] **T162** [US3] Implement InsightsCacheService in extension/background/storage.ts (cacheInsights, getCachedInsights, isCacheValid, invalidateCache)
- [ ] **T163** [US3] Set cache validity to 24 hours (configurable via insights_cache_hours preference)
- [ ] **T164** [US3] Invalidate cache automatically when new reviews are synced
- [ ] **T165** [US3] Add "Refresh Insights" button in UI to force cache invalidation

### Statistics Calculation (US3 Support)

- [ ] **T166** [P] [US3] Create statistics utility in extension/lib/analytics/statistics.ts
- [ ] **T167** [P] [US3] Implement calculateAverageRating(reviews) function
- [ ] **T168** [P] [US3] Implement calculateRatingDistribution(reviews) function (count per star level)
- [ ] **T169** [P] [US3] Implement calculateReviewCountOverTime(reviews, period) function for time series data
- [ ] **T170** [P] [US3] Implement extractTopKeywords(reviews, limit) function for word frequency analysis

### Insights Dashboard UI (US3 Core)

- [ ] **T171** [US3] Create InsightsDashboard component in extension/popup/components/InsightsDashboard.tsx
- [ ] **T172** [US3] Add tab navigation to switch between Reviews and Insights tabs
- [ ] **T173** [US3] Add loading state during AI insight generation (spinner with "Analyzing your reviews..." message)
- [ ] **T174** [US3] Create sentiment chart component (line chart showing sentiment trend over time using Chart.js or Recharts)
- [ ] **T175** [US3] Create category breakdown component (pie chart or bar chart showing top categories)
- [ ] **T176** [US3] Create rating distribution component (bar chart showing 1-5 star counts)
- [ ] **T177** [US3] Create statistics cards component (avg rating, total reviews, review frequency)
- [ ] **T178** [US3] Create personalized insights list component (observations with confidence badges)
- [ ] **T179** [US3] Add error handling for AI failures (show message "Unable to generate insights, please try again")
- [ ] **T180** [US3] Add "Refresh Insights" button to regenerate with latest data
- [ ] **T181** [US3] Add minimum review count check (show message "Need at least 5 reviews to generate insights" if below threshold)

### Cost Estimation (US3 Support)

- [ ] **T182** [P] [US3] Create cost estimator service in extension/lib/analytics/cost.ts (ICostEstimatorService from contracts/ai-insights.contract.ts)
- [ ] **T183** [P] [US3] Implement estimateTokens(reviews) using rough calculation (4 chars = 1 token)
- [ ] **T184** [P] [US3] Implement estimateClaudeCost(tokenCount) with current pricing ($3 per million tokens)
- [ ] **T185** [P] [US3] Implement estimateOpenAICost(tokenCount) with current pricing ($10 per million tokens)
- [ ] **T186** [P] [US3] Display estimated cost in UI before generating insights (e.g., "Estimated cost: $0.03")

**Checkpoint**: User Story 3 complete - users can view AI-powered insights about their reviews ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final touches, and production readiness

### Error Handling & Logging

- [ ] **T187** [P] Implement global error logger in extension/lib/utils/logger.ts (logs to console and optionally to storage)
- [ ] **T188** [P] Add error boundaries to all major components (wrap ReviewList, InsightsDashboard, ExportModal)
- [ ] **T189** [P] Implement user-friendly error messages (replace technical errors with actionable guidance)

### Performance Optimization

- [ ] **T190** [P] Add React.memo to ReviewCard component to prevent unnecessary re-renders
- [ ] **T191** [P] Implement lazy loading for InsightsDashboard (only load when Insights tab is clicked)
- [ ] **T192** [P] Add debouncing to SearchBar input (already in US4, verify implementation)
- [ ] **T193** [P] Implement IndexedDB migration when review count exceeds 200 (move from Chrome Storage to IndexedDB)
- [ ] **T194** [P] Add Web Worker for AI insights processing (offload from main thread to prevent UI blocking)

### User Preferences & Settings

- [ ] **T195** Create Settings panel component in extension/popup/components/SettingsPanel.tsx
- [ ] **T196** Add theme selector (light/dark/auto) in Settings
- [ ] **T197** Add default export format selector in Settings
- [ ] **T198** Add auto-sync toggle and sync interval selector in Settings
- [ ] **T199** Add insights cache duration selector in Settings
- [ ] **T200** Add show photos toggle in Settings
- [ ] **T201** Add results per page selector in Settings
- [ ] **T202** Add AI API key management in Settings (show/hide key, validate key, test connection)
- [ ] **T203** Save all settings to chrome.storage.sync (UserPreferences)

### Accessibility

- [ ] **T204** [P] Add ARIA labels to all interactive elements (buttons, inputs, checkboxes)
- [ ] **T205** [P] Ensure keyboard navigation works (tab through all controls)
- [ ] **T206** [P] Add focus indicators to all focusable elements
- [ ] **T207** [P] Verify screen reader compatibility (test with VoiceOver/NVDA)

### Security

- [ ] **T208** [P] Encrypt auth tokens before storing in chrome.storage (use Web Crypto API)
- [ ] **T209** [P] Implement Content Security Policy in manifest.json (restrict script sources)
- [ ] **T210** [P] Sanitize user input in search and filter fields (prevent XSS)
- [ ] **T211** [P] Validate API responses before storing (check for unexpected fields, types)

### Documentation

- [ ] **T212** [P] Update README.md with installation instructions for end users
- [ ] **T213** [P] Update quickstart.md with any setup changes made during implementation
- [ ] **T214** [P] Add inline code comments for complex logic (especially AI prompts, storage migration)
- [ ] **T215** [P] Create CHANGELOG.md documenting v1.0.0 release notes

### Extension Store Preparation

- [ ] **T216** [P] Create promotional images for Chrome Web Store (1280x800px screenshots)
- [ ] **T217** [P] Write extension description for Chrome Web Store listing (132 char summary, detailed description)
- [ ] **T218** [P] Create demo video showing key features (US1, US2, US3, US4)
- [ ] **T219** [P] Prepare privacy policy document (data storage, API usage, no server-side collection)

### Final Build & Testing

- [ ] **T220** Run full production build (npm run build) and verify bundle size <5MB
- [ ] **T221** Test extension in Chrome (install from dist/, verify all user stories work)
- [ ] **T222** Test extension in Edge browser (verify Chromium compatibility)
- [ ] **T223** Load test with 500+ reviews (verify performance doesn't degrade)
- [ ] **T224** Test offline mode (disconnect internet, verify cached reviews still accessible)
- [ ] **T225** Test with rate-limited Google API (verify fallback to scraping works)
- [ ] **T226** Test with failed AI API (verify error handling, allow manual retry)
- [ ] **T227** Verify all success criteria from spec.md are met (SC-001 through SC-010)

**Checkpoint**: Extension is production-ready ✅

---

## Task Dependencies & Execution Order

### Critical Path (Must complete sequentially)
1. **Phase 1: Setup** (T001-T011) → Enables all other work
2. **Phase 2: Foundational** (T012-T036) → Blocks all user stories
3. **Phase 3: US1** (T037-T068) → MVP core, blocks US4
4. **Phase 4: US4** (T069-T089) → Independent after US1
5. **Phase 5: US2** (T090-T133) → Independent after US1
6. **Phase 6: US3** (T134-T186) → Independent after US1
7. **Phase 7: Polish** (T187-T227) → Requires all user stories complete

### User Story Dependencies
- **US1 (View Reviews)**: No dependencies (after Foundation)
- **US4 (Search/Filter)**: Depends on US1 (needs ReviewList, ReviewCard)
- **US2 (Export)**: Depends on US1 (needs Review data)
- **US3 (Insights)**: Depends on US1 (needs Review data)

### Parallelization Opportunities

**Within Phase 2 (Foundation)**:
- T012-T013 (Type definitions) [P]
- T033-T034 (UI components, styles) [P]

**Within Phase 3 (US1)**:
- T043-T046 (Content script) [P] while doing T037-T042 (API client)
- T062-T066 (Auth UI) [P] while doing T055-T061 (Review list UI)
- T067-T068 (Utilities) [P] with any other US1 task

**Within Phase 5 (US2)**:
- T097-T100 (JSON export) [P] with T090-T096 (CSV export)
- T101-T108 (PDF export) [P] with CSV/JSON tasks
- T120-T122 (Export history) [P] with T123-T133 (Export UI)

**Within Phase 6 (US3)**:
- T148-T150 (Category) [P] with T145-T147 (Sentiment)
- T151-T153 (Pattern) [P] with T154-T156 (Personalized)
- T166-T170 (Statistics) [P] with T139-T144 (Prompts)
- T182-T186 (Cost estimation) [P] with T171-T181 (UI)

**Within Phase 7 (Polish)**:
- Almost all tasks can run in parallel (marked with [P])

### Suggested Parallel Execution Plan

**Sprint 1: Foundation (Week 1)**
- Day 1-2: Phase 1 Setup (T001-T011)
- Day 3-5: Phase 2 Foundation (T012-T036, many tasks in parallel)

**Sprint 2: MVP Core (Week 2-3)**
- Week 2: Phase 3 US1 Implementation (T037-T068)
  - Parallel stream 1: API + Sync (T037-T054)
  - Parallel stream 2: UI + Auth (T055-T066)
  - Parallel stream 3: Utilities (T067-T068)
- Week 3: MVP testing and refinement

**Sprint 3: Enhanced Features (Week 4-5)**
- Phase 4 US4 Search/Filter (T069-T089) - Week 4
- Phase 5 US2 Export (T090-T133) - Week 5
  - Parallel: CSV, JSON, PDF generators
  - Sequential: Export service, UI

**Sprint 4: Intelligence Layer (Week 6-7)**
- Phase 6 US3 AI Insights (T134-T186) - Week 6-7
  - Parallel: Prompts, parsing, statistics, cost estimation
  - Sequential: AI service, caching, UI

**Sprint 5: Polish & Release (Week 8)**
- Phase 7 Polish (T187-T227)
  - Week 8 Days 1-3: Error handling, performance, settings
  - Week 8 Days 4-5: Testing, documentation, store prep

**Total Estimated Timeline**: 8 weeks (40 days) with 1-2 developers

---

## Implementation Strategy

### MVP Delivery (Minimum Viable Product)
**Scope**: Phase 1 + Phase 2 + Phase 3 (US1 only)
**Timeline**: 2-3 weeks
**Deliverable**: Users can authenticate and view all their Google reviews in the extension

**Value**: Solves the core problem (scattered reviews across Google Maps) immediately

### Incremental Delivery Plan

1. **v0.1 (MVP)**: US1 - View Reviews (Week 3)
2. **v0.2**: US1 + US4 - View + Search/Filter (Week 4)
3. **v0.3**: US1 + US4 + US2 - View + Search + Export (Week 5)
4. **v0.4**: US1 + US4 + US2 + US3 - Full Feature Set (Week 7)
5. **v1.0**: v0.4 + Polish (Week 8) - Production Release

### Testing Strategy (If Tests Requested)
Since tests are NOT requested in the spec, testing will be manual:
- **Manual Testing Checklist**: Test each acceptance scenario from spec.md
- **User Acceptance Testing**: Have 3-5 users test each user story independently
- **Performance Testing**: Load test with 500+ reviews, measure metrics against success criteria (SC-001 through SC-010)

---

## Task Summary

**Total Tasks**: 227
- **Phase 1 (Setup)**: 11 tasks
- **Phase 2 (Foundation)**: 25 tasks (blocks all user stories)
- **Phase 3 (US1 - View Reviews)**: 32 tasks 🎯 MVP Core
- **Phase 4 (US4 - Search/Filter)**: 21 tasks
- **Phase 5 (US2 - Export)**: 44 tasks
- **Phase 6 (US3 - AI Insights)**: 53 tasks
- **Phase 7 (Polish)**: 41 tasks

**Parallelization Potential**: ~60 tasks marked [P] can run in parallel (26% of total)

**Estimated Effort**:
- MVP (Phases 1-3): 68 tasks (~3 weeks with 2 developers)
- Full Feature Set (Phases 1-6): 186 tasks (~7 weeks)
- Production Ready (All phases): 227 tasks (~8 weeks)

**Independent Test Criteria**:
- ✅ **US1**: User can authenticate and view all reviews within 5 seconds
- ✅ **US4**: User can search and filter reviews with results appearing within 1 second
- ✅ **US2**: User can export 50 reviews in under 10 seconds with 100% data accuracy
- ✅ **US3**: User can generate AI insights within 15 seconds and see 5+ meaningful observations

**Success Metrics** (from spec.md):
- SC-001: Load 100 reviews in <5s ✓
- SC-002: Export 50 reviews in <10s ✓
- SC-003: AI insights in <15s ✓
- SC-004: 95% auth success rate ✓
- SC-005: Search results in <1s ✓
- SC-006: 100% export data accuracy ✓
- SC-007: Handle 500+ reviews ✓
- SC-008: Complete workflow in <2 min ✓
- SC-009: AI provides 5+ insights ✓
- SC-010: Sync in <10s ✓

---

**Tasks File Generated**: 2025-10-08
**Next Step**: Begin Phase 1 (Setup) - T001
**Recommended MVP**: Complete through Phase 3 (US1) first, then iterate with US4, US2, US3
