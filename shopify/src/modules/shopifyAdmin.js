/**
 * @mixpeek/shopify — ShopifyAdmin
 *
 * Shopify Admin API client for fetching products, collections, and writing enrichment results
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ShopifyAdmin {
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
    if (!config.apiKey) throw new Error('apiKey is required for ShopifyAdmin');

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
    this.logger.info('ShopifyAdmin initialized');
  }

  async getProduct(...args) {
    this.logger.debug('ShopifyAdmin.getProduct called');
    // TODO: Implement getProduct
    throw new Error('ShopifyAdmin.getProduct not yet implemented');
  }

  async getProducts(...args) {
    this.logger.debug('ShopifyAdmin.getProducts called');
    // TODO: Implement getProducts
    throw new Error('ShopifyAdmin.getProducts not yet implemented');
  }

  async updateProduct(...args) {
    this.logger.debug('ShopifyAdmin.updateProduct called');
    // TODO: Implement updateProduct
    throw new Error('ShopifyAdmin.updateProduct not yet implemented');
  }

  async getCollection(...args) {
    this.logger.debug('ShopifyAdmin.getCollection called');
    // TODO: Implement getCollection
    throw new Error('ShopifyAdmin.getCollection not yet implemented');
  }

  async graphql(...args) {
    this.logger.debug('ShopifyAdmin.graphql called');
    // TODO: Implement graphql
    throw new Error('ShopifyAdmin.graphql not yet implemented');
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
    this.logger.info('ShopifyAdmin destroyed');
  }
}

export function createShopifyAdmin(config) {
  return new ShopifyAdmin(config);
}

export { ShopifyAdmin };
export default { createShopifyAdmin, ShopifyAdmin };
