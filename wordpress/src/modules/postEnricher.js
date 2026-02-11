/**
 * @mixpeek/wordpress — PostEnricher
 *
 * Enriches WordPress posts/pages with Mixpeek analysis and stores as custom fields
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class PostEnricher {
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
    if (!config.apiKey) throw new Error('apiKey is required for PostEnricher');

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
    this.logger.info('PostEnricher initialized');
  }

  enrichPost(...args) {
    this.logger.debug('PostEnricher.enrichPost called');
    // TODO: Implement enrichPost
    throw new Error('PostEnricher.enrichPost not yet implemented');
  }

  enrichPage(...args) {
    this.logger.debug('PostEnricher.enrichPage called');
    // TODO: Implement enrichPage
    throw new Error('PostEnricher.enrichPage not yet implemented');
  }

  async enrichBatch(...args) {
    this.logger.debug('PostEnricher.enrichBatch called');
    // TODO: Implement enrichBatch
    throw new Error('PostEnricher.enrichBatch not yet implemented');
  }

  async getEnrichment(...args) {
    this.logger.debug('PostEnricher.getEnrichment called');
    // TODO: Implement getEnrichment
    throw new Error('PostEnricher.getEnrichment not yet implemented');
  }

  setCustomField(...args) {
    this.logger.debug('PostEnricher.setCustomField called');
    // TODO: Implement setCustomField
    throw new Error('PostEnricher.setCustomField not yet implemented');
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
    this.logger.info('PostEnricher destroyed');
  }
}

export function createPostEnricher(config) {
  return new PostEnricher(config);
}

export { PostEnricher };
export default { createPostEnricher, PostEnricher };
