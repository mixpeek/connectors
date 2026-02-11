/**
 * @mixpeek/snowflake — StreamProcessor
 *
 * Processes Snowflake streams/tasks to enrich new and changed data via Mixpeek
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class StreamProcessor {
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
    if (!config.apiKey) throw new Error('apiKey is required for StreamProcessor');

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
    this.logger.info('StreamProcessor initialized');
  }

  async processStream(...args) {
    this.logger.debug('StreamProcessor.processStream called');
    // TODO: Implement processStream
    throw new Error('StreamProcessor.processStream not yet implemented');
  }

  async createTask(...args) {
    this.logger.debug('StreamProcessor.createTask called');
    // TODO: Implement createTask
    throw new Error('StreamProcessor.createTask not yet implemented');
  }

  async start(...args) {
    this.logger.debug('StreamProcessor.start called');
    // TODO: Implement start
    throw new Error('StreamProcessor.start not yet implemented');
  }

  async stop(...args) {
    this.logger.debug('StreamProcessor.stop called');
    // TODO: Implement stop
    throw new Error('StreamProcessor.stop not yet implemented');
  }

  getStatus(...args) {
    this.logger.debug('StreamProcessor.getStatus called');
    // TODO: Implement getStatus
    throw new Error('StreamProcessor.getStatus not yet implemented');
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
    this.logger.info('StreamProcessor destroyed');
  }
}

export function createStreamProcessor(config) {
  return new StreamProcessor(config);
}

export { StreamProcessor };
export default { createStreamProcessor, StreamProcessor };
