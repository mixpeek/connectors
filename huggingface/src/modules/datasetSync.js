/**
 * @mixpeek/huggingface — DatasetSync
 *
 * Syncs Mixpeek collections with Hugging Face datasets for training/evaluation
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class DatasetSync {
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
    if (!config.apiKey) throw new Error('apiKey is required for DatasetSync');

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
    this.logger.info('DatasetSync initialized');
  }

  async exportToDataset(...args) {
    this.logger.debug('DatasetSync.exportToDataset called');
    // TODO: Implement exportToDataset
    throw new Error('DatasetSync.exportToDataset not yet implemented');
  }

  async importFromDataset(...args) {
    this.logger.debug('DatasetSync.importFromDataset called');
    // TODO: Implement importFromDataset
    throw new Error('DatasetSync.importFromDataset not yet implemented');
  }

  async sync(...args) {
    this.logger.debug('DatasetSync.sync called');
    // TODO: Implement sync
    throw new Error('DatasetSync.sync not yet implemented');
  }

  getStatus(...args) {
    this.logger.debug('DatasetSync.getStatus called');
    // TODO: Implement getStatus
    throw new Error('DatasetSync.getStatus not yet implemented');
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
    this.logger.info('DatasetSync destroyed');
  }
}

export function createDatasetSync(config) {
  return new DatasetSync(config);
}

export { DatasetSync };
export default { createDatasetSync, DatasetSync };
