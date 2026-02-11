/**
 * @mixpeek/contentful — ContentfulClient
 *
 * Contentful Management API client for reading/writing enrichment data
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ContentfulClient {
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
    if (!config.apiKey) throw new Error('apiKey is required for ContentfulClient');

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
    this.logger.info('ContentfulClient initialized');
  }

  async getEntry(...args) {
    this.logger.debug('ContentfulClient.getEntry called');
    // TODO: Implement getEntry
    throw new Error('ContentfulClient.getEntry not yet implemented');
  }

  async getEntries(...args) {
    this.logger.debug('ContentfulClient.getEntries called');
    // TODO: Implement getEntries
    throw new Error('ContentfulClient.getEntries not yet implemented');
  }

  async updateEntry(...args) {
    this.logger.debug('ContentfulClient.updateEntry called');
    // TODO: Implement updateEntry
    throw new Error('ContentfulClient.updateEntry not yet implemented');
  }

  async getAsset(...args) {
    this.logger.debug('ContentfulClient.getAsset called');
    // TODO: Implement getAsset
    throw new Error('ContentfulClient.getAsset not yet implemented');
  }

  async publishEntry(...args) {
    this.logger.debug('ContentfulClient.publishEntry called');
    // TODO: Implement publishEntry
    throw new Error('ContentfulClient.publishEntry not yet implemented');
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
    this.logger.info('ContentfulClient destroyed');
  }
}

export function createContentfulClient(config) {
  return new ContentfulClient(config);
}

export { ContentfulClient };
export default { createContentfulClient, ContentfulClient };
