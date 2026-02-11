/**
 * @mixpeek/gcs — GCSEventParser
 *
 * Parses GCS event notifications (Pub/Sub, Eventarc) into normalized objects
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class GCSEventParser {
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
    if (!config.apiKey) throw new Error('apiKey is required for GCSEventParser');

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
    this.logger.info('GCSEventParser initialized');
  }

  parse(...args) {
    this.logger.debug('GCSEventParser.parse called');
    // TODO: Implement parse
    throw new Error('GCSEventParser.parse not yet implemented');
  }

  parseRecord(...args) {
    this.logger.debug('GCSEventParser.parseRecord called');
    // TODO: Implement parseRecord
    throw new Error('GCSEventParser.parseRecord not yet implemented');
  }

  isSupported(...args) {
    this.logger.debug('GCSEventParser.isSupported called');
    // TODO: Implement isSupported
    throw new Error('GCSEventParser.isSupported not yet implemented');
  }

  getObjectName(...args) {
    this.logger.debug('GCSEventParser.getObjectName called');
    // TODO: Implement getObjectName
    throw new Error('GCSEventParser.getObjectName not yet implemented');
  }

  getBucketName(...args) {
    this.logger.debug('GCSEventParser.getBucketName called');
    // TODO: Implement getBucketName
    throw new Error('GCSEventParser.getBucketName not yet implemented');
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
    this.logger.info('GCSEventParser destroyed');
  }
}

export function createGCSEventParser(config) {
  return new GCSEventParser(config);
}

export { GCSEventParser };
export default { createGCSEventParser, GCSEventParser };
