/**
 * @mixpeek/azure-blob — BlobEnricher
 *
 * Enriches Azure Blobs through Mixpeek and stores enrichment metadata
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class BlobEnricher {
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
    if (!config.apiKey) throw new Error('apiKey is required for BlobEnricher');

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
    this.logger.info('BlobEnricher initialized');
  }

  async enrich(...args) {
    this.logger.debug('BlobEnricher.enrich called');
    // TODO: Implement enrich
    throw new Error('BlobEnricher.enrich not yet implemented');
  }

  async enrichBatch(...args) {
    this.logger.debug('BlobEnricher.enrichBatch called');
    // TODO: Implement enrichBatch
    throw new Error('BlobEnricher.enrichBatch not yet implemented');
  }

  async getEnrichment(...args) {
    this.logger.debug('BlobEnricher.getEnrichment called');
    // TODO: Implement getEnrichment
    throw new Error('BlobEnricher.getEnrichment not yet implemented');
  }

  setOutputContainer(...args) {
    this.logger.debug('BlobEnricher.setOutputContainer called');
    // TODO: Implement setOutputContainer
    throw new Error('BlobEnricher.setOutputContainer not yet implemented');
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
    this.logger.info('BlobEnricher destroyed');
  }
}

export function createBlobEnricher(config) {
  return new BlobEnricher(config);
}

export { BlobEnricher };
export default { createBlobEnricher, BlobEnricher };
