/**
 * @mixpeek/strapi — StrapiLifecycle
 *
 * Hooks into Strapi content lifecycle events (beforeCreate, afterUpdate) for enrichment
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class StrapiLifecycle {
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
    if (!config.apiKey) throw new Error('apiKey is required for StrapiLifecycle');

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
    this.logger.info('StrapiLifecycle initialized');
  }

  register(...args) {
    this.logger.debug('StrapiLifecycle.register called');
    // TODO: Implement register
    throw new Error('StrapiLifecycle.register not yet implemented');
  }

  beforeCreate(...args) {
    this.logger.debug('StrapiLifecycle.beforeCreate called');
    // TODO: Implement beforeCreate
    throw new Error('StrapiLifecycle.beforeCreate not yet implemented');
  }

  afterCreate(...args) {
    this.logger.debug('StrapiLifecycle.afterCreate called');
    // TODO: Implement afterCreate
    throw new Error('StrapiLifecycle.afterCreate not yet implemented');
  }

  afterUpdate(...args) {
    this.logger.debug('StrapiLifecycle.afterUpdate called');
    // TODO: Implement afterUpdate
    throw new Error('StrapiLifecycle.afterUpdate not yet implemented');
  }

  afterDelete(...args) {
    this.logger.debug('StrapiLifecycle.afterDelete called');
    // TODO: Implement afterDelete
    throw new Error('StrapiLifecycle.afterDelete not yet implemented');
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
    this.logger.info('StrapiLifecycle destroyed');
  }
}

export function createStrapiLifecycle(config) {
  return new StrapiLifecycle(config);
}

export { StrapiLifecycle };
export default { createStrapiLifecycle, StrapiLifecycle };
