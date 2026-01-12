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
    expect(typeof enricher.getSlotTargeting).toBe('function')
    expect(typeof enricher.healthCheck).toBe('function')
    expect(typeof enricher.clearCache).toBe('function')
    expect(typeof enricher.getCacheStats).toBe('function')
    expect(typeof enricher.recordAdImpression).toBe('function')
    expect(typeof enricher.getAdAdjacency).toBe('function')
    expect(typeof enricher.validateTargeting).toBe('function')
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

  test('should support shadow mode', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      shadowMode: true
    })

    expect(enricher.isShadowMode()).toBe(true)
  })

  test('should default to non-shadow mode', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    expect(enricher.isShadowMode()).toBe(false)
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
      text: 'This article discusses technology and software development in the cloud.'
    }

    const result = await enricher.enrich(content)

    expect(result).toBeDefined()
    expect(result.targeting).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    // Should have fallback data
    expect(result.targeting.mixpeek_category).toBeDefined()
  })

  test('should include GAM-specific targeting keys', async () => {
    const content = {
      url: 'https://example.com/tech-article',
      title: 'Technology Innovation',
      text: 'This article discusses great technology advances and software development.'
    }

    const result = await enricher.enrich(content)

    // Check for GAM-specific keys
    expect(result.targeting).toHaveProperty('mixpeek_category')
    expect(result.targeting).toHaveProperty('mixpeek_sentiment')
    expect(result.targeting).toHaveProperty('mixpeek_suitability')
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

  test('should provide applyToGPT method', async () => {
    const content = {
      url: 'https://example.com/tech',
      title: 'Tech Article',
      text: 'Technology software development'
    }

    const result = await enricher.enrich(content)

    expect(result.applyToGPT).toBeDefined()
    expect(typeof result.applyToGPT).toBe('function')

    // Should have inventory classification
    expect(result.inventory).toBeDefined()
    expect(result.inventory.isPremium).toBeDefined()
    expect(result.inventory.isBrandSafe).toBeDefined()
    expect(result.inventory.qualityMultiplier).toBeDefined()
  })

  test('should include yield recommendations', async () => {
    const content = {
      url: 'https://example.com/article',
      title: 'Business Article',
      text: 'This is a great business article about investment and market trends.'
    }

    const result = await enricher.enrich(content)

    expect(result.yield).toBeDefined()
    expect(result.yield).toHaveProperty('isPremium')
    expect(result.yield).toHaveProperty('isBrandSafe')
    expect(result.yield).toHaveProperty('suggestedFloorMultiplier')
  })
})

describe('Enricher.getSlotTargeting', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      timeout: 100
    })
    enricher.clearCache()
    enricher.clearAdAdjacency()
  })

  test('should return slot-specific targeting', async () => {
    const content = {
      url: 'https://example.com/tech',
      title: 'Tech Article'
    }

    const result = await enricher.getSlotTargeting(content, 'slot_123')

    expect(result.slotId).toBe('slot_123')
    expect(result.targeting).toBeDefined()
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })

  test('should include adjacency score with previous ads', async () => {
    const content = {
      url: 'https://example.com/tech',
      title: 'Tech Article'
    }

    // Record some previous ads
    enricher.recordAdImpression({ advertiserId: 'adv_1', category: 'Technology' })
    enricher.recordAdImpression({ advertiserId: 'adv_2', category: 'Finance' })

    const result = await enricher.getSlotTargeting(content, 'slot_123')

    expect(result.targeting.mixpeek_adjacency_score).toBeDefined()
  })
})

describe('Enricher ad adjacency tracking', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })
    enricher.clearAdAdjacency()
  })

  test('should record ad impressions', () => {
    enricher.recordAdImpression({ advertiserId: 'adv_1', category: 'Tech' })
    enricher.recordAdImpression({ advertiserId: 'adv_2', category: 'Finance' })

    const adjacency = enricher.getAdAdjacency()

    expect(adjacency).toHaveLength(2)
    expect(adjacency[0].advertiserId).toBe('adv_1')
    expect(adjacency[1].advertiserId).toBe('adv_2')
  })

  test('should limit adjacency history', () => {
    // Record more than max
    for (let i = 0; i < 15; i++) {
      enricher.recordAdImpression({ advertiserId: `adv_${i}` })
    }

    const adjacency = enricher.getAdAdjacency()
    expect(adjacency.length).toBeLessThanOrEqual(10)
  })

  test('should clear adjacency history', () => {
    enricher.recordAdImpression({ advertiserId: 'adv_1' })
    enricher.recordAdImpression({ advertiserId: 'adv_2' })

    enricher.clearAdAdjacency()

    expect(enricher.getAdAdjacency()).toHaveLength(0)
  })
})

describe('Enricher validation', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })
  })

  test('should validate valid targeting keys', () => {
    const targeting = {
      mixpeek_category: 'technology',
      mixpeek_sentiment: 'positive',
      mixpeek_suitability: 'high'
    }

    const result = enricher.validateTargeting(targeting)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  test('should catch invalid characters in keys', () => {
    const targeting = {
      'mixpeek-invalid!': 'value'
    }

    const result = enricher.validateTargeting(targeting)

    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })
})
