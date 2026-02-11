/**
 * @mixpeek/gcs — Mixpeek Gcs Connector
 *
 * Google Cloud Storage integration for Mixpeek — watch buckets, enrich objects, and parse GCS events
 *
 * @module @mixpeek/gcs
 * @version 1.0.0
 */

// Modules
export { createGCSWatcher, GCSWatcher } from './modules/gcsWatcher.js';
export { createGCSEnricher, GCSEnricher } from './modules/gcsEnricher.js';
export { createGCSEventParser, GCSEventParser } from './modules/gcsEventParser.js';

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
import { createGCSWatcher } from './modules/gcsWatcher.js';
export default createGCSWatcher;
