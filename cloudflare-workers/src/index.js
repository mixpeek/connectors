/**
 * Mixpeek Content Intelligence Worker
 *
 * A shared content intelligence layer at the edge that provides:
 * - Cached content profiles by URL
 * - IAB taxonomy classification
 * - Brand safety scoring
 * - Sentiment analysis
 * - Keyword extraction
 *
 * Consumers: GAM, Prebid Server (OpenRTB), Analytics, Personalization
 */

import { MixpeekClient } from './api/mixpeekClient.js'
import { CacheManager } from './cache/cacheManager.js'
import { formatForGAM, formatForOpenRTB, formatForAnalytics, formatForJSON } from './formatters/index.js'

/**
 * Main Worker class
 */
export class ContentIntelligenceWorker {
  constructor(env) {
    this.env = env
    this.client = new MixpeekClient({
      apiKey: env.MIXPEEK_API_KEY,
      endpoint: env.MIXPEEK_API_ENDPOINT || 'https://api.mixpeek.com',
      namespace: env.MIXPEEK_NAMESPACE,
      collectionId: env.MIXPEEK_COLLECTION_ID
    })
    this.cache = new CacheManager(env.CONTENT_PROFILES, {
      defaultTTL: parseInt(env.CACHE_TTL || '3600', 10)
    })
  }

  /**
   * Handle incoming requests
   */
  async handleRequest(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': this.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Namespace-Id'
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
      // Route requests
      switch (true) {
        case path === '/v1/analyze':
          return this.handleAnalyze(request, corsHeaders)

        case path === '/v1/profile':
          return this.handleGetProfile(request, corsHeaders)

        case path === '/v1/profile/gam':
          return this.handleGAMFormat(request, corsHeaders)

        case path === '/v1/profile/openrtb':
          return this.handleOpenRTBFormat(request, corsHeaders)

        case path === '/v1/profile/analytics':
          return this.handleAnalyticsFormat(request, corsHeaders)

        case path === '/v1/batch':
          return this.handleBatchAnalyze(request, corsHeaders)

        case path === '/v1/invalidate':
          return this.handleInvalidate(request, corsHeaders)

        case path === '/health':
          return this.handleHealth(corsHeaders)

        default:
          return this.jsonResponse({ error: 'Not Found', path }, 404, corsHeaders)
      }
    } catch (error) {
      console.error('Worker error:', error)
      return this.jsonResponse(
        { error: 'Internal Server Error', message: error.message },
        500,
        corsHeaders
      )
    }
  }

  /**
   * POST /v1/analyze - Analyze content and cache the result
   */
  async handleAnalyze(request, corsHeaders) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method Not Allowed' }, 405, corsHeaders)
    }

    const body = await request.json()
    const { url: contentUrl, content, options = {} } = body

    if (!contentUrl && !content) {
      return this.jsonResponse(
        { error: 'Either url or content is required' },
        400,
        corsHeaders
      )
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(contentUrl || content.url || content.id)

    // Check cache first (unless forced refresh)
    if (!options.forceRefresh) {
      const cached = await this.cache.get(cacheKey)
      if (cached) {
        return this.jsonResponse({
          ...cached,
          cached: true,
          cacheKey
        }, 200, corsHeaders)
      }
    }

    // Analyze content with Mixpeek
    const profile = await this.client.analyzeContent({
      url: contentUrl,
      content,
      extractors: options.extractors || ['taxonomy', 'sentiment', 'keywords', 'brand_safety']
    })

    // Build content profile
    const contentProfile = {
      id: cacheKey,
      url: contentUrl || content?.url,
      analyzedAt: new Date().toISOString(),
      profile
    }

    // Cache the result
    await this.cache.set(cacheKey, contentProfile, options.ttl)

    return this.jsonResponse({
      ...contentProfile,
      cached: false,
      cacheKey
    }, 200, corsHeaders)
  }

  /**
   * GET /v1/profile - Get cached content profile
   */
  async handleGetProfile(request, corsHeaders) {
    const url = new URL(request.url)
    const contentUrl = url.searchParams.get('url')
    const format = url.searchParams.get('format') || 'json'

    if (!contentUrl) {
      return this.jsonResponse({ error: 'url parameter is required' }, 400, corsHeaders)
    }

    const cacheKey = this.generateCacheKey(contentUrl)
    const profile = await this.cache.get(cacheKey)

    if (!profile) {
      return this.jsonResponse(
        { error: 'Profile not found', url: contentUrl, cacheKey },
        404,
        corsHeaders
      )
    }

    // Format response based on requested format
    switch (format) {
      case 'gam':
        return this.jsonResponse(formatForGAM(profile), 200, corsHeaders)
      case 'openrtb':
        return this.jsonResponse(formatForOpenRTB(profile), 200, corsHeaders)
      case 'analytics':
        return this.jsonResponse(formatForAnalytics(profile), 200, corsHeaders)
      default:
        return this.jsonResponse(formatForJSON(profile), 200, corsHeaders)
    }
  }

  /**
   * GET /v1/profile/gam - Get profile in GAM key-value format
   */
  async handleGAMFormat(request, corsHeaders) {
    const url = new URL(request.url)
    const contentUrl = url.searchParams.get('url')

    if (!contentUrl) {
      return this.jsonResponse({ error: 'url parameter is required' }, 400, corsHeaders)
    }

    const cacheKey = this.generateCacheKey(contentUrl)
    const profile = await this.cache.get(cacheKey)

    if (!profile) {
      // Analyze on-demand if not cached
      const analyzed = await this.analyzeOnDemand(contentUrl)
      if (!analyzed) {
        return this.jsonResponse({ error: 'Failed to analyze content' }, 500, corsHeaders)
      }
      return this.jsonResponse(formatForGAM(analyzed), 200, corsHeaders)
    }

    return this.jsonResponse(formatForGAM(profile), 200, corsHeaders)
  }

  /**
   * GET /v1/profile/openrtb - Get profile in OpenRTB 2.6 format
   */
  async handleOpenRTBFormat(request, corsHeaders) {
    const url = new URL(request.url)
    const contentUrl = url.searchParams.get('url')

    if (!contentUrl) {
      return this.jsonResponse({ error: 'url parameter is required' }, 400, corsHeaders)
    }

    const cacheKey = this.generateCacheKey(contentUrl)
    const profile = await this.cache.get(cacheKey)

    if (!profile) {
      const analyzed = await this.analyzeOnDemand(contentUrl)
      if (!analyzed) {
        return this.jsonResponse({ error: 'Failed to analyze content' }, 500, corsHeaders)
      }
      return this.jsonResponse(formatForOpenRTB(analyzed), 200, corsHeaders)
    }

    return this.jsonResponse(formatForOpenRTB(profile), 200, corsHeaders)
  }

  /**
   * GET /v1/profile/analytics - Get profile in analytics format
   */
  async handleAnalyticsFormat(request, corsHeaders) {
    const url = new URL(request.url)
    const contentUrl = url.searchParams.get('url')

    if (!contentUrl) {
      return this.jsonResponse({ error: 'url parameter is required' }, 400, corsHeaders)
    }

    const cacheKey = this.generateCacheKey(contentUrl)
    const profile = await this.cache.get(cacheKey)

    if (!profile) {
      const analyzed = await this.analyzeOnDemand(contentUrl)
      if (!analyzed) {
        return this.jsonResponse({ error: 'Failed to analyze content' }, 500, corsHeaders)
      }
      return this.jsonResponse(formatForAnalytics(analyzed), 200, corsHeaders)
    }

    return this.jsonResponse(formatForAnalytics(profile), 200, corsHeaders)
  }

  /**
   * POST /v1/batch - Batch analyze multiple URLs
   */
  async handleBatchAnalyze(request, corsHeaders) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method Not Allowed' }, 405, corsHeaders)
    }

    const body = await request.json()
    const { urls, options = {} } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return this.jsonResponse({ error: 'urls array is required' }, 400, corsHeaders)
    }

    // Limit batch size
    const maxBatchSize = parseInt(this.env.MAX_BATCH_SIZE || '10', 10)
    if (urls.length > maxBatchSize) {
      return this.jsonResponse(
        { error: `Batch size exceeds maximum (${maxBatchSize})` },
        400,
        corsHeaders
      )
    }

    // Process URLs in parallel
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const cacheKey = this.generateCacheKey(url)

        // Check cache
        if (!options.forceRefresh) {
          const cached = await this.cache.get(cacheKey)
          if (cached) {
            return { url, profile: cached, cached: true }
          }
        }

        // Analyze
        const profile = await this.client.analyzeContent({
          url,
          extractors: options.extractors || ['taxonomy', 'sentiment', 'keywords', 'brand_safety']
        })

        const contentProfile = {
          id: cacheKey,
          url,
          analyzedAt: new Date().toISOString(),
          profile
        }

        await this.cache.set(cacheKey, contentProfile, options.ttl)

        return { url, profile: contentProfile, cached: false }
      })
    )

    // Format results
    const formatted = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      return {
        url: urls[index],
        error: result.reason?.message || 'Analysis failed'
      }
    })

    return this.jsonResponse({ results: formatted }, 200, corsHeaders)
  }

  /**
   * POST /v1/invalidate - Invalidate cached profiles
   */
  async handleInvalidate(request, corsHeaders) {
    if (request.method !== 'POST') {
      return this.jsonResponse({ error: 'Method Not Allowed' }, 405, corsHeaders)
    }

    const body = await request.json()
    const { urls, pattern } = body

    let invalidated = 0

    if (urls && Array.isArray(urls)) {
      for (const url of urls) {
        const cacheKey = this.generateCacheKey(url)
        await this.cache.delete(cacheKey)
        invalidated++
      }
    }

    if (pattern) {
      // List and delete matching keys
      const keys = await this.cache.listByPattern(pattern)
      for (const key of keys) {
        await this.cache.delete(key)
        invalidated++
      }
    }

    return this.jsonResponse({ invalidated }, 200, corsHeaders)
  }

  /**
   * GET /health - Health check
   */
  async handleHealth(corsHeaders) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {}
    }

    // Check Mixpeek API
    try {
      const apiHealth = await this.client.healthCheck()
      health.services.mixpeek = { status: 'ok', ...apiHealth }
    } catch (error) {
      health.services.mixpeek = { status: 'error', message: error.message }
      health.status = 'degraded'
    }

    // Check KV store
    try {
      await this.cache.healthCheck()
      health.services.cache = { status: 'ok' }
    } catch (error) {
      health.services.cache = { status: 'error', message: error.message }
      health.status = 'degraded'
    }

    const statusCode = health.status === 'ok' ? 200 : 503
    return this.jsonResponse(health, statusCode, corsHeaders)
  }

  /**
   * Analyze content on-demand
   */
  async analyzeOnDemand(contentUrl) {
    try {
      const profile = await this.client.analyzeContent({
        url: contentUrl,
        extractors: ['taxonomy', 'sentiment', 'keywords', 'brand_safety']
      })

      const cacheKey = this.generateCacheKey(contentUrl)
      const contentProfile = {
        id: cacheKey,
        url: contentUrl,
        analyzedAt: new Date().toISOString(),
        profile
      }

      await this.cache.set(cacheKey, contentProfile)
      return contentProfile
    } catch (error) {
      console.error('On-demand analysis failed:', error)
      return null
    }
  }

  /**
   * Generate cache key from URL
   */
  generateCacheKey(url) {
    // Normalize URL and create deterministic key
    const normalized = url.toLowerCase().replace(/[?#].*$/, '').replace(/\/$/, '')
    return `profile:${this.hashString(normalized)}`
  }

  /**
   * Simple string hash
   */
  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * JSON response helper
   */
  jsonResponse(data, status = 200, additionalHeaders = {}) {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    })
  }
}

/**
 * Worker entry point
 */
export default {
  async fetch(request, env, ctx) {
    const worker = new ContentIntelligenceWorker(env)
    return worker.handleRequest(request)
  }
}
