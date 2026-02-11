/**
 * @mixpeek/prometheus — CollectorRegistry
 *
 * Manages custom Prometheus collectors for Mixpeek pipeline metrics
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class CollectorRegistry {
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
    if (!config.apiKey) throw new Error('apiKey is required for CollectorRegistry');

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
    this.logger.info('CollectorRegistry initialized');
  }

  addCollector(...args) {
    this.logger.debug('CollectorRegistry.addCollector called');
    // TODO: Implement addCollector
    throw new Error('CollectorRegistry.addCollector not yet implemented');
  }

  removeCollector(...args) {
    this.logger.debug('CollectorRegistry.removeCollector called');
    // TODO: Implement removeCollector
    throw new Error('CollectorRegistry.removeCollector not yet implemented');
  }

  collect(...args) {
    this.logger.debug('CollectorRegistry.collect called');
    // TODO: Implement collect
    throw new Error('CollectorRegistry.collect not yet implemented');
  }

  getCollectors(...args) {
    this.logger.debug('CollectorRegistry.getCollectors called');
    // TODO: Implement getCollectors
    throw new Error('CollectorRegistry.getCollectors not yet implemented');
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
    this.logger.info('CollectorRegistry destroyed');
  }
}

export function createCollectorRegistry(config) {
  return new CollectorRegistry(config);
}

export { CollectorRegistry };
export default { createCollectorRegistry, CollectorRegistry };
