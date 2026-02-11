/**
 * @mixpeek/airflow — Mixpeek Airflow Connector
 *
 * Apache Airflow integration for Mixpeek — custom operators, DAG generators, and task builders
 *
 * @module @mixpeek/airflow
 * @version 1.0.0
 */

// Modules
export { createMixpeekOperator, MixpeekOperator } from './modules/mixpeekOperator.js';
export { createDagGenerator, DagGenerator } from './modules/dagGenerator.js';
export { createTaskBuilder, TaskBuilder } from './modules/taskBuilder.js';

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
import { createMixpeekOperator } from './modules/mixpeekOperator.js';
export default createMixpeekOperator;
