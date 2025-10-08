/**
 * Shared TypeScript Types
 *
 * Core type definitions used across all contracts.
 * Matches data-model.md entity definitions.
 */

/**
 * Review entity
 */
export interface Review {
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

/**
 * Photo entity
 */
export interface Photo {
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  caption?: string;
}

/**
 * Insight entity
 */
export interface Insight {
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

/**
 * Insight types
 */
export type InsightType = 'sentiment' | 'category' | 'pattern' | 'personalized';

/**
 * Export Job entity
 */
export interface ExportJob {
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

/**
 * Export formats
 */
export type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Export job status
 */
export type ExportStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * User Session entity
 */
export interface UserSession {
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

/**
 * User Preferences entity
 */
export interface UserPreferences {
  default_export_format?: ExportFormat;
  auto_sync_enabled: boolean;
  sync_interval_minutes?: number;
  insights_cache_hours?: number;
  theme?: Theme;
  default_view?: ViewMode;
  results_per_page?: number;
  show_photos: boolean;
}

/**
 * UI theme options
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * View mode options
 */
export type ViewMode = 'list' | 'grid';

/**
 * Filter criteria
 */
export interface FilterCriteria {
  minRating?: 1 | 2 | 3 | 4 | 5;
  maxRating?: 1 | 2 | 3 | 4 | 5;
  dateRange?: {
    startDate: string; // ISO 8601
    endDate: string; // ISO 8601
  };
  categories?: string[];
  searchQuery?: string;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: 'date_written' | 'rating' | 'business_name';
  order: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  offset?: number;
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Error response (generic)
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: any;
  timestamp: string; // ISO 8601
}
