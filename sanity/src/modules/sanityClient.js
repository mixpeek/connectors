/**
 * @mixpeek/sanity — SanityClient
 *
 * Sanity client wrapper for reading/writing enrichment data via GROQ and mutations
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class SanityClient {
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
    if (!config.apiKey) throw new Error('apiKey is required for SanityClient');

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
    this.logger.info('SanityClient initialized');
  }

  async fetch(...args) {
    this.logger.debug('SanityClient.fetch called');
    // TODO: Implement fetch
    throw new Error('SanityClient.fetch not yet implemented');
  }

  async getDocument(...args) {
    this.logger.debug('SanityClient.getDocument called');
    // TODO: Implement getDocument
    throw new Error('SanityClient.getDocument not yet implemented');
  }

  async patchDocument(...args) {
    this.logger.debug('SanityClient.patchDocument called');
    // TODO: Implement patchDocument
    throw new Error('SanityClient.patchDocument not yet implemented');
  }

  async createDocument(...args) {
    this.logger.debug('SanityClient.createDocument called');
    // TODO: Implement createDocument
    throw new Error('SanityClient.createDocument not yet implemented');
  }

  async query(...args) {
    this.logger.debug('SanityClient.query called');
    // TODO: Implement query
    throw new Error('SanityClient.query not yet implemented');
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
    this.logger.info('SanityClient destroyed');
  }
}

export function createSanityClient(config) {
  return new SanityClient(config);
}

export { SanityClient };
export default { createSanityClient, SanityClient };
