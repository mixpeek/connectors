/**
 * @mixpeek/datadog — MetricsReporter
 *
 * Reports Mixpeek enrichment metrics to Datadog (counters, gauges, distributions)
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MetricsReporter {
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
    if (!config.apiKey) throw new Error('apiKey is required for MetricsReporter');

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
    this.logger.info('MetricsReporter initialized');
  }

  increment(...args) {
    this.logger.debug('MetricsReporter.increment called');
    // TODO: Implement increment
    throw new Error('MetricsReporter.increment not yet implemented');
  }

  gauge(...args) {
    this.logger.debug('MetricsReporter.gauge called');
    // TODO: Implement gauge
    throw new Error('MetricsReporter.gauge not yet implemented');
  }

  distribution(...args) {
    this.logger.debug('MetricsReporter.distribution called');
    // TODO: Implement distribution
    throw new Error('MetricsReporter.distribution not yet implemented');
  }

  async flush(...args) {
    this.logger.debug('MetricsReporter.flush called');
    // TODO: Implement flush
    throw new Error('MetricsReporter.flush not yet implemented');
  }

  getStats(...args) {
    this.logger.debug('MetricsReporter.getStats called');
    // TODO: Implement getStats
    throw new Error('MetricsReporter.getStats not yet implemented');
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
    this.logger.info('MetricsReporter destroyed');
  }
}

export function createMetricsReporter(config) {
  return new MetricsReporter(config);
}

export { MetricsReporter };
export default { createMetricsReporter, MetricsReporter };
