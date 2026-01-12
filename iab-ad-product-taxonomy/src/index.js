/**
 * Mixpeek IAB Ad Product Taxonomy Connector
 *
 * Standards-aligned taxonomy mapping utility for converting product metadata
 * into IAB Tech Lab Ad Product Taxonomy categories.
 *
 * @module @mixpeek/iab-ad-product-taxonomy
 * @version 1.0.0
 */

// Main mapper
export { createMapper, mapProduct, ProductMapper } from './modules/productMapper.js';

// API client
export { createClient, MixpeekClient } from './api/mixpeekClient.js';

// Cache manager
export { createCacheManager, CacheManager } from './cache/cacheManager.js';

// Taxonomy data
export {
  IAB_AD_PRODUCT_TAXONOMY,
  IAB_AD_PRODUCT_TIER1,
  getIABCode,
  getIdFromCode,
  getCategoryById,
  getTier1Categories,
  getChildCategories,
  getCategoryPath,
  getCategoryLabel,
  isValidCategory,
  getTier1Parent
} from './data/taxonomy.js';

// Keyword mapping
export {
  KEYWORD_MAPPINGS,
  mapKeywordToCategory,
  mapKeywordsToCategories,
  findBestMatch,
  getKeywordsForCategory,
  getAllKeywords
} from './utils/keywordMapping.js';

// Utilities
export {
  generateId,
  createCacheKey,
  sanitizeText,
  sanitizeTitle,
  sanitizeDescription,
  extractKeywords,
  validateConfig,
  validateInput,
  deepMerge,
  normalizeText
} from './utils/helpers.js';

// Logger
export { getLogger, createLogger, Logger, LOG_LEVELS } from './utils/logger.js';

// Constants
export {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  DEFAULT_CACHE_TTL,
  IAB_AD_PRODUCT_VERSIONS,
  DEFAULT_IAB_VERSION,
  MAPPING_MODES,
  DEFAULT_MAPPING_MODE,
  CONFIDENCE_THRESHOLDS,
  ERROR_CODES,
  DEFAULT_CONFIG
} from './config/constants.js';

// Default export
import { createMapper } from './modules/productMapper.js';
export default createMapper;
