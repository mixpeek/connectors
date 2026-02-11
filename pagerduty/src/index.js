/**
 * @mixpeek/pagerduty — Mixpeek Pagerduty Connector
 *
 * PagerDuty integration for Mixpeek — incident management, alert routing, and health monitoring
 *
 * @module @mixpeek/pagerduty
 * @version 1.0.0
 */

// Modules
export { createAlertManager, AlertManager } from './modules/alertManager.js';
export { createIncidentFormatter, IncidentFormatter } from './modules/incidentFormatter.js';
export { createHealthChecker, HealthChecker } from './modules/healthChecker.js';

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
import { createAlertManager } from './modules/alertManager.js';
export default createAlertManager;
