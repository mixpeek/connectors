/**
 * @mixpeek/wordpress — HookManager
 *
 * Manages WordPress action/filter hooks for automatic Mixpeek enrichment on publish
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class HookManager {
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
    if (!config.apiKey) throw new Error('apiKey is required for HookManager');

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
    this.logger.info('HookManager initialized');
  }

  addAction(...args) {
    this.logger.debug('HookManager.addAction called');
    // TODO: Implement addAction
    throw new Error('HookManager.addAction not yet implemented');
  }

  removeAction(...args) {
    this.logger.debug('HookManager.removeAction called');
    // TODO: Implement removeAction
    throw new Error('HookManager.removeAction not yet implemented');
  }

  addFilter(...args) {
    this.logger.debug('HookManager.addFilter called');
    // TODO: Implement addFilter
    throw new Error('HookManager.addFilter not yet implemented');
  }

  removeFilter(...args) {
    this.logger.debug('HookManager.removeFilter called');
    // TODO: Implement removeFilter
    throw new Error('HookManager.removeFilter not yet implemented');
  }

  getRegistered(...args) {
    this.logger.debug('HookManager.getRegistered called');
    // TODO: Implement getRegistered
    throw new Error('HookManager.getRegistered not yet implemented');
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
    this.logger.info('HookManager destroyed');
  }
}

export function createHookManager(config) {
  return new HookManager(config);
}

export { HookManager };
export default { createHookManager, HookManager };
