/**
 * @mixpeek/langchain — MixpeekTool
 *
 * LangChain Tool for agents to search and enrich content via Mixpeek
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MixpeekTool {
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
    if (!config.apiKey) throw new Error('apiKey is required for MixpeekTool');

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
    this.logger.info('MixpeekTool initialized');
  }

  async call(...args) {
    this.logger.debug('MixpeekTool.call called');
    // TODO: Implement call
    throw new Error('MixpeekTool.call not yet implemented');
  }

  async invoke(...args) {
    this.logger.debug('MixpeekTool.invoke called');
    // TODO: Implement invoke
    throw new Error('MixpeekTool.invoke not yet implemented');
  }

  getDescription(...args) {
    this.logger.debug('MixpeekTool.getDescription called');
    // TODO: Implement getDescription
    throw new Error('MixpeekTool.getDescription not yet implemented');
  }

  getSchema(...args) {
    this.logger.debug('MixpeekTool.getSchema called');
    // TODO: Implement getSchema
    throw new Error('MixpeekTool.getSchema not yet implemented');
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
    this.logger.info('MixpeekTool destroyed');
  }
}

export function createMixpeekTool(config) {
  return new MixpeekTool(config);
}

export { MixpeekTool };
export default { createMixpeekTool, MixpeekTool };
