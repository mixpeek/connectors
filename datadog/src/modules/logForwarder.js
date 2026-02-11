/**
 * @mixpeek/datadog — LogForwarder
 *
 * Forwards Mixpeek enrichment logs to Datadog Logs with structured metadata
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class LogForwarder {
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
    if (!config.apiKey) throw new Error('apiKey is required for LogForwarder');

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
    this.logger.info('LogForwarder initialized');
  }

  log(...args) {
    this.logger.debug('LogForwarder.log called');
    // TODO: Implement log
    throw new Error('LogForwarder.log not yet implemented');
  }

  error(...args) {
    this.logger.debug('LogForwarder.error called');
    // TODO: Implement error
    throw new Error('LogForwarder.error not yet implemented');
  }

  warn(...args) {
    this.logger.debug('LogForwarder.warn called');
    // TODO: Implement warn
    throw new Error('LogForwarder.warn not yet implemented');
  }

  info(...args) {
    this.logger.debug('LogForwarder.info called');
    // TODO: Implement info
    throw new Error('LogForwarder.info not yet implemented');
  }

  setTags(...args) {
    this.logger.debug('LogForwarder.setTags called');
    // TODO: Implement setTags
    throw new Error('LogForwarder.setTags not yet implemented');
  }

  async flush(...args) {
    this.logger.debug('LogForwarder.flush called');
    // TODO: Implement flush
    throw new Error('LogForwarder.flush not yet implemented');
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
    this.logger.info('LogForwarder destroyed');
  }
}

export function createLogForwarder(config) {
  return new LogForwarder(config);
}

export { LogForwarder };
export default { createLogForwarder, LogForwarder };
