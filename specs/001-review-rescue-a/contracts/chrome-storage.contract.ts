/**
 * Chrome Storage API Contract
 *
 * Defines the interface for storing and retrieving data using Chrome Storage API.
 * Abstracts chrome.storage.local and chrome.storage.sync APIs.
 */

import { Review, UserSession, Insight, ExportJob, UserPreferences } from './types';

/**
 * Storage keys used throughout the extension
 */
export enum StorageKey {
  USER_SESSION = 'user_session',
  USER_PREFERENCES = 'user_preferences',
  REVIEWS_CACHE = 'reviews_cache',
  INSIGHTS_CACHE = 'insights_cache',
  EXPORT_HISTORY = 'export_history',
  LAST_SYNC = 'last_sync',
  AUTH_TOKEN = 'auth_token',
  REFRESH_TOKEN = 'refresh_token',
}

/**
 * Storage Service Interface
 */
export interface IStorageService {
  /**
   * Store a value in Chrome Storage Local
   * @param key Storage key
   * @param value Value to store
   * @throws Error if storage quota exceeded
   */
  setLocal<T>(key: StorageKey | string, value: T): Promise<void>;

  /**
   * Retrieve a value from Chrome Storage Local
   * @param key Storage key
   * @returns Stored value or null if not found
   */
  getLocal<T>(key: StorageKey | string): Promise<T | null>;

  /**
   * Store a value in Chrome Storage Sync (syncs across devices)
   * @param key Storage key
   * @param value Value to store
   * @throws Error if storage quota exceeded or value too large
   */
  setSync<T>(key: StorageKey | string, value: T): Promise<void>;

  /**
   * Retrieve a value from Chrome Storage Sync
   * @param key Storage key
   * @returns Stored value or null if not found
   */
  getSync<T>(key: StorageKey | string): Promise<T | null>;

  /**
   * Remove a key from Chrome Storage Local
   * @param key Storage key
   */
  removeLocal(key: StorageKey | string): Promise<void>;

  /**
   * Remove a key from Chrome Storage Sync
   * @param key Storage key
   */
  removeSync(key: StorageKey | string): Promise<void>;

  /**
   * Clear all data from Chrome Storage Local
   */
  clearLocal(): Promise<void>;

  /**
   * Clear all data from Chrome Storage Sync
   */
  clearSync(): Promise<void>;

  /**
   * Get storage usage statistics
   * @returns Storage usage in bytes for local and sync
   */
  getStorageStats(): Promise<StorageStats>;
}

/**
 * Storage usage statistics
 */
export interface StorageStats {
  local: {
    bytesInUse: number;
    quota: number;
    percentUsed: number;
  };
  sync: {
    bytesInUse: number;
    quota: number;
    percentUsed: number;
  };
}

/**
 * Review Cache Service Interface
 * Specialized service for managing review data
 */
export interface IReviewCacheService {
  /**
   * Store reviews in cache
   * @param reviews Array of reviews
   * @throws Error if storage quota exceeded
   */
  cacheReviews(reviews: Review[]): Promise<void>;

  /**
   * Retrieve all cached reviews
   * @returns Array of reviews or empty array
   */
  getCachedReviews(): Promise<Review[]>;

  /**
   * Add a single review to cache
   * @param review Review to add
   */
  addReview(review: Review): Promise<void>;

  /**
   * Update a review in cache
   * @param reviewId Review ID
   * @param updates Partial review data to update
   */
  updateReview(reviewId: string, updates: Partial<Review>): Promise<void>;

  /**
   * Delete a review from cache
   * @param reviewId Review ID
   */
  deleteReview(reviewId: string): Promise<void>;

  /**
   * Get a single review by ID
   * @param reviewId Review ID
   * @returns Review or null if not found
   */
  getReview(reviewId: string): Promise<Review | null>;

  /**
   * Clear all cached reviews
   */
  clearReviews(): Promise<void>;

  /**
   * Get review count
   * @returns Number of cached reviews
   */
  getReviewCount(): Promise<number>;

  /**
   * Check if storage migration to IndexedDB is needed
   * @returns True if review count exceeds threshold (200)
   */
  needsMigration(): Promise<boolean>;
}

/**
 * Session Service Interface
 * Manages user session and authentication state
 */
export interface ISessionService {
  /**
   * Store user session
   * @param session User session data
   */
  setSession(session: UserSession): Promise<void>;

  /**
   * Retrieve current user session
   * @returns User session or null if not authenticated
   */
  getSession(): Promise<UserSession | null>;

  /**
   * Update session fields
   * @param updates Partial session data
   */
  updateSession(updates: Partial<UserSession>): Promise<void>;

  /**
   * Clear user session (logout)
   */
  clearSession(): Promise<void>;

  /**
   * Check if user is authenticated
   * @returns True if valid session exists
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Check if auth token is expired
   * @returns True if token expired or expires within 5 minutes
   */
  isTokenExpired(): Promise<boolean>;

  /**
   * Store auth tokens securely
   * @param authToken OAuth2 access token
   * @param refreshToken OAuth2 refresh token
   * @param expiresAt Token expiration timestamp
   */
  setAuthTokens(authToken: string, refreshToken: string, expiresAt: string): Promise<void>;

  /**
   * Retrieve auth tokens
   * @returns Auth and refresh tokens or null if not found
   */
  getAuthTokens(): Promise<{ authToken: string; refreshToken: string } | null>;

  /**
   * Clear auth tokens
   */
  clearAuthTokens(): Promise<void>;
}

/**
 * Preferences Service Interface
 * Manages user preferences and settings
 */
export interface IPreferencesService {
  /**
   * Store user preferences
   * @param preferences User preferences
   */
  setPreferences(preferences: UserPreferences): Promise<void>;

  /**
   * Retrieve user preferences
   * @returns User preferences or default preferences
   */
  getPreferences(): Promise<UserPreferences>;

  /**
   * Update specific preference fields
   * @param updates Partial preferences data
   */
  updatePreferences(updates: Partial<UserPreferences>): Promise<void>;

  /**
   * Reset preferences to defaults
   */
  resetPreferences(): Promise<void>;

  /**
   * Get default preferences
   * @returns Default user preferences
   */
  getDefaultPreferences(): UserPreferences;
}

/**
 * Insights Cache Service Interface
 * Manages AI-generated insights cache
 */
export interface IInsightsCacheService {
  /**
   * Cache insights
   * @param insights Array of insights
   */
  cacheInsights(insights: Insight[]): Promise<void>;

  /**
   * Retrieve cached insights
   * @returns Array of insights or empty array
   */
  getCachedInsights(): Promise<Insight[]>;

  /**
   * Add a single insight to cache
   * @param insight Insight to add
   */
  addInsight(insight: Insight): Promise<void>;

  /**
   * Clear insights cache
   */
  clearInsights(): Promise<void>;

  /**
   * Check if insights cache is valid
   * @param cacheHours How many hours cache is valid (default: 24)
   * @returns True if cache is fresh
   */
  isCacheValid(cacheHours?: number): Promise<boolean>;

  /**
   * Invalidate insights cache (force regeneration)
   */
  invalidateCache(): Promise<void>;
}

/**
 * Export History Service Interface
 * Tracks export operations
 */
export interface IExportHistoryService {
  /**
   * Store export job in history
   * @param exportJob Export job data
   */
  addExportJob(exportJob: ExportJob): Promise<void>;

  /**
   * Retrieve export history
   * @param limit Max number of exports to return (default: 50)
   * @returns Array of export jobs, newest first
   */
  getExportHistory(limit?: number): Promise<ExportJob[]>;

  /**
   * Update export job status
   * @param exportId Export job ID
   * @param status New status
   * @param completedAt Completion timestamp (optional)
   * @param errorMessage Error message if failed (optional)
   */
  updateExportJob(
    exportId: string,
    status: ExportJob['status'],
    completedAt?: string,
    errorMessage?: string
  ): Promise<void>;

  /**
   * Clear export history
   */
  clearHistory(): Promise<void>;

  /**
   * Get export job by ID
   * @param exportId Export job ID
   * @returns Export job or null if not found
   */
  getExportJob(exportId: string): Promise<ExportJob | null>;
}

/**
 * Storage Event Listener
 * Subscribe to storage changes
 */
export interface IStorageListener {
  /**
   * Listen for storage changes
   * @param callback Function called when storage changes
   * @returns Unsubscribe function
   */
  onStorageChange(callback: (changes: StorageChanges) => void): () => void;
}

/**
 * Storage change details
 */
export interface StorageChanges {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}

/**
 * Storage Error Types
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_KEY = 'INVALID_KEY',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Storage Error
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
