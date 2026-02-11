/**
 * @mixpeek/azure-blob — Mixpeek Azure Blob Connector
 *
 * Azure Blob Storage integration for Mixpeek — watch containers, enrich blobs, and parse Event Grid events
 *
 * @module @mixpeek/azure-blob
 * @version 1.0.0
 */

// Modules
export { createBlobWatcher, BlobWatcher } from './modules/blobWatcher.js';
export { createBlobEnricher, BlobEnricher } from './modules/blobEnricher.js';
export { createEventGridParser, EventGridParser } from './modules/eventGridParser.js';

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
import { createBlobWatcher } from './modules/blobWatcher.js';
export default createBlobWatcher;
