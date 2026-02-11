/**
 * @mixpeek/databricks — UnityConnector
 *
 * Unity Catalog integration for registering Mixpeek as an external data source
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class UnityConnector {
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
    if (!config.apiKey) throw new Error('apiKey is required for UnityConnector');

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
    this.logger.info('UnityConnector initialized');
  }

  register(...args) {
    this.logger.debug('UnityConnector.register called');
    // TODO: Implement register
    throw new Error('UnityConnector.register not yet implemented');
  }

  unregister(...args) {
    this.logger.debug('UnityConnector.unregister called');
    // TODO: Implement unregister
    throw new Error('UnityConnector.unregister not yet implemented');
  }

  createFunction(...args) {
    this.logger.debug('UnityConnector.createFunction called');
    // TODO: Implement createFunction
    throw new Error('UnityConnector.createFunction not yet implemented');
  }

  getConnection(...args) {
    this.logger.debug('UnityConnector.getConnection called');
    // TODO: Implement getConnection
    throw new Error('UnityConnector.getConnection not yet implemented');
  }

  listTables(...args) {
    this.logger.debug('UnityConnector.listTables called');
    // TODO: Implement listTables
    throw new Error('UnityConnector.listTables not yet implemented');
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
    this.logger.info('UnityConnector destroyed');
  }
}

export function createUnityConnector(config) {
  return new UnityConnector(config);
}

export { UnityConnector };
export default { createUnityConnector, UnityConnector };
