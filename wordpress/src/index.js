/**
 * @mixpeek/wordpress — Mixpeek Wordpress Connector
 *
 * WordPress integration for Mixpeek — REST API handlers, post enrichment, and hook management
 *
 * @module @mixpeek/wordpress
 * @version 1.0.0
 */

// Modules
export { createRestApiHandler, RestApiHandler } from './modules/restApiHandler.js';
export { createPostEnricher, PostEnricher } from './modules/postEnricher.js';
export { createHookManager, HookManager } from './modules/hookManager.js';

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
import { createRestApiHandler } from './modules/restApiHandler.js';
export default createRestApiHandler;
