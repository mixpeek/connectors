/**
 * @mixpeek/contentful — Mixpeek Contentful Connector
 *
 * Contentful integration for Mixpeek — webhook handling, content enrichment, and management API integration
 *
 * @module @mixpeek/contentful
 * @version 1.0.0
 */

// Modules
export { createWebhookHandler, WebhookHandler } from './modules/webhookHandler.js';
export { createContentEnricher, ContentEnricher } from './modules/contentEnricher.js';
export { createContentfulClient, ContentfulClient } from './modules/contentfulClient.js';

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
import { createWebhookHandler } from './modules/webhookHandler.js';
export default createWebhookHandler;
