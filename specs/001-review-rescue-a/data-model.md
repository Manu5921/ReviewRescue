# Data Model: Review Rescue Chrome Extension

**Feature**: Review Rescue Chrome Extension
**Date**: 2025-10-08
**Purpose**: Define core entities, relationships, and validation rules

---

## Overview

This data model describes the entities required to store and manage Google reviews, AI insights, export operations, and user session state within a Chrome extension context. All data is stored client-side (Chrome Storage API + IndexedDB) with no server-side persistence.

---

## Entity Definitions

### 1. Review

Represents a single Google review written by the user.

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 or Google review ID | Unique identifier for the review |
| `business_name` | string | Yes | Max 200 chars, non-empty | Name of the business reviewed |
| `business_category` | string | No | Max 100 chars | Category (e.g., "Restaurant", "Hotel", "Coffee Shop") |
| `business_location` | string | No | Max 500 chars | Full address or city/state |
| `rating` | integer | Yes | 1-5 (inclusive) | Star rating (1 = worst, 5 = best) |
| `review_text` | string | No | Max 10,000 chars | User's written review (empty if rating-only) |
| `date_written` | ISO 8601 string | Yes | Valid date, not future | When the review was originally posted |
| `date_modified` | ISO 8601 string | No | Valid date, >= date_written | Last time review was edited (null if never edited) |
| `photos` | array of Photo | No | Max 10 photos | Attached photos/images |
| `google_maps_url` | string | No | Valid URL | Link to the review on Google Maps |
| `is_synced` | boolean | Yes | Default: true | Whether synced from Google (false if manual entry) |

**Relationships**:
- One Review has many Insights (one-to-many)
- Many Reviews belong to one Export Job (many-to-many via join)

**State Transitions**:
- Review can be created (new sync from Google)
- Review can be updated (edited on Google, re-synced)
- Review can be deleted (removed from Google, user deletes locally)

**TypeScript Interface**:
```typescript
interface Review {
  id: string;
  business_name: string;
  business_category?: string;
  business_location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text?: string;
  date_written: string; // ISO 8601
  date_modified?: string; // ISO 8601
  photos?: Photo[];
  google_maps_url?: string;
  is_synced: boolean;
}
```

---

### 2. Photo

Represents an image attached to a review.

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `url` | string | Yes | Valid URL or data URI | Image URL from Google or cached data URI |
| `thumbnail_url` | string | No | Valid URL or data URI | Smaller version for preview |
| `width` | integer | No | > 0 | Original image width in pixels |
| `height` | integer | No | > 0 | Original image height in pixels |
| `caption` | string | No | Max 500 chars | User-provided caption (if any) |

**Relationships**:
- Many Photos belong to one Review (many-to-one)

**TypeScript Interface**:
```typescript
interface Photo {
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  caption?: string;
}
```

---

### 3. Insight

Represents AI-generated analysis about review patterns.

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 | Unique identifier for the insight |
| `insight_type` | enum | Yes | One of: sentiment, category, pattern, personalized | Type of insight |
| `title` | string | Yes | Max 100 chars, non-empty | Short summary (e.g., "Sentiment Trend") |
| `insight_text` | string | Yes | Max 2,000 chars, non-empty | Detailed observation or analysis |
| `confidence_score` | number | No | 0.0 - 1.0 | AI confidence level (0 = low, 1 = high) |
| `generated_date` | ISO 8601 string | Yes | Valid date, not future | When insight was generated |
| `data_range_start` | ISO 8601 string | No | Valid date | Earliest review date analyzed |
| `data_range_end` | ISO 8601 string | No | Valid date, >= data_range_start | Latest review date analyzed |
| `metadata` | JSON object | No | Valid JSON | Additional data (e.g., chart data, trend values) |
| `review_count` | integer | Yes | >= 0 | Number of reviews analyzed for this insight |

**Relationships**:
- Many Insights relate to many Reviews (conceptually, though not stored as foreign keys)
- Insights are regenerated periodically (not immutable)

**State Transitions**:
- Insight can be generated (user clicks "Insights" tab)
- Insight can be cached (valid for 24 hours)
- Insight can be invalidated (new reviews added, cache expired)
- Insight can be regenerated (user refreshes or cache expired)

**TypeScript Interface**:
```typescript
type InsightType = 'sentiment' | 'category' | 'pattern' | 'personalized';

interface Insight {
  id: string;
  insight_type: InsightType;
  title: string;
  insight_text: string;
  confidence_score?: number;
  generated_date: string; // ISO 8601
  data_range_start?: string; // ISO 8601
  data_range_end?: string; // ISO 8601
  metadata?: Record<string, any>;
  review_count: number;
}
```

**Example Insights**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "insight_type": "sentiment",
  "title": "Sentiment Trend - Last 12 Months",
  "insight_text": "Your sentiment has been consistently positive, with 85% of reviews rated 4-5 stars. A slight dip occurred in March 2024 (60% positive), coinciding with 3 reviews about slow service.",
  "confidence_score": 0.92,
  "generated_date": "2025-10-08T14:30:00Z",
  "data_range_start": "2024-10-01T00:00:00Z",
  "data_range_end": "2025-10-08T14:30:00Z",
  "metadata": {
    "monthly_sentiment": [0.8, 0.9, 0.6, 0.85, 0.9],
    "positive_count": 17,
    "negative_count": 3
  },
  "review_count": 20
}
```

---

### 4. Export Job

Represents an export operation (CSV, JSON, PDF).

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 | Unique identifier for the export |
| `export_format` | enum | Yes | One of: csv, json, pdf | Output format |
| `review_ids` | array of string | Yes | Non-empty, all valid Review IDs | Reviews included in export |
| `file_name` | string | Yes | Valid filename, no path separators | Output filename (e.g., "reviews-2025-10-08.csv") |
| `file_size_bytes` | integer | No | >= 0 | Size of generated file |
| `created_at` | ISO 8601 string | Yes | Valid date, not future | When export was initiated |
| `completed_at` | ISO 8601 string | No | Valid date, >= created_at | When export finished (null if in progress) |
| `status` | enum | Yes | One of: pending, in_progress, completed, failed | Export operation status |
| `error_message` | string | No | Max 500 chars | Error details if status = failed |

**Relationships**:
- One Export Job includes many Reviews (many-to-many)

**State Transitions**:
```
pending → in_progress → completed
pending → in_progress → failed
```

**TypeScript Interface**:
```typescript
type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface ExportJob {
  id: string;
  export_format: ExportFormat;
  review_ids: string[];
  file_name: string;
  file_size_bytes?: number;
  created_at: string; // ISO 8601
  completed_at?: string; // ISO 8601
  status: ExportStatus;
  error_message?: string;
}
```

**Validation Rules**:
- `review_ids` must reference existing Review entities
- `file_name` must match pattern: `/^[\w\-]+\.(csv|json|pdf)$/`
- `completed_at` required when `status = completed`
- `error_message` required when `status = failed`

---

### 5. User Session

Represents authenticated user state and extension configuration.

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `google_account_id` | string | Yes | Non-empty, Google user ID | Unique Google account identifier |
| `google_email` | string | Yes | Valid email format | User's Google email address |
| `auth_token` | string | No | Non-empty | OAuth2 access token (encrypted) |
| `refresh_token` | string | No | Non-empty | OAuth2 refresh token (encrypted) |
| `token_expires_at` | ISO 8601 string | No | Valid date | When access token expires |
| `permission_scopes` | array of string | Yes | Non-empty | Granted OAuth scopes |
| `last_sync_at` | ISO 8601 string | No | Valid date | Last successful review sync |
| `cached_review_count` | integer | Yes | >= 0 | Number of reviews in local storage |
| `preferences` | UserPreferences | Yes | Valid object | User settings |

**Relationships**:
- One User Session has one set of Preferences (one-to-one, embedded)

**State Transitions**:
- Session can be authenticated (user logs in)
- Session can be active (valid token)
- Session can be expired (token expired)
- Session can be revoked (user logs out or permissions revoked)

**TypeScript Interface**:
```typescript
interface UserSession {
  google_account_id: string;
  google_email: string;
  auth_token?: string; // Encrypted
  refresh_token?: string; // Encrypted
  token_expires_at?: string; // ISO 8601
  permission_scopes: string[];
  last_sync_at?: string; // ISO 8601
  cached_review_count: number;
  preferences: UserPreferences;
}
```

---

### 6. User Preferences

Represents user settings and configuration (embedded in User Session).

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `default_export_format` | enum | No | One of: csv, json, pdf | Default for export (default: csv) |
| `auto_sync_enabled` | boolean | Yes | Default: true | Auto-sync reviews on extension open |
| `sync_interval_minutes` | integer | No | 5-1440 (1 day) | How often to auto-sync (default: 60) |
| `insights_cache_hours` | integer | No | 1-168 (1 week) | How long to cache insights (default: 24) |
| `theme` | enum | No | One of: light, dark, auto | UI theme preference (default: auto) |
| `default_view` | enum | No | One of: list, grid | Reviews display mode (default: list) |
| `results_per_page` | integer | No | 10-100 | Pagination size (default: 50) |
| `show_photos` | boolean | Yes | Default: true | Display photos in review cards |

**TypeScript Interface**:
```typescript
type ExportFormat = 'csv' | 'json' | 'pdf';
type Theme = 'light' | 'dark' | 'auto';
type ViewMode = 'list' | 'grid';

interface UserPreferences {
  default_export_format?: ExportFormat;
  auto_sync_enabled: boolean;
  sync_interval_minutes?: number;
  insights_cache_hours?: number;
  theme?: Theme;
  default_view?: ViewMode;
  results_per_page?: number;
  show_photos: boolean;
}
```

---

## Data Relationships Diagram

```
┌─────────────────┐
│  User Session   │
│  (singleton)    │
└────────┬────────┘
         │ owns
         │ (1:1)
         ▼
┌─────────────────┐
│ User Preferences│
│  (embedded)     │
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│     Review      │◄─────┤     Photo       │
│   (many)        │      │   (many)        │
└────────┬────────┘      └─────────────────┘
         │                     belongs to
         │                     (many:1)
         │
         │ analyzed by
         │ (many:many, implicit)
         │
         ▼
┌─────────────────┐
│    Insight      │
│   (many)        │
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│     Review      │◄─────┤  Export Job     │
│   (many)        │      │   (many)        │
└─────────────────┘      └─────────────────┘
         included in
         (many:many via review_ids)
```

---

## Storage Strategy

### Chrome Storage Sync (Syncs across devices)
- **User Session** (excluding tokens) - sync account info
- **User Preferences** - sync settings

### Chrome Storage Local (Device-specific)
- **Auth Tokens** (encrypted) - security best practice
- **Review Cache** (up to 200 reviews) - fast access
- **Insight Cache** - avoid redundant AI calls
- **Export History** - recent exports

### IndexedDB (For large datasets)
- **Reviews Table** (500+ reviews) - structured queries
  - Index: `business_name`, `rating`, `date_written`
- **Insights Table** - historical insights
  - Index: `generated_date`, `insight_type`

---

## Validation Rules Summary

### Global Rules
1. All timestamps MUST be ISO 8601 format (UTC)
2. All string fields MUST be sanitized to prevent XSS (even though client-side)
3. All user-provided text MUST be trimmed and length-validated
4. All IDs MUST be UUID v4 format (except Google-provided IDs)

### Business Rules
1. **Review Rating**: Must be 1-5 stars (inclusive), no decimals
2. **Review Text**: Optional but recommended (empty reviews = rating-only)
3. **Photos**: Max 10 per review (Google's limit)
4. **Insight Cache**: Valid for 24 hours (configurable in preferences)
5. **Export Format**: File extension must match export_format
6. **Sync Frequency**: Minimum 5 minutes between auto-syncs (prevent rate limiting)

### Data Integrity
1. **Review Deduplication**: Use Google review ID as primary key (no duplicates)
2. **Orphan Prevention**: Delete insights when all related reviews are deleted
3. **Token Security**: Auth tokens MUST be encrypted before storage
4. **Cache Invalidation**: Clear insight cache when new reviews added

---

## Migration Strategy

### Version 1.0 (MVP)
- Use Chrome Storage Local for all data
- Support up to 200 reviews

### Version 1.1 (Scaling)
- Detect when review count > 200
- Auto-migrate to IndexedDB
- Show user notification: "Optimizing storage for large dataset..."
- Background migration (non-blocking)

### Version 2.0 (Future)
- Optional cloud backup (user opt-in)
- Sync insights across devices (currently regenerated per device)

---

## Sample Data (TypeScript)

```typescript
// Example Review
const sampleReview: Review = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  business_name: "Joe's Pizza",
  business_category: "Restaurant",
  business_location: "123 Main St, New York, NY 10001",
  rating: 5,
  review_text: "Best pizza in NYC! The crust is perfectly crispy and the sauce is amazing. Highly recommend the margherita pizza.",
  date_written: "2025-09-15T18:30:00Z",
  date_modified: null,
  photos: [
    {
      url: "https://lh3.googleusercontent.com/...",
      thumbnail_url: "https://lh3.googleusercontent.com/.../=s100",
      width: 1200,
      height: 800
    }
  ],
  google_maps_url: "https://maps.google.com/?cid=123456789",
  is_synced: true
};

// Example User Session
const sampleSession: UserSession = {
  google_account_id: "1234567890",
  google_email: "user@example.com",
  auth_token: "[ENCRYPTED]",
  refresh_token: "[ENCRYPTED]",
  token_expires_at: "2025-10-09T14:30:00Z",
  permission_scopes: ["https://www.googleapis.com/auth/business.manage"],
  last_sync_at: "2025-10-08T12:00:00Z",
  cached_review_count: 42,
  preferences: {
    default_export_format: "csv",
    auto_sync_enabled: true,
    sync_interval_minutes: 60,
    insights_cache_hours: 24,
    theme: "auto",
    default_view: "list",
    results_per_page: 50,
    show_photos: true
  }
};

// Example Export Job
const sampleExport: ExportJob = {
  id: "660e8400-e29b-41d4-a716-446655440000",
  export_format: "csv",
  review_ids: ["550e8400-e29b-41d4-a716-446655440000", "..."],
  file_name: "google-reviews-export-2025-10-08.csv",
  file_size_bytes: 15360,
  created_at: "2025-10-08T14:30:00Z",
  completed_at: "2025-10-08T14:30:05Z",
  status: "completed",
  error_message: null
};
```

---

**Data Model Version**: 1.0
**Last Updated**: 2025-10-08
**Next Phase**: API Contracts (define Chrome Extension APIs and AI service integration)
