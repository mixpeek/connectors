/**
 * Mixpeek IAB Ad Product Taxonomy Connector - API Client
 *
 * HTTP client for Mixpeek API integration with semantic classification.
 */

import {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  ERROR_CODES,
  HEADERS
} from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class MixpeekClient {
  /**
   * Create a Mixpeek API client
   * @param {Object} config - Client configuration
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} [config.namespace] - Namespace for data isolation
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in milliseconds
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.namespace = config.namespace;
    this.endpoint = (config.endpoint || API_ENDPOINT).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.logger = getLogger({ debug: config.debug });
  }

  /**
   * Make an HTTP request with retry logic
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} [body] - Request body
   * @returns {Promise<Object>} Response data
   */
  async request(method, path, body = null) {
    const url = `${this.endpoint}/${API_VERSION}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': HEADERS.CONTENT_TYPE,
      'Accept': HEADERS.ACCEPT,
      'User-Agent': HEADERS.USER_AGENT
    };

    if (this.namespace) {
      headers['X-Namespace-Id'] = this.namespace;
    }

    let lastError;

    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        this.logger.log(`API ${method} ${path} (attempt ${attempt + 1})`);
        this.logger.time(`api_${path}`);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const elapsed = this.logger.timeEnd(`api_${path}`);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        this.logger.log(`API response received in ${elapsed}ms`);

        return data;
      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          this.logger.warn(`Request timeout after ${this.timeout}ms`);
          lastError = new Error(`Request timeout after ${this.timeout}ms`);
          lastError.code = ERROR_CODES.TIMEOUT;
        }

        if (attempt < RETRY_ATTEMPTS) {
          this.logger.log(`Retrying in ${RETRY_DELAY}ms...`);
          await this.sleep(RETRY_DELAY);
        }
      }
    }

    this.logger.error('API request failed after retries:', lastError.message);
    throw lastError;
  }

  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Classify product using Mixpeek's semantic understanding
   * @param {Object} product - Product data
   * @param {string} product.title - Product title
   * @param {string} [product.description] - Product description
   * @param {string} [product.category] - Merchant category
   * @param {string[]} [product.keywords] - Additional keywords
   * @returns {Promise<Object>} Classification result
   */
  async classifyProduct(product) {
    const startTime = Date.now();

    try {
      // Build classification payload
      const payload = {
        content: {
          text: this.buildClassificationText(product)
        },
        taxonomy: 'iab_ad_product_2.0',
        options: {
          max_categories: 3,
          min_confidence: 0.3,
          include_hierarchy: true
        }
      };

      const response = await this.request('POST', '/classify', payload);

      return {
        success: true,
        categories: this.normalizeCategories(response),
        latencyMs: Date.now() - startTime,
        source: 'api'
      };
    } catch (error) {
      this.logger.warn('API classification failed:', error.message);

      return {
        success: false,
        error: error.message,
        errorCode: error.code || ERROR_CODES.API_ERROR,
        latencyMs: Date.now() - startTime,
        source: 'api'
      };
    }
  }

  /**
   * Build text for classification
   * @param {Object} product - Product data
   * @returns {string} Combined text
   */
  buildClassificationText(product) {
    const parts = [];

    if (product.title) {
      parts.push(`Product: ${product.title}`);
    }

    if (product.description) {
      parts.push(`Description: ${product.description}`);
    }

    if (product.category) {
      parts.push(`Category: ${product.category}`);
    }

    if (product.brand) {
      parts.push(`Brand: ${product.brand}`);
    }

    if (product.keywords && product.keywords.length > 0) {
      parts.push(`Keywords: ${product.keywords.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Normalize API response to standard format
   * @param {Object} response - API response
   * @returns {Object[]} Normalized categories
   */
  normalizeCategories(response) {
    if (!response || !response.categories) return [];

    return response.categories.map(cat => ({
      id: cat.id || cat.category_id,
      name: cat.name || cat.category_name,
      confidence: cat.confidence || cat.score,
      tier: cat.tier || cat.level,
      parent: cat.parent_id || cat.parent,
      path: cat.path || cat.hierarchy
    }));
  }

  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.request('GET', '/health');
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Create a Mixpeek client instance
 * @param {Object} config - Client configuration
 * @returns {MixpeekClient} Client instance
 */
export function createClient(config) {
  return new MixpeekClient(config);
}

export { MixpeekClient };
export default { createClient, MixpeekClient };
