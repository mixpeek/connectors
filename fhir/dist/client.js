/**
 * Mixpeek API Client for FHIR Integration
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} apiKey - Mixpeek API key
 * @property {string} endpoint - API endpoint
 * @property {string} namespace - Mixpeek namespace
 * @property {number} timeout - Request timeout in ms
 */

export class MixpeekClient {
  constructor(config) {
    this.apiKey = config.apiKey
    this.endpoint = config.endpoint || 'https://api.mixpeek.com'
    this.namespace = config.namespace
    this.timeout = config.timeout || 5000
  }

  /**
   * Make API request with timeout
   */
  async _request(path, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.endpoint}${path}`
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Namespace': this.namespace,
          'User-Agent': 'Mixpeek-FHIR/1.0.0',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw {
          code: 'API_ERROR',
          status: response.status,
          message: error.message || response.statusText,
          path
        }
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw {
          code: 'API_TIMEOUT',
          message: `Request timeout after ${this.timeout}ms`,
          path
        }
      }

      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const start = Date.now()
    const result = await this._request('/v1/health', { method: 'GET' })
    return {
      ...result,
      latencyMs: Date.now() - start
    }
  }

  /**
   * Create document in collection
   */
  async createDocument(collectionId, payload) {
    const path = `/v1/collections/${collectionId}/documents`
    return this._request(path, {
      method: 'POST',
      body: JSON.stringify({
        collection_id: collectionId,
        content: payload.content,
        ...payload.metadata
      })
    })
  }

  /**
   * Process FHIR resource content through Mixpeek
   */
  async processContent(collectionId, content) {
    try {
      const document = await this.createDocument(collectionId, {
        content: content.text || '',
        metadata: {
          resource_type: content.resourceType,
          resource_id: content.resourceId,
          url: content.url,
          timestamp: Date.now()
        }
      })

      return {
        document_id: document.document_id,
        collection_id: document.collection_id,
        enrichments: document.enrichments || {}
      }
    } catch (error) {
      return {
        document_id: null,
        collection_id: collectionId,
        enrichments: {},
        error: error.message
      }
    }
  }
}
