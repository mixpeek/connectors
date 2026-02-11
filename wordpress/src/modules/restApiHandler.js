/**
 * @mixpeek/wordpress — RestApiHandler
 *
 * Handles WordPress REST API events and triggers Mixpeek enrichment on content changes
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class RestApiHandler {
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
    if (!config.apiKey) throw new Error('apiKey is required for RestApiHandler');

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
    this.logger.info('RestApiHandler initialized');
  }

  async handleCreate(...args) {
    this.logger.debug('RestApiHandler.handleCreate called');
    // TODO: Implement handleCreate
    throw new Error('RestApiHandler.handleCreate not yet implemented');
  }

  async handleUpdate(...args) {
    this.logger.debug('RestApiHandler.handleUpdate called');
    // TODO: Implement handleUpdate
    throw new Error('RestApiHandler.handleUpdate not yet implemented');
  }

  async handleDelete(...args) {
    this.logger.debug('RestApiHandler.handleDelete called');
    // TODO: Implement handleDelete
    throw new Error('RestApiHandler.handleDelete not yet implemented');
  }

  registerRoutes(...args) {
    this.logger.debug('RestApiHandler.registerRoutes called');
    // TODO: Implement registerRoutes
    throw new Error('RestApiHandler.registerRoutes not yet implemented');
  }

  verifyNonce(...args) {
    this.logger.debug('RestApiHandler.verifyNonce called');
    // TODO: Implement verifyNonce
    throw new Error('RestApiHandler.verifyNonce not yet implemented');
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
    this.logger.info('RestApiHandler destroyed');
  }
}

export function createRestApiHandler(config) {
  return new RestApiHandler(config);
}

export { RestApiHandler };
export default { createRestApiHandler, RestApiHandler };
