/**
 * Mixpeek Context Adapter for Prebid.js
 * @module modules/mixpeekContextAdapter
 * @version 1.0.0
 * 
 * This module enriches Prebid.js bid requests with contextual data from Mixpeek's
 * multimodal AI engine. It extracts page, video, or image content and classifies
 * it using Mixpeek's API to provide IAB taxonomy, brand safety scores, and other
 * contextual signals for privacy-safe ad targeting.
 */

import {
  MIXPEEK_MODULE_NAME,
  CONTENT_MODES,
  TARGETING_KEYS,
  EVENTS,
  DEFAULT_CACHE_TTL,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  PERFORMANCE,
  FEATURE_EXTRACTORS
} from '../config/constants.js'
import { validateConfig, deepMerge, hashString, isBrowser } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import cacheManager from '../cache/cacheManager.js'
import MixpeekClient from '../api/mixpeekClient.js'
import { extractPageContent, extractArticleContent, isArticlePage } from '../extractors/pageExtractor.js'
import { extractVideoContent, hasVideo, extractVideoPlayerInfo } from '../extractors/videoExtractor.js'
import { extractImages, extractOGImage, hasImages } from '../extractors/imageExtractor.js'
import { getIABFromTaxonomy, mapCategoriesToIAB, IAB_TAXONOMY_VERSION } from '../utils/iabMapping.js'

class MixpeekContextAdapter {
  constructor() {
    this.config = {}
    this.client = null
    this.initialized = false
    this.processing = false
    this.contextData = null
    this.events = {}
    this.healthCheckPerformed = false
  }

  /**
   * Initialize the adapter with configuration
   * @param {object} config - Configuration object
   * @returns {Promise<boolean>} Success
   */
  async init(config) {
    logger.info('Initializing Mixpeek Context Adapter')
    logger.group('Configuration')

    // Validate configuration
    const validation = validateConfig(config)
    if (!validation.valid) {
      logger.error('Invalid configuration:', validation.errors)
      logger.groupEnd()
      return false
    }

    // Set default configuration
    this.config = deepMerge({
      endpoint: 'https://api.mixpeek.com',
      timeout: DEFAULT_TIMEOUT,
      cacheTTL: DEFAULT_CACHE_TTL,
      retryAttempts: DEFAULT_RETRY_ATTEMPTS,
      mode: CONTENT_MODES.AUTO,
      enableCache: true,
      debug: false,
      healthCheck: 'lazy', // 'eager', 'lazy', or false
      featureExtractors: [FEATURE_EXTRACTORS.TAXONOMY],
      batchSize: 1
    }, config)

    // Set debug mode
    logger.setDebug(this.config.debug)

    // Initialize API client
    this.client = new MixpeekClient({
      apiKey: this.config.apiKey,
      endpoint: this.config.endpoint,
      namespace: this.config.namespace,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts
    })

    // Configure cache
    if (this.config.enableCache) {
      cacheManager.setTTL(this.config.cacheTTL)
    }

    logger.table({
      'API Endpoint': this.config.endpoint,
      'Collection ID': this.config.collectionId,
      'Namespace': this.config.namespace || 'default',
      'Mode': this.config.mode,
      'Timeout': `${this.config.timeout}ms`,
      'Cache TTL': `${this.config.cacheTTL}s`,
      'Feature Extractors': this.config.featureExtractors.join(', '),
      'Health Check': this.config.healthCheck
    })

    logger.groupEnd()

    // Perform health check if configured
    if (this.config.healthCheck === 'eager') {
      logger.info('Performing health check...')
      const healthResult = await this._performHealthCheck()
      
      if (!healthResult.healthy) {
        logger.warn('Health check failed, but continuing initialization')
        logger.warn('API may be unavailable:', healthResult.error)
      } else {
        logger.info('Health check passed:', healthResult.message)
      }
    } else if (this.config.healthCheck === 'lazy') {
      logger.info('Health check will be performed on first request')
    }

    this.initialized = true
    logger.info('Mixpeek Context Adapter initialized successfully')
    return true
  }

  /**
   * Perform health check (internal)
   * @private
   * @returns {Promise<object>} Health check result
   */
  async _performHealthCheck() {
    try {
      const startTime = performance.now()
      const health = await this.client.healthCheck()
      const duration = performance.now() - startTime

      return {
        healthy: true,
        status: health.status || 'ok',
        version: health.version,
        latency: Math.round(duration),
        message: `API responding in ${Math.round(duration)}ms`
      }
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        message: 'API health check failed'
      }
    }
  }

  /**
   * Enrich ad units with contextual data
   * @param {array} adUnits - Prebid ad units
   * @returns {Promise<array>} Enriched ad units
   */
  async enrichAdUnits(adUnits) {
    if (!this.initialized) {
      logger.warn('Adapter not initialized')
      return adUnits
    }

    if (this.processing) {
      logger.warn('Already processing context')
      return adUnits
    }

    this.processing = true
    const startTime = performance.now()

    try {
      // Get contextual data
      const context = await this.getContext()
      
      if (!context) {
        logger.warn('No context data available')
        return adUnits
      }

      // Store context
      this.contextData = context

      // Inject targeting keys into ad units
      const enrichedAdUnits = this._injectTargetingKeys(adUnits, context)

      const duration = performance.now() - startTime
      logger.info(`Context enrichment completed in ${duration.toFixed(2)}ms`)

      // Check performance threshold
      if (duration > PERFORMANCE.WARN_LATENCY) {
        logger.warn(`Enrichment took ${duration.toFixed(2)}ms (threshold: ${PERFORMANCE.WARN_LATENCY}ms)`)
      }

      // Emit success event
      this._emitEvent(EVENTS.CONTEXT_READY, context)

      return enrichedAdUnits
    } catch (error) {
      logger.error('Error enriching ad units:', error)
      
      // Emit error event
      this._emitEvent(EVENTS.CONTEXT_ERROR, error)

      // Return original ad units (graceful degradation)
      return adUnits
    } finally {
      this.processing = false
    }
  }

  /**
   * Get contextual data from cache or API
   * @returns {Promise<object>} Context data
   */
  async getContext() {
    logger.time('getContext')

    try {
      // Perform lazy health check on first request
      if (this.config.healthCheck === 'lazy' && !this.healthCheckPerformed) {
        logger.info('Performing lazy health check...')
        const healthResult = await this._performHealthCheck()
        this.healthCheckPerformed = true
        
        if (!healthResult.healthy) {
          logger.warn('Health check failed:', healthResult.error)
          logger.warn('Proceeding anyway, errors will be handled gracefully')
        } else {
          logger.info('Health check passed:', healthResult.message)
        }
      }

      // Detect content mode
      const mode = this._detectContentMode()
      logger.info('Content mode:', mode)

      // Extract content based on mode
      const content = await this._extractContent(mode)
      
      if (!content) {
        logger.warn('No content extracted')
        logger.timeEnd('getContext')
        return null
      }

      // Generate cache key
      const cacheKey = this._generateCacheKey(content, mode)

      // Check cache
      if (this.config.enableCache) {
        const cached = cacheManager.get(cacheKey)
        if (cached) {
          logger.info('Using cached context')
          logger.timeEnd('getContext')
          this._emitEvent(EVENTS.CONTEXT_CACHED, cached)
          return cached
        }
      }

      // Process content with Mixpeek API
      logger.info('Processing content with Mixpeek API')
      this._emitEvent(EVENTS.API_REQUEST, { content, mode })

      const document = await this.client.processContent(
        this.config.collectionId,
        content,
        this.config.featureExtractors
      )

      this._emitEvent(EVENTS.API_RESPONSE, document)

      // Parse context from document
      const context = this._parseContext(document, content, mode)

      // Cache the result
      if (this.config.enableCache) {
        cacheManager.set(cacheKey, context)
      }

      logger.timeEnd('getContext')
      return context
    } catch (error) {
      logger.error('Error getting context:', error)
      logger.timeEnd('getContext')
      throw error
    }
  }

  /**
   * Detect content mode (page, video, image, or auto)
   * @private
   * @returns {string} Content mode
   */
  _detectContentMode() {
    if (this.config.mode !== CONTENT_MODES.AUTO) {
      return this.config.mode
    }

    // Auto-detect based on page content
    if (hasVideo()) {
      return CONTENT_MODES.VIDEO
    }

    if (isArticlePage() || hasImages()) {
      return CONTENT_MODES.PAGE
    }

    return CONTENT_MODES.PAGE // Default to page
  }

  /**
   * Extract content based on mode
   * @private
   * @param {string} mode - Content mode
   * @returns {Promise<object>} Extracted content
   */
  async _extractContent(mode) {
    if (!isBrowser()) {
      logger.warn('Not in browser environment')
      return null
    }

    logger.info(`Extracting ${mode} content`)

    switch (mode) {
      case CONTENT_MODES.VIDEO:
        return this._extractVideoContent()

      case CONTENT_MODES.IMAGE:
        return this._extractImageContent()

      case CONTENT_MODES.PAGE:
      default:
        return this._extractPageContent()
    }
  }

  /**
   * Extract page content
   * @private
   * @returns {object} Page content
   */
  _extractPageContent() {
    const pageContent = extractPageContent()
    
    if (!pageContent) return null

    // If it's an article, extract article-specific content
    if (isArticlePage()) {
      const articleContent = extractArticleContent()
      if (articleContent) {
        return {
          ...pageContent,
          article: articleContent
        }
      }
    }

    // Extract featured image
    const ogImage = extractOGImage()
    if (ogImage) {
      pageContent.featuredImage = ogImage
    }

    return pageContent
  }

  /**
   * Extract video content
   * @private
   * @returns {object} Video content
   */
  _extractVideoContent() {
    const videoSelector = this.config.videoSelector || 'video'
    const videoContent = extractVideoContent(videoSelector)
    
    if (!videoContent) {
      // Check for embedded video players
      const playerInfo = extractVideoPlayerInfo()
      if (playerInfo) {
        return {
          ...playerInfo,
          type: 'embedded'
        }
      }
      return null
    }

    return {
      ...videoContent,
      type: 'native'
    }
  }

  /**
   * Extract image content
   * @private
   * @returns {object} Image content
   */
  _extractImageContent() {
    const images = extractImages(this.config.maxImages || 5)
    
    if (images.length === 0) return null

    return {
      images,
      primaryImage: images[0],
      count: images.length
    }
  }

  /**
   * Generate cache key for content
   * @private
   * @param {object} content - Content object
   * @param {string} mode - Content mode
   * @returns {string} Cache key
   */
  _generateCacheKey(content, mode) {
    let keyString = mode

    if (content.url) {
      keyString += `_${content.url}`
    } else if (content.src) {
      keyString += `_${content.src}`
    } else if (content.images) {
      keyString += `_${content.images[0]?.src || ''}`
    }

    // Add feature extractors to key
    keyString += `_${this.config.featureExtractors.sort().join('_')}`

    return hashString(keyString)
  }

  /**
   * Parse context from Mixpeek document response
   * @private
   * @param {object} document - Mixpeek document
   * @param {object} content - Original content
   * @param {string} mode - Content mode
   * @returns {object} Parsed context
   */
  _parseContext(document, content, mode) {
    const context = {
      documentId: document.document_id,
      mode,
      content: {
        url: content.url || content.src || '',
        title: content.title || '',
        type: mode
      }
    }

    // Extract taxonomies
    if (document.enrichments && document.enrichments.taxonomies) {
      const taxonomies = document.enrichments.taxonomies
      
      if (taxonomies.length > 0) {
        const primaryTaxonomy = taxonomies[0]
        context.taxonomy = {
          label: primaryTaxonomy.label,
          nodeId: primaryTaxonomy.node_id,
          path: primaryTaxonomy.path,
          score: primaryTaxonomy.score,
          all: taxonomies
        }
      }
    }

    // Extract other enrichments
    if (document.enrichments) {
      // Brand safety
      if (document.enrichments.brand_safety) {
        context.brandSafety = document.enrichments.brand_safety
      }

      // Keywords
      if (document.enrichments.keywords) {
        context.keywords = document.enrichments.keywords
      }

      // Sentiment
      if (document.enrichments.sentiment) {
        context.sentiment = document.enrichments.sentiment
      }

      // Embeddings
      if (document.enrichments.embeddings) {
        context.embeddingId = document.enrichments.embeddings[0]?.id || null
      }
    }

    return context
  }

  /**
   * Inject targeting keys into ad units
   * @private
   * @param {array} adUnits - Ad units
   * @param {object} context - Context data
   * @returns {array} Enriched ad units
   */
  _injectTargetingKeys(adUnits, context) {
    const targetingKeys = this._buildTargetingKeys(context)
    
    logger.info('Targeting keys:', targetingKeys)

    return adUnits.map(adUnit => {
      // Add to first-party data (ortb2Imp)
      if (!adUnit.ortb2Imp) {
        adUnit.ortb2Imp = {}
      }
      if (!adUnit.ortb2Imp.ext) {
        adUnit.ortb2Imp.ext = {}
      }
      if (!adUnit.ortb2Imp.ext.data) {
        adUnit.ortb2Imp.ext.data = {}
      }

      // Merge targeting keys
      Object.assign(adUnit.ortb2Imp.ext.data, targetingKeys)

      // Also add to legacy targeting
      if (!adUnit.bids) {
        adUnit.bids = []
      }

      adUnit.bids = adUnit.bids.map(bid => {
        if (!bid.params) {
          bid.params = {}
        }
        if (!bid.params.keywords) {
          bid.params.keywords = {}
        }

        Object.assign(bid.params.keywords, targetingKeys)
        return bid
      })

      return adUnit
    })
  }

  /**
   * Build targeting keys from context
   * @private
   * @param {object} context - Context data
   * @returns {object} Targeting keys
   */
  _buildTargetingKeys(context) {
    const keys = {}

    // Taxonomy
    if (context.taxonomy) {
      keys[TARGETING_KEYS.CATEGORY] = context.taxonomy.label
      keys[TARGETING_KEYS.NODE] = context.taxonomy.nodeId
      keys[TARGETING_KEYS.PATH] = Array.isArray(context.taxonomy.path) 
        ? context.taxonomy.path.join('/')
        : context.taxonomy.path
      keys[TARGETING_KEYS.SCORE] = context.taxonomy.score.toFixed(2)

      // Extract IAB taxonomy code if available
      const iabMatch = context.taxonomy.label.match(/IAB\d+-\d+/)
      if (iabMatch) {
        keys[TARGETING_KEYS.TAXONOMY] = iabMatch[0]
      }
    }

    // Brand safety
    if (context.brandSafety) {
      keys[TARGETING_KEYS.SAFETY] = typeof context.brandSafety === 'number'
        ? context.brandSafety.toFixed(2)
        : context.brandSafety.score?.toFixed(2) || '0'
    }

    // Keywords
    if (context.keywords) {
      keys[TARGETING_KEYS.KEYWORDS] = Array.isArray(context.keywords)
        ? context.keywords.slice(0, 10).join(',')
        : context.keywords
    }

    // Sentiment
    if (context.sentiment) {
      keys[TARGETING_KEYS.SENTIMENT] = typeof context.sentiment === 'string'
        ? context.sentiment
        : context.sentiment.label || 'neutral'
    }

    // Embedding ID
    if (context.embeddingId) {
      keys[TARGETING_KEYS.EMBED] = context.embeddingId
    }

    return keys
  }

  /**
   * Format context data for OpenRTB 2.6 site.content
   * @param {object} context - Context data
   * @returns {object|null} ortb2 formatted site.content object
   */
  formatForOrtb2SiteContent(context) {
    if (!context) return null

    const contentData = {}

    // IAB Content Categories
    if (context.taxonomy) {
      const iabCode = getIABFromTaxonomy(context.taxonomy)
      if (iabCode) {
        contentData.cat = [iabCode]
        contentData.cattax = IAB_TAXONOMY_VERSION
      }
      
      // Genre (human-readable category)
      if (context.taxonomy.label) {
        contentData.genre = context.taxonomy.label
      }
    }

    // Keywords
    if (context.keywords) {
      contentData.keywords = Array.isArray(context.keywords)
        ? context.keywords.join(',')
        : context.keywords
    }

    // Language detection (from page or default)
    if (isBrowser() && document.documentElement.lang) {
      contentData.language = document.documentElement.lang
    }

    // Page metadata
    if (isBrowser()) {
      if (document.title) {
        contentData.title = document.title
      }
      if (window.location.href) {
        contentData.url = window.location.href
      }
    }

    // Content-specific metadata from context
    if (context.content) {
      if (context.content.url && !contentData.url) {
        contentData.url = context.content.url
      }
      if (context.content.title && !contentData.title) {
        contentData.title = context.content.title
      }
    }

    // Extension data (Mixpeek-specific)
    contentData.ext = {
      data: {
        mixpeek: {
          documentId: context.documentId,
          mode: context.mode,
          score: context.taxonomy?.score,
          brandSafety: context.brandSafety,
          sentiment: context.sentiment,
          embeddingId: context.embeddingId
        }
      }
    }

    return contentData
  }

  /**
   * Format context data for ortb2Fragments (used by RTD modules)
   * @param {object} context - Context data
   * @returns {object|null} ortb2Fragments object
   */
  formatForOrtb2Fragments(context) {
    if (!context) return null

    const contentData = this.formatForOrtb2SiteContent(context)
    if (!contentData) return null

    return {
      global: {
        site: {
          content: contentData
        }
      }
    }
  }

  /**
   * Format context as first-party data segments (alternative format)
   * @param {object} context - Context data
   * @returns {Array} Array of data segments
   */
  formatAsDataSegments(context) {
    if (!context || !context.taxonomy) return []

    const segments = []

    // Primary taxonomy segment
    const iabCode = getIABFromTaxonomy(context.taxonomy)
    if (iabCode) {
      segments.push({
        id: iabCode,
        name: context.taxonomy.label,
        value: context.taxonomy.score.toString()
      })
    }

    // Additional taxonomies if available
    if (context.taxonomy.all && Array.isArray(context.taxonomy.all)) {
      context.taxonomy.all.slice(1, 5).forEach(tax => {
        const code = getIABFromTaxonomy(tax)
        if (code) {
          segments.push({
            id: code,
            name: tax.label,
            value: tax.score.toString()
          })
        }
      })
    }

    return segments
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * Emit event
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _emitEvent(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          logger.error(`Error in event callback for ${event}:`, error)
        }
      })
    }

    // Also emit to window for Prebid integration
    if (isBrowser() && window.pbjs) {
      window.pbjs.emit(event, data)
    }
  }

  /**
   * Get current context data
   * @returns {object|null} Context data
   */
  getContextData() {
    return this.contextData
  }

  /**
   * Clear cache
   */
  clearCache() {
    cacheManager.clear()
    logger.info('Cache cleared')
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getCacheStats() {
    return cacheManager.getStats()
  }

  /**
   * Health check
   * @returns {Promise<object>} Health status
   */
  async healthCheck() {
    if (!this.client) {
      return { status: 'error', message: 'Client not initialized' }
    }

    try {
      const health = await this.client.healthCheck()
      return { status: 'ok', ...health }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
}

// Create singleton instance
const adapter = new MixpeekContextAdapter()

// Export adapter instance
export default adapter

// Browser global
if (isBrowser()) {
  window.MixpeekContextAdapter = adapter
}

