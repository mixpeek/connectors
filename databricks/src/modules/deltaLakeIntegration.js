/**
 * @mixpeek/databricks — DeltaLakeIntegration
 *
 * Reads from and writes enrichment results to Delta Lake tables
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class DeltaLakeIntegration {
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
    if (!config.apiKey) throw new Error('apiKey is required for DeltaLakeIntegration');

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
    this.logger.info('DeltaLakeIntegration initialized');
  }

  async readTable(...args) {
    this.logger.debug('DeltaLakeIntegration.readTable called');
    // TODO: Implement readTable
    throw new Error('DeltaLakeIntegration.readTable not yet implemented');
  }

  async writeTable(...args) {
    this.logger.debug('DeltaLakeIntegration.writeTable called');
    // TODO: Implement writeTable
    throw new Error('DeltaLakeIntegration.writeTable not yet implemented');
  }

  async mergeTable(...args) {
    this.logger.debug('DeltaLakeIntegration.mergeTable called');
    // TODO: Implement mergeTable
    throw new Error('DeltaLakeIntegration.mergeTable not yet implemented');
  }

  getSchema(...args) {
    this.logger.debug('DeltaLakeIntegration.getSchema called');
    // TODO: Implement getSchema
    throw new Error('DeltaLakeIntegration.getSchema not yet implemented');
  }

  setTable(...args) {
    this.logger.debug('DeltaLakeIntegration.setTable called');
    // TODO: Implement setTable
    throw new Error('DeltaLakeIntegration.setTable not yet implemented');
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
    this.logger.info('DeltaLakeIntegration destroyed');
  }
}

export function createDeltaLakeIntegration(config) {
  return new DeltaLakeIntegration(config);
}

export { DeltaLakeIntegration };
export default { createDeltaLakeIntegration, DeltaLakeIntegration };
