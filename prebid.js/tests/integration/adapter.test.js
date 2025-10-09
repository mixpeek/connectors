/**
 * Integration tests for Mixpeek Context Adapter
 */

import adapter from '../../src/modules/mixpeekContextAdapter.js'
import { EVENTS } from '../../src/config/constants.js'

describe('Mixpeek Context Adapter - Integration', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    collectionId: 'test-collection',
    featureExtractors: ['taxonomy', 'brand-safety'],
    timeout: 1000,
    cacheTTL: 300,
    debug: true
  }

  const mockDocument = {
    document_id: 'doc_123',
    object_id: 'obj_123',
    enrichments: {
      taxonomies: [
        {
          label: 'IAB12-6: Mobile Phones',
          node_id: 'node_mobile_phones',
          path: ['products', 'electronics', 'phones'],
          score: 0.92
        }
      ],
      brand_safety: {
        score: 0.95
      },
      keywords: ['technology', 'mobile', 'phones']
    }
  }

  beforeEach(() => {
    adapter.clearCache()
    global.fetch.mockClear()
  })

  describe('initialization', () => {
    it('should initialize successfully with valid config', () => {
      const result = adapter.init(mockConfig)
      expect(result).toBe(true)
      expect(adapter.initialized).toBe(true)
    })

    it('should fail with invalid config', () => {
      const result = adapter.init({})
      expect(result).toBe(false)
    })
  })

  describe('enrichAdUnits', () => {
    beforeEach(() => {
      adapter.init(mockConfig)
    })

    it('should enrich ad units with context', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDocument
      })

      const adUnits = [
        {
          code: 'div-1',
          mediaTypes: {
            banner: {
              sizes: [[300, 250]]
            }
          },
          bids: [
            {
              bidder: 'rubicon',
              params: {}
            }
          ]
        }
      ]

      const enriched = await adapter.enrichAdUnits(adUnits)

      expect(enriched[0].ortb2Imp).toBeDefined()
      expect(enriched[0].ortb2Imp.ext.data.hb_mixpeek_taxonomy).toBe('IAB12-6')
      expect(enriched[0].ortb2Imp.ext.data.hb_mixpeek_category).toBe('IAB12-6: Mobile Phones')
    })

    it('should use cached context on subsequent calls', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDocument
      })

      const adUnits = [{ code: 'div-1', bids: [] }]

      // First call - should fetch from API
      await adapter.enrichAdUnits(adUnits)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      await adapter.enrichAdUnits(adUnits)
      expect(global.fetch).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const adUnits = [{ code: 'div-1', bids: [] }]
      const enriched = await adapter.enrichAdUnits(adUnits)

      // Should return original ad units
      expect(enriched).toEqual(adUnits)
    })
  })

  describe('events', () => {
    beforeEach(() => {
      adapter.init(mockConfig)
    })

    it('should emit contextReady event on success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDocument
      })

      const eventHandler = jest.fn()
      adapter.on(EVENTS.CONTEXT_READY, eventHandler)

      await adapter.enrichAdUnits([{ code: 'div-1', bids: [] }])

      expect(eventHandler).toHaveBeenCalled()
      expect(eventHandler.mock.calls[0][0].taxonomy).toBeDefined()
    })

    it('should emit contextError event on failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API error'))

      const eventHandler = jest.fn()
      adapter.on(EVENTS.CONTEXT_ERROR, eventHandler)

      await adapter.enrichAdUnits([{ code: 'div-1', bids: [] }])

      expect(eventHandler).toHaveBeenCalled()
    })

    it('should emit cached event when using cache', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDocument
      })

      const cachedHandler = jest.fn()
      adapter.on(EVENTS.CONTEXT_CACHED, cachedHandler)

      // First call
      await adapter.enrichAdUnits([{ code: 'div-1', bids: [] }])

      // Second call (cached)
      await adapter.enrichAdUnits([{ code: 'div-1', bids: [] }])

      expect(cachedHandler).toHaveBeenCalled()
    })
  })

  describe('context data', () => {
    beforeEach(() => {
      adapter.init(mockConfig)
    })

    it('should store context data after enrichment', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDocument
      })

      await adapter.enrichAdUnits([{ code: 'div-1', bids: [] }])

      const contextData = adapter.getContextData()
      expect(contextData).toBeDefined()
      expect(contextData.taxonomy.label).toBe('IAB12-6: Mobile Phones')
    })
  })

  describe('health check', () => {
    beforeEach(() => {
      adapter.init(mockConfig)
    })

    it('should perform health check', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' })
      })

      const health = await adapter.healthCheck()
      expect(health.status).toBe('ok')
    })
  })
})

