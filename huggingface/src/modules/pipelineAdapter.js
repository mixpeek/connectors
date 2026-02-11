/**
 * @mixpeek/huggingface — PipelineAdapter
 *
 * Adapts Hugging Face pipeline outputs into Mixpeek enrichment format
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class PipelineAdapter {
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
    if (!config.apiKey) throw new Error('apiKey is required for PipelineAdapter');

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
    this.logger.info('PipelineAdapter initialized');
  }

  adapt(...args) {
    this.logger.debug('PipelineAdapter.adapt called');
    // TODO: Implement adapt
    throw new Error('PipelineAdapter.adapt not yet implemented');
  }

  registerPipeline(...args) {
    this.logger.debug('PipelineAdapter.registerPipeline called');
    // TODO: Implement registerPipeline
    throw new Error('PipelineAdapter.registerPipeline not yet implemented');
  }

  transform(...args) {
    this.logger.debug('PipelineAdapter.transform called');
    // TODO: Implement transform
    throw new Error('PipelineAdapter.transform not yet implemented');
  }

  getSupportedTasks(...args) {
    this.logger.debug('PipelineAdapter.getSupportedTasks called');
    // TODO: Implement getSupportedTasks
    throw new Error('PipelineAdapter.getSupportedTasks not yet implemented');
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
    this.logger.info('PipelineAdapter destroyed');
  }
}

export function createPipelineAdapter(config) {
  return new PipelineAdapter(config);
}

export { PipelineAdapter };
export default { createPipelineAdapter, PipelineAdapter };
