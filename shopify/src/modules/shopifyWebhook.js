/**
 * @mixpeek/shopify — ShopifyWebhook
 *
 * Handles Shopify webhooks (product create/update/delete) and triggers Mixpeek enrichment
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ShopifyWebhook {
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
    if (!config.apiKey) throw new Error('apiKey is required for ShopifyWebhook');

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
    this.logger.info('ShopifyWebhook initialized');
  }

  async handleWebhook(...args) {
    this.logger.debug('ShopifyWebhook.handleWebhook called');
    // TODO: Implement handleWebhook
    throw new Error('ShopifyWebhook.handleWebhook not yet implemented');
  }

  verifyHmac(...args) {
    this.logger.debug('ShopifyWebhook.verifyHmac called');
    // TODO: Implement verifyHmac
    throw new Error('ShopifyWebhook.verifyHmac not yet implemented');
  }

  async registerWebhooks(...args) {
    this.logger.debug('ShopifyWebhook.registerWebhooks called');
    // TODO: Implement registerWebhooks
    throw new Error('ShopifyWebhook.registerWebhooks not yet implemented');
  }

  async listWebhooks(...args) {
    this.logger.debug('ShopifyWebhook.listWebhooks called');
    // TODO: Implement listWebhooks
    throw new Error('ShopifyWebhook.listWebhooks not yet implemented');
  }

  async deleteWebhook(...args) {
    this.logger.debug('ShopifyWebhook.deleteWebhook called');
    // TODO: Implement deleteWebhook
    throw new Error('ShopifyWebhook.deleteWebhook not yet implemented');
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
    this.logger.info('ShopifyWebhook destroyed');
  }
}

export function createShopifyWebhook(config) {
  return new ShopifyWebhook(config);
}

export { ShopifyWebhook };
export default { createShopifyWebhook, ShopifyWebhook };
