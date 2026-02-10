/**
 * Mixpeek FHIR Connector
 *
 * Enrich FHIR R4 clinical resources with multimodal AI-powered content analysis.
 * Extracts text from clinical resources, processes through Mixpeek, and returns
 * FHIR-compatible enrichment extensions and meta tags.
 */

import { MixpeekClient } from './client.js'
import { extractContent, extractBundle, SUPPORTED_RESOURCE_TYPES } from './extract.js'
import { buildFHIREnrichment, mergeEnrichment, stripEnrichment } from './enrichment.js'

/**
 * @typedef {Object} MixpeekFHIRConfig
 * @property {string} apiKey - Mixpeek API key
 * @property {string} collectionId - Mixpeek collection ID
 * @property {string} namespace - Mixpeek namespace (e.g., 'ns_xxxxx')
 * @property {string} [endpoint] - API endpoint (default: https://api.mixpeek.com)
 * @property {number} [timeout] - Request timeout in ms (default: 5000)
 * @property {boolean} [enableCache] - Enable response caching (default: true)
 * @property {number} [cacheTTL] - Cache TTL in seconds (default: 300)
 */

// Simple in-memory cache
const cache = new Map()
const CACHE_MAX_SIZE = 1000

/**
 * Create a Mixpeek FHIR enricher instance
 * @param {MixpeekFHIRConfig} config - Configuration options
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
    timeout: config.timeout || 5000
  })

  const enableCache = config.enableCache !== false
  const cacheTTL = (config.cacheTTL || 300) * 1000

  /**
   * Get cache key for a resource
   */
  function getCacheKey(resourceType, resourceId, text) {
    const key = `${resourceType}:${resourceId || ''}:${(text || '').slice(0, 100)}`
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
    if (cache.size >= CACHE_MAX_SIZE) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }
    cache.set(key, { data, timestamp: Date.now() })
  }

  return {
    /**
     * Enrich a single FHIR resource
     * @param {Object} resource - FHIR R4 resource
     * @returns {Promise<Object>} Enrichment result with FHIR extensions and tags
     */
    async enrich(resource) {
      const startTime = Date.now()

      const extracted = extractContent(resource)
      if (!extracted || !extracted.text) {
        return {
          resource,
          enrichment: null,
          latencyMs: Date.now() - startTime,
          cached: false,
          skipped: true,
          reason: 'No extractable text content'
        }
      }

      const cacheKey = getCacheKey(extracted.resourceType, extracted.resourceId, extracted.text)

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
        const result = await client.processContent(config.collectionId, extracted)
        const enrichment = buildFHIREnrichment(result, extracted)
        const enrichedResource = mergeEnrichment(resource, enrichment)

        const output = {
          resource: enrichedResource,
          enrichment,
          extracted,
          latencyMs: Date.now() - startTime,
          cached: false
        }

        setCache(cacheKey, output)
        return output
      } catch (error) {
        return {
          resource,
          enrichment: null,
          extracted,
          latencyMs: Date.now() - startTime,
          cached: false,
          error: error.message
        }
      }
    },

    /**
     * Enrich all resources in a FHIR Bundle
     * @param {Object} bundle - FHIR Bundle resource
     * @returns {Promise<Object>} Enriched bundle with per-entry results
     */
    async enrichBundle(bundle) {
      const startTime = Date.now()

      if (!bundle || bundle.resourceType !== 'Bundle') {
        return {
          bundle,
          results: [],
          latencyMs: Date.now() - startTime,
          error: 'Not a FHIR Bundle'
        }
      }

      const entries = bundle.entry || []
      const results = []

      // Process entries sequentially to respect API rate limits
      const enrichedEntries = []
      for (const entry of entries) {
        if (entry.resource) {
          const result = await this.enrich(entry.resource)
          results.push(result)
          enrichedEntries.push({
            ...entry,
            resource: result.resource
          })
        } else {
          enrichedEntries.push(entry)
        }
      }

      return {
        bundle: {
          ...bundle,
          entry: enrichedEntries
        },
        results,
        latencyMs: Date.now() - startTime
      }
    },

    /**
     * Extract content from a FHIR resource without calling Mixpeek
     * Useful for inspecting what text will be sent for enrichment.
     * @param {Object} resource - FHIR R4 resource
     * @returns {Object|null} Extracted content or null
     */
    extract(resource) {
      return extractContent(resource)
    },

    /**
     * Strip Mixpeek enrichment from a resource
     * @param {Object} resource - Enriched FHIR resource
     * @returns {Object} Resource without Mixpeek extensions
     */
    strip(resource) {
      return stripEnrichment(resource)
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
     * Get list of resource types with dedicated extractors
     */
    getSupportedResourceTypes() {
      return [...SUPPORTED_RESOURCE_TYPES]
    }
  }
}

// Named exports
export { MixpeekClient } from './client.js'
export { extractContent, extractBundle, SUPPORTED_RESOURCE_TYPES } from './extract.js'
export { buildFHIREnrichment, mergeEnrichment, stripEnrichment } from './enrichment.js'

// Default export
export default { createEnricher }
