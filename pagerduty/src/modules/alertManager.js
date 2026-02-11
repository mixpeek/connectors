/**
 * @mixpeek/pagerduty — AlertManager
 *
 * Manages PagerDuty alerts based on Mixpeek enrichment pipeline status
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class AlertManager {
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
    if (!config.apiKey) throw new Error('apiKey is required for AlertManager');

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
    this.logger.info('AlertManager initialized');
  }

  async trigger(...args) {
    this.logger.debug('AlertManager.trigger called');
    // TODO: Implement trigger
    throw new Error('AlertManager.trigger not yet implemented');
  }

  async acknowledge(...args) {
    this.logger.debug('AlertManager.acknowledge called');
    // TODO: Implement acknowledge
    throw new Error('AlertManager.acknowledge not yet implemented');
  }

  async resolve(...args) {
    this.logger.debug('AlertManager.resolve called');
    // TODO: Implement resolve
    throw new Error('AlertManager.resolve not yet implemented');
  }

  getOpenAlerts(...args) {
    this.logger.debug('AlertManager.getOpenAlerts called');
    // TODO: Implement getOpenAlerts
    throw new Error('AlertManager.getOpenAlerts not yet implemented');
  }

  setRoutingKey(...args) {
    this.logger.debug('AlertManager.setRoutingKey called');
    // TODO: Implement setRoutingKey
    throw new Error('AlertManager.setRoutingKey not yet implemented');
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
    this.logger.info('AlertManager destroyed');
  }
}

export function createAlertManager(config) {
  return new AlertManager(config);
}

export { AlertManager };
export default { createAlertManager, AlertManager };
