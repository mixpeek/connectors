/**
 * @mixpeek/sanity — WebhookHandler
 *
 * Handles Sanity GROQ-powered webhooks and triggers Mixpeek enrichment
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class WebhookHandler {
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
    if (!config.apiKey) throw new Error('apiKey is required for WebhookHandler');

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
    this.logger.info('WebhookHandler initialized');
  }

  async handleWebhook(...args) {
    this.logger.debug('WebhookHandler.handleWebhook called');
    // TODO: Implement handleWebhook
    throw new Error('WebhookHandler.handleWebhook not yet implemented');
  }

  verifySignature(...args) {
    this.logger.debug('WebhookHandler.verifySignature called');
    // TODO: Implement verifySignature
    throw new Error('WebhookHandler.verifySignature not yet implemented');
  }

  parsePayload(...args) {
    this.logger.debug('WebhookHandler.parsePayload called');
    // TODO: Implement parsePayload
    throw new Error('WebhookHandler.parsePayload not yet implemented');
  }

  filterDocuments(...args) {
    this.logger.debug('WebhookHandler.filterDocuments called');
    // TODO: Implement filterDocuments
    throw new Error('WebhookHandler.filterDocuments not yet implemented');
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
    this.logger.info('WebhookHandler destroyed');
  }
}

export function createWebhookHandler(config) {
  return new WebhookHandler(config);
}

export { WebhookHandler };
export default { createWebhookHandler, WebhookHandler };
