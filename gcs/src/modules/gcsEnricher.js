/**
 * @mixpeek/gcs — GCSEnricher
 *
 * Enriches GCS objects through Mixpeek and stores enrichment results
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class GCSEnricher {
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
    if (!config.apiKey) throw new Error('apiKey is required for GCSEnricher');

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
    this.logger.info('GCSEnricher initialized');
  }

  async enrich(...args) {
    this.logger.debug('GCSEnricher.enrich called');
    // TODO: Implement enrich
    throw new Error('GCSEnricher.enrich not yet implemented');
  }

  async enrichBatch(...args) {
    this.logger.debug('GCSEnricher.enrichBatch called');
    // TODO: Implement enrichBatch
    throw new Error('GCSEnricher.enrichBatch not yet implemented');
  }

  async getEnrichment(...args) {
    this.logger.debug('GCSEnricher.getEnrichment called');
    // TODO: Implement getEnrichment
    throw new Error('GCSEnricher.getEnrichment not yet implemented');
  }

  setOutputBucket(...args) {
    this.logger.debug('GCSEnricher.setOutputBucket called');
    // TODO: Implement setOutputBucket
    throw new Error('GCSEnricher.setOutputBucket not yet implemented');
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
    this.logger.info('GCSEnricher destroyed');
  }
}

export function createGCSEnricher(config) {
  return new GCSEnricher(config);
}

export { GCSEnricher };
export default { createGCSEnricher, GCSEnricher };
