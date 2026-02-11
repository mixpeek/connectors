/**
 * @mixpeek/pagerduty — IncidentFormatter
 *
 * Formats Mixpeek errors and degradations into PagerDuty incident payloads
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class IncidentFormatter {
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
    if (!config.apiKey) throw new Error('apiKey is required for IncidentFormatter');

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
    this.logger.info('IncidentFormatter initialized');
  }

  formatIncident(...args) {
    this.logger.debug('IncidentFormatter.formatIncident called');
    // TODO: Implement formatIncident
    throw new Error('IncidentFormatter.formatIncident not yet implemented');
  }

  formatChange(...args) {
    this.logger.debug('IncidentFormatter.formatChange called');
    // TODO: Implement formatChange
    throw new Error('IncidentFormatter.formatChange not yet implemented');
  }

  addCustomDetails(...args) {
    this.logger.debug('IncidentFormatter.addCustomDetails called');
    // TODO: Implement addCustomDetails
    throw new Error('IncidentFormatter.addCustomDetails not yet implemented');
  }

  setSeverity(...args) {
    this.logger.debug('IncidentFormatter.setSeverity called');
    // TODO: Implement setSeverity
    throw new Error('IncidentFormatter.setSeverity not yet implemented');
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
    this.logger.info('IncidentFormatter destroyed');
  }
}

export function createIncidentFormatter(config) {
  return new IncidentFormatter(config);
}

export { IncidentFormatter };
export default { createIncidentFormatter, IncidentFormatter };
