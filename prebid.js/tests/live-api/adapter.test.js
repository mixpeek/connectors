/**
 * Live API Tests - Full Adapter Integration
 * 
 * End-to-end tests with real Mixpeek API
 */

import adapter from '../../src/modules/mixpeekContextAdapter.js'

describe('Mixpeek Adapter - Live API Integration', () => {
  beforeAll(() => {
    if (skipIfNoApiKey()) {
      return
    }

    // Clear any cached data
    adapter.clearCache()
  })

  describe('Initialization', () => {
    test('should initialize with live API credentials', async () => {
      if (skipIfNoApiKey()) return

      if (!TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - no collection ID configured')
        return
      }

      const success = await adapter.init({
        apiKey: TEST_CONFIG.apiKey,
        collectionId: TEST_CONFIG.collectionId,
        namespace: TEST_CONFIG.namespace,
        endpoint: TEST_CONFIG.endpoint,
        timeout: TEST_CONFIG.timeout,
        featureExtractors: ['taxonomy'],
        debug: true
      })

      expect(success).toBe(true)
      expect(adapter.initialized).toBe(true)

      console.log('✓ Adapter initialized successfully')
    })
  })

  describe('Context Extraction and Processing', () => {
    test('should extract and process page context', async () => {
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - API key or collection ID not configured')
        return
      }

      // Initialize if not already done
      if (!adapter.initialized) {
        await adapter.init({
          apiKey: TEST_CONFIG.apiKey,
          collectionId: TEST_CONFIG.collectionId,
          namespace: TEST_CONFIG.namespace,
          timeout: TEST_CONFIG.timeout,
          featureExtractors: ['taxonomy']
        })
      }

      const context = await adapter.getContext()

      expect(context).toBeDefined()
      expect(context.mode).toBeDefined()
      expect(context.content).toBeDefined()
      
      console.log('✓ Context extracted:', {
        mode: context.mode,
        url: context.content.url,
        title: context.content.title
      })

      // Check for taxonomy
      if (context.taxonomy) {
        console.log('✓ Taxonomy classification:', {
          label: context.taxonomy.label,
          nodeId: context.taxonomy.nodeId,
          score: context.taxonomy.score
        })

        expect(context.taxonomy.label).toBeDefined()
        expect(context.taxonomy.score).toBeGreaterThan(0)
        expect(context.taxonomy.score).toBeLessThanOrEqual(1)
      } else {
        console.warn('⚠️  No taxonomy classification returned')
      }

      // Check for document ID
      expect(context.documentId).toBeDefined()
      console.log('✓ Document ID:', context.documentId)
    }, TEST_CONFIG.timeout)

    test('should cache context for subsequent requests', async () => {
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - API key or collection ID not configured')
        return
      }

      if (!adapter.initialized) {
        await adapter.init({
          apiKey: TEST_CONFIG.apiKey,
          collectionId: TEST_CONFIG.collectionId,
          namespace: TEST_CONFIG.namespace,
          timeout: TEST_CONFIG.timeout,
          enableCache: true,
          cacheTTL: 300
        })
      }

      // First request
      const startTime1 = Date.now()
      await adapter.getContext()
      const duration1 = Date.now() - startTime1

      // Second request (should be cached)
      const startTime2 = Date.now()
      await adapter.getContext()
      const duration2 = Date.now() - startTime2

      console.log('✓ First request:', duration1, 'ms')
      console.log('✓ Cached request:', duration2, 'ms')

      // Cached request should be significantly faster
      expect(duration2).toBeLessThan(duration1)
      
      // Check cache stats
      const stats = adapter.getCacheStats()
      console.log('✓ Cache stats:', stats)
      expect(stats.memoryCount).toBeGreaterThan(0)
    }, TEST_CONFIG.timeout * 2)
  })

  describe('Ad Unit Enrichment', () => {
    test('should enrich ad units with live contextual data', async () => {
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - API key or collection ID not configured')
        return
      }

      if (!adapter.initialized) {
        await adapter.init({
          apiKey: TEST_CONFIG.apiKey,
          collectionId: TEST_CONFIG.collectionId,
          namespace: TEST_CONFIG.namespace,
          timeout: TEST_CONFIG.timeout,
          featureExtractors: ['taxonomy']
        })
      }

      const adUnits = [
        {
          code: 'div-banner-1',
          mediaTypes: {
            banner: {
              sizes: [[300, 250], [728, 90]]
            }
          },
          bids: [
            {
              bidder: 'rubicon',
              params: {
                accountId: '14062',
                siteId: '70608',
                zoneId: '335918'
              }
            }
          ]
        },
        {
          code: 'div-banner-2',
          mediaTypes: {
            banner: {
              sizes: [[300, 600]]
            }
          },
          bids: [
            {
              bidder: 'appnexus',
              params: {
                placementId: '13144370'
              }
            }
          ]
        }
      ]

      const enrichedAdUnits = await adapter.enrichAdUnits(adUnits)

      expect(enrichedAdUnits).toBeDefined()
      expect(enrichedAdUnits.length).toBe(2)

      // Check first ad unit
      const firstUnit = enrichedAdUnits[0]
      expect(firstUnit.ortb2Imp).toBeDefined()
      expect(firstUnit.ortb2Imp.ext).toBeDefined()
      expect(firstUnit.ortb2Imp.ext.data).toBeDefined()

      const targetingKeys = firstUnit.ortb2Imp.ext.data

      console.log('✓ Targeting keys injected:', {
        taxonomy: targetingKeys.hb_mixpeek_taxonomy,
        category: targetingKeys.hb_mixpeek_category,
        score: targetingKeys.hb_mixpeek_score,
        safety: targetingKeys.hb_mixpeek_safety,
        keywords: targetingKeys.hb_mixpeek_keywords
      })

      // Verify key structure
      if (targetingKeys.hb_mixpeek_category) {
        expect(typeof targetingKeys.hb_mixpeek_category).toBe('string')
      }
      
      if (targetingKeys.hb_mixpeek_score) {
        const score = parseFloat(targetingKeys.hb_mixpeek_score)
        expect(score).toBeGreaterThan(0)
        expect(score).toBeLessThanOrEqual(1)
      }

      // Check that bids also have targeting keys
      const firstBid = firstUnit.bids[0]
      expect(firstBid.params.keywords).toBeDefined()
      
      console.log('✓ Ad units enriched successfully')
    }, TEST_CONFIG.timeout)
  })

  describe('Performance', () => {
    test('should complete enrichment within acceptable time', async () => {
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - API key or collection ID not configured')
        return
      }

      if (!adapter.initialized) {
        await adapter.init({
          apiKey: TEST_CONFIG.apiKey,
          collectionId: TEST_CONFIG.collectionId,
          namespace: TEST_CONFIG.namespace,
          timeout: 5000,
          enableCache: false // Disable cache for accurate timing
        })
      }

      const adUnits = [{ code: 'test-unit', bids: [] }]

      const startTime = performance.now()
      await adapter.enrichAdUnits(adUnits)
      const duration = performance.now() - startTime

      console.log(`✓ Enrichment completed in ${duration.toFixed(2)}ms`)

      // Should complete within a reasonable time (5 seconds for live API)
      expect(duration).toBeLessThan(5000)
    }, TEST_CONFIG.timeout)
  })

  describe('Error Recovery', () => {
    test('should handle API errors gracefully', async () => {
      if (skipIfNoApiKey()) {
        console.log('⏭️  Skipping - no API key configured')
        return
      }

      // Initialize with invalid collection ID
      const initResult = await adapter.init({
        apiKey: TEST_CONFIG.apiKey,
        collectionId: 'invalid_collection_12345',
        namespace: TEST_CONFIG.namespace,
        timeout: 5000
      })

      // init() should succeed even with invalid collection
      expect(initResult).toBe(true)

      const adUnits = [{ code: 'test-unit', bids: [] }]

      // Should not throw, but gracefully return enriched ad units (with fallback data)
      const result = await adapter.enrichAdUnits(adUnits)

      // Result should be an array
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(adUnits.length)

      console.log('✓ Error handled gracefully, ad auction not blocked')
    }, TEST_CONFIG.timeout)
  })
})

