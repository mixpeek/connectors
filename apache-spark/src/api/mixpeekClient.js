/**
 * @mixpeek/spark — Mixpeek API Client
 *
 * HTTP client for Mixpeek API integration with retry logic and timeout handling.
 */

import {
  API_ENDPOINT, API_VERSION, DEFAULT_TIMEOUT,
  RETRY_ATTEMPTS, RETRY_DELAY, ERROR_CODES, HEADERS
} from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class MixpeekClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in ms
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    if (!config.apiKey) throw new Error('API key is required');

    this.apiKey = config.apiKey;
    this.endpoint = (config.endpoint || API_ENDPOINT).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.logger = getLogger({ debug: config.debug });
  }

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

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${this.timeout}ms`);
          lastError.code = ERROR_CODES.TIMEOUT;
        }
        if (attempt < RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
        }
      }
    }

    this.logger.error('API request failed after retries:', lastError.message);
    throw lastError;
  }

  async healthCheck() {
    try {
      const start = Date.now();
      const response = await this.request('GET', '/health');
      return { status: 'healthy', latency: Date.now() - start, timestamp: new Date().toISOString(), response };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async search(query, options = {}) {
    return this.request('POST', '/features/search', { query, ...options });
  }

  async getDocument(collectionId, documentId) {
    return this.request('GET', `/collections/${collectionId}/documents/${documentId}`);
  }

  async createDocument(collectionId, payload) {
    return this.request('POST', `/collections/${collectionId}/documents`, payload);
  }

  async listDocuments(collectionId, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request('GET', `/collections/${collectionId}/documents${params ? '?' + params : ''}`);
  }
}

export function createClient(config) {
  return new MixpeekClient(config);
}

export { MixpeekClient };
export default { createClient, MixpeekClient };
