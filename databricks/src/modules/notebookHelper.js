/**
 * @mixpeek/databricks — NotebookHelper
 *
 * Helper functions for using Mixpeek enrichment within Databricks notebooks
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class NotebookHelper {
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
    if (!config.apiKey) throw new Error('apiKey is required for NotebookHelper');

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
    this.logger.info('NotebookHelper initialized');
  }

  async enrich(...args) {
    this.logger.debug('NotebookHelper.enrich called');
    // TODO: Implement enrich
    throw new Error('NotebookHelper.enrich not yet implemented');
  }

  async enrichColumn(...args) {
    this.logger.debug('NotebookHelper.enrichColumn called');
    // TODO: Implement enrichColumn
    throw new Error('NotebookHelper.enrichColumn not yet implemented');
  }

  async search(...args) {
    this.logger.debug('NotebookHelper.search called');
    // TODO: Implement search
    throw new Error('NotebookHelper.search not yet implemented');
  }

  display(...args) {
    this.logger.debug('NotebookHelper.display called');
    // TODO: Implement display
    throw new Error('NotebookHelper.display not yet implemented');
  }

  configure(...args) {
    this.logger.debug('NotebookHelper.configure called');
    // TODO: Implement configure
    throw new Error('NotebookHelper.configure not yet implemented');
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
    this.logger.info('NotebookHelper destroyed');
  }
}

export function createNotebookHelper(config) {
  return new NotebookHelper(config);
}

export { NotebookHelper };
export default { createNotebookHelper, NotebookHelper };
