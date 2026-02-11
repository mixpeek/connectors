/**
 * @mixpeek/gcs — GCSWatcher
 *
 * Watches GCS buckets for new/modified objects via Pub/Sub notifications
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class GCSWatcher {
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
    if (!config.apiKey) throw new Error('apiKey is required for GCSWatcher');

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
    this.logger.info('GCSWatcher initialized');
  }

  watch(...args) {
    this.logger.debug('GCSWatcher.watch called');
    // TODO: Implement watch
    throw new Error('GCSWatcher.watch not yet implemented');
  }

  async stop(...args) {
    this.logger.debug('GCSWatcher.stop called');
    // TODO: Implement stop
    throw new Error('GCSWatcher.stop not yet implemented');
  }

  onObject(...args) {
    this.logger.debug('GCSWatcher.onObject called');
    // TODO: Implement onObject
    throw new Error('GCSWatcher.onObject not yet implemented');
  }

  async processNotification(...args) {
    this.logger.debug('GCSWatcher.processNotification called');
    // TODO: Implement processNotification
    throw new Error('GCSWatcher.processNotification not yet implemented');
  }

  getWatchedBuckets(...args) {
    this.logger.debug('GCSWatcher.getWatchedBuckets called');
    // TODO: Implement getWatchedBuckets
    throw new Error('GCSWatcher.getWatchedBuckets not yet implemented');
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
    this.logger.info('GCSWatcher destroyed');
  }
}

export function createGCSWatcher(config) {
  return new GCSWatcher(config);
}

export { GCSWatcher };
export default { createGCSWatcher, GCSWatcher };
