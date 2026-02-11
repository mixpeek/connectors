/**
 * @mixpeek/sanity — Mixpeek Sanity Connector
 *
 * Sanity.io integration for Mixpeek — webhook handling, document enrichment, and GROQ-powered queries
 *
 * @module @mixpeek/sanity
 * @version 1.0.0
 */

// Modules
export { createWebhookHandler, WebhookHandler } from './modules/webhookHandler.js';
export { createDocumentEnricher, DocumentEnricher } from './modules/documentEnricher.js';
export { createSanityClient, SanityClient } from './modules/sanityClient.js';

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
