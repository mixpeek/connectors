/**
 * @mixpeek/aws-s3 — S3Watcher
 *
 * Watches S3 buckets for new/modified objects and triggers Mixpeek enrichment
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class S3Watcher {
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
    if (!config.apiKey) throw new Error('apiKey is required for S3Watcher');

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
    this.logger.info('S3Watcher initialized');
  }

  watch(...args) {
    this.logger.debug('S3Watcher.watch called');
    // TODO: Implement watch
    throw new Error('S3Watcher.watch not yet implemented');
  }

  async stop(...args) {
    this.logger.debug('S3Watcher.stop called');
    // TODO: Implement stop
    throw new Error('S3Watcher.stop not yet implemented');
  }

  onObject(...args) {
    this.logger.debug('S3Watcher.onObject called');
    // TODO: Implement onObject
    throw new Error('S3Watcher.onObject not yet implemented');
  }

  async processEvent(...args) {
    this.logger.debug('S3Watcher.processEvent called');
    // TODO: Implement processEvent
    throw new Error('S3Watcher.processEvent not yet implemented');
  }

  getWatchedBuckets(...args) {
    this.logger.debug('S3Watcher.getWatchedBuckets called');
    // TODO: Implement getWatchedBuckets
    throw new Error('S3Watcher.getWatchedBuckets not yet implemented');
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
    this.logger.info('S3Watcher destroyed');
  }
}

export function createS3Watcher(config) {
  return new S3Watcher(config);
}

export { S3Watcher };
export default { createS3Watcher, S3Watcher };
