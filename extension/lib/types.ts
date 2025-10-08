// Core Data Types

export interface Review {
  id: string;
  google_review_id: string;
  business_name: string;
  business_location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text: string;
  author_name: string;
  author_photo_url?: string;
  review_date: string; // ISO 8601 format
  photos?: Photo[];
  response?: ReviewResponse;
  synced_at: string; // ISO 8601 format
}

export interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

export interface ReviewResponse {
  text: string;
  date: string; // ISO 8601 format
  responder_name?: string;
}

export interface Insight {
  id: string;
  type: 'sentiment' | 'category' | 'pattern' | 'personalized';
  title: string;
  insight_text: string;
  confidence_score: number; // 0-1
  review_count: number;
  generated_at: string; // ISO 8601 format
  metadata?: Record<string, any>;
}

export interface SentimentInsight extends Insight {
  type: 'sentiment';
  metadata: {
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    monthly_trend?: Array<{ month: string; sentiment: number }>;
  };
}

export interface CategoryInsight extends Insight {
  type: 'category';
  metadata: {
    categories: Array<{
      name: string;
      count: number;
      percentage: number;
      avg_rating: number;
    }>;
  };
}

export interface PatternInsight extends Insight {
  type: 'pattern';
  metadata: {
    rating_distribution: Record<string, number>;
    avg_rating: number;
    review_frequency: string;
    avg_review_length: number;
  };
}

export interface PersonalizedInsight extends Insight {
  type: 'personalized';
  metadata: {
    observations: string[];
    recommendations: string[];
    personality_traits: string[];
  };
}

export interface ExportJob {
  id: string;
  format: 'csv' | 'json' | 'pdf';
  review_ids: string[];
  file_name: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string; // ISO 8601 format
  completed_at?: string; // ISO 8601 format
}

export interface UserSession {
  user_id: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string; // ISO 8601 format
  is_authenticated: boolean;
  last_sync_at?: string; // ISO 8601 format
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  default_export_format: 'csv' | 'json' | 'pdf';
  auto_sync_enabled: boolean;
  sync_interval_hours: number; // Default: 4
  show_photos: boolean;
  default_view: 'list' | 'grid';
  results_per_page: number; // Default: 50
  insights_cache_hours: number; // Default: 24
  ai_provider: 'claude' | 'openai';
  ai_model?: string;
}

// Filter and Pagination Types

export interface FilterCriteria {
  rating_min?: 1 | 2 | 3 | 4 | 5;
  rating_max?: 1 | 2 | 3 | 4 | 5;
  date_from?: string; // ISO 8601 format
  date_to?: string; // ISO 8601 format
  categories?: string[];
  search_query?: string;
  has_photos?: boolean;
  has_response?: boolean;
}

export interface SortOptions {
  field: 'date' | 'rating' | 'business_name' | 'review_length';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Error Types

export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'PERMISSION_DENIED' | 'SERIALIZATION_ERROR' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'AUTH_FAILED' | 'TOKEN_EXPIRED' | 'PERMISSION_DENIED' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ReviewsFetchError extends Error {
  constructor(
    message: string,
    public code: 401 | 403 | 429 | 500 | 'UNKNOWN',
    public retry_after?: number
  ) {
    super(message);
    this.name = 'ReviewsFetchError';
  }
}

export class ScrapingError extends Error {
  constructor(
    message: string,
    public code: 'PARSE_ERROR' | 'WRONG_PAGE' | 'NO_DATA' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export class ExportError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION_FAILED' | 'GENERATION_FAILED' | 'FILE_TOO_LARGE' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export class DownloadError extends Error {
  constructor(
    message: string,
    public code: 'PERMISSION_DENIED' | 'DISK_FULL' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_KEY' | 'RATE_LIMIT' | 'TIMEOUT' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Sync Status

export interface SyncStatus {
  is_syncing: boolean;
  progress_percentage: number;
  current_operation: string;
  last_sync_at?: string; // ISO 8601 format
  next_sync_at?: string; // ISO 8601 format
  error?: string;
}

// Storage Stats

export interface StorageStats {
  bytes_in_use: number;
  quota_bytes: number;
  percentage_used: number;
  review_count: number;
  estimated_reviews_remaining: number;
}
