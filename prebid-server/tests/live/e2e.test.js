/**
 * Live API Tests - End-to-End Integration
 *
 * Tests against real Mixpeek API
 *
 * Run with:
 * MIXPEEK_API_KEY=your_key npm run test:live
 */

import { createEnricher } from '../../src/index.js'

const TEST_CONFIG = {
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID || 'test_collection',
  namespace: process.env.MIXPEEK_NAMESPACE || 'ns_test',
  endpoint: process.env.MIXPEEK_ENDPOINT || 'https://api.mixpeek.com',
  timeout: 5000
}

function skipIfNoApiKey() {
  if (!TEST_CONFIG.apiKey) {
    console.log('Skipping live tests - no API key configured')
    return true
  }
  return false
}

describe('Prebid Server - Live API E2E Tests', () => {
  let enricher

  beforeAll(() => {
    if (skipIfNoApiKey()) return

    enricher = createEnricher({
      apiKey: TEST_CONFIG.apiKey,
      collectionId: TEST_CONFIG.collectionId,
      namespace: TEST_CONFIG.namespace,
      endpoint: TEST_CONFIG.endpoint,
      timeout: TEST_CONFIG.timeout,
      enableCache: true
    })
  })

  describe('Content Enrichment', () => {
    test('should enrich technology content', async () => {
      if (skipIfNoApiKey()) return

      const content = {
        url: 'https://techblog.com/ai-breakthrough',
        title: 'Major AI Breakthrough in Machine Learning',
        text: 'Researchers have achieved a significant breakthrough in artificial intelligence and machine learning algorithms. The new technology enables faster processing and better accuracy.',
        language: 'en'
      }

      const result = await enricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.ortb2).toBeDefined()
      expect(result.ortb2.site.content).toBeDefined()
      expect(result.targeting).toBeDefined()
      expect(result.latencyMs).toBeGreaterThanOrEqual(0)

      console.log('Technology content enrichment:', {
        category: result.targeting.hb_mixpeek_category,
        keywords: result.targeting.hb_mixpeek_keywords,
        score: result.targeting.hb_mixpeek_score,
        latencyMs: result.latencyMs
      })
    }, 10000)

    test('should enrich sports content', async () => {
      if (skipIfNoApiKey()) return

      const content = {
        url: 'https://sports.com/football-finals',
        title: 'Football Championship Finals Tonight',
        text: 'The football championship finals are happening tonight with the top teams competing for the trophy. Sports fans around the world are excited.',
        language: 'en'
      }

      const result = await enricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.ortb2.site.content).toBeDefined()

      console.log('Sports content enrichment:', {
        category: result.targeting.hb_mixpeek_category,
        keywords: result.targeting.hb_mixpeek_keywords,
        latencyMs: result.latencyMs
      })
    }, 10000)

    test('should handle caching correctly', async () => {
      if (skipIfNoApiKey()) return

      const content = {
        url: 'https://example.com/cached-test',
        title: 'Cache Test Article',
        text: 'This is a test article for cache verification.'
      }

      // First request
      const result1 = await enricher.enrich(content)
      expect(result1.cached).toBe(false)

      // Second request (should be cached)
      const result2 = await enricher.enrich(content)
      expect(result2.cached).toBe(true)
      expect(result2.latencyMs).toBeLessThan(10)

      console.log('Cache performance:', {
        firstRequest: result1.latencyMs + 'ms',
        cachedRequest: result2.latencyMs + 'ms'
      })

      // Verify cache stats
      const stats = enricher.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)
    }, 10000)
  })

  describe('OpenRTB Bid Request Enrichment', () => {
    test('should enrich full OpenRTB bid request', async () => {
      if (skipIfNoApiKey()) return

      const bidRequest = {
        id: 'bid-request-123',
        site: {
          page: 'https://news.example.com/business/market-update',
          domain: 'news.example.com',
          content: {
            title: 'Stock Market Update',
            language: 'en'
          }
        },
        imp: [
          {
            id: 'imp-1',
            banner: {
              w: 300,
              h: 250,
              format: [{ w: 300, h: 250 }, { w: 300, h: 600 }]
            },
            bidfloor: 0.5
          },
          {
            id: 'imp-2',
            banner: {
              w: 728,
              h: 90
            },
            bidfloor: 0.3
          }
        ],
        user: {
          id: 'user-456'
        },
        device: {
          ua: 'Mozilla/5.0',
          ip: '192.168.1.1'
        }
      }

      const content = {
        url: bidRequest.site.page,
        title: bidRequest.site.content.title,
        text: 'The stock market showed mixed results today with technology stocks leading gains. Business analysts predict continued growth in the finance sector.',
        language: 'en'
      }

      const enriched = await enricher.enrichBidRequest(bidRequest, content)

      // Verify original data preserved
      expect(enriched.id).toBe('bid-request-123')
      expect(enriched.site.page).toBe(bidRequest.site.page)
      expect(enriched.imp.length).toBe(2)

      // Verify enrichment added
      expect(enriched.site.content.keywords).toBeDefined()
      expect(enriched.imp[0].ext.data).toBeDefined()
      expect(enriched.imp[1].ext.data).toBeDefined()

      console.log('Enriched bid request:', {
        siteContent: enriched.site.content,
        imp0Targeting: enriched.imp[0].ext.data
      })
    }, 10000)

    test('should handle mobile app bid request', async () => {
      if (skipIfNoApiKey()) return

      const bidRequest = {
        id: 'app-bid-123',
        app: {
          name: 'Gaming App',
          bundle: 'com.example.game',
          domain: 'example.com',
          content: {
            title: 'Puzzle Game Level 5'
          }
        },
        imp: [
          {
            id: 'imp-app-1',
            banner: { w: 320, h: 50 }
          }
        ]
      }

      const content = {
        url: `app://${bidRequest.app.bundle}`,
        title: bidRequest.app.content.title,
        text: 'Entertainment gaming puzzle challenge fun'
      }

      const enriched = await enricher.enrichBidRequest(bidRequest, content)

      expect(enriched.app.name).toBe('Gaming App')
      expect(enriched.site?.content).toBeDefined()

      console.log('App bid request enriched:', {
        targeting: enriched.imp[0].ext?.data
      })
    }, 10000)
  })

  describe('Performance', () => {
    test('should complete enrichment within acceptable latency', async () => {
      if (skipIfNoApiKey()) return

      const content = {
        url: 'https://example.com/perf-test',
        title: 'Performance Test',
        text: 'Quick performance test content'
      }

      enricher.clearCache()

      const iterations = 5
      const latencies = []

      for (let i = 0; i < iterations; i++) {
        const content_i = { ...content, url: `${content.url}/${i}` }
        const result = await enricher.enrich(content_i)
        latencies.push(result.latencyMs)
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
      const maxLatency = Math.max(...latencies)

      console.log('Performance results:', {
        iterations,
        avgLatencyMs: avgLatency.toFixed(2),
        maxLatencyMs: maxLatency,
        latencies
      })

      // Should complete within 5 seconds (allowing for network variance)
      expect(maxLatency).toBeLessThan(5000)
    }, 30000)
  })

  describe('Error Handling', () => {
    test('should gracefully handle API errors', async () => {
      if (skipIfNoApiKey()) return

      // Create enricher with invalid collection
      const badEnricher = createEnricher({
        apiKey: TEST_CONFIG.apiKey,
        collectionId: 'invalid_collection_12345',
        namespace: TEST_CONFIG.namespace,
        timeout: 5000
      })

      const content = {
        url: 'https://example.com/error-test',
        title: 'Error Test',
        text: 'Technology content for error handling test'
      }

      // Should not throw, should return fallback enrichment
      const result = await badEnricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.ortb2).toBeDefined()
      expect(result.targeting).toBeDefined()
      // Key: graceful degradation - we got a result even with invalid collection

      console.log('Error handled gracefully:', {
        hadError: !!result.error,
        fallbackCategory: result.targeting.hb_mixpeek_category
      })
    }, 10000)
  })
})
