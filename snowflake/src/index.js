/**
 * @mixpeek/snowflake — Mixpeek Snowflake Connector
 *
 * Snowflake integration for Mixpeek — external functions, stream processing, and data enrichment
 *
 * @module @mixpeek/snowflake
 * @version 1.0.0
 */

// Modules
export { createSnowflakeClient, SnowflakeClient } from './modules/snowflakeClient.js';
export { createExternalFunction, ExternalFunction } from './modules/externalFunction.js';
export { createStreamProcessor, StreamProcessor } from './modules/streamProcessor.js';

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
import { createSnowflakeClient } from './modules/snowflakeClient.js';
export default createSnowflakeClient;
