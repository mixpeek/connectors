/**
 * @mixpeek/strapi — PluginConfig
 *
 * Strapi plugin configuration and registration for Mixpeek integration
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class PluginConfig {
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
    if (!config.apiKey) throw new Error('apiKey is required for PluginConfig');

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
    this.logger.info('PluginConfig initialized');
  }

  register(...args) {
    this.logger.debug('PluginConfig.register called');
    // TODO: Implement register
    throw new Error('PluginConfig.register not yet implemented');
  }

  bootstrap(...args) {
    this.logger.debug('PluginConfig.bootstrap called');
    // TODO: Implement bootstrap
    throw new Error('PluginConfig.bootstrap not yet implemented');
  }

  getConfig(...args) {
    this.logger.debug('PluginConfig.getConfig called');
    // TODO: Implement getConfig
    throw new Error('PluginConfig.getConfig not yet implemented');
  }

  setConfig(...args) {
    this.logger.debug('PluginConfig.setConfig called');
    // TODO: Implement setConfig
    throw new Error('PluginConfig.setConfig not yet implemented');
  }

  validate(...args) {
    this.logger.debug('PluginConfig.validate called');
    // TODO: Implement validate
    throw new Error('PluginConfig.validate not yet implemented');
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
    this.logger.info('PluginConfig destroyed');
  }
}

export function createPluginConfig(config) {
  return new PluginConfig(config);
}

export { PluginConfig };
export default { createPluginConfig, PluginConfig };
