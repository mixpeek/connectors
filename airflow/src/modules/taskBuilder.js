/**
 * @mixpeek/airflow — TaskBuilder
 *
 * Fluent builder for creating Mixpeek enrichment tasks within Airflow DAGs
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class TaskBuilder {
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
    if (!config.apiKey) throw new Error('apiKey is required for TaskBuilder');

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
    this.logger.info('TaskBuilder initialized');
  }

  withCollection(...args) {
    this.logger.debug('TaskBuilder.withCollection called');
    // TODO: Implement withCollection
    throw new Error('TaskBuilder.withCollection not yet implemented');
  }

  withNamespace(...args) {
    this.logger.debug('TaskBuilder.withNamespace called');
    // TODO: Implement withNamespace
    throw new Error('TaskBuilder.withNamespace not yet implemented');
  }

  withFilters(...args) {
    this.logger.debug('TaskBuilder.withFilters called');
    // TODO: Implement withFilters
    throw new Error('TaskBuilder.withFilters not yet implemented');
  }

  withCallback(...args) {
    this.logger.debug('TaskBuilder.withCallback called');
    // TODO: Implement withCallback
    throw new Error('TaskBuilder.withCallback not yet implemented');
  }

  build(...args) {
    this.logger.debug('TaskBuilder.build called');
    // TODO: Implement build
    throw new Error('TaskBuilder.build not yet implemented');
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
    this.logger.info('TaskBuilder destroyed');
  }
}

export function createTaskBuilder(config) {
  return new TaskBuilder(config);
}

export { TaskBuilder };
export default { createTaskBuilder, TaskBuilder };
