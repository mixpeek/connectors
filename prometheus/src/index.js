/**
 * @mixpeek/prometheus — Mixpeek Prometheus Connector
 *
 * Prometheus metrics exporter for Mixpeek — expose enrichment metrics, latency histograms, and custom collectors
 *
 * @module @mixpeek/prometheus
 * @version 1.0.0
 */

// Modules
export { createMetricsExporter, MetricsExporter } from './modules/metricsExporter.js';
export { createCollectorRegistry, CollectorRegistry } from './modules/collectorRegistry.js';
export { createAlertRules, AlertRules } from './modules/alertRules.js';

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
import { createMetricsExporter } from './modules/metricsExporter.js';
export default createMetricsExporter;
