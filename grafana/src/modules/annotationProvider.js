/**
 * @mixpeek/grafana — AnnotationProvider
 *
 * Provides Grafana annotations for Mixpeek enrichment events
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class AnnotationProvider {
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
    if (!config.apiKey) throw new Error('apiKey is required for AnnotationProvider');

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
    this.logger.info('AnnotationProvider initialized');
  }

  async createAnnotation(...args) {
    this.logger.debug('AnnotationProvider.createAnnotation called');
    // TODO: Implement createAnnotation
    throw new Error('AnnotationProvider.createAnnotation not yet implemented');
  }

  async queryAnnotations(...args) {
    this.logger.debug('AnnotationProvider.queryAnnotations called');
    // TODO: Implement queryAnnotations
    throw new Error('AnnotationProvider.queryAnnotations not yet implemented');
  }

  async deleteAnnotation(...args) {
    this.logger.debug('AnnotationProvider.deleteAnnotation called');
    // TODO: Implement deleteAnnotation
    throw new Error('AnnotationProvider.deleteAnnotation not yet implemented');
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
    this.logger.info('AnnotationProvider destroyed');
  }
}

export function createAnnotationProvider(config) {
  return new AnnotationProvider(config);
}

export { AnnotationProvider };
export default { createAnnotationProvider, AnnotationProvider };
