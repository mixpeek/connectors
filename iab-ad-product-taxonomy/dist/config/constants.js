/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Configuration Constants
 *
 * Centralized configuration for the IAB Ad Product Taxonomy mapping connector.
 */

// API Configuration
export const API_ENDPOINT = 'https://api.mixpeek.com';
export const API_VERSION = 'v1';
export const DEFAULT_TIMEOUT = 5000; // milliseconds - more relaxed for non-RTB use cases
export const MAX_TIMEOUT = 30000; // milliseconds
export const RETRY_ATTEMPTS = 2;
export const RETRY_DELAY = 100; // milliseconds

// Cache Configuration
export const DEFAULT_CACHE_TTL = 3600; // seconds (1 hour)
export const MAX_CACHE_ITEMS = 10000;
export const CACHE_KEY_PREFIX = 'mixpeek_iab_ap_';

// Content Limits
export const MAX_TITLE_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_KEYWORDS = 100;

// IAB Ad Product Taxonomy Versions
export const IAB_AD_PRODUCT_VERSIONS = {
  '1.0': '1.0',
  '1.1': '1.1',
  '2.0': '2.0'
};

export const DEFAULT_IAB_VERSION = '2.0';

// Mapping Modes
export const MAPPING_MODES = {
  DETERMINISTIC: 'deterministic', // Keyword-based only
  SEMANTIC: 'semantic',           // AI-powered semantic matching
  HYBRID: 'hybrid'                // Deterministic first, semantic fallback
};

export const DEFAULT_MAPPING_MODE = MAPPING_MODES.HYBRID;

// Confidence Thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
  MINIMUM: 0.3
};

// Error Codes
export const ERROR_CODES = {
  API_ERROR: 'MIXPEEK_API_ERROR',
  TIMEOUT: 'MIXPEEK_TIMEOUT',
  INVALID_CONFIG: 'MIXPEEK_INVALID_CONFIG',
  INVALID_INPUT: 'MIXPEEK_INVALID_INPUT',
  RATE_LIMITED: 'MIXPEEK_RATE_LIMITED',
  CACHE_ERROR: 'MIXPEEK_CACHE_ERROR',
  MAPPING_ERROR: 'MIXPEEK_MAPPING_ERROR',
  NO_MATCH: 'MIXPEEK_NO_MATCH'
};

// HTTP Headers
export const HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  USER_AGENT: 'Mixpeek-IAB-AdProduct-Connector/1.0.0'
};

// Feature Flags
export const FEATURES = {
  ENABLE_CACHING: true,
  ENABLE_SEMANTIC: true,
  ENABLE_FALLBACK: true,
  ENABLE_METRICS: true
};

// Default Configuration
export const DEFAULT_CONFIG = {
  endpoint: API_ENDPOINT,
  timeout: DEFAULT_TIMEOUT,
  cacheTTL: DEFAULT_CACHE_TTL,
  enableCache: true,
  enableSemantic: true,
  mappingMode: DEFAULT_MAPPING_MODE,
  iabVersion: DEFAULT_IAB_VERSION,
  minConfidence: CONFIDENCE_THRESHOLDS.MINIMUM,
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
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS,
  IAB_AD_PRODUCT_VERSIONS,
  DEFAULT_IAB_VERSION,
  MAPPING_MODES,
  DEFAULT_MAPPING_MODE,
  CONFIDENCE_THRESHOLDS,
  ERROR_CODES,
  HEADERS,
  FEATURES,
  DEFAULT_CONFIG
};
