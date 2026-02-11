/**
 * @mixpeek/langchain — MixpeekDocumentLoader
 *
 * LangChain DocumentLoader that loads and enriches documents from Mixpeek collections
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MixpeekDocumentLoader {
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
    if (!config.apiKey) throw new Error('apiKey is required for MixpeekDocumentLoader');

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
    this.logger.info('MixpeekDocumentLoader initialized');
  }

  async load(...args) {
    this.logger.debug('MixpeekDocumentLoader.load called');
    // TODO: Implement load
    throw new Error('MixpeekDocumentLoader.load not yet implemented');
  }

  async loadAndSplit(...args) {
    this.logger.debug('MixpeekDocumentLoader.loadAndSplit called');
    // TODO: Implement loadAndSplit
    throw new Error('MixpeekDocumentLoader.loadAndSplit not yet implemented');
  }

  setCollection(...args) {
    this.logger.debug('MixpeekDocumentLoader.setCollection called');
    // TODO: Implement setCollection
    throw new Error('MixpeekDocumentLoader.setCollection not yet implemented');
  }

  setFilters(...args) {
    this.logger.debug('MixpeekDocumentLoader.setFilters called');
    // TODO: Implement setFilters
    throw new Error('MixpeekDocumentLoader.setFilters not yet implemented');
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
    this.logger.info('MixpeekDocumentLoader destroyed');
  }
}

export function createMixpeekDocumentLoader(config) {
  return new MixpeekDocumentLoader(config);
}

export { MixpeekDocumentLoader };
export default { createMixpeekDocumentLoader, MixpeekDocumentLoader };
