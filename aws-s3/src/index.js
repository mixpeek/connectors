/**
 * @mixpeek/aws-s3 — Mixpeek Aws S3 Connector
 *
 * AWS S3 integration for Mixpeek — watch buckets for new objects, enrich content, and parse S3 events
 *
 * @module @mixpeek/aws-s3
 * @version 1.0.0
 */

// Modules
export { createS3Watcher, S3Watcher } from './modules/s3Watcher.js';
export { createS3Enricher, S3Enricher } from './modules/s3Enricher.js';
export { createS3EventParser, S3EventParser } from './modules/s3EventParser.js';

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
import { createS3Watcher } from './modules/s3Watcher.js';
export default createS3Watcher;
