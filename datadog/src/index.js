/**
 * @mixpeek/datadog — Mixpeek Datadog Connector
 *
 * Datadog integration for Mixpeek — metrics, logs, and distributed tracing for enrichment pipelines
 *
 * @module @mixpeek/datadog
 * @version 1.0.0
 */

// Modules
export { createMetricsReporter, MetricsReporter } from './modules/metricsReporter.js';
export { createLogForwarder, LogForwarder } from './modules/logForwarder.js';
export { createTraceIntegration, TraceIntegration } from './modules/traceIntegration.js';

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
import { createMetricsReporter } from './modules/metricsReporter.js';
export default createMetricsReporter;
