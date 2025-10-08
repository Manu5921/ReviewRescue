/**
 * AI Insights Service Contract
 *
 * Defines the interface for AI-powered review analysis and insights generation.
 * Supports Claude API (primary) and OpenAI GPT-4 (fallback).
 */

import { Review, Insight, InsightType } from './types';

/**
 * AI Insights Service Interface
 */
export interface IAIInsightsService {
  /**
   * Generate all insights for a set of reviews
   * @param reviews Array of reviews to analyze
   * @param options Generation options
   * @returns Array of generated insights
   * @throws AIServiceError if generation fails
   */
  generateInsights(reviews: Review[], options?: InsightGenerationOptions): Promise<Insight[]>;

  /**
   * Generate a specific type of insight
   * @param reviews Array of reviews to analyze
   * @param insightType Type of insight to generate
   * @returns Generated insight
   * @throws AIServiceError if generation fails
   */
  generateInsightByType(reviews: Review[], insightType: InsightType): Promise<Insight>;

  /**
   * Analyze sentiment for reviews
   * @param reviews Array of reviews to analyze
   * @returns Sentiment analysis insight
   * @throws AIServiceError if analysis fails
   */
  analyzeSentiment(reviews: Review[]): Promise<SentimentInsight>;

  /**
   * Categorize reviews by business type
   * @param reviews Array of reviews to analyze
   * @returns Category breakdown insight
   * @throws AIServiceError if analysis fails
   */
  categorizeReviews(reviews: Review[]): Promise<CategoryInsight>;

  /**
   * Detect patterns in reviewing behavior
   * @param reviews Array of reviews to analyze
   * @returns Pattern detection insight
   * @throws AIServiceError if analysis fails
   */
  detectPatterns(reviews: Review[]): Promise<PatternInsight>;

  /**
   * Generate personalized insights
   * @param reviews Array of reviews to analyze
   * @returns Personalized observations
   * @throws AIServiceError if analysis fails
   */
  generatePersonalizedInsights(reviews: Review[]): Promise<PersonalizedInsight>;

  /**
   * Test AI service connection
   * @returns True if service is reachable
   */
  testConnection(): Promise<boolean>;

  /**
   * Get estimated cost for insight generation
   * @param reviewCount Number of reviews to analyze
   * @returns Estimated cost in USD
   */
  estimateCost(reviewCount: number): Promise<number>;

  /**
   * Get current AI provider
   * @returns Provider name (claude or openai)
   */
  getProvider(): AIProvider;

  /**
   * Switch AI provider
   * @param provider Provider to switch to
   * @returns True if successfully switched
   */
  switchProvider(provider: AIProvider): Promise<boolean>;
}

/**
 * Insight generation options
 */
export interface InsightGenerationOptions {
  maxInsights?: number; // Max number of insights to generate (default: 10)
  insightTypes?: InsightType[]; // Specific types to generate (default: all)
  minReviews?: number; // Minimum reviews required (default: 5)
  timeRange?: TimeRange; // Filter reviews by date range
  useCache?: boolean; // Use cached insights if available (default: true)
  cacheHours?: number; // Hours to cache results (default: 24)
}

/**
 * Time range filter
 */
export interface TimeRange {
  startDate: string; // ISO 8601 timestamp
  endDate: string; // ISO 8601 timestamp
}

/**
 * Sentiment Insight (specific structure)
 */
export interface SentimentInsight extends Insight {
  insight_type: 'sentiment';
  metadata: {
    overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    sentiment_score: number; // -1.0 (negative) to 1.0 (positive)
    monthly_trend?: {
      month: string; // YYYY-MM
      sentiment: 'positive' | 'negative' | 'neutral';
      score: number;
      review_count: number;
    }[];
    notable_shifts?: {
      date: string; // ISO 8601
      description: string;
      significance: 'high' | 'medium' | 'low';
    }[];
  };
}

/**
 * Category Insight (specific structure)
 */
export interface CategoryInsight extends Insight {
  insight_type: 'category';
  metadata: {
    top_categories: {
      category: string;
      count: number;
      percentage: number;
      avg_rating: number;
    }[];
    category_preferences: {
      category: string;
      preference: 'high' | 'medium' | 'low';
      explanation: string;
    }[];
    diversity_score: number; // 0-100, how varied the categories are
  };
}

/**
 * Pattern Insight (specific structure)
 */
export interface PatternInsight extends Insight {
  insight_type: 'pattern';
  metadata: {
    rating_distribution: {
      rating: 1 | 2 | 3 | 4 | 5;
      count: number;
      percentage: number;
    }[];
    avg_rating: number;
    rating_variance: number;
    review_frequency: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'sporadic';
      avg_days_between_reviews: number;
      most_active_period: string; // e.g., "Summer 2024"
    };
    review_length_stats: {
      avg_length: number; // Average word count
      shortest: number;
      longest: number;
      typical_length: 'short' | 'medium' | 'long';
    };
    patterns: {
      pattern: string; // Description of detected pattern
      confidence: number; // 0.0 - 1.0
      examples: string[]; // Review IDs demonstrating pattern
    }[];
  };
}

/**
 * Personalized Insight (specific structure)
 */
export interface PersonalizedInsight extends Insight {
  insight_type: 'personalized';
  metadata: {
    observations: {
      observation: string; // e.g., "You tend to rate coffee shops 20% higher"
      category: string; // e.g., "Preference"
      confidence: number; // 0.0 - 1.0
      supporting_data: {
        metric: string;
        value: number | string;
      }[];
    }[];
    recommendations: {
      recommendation: string;
      reason: string;
    }[];
    personality_traits: {
      trait: string; // e.g., "Critical", "Enthusiastic", "Detailed"
      score: number; // 0.0 - 1.0
      explanation: string;
    }[];
  };
}

/**
 * AI Provider enum
 */
export enum AIProvider {
  CLAUDE = 'claude',
  OPENAI = 'openai',
}

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string; // e.g., "claude-3-5-sonnet-20241022" or "gpt-4-turbo"
  apiKey: string;
  maxTokens: number;
  temperature: number; // 0.0 - 1.0
  timeout: number; // Request timeout in milliseconds
}

/**
 * Prompt Template Service Interface
 */
export interface IPromptTemplateService {
  /**
   * Get prompt for sentiment analysis
   * @param reviews Array of reviews
   * @returns Formatted prompt
   */
  getSentimentPrompt(reviews: Review[]): string;

  /**
   * Get prompt for category analysis
   * @param reviews Array of reviews
   * @returns Formatted prompt
   */
  getCategoryPrompt(reviews: Review[]): string;

  /**
   * Get prompt for pattern detection
   * @param reviews Array of reviews
   * @returns Formatted prompt
   */
  getPatternPrompt(reviews: Review[]): string;

  /**
   * Get prompt for personalized insights
   * @param reviews Array of reviews
   * @returns Formatted prompt
   */
  getPersonalizedPrompt(reviews: Review[]): string;

  /**
   * Format reviews for AI consumption
   * @param reviews Array of reviews
   * @param maxTokens Max tokens to include (for truncation)
   * @returns Formatted review text
   */
  formatReviews(reviews: Review[], maxTokens: number): string;
}

/**
 * AI Response Parser Interface
 */
export interface IAIResponseParser {
  /**
   * Parse AI response into structured insights
   * @param response Raw AI response text
   * @param insightType Type of insight to parse
   * @returns Parsed insight object
   * @throws ParseError if response format invalid
   */
  parseInsight(response: string, insightType: InsightType): Insight;

  /**
   * Validate parsed insight structure
   * @param insight Insight to validate
   * @returns True if valid, throws ValidationError if invalid
   */
  validateInsight(insight: Insight): boolean;

  /**
   * Extract confidence score from AI response
   * @param response Raw AI response text
   * @returns Confidence score (0.0 - 1.0) or null if not found
   */
  extractConfidence(response: string): number | null;
}

/**
 * Cost Estimator Service Interface
 */
export interface ICostEstimatorService {
  /**
   * Estimate cost for Claude API call
   * @param tokenCount Estimated input + output tokens
   * @returns Cost in USD
   */
  estimateClaudeCost(tokenCount: number): number;

  /**
   * Estimate cost for OpenAI API call
   * @param tokenCount Estimated input + output tokens
   * @returns Cost in USD
   */
  estimateOpenAICost(tokenCount: number): number;

  /**
   * Estimate tokens for review dataset
   * @param reviews Array of reviews
   * @returns Estimated token count
   */
  estimateTokens(reviews: Review[]): number;

  /**
   * Get current pricing for AI providers
   * @returns Pricing per million tokens
   */
  getPricing(): {
    claude: { input: number; output: number };
    openai: { input: number; output: number };
  };
}

/**
 * AI Service Error Types
 */
export enum AIServiceErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_REVIEWS = 'INSUFFICIENT_REVIEWS',
  CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * AI Service Error
 */
export class AIServiceError extends Error {
  constructor(
    public type: AIServiceErrorType,
    message: string,
    public provider?: AIProvider,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Parse Error
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public rawResponse: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public insight: any,
    public violations: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * AI API Response
 */
export interface AIAPIResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

/**
 * Claude API specific types
 */
export namespace ClaudeAPI {
  export interface Request {
    model: string;
    max_tokens: number;
    messages: Message[];
    temperature?: number;
    system?: string;
  }

  export interface Message {
    role: 'user' | 'assistant';
    content: string;
  }

  export interface Response {
    id: string;
    type: 'message';
    role: 'assistant';
    content: ContentBlock[];
    model: string;
    stop_reason: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }

  export interface ContentBlock {
    type: 'text';
    text: string;
  }
}

/**
 * OpenAI API specific types
 */
export namespace OpenAIAPI {
  export interface Request {
    model: string;
    messages: Message[];
    max_tokens?: number;
    temperature?: number;
  }

  export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface Response {
    id: string;
    object: 'chat.completion';
    created: number;
    model: string;
    choices: Choice[];
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  export interface Choice {
    index: number;
    message: Message;
    finish_reason: string;
  }
}
