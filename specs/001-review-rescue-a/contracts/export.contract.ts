/**
 * Export Service Contract
 *
 * Defines the interface for exporting reviews to various formats (CSV, JSON, PDF).
 * Handles file generation, formatting, and download via Chrome Downloads API.
 */

import { Review, ExportJob, ExportFormat } from './types';

/**
 * Export Service Interface
 */
export interface IExportService {
  /**
   * Export reviews to specified format
   * @param reviews Array of reviews to export
   * @param format Export format (csv, json, pdf)
   * @param options Export options
   * @returns Export job with file info
   * @throws ExportError if export fails
   */
  exportReviews(
    reviews: Review[],
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<ExportJob>;

  /**
   * Export reviews to CSV format
   * @param reviews Array of reviews
   * @param options CSV-specific options
   * @returns CSV file as Blob
   * @throws ExportError if generation fails
   */
  exportToCSV(reviews: Review[], options?: CSVExportOptions): Promise<Blob>;

  /**
   * Export reviews to JSON format
   * @param reviews Array of reviews
   * @param options JSON-specific options
   * @returns JSON file as Blob
   * @throws ExportError if generation fails
   */
  exportToJSON(reviews: Review[], options?: JSONExportOptions): Promise<Blob>;

  /**
   * Export reviews to PDF format
   * @param reviews Array of reviews
   * @param options PDF-specific options
   * @returns PDF file as Blob
   * @throws ExportError if generation fails
   */
  exportToPDF(reviews: Review[], options?: PDFExportOptions): Promise<Blob>;

  /**
   * Download exported file
   * @param blob File blob
   * @param filename Desired filename
   * @returns Chrome download ID
   * @throws ExportError if download fails
   */
  downloadFile(blob: Blob, filename: string): Promise<number>;

  /**
   * Generate filename for export
   * @param format Export format
   * @param options Filename options
   * @returns Generated filename
   */
  generateFilename(format: ExportFormat, options?: FilenameOptions): string;

  /**
   * Validate reviews before export
   * @param reviews Array of reviews
   * @returns True if valid, throws ValidationError if invalid
   */
  validateReviews(reviews: Review[]): boolean;

  /**
   * Get estimated file size
   * @param reviews Array of reviews
   * @param format Export format
   * @returns Estimated size in bytes
   */
  estimateFileSize(reviews: Review[], format: ExportFormat): number;
}

/**
 * Export options (common)
 */
export interface ExportOptions {
  filename?: string; // Custom filename (without extension)
  includePhotos?: boolean; // Include photo URLs (default: false)
  includeMetadata?: boolean; // Include export metadata (date, count) (default: true)
}

/**
 * CSV export options
 */
export interface CSVExportOptions extends ExportOptions {
  delimiter?: ',' | ';' | '\t'; // Column delimiter (default: ',')
  includeHeaders?: boolean; // Include column headers (default: true)
  columns?: CSVColumn[]; // Columns to include (default: all)
  dateFormat?: 'iso' | 'short' | 'long'; // Date formatting (default: 'iso')
  quoteAll?: boolean; // Quote all fields (default: false, only when necessary)
}

/**
 * CSV column definition
 */
export enum CSVColumn {
  BUSINESS_NAME = 'business_name',
  BUSINESS_CATEGORY = 'business_category',
  BUSINESS_LOCATION = 'business_location',
  RATING = 'rating',
  REVIEW_TEXT = 'review_text',
  DATE_WRITTEN = 'date_written',
  DATE_MODIFIED = 'date_modified',
  GOOGLE_MAPS_URL = 'google_maps_url',
  PHOTO_URLS = 'photo_urls',
}

/**
 * JSON export options
 */
export interface JSONExportOptions extends ExportOptions {
  pretty?: boolean; // Pretty-print with indentation (default: true)
  indent?: number; // Indentation spaces (default: 2)
  includeSchema?: boolean; // Include JSON schema (default: false)
}

/**
 * PDF export options
 */
export interface PDFExportOptions extends ExportOptions {
  pageSize?: 'A4' | 'Letter'; // Page size (default: 'A4')
  orientation?: 'portrait' | 'landscape'; // Page orientation (default: 'portrait')
  fontSize?: number; // Base font size (default: 10)
  includeHeader?: boolean; // Include document header (default: true)
  includeFooter?: boolean; // Include page numbers (default: true)
  maxReviewsPerPage?: number; // Reviews per page (default: 5)
  colorScheme?: 'color' | 'grayscale'; // Color scheme (default: 'color')
  includePhotos?: boolean; // Embed photos (default: false, large file size)
}

/**
 * Filename options
 */
export interface FilenameOptions {
  prefix?: string; // Filename prefix (default: 'google-reviews-export')
  includeDate?: boolean; // Include current date (default: true)
  dateFormat?: 'YYYY-MM-DD' | 'YYYYMMDD' | 'YYYY-MM-DD-HHmmss'; // Date format (default: 'YYYY-MM-DD')
  suffix?: string; // Custom suffix
}

/**
 * CSV Generator Service Interface
 */
export interface ICSVGeneratorService {
  /**
   * Generate CSV content from reviews
   * @param reviews Array of reviews
   * @param options CSV options
   * @returns CSV string
   */
  generate(reviews: Review[], options?: CSVExportOptions): string;

  /**
   * Format a single review as CSV row
   * @param review Review to format
   * @param columns Columns to include
   * @returns CSV row string
   */
  formatRow(review: Review, columns: CSVColumn[]): string;

  /**
   * Generate CSV headers
   * @param columns Columns to include
   * @returns CSV header row
   */
  generateHeaders(columns: CSVColumn[]): string;

  /**
   * Escape CSV field value
   * @param value Field value
   * @returns Escaped value
   */
  escapeField(value: string): string;
}

/**
 * JSON Generator Service Interface
 */
export interface IJSONGeneratorService {
  /**
   * Generate JSON content from reviews
   * @param reviews Array of reviews
   * @param options JSON options
   * @returns JSON string
   */
  generate(reviews: Review[], options?: JSONExportOptions): string;

  /**
   * Generate JSON with metadata wrapper
   * @param reviews Array of reviews
   * @param options JSON options
   * @returns JSON string with metadata
   */
  generateWithMetadata(reviews: Review[], options?: JSONExportOptions): string;

  /**
   * Generate JSON schema for Review type
   * @returns JSON schema object
   */
  generateSchema(): object;
}

/**
 * PDF Generator Service Interface
 */
export interface IPDFGeneratorService {
  /**
   * Generate PDF document from reviews
   * @param reviews Array of reviews
   * @param options PDF options
   * @returns PDF as Blob
   */
  generate(reviews: Review[], options?: PDFExportOptions): Promise<Blob>;

  /**
   * Add document header
   * @param doc PDF document instance
   * @param options PDF options
   */
  addHeader(doc: any, options?: PDFExportOptions): void;

  /**
   * Add document footer with page numbers
   * @param doc PDF document instance
   * @param pageNumber Current page number
   * @param totalPages Total pages
   */
  addFooter(doc: any, pageNumber: number, totalPages: number): void;

  /**
   * Format review as PDF section
   * @param doc PDF document instance
   * @param review Review to format
   * @param options PDF options
   */
  addReview(doc: any, review: Review, options?: PDFExportOptions): void;

  /**
   * Add table of contents
   * @param doc PDF document instance
   * @param reviews Array of reviews
   */
  addTableOfContents(doc: any, reviews: Review[]): void;
}

/**
 * Download Manager Service Interface
 */
export interface IDownloadManagerService {
  /**
   * Download file using Chrome Downloads API
   * @param blob File blob
   * @param filename Filename
   * @param options Download options
   * @returns Chrome download ID
   * @throws DownloadError if download fails
   */
  download(blob: Blob, filename: string, options?: DownloadOptions): Promise<number>;

  /**
   * Get download status
   * @param downloadId Chrome download ID
   * @returns Download state
   */
  getDownloadStatus(downloadId: number): Promise<DownloadStatus>;

  /**
   * Cancel download
   * @param downloadId Chrome download ID
   * @returns True if successfully cancelled
   */
  cancelDownload(downloadId: number): Promise<boolean>;

  /**
   * Show download in folder
   * @param downloadId Chrome download ID
   */
  showDownload(downloadId: number): Promise<void>;

  /**
   * Listen for download completion
   * @param downloadId Chrome download ID
   * @param callback Completion callback
   */
  onDownloadComplete(downloadId: number, callback: (success: boolean) => void): void;
}

/**
 * Download options
 */
export interface DownloadOptions {
  saveAs?: boolean; // Prompt user for save location (default: false)
  conflictAction?: 'uniquify' | 'overwrite' | 'prompt'; // Conflict resolution (default: 'uniquify')
  directory?: string; // Save to specific directory
}

/**
 * Download status
 */
export interface DownloadStatus {
  downloadId: number;
  state: 'in_progress' | 'complete' | 'interrupted';
  bytesReceived: number;
  totalBytes: number;
  filename: string;
  error?: string;
}

/**
 * Export Validator Service Interface
 */
export interface IExportValidatorService {
  /**
   * Validate reviews before export
   * @param reviews Array of reviews
   * @returns Validation result
   */
  validate(reviews: Review[]): ValidationResult;

  /**
   * Check if reviews array is empty
   * @param reviews Array of reviews
   * @returns True if empty
   */
  isEmpty(reviews: Review[]): boolean;

  /**
   * Check if reviews contain required fields
   * @param reviews Array of reviews
   * @returns Missing fields per review
   */
  checkRequiredFields(reviews: Review[]): Map<string, string[]>;

  /**
   * Sanitize reviews for export
   * @param reviews Array of reviews
   * @returns Sanitized reviews
   */
  sanitize(reviews: Review[]): Review[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: ValidationWarning[];
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  reviewId: string;
  field: string;
  message: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  type: 'MISSING_FIELD' | 'TRUNCATED_TEXT' | 'LARGE_FILE';
  message: string;
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  exportDate: string; // ISO 8601 timestamp
  reviewCount: number;
  format: ExportFormat;
  generatedBy: string; // e.g., "Review Rescue v1.0.0"
  filters?: {
    dateRange?: TimeRange;
    minRating?: number;
    maxRating?: number;
  };
}

/**
 * Time range
 */
export interface TimeRange {
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}

/**
 * Export Error Types
 */
export enum ExportErrorType {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  EMPTY_DATASET = 'EMPTY_DATASET',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Export Error
 */
export class ExportError extends Error {
  constructor(
    public type: ExportErrorType,
    message: string,
    public format?: ExportFormat,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Download Error
 */
export class DownloadError extends Error {
  constructor(
    message: string,
    public downloadId?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}

/**
 * File size limits (in bytes)
 */
export enum FileSizeLimit {
  CSV_MAX = 10 * 1024 * 1024, // 10 MB
  JSON_MAX = 10 * 1024 * 1024, // 10 MB
  PDF_MAX = 50 * 1024 * 1024, // 50 MB (images can be large)
}

/**
 * Export format MIME types
 */
export enum ExportMIMEType {
  CSV = 'text/csv',
  JSON = 'application/json',
  PDF = 'application/pdf',
}

/**
 * Export Statistics
 */
export interface ExportStatistics {
  totalExports: number;
  exportsByFormat: {
    csv: number;
    json: number;
    pdf: number;
  };
  totalReviewsExported: number;
  avgFileSize: number;
  lastExportDate: string; // ISO 8601
}
