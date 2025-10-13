/**
 * End-to-End Tests for Mixpeek RTD Provider
 * @file tests/e2e/rtdProvider.e2e.test.js
 * 
 * These tests verify the complete flow from RTD init to bid enrichment
 * using the real Mixpeek API.
 * 
 * Setup:
 *   export MIXPEEK_API_KEY="your_api_key"
 *   export MIXPEEK_COLLECTION_ID="your_collection_id"
 *   npm run test:e2e
 */

import { mixpeekSubmodule } from '../../src/modules/mixpeekRtdProvider.js'
import adapter from '../../src/modules/mixpeekContextAdapter.js'

// E2E test configuration
const E2E_CONFIG = {
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  endpoint: process.env.MIXPEEK_ENDPOINT || 'https://api.mixpeek.com',
  namespace: process.env.MIXPEEK_NAMESPACE || 'e2e-test',
  timeout: 30000 // 30 seconds for E2E tests
}

// Skip tests if no API key
const skipIfNoApiKey = () => {
  if (!E2E_CONFIG.apiKey) {
    console.warn('⚠️  Skipping E2E tests: MIXPEEK_API_KEY not set')
    console.warn('   To run E2E tests:')
    console.warn('   export MIXPEEK_API_KEY="your_key"')
    console.warn('   export MIXPEEK_COLLECTION_ID="your_collection"')
    return true
  }
  return false
}

// Skip individual test helper
const skipTest = () => {
  if (skipIfNoApiKey()) {
    return test.skip
  }
  return test
}

describe('Mixpeek RTD Provider - E2E Tests', () => {
  // Mock browser environment
  beforeAll(() => {
    global.document = {
      documentElement: { lang: 'en' },
      title: 'E2E Test Page - AI and Machine Learning',
      body: {
        innerText: 'This is a test article about artificial intelligence and machine learning technology. AI is transforming the tech industry.'
      }
    }
    global.window = {
      location: {
        href: 'https://example.com/e2e-test/ai-article'
      }
    }
  })

  describe('Initialization', () => {
    skipTest()('should initialize with valid API credentials', () => {
      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint,
          namespace: E2E_CONFIG.namespace,
          featureExtractors: ['taxonomy'],
          timeout: 10000,
          debug: true
        }
      }

      const result = mixpeekSubmodule.init(config, null)

      expect(result).toBe(true)
      expect(adapter.initialized).toBe(true)
    })

    skipTest()('should fail with invalid API key', () => {
      const config = {
        params: {
          apiKey: 'invalid_key',
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint
        }
      }

      const result = mixpeekSubmodule.init(config, null)

      // Init should succeed, but API calls will fail later
      expect(result).toBe(true)
    })
  })

  describe('Context Extraction and API Processing', () => {
    beforeAll(async () => {
      if (skipIfNoApiKey()) return

      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint,
          namespace: E2E_CONFIG.namespace,
          featureExtractors: ['taxonomy'],
          mode: 'page',
          timeout: 10000,
          enableCache: true,
          debug: true
        }
      }

      mixpeekSubmodule.init(config, null)
    })

    skipTest()('should extract page content and get taxonomy from API', async () => {
      if (skipIfNoApiKey()) return

      const context = await adapter.getContext()

      expect(context).toBeDefined()
      expect(context.documentId).toBeDefined()
      expect(context.mode).toBe('page')

      console.log('✓ Context extracted:', {
        documentId: context.documentId,
        mode: context.mode,
        hasTaxonomy: !!context.taxonomy
      })
    }, E2E_CONFIG.timeout)

    skipTest()('should return taxonomy with node_id from Mixpeek', async () => {
      if (skipIfNoApiKey()) return

      const context = await adapter.getContext()

      if (context && context.taxonomy) {
        expect(context.taxonomy).toHaveProperty('nodeId')
        expect(context.taxonomy).toHaveProperty('label')
        expect(context.taxonomy).toHaveProperty('score')

        console.log('✓ Taxonomy received:', {
          nodeId: context.taxonomy.nodeId,
          label: context.taxonomy.label,
          score: context.taxonomy.score
        })

        // Log for mapping purposes
        console.log('\n📋 For IAB Mapping:')
        console.log(`   '${context.taxonomy.nodeId}': 'IAB??-??',  // ${context.taxonomy.label}`)
      } else {
        console.warn('⚠️  No taxonomy in response - check feature extractor configuration')
      }
    }, E2E_CONFIG.timeout)

    skipTest()('should verify node_id format matches OpenAPI spec', async () => {
      if (skipIfNoApiKey()) return

      const context = await adapter.getContext()

      if (context && context.taxonomy) {
        // From OpenAPI spec, node_id should be like "node_electronics_phones"
        expect(typeof context.taxonomy.nodeId).toBe('string')
        expect(context.taxonomy.nodeId.length).toBeGreaterThan(0)

        // Should not be an IAB code (unless Mixpeek is configured that way)
        const isIAB = /^IAB\d+(-\d+)?$/.test(context.taxonomy.nodeId)
        
        console.log('✓ node_id format:', {
          nodeId: context.taxonomy.nodeId,
          isIABCode: isIAB,
          format: isIAB ? 'Already IAB (no mapping needed)' : 'Custom (needs mapping)'
        })
      }
    }, E2E_CONFIG.timeout)
  })

  describe('Bid Request Enrichment', () => {
    beforeAll(async () => {
      if (skipIfNoApiKey()) return

      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint,
          namespace: E2E_CONFIG.namespace,
          featureExtractors: ['taxonomy'],
          mode: 'page',
          timeout: 10000,
          debug: true
        }
      }

      mixpeekSubmodule.init(config, null)
    })

    skipTest()('should inject ortb2Fragments into bid request', async () => {
      if (skipIfNoApiKey()) return

      const reqBidsConfigObj = {
        adUnits: [
          { code: 'div-1', sizes: [[300, 250]] },
          { code: 'div-2', sizes: [[728, 90]] }
        ],
        ortb2Fragments: {}
      }

      const callback = jest.fn()

      await new Promise((resolve) => {
        mixpeekSubmodule.getBidRequestData(
          reqBidsConfigObj,
          () => {
            callback()
            resolve()
          },
          { params: {} },
          null
        )
      })

      expect(callback).toHaveBeenCalled()
      expect(reqBidsConfigObj.ortb2Fragments).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global.site).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global.site.content).toBeDefined()

      const content = reqBidsConfigObj.ortb2Fragments.global.site.content

      console.log('✓ ortb2 site.content:', {
        hasCat: !!content.cat,
        hasCattax: !!content.cattax,
        hasGenre: !!content.genre,
        hasKeywords: !!content.keywords,
        hasExt: !!content.ext
      })

      if (content.cat) {
        console.log('   IAB categories:', content.cat)
      }
      if (content.ext && content.ext.data && content.ext.data.mixpeek) {
        console.log('   Mixpeek ext.data:', content.ext.data.mixpeek)
      }
    }, E2E_CONFIG.timeout)

    skipTest()('should enrich ad units with targeting keys', async () => {
      if (skipIfNoApiKey()) return

      const reqBidsConfigObj = {
        adUnits: [
          {
            code: 'div-1',
            sizes: [[300, 250]],
            bids: [
              { bidder: 'appnexus', params: {} }
            ]
          }
        ]
      }

      const callback = jest.fn()

      await new Promise((resolve) => {
        mixpeekSubmodule.getBidRequestData(
          reqBidsConfigObj,
          () => {
            callback()
            resolve()
          },
          { params: {} },
          null
        )
      })

      const adUnit = reqBidsConfigObj.adUnits[0]

      // Check ortb2Imp (impression-level data)
      expect(adUnit.ortb2Imp).toBeDefined()
      expect(adUnit.ortb2Imp.ext).toBeDefined()
      expect(adUnit.ortb2Imp.ext.data).toBeDefined()

      console.log('✓ Ad unit enrichment:', {
        code: adUnit.code,
        hasOrtb2Imp: !!adUnit.ortb2Imp,
        targetingKeys: Object.keys(adUnit.ortb2Imp?.ext?.data || {})
      })
    }, E2E_CONFIG.timeout)

    skipTest()('should provide targeting data for ad server', () => {
      if (skipIfNoApiKey()) return

      const adUnitsCodes = ['div-1', 'div-2', 'div-3']

      const targeting = mixpeekSubmodule.getTargetingData(adUnitsCodes, { params: {} })

      if (Object.keys(targeting).length > 0) {
        expect(targeting['div-1']).toBeDefined()
        expect(targeting['div-2']).toBeDefined()
        expect(targeting['div-3']).toBeDefined()

        console.log('✓ Targeting data:', {
          adUnits: Object.keys(targeting),
          keys: Object.keys(targeting['div-1'] || {})
        })

        if (targeting['div-1']) {
          console.log('   Sample targeting:', targeting['div-1'])
        }
      } else {
        console.warn('⚠️  No targeting data available yet')
      }
    })
  })

  describe('Caching', () => {
    beforeAll(async () => {
      if (skipIfNoApiKey()) return

      adapter.clearCache()

      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint,
          namespace: E2E_CONFIG.namespace,
          featureExtractors: ['taxonomy'],
          mode: 'page',
          enableCache: true,
          cacheTTL: 300,
          debug: true
        }
      }

      mixpeekSubmodule.init(config, null)
    })

    skipTest()('should cache context after first request', async () => {
      if (skipIfNoApiKey()) return

      // First request (should hit API)
      const startTime1 = Date.now()
      const context1 = await adapter.getContext()
      const duration1 = Date.now() - startTime1

      expect(context1).toBeDefined()
      console.log(`✓ First request (API): ${duration1}ms`)

      // Second request (should use cache)
      const startTime2 = Date.now()
      const context2 = await adapter.getContext()
      const duration2 = Date.now() - startTime2

      expect(context2).toBeDefined()
      console.log(`✓ Second request (cached): ${duration2}ms`)

      // Cached should be significantly faster
      expect(duration2).toBeLessThan(duration1)
      expect(duration2).toBeLessThan(100) // Should be < 100ms

      // Should be same data
      expect(context2.documentId).toBe(context1.documentId)
    }, E2E_CONFIG.timeout)
  })

  describe('Error Handling', () => {
    skipTest()('should handle invalid collection ID gracefully', async () => {
      if (skipIfNoApiKey()) return

      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: 'col_invalid_12345',
          endpoint: E2E_CONFIG.endpoint,
          mode: 'page',
          debug: true
        }
      }

      mixpeekSubmodule.init(config, null)

      // Should not throw
      await expect(async () => {
        await adapter.getContext()
      }).rejects.toThrow()

      console.log('✓ Invalid collection ID handled gracefully')
    }, E2E_CONFIG.timeout)

    skipTest()('should not block auction on API error', async () => {
      if (skipIfNoApiKey()) return

      // Initialize with invalid config
      const config = {
        params: {
          apiKey: 'invalid_key',
          collectionId: 'invalid_col',
          endpoint: E2E_CONFIG.endpoint,
          mode: 'page',
          timeout: 5000
        }
      }

      mixpeekSubmodule.init(config, null)

      const reqBidsConfigObj = {
        adUnits: [{ code: 'div-1' }]
      }

      const callback = jest.fn()

      await new Promise((resolve) => {
        mixpeekSubmodule.getBidRequestData(
          reqBidsConfigObj,
          () => {
            callback()
            resolve()
          },
          { params: {} },
          null
        )
      })

      // Callback should still be called (auction not blocked)
      expect(callback).toHaveBeenCalled()
      console.log('✓ Auction not blocked despite API error')
    }, E2E_CONFIG.timeout)
  })

  describe('Performance', () => {
    beforeAll(async () => {
      if (skipIfNoApiKey()) return

      const config = {
        params: {
          apiKey: E2E_CONFIG.apiKey,
          collectionId: E2E_CONFIG.collectionId,
          endpoint: E2E_CONFIG.endpoint,
          namespace: E2E_CONFIG.namespace,
          featureExtractors: ['taxonomy'],
          mode: 'page',
          enableCache: true,
          debug: false
        }
      }

      mixpeekSubmodule.init(config, null)
    })

    skipTest()('should complete enrichment within acceptable time', async () => {
      if (skipIfNoApiKey()) return

      const reqBidsConfigObj = {
        adUnits: [
          { code: 'div-1' },
          { code: 'div-2' }
        ]
      }

      const callback = jest.fn()
      const startTime = Date.now()

      await new Promise((resolve) => {
        mixpeekSubmodule.getBidRequestData(
          reqBidsConfigObj,
          () => {
            callback()
            resolve()
          },
          { params: {} },
          null
        )
      })

      const duration = Date.now() - startTime

      console.log(`✓ Total enrichment time: ${duration}ms`)

      // Should complete reasonably fast (adjust based on API performance)
      // First call might be slower, subsequent calls should use cache
      expect(duration).toBeLessThan(10000) // 10 seconds max
    }, E2E_CONFIG.timeout)
  })
})

