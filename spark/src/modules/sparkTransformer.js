/**
 * @mixpeek/spark — SparkTransformer
 *
 * Spark UDF/transformer that applies Mixpeek enrichment to DataFrame columns
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class SparkTransformer {
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
    if (!config.apiKey) throw new Error('apiKey is required for SparkTransformer');

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
    this.logger.info('SparkTransformer initialized');
  }

  transform(...args) {
    this.logger.debug('SparkTransformer.transform called');
    // TODO: Implement transform
    throw new Error('SparkTransformer.transform not yet implemented');
  }

  createUDF(...args) {
    this.logger.debug('SparkTransformer.createUDF called');
    // TODO: Implement createUDF
    throw new Error('SparkTransformer.createUDF not yet implemented');
  }

  registerUDF(...args) {
    this.logger.debug('SparkTransformer.registerUDF called');
    // TODO: Implement registerUDF
    throw new Error('SparkTransformer.registerUDF not yet implemented');
  }

  setInputColumn(...args) {
    this.logger.debug('SparkTransformer.setInputColumn called');
    // TODO: Implement setInputColumn
    throw new Error('SparkTransformer.setInputColumn not yet implemented');
  }

  setOutputColumn(...args) {
    this.logger.debug('SparkTransformer.setOutputColumn called');
    // TODO: Implement setOutputColumn
    throw new Error('SparkTransformer.setOutputColumn not yet implemented');
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
    this.logger.info('SparkTransformer destroyed');
  }
}

export function createSparkTransformer(config) {
  return new SparkTransformer(config);
}

export { SparkTransformer };
export default { createSparkTransformer, SparkTransformer };
