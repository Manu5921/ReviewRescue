import type {
  Review,
  UserSession,
  UserPreferences,
  StorageStats,
  StorageError,
  Insight,
  ExportJob,
} from '../lib/types';

// Storage Service Interface
export interface IStorageService {
  setLocal<T>(key: string, value: T): Promise<void>;
  getLocal<T>(key: string): Promise<T | null>;
  setSync<T>(key: string, value: T): Promise<void>;
  getSync<T>(key: string): Promise<T | null>;
  removeLocal(key: string): Promise<void>;
  removeSync(key: string): Promise<void>;
  clearLocal(): Promise<void>;
  clearSync(): Promise<void>;
  getStorageStats(): Promise<StorageStats>;
}

// Chrome Storage Service Implementation
export class ChromeStorageService implements IStorageService {
  async setLocal<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async getLocal<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? null;
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async setSync<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async getSync<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] ?? null;
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async removeLocal(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async removeSync(key: string): Promise<void> {
    try {
      await chrome.storage.sync.remove(key);
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async clearLocal(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async clearSync(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async getStorageStats(): Promise<StorageStats> {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const QUOTA_BYTES = 10 * 1024 * 1024; // 10MB for local storage
      const percentageUsed = (bytesInUse / QUOTA_BYTES) * 100;

      // Get review count
      const reviews = await this.getLocal<Review[]>('reviews');
      const reviewCount = reviews?.length ?? 0;

      // Estimate avg review size and remaining capacity
      const avgReviewBytes = reviewCount > 0 ? bytesInUse / reviewCount : 1000;
      const estimatedReviewsRemaining = Math.floor(
        (QUOTA_BYTES - bytesInUse) / avgReviewBytes
      );

      return {
        bytes_in_use: bytesInUse,
        quota_bytes: QUOTA_BYTES,
        percentage_used: percentageUsed,
        review_count: reviewCount,
        estimated_reviews_remaining: Math.max(0, estimatedReviewsRemaining),
      };
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  private handleStorageError(error: any): StorageError {
    const StorageErrorClass = (await import('../lib/types')).StorageError;

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return new StorageErrorClass('Storage quota exceeded', 'QUOTA_EXCEEDED');
    }
    if (error.message?.includes('permission')) {
      return new StorageErrorClass('Storage permission denied', 'PERMISSION_DENIED');
    }
    if (error.message?.includes('serializ')) {
      return new StorageErrorClass('Data serialization failed', 'SERIALIZATION_ERROR');
    }
    return new StorageErrorClass(error.message || 'Unknown storage error', 'UNKNOWN');
  }
}

// Review Cache Service
export class ReviewCacheService {
  private static readonly REVIEWS_KEY = 'reviews';
  private static readonly INDEX_KEY = 'reviews_index';

  constructor(private storage: IStorageService) {}

  async cacheReviews(reviews: Review[]): Promise<void> {
    await this.storage.setLocal(ReviewCacheService.REVIEWS_KEY, reviews);
    await this.updateIndex(reviews);
  }

  async getCachedReviews(): Promise<Review[]> {
    const reviews = await this.storage.getLocal<Review[]>(ReviewCacheService.REVIEWS_KEY);
    return reviews ?? [];
  }

  async addReview(review: Review): Promise<void> {
    const reviews = await this.getCachedReviews();
    // Check for duplicates
    const exists = reviews.some((r) => r.google_review_id === review.google_review_id);
    if (!exists) {
      reviews.push(review);
      await this.cacheReviews(reviews);
    }
  }

  async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
    const reviews = await this.getCachedReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...updates };
      await this.cacheReviews(reviews);
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviews = await this.getCachedReviews();
    const filtered = reviews.filter((r) => r.id !== reviewId);
    await this.cacheReviews(filtered);
  }

  private async updateIndex(reviews: Review[]): Promise<void> {
    const index = {
      by_google_id: Object.fromEntries(
        reviews.map((r) => [r.google_review_id, r.id])
      ),
      by_business: reviews.reduce((acc, r) => {
        if (!acc[r.business_name]) {
          acc[r.business_name] = [];
        }
        acc[r.business_name].push(r.id);
        return acc;
      }, {} as Record<string, string[]>),
      total_count: reviews.length,
      last_updated: new Date().toISOString(),
    };
    await this.storage.setLocal(ReviewCacheService.INDEX_KEY, index);
  }
}

// Session Service
export class SessionService {
  private static readonly SESSION_KEY = 'user_session';

  constructor(private storage: IStorageService) {}

  async setSession(session: UserSession): Promise<void> {
    await this.storage.setLocal(SessionService.SESSION_KEY, session);
  }

  async getSession(): Promise<UserSession | null> {
    return await this.storage.getLocal<UserSession>(SessionService.SESSION_KEY);
  }

  async updateSession(updates: Partial<UserSession>): Promise<void> {
    const session = await this.getSession();
    if (session) {
      const updated = { ...session, ...updates };
      await this.setSession(updated);
    }
  }

  async clearSession(): Promise<void> {
    await this.storage.removeLocal(SessionService.SESSION_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    if (!session || !session.is_authenticated) {
      return false;
    }

    // Check token expiration
    if (session.token_expires_at) {
      const expiresAt = new Date(session.token_expires_at);
      if (expiresAt <= new Date()) {
        return false;
      }
    }

    return true;
  }
}

// Preferences Service
export class PreferencesService {
  private static readonly PREFERENCES_KEY = 'user_preferences';

  private static readonly DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'auto',
    default_export_format: 'json',
    auto_sync_enabled: true,
    sync_interval_hours: 4,
    show_photos: true,
    default_view: 'list',
    results_per_page: 50,
    insights_cache_hours: 24,
    ai_provider: 'claude',
  };

  constructor(private storage: IStorageService) {}

  async setPreferences(preferences: UserPreferences): Promise<void> {
    await this.storage.setSync(PreferencesService.PREFERENCES_KEY, preferences);
  }

  async getPreferences(): Promise<UserPreferences> {
    const preferences = await this.storage.getSync<UserPreferences>(
      PreferencesService.PREFERENCES_KEY
    );
    return {
      ...PreferencesService.DEFAULT_PREFERENCES,
      ...preferences,
    };
  }

  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { ...current, ...updates };
    await this.setPreferences(updated);
  }
}

// Insights Cache Service
export class InsightsCacheService {
  private static readonly INSIGHTS_KEY = 'insights_cache';

  constructor(private storage: IStorageService) {}

  async cacheInsights(insights: Insight[]): Promise<void> {
    const cache = {
      insights,
      cached_at: new Date().toISOString(),
    };
    await this.storage.setLocal(InsightsCacheService.INSIGHTS_KEY, cache);
  }

  async getCachedInsights(): Promise<Insight[] | null> {
    const cache = await this.storage.getLocal<{
      insights: Insight[];
      cached_at: string;
    }>(InsightsCacheService.INSIGHTS_KEY);
    return cache?.insights ?? null;
  }

  async isCacheValid(cacheHours: number): Promise<boolean> {
    const cache = await this.storage.getLocal<{
      insights: Insight[];
      cached_at: string;
    }>(InsightsCacheService.INSIGHTS_KEY);

    if (!cache) {
      return false;
    }

    const cachedAt = new Date(cache.cached_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);

    return hoursDiff < cacheHours;
  }

  async invalidateCache(): Promise<void> {
    await this.storage.removeLocal(InsightsCacheService.INSIGHTS_KEY);
  }
}

// Export History Service
export class ExportHistoryService {
  private static readonly EXPORT_HISTORY_KEY = 'export_history';
  private static readonly MAX_HISTORY_SIZE = 50;

  constructor(private storage: IStorageService) {}

  async addExportJob(job: ExportJob): Promise<void> {
    const history = await this.getExportHistory();
    history.unshift(job); // Add to beginning

    // Limit to last 50 exports
    if (history.length > ExportHistoryService.MAX_HISTORY_SIZE) {
      history.splice(ExportHistoryService.MAX_HISTORY_SIZE);
    }

    await this.storage.setLocal(ExportHistoryService.EXPORT_HISTORY_KEY, history);
  }

  async getExportHistory(): Promise<ExportJob[]> {
    const history = await this.storage.getLocal<ExportJob[]>(
      ExportHistoryService.EXPORT_HISTORY_KEY
    );
    return history ?? [];
  }

  async updateExportJob(jobId: string, updates: Partial<ExportJob>): Promise<void> {
    const history = await this.getExportHistory();
    const index = history.findIndex((job) => job.id === jobId);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      await this.storage.setLocal(ExportHistoryService.EXPORT_HISTORY_KEY, history);
    }
  }
}

// Export singleton instances
export const storageService = new ChromeStorageService();
export const reviewCacheService = new ReviewCacheService(storageService);
export const sessionService = new SessionService(storageService);
export const preferencesService = new PreferencesService(storageService);
export const insightsCacheService = new InsightsCacheService(storageService);
export const exportHistoryService = new ExportHistoryService(storageService);
