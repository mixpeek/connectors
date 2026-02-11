/**
 * @mixpeek/aws-lambda — EventRouter
 *
 * Routes Lambda events (API Gateway, S3, SQS, EventBridge) to appropriate Mixpeek operations
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class EventRouter {
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
    if (!config.apiKey) throw new Error('apiKey is required for EventRouter');

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
    this.logger.info('EventRouter initialized');
  }

  route(...args) {
    this.logger.debug('EventRouter.route called');
    // TODO: Implement route
    throw new Error('EventRouter.route not yet implemented');
  }

  addRoute(...args) {
    this.logger.debug('EventRouter.addRoute called');
    // TODO: Implement addRoute
    throw new Error('EventRouter.addRoute not yet implemented');
  }

  removeRoute(...args) {
    this.logger.debug('EventRouter.removeRoute called');
    // TODO: Implement removeRoute
    throw new Error('EventRouter.removeRoute not yet implemented');
  }

  getRoutes(...args) {
    this.logger.debug('EventRouter.getRoutes called');
    // TODO: Implement getRoutes
    throw new Error('EventRouter.getRoutes not yet implemented');
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
    this.logger.info('EventRouter destroyed');
  }
}

export function createEventRouter(config) {
  return new EventRouter(config);
}

export { EventRouter };
export default { createEventRouter, EventRouter };
