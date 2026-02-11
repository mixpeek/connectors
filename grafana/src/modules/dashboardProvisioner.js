/**
 * @mixpeek/grafana — DashboardProvisioner
 *
 * Generates and provisions Grafana dashboards for Mixpeek monitoring
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class DashboardProvisioner {
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
    if (!config.apiKey) throw new Error('apiKey is required for DashboardProvisioner');

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
    this.logger.info('DashboardProvisioner initialized');
  }

  async createDashboard(...args) {
    this.logger.debug('DashboardProvisioner.createDashboard called');
    // TODO: Implement createDashboard
    throw new Error('DashboardProvisioner.createDashboard not yet implemented');
  }

  async updateDashboard(...args) {
    this.logger.debug('DashboardProvisioner.updateDashboard called');
    // TODO: Implement updateDashboard
    throw new Error('DashboardProvisioner.updateDashboard not yet implemented');
  }

  async deleteDashboard(...args) {
    this.logger.debug('DashboardProvisioner.deleteDashboard called');
    // TODO: Implement deleteDashboard
    throw new Error('DashboardProvisioner.deleteDashboard not yet implemented');
  }

  exportJson(...args) {
    this.logger.debug('DashboardProvisioner.exportJson called');
    // TODO: Implement exportJson
    throw new Error('DashboardProvisioner.exportJson not yet implemented');
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
    this.logger.info('DashboardProvisioner destroyed');
  }
}

export function createDashboardProvisioner(config) {
  return new DashboardProvisioner(config);
}

export { DashboardProvisioner };
export default { createDashboardProvisioner, DashboardProvisioner };
