/**
 * @mixpeek/strapi — Mixpeek Strapi Connector
 *
 * Strapi integration for Mixpeek — lifecycle hooks, content enrichment, and plugin configuration
 *
 * @module @mixpeek/strapi
 * @version 1.0.0
 */

// Modules
export { createStrapiLifecycle, StrapiLifecycle } from './modules/strapiLifecycle.js';
export { createContentEnricher, ContentEnricher } from './modules/contentEnricher.js';
export { createPluginConfig, PluginConfig } from './modules/pluginConfig.js';

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
import { createStrapiLifecycle } from './modules/strapiLifecycle.js';
export default createStrapiLifecycle;
