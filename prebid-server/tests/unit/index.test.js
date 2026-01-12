/**
 * Unit Tests - Main Module
 */

import { createEnricher } from '../../src/index.js'

describe('createEnricher', () => {
  test('should throw error if apiKey is missing', () => {
    expect(() => createEnricher({
      collectionId: 'test',
      namespace: 'ns_test'
    })).toThrow('apiKey is required')
  })

  test('should throw error if collectionId is missing', () => {
    expect(() => createEnricher({
      apiKey: 'test_key',
      namespace: 'ns_test'
    })).toThrow('collectionId is required')
  })

  test('should throw error if namespace is missing', () => {
    expect(() => createEnricher({
      apiKey: 'test_key',
      collectionId: 'test'
    })).toThrow('namespace is required')
  })

  test('should create enricher with valid config', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    expect(enricher).toBeDefined()
    expect(typeof enricher.enrich).toBe('function')
    expect(typeof enricher.enrichBidRequest).toBe('function')
    expect(typeof enricher.healthCheck).toBe('function')
    expect(typeof enricher.clearCache).toBe('function')
    expect(typeof enricher.getCacheStats).toBe('function')
  })

  test('should return cache stats', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      enableCache: true,
      cacheTTL: 600
    })

    const stats = enricher.getCacheStats()

    expect(stats.enabled).toBe(true)
    expect(stats.ttlMs).toBe(600000)
    expect(stats.size).toBe(0)
  })

  test('should clear cache', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    // Should not throw
    enricher.clearCache()
    expect(enricher.getCacheStats().size).toBe(0)
  })
})

describe('Enricher.enrich', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      timeout: 100
    })
    enricher.clearCache()
  })

  test('should return enrichment result with fallback on API error', async () => {
    const content = {
      url: 'https://example.com/tech-article',
      title: 'Technology Innovation',
      text: 'This article discusses technology and software development.'
    }

    const result = await enricher.enrich(content)

    expect(result).toBeDefined()
    expect(result.ortb2).toBeDefined()
    expect(result.targeting).toBeDefined()
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    // Should have fallback data
    expect(result.ortb2.site.content).toBeDefined()
  })

  test('should cache results', async () => {
    const content = {
      url: 'https://example.com/test',
      title: 'Test Article'
    }

    // First call
    const result1 = await enricher.enrich(content)
    expect(result1.cached).toBe(false)

    // Second call should be cached
    const result2 = await enricher.enrich(content)
    expect(result2.cached).toBe(true)
    expect(result2.latencyMs).toBeLessThan(result1.latencyMs || 100)
  })
})

describe('Enricher.enrichBidRequest', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      timeout: 100
    })
  })

  test('should enrich bid request with content', async () => {
    const bidRequest = {
      id: 'bid_123',
      site: {
        page: 'https://example.com/tech-article',
        content: {
          title: 'Technology Article'
        }
      },
      imp: [
        { id: 'imp_1', banner: { w: 300, h: 250 } }
      ]
    }

    const enriched = await enricher.enrichBidRequest(bidRequest)

    expect(enriched.site.content).toBeDefined()
    expect(enriched.imp[0].ext).toBeDefined()
  })

  test('should return original bid request if no content to analyze', async () => {
    const bidRequest = {
      id: 'bid_123'
    }

    const enriched = await enricher.enrichBidRequest(bidRequest)

    expect(enriched).toEqual(bidRequest)
  })
})
