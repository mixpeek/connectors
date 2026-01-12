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
   * @param {boolean} requireNamespace - Whether namespace header is required
   * @returns {object} Headers object
   */
  _buildHeaders(requireNamespace = true) {
    const headers = {
      [HEADERS.CONTENT_TYPE]: 'application/json',
      [HEADERS.AUTHORIZATION]: `Bearer ${this.apiKey}`,
      [HEADERS.USER_AGENT]: USER_AGENT
    }

    // Add namespace header (required for most endpoints)
    if (this.namespace && requireNamespace) {
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

    // Build request payload according to Mixpeek API spec
    const requestPayload = {
      collection_id: collectionId,
      ...payload.metadata
    }

    // Add content field if provided
    if (payload.content) {
      requestPayload.content = payload.content
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
   * @param {array} featureExtractors - Feature extractors to use (optional, for future use)
   * @returns {Promise} Enriched document with context data
   */
  async processContent(collectionId, content, featureExtractors = []) {
    logger.group('Processing content with Mixpeek')
    logger.info('Collection:', collectionId)
    logger.info('Content URL:', content.url)

    try {
      // Create document in collection
      const document = await this.createDocument(collectionId, {
        content: content.text || content.description || '',
        metadata: {
          url: content.url,
          title: content.title,
          timestamp: Date.now()
        }
      })

      logger.info('Document created:', document.document_id)

      // Build enrichments from content analysis (client-side fallback)
      // In future versions, this will use Mixpeek's taxonomy and classification APIs
      const enrichments = this._buildLocalEnrichments(content)

      logger.groupEnd()

      return {
        document_id: document.document_id,
        collection_id: document.collection_id,
        enrichments
      }
    } catch (error) {
      logger.error('Error processing content:', error)
      logger.groupEnd()

      // Return fallback enrichments on API error (graceful degradation)
      return {
        document_id: null,
        collection_id: collectionId,
        enrichments: this._buildLocalEnrichments(content)
      }
    }
  }

  /**
   * Build local enrichments from content (client-side analysis)
   * This provides basic contextual data when API processing is unavailable
   * @private
   * @param {object} content - Content object
   * @returns {object} Enrichments object
   */
  _buildLocalEnrichments(content) {
    const enrichments = {}

    // Extract keywords from content
    if (content.text) {
      enrichments.keywords = this._extractKeywords(content.text)
    }

    // Analyze sentiment (basic)
    if (content.text) {
      enrichments.sentiment = this._analyzeSentiment(content.text)
    }

    // Generate content hash as embedding ID
    enrichments.embeddings = [{
      id: `emb_${this._generateContentId(content)}`
    }]

    return enrichments
  }

  /**
   * Extract keywords from text (simple implementation)
   * @private
   * @param {string} text - Text content
   * @returns {array} Array of keywords
   */
  _extractKeywords(text) {
    if (!text) return []

    // Simple keyword extraction: common important words
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'and', 'but', 'or', 'if', 'this', 'that', 'these', 'those', 'it', 'its'])

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))

    // Count word frequency
    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    // Return top 10 keywords by frequency
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  /**
   * Basic sentiment analysis
   * @private
   * @param {string} text - Text content
   * @returns {object} Sentiment result
   */
  _analyzeSentiment(text) {
    if (!text) return { label: 'neutral', score: 0.5 }

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'best', 'love', 'happy', 'positive', 'success', 'win', 'awesome', 'brilliant', 'perfect', 'beautiful', 'enjoy', 'exciting']
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'negative', 'fail', 'loss', 'poor', 'ugly', 'boring', 'disappointing', 'wrong', 'problem', 'issue', 'error']

    const lowerText = text.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) positiveCount += matches.length
    })

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) negativeCount += matches.length
    })

    const total = positiveCount + negativeCount
    if (total === 0) return { label: 'neutral', score: 0.5 }

    const score = positiveCount / total
    let label = 'neutral'
    if (score > 0.6) label = 'positive'
    else if (score < 0.4) label = 'negative'

    return { label, score }
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

