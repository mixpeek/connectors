/**
 * Mixpeek OpenRTB Connector - API Client
 *
 * HTTP client for Mixpeek API integration with retry logic and timeout handling.
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
import { extractKeywords, analyzeSentiment, inferCategory } from '../utils/helpers.js';

class MixpeekClient {
  /**
   * Create a Mixpeek API client
   * @param {Object} config - Client configuration
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} config.collectionId - Collection ID for document storage
   * @param {string} config.namespace - Namespace for data isolation
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in milliseconds
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.collectionId) {
      throw new Error('Collection ID is required');
    }
    if (!config.namespace) {
      throw new Error('Namespace is required');
    }

    this.apiKey = config.apiKey;
    this.collectionId = config.collectionId;
    this.namespace = config.namespace;
    this.endpoint = config.endpoint || API_ENDPOINT;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.logger = getLogger({ debug: config.debug });

    // Remove trailing slash from endpoint
    this.endpoint = this.endpoint.replace(/\/$/, '');
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

    let lastError;

    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        this.logger.debug(`API ${method} ${path} (attempt ${attempt + 1})`);
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
        this.logger.debug(`API response received in ${elapsed.toFixed(0)}ms`);

        return data;
      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          this.logger.warn(`Request timeout after ${this.timeout}ms`);
          lastError = new Error(`Request timeout after ${this.timeout}ms`);
          lastError.code = ERROR_CODES.TIMEOUT;
        }

        if (attempt < RETRY_ATTEMPTS) {
          this.logger.debug(`Retrying in ${RETRY_DELAY}ms...`);
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
   * Create a document in the collection
   * @param {Object} payload - Document payload
   * @returns {Promise<Object>} Created document
   */
  async createDocument(payload) {
    const path = `/collections/${this.collectionId}/documents`;

    const body = {
      ...payload,
      metadata: {
        ...payload.metadata,
        namespace: this.namespace,
        source: 'openrtb-connector',
        timestamp: new Date().toISOString()
      }
    };

    return this.request('POST', path, body);
  }

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocument(documentId) {
    const path = `/collections/${this.collectionId}/documents/${documentId}`;
    return this.request('GET', path);
  }

  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const start = Date.now();
      const response = await this.request('GET', '/health');
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString(),
        response
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process content and return enrichments
   * @param {Object} content - Content to process
   * @param {string} [content.url] - Page URL
   * @param {string} [content.title] - Page title
   * @param {string} [content.text] - Page text content
   * @param {string} [content.description] - Page description
   * @param {string[]} [content.images] - Image URLs
   * @param {Object[]} [content.videos] - Video data
   * @returns {Promise<Object>} Enrichment results
   */
  async processContent(content) {
    const startTime = Date.now();

    try {
      // Create document with content
      const document = await this.createDocument({
        content: {
          url: content.url,
          title: content.title,
          text: content.text,
          description: content.description
        },
        assets: {
          images: content.images || [],
          videos: content.videos || []
        }
      });

      // Extract enrichments from response
      const enrichments = this.buildEnrichments(content, document);

      return {
        success: true,
        documentId: document.id || document.document_id,
        enrichments,
        latencyMs: Date.now() - startTime,
        source: 'api'
      };
    } catch (error) {
      this.logger.warn('API processing failed, using local enrichments:', error.message);

      // Fallback to local enrichments
      const enrichments = this.buildLocalEnrichments(content);

      return {
        success: false,
        error: error.message,
        enrichments,
        latencyMs: Date.now() - startTime,
        source: 'fallback'
      };
    }
  }

  /**
   * Build enrichments from API response
   * @param {Object} content - Original content
   * @param {Object} document - API document response
   * @returns {Object} Enrichments
   */
  buildEnrichments(content, document) {
    const text = [content.title, content.description, content.text].filter(Boolean).join(' ');

    // Extract keywords from API response or locally
    const keywords = document.keywords ||
                    document.enrichments?.keywords ||
                    extractKeywords(text);

    // Get sentiment from API or analyze locally
    const sentimentData = document.sentiment ||
                         document.enrichments?.sentiment ||
                         analyzeSentiment(text);

    // Get categories from API or infer locally
    const categoryData = document.categories ||
                        document.enrichments?.categories ||
                        inferCategory(keywords);

    return {
      keywords,
      sentiment: sentimentData,
      categories: categoryData,
      embeddings: document.embeddings || document.enrichments?.embeddings || null,
      entities: document.entities || document.enrichments?.entities || [],
      documentId: document.id || document.document_id
    };
  }

  /**
   * Build enrichments locally when API is unavailable
   * @param {Object} content - Content to process
   * @returns {Object} Local enrichments
   */
  buildLocalEnrichments(content) {
    const text = [content.title, content.description, content.text].filter(Boolean).join(' ');

    const keywords = extractKeywords(text);
    const sentiment = analyzeSentiment(text);
    const categories = inferCategory(keywords);

    return {
      keywords,
      sentiment,
      categories,
      embeddings: null,
      entities: [],
      documentId: null
    };
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
