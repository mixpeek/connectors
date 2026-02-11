/**
 * @mixpeek/huggingface — ModelBridge
 *
 * Bridges Hugging Face model inference with Mixpeek enrichment pipelines
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ModelBridge {
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
    if (!config.apiKey) throw new Error('apiKey is required for ModelBridge');

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
    this.logger.info('ModelBridge initialized');
  }

  async infer(...args) {
    this.logger.debug('ModelBridge.infer called');
    // TODO: Implement infer
    throw new Error('ModelBridge.infer not yet implemented');
  }

  async embedText(...args) {
    this.logger.debug('ModelBridge.embedText called');
    // TODO: Implement embedText
    throw new Error('ModelBridge.embedText not yet implemented');
  }

  async embedImage(...args) {
    this.logger.debug('ModelBridge.embedImage called');
    // TODO: Implement embedImage
    throw new Error('ModelBridge.embedImage not yet implemented');
  }

  async classify(...args) {
    this.logger.debug('ModelBridge.classify called');
    // TODO: Implement classify
    throw new Error('ModelBridge.classify not yet implemented');
  }

  setModel(...args) {
    this.logger.debug('ModelBridge.setModel called');
    // TODO: Implement setModel
    throw new Error('ModelBridge.setModel not yet implemented');
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
    this.logger.info('ModelBridge destroyed');
  }
}

export function createModelBridge(config) {
  return new ModelBridge(config);
}

export { ModelBridge };
export default { createModelBridge, ModelBridge };
