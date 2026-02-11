/**
 * @mixpeek/databricks — Mixpeek Databricks Connector
 *
 * Databricks integration for Mixpeek — notebook helpers, Delta Lake integration, and Unity Catalog connector
 *
 * @module @mixpeek/databricks
 * @version 1.0.0
 */

// Modules
export { createNotebookHelper, NotebookHelper } from './modules/notebookHelper.js';
export { createDeltaLakeIntegration, DeltaLakeIntegration } from './modules/deltaLakeIntegration.js';
export { createUnityConnector, UnityConnector } from './modules/unityConnector.js';

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
import { createNotebookHelper } from './modules/notebookHelper.js';
export default createNotebookHelper;
