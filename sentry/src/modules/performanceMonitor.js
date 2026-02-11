/**
 * @mixpeek/sentry — PerformanceMonitor
 *
 * Monitors Mixpeek enrichment performance and reports to Sentry
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class PerformanceMonitor {
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
    if (!config.apiKey) throw new Error('apiKey is required for PerformanceMonitor');

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
    this.logger.info('PerformanceMonitor initialized');
  }

  async startTransaction(...args) {
    this.logger.debug('PerformanceMonitor.startTransaction called');
    // TODO: Implement startTransaction
    throw new Error('PerformanceMonitor.startTransaction not yet implemented');
  }

  async startSpan(...args) {
    this.logger.debug('PerformanceMonitor.startSpan called');
    // TODO: Implement startSpan
    throw new Error('PerformanceMonitor.startSpan not yet implemented');
  }

  async finishTransaction(...args) {
    this.logger.debug('PerformanceMonitor.finishTransaction called');
    // TODO: Implement finishTransaction
    throw new Error('PerformanceMonitor.finishTransaction not yet implemented');
  }

  setMeasurement(...args) {
    this.logger.debug('PerformanceMonitor.setMeasurement called');
    // TODO: Implement setMeasurement
    throw new Error('PerformanceMonitor.setMeasurement not yet implemented');
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
    this.logger.info('PerformanceMonitor destroyed');
  }
}

export function createPerformanceMonitor(config) {
  return new PerformanceMonitor(config);
}

export { PerformanceMonitor };
export default { createPerformanceMonitor, PerformanceMonitor };
