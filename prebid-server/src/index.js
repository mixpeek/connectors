/**
 * Mixpeek RTD Module for Prebid Server
 *
 * Server-side contextual enrichment for OpenRTB bid requests
 */

import { MixpeekClient } from './client.js'
import { enrichBidRequest, enrichOrtb2 } from './enrichment.js'
import { extractContent } from './content.js'
import { IAB_CATEGORIES } from './iab.js'

/**
 * @typedef {Object} MixpeekConfig
 * @property {string} apiKey - Mixpeek API key
 * @property {string} collectionId - Mixpeek collection ID
 * @property {string} namespace - Mixpeek namespace (e.g., 'ns_xxxxx')
 * @property {string} [endpoint] - API endpoint (default: https://api.mixpeek.com)
 * @property {number} [timeout] - Request timeout in ms (default: 200)
 * @property {boolean} [enableCache] - Enable response caching (default: true)
 * @property {number} [cacheTTL] - Cache TTL in seconds (default: 300)
 */

/**
 * @typedef {Object} ContentInput
 * @property {string} [url] - Page URL
 * @property {string} [title] - Page title
 * @property {string} [text] - Page text content
 * @property {string} [description] - Page description
 * @property {string} [language] - Content language
 */

/**
 * @typedef {Object} EnrichmentResult
 * @property {Object} ortb2 - OpenRTB 2.6 site.content object
 * @property {Object} targeting - Key-value targeting pairs
 * @property {Object} context - Full context object
 * @property {number} latencyMs - Processing time in milliseconds
 */

// Simple in-memory cache for server-side use
const cache = new Map()
const CACHE_MAX_SIZE = 1000

/**
 * Create a Mixpeek RTD enricher instance
 * @param {MixpeekConfig} config - Configuration options
 * @returns {Object} Enricher instance
 */
export function createEnricher(config) {
  if (!config.apiKey) throw new Error('apiKey is required')
  if (!config.collectionId) throw new Error('collectionId is required')
  if (!config.namespace) throw new Error('namespace is required')

  const client = new MixpeekClient({
    apiKey: config.apiKey,
    endpoint: config.endpoint || 'https://api.mixpeek.com',
    namespace: config.namespace,
    timeout: config.timeout || 200
  })

  const enableCache = config.enableCache !== false
  const cacheTTL = (config.cacheTTL || 300) * 1000 // Convert to ms

  /**
   * Get cache key for content
   */
  function getCacheKey(content) {
    const key = `${content.url || ''}:${content.title || ''}:${(content.text || '').slice(0, 100)}`
    return Buffer.from(key).toString('base64').slice(0, 32)
  }

  /**
   * Check cache for existing result
   */
  function checkCache(key) {
    if (!enableCache) return null
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data
    }
    cache.delete(key)
    return null
  }

  /**
   * Store result in cache
   */
  function setCache(key, data) {
    if (!enableCache) return
    // Prune cache if too large
    if (cache.size >= CACHE_MAX_SIZE) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }
    cache.set(key, { data, timestamp: Date.now() })
  }

  return {
    /**
     * Enrich content and return OpenRTB 2.6 compatible data
     * @param {ContentInput} content - Content to analyze
     * @returns {Promise<EnrichmentResult>} Enrichment result
     */
    async enrich(content) {
      const startTime = Date.now()
      const cacheKey = getCacheKey(content)

      // Check cache
      const cached = checkCache(cacheKey)
      if (cached) {
        return {
          ...cached,
          latencyMs: Date.now() - startTime,
          cached: true
        }
      }

      try {
        // Process content with Mixpeek
        const result = await client.processContent(config.collectionId, content)

        // Build OpenRTB 2.6 response
        const ortb2 = enrichOrtb2(result, content)
        const targeting = buildTargeting(result)

        const enrichment = {
          ortb2,
          targeting,
          context: result,
          latencyMs: Date.now() - startTime,
          cached: false
        }

        // Cache result
        setCache(cacheKey, enrichment)

        return enrichment
      } catch (error) {
        // Graceful degradation - return basic enrichment
        const fallback = buildFallbackEnrichment(content)
        return {
          ...fallback,
          latencyMs: Date.now() - startTime,
          cached: false,
          error: error.message
        }
      }
    },

    /**
     * Enrich an OpenRTB bid request in-place
     * @param {Object} bidRequest - OpenRTB bid request object
     * @param {ContentInput} [content] - Optional content override
     * @returns {Promise<Object>} Enriched bid request
     */
    async enrichBidRequest(bidRequest, content) {
      // Extract content from bid request if not provided
      const contentToAnalyze = content || extractContent(bidRequest)

      if (!contentToAnalyze || (!contentToAnalyze.url && !contentToAnalyze.text)) {
        return bidRequest // Nothing to enrich
      }

      const enrichment = await this.enrich(contentToAnalyze)

      // Merge into bid request
      return enrichBidRequest(bidRequest, enrichment)
    },

    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
      return client.healthCheck()
    },

    /**
     * Clear the cache
     */
    clearCache() {
      cache.clear()
    },

    /**
     * Get cache statistics
     */
    getCacheStats() {
      return {
        size: cache.size,
        maxSize: CACHE_MAX_SIZE,
        enabled: enableCache,
        ttlMs: cacheTTL
      }
    }
  }
}

/**
 * Build targeting key-value pairs
 */
function buildTargeting(result) {
  const targeting = {}

  if (result.enrichments) {
    if (result.enrichments.keywords?.length > 0) {
      targeting.hb_mixpeek_keywords = result.enrichments.keywords.slice(0, 10).join(',')
    }
    if (result.enrichments.sentiment) {
      targeting.hb_mixpeek_sentiment = result.enrichments.sentiment.label
      targeting.hb_mixpeek_safety = String(result.enrichments.sentiment.score > 0.5 ? 0.8 : 0.5)
    }
  }

  if (result.taxonomy) {
    targeting.hb_mixpeek_category = result.taxonomy.label
    targeting.hb_mixpeek_score = String(result.taxonomy.score || 0.7)
  }

  return targeting
}

/**
 * Build fallback enrichment when API fails
 */
function buildFallbackEnrichment(content) {
  const keywords = extractKeywords(content.text || content.title || '')
  const category = inferCategory(keywords)

  return {
    ortb2: {
      site: {
        content: {
          keywords: keywords.join(','),
          language: content.language || 'en'
        }
      }
    },
    targeting: {
      hb_mixpeek_keywords: keywords.slice(0, 10).join(','),
      hb_mixpeek_category: category,
      hb_mixpeek_safety: '0.7'
    },
    context: {
      keywords,
      taxonomy: { label: category, score: 0.5 }
    }
  }
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  if (!text) return []
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'and', 'but', 'or', 'if', 'this', 'that', 'it', 'its'])

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))

  const wordCount = {}
  words.forEach(word => { wordCount[word] = (wordCount[word] || 0) + 1 })

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word)
}

/**
 * Infer category from keywords
 */
function inferCategory(keywords) {
  const categoryMap = {
    'Technology': ['technology', 'software', 'computer', 'digital', 'tech', 'app', 'mobile', 'phone', 'ai', 'data'],
    'Business': ['business', 'company', 'market', 'finance', 'investment', 'stock', 'economy', 'corporate'],
    'Sports': ['sports', 'game', 'team', 'player', 'football', 'basketball', 'soccer', 'match'],
    'Entertainment': ['movie', 'film', 'music', 'celebrity', 'actor', 'show', 'entertainment', 'tv'],
    'Health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'fitness', 'wellness'],
    'News': ['news', 'breaking', 'report', 'politics', 'government', 'election', 'world'],
    'Science': ['science', 'research', 'study', 'experiment', 'discovery', 'scientist'],
    'Automotive': ['car', 'vehicle', 'auto', 'automotive', 'driving', 'electric', 'engine'],
    'Travel': ['travel', 'vacation', 'hotel', 'flight', 'destination', 'tourism'],
    'Food': ['food', 'recipe', 'cooking', 'restaurant', 'cuisine', 'chef']
  }

  const lowerKeywords = keywords.map(k => k.toLowerCase())
  for (const [category, catKeywords] of Object.entries(categoryMap)) {
    if (lowerKeywords.some(k => catKeywords.includes(k))) {
      return category
    }
  }
  return 'General'
}

// Named exports
export { MixpeekClient } from './client.js'
export { enrichBidRequest, enrichOrtb2 } from './enrichment.js'
export { extractContent } from './content.js'
export { IAB_CATEGORIES } from './iab.js'

// Default export
export default { createEnricher }
