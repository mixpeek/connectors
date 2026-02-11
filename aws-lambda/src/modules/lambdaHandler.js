/**
 * @mixpeek/aws-lambda — LambdaHandler
 *
 * Wraps Mixpeek enrichment in an AWS Lambda handler with cold start optimization
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class LambdaHandler {
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
    if (!config.apiKey) throw new Error('apiKey is required for LambdaHandler');

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
    this.logger.info('LambdaHandler initialized');
  }

  async handler(...args) {
    this.logger.debug('LambdaHandler.handler called');
    // TODO: Implement handler
    throw new Error('LambdaHandler.handler not yet implemented');
  }

  warmup(...args) {
    this.logger.debug('LambdaHandler.warmup called');
    // TODO: Implement warmup
    throw new Error('LambdaHandler.warmup not yet implemented');
  }

  configure(...args) {
    this.logger.debug('LambdaHandler.configure called');
    // TODO: Implement configure
    throw new Error('LambdaHandler.configure not yet implemented');
  }

  getMetrics(...args) {
    this.logger.debug('LambdaHandler.getMetrics called');
    // TODO: Implement getMetrics
    throw new Error('LambdaHandler.getMetrics not yet implemented');
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
    this.logger.info('LambdaHandler destroyed');
  }
}

export function createLambdaHandler(config) {
  return new LambdaHandler(config);
}

export { LambdaHandler };
export default { createLambdaHandler, LambdaHandler };
