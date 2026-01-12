/**
 * Mixpeek OpenRTB Connector
 *
 * Privacy-first contextual enrichment for OpenRTB bid requests.
 * Provides multimodal AI-powered signals for programmatic advertising.
 *
 * @module @mixpeek/openrtb
 * @version 1.0.0
 */

// Main enricher
export { createEnricher, OpenRTBEnricher } from './modules/openrtbEnricher.js';

// API client
export { createClient, MixpeekClient } from './api/mixpeekClient.js';

// Cache manager
export { createCacheManager, CacheManager } from './cache/cacheManager.js';

// Content extractors
export {
  extractFromBidRequest,
  extractFromAppRequest,
  validateContent
} from './extractors/contentExtractor.js';

// Formatters
export {
  formatSiteContent,
  formatImpExt,
  formatTargetingKeys,
  enrichBidRequest,
  formatOrtb3Context,
  createMinimalResponse
} from './formatters/ortbFormatter.js';

// Utilities
export {
  generateId,
  createCacheKey,
  sanitizeText,
  extractKeywords,
  analyzeSentiment,
  inferCategory,
  assessBrandSafety,
  detectLanguage,
  deepMerge,
  isValidUrl,
  extractDomain
} from './utils/helpers.js';

// IAB Content Taxonomy mapping
export {
  IAB_TAXONOMY,
  keywordToIAB,
  keywordsToIAB,
  getCategoryInfo,
  getParentCategory,
  isTier1Category,
  getTier1Categories,
  isValidCategory
} from './utils/iabMapping.js';

// IAB Ad Product Taxonomy integration
export {
  formatProductTaxonomy,
  enrichWithProductTaxonomy,
  formatProductTargetingKeys,
  extractProductInfo
} from './utils/productTaxonomy.js';

// Logger
export { getLogger, createLogger, Logger, LOG_LEVELS } from './utils/logger.js';

// Constants
export {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  DEFAULT_CACHE_TTL,
  CONTENT_MODES,
  OPENRTB_VERSIONS,
  IAB_TAXONOMY_VERSIONS,
  TARGETING_KEYS,
  BRAND_SAFETY_LEVELS,
  SENTIMENT_VALUES,
  CONTENT_TYPES,
  ERROR_CODES,
  PERFORMANCE,
  DEFAULT_CONFIG
} from './config/constants.js';

// Default export
import { createEnricher } from './modules/openrtbEnricher.js';
export default createEnricher;
