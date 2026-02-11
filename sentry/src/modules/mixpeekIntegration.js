/**
 * @mixpeek/sentry — MixpeekIntegration
 *
 * Sentry SDK integration class for automatic Mixpeek instrumentation
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class MixpeekIntegration {
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
    if (!config.apiKey) throw new Error('apiKey is required for MixpeekIntegration');

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
    this.logger.info('MixpeekIntegration initialized');
  }

  setupOnce(...args) {
    this.logger.debug('MixpeekIntegration.setupOnce called');
    // TODO: Implement setupOnce
    throw new Error('MixpeekIntegration.setupOnce not yet implemented');
  }

  install(...args) {
    this.logger.debug('MixpeekIntegration.install called');
    // TODO: Implement install
    throw new Error('MixpeekIntegration.install not yet implemented');
  }

  uninstall(...args) {
    this.logger.debug('MixpeekIntegration.uninstall called');
    // TODO: Implement uninstall
    throw new Error('MixpeekIntegration.uninstall not yet implemented');
  }

  getOptions(...args) {
    this.logger.debug('MixpeekIntegration.getOptions called');
    // TODO: Implement getOptions
    throw new Error('MixpeekIntegration.getOptions not yet implemented');
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
    this.logger.info('MixpeekIntegration destroyed');
  }
}

export function createMixpeekIntegration(config) {
  return new MixpeekIntegration(config);
}

export { MixpeekIntegration };
export default { createMixpeekIntegration, MixpeekIntegration };
