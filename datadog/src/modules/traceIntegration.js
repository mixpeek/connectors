/**
 * @mixpeek/datadog — TraceIntegration
 *
 * Integrates Mixpeek enrichment spans into Datadog APM traces
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class TraceIntegration {
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
    if (!config.apiKey) throw new Error('apiKey is required for TraceIntegration');

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
    this.logger.info('TraceIntegration initialized');
  }

  async startSpan(...args) {
    this.logger.debug('TraceIntegration.startSpan called');
    // TODO: Implement startSpan
    throw new Error('TraceIntegration.startSpan not yet implemented');
  }

  finishSpan(...args) {
    this.logger.debug('TraceIntegration.finishSpan called');
    // TODO: Implement finishSpan
    throw new Error('TraceIntegration.finishSpan not yet implemented');
  }

  addTags(...args) {
    this.logger.debug('TraceIntegration.addTags called');
    // TODO: Implement addTags
    throw new Error('TraceIntegration.addTags not yet implemented');
  }

  setError(...args) {
    this.logger.debug('TraceIntegration.setError called');
    // TODO: Implement setError
    throw new Error('TraceIntegration.setError not yet implemented');
  }

  getCurrentTrace(...args) {
    this.logger.debug('TraceIntegration.getCurrentTrace called');
    // TODO: Implement getCurrentTrace
    throw new Error('TraceIntegration.getCurrentTrace not yet implemented');
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
    this.logger.info('TraceIntegration destroyed');
  }
}

export function createTraceIntegration(config) {
  return new TraceIntegration(config);
}

export { TraceIntegration };
export default { createTraceIntegration, TraceIntegration };
