/**
 * @mixpeek/huggingface — Mixpeek Huggingface Connector
 *
 * Hugging Face integration for Mixpeek — model bridging, dataset sync, and pipeline adaptation
 *
 * @module @mixpeek/huggingface
 * @version 1.0.0
 */

// Modules
export { createModelBridge, ModelBridge } from './modules/modelBridge.js';
export { createDatasetSync, DatasetSync } from './modules/datasetSync.js';
export { createPipelineAdapter, PipelineAdapter } from './modules/pipelineAdapter.js';

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
import { createModelBridge } from './modules/modelBridge.js';
export default createModelBridge;
