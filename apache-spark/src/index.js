/**
 * @mixpeek/spark — Mixpeek Spark Connector
 *
 * Apache Spark integration for Mixpeek — UDF transformers, batch processing, and schema mapping
 *
 * @module @mixpeek/spark
 * @version 1.0.0
 */

// Modules
export { createSparkTransformer, SparkTransformer } from './modules/sparkTransformer.js';
export { createBatchProcessor, BatchProcessor } from './modules/batchProcessor.js';
export { createSchemaMapper, SchemaMapper } from './modules/schemaMapper.js';

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
import { createSparkTransformer } from './modules/sparkTransformer.js';
export default createSparkTransformer;
