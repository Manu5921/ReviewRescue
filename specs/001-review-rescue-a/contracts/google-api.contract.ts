/**
 * Google API Contract
 *
 * Defines the interface for interacting with Google APIs (OAuth, My Business, Maps).
 * Abstracts Google authentication and review data retrieval.
 */

import { Review } from './types';

/**
 * Google Authentication Service Interface
 */
export interface IGoogleAuthService {
  /**
   * Initiate OAuth2 authentication flow
   * Opens Google sign-in popup and requests necessary scopes
   * @returns Auth result with tokens and user info
   * @throws AuthError if authentication fails or user denies permissions
   */
  authenticate(): Promise<AuthResult>;

  /**
   * Check if user is currently authenticated
   * @returns True if valid auth token exists
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Get current access token
   * Automatically refreshes if expired
   * @returns Valid access token
   * @throws AuthError if token expired and refresh fails
   */
  getAccessToken(): Promise<string>;

  /**
   * Refresh access token using refresh token
   * @returns New access token and expiry
   * @throws AuthError if refresh token invalid
   */
  refreshAccessToken(): Promise<TokenRefreshResult>;

  /**
   * Revoke authentication and clear tokens
   * @returns True if successfully revoked
   */
  logout(): Promise<boolean>;

  /**
   * Check if specific permission scope is granted
   * @param scope OAuth scope to check
   * @returns True if scope is granted
   */
  hasScope(scope: string): Promise<boolean>;
}

/**
 * Authentication result
 */
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
  scopes: string[];
  userInfo: GoogleUserInfo;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  accessToken: string;
  expiresAt: string; // ISO 8601 timestamp
}

/**
 * Google user information
 */
export interface GoogleUserInfo {
  id: string; // Google account ID
  email: string;
  name: string;
  picture: string; // Profile picture URL
}

/**
 * Google Reviews API Service Interface
 */
export interface IGoogleReviewsService {
  /**
   * Fetch all reviews written by the authenticated user
   * @param options Fetch options (pagination, filtering)
   * @returns Array of reviews
   * @throws ReviewsFetchError if API request fails
   */
  fetchUserReviews(options?: FetchReviewsOptions): Promise<Review[]>;

  /**
   * Fetch a single review by ID
   * @param reviewId Google review ID
   * @returns Review or null if not found
   * @throws ReviewsFetchError if API request fails
   */
  fetchReviewById(reviewId: string): Promise<Review | null>;

  /**
   * Fetch reviews modified after a specific date
   * Used for incremental syncing
   * @param sinceDate ISO 8601 timestamp
   * @returns Array of reviews modified since date
   * @throws ReviewsFetchError if API request fails
   */
  fetchReviewsSince(sinceDate: string): Promise<Review[]>;

  /**
   * Check API rate limit status
   * @returns Rate limit information
   */
  getRateLimitStatus(): Promise<RateLimitStatus>;

  /**
   * Test API connectivity
   * @returns True if API is reachable and authenticated
   */
  testConnection(): Promise<boolean>;
}

/**
 * Fetch reviews options
 */
export interface FetchReviewsOptions {
  pageSize?: number; // Number of reviews per page (default: 50, max: 100)
  pageToken?: string; // Pagination token for next page
  orderBy?: 'date' | 'rating'; // Sort order (default: date descending)
  minRating?: 1 | 2 | 3 | 4 | 5; // Filter by minimum rating
  maxRating?: 1 | 2 | 3 | 4 | 5; // Filter by maximum rating
  includePhotos?: boolean; // Include photo URLs (default: true)
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  limit: number; // Max requests per day
  remaining: number; // Remaining requests today
  resetAt: string; // ISO 8601 timestamp when limit resets
  isThrottled: boolean; // True if currently rate limited
}

/**
 * Content Script Scraping Service Interface
 * Fallback when Google API unavailable
 */
export interface IReviewScrapingService {
  /**
   * Check if scraping is available
   * Verifies user is on Google Maps contrib page
   * @returns True if scraping can proceed
   */
  canScrape(): Promise<boolean>;

  /**
   * Scrape reviews from Google Maps contrib page
   * @returns Array of reviews extracted from DOM
   * @throws ScrapingError if page structure unrecognized
   */
  scrapeReviews(): Promise<Review[]>;

  /**
   * Inject content script into Google Maps page
   * @param tabId Chrome tab ID
   * @returns True if successfully injected
   */
  injectContentScript(tabId: number): Promise<boolean>;

  /**
   * Check if user is on Google Maps contrib page
   * @returns True if on correct page
   */
  isOnContribPage(): Promise<boolean>;
}

/**
 * Sync Service Interface
 * Orchestrates review synchronization
 */
export interface ISyncService {
  /**
   * Perform full sync of reviews
   * Fetches all reviews and updates cache
   * @returns Sync result with stats
   * @throws SyncError if sync fails
   */
  syncReviews(): Promise<SyncResult>;

  /**
   * Perform incremental sync
   * Fetches only reviews modified since last sync
   * @returns Sync result with stats
   * @throws SyncError if sync fails
   */
  incrementalSync(): Promise<SyncResult>;

  /**
   * Check if sync is needed
   * Based on last sync timestamp and sync interval preference
   * @returns True if sync should be triggered
   */
  shouldSync(): Promise<boolean>;

  /**
   * Get last sync timestamp
   * @returns ISO 8601 timestamp or null if never synced
   */
  getLastSyncTime(): Promise<string | null>;

  /**
   * Cancel ongoing sync operation
   */
  cancelSync(): Promise<void>;

  /**
   * Get sync status
   * @returns Current sync state
   */
  getSyncStatus(): Promise<SyncStatus>;
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  timestamp: string; // ISO 8601 timestamp
  reviewsAdded: number;
  reviewsUpdated: number;
  reviewsDeleted: number;
  totalReviews: number;
  duration: number; // Sync duration in milliseconds
  errors?: SyncError[];
}

/**
 * Sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  progress: number; // Percentage (0-100)
  currentOperation: string; // Description of current step
  startedAt: string | null; // ISO 8601 timestamp
  estimatedTimeRemaining: number | null; // Milliseconds
}

/**
 * OAuth Scopes required for Google APIs
 */
export enum GoogleOAuthScope {
  BUSINESS_MANAGE = 'https://www.googleapis.com/auth/business.manage',
  USER_INFO_EMAIL = 'https://www.googleapis.com/auth/userinfo.email',
  USER_INFO_PROFILE = 'https://www.googleapis.com/auth/userinfo.profile',
}

/**
 * Google API Endpoints
 */
export enum GoogleAPIEndpoint {
  MY_BUSINESS_V1 = 'https://mybusiness.googleapis.com/v4',
  OAUTH2_TOKEN = 'https://oauth2.googleapis.com/token',
  OAUTH2_REVOKE = 'https://oauth2.googleapis.com/revoke',
  USER_INFO = 'https://www.googleapis.com/oauth2/v2/userinfo',
}

/**
 * Error Types
 */
export enum GoogleAPIErrorType {
  AUTH_FAILED = 'AUTH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Authentication Error
 */
export class AuthError extends Error {
  constructor(
    public type: GoogleAPIErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Reviews Fetch Error
 */
export class ReviewsFetchError extends Error {
  constructor(
    public type: GoogleAPIErrorType,
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ReviewsFetchError';
  }
}

/**
 * Scraping Error
 */
export class ScrapingError extends Error {
  constructor(
    message: string,
    public reason: 'WRONG_PAGE' | 'PARSE_ERROR' | 'NO_DATA' | 'UNKNOWN',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

/**
 * Sync Error
 */
export class SyncError extends Error {
  constructor(
    public type: GoogleAPIErrorType | 'SYNC_CANCELLED' | 'STORAGE_ERROR',
    message: string,
    public phase: 'FETCH' | 'PROCESS' | 'STORE',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

/**
 * Google API Response Wrapper
 * Generic wrapper for API responses
 */
export interface GoogleAPIResponse<T> {
  data: T;
  nextPageToken?: string;
  totalResults?: number;
}

/**
 * Google API Error Response
 */
export interface GoogleAPIErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: any[];
  };
}
