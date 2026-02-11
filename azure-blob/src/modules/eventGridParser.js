/**
 * @mixpeek/azure-blob — EventGridParser
 *
 * Parses Azure Event Grid events into normalized blob event objects
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class EventGridParser {
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
    if (!config.apiKey) throw new Error('apiKey is required for EventGridParser');

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
    this.logger.info('EventGridParser initialized');
  }

  parse(...args) {
    this.logger.debug('EventGridParser.parse called');
    // TODO: Implement parse
    throw new Error('EventGridParser.parse not yet implemented');
  }

  parseRecord(...args) {
    this.logger.debug('EventGridParser.parseRecord called');
    // TODO: Implement parseRecord
    throw new Error('EventGridParser.parseRecord not yet implemented');
  }

  isSupported(...args) {
    this.logger.debug('EventGridParser.isSupported called');
    // TODO: Implement isSupported
    throw new Error('EventGridParser.isSupported not yet implemented');
  }

  getBlobName(...args) {
    this.logger.debug('EventGridParser.getBlobName called');
    // TODO: Implement getBlobName
    throw new Error('EventGridParser.getBlobName not yet implemented');
  }

  getContainerName(...args) {
    this.logger.debug('EventGridParser.getContainerName called');
    // TODO: Implement getContainerName
    throw new Error('EventGridParser.getContainerName not yet implemented');
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
    this.logger.info('EventGridParser destroyed');
  }
}

export function createEventGridParser(config) {
  return new EventGridParser(config);
}

export { EventGridParser };
export default { createEventGridParser, EventGridParser };
