/**
 * @mixpeek/gcp-functions — FunctionHandler
 *
 * Wraps Mixpeek enrichment in a Cloud Functions handler with cold start optimization
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class FunctionHandler {
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
    if (!config.apiKey) throw new Error('apiKey is required for FunctionHandler');

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
    this.logger.info('FunctionHandler initialized');
  }

  async httpHandler(...args) {
    this.logger.debug('FunctionHandler.httpHandler called');
    // TODO: Implement httpHandler
    throw new Error('FunctionHandler.httpHandler not yet implemented');
  }

  async eventHandler(...args) {
    this.logger.debug('FunctionHandler.eventHandler called');
    // TODO: Implement eventHandler
    throw new Error('FunctionHandler.eventHandler not yet implemented');
  }

  configure(...args) {
    this.logger.debug('FunctionHandler.configure called');
    // TODO: Implement configure
    throw new Error('FunctionHandler.configure not yet implemented');
  }

  getMetrics(...args) {
    this.logger.debug('FunctionHandler.getMetrics called');
    // TODO: Implement getMetrics
    throw new Error('FunctionHandler.getMetrics not yet implemented');
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
    this.logger.info('FunctionHandler destroyed');
  }
}

export function createFunctionHandler(config) {
  return new FunctionHandler(config);
}

export { FunctionHandler };
export default { createFunctionHandler, FunctionHandler };
