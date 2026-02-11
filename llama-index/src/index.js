/**
 * @mixpeek/llamaindex — Mixpeek Llamaindex Connector
 *
 * LlamaIndex integration for Mixpeek — reader, retriever, and tool spec for RAG applications
 *
 * @module @mixpeek/llamaindex
 * @version 1.0.0
 */

// Modules
export { createMixpeekReader, MixpeekReader } from './modules/mixpeekReader.js';
export { createMixpeekRetriever, MixpeekRetriever } from './modules/mixpeekRetriever.js';
export { createMixpeekToolSpec, MixpeekToolSpec } from './modules/mixpeekToolSpec.js';

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
import { createMixpeekReader } from './modules/mixpeekReader.js';
export default createMixpeekReader;
