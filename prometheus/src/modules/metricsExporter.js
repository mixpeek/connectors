/**
 * @mixpeek/prometheus — MetricsExporter
 *
 * Exports Mixpeek enrichment metrics as Prometheus metrics (counters, histograms, gauges)
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MetricsExporter {
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
    if (!config.apiKey) throw new Error('apiKey is required for MetricsExporter');

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
    this.logger.info('MetricsExporter initialized');
  }

  register(...args) {
    this.logger.debug('MetricsExporter.register called');
    // TODO: Implement register
    throw new Error('MetricsExporter.register not yet implemented');
  }

  recordEnrichment(...args) {
    this.logger.debug('MetricsExporter.recordEnrichment called');
    // TODO: Implement recordEnrichment
    throw new Error('MetricsExporter.recordEnrichment not yet implemented');
  }

  recordLatency(...args) {
    this.logger.debug('MetricsExporter.recordLatency called');
    // TODO: Implement recordLatency
    throw new Error('MetricsExporter.recordLatency not yet implemented');
  }

  recordError(...args) {
    this.logger.debug('MetricsExporter.recordError called');
    // TODO: Implement recordError
    throw new Error('MetricsExporter.recordError not yet implemented');
  }

  getMetrics(...args) {
    this.logger.debug('MetricsExporter.getMetrics called');
    // TODO: Implement getMetrics
    throw new Error('MetricsExporter.getMetrics not yet implemented');
  }

  reset(...args) {
    this.logger.debug('MetricsExporter.reset called');
    // TODO: Implement reset
    throw new Error('MetricsExporter.reset not yet implemented');
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
    this.logger.info('MetricsExporter destroyed');
  }
}

export function createMetricsExporter(config) {
  return new MetricsExporter(config);
}

export { MetricsExporter };
export default { createMetricsExporter, MetricsExporter };
