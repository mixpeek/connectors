/**
 * Mixpeek OpenRTB Connector - Configuration Constants
 *
 * Centralized configuration for the OpenRTB contextual enrichment connector.
 */

// API Configuration
export const API_ENDPOINT = 'https://api.mixpeek.com';
export const API_VERSION = 'v1';
export const DEFAULT_TIMEOUT = 200; // milliseconds - strict for RTB latency requirements
export const MAX_TIMEOUT = 500; // milliseconds - absolute maximum
export const RETRY_ATTEMPTS = 1; // Single retry for RTB speed requirements
export const RETRY_DELAY = 50; // milliseconds

// Cache Configuration
export const DEFAULT_CACHE_TTL = 300; // seconds (5 minutes)
export const MAX_CACHE_ITEMS = 1000;
export const CACHE_KEY_PREFIX = 'mixpeek_ortb_';

// Content Extraction Limits
export const MAX_TEXT_LENGTH = 50000; // 50KB text limit
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_KEYWORDS = 50;
export const MAX_IMAGES = 10;
export const MAX_VIDEOS = 5;

// Content Modes
export const CONTENT_MODES = {
  PAGE: 'page',
  VIDEO: 'video',
  IMAGE: 'image',
  AUTO: 'auto'
};

// OpenRTB Versions Supported
export const OPENRTB_VERSIONS = {
  '2.5': '2.5',
  '2.6': '2.6',
  '3.0': '3.0'
};

export const DEFAULT_OPENRTB_VERSION = '2.6';

// IAB Content Taxonomy Versions
export const IAB_TAXONOMY_VERSIONS = {
  '1.0': '1.0',
  '2.0': '2.0',
  '3.0': '3.0'
};

export const DEFAULT_IAB_VERSION = '3.0';

// Targeting Key Prefixes
export const TARGETING_PREFIX = 'mixpeek_';
export const TARGETING_KEYS = {
  CATEGORY: `${TARGETING_PREFIX}cat`,
  SUBCATEGORY: `${TARGETING_PREFIX}subcat`,
  KEYWORDS: `${TARGETING_PREFIX}kw`,
  SENTIMENT: `${TARGETING_PREFIX}sentiment`,
  BRAND_SAFETY: `${TARGETING_PREFIX}brand_safe`,
  CONTENT_TYPE: `${TARGETING_PREFIX}content_type`,
  LANGUAGE: `${TARGETING_PREFIX}lang`,
  EMBEDDING_ID: `${TARGETING_PREFIX}emb_id`
};

// Brand Safety Levels
export const BRAND_SAFETY_LEVELS = {
  SAFE: 'safe',
  LOW_RISK: 'low_risk',
  MEDIUM_RISK: 'medium_risk',
  HIGH_RISK: 'high_risk',
  BLOCKED: 'blocked'
};

// Sentiment Values
export const SENTIMENT_VALUES = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative'
};

// Content Types
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  GALLERY: 'gallery',
  PRODUCT: 'product',
  HOMEPAGE: 'homepage',
  CATEGORY: 'category',
  SEARCH: 'search',
  OTHER: 'other'
};

// Error Codes
export const ERROR_CODES = {
  API_ERROR: 'MIXPEEK_API_ERROR',
  TIMEOUT: 'MIXPEEK_TIMEOUT',
  INVALID_CONFIG: 'MIXPEEK_INVALID_CONFIG',
  INVALID_REQUEST: 'MIXPEEK_INVALID_REQUEST',
  RATE_LIMITED: 'MIXPEEK_RATE_LIMITED',
  CACHE_ERROR: 'MIXPEEK_CACHE_ERROR',
  EXTRACTION_ERROR: 'MIXPEEK_EXTRACTION_ERROR',
  HEALTH_CHECK_FAILED: 'MIXPEEK_HEALTH_CHECK_FAILED'
};

// Performance Thresholds
export const PERFORMANCE = {
  TARGET_LATENCY_MS: 50, // Target processing time
  WARN_LATENCY_MS: 100, // Warning threshold
  MAX_LATENCY_MS: 200 // Maximum acceptable latency
};

// Feature Flags
export const FEATURES = {
  ENABLE_CACHING: true,
  ENABLE_FALLBACK: true,
  ENABLE_METRICS: true,
  ENABLE_HEALTH_CHECK: true
};

// HTTP Headers
export const HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  USER_AGENT: 'Mixpeek-OpenRTB-Connector/1.0.0'
};

// Default Configuration
export const DEFAULT_CONFIG = {
  endpoint: API_ENDPOINT,
  timeout: DEFAULT_TIMEOUT,
  cacheTTL: DEFAULT_CACHE_TTL,
  enableCache: true,
  enableFallback: true,
  enableMetrics: true,
  openrtbVersion: DEFAULT_OPENRTB_VERSION,
  iabVersion: DEFAULT_IAB_VERSION,
  mode: CONTENT_MODES.AUTO,
  debug: false
};

export default {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  MAX_TIMEOUT,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  DEFAULT_CACHE_TTL,
  MAX_CACHE_ITEMS,
  CACHE_KEY_PREFIX,
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS,
  MAX_IMAGES,
  MAX_VIDEOS,
  CONTENT_MODES,
  OPENRTB_VERSIONS,
  DEFAULT_OPENRTB_VERSION,
  IAB_TAXONOMY_VERSIONS,
  DEFAULT_IAB_VERSION,
  TARGETING_PREFIX,
  TARGETING_KEYS,
  BRAND_SAFETY_LEVELS,
  SENTIMENT_VALUES,
  CONTENT_TYPES,
  ERROR_CODES,
  PERFORMANCE,
  FEATURES,
  HEADERS,
  DEFAULT_CONFIG
};
