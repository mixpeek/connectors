/**
 * @mixpeek/snowflake — ExternalFunction
 *
 * Implements Snowflake external function interface for calling Mixpeek from SQL
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ExternalFunction {
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
    if (!config.apiKey) throw new Error('apiKey is required for ExternalFunction');

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
    this.logger.info('ExternalFunction initialized');
  }

  async handler(...args) {
    this.logger.debug('ExternalFunction.handler called');
    // TODO: Implement handler
    throw new Error('ExternalFunction.handler not yet implemented');
  }

  validate(...args) {
    this.logger.debug('ExternalFunction.validate called');
    // TODO: Implement validate
    throw new Error('ExternalFunction.validate not yet implemented');
  }

  formatResponse(...args) {
    this.logger.debug('ExternalFunction.formatResponse called');
    // TODO: Implement formatResponse
    throw new Error('ExternalFunction.formatResponse not yet implemented');
  }

  getDefinition(...args) {
    this.logger.debug('ExternalFunction.getDefinition called');
    // TODO: Implement getDefinition
    throw new Error('ExternalFunction.getDefinition not yet implemented');
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
    this.logger.info('ExternalFunction destroyed');
  }
}

export function createExternalFunction(config) {
  return new ExternalFunction(config);
}

export { ExternalFunction };
export default { createExternalFunction, ExternalFunction };
