/**
 * @mixpeek/openai — Mixpeek Openai Connector
 *
 * OpenAI integration for Mixpeek — embedding bridge, function calling adapter, and assistant tools
 *
 * @module @mixpeek/openai
 * @version 1.0.0
 */

// Modules
export { createEmbeddingBridge, EmbeddingBridge } from './modules/embeddingBridge.js';
export { createFunctionCallingAdapter, FunctionCallingAdapter } from './modules/functionCallingAdapter.js';
export { createAssistantTool, AssistantTool } from './modules/assistantTool.js';

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
import { createEmbeddingBridge } from './modules/embeddingBridge.js';
export default createEmbeddingBridge;
