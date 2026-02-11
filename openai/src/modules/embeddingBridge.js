/**
 * @mixpeek/openai — EmbeddingBridge
 *
 * Bridges OpenAI embeddings with Mixpeek vector storage for hybrid search
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class EmbeddingBridge {
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
    if (!config.apiKey) throw new Error('apiKey is required for EmbeddingBridge');

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
    this.logger.info('EmbeddingBridge initialized');
  }

  async embed(...args) {
    this.logger.debug('EmbeddingBridge.embed called');
    // TODO: Implement embed
    throw new Error('EmbeddingBridge.embed not yet implemented');
  }

  async embedBatch(...args) {
    this.logger.debug('EmbeddingBridge.embedBatch called');
    // TODO: Implement embedBatch
    throw new Error('EmbeddingBridge.embedBatch not yet implemented');
  }

  async store(...args) {
    this.logger.debug('EmbeddingBridge.store called');
    // TODO: Implement store
    throw new Error('EmbeddingBridge.store not yet implemented');
  }

  async search(...args) {
    this.logger.debug('EmbeddingBridge.search called');
    // TODO: Implement search
    throw new Error('EmbeddingBridge.search not yet implemented');
  }

  setModel(...args) {
    this.logger.debug('EmbeddingBridge.setModel called');
    // TODO: Implement setModel
    throw new Error('EmbeddingBridge.setModel not yet implemented');
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
    this.logger.info('EmbeddingBridge destroyed');
  }
}

export function createEmbeddingBridge(config) {
  return new EmbeddingBridge(config);
}

export { EmbeddingBridge };
export default { createEmbeddingBridge, EmbeddingBridge };
