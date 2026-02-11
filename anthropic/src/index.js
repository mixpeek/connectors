/**
 * @mixpeek/anthropic — Mixpeek Anthropic Connector
 *
 * Anthropic integration for Mixpeek — tool definitions, content adapters, and MCP server for Claude
 *
 * @module @mixpeek/anthropic
 * @version 1.0.0
 */

// Modules
export { createToolDefinitions, ToolDefinitions } from './modules/toolDefinitions.js';
export { createContentAdapter, ContentAdapter } from './modules/contentAdapter.js';
export { createMcpServer, McpServer } from './modules/mcpServer.js';

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
import { createToolDefinitions } from './modules/toolDefinitions.js';
export default createToolDefinitions;
