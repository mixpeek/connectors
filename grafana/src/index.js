/**
 * @mixpeek/grafana — Mixpeek Grafana Connector
 *
 * Grafana integration for Mixpeek — dashboard provisioning, annotations, and Prometheus metric export
 *
 * @module @mixpeek/grafana
 * @version 1.0.0
 */

// Modules
export { createPrometheusExporter, PrometheusExporter } from './modules/prometheusExporter.js';
export { createDashboardProvisioner, DashboardProvisioner } from './modules/dashboardProvisioner.js';
export { createAnnotationProvider, AnnotationProvider } from './modules/annotationProvider.js';

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
import { createPrometheusExporter } from './modules/prometheusExporter.js';
export default createPrometheusExporter;
