/**
 * @mixpeek/azure-blob — BlobWatcher
 *
 * Watches Azure Blob containers for new/modified blobs via Event Grid subscriptions
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class BlobWatcher {
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
    if (!config.apiKey) throw new Error('apiKey is required for BlobWatcher');

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
    this.logger.info('BlobWatcher initialized');
  }

  watch(...args) {
    this.logger.debug('BlobWatcher.watch called');
    // TODO: Implement watch
    throw new Error('BlobWatcher.watch not yet implemented');
  }

  async stop(...args) {
    this.logger.debug('BlobWatcher.stop called');
    // TODO: Implement stop
    throw new Error('BlobWatcher.stop not yet implemented');
  }

  onBlob(...args) {
    this.logger.debug('BlobWatcher.onBlob called');
    // TODO: Implement onBlob
    throw new Error('BlobWatcher.onBlob not yet implemented');
  }

  async processEvent(...args) {
    this.logger.debug('BlobWatcher.processEvent called');
    // TODO: Implement processEvent
    throw new Error('BlobWatcher.processEvent not yet implemented');
  }

  getWatchedContainers(...args) {
    this.logger.debug('BlobWatcher.getWatchedContainers called');
    // TODO: Implement getWatchedContainers
    throw new Error('BlobWatcher.getWatchedContainers not yet implemented');
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
    this.logger.info('BlobWatcher destroyed');
  }
}

export function createBlobWatcher(config) {
  return new BlobWatcher(config);
}

export { BlobWatcher };
export default { createBlobWatcher, BlobWatcher };
