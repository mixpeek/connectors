/**
 * Mixpeek Context Adapter - API Client
 * @module api/mixpeekClient
 */

import {
  DEFAULT_API_ENDPOINT,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  ENDPOINTS,
  HEADERS,
  USER_AGENT,
  ERROR_CODES
} from '../config/constants.js'
import { withTimeout, retryWithBackoff, generateUUID } from '../utils/helpers.js'
import logger from '../utils/logger.js'

class MixpeekClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || ''
    this.endpoint = config.endpoint || DEFAULT_API_ENDPOINT
    this.namespace = config.namespace || null
    this.timeout = config.timeout || DEFAULT_TIMEOUT
    this.retryAttempts = config.retryAttempts || DEFAULT_RETRY_ATTEMPTS
  }

  /**
   * Configure the client
   * @param {object} config - Configuration object
   */
  configure(config) {
    Object.assign(this, config)
  }

  /**
   * Build headers for API request
   * @private
   * @returns {object} Headers object
   */
  _buildHeaders() {
    const headers = {
      [HEADERS.CONTENT_TYPE]: 'application/json',
      [HEADERS.AUTHORIZATION]: `Bearer ${this.apiKey}`,
      [HEADERS.USER_AGENT]: USER_AGENT
    }

    if (this.namespace) {
      headers[HEADERS.NAMESPACE] = this.namespace
    }

    return headers
  }

  /**
   * Make API request
   * @private
   * @param {string} path - API path
   * @param {object} options - Fetch options
   * @returns {Promise} Response data
   */
  async _request(path, options = {}) {
    const url = `${this.endpoint}${path}`
    const headers = this._buildHeaders()

    const fetchOptions = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    }

    logger.info(`API Request: ${options.method || 'GET'} ${url}`)
    logger.time(`API Request: ${path}`)

    try {
      const response = await withTimeout(
        fetch(url, fetchOptions),
        this.timeout
      )

      logger.timeEnd(`API Request: ${path}`)

      if (!response.ok) {
        const error = await this._handleErrorResponse(response)
        throw error
      }

      const data = await response.json()
      logger.info('API Response:', { status: response.status, path })
      return data
    } catch (error) {
      logger.timeEnd(`API Request: ${path}`)
      
      if (error.message === 'Timeout') {
        throw {
          code: ERROR_CODES.API_TIMEOUT,
          message: `Request timeout after ${this.timeout}ms`,
          path
        }
      }

      throw error
    }
  }

  /**
   * Handle error response
   * @private
   * @param {Response} response - Fetch response
   * @returns {object} Error object
   */
  async _handleErrorResponse(response) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      // Response body is not JSON
    }

    return {
      code: ERROR_CODES.API_ERROR,
      message: errorMessage,
      status: response.status
    }
  }

  /**
   * Create a document in a collection
   * @param {string} collectionId - Collection ID
   * @param {object} payload - Document payload
   * @returns {Promise} Document data
   */
  async createDocument(collectionId, payload) {
    const path = ENDPOINTS.DOCUMENTS.replace('{collectionId}', collectionId)
    
    const requestPayload = {
      object_id: payload.objectId || generateUUID(),
      metadata: payload.metadata || {},
      features: payload.features || []
    }

    return retryWithBackoff(
      () => this._request(path, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      }),
      this.retryAttempts
    )
  }

  /**
   * Get document by ID
   * @param {string} collectionId - Collection ID
   * @param {string} documentId - Document ID
   * @returns {Promise} Document data
   */
  async getDocument(collectionId, documentId) {
    const path = `${ENDPOINTS.DOCUMENTS.replace('{collectionId}', collectionId)}/${documentId}`
    return this._request(path, { method: 'GET' })
  }

  /**
   * Process content with feature extractors
   * @param {string} collectionId - Collection ID
   * @param {object} content - Content to process
   * @param {array} featureExtractors - Feature extractors to use
   * @returns {Promise} Enriched document
   */
  async processContent(collectionId, content, featureExtractors = []) {
    logger.group('Processing content with Mixpeek')
    logger.info('Collection:', collectionId)
    logger.info('Feature Extractors:', featureExtractors)

    try {
      // Build features array from extractors
      const features = featureExtractors.map(extractor => {
        const feature = {
          feature_extractor_id: typeof extractor === 'string' ? extractor : extractor.feature_extractor_id
        }

        // Add payload if provided
        if (typeof extractor === 'object' && extractor.payload) {
          feature.payload = extractor.payload
        } else {
          // Build payload from content
          feature.payload = this._buildFeaturePayload(content)
        }

        return feature
      })

      // Create document with features
      const document = await this.createDocument(collectionId, {
        objectId: this._generateContentId(content),
        metadata: {
          url: content.url,
          title: content.title,
          timestamp: Date.now()
        },
        features
      })

      logger.info('Document created:', document.document_id)
      logger.groupEnd()

      return document
    } catch (error) {
      logger.error('Error processing content:', error)
      logger.groupEnd()
      throw error
    }
  }

  /**
   * Build feature payload from content
   * @private
   * @param {object} content - Content object
   * @returns {object} Feature payload
   */
  _buildFeaturePayload(content) {
    const payload = {}

    // Add text content
    if (content.text) {
      payload.text = content.text
    }

    // Add URL
    if (content.url) {
      payload.url = content.url
    }

    // Add video URL
    if (content.src && content.duration !== undefined) {
      // This is video content
      payload.video_url = content.src
      payload.title = content.title
      payload.description = content.description
    }

    // Add image URL
    if (content.src && content.width && content.height && !content.duration) {
      // This is image content
      payload.image_url = content.src
      payload.alt_text = content.alt
    }

    // Add metadata
    if (content.metadata) {
      payload.metadata = content.metadata
    }

    return payload
  }

  /**
   * Generate content ID for caching
   * @private
   * @param {object} content - Content object
   * @returns {string} Content ID
   */
  _generateContentId(content) {
    if (content.url) {
      return `url_${content.url.split('?')[0]}` // Remove query params
    }
    if (content.src) {
      return `src_${content.src.split('?')[0]}`
    }
    return generateUUID()
  }

  /**
   * List available feature extractors
   * @returns {Promise} Feature extractors list
   */
  async listFeatureExtractors() {
    return this._request(ENDPOINTS.FEATURE_EXTRACTORS, { method: 'GET' })
  }

  /**
   * Get feature extractor details
   * @param {string} extractorId - Feature extractor ID
   * @returns {Promise} Feature extractor details
   */
  async getFeatureExtractor(extractorId) {
    const path = ENDPOINTS.FEATURE_EXTRACTORS + `/${extractorId}`
    return this._request(path, { method: 'GET' })
  }

  /**
   * Health check
   * @returns {Promise} Health status
   */
  async healthCheck() {
    return this._request('/v1/health', { method: 'GET' })
  }
}

export default MixpeekClient

