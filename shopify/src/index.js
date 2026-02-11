/**
 * @mixpeek/shopify — Mixpeek Shopify Connector
 *
 * Shopify integration for Mixpeek — webhook handling, product enrichment, and Admin API integration
 *
 * @module @mixpeek/shopify
 * @version 1.0.0
 */

// Modules
export { createShopifyWebhook, ShopifyWebhook } from './modules/shopifyWebhook.js';
export { createProductEnricher, ProductEnricher } from './modules/productEnricher.js';
export { createShopifyAdmin, ShopifyAdmin } from './modules/shopifyAdmin.js';

// API client
export { createClient, MixpeekClient } from './api/mixpeekClient.js';

// Cache manager
export { createCacheManager, CacheManager } from './cache/cacheManager.js';

// Utilities
export {
  generateId,
  createCacheKey,
  sanitizeText,
  deepMerge,
  isValidUrl,
  extractDomain
} from './utils/helpers.js';

// Logger
export { getLogger, createLogger, Logger, LOG_LEVELS } from './utils/logger.js';

// Constants
export {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  DEFAULT_CACHE_TTL,
  ERROR_CODES,
  DEFAULT_CONFIG
} from './config/constants.js';

// Default export
import { createShopifyWebhook } from './modules/shopifyWebhook.js';
export default createShopifyWebhook;
