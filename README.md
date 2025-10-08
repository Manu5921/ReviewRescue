# Review Rescue - Chrome Extension

A Chrome extension that helps users manage and export their Google reviews with AI-powered insights.

## 🎯 Features

- **View Reviews**: See all your Google reviews in one place
- **Search & Filter**: Find reviews by keyword, rating, date, or category
- **Export**: Download reviews in CSV, JSON, or PDF format
- **AI Insights**: Get sentiment analysis and reviewing patterns

## 🚀 Quick Start

### For Users
Extension coming soon to Chrome Web Store.

### For Developers

#### Local Development
See [QUICK_START_MOBILE.md](./QUICK_START_MOBILE.md) for mobile GitHub Actions workflow.

Or develop locally:
```bash
git clone https://github.com/Manu5921/ReviewRescue.git
cd ReviewRescue
npm install
npm run dev
```

Load unpacked extension from `dist/` in Chrome.

#### Cloud Development (Mobile)
1. Create an issue with label `run-claude`
2. Include: `Task range: T001-T068`
3. GitHub Actions runs implementation automatically
4. Review PR when ready (~3-4 hours)

See templates: [MOBILE_ISSUE_TEMPLATE.md](./MOBILE_ISSUE_TEMPLATE.md)

## 📋 Documentation

- **Planning**: [specs/001-review-rescue-a/](./specs/001-review-rescue-a/)
  - [spec.md](./specs/001-review-rescue-a/spec.md) - Feature specification
  - [plan.md](./specs/001-review-rescue-a/plan.md) - Implementation plan
  - [tasks.md](./specs/001-review-rescue-a/tasks.md) - 227 tasks organized by user story
  - [data-model.md](./specs/001-review-rescue-a/data-model.md) - Data entities
  - [contracts/](./specs/001-review-rescue-a/contracts/) - API interfaces
  - [research.md](./specs/001-review-rescue-a/research.md) - Technology decisions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Build**: Webpack 5
- **Chrome APIs**: Manifest V3, Storage API, Identity (OAuth2)
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Export**: Papa Parse (CSV), jsPDF (PDF)
- **Search**: Fuse.js fuzzy search

## 📦 Project Status

- ✅ Planning complete (spec, plan, tasks)
- 🚧 Implementation: Phase 1-3 (MVP)
- ⏳ User Stories 2-4
- ⏳ Production polish

**MVP Scope**: US1 (View Reviews) - 68 tasks (~3 weeks)

## 🤝 Contributing

This is a personal project, but suggestions are welcome via issues.

## 📄 License

TBD

## 🔗 Links

- [GitHub Actions Workflow](./.github/workflows/claude-max-implementation.yml)
- [Mobile Quick Start](./QUICK_START_MOBILE.md)
- [Issue Templates](./.github/ISSUE_TEMPLATE/)
