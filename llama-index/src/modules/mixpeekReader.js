/**
 * @mixpeek/llamaindex — MixpeekReader
 *
 * LlamaIndex BaseReader that reads documents from Mixpeek collections
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MixpeekReader {
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
    if (!config.apiKey) throw new Error('apiKey is required for MixpeekReader');

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
    this.logger.info('MixpeekReader initialized');
  }

  async loadData(...args) {
    this.logger.debug('MixpeekReader.loadData called');
    // TODO: Implement loadData
    throw new Error('MixpeekReader.loadData not yet implemented');
  }

  async lazyLoadData(...args) {
    this.logger.debug('MixpeekReader.lazyLoadData called');
    // TODO: Implement lazyLoadData
    throw new Error('MixpeekReader.lazyLoadData not yet implemented');
  }

  setCollection(...args) {
    this.logger.debug('MixpeekReader.setCollection called');
    // TODO: Implement setCollection
    throw new Error('MixpeekReader.setCollection not yet implemented');
  }

  setFilters(...args) {
    this.logger.debug('MixpeekReader.setFilters called');
    // TODO: Implement setFilters
    throw new Error('MixpeekReader.setFilters not yet implemented');
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
    this.logger.info('MixpeekReader destroyed');
  }
}

export function createMixpeekReader(config) {
  return new MixpeekReader(config);
}

export { MixpeekReader };
export default { createMixpeekReader, MixpeekReader };
