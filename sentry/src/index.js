/**
 * @mixpeek/sentry — Mixpeek Sentry Connector
 *
 * Sentry integration for Mixpeek — error tracking, performance monitoring, and enrichment pipeline observability
 *
 * @module @mixpeek/sentry
 * @version 1.0.0
 */

// Modules
export { createErrorReporter, ErrorReporter } from './modules/errorReporter.js';
export { createPerformanceMonitor, PerformanceMonitor } from './modules/performanceMonitor.js';
export { createMixpeekIntegration, MixpeekIntegration } from './modules/mixpeekIntegration.js';

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
import { createErrorReporter } from './modules/errorReporter.js';
export default createErrorReporter;
