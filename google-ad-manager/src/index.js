/**
 * Mixpeek Contextual Enrichment for Google Ad Manager
 *
 * Privacy-safe contextual signals for GAM custom targeting keys
 * Supports IAB taxonomy, sentiment, brand safety, and ad adjacency
 */

import { MixpeekClient } from './client.js'
import {
  buildTargetingKeys,
  buildSlotTargeting,
  buildPageTargeting,
  buildPMPTargeting,
  buildYieldConditions,
  generateGPTCode,
  validateTargeting,
  TARGETING_KEYS
} from './targeting.js'
import {
  IAB_V2_CATEGORIES,
  IAB_V3_CATEGORIES,
  getIABCode,
  getIABv3Code,
  getIABLabel,
  getIABv3Label
} from './iab.js'

/**
 * @typedef {Object} MixpeekGAMConfig
 * @property {string} apiKey - Mixpeek API key
 * @property {string} collectionId - Mixpeek collection ID
 * @property {string} namespace - Mixpeek namespace (e.g., 'ns_xxxxx')
 * @property {string} [endpoint] - API endpoint (default: https://api.mixpeek.com)
 * @property {number} [timeout] - Request timeout in ms (default: 200)
 * @property {boolean} [enableCache] - Enable response caching (default: true)
 * @property {number} [cacheTTL] - Cache TTL in seconds (default: 300)
 * @property {boolean} [shadowMode] - Shadow mode for risk-free testing (default: false)
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
 * @property {Object} targeting - GAM custom targeting key-value pairs
 * @property {Object} context - Full context object with enrichments
 * @property {Object} yield - Yield optimization recommendations
 * @property {string} gptCode - Generated GPT setTargeting code
 * @property {number} latencyMs - Processing time in milliseconds
 * @property {boolean} cached - Whether result was from cache
 */

// Simple in-memory cache
const cache = new Map()
const CACHE_MAX_SIZE = 1000

/**
 * Create a Mixpeek GAM enricher instance
 * @param {MixpeekGAMConfig} config - Configuration options
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
  const shadowMode = config.shadowMode || false

  /**
   * Get cache key for content
   */
  function getCacheKey(content) {
    const key = `${content.url || ''}:${content.title || ''}:${(content.text || '').slice(0, 100)}`
    // Simple hash for Node.js compatibility
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36).slice(0, 32)
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

  // Track previous ads for adjacency
  let previousAds = []
  const MAX_PREVIOUS_ADS = 10

  return {
    /**
     * Enrich content and return GAM-compatible targeting keys
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

        // Build GAM targeting keys
        const targeting = buildTargetingKeys(result)
        const pmpTargeting = buildPMPTargeting(result)
        const yieldConditions = buildYieldConditions(result)
        const gptCode = generateGPTCode(result)

        const enrichment = {
          targeting,
          pmpTargeting,
          context: result,
          yield: yieldConditions,
          gptCode,
          latencyMs: Date.now() - startTime,
          cached: false,
          shadowMode
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
          error: error.message,
          shadowMode
        }
      }
    },

    /**
     * Get targeting keys for a specific GAM slot
     * @param {ContentInput} content - Content to analyze
     * @param {string} slotId - GAM slot ID
     * @returns {Promise<Object>} Slot targeting
     */
    async getSlotTargeting(content, slotId) {
      const enrichment = await this.enrich(content)

      // Add slot-specific data
      const slotTargeting = { ...enrichment.targeting }

      // Add adjacency score based on previous ads
      if (previousAds.length > 0) {
        const adjacencyScore = calculateAdjacencyScore(previousAds, enrichment.context?.taxonomy?.label)
        slotTargeting[TARGETING_KEYS.ADJACENCY_SCORE] = adjacencyScore.toFixed(2)
      }

      return {
        slotId,
        targeting: slotTargeting,
        latencyMs: enrichment.latencyMs
      }
    },

    /**
     * Record ad impression for adjacency tracking
     * @param {Object} adData - Ad impression data
     */
    recordAdImpression(adData) {
      previousAds.push({
        ...adData,
        timestamp: Date.now()
      })
      // Keep only recent ads
      if (previousAds.length > MAX_PREVIOUS_ADS) {
        previousAds.shift()
      }
    },

    /**
     * Get current ad adjacency data
     * @returns {Array} Previous ads
     */
    getAdAdjacency() {
      return [...previousAds]
    },

    /**
     * Clear ad adjacency history
     */
    clearAdAdjacency() {
      previousAds = []
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
    },

    /**
     * Validate targeting keys
     * @param {Object} targeting - Targeting to validate
     */
    validateTargeting(targeting) {
      return validateTargeting(targeting)
    },

    /**
     * Check if running in shadow mode
     */
    isShadowMode() {
      return shadowMode
    }
  }
}

/**
 * Build fallback enrichment when API fails
 */
function buildFallbackEnrichment(content) {
  const keywords = extractKeywords(content.text || content.title || '')
  const category = inferCategory(keywords)
  const sentiment = analyzeSentiment(content.text || content.title || '')

  const result = {
    enrichments: {
      keywords,
      sentiment,
      suitability: { level: 'standard', score: 0.7, flags: [] },
      contentDepth: { level: 'medium', score: 0.5 }
    },
    taxonomy: { label: category, score: 0.5 }
  }

  return {
    targeting: buildTargetingKeys(result),
    pmpTargeting: buildPMPTargeting(result),
    context: result,
    yield: buildYieldConditions(result),
    gptCode: generateGPTCode(result)
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

/**
 * Basic sentiment analysis
 */
function analyzeSentiment(text) {
  if (!text) return { label: 'neutral', score: 0.5 }

  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'happy', 'success', 'awesome']
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'fail', 'poor', 'wrong']

  const lowerText = text.toLowerCase()
  let positive = 0, negative = 0

  positiveWords.forEach(word => {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi'))
    if (matches) positive += matches.length
  })
  negativeWords.forEach(word => {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi'))
    if (matches) negative += matches.length
  })

  const total = positive + negative
  if (total === 0) return { label: 'neutral', score: 0.5 }

  const score = positive / total
  return {
    label: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral',
    score
  }
}

/**
 * Calculate adjacency score based on previous ads
 */
function calculateAdjacencyScore(previousAds, currentCategory) {
  if (previousAds.length === 0) return 1.0

  // Penalize if recent ads are from same category (competitive separation)
  const recentAds = previousAds.slice(-3)
  const sameCategoryCount = recentAds.filter(ad => ad.category === currentCategory).length

  // Higher score = less competitive adjacency
  return Math.max(0.3, 1.0 - (sameCategoryCount * 0.2))
}

// Named exports
export { MixpeekClient } from './client.js'
export {
  buildTargetingKeys,
  buildSlotTargeting,
  buildPageTargeting,
  buildPMPTargeting,
  buildYieldConditions,
  generateGPTCode,
  validateTargeting,
  TARGETING_KEYS
} from './targeting.js'
export {
  IAB_V2_CATEGORIES,
  IAB_V3_CATEGORIES,
  getIABCode,
  getIABv3Code,
  getIABLabel,
  getIABv3Label
} from './iab.js'

// Default export
export default { createEnricher }
