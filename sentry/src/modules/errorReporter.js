/**
 * @mixpeek/sentry — ErrorReporter
 *
 * Reports Mixpeek enrichment errors to Sentry with full context
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ErrorReporter {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in ms
   * @param {number} [config.cacheTTL] - Cache TTL in seconds
   * @param {boolean} [config.enableCache] - Enable caching
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config = {}) {
    if (!config.apiKey) throw new Error('apiKey is required for ErrorReporter');

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = createClient({
      apiKey: config.apiKey,
      endpoint: this.config.endpoint,
      timeout: this.config.timeout,
      debug: this.config.debug
    });
    this.cache = this.config.enableCache ? createCacheManager({ ttl: this.config.cacheTTL, debug: this.config.debug }) : null;
    this.logger = getLogger({ debug: this.config.debug });
    this.metrics = { requests: 0, errors: 0, totalLatencyMs: 0 };
    this.logger.info('ErrorReporter initialized');
  }

  async captureException(...args) {
    this.logger.debug('ErrorReporter.captureException called');
    // TODO: Implement captureException
    throw new Error('ErrorReporter.captureException not yet implemented');
  }

  async captureMessage(...args) {
    this.logger.debug('ErrorReporter.captureMessage called');
    // TODO: Implement captureMessage
    throw new Error('ErrorReporter.captureMessage not yet implemented');
  }

  setContext(...args) {
    this.logger.debug('ErrorReporter.setContext called');
    // TODO: Implement setContext
    throw new Error('ErrorReporter.setContext not yet implemented');
  }

  addBreadcrumb(...args) {
    this.logger.debug('ErrorReporter.addBreadcrumb called');
    // TODO: Implement addBreadcrumb
    throw new Error('ErrorReporter.addBreadcrumb not yet implemented');
  }

  async flush(...args) {
    this.logger.debug('ErrorReporter.flush called');
    // TODO: Implement flush
    throw new Error('ErrorReporter.flush not yet implemented');
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgLatencyMs: this.metrics.requests > 0 ? this.metrics.totalLatencyMs / this.metrics.requests : 0,
      cache: this.cache ? this.cache.getStats() : null
    };
  }

  resetMetrics() {
    this.metrics = { requests: 0, errors: 0, totalLatencyMs: 0 };
    if (this.cache) this.cache.resetStats();
  }

  destroy() {
    if (this.cache) this.cache.destroy();
    this.logger.info('ErrorReporter destroyed');
  }
}

export function createErrorReporter(config) {
  return new ErrorReporter(config);
}

export { ErrorReporter };
export default { createErrorReporter, ErrorReporter };
