/**
 * E2E Tests - Google Ad Manager Integration
 *
 * Tests the full workflow from content input to GAM targeting output.
 * Simulates real-world GAM integration scenarios.
 */

import { createEnricher, TARGETING_KEYS } from '../../src/index.js'

describe('E2E: GAM Integration Workflow', () => {
  let enricher

  beforeAll(() => {
    enricher = createEnricher({
      apiKey: process.env.MIXPEEK_API_KEY || 'test_key',
      collectionId: process.env.MIXPEEK_COLLECTION_ID || 'test_collection',
      namespace: process.env.MIXPEEK_NAMESPACE || 'ns_test',
      timeout: 5000,
      enableCache: true
    })
  })

  beforeEach(() => {
    enricher.clearCache()
    enricher.clearAdAdjacency()
  })

  describe('Publisher Page Load Scenario', () => {
    test('should enrich page content and produce GAM targeting', async () => {
      // Simulate page content extraction
      const pageContent = {
        url: 'https://publisher.com/news/technology/ai-advances',
        title: 'Latest AI Advances Transform Healthcare Industry',
        text: 'Artificial intelligence is revolutionizing healthcare with new diagnostic tools. Machine learning algorithms can now detect diseases earlier and more accurately than traditional methods. The technology sector continues to invest heavily in healthcare AI.',
        language: 'en'
      }

      // Get enrichment
      const result = await enricher.enrich(pageContent)

      // Verify structure
      expect(result).toHaveProperty('targeting')
      expect(result).toHaveProperty('context')
      expect(result).toHaveProperty('yield')
      expect(result).toHaveProperty('gptCode')
      expect(result).toHaveProperty('latencyMs')

      // Verify targeting keys exist
      expect(result.targeting[TARGETING_KEYS.CATEGORY]).toBeDefined()

      // Verify GPT code is valid JavaScript structure
      expect(result.gptCode).toMatch(/googletag\.cmd\.push\(function\(\)/)
      expect(result.gptCode).toMatch(/setTargeting\(/)
    })
  })

  describe('Multi-Slot Ad Request Scenario', () => {
    test('should handle multiple ad slots with different content contexts', async () => {
      const pageContent = {
        url: 'https://news.com/article',
        title: 'Business News Today',
        text: 'Market analysis shows strong performance in technology stocks.'
      }

      // Simulate multiple ad slots on a page
      const slots = ['div-gpt-ad-header', 'div-gpt-ad-sidebar', 'div-gpt-ad-footer']

      // First request to populate cache
      const firstResult = await enricher.getSlotTargeting(pageContent, slots[0])
      expect(firstResult.slotId).toBe(slots[0])
      expect(firstResult.targeting).toBeDefined()

      // Subsequent requests should be cached
      const cachedResults = await Promise.all(
        slots.slice(1).map(slotId => enricher.getSlotTargeting(pageContent, slotId))
      )

      // All slots should get targeting
      cachedResults.forEach((result, index) => {
        expect(result.slotId).toBe(slots[index + 1])
        expect(result.targeting).toBeDefined()
      })

      // Cached requests should be fast
      cachedResults.forEach(result => {
        expect(result.latencyMs).toBeLessThanOrEqual(firstResult.latencyMs + 50) // Allow some variance
      })
    })
  })

  describe('Ad Adjacency Prevention Scenario', () => {
    test('should track competitive separation across ad requests', async () => {
      const content = {
        url: 'https://auto.com/reviews',
        title: 'Car Reviews',
        text: 'Automotive news and vehicle reviews for the latest cars.'
      }

      // Simulate first ad from automotive advertiser
      enricher.recordAdImpression({
        advertiserId: 'toyota_ads',
        category: 'Automotive',
        creativeId: 'toyota_cr_001'
      })

      // Get targeting for next slot
      const result = await enricher.getSlotTargeting(content, 'slot_2')

      // Should have adjacency data
      expect(result.targeting[TARGETING_KEYS.ADJACENCY_SCORE]).toBeDefined()

      // Score should indicate same-category adjacency
      const adjacencyScore = parseFloat(result.targeting[TARGETING_KEYS.ADJACENCY_SCORE])
      expect(adjacencyScore).toBeLessThan(1.0)
    })
  })

  describe('Brand Safety Workflow', () => {
    test('should properly flag sensitive content', async () => {
      const sensitiveContent = {
        url: 'https://news.com/controversial-topic',
        title: 'Breaking: Major Controversy',
        text: 'A major scandal has erupted involving allegations of misconduct. The controversy has led to widespread criticism and calls for accountability.'
      }

      const result = await enricher.enrich(sensitiveContent)

      // Should have suitability assessment
      expect(result.targeting[TARGETING_KEYS.SUITABILITY]).toBeDefined()
      expect(result.context.enrichments?.suitability).toBeDefined()

      // Should have yield impact
      expect(result.yield.isBrandSafe).toBeDefined()
    })

    test('should rate safe content highly', async () => {
      const safeContent = {
        url: 'https://recipe.com/chocolate-cake',
        title: 'Delicious Chocolate Cake Recipe',
        text: 'This wonderful chocolate cake recipe is perfect for celebrations. A beautiful and delicious dessert that everyone will love.'
      }

      const result = await enricher.enrich(safeContent)

      expect(result.targeting[TARGETING_KEYS.SUITABILITY]).toBe('high')
      expect(result.yield.isBrandSafe).toBe(true)
    })
  })

  describe('PMP Deal Targeting Scenario', () => {
    test('should produce PMP-compatible targeting', async () => {
      const premiumContent = {
        url: 'https://businessweek.com/analysis',
        title: 'In-Depth Business Analysis',
        text: 'Comprehensive business analysis of market trends, investment opportunities, and corporate strategy. This detailed report covers financial performance across multiple sectors.'
      }

      const result = await enricher.enrich(premiumContent)

      // Should have PMP targeting
      expect(result.pmpTargeting).toBeDefined()
      expect(result.pmpTargeting.mp_cat).toBeDefined()
      expect(result.pmpTargeting.mp_conf).toBeDefined()
    })
  })

  describe('Yield Optimization Scenario', () => {
    test('should provide floor multiplier recommendations', async () => {
      const highValueContent = {
        url: 'https://techreview.com/ai-guide',
        title: 'Comprehensive AI Technology Guide',
        text: `
          This comprehensive guide explores the latest advances in artificial intelligence technology.
          We cover machine learning, deep neural networks, natural language processing, and computer vision.
          The technology sector continues to see tremendous growth in AI applications across healthcare,
          finance, automotive, and enterprise software. Industry experts predict continued investment
          and innovation in these areas throughout the coming years. Our analysis shows strong fundamentals
          and positive outlook for technology stocks focused on AI development.
        `
      }

      const result = await enricher.enrich(highValueContent)

      expect(result.yield.suggestedFloorMultiplier).toBeDefined()
      expect(typeof result.yield.suggestedFloorMultiplier).toBe('number')

      // Premium content should have multiplier >= 1.0
      if (result.yield.isPremium) {
        expect(result.yield.suggestedFloorMultiplier).toBeGreaterThanOrEqual(1.0)
      }
    })
  })

  describe('Shadow Mode Testing', () => {
    test('should run in shadow mode without affecting production', async () => {
      const shadowEnricher = createEnricher({
        apiKey: 'test_key',
        collectionId: 'test_collection',
        namespace: 'ns_test',
        shadowMode: true
      })

      const content = {
        url: 'https://example.com/article',
        title: 'Test Article'
      }

      const result = await shadowEnricher.enrich(content)

      expect(shadowEnricher.isShadowMode()).toBe(true)
      expect(result.shadowMode).toBe(true)
    })
  })

  describe('Error Resilience', () => {
    test('should gracefully handle API errors with fallback', async () => {
      // Create enricher with invalid credentials
      const badEnricher = createEnricher({
        apiKey: 'invalid_key',
        collectionId: 'invalid_collection',
        namespace: 'ns_invalid',
        timeout: 1000
      })

      const content = {
        url: 'https://example.com/article',
        title: 'Technology Article',
        text: 'Software development and technology news.'
      }

      // Should not throw, should return fallback with targeting
      const result = await badEnricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.targeting).toBeDefined()
      // Targeting should still work even with API errors
      expect(result.targeting.mixpeek_category).toBeDefined()
    })
  })

  describe('Full GAM Workflow Simulation', () => {
    test('should complete full page lifecycle', async () => {
      // 1. Page load - extract content
      const pageContent = {
        url: 'https://publisher.com/sports/basketball-finals',
        title: 'NBA Finals: Game 7 Preview',
        text: 'The basketball championship reaches its climax with Game 7. Both teams have shown excellent performance throughout the series. Fans are excited for what promises to be an amazing game.'
      }

      // 2. Get page-level enrichment
      const enrichment = await enricher.enrich(pageContent)
      expect(enrichment.targeting).toBeDefined()

      // 3. Validate targeting is GAM-compatible
      const validation = enricher.validateTargeting(enrichment.targeting)
      expect(validation.valid).toBe(true)

      // 4. Simulate ad slot requests
      const slot1 = await enricher.getSlotTargeting(pageContent, 'div-gpt-ad-top')
      expect(slot1.targeting).toBeDefined()

      // 5. Record ad impression
      enricher.recordAdImpression({
        advertiserId: 'nike_sports',
        category: 'Sports',
        creativeId: 'nike_basketball_001'
      })

      // 6. Get next slot with adjacency awareness
      const slot2 = await enricher.getSlotTargeting(pageContent, 'div-gpt-ad-mid')
      expect(slot2.targeting[TARGETING_KEYS.ADJACENCY_SCORE]).toBeDefined()

      // 7. Verify GPT code generation
      expect(enrichment.gptCode).toContain('mixpeek_')

      // 8. Check yield recommendations
      expect(enrichment.yield.suggestedFloorMultiplier).toBeDefined()
    })
  })
})
