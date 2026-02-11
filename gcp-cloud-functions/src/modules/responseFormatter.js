/**
 * @mixpeek/gcp-functions — ResponseFormatter
 *
 * Formats Mixpeek enrichment results into Cloud Functions response objects
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ResponseFormatter {
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
    if (!config.apiKey) throw new Error('apiKey is required for ResponseFormatter');

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
    this.logger.info('ResponseFormatter initialized');
  }

  formatHttp(...args) {
    this.logger.debug('ResponseFormatter.formatHttp called');
    // TODO: Implement formatHttp
    throw new Error('ResponseFormatter.formatHttp not yet implemented');
  }

  formatJson(...args) {
    this.logger.debug('ResponseFormatter.formatJson called');
    // TODO: Implement formatJson
    throw new Error('ResponseFormatter.formatJson not yet implemented');
  }

  formatError(...args) {
    this.logger.debug('ResponseFormatter.formatError called');
    // TODO: Implement formatError
    throw new Error('ResponseFormatter.formatError not yet implemented');
  }

  formatBatch(...args) {
    this.logger.debug('ResponseFormatter.formatBatch called');
    // TODO: Implement formatBatch
    throw new Error('ResponseFormatter.formatBatch not yet implemented');
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
    this.logger.info('ResponseFormatter destroyed');
  }
}

export function createResponseFormatter(config) {
  return new ResponseFormatter(config);
}

export { ResponseFormatter };
export default { createResponseFormatter, ResponseFormatter };
