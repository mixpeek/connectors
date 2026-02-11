/**
 * @mixpeek/kafka — KafkaConsumer
 *
 * Consumes Kafka messages and triggers Mixpeek enrichment for each event
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class KafkaConsumer {
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
    if (!config.apiKey) throw new Error('apiKey is required for KafkaConsumer');

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
    this.logger.info('KafkaConsumer initialized');
  }

  async subscribe(...args) {
    this.logger.debug('KafkaConsumer.subscribe called');
    // TODO: Implement subscribe
    throw new Error('KafkaConsumer.subscribe not yet implemented');
  }

  async start(...args) {
    this.logger.debug('KafkaConsumer.start called');
    // TODO: Implement start
    throw new Error('KafkaConsumer.start not yet implemented');
  }

  async stop(...args) {
    this.logger.debug('KafkaConsumer.stop called');
    // TODO: Implement stop
    throw new Error('KafkaConsumer.stop not yet implemented');
  }

  pause(...args) {
    this.logger.debug('KafkaConsumer.pause called');
    // TODO: Implement pause
    throw new Error('KafkaConsumer.pause not yet implemented');
  }

  resume(...args) {
    this.logger.debug('KafkaConsumer.resume called');
    // TODO: Implement resume
    throw new Error('KafkaConsumer.resume not yet implemented');
  }

  getStatus(...args) {
    this.logger.debug('KafkaConsumer.getStatus called');
    // TODO: Implement getStatus
    throw new Error('KafkaConsumer.getStatus not yet implemented');
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
    this.logger.info('KafkaConsumer destroyed');
  }
}

export function createKafkaConsumer(config) {
  return new KafkaConsumer(config);
}

export { KafkaConsumer };
export default { createKafkaConsumer, KafkaConsumer };
