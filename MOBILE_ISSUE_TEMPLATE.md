# 📱 Template d'Issue pour Mobile GitHub App

Copie-colle ce template dans une nouvelle issue depuis ton mobile.

**IMPORTANT**: Le format `Task range: T001-T068` est obligatoire pour que le workflow fonctionne.

---

## Template pour MVP (Setup + Foundation + US1)

```markdown
## 🎯 Objective
Implement MVP - User Story 1: View All Google Reviews in Chrome Extension

## 📋 Task Range
Task range: T001-T068

## 📦 Deliverable
- ✅ Project structure and build system (T001-T011)
- ✅ Core infrastructure: storage, auth, UI foundation (T012-T036)
- ✅ Google Reviews API integration with OAuth (T037-T042)
- ✅ Review sync service with automatic/manual triggers (T047-T054)
- ✅ Review list UI with virtual scrolling (T055-T061)
- ✅ Authentication flow and login screen (T062-T066)

**Result**: Users can authenticate with Google and view all their reviews in the extension popup within 5 seconds.

## 📝 Notes
- Estimated time: 3-4 hours
- This implements Phase 1, 2, and 3 from tasks.md
- Creates production-ready MVP for Chrome Web Store
```

**Ajoute le label**: `run-claude` ✅

---

## Templates par Phase (optionnel)

### Setup Only (T001-T011)

```markdown
## 🎯 Objective
Setup project structure and build system

## 📋 Task Range
Task range: T001-T011

## 📦 Deliverable
- Project directory structure
- Node.js + TypeScript + React configuration
- Webpack build system
- Chrome extension manifest.json
- npm scripts ready

## 📝 Notes
- Estimated time: 30 minutes
- Foundation for all other phases
```

### Foundation Only (T012-T036)

```markdown
## 🎯 Objective
Build core infrastructure (storage, auth, UI)

## 📋 Task Range
Task range: T012-T036

## 📦 Deliverable
- TypeScript types matching data model
- Chrome Storage service implementation
- Google OAuth service foundation
- Background service worker setup
- Basic UI components (shadcn/ui)

## 📝 Notes
- Estimated time: 1-2 hours
- Required before any user story
```

### US1 Implementation Only (T037-T068)

```markdown
## 🎯 Objective
Implement User Story 1 - View Reviews

## 📋 Task Range
Task range: T037-T068

## 📦 Deliverable
- Google Reviews API client
- Review sync service
- Review list UI with virtual scrolling
- Authentication screens
- Photo display support

## 📝 Notes
- Estimated time: 2-3 hours
- Requires Foundation to be complete first
```

---

## Autres User Stories

### US4: Search & Filter (T069-T089)

```markdown
## 🎯 Objective
Add search and filter capabilities to review list

## 📋 Task Range
Task range: T069-T089

## 📦 Deliverable
- Fuse.js fuzzy search integration
- Multi-criteria filtering (rating, date, category)
- Search bar with debouncing
- Filter panel UI
- Results update in <1 second

## 📝 Notes
- Requires US1 complete
- Estimated time: 1-2 hours
```

### US2: Export Reviews (T090-T133)

```markdown
## 🎯 Objective
Enable CSV, JSON, PDF export

## 📋 Task Range
Task range: T090-T133

## 📦 Deliverable
- CSV export with Papa Parse
- JSON export with metadata
- PDF export with jsPDF
- Export modal UI
- Download manager
- Export history tracking

## 📝 Notes
- Requires US1 complete
- Estimated time: 2-3 hours
```

### US3: AI Insights (T134-T186)

```markdown
## 🎯 Objective
Add AI-powered review insights and analytics

## 📋 Task Range
Task range: T134-T186

## 📦 Deliverable
- Claude API integration
- Sentiment analysis
- Category breakdown
- Pattern detection
- Personalized insights
- Insights dashboard UI with charts

## 📝 Notes
- Requires US1 complete
- Estimated time: 3-4 hours
- Needs ANTHROPIC_API_KEY configured
```

### Polish & Production (T187-T227)

```markdown
## 🎯 Objective
Final polish and production readiness

## 📋 Task Range
Task range: T187-T227

## 📦 Deliverable
- Error handling and logging
- Performance optimizations
- Settings panel
- Accessibility improvements
- Security hardening
- Chrome Web Store preparation
- Documentation updates

## 📝 Notes
- Requires all user stories complete
- Estimated time: 2-3 hours
```

---

## 📱 Instructions Mobile GitHub App

1. **Ouvre GitHub App**
2. **Manu5921/ReviewRescue** → **Issues** tab
3. **Tap (+)** pour nouvelle issue
4. **Copie-colle** le template choisi ci-dessus
5. **Titre**: Personnalise (ex: "Implement MVP - US1 View Reviews")
6. **Labels**: Ajoute `run-claude` ✅
7. **Submit**

Le workflow démarre automatiquement dès que le label est ajouté !

---

## ⚠️ Format Requis

Le workflow cherche spécifiquement cette ligne :
```
Task range: T001-T068
```

**Pattern reconnu**: `T[chiffres]-T[chiffres]`

**Exemples valides**:
- ✅ `Task range: T001-T068`
- ✅ `T001-T068` (seul sur une ligne)
- ✅ `Implement tasks T001-T068 for MVP`

**Exemples invalides**:
- ❌ `Tasks: T001-T068` (pas "Task range")
- ❌ `T1-T68` (besoin de 3 chiffres minimum)
- ❌ `/speckit.implement --tasks T001-T068` (pas de slash command)
