/**
 * Mixpeek Context Adapter - Constants
 * @module config/constants
 */

export const MIXPEEK_MODULE_NAME = 'mixpeek'
export const MIXPEEK_VERSION = '1.0.0'

// API Configuration
// Use MIXPEEK_API_ENDPOINT environment variable or default to production
export const DEFAULT_API_ENDPOINT = typeof process !== 'undefined' && process.env && process.env.MIXPEEK_API_ENDPOINT
  ? process.env.MIXPEEK_API_ENDPOINT
  : (typeof window !== 'undefined' && window.MIXPEEK_API_ENDPOINT
    ? window.MIXPEEK_API_ENDPOINT
    : 'https://api.mixpeek.com')

// Alternative endpoints
export const API_ENDPOINTS = {
  PRODUCTION: 'https://api.mixpeek.com',
  DEVELOPMENT: 'https://api.mixpeek.com',
  LOCAL: 'http://localhost:8000'
}

export const DEFAULT_TIMEOUT = 250 // milliseconds
export const DEFAULT_CACHE_TTL = 300 // seconds
export const DEFAULT_RETRY_ATTEMPTS = 2
export const DEFAULT_BATCH_SIZE = 1

// API Endpoints
export const ENDPOINTS = {
  COLLECTIONS: '/v1/collections',
  DOCUMENTS: '/v1/collections/{collectionId}/documents',
  FEATURES: '/v1/collections/{collectionId}/documents/{documentId}/features',
  FEATURE_EXTRACTORS: '/v1/collections/features/extractors',
  RETRIEVERS: '/v1/retrievers/debug-inference'
}

// Content Modes
export const CONTENT_MODES = {
  AUTO: 'auto',
  PAGE: 'page',
  VIDEO: 'video',
  IMAGE: 'image'
}

// Feature Extractors (actual Mixpeek API extractors)
export const FEATURE_EXTRACTORS = {
  // Actual Mixpeek extractors
  TEXT: 'text_extractor_v1',
  SENTIMENT: 'sentiment_classifier_v1',
  IMAGE: 'image_extractor_v1',
  MULTIMODAL: 'multimodal_extractor_v1',
  // Legacy aliases for backwards compatibility
  TAXONOMY: 'text_extractor_v1',
  BRAND_SAFETY: 'sentiment_classifier_v1',
  KEYWORDS: 'text_extractor_v1',
  CLUSTERING: 'text_extractor_v1',
  EMBEDDING: 'text_extractor_v1'
}

// Targeting Key Prefixes
export const TARGETING_KEYS = {
  TAXONOMY: 'hb_mixpeek_taxonomy',
  CATEGORY: 'hb_mixpeek_category',
  NODE: 'hb_mixpeek_node',
  PATH: 'hb_mixpeek_path',
  SCORE: 'hb_mixpeek_score',
  SAFETY: 'hb_mixpeek_safety',
  KEYWORDS: 'hb_mixpeek_keywords',
  EMBED: 'hb_mixpeek_embed',
  SENTIMENT: 'hb_mixpeek_sentiment',
  // Previous ad context
  PREV_AD_CREATIVE_ID: 'hb_mixpeek_prev_creative',
  PREV_AD_BIDDER: 'hb_mixpeek_prev_bidder',
  PREV_AD_ADUNIT: 'hb_mixpeek_prev_adunit',
  PREV_AD_CAT: 'hb_mixpeek_prev_cat'
}

// Error Codes
export const ERROR_CODES = {
  INVALID_CONFIG: 'INVALID_CONFIG',
  API_TIMEOUT: 'API_TIMEOUT',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  MISSING_CONTENT: 'MISSING_CONTENT',
  CACHE_ERROR: 'CACHE_ERROR'
}

// Cache Configuration
export const CACHE_KEYS = {
  PREFIX: 'mixpeek_ctx_',
  VERSION: 'v1'
}

// Performance Thresholds
export const PERFORMANCE = {
  MAX_LATENCY: 250, // ms
  WARN_LATENCY: 100, // ms
  MAX_CONTENT_SIZE: 50000 // characters
}

// Default Feature Extractor Configurations
export const DEFAULT_EXTRACTORS = [
  {
    type: FEATURE_EXTRACTORS.TAXONOMY,
    enabled: true
  }
]

// Event Names
export const EVENTS = {
  CONTEXT_READY: 'mixpeekContextReady',
  CONTEXT_ERROR: 'mixpeekContextError',
  CONTEXT_CACHED: 'mixpeekContextCached',
  API_REQUEST: 'mixpeekApiRequest',
  API_RESPONSE: 'mixpeekApiResponse'
}

// HTTP Headers
export const HEADERS = {
  AUTHORIZATION: 'Authorization',
  NAMESPACE: 'X-Namespace',
  CONTENT_TYPE: 'Content-Type',
  USER_AGENT: 'User-Agent'
}

// User Agent
export const USER_AGENT = `Mixpeek-Prebid-Adapter/${MIXPEEK_VERSION}`

