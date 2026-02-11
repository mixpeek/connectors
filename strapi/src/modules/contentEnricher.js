/**
 * @mixpeek/strapi — ContentEnricher
 *
 * Enriches Strapi content types with Mixpeek multimodal analysis
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ContentEnricher {
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
    if (!config.apiKey) throw new Error('apiKey is required for ContentEnricher');

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
    this.logger.info('ContentEnricher initialized');
  }

  async enrichEntry(...args) {
    this.logger.debug('ContentEnricher.enrichEntry called');
    // TODO: Implement enrichEntry
    throw new Error('ContentEnricher.enrichEntry not yet implemented');
  }

  enrichMedia(...args) {
    this.logger.debug('ContentEnricher.enrichMedia called');
    // TODO: Implement enrichMedia
    throw new Error('ContentEnricher.enrichMedia not yet implemented');
  }

  async enrichBatch(...args) {
    this.logger.debug('ContentEnricher.enrichBatch called');
    // TODO: Implement enrichBatch
    throw new Error('ContentEnricher.enrichBatch not yet implemented');
  }

  async getEnrichment(...args) {
    this.logger.debug('ContentEnricher.getEnrichment called');
    // TODO: Implement getEnrichment
    throw new Error('ContentEnricher.getEnrichment not yet implemented');
  }

  async setField(...args) {
    this.logger.debug('ContentEnricher.setField called');
    // TODO: Implement setField
    throw new Error('ContentEnricher.setField not yet implemented');
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
    this.logger.info('ContentEnricher destroyed');
  }
}

export function createContentEnricher(config) {
  return new ContentEnricher(config);
}

export { ContentEnricher };
export default { createContentEnricher, ContentEnricher };
