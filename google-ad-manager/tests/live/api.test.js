/**
 * Live API Tests - Google Ad Manager Connector
 *
 * These tests require valid Mixpeek API credentials.
 * Run with: MIXPEEK_API_KEY=your_key MIXPEEK_COLLECTION_ID=your_collection MIXPEEK_NAMESPACE=your_ns npm run test:live
 */

import { createEnricher } from '../../src/index.js'

const apiKey = process.env.MIXPEEK_API_KEY
const collectionId = process.env.MIXPEEK_COLLECTION_ID
const namespace = process.env.MIXPEEK_NAMESPACE

const hasCredentials = apiKey && collectionId && namespace

describe('Live API Tests', () => {
  let enricher

  beforeAll(() => {
    if (!hasCredentials) {
      console.warn('Skipping live API tests - credentials not provided')
      return
    }

    enricher = createEnricher({
      apiKey,
      collectionId,
      namespace,
      timeout: 5000,
      enableCache: true
    })
  })

  beforeEach(() => {
    if (enricher) {
      enricher.clearCache()
    }
  })

  const conditionalTest = hasCredentials ? test : test.skip

  describe('Health Check', () => {
    conditionalTest('should pass health check', async () => {
      const result = await enricher.healthCheck()

      expect(result).toBeDefined()
      expect(result.latencyMs).toBeGreaterThan(0)
    }, 10000)
  })

  describe('Content Enrichment', () => {
    conditionalTest('should enrich technology content', async () => {
      const content = {
        url: 'https://techcrunch.com/2024/01/15/ai-startup-raises-funding',
        title: 'AI Startup Raises $50M in Series B Funding',
        text: 'A promising artificial intelligence startup has secured $50 million in Series B funding, led by top-tier venture capital firms. The company plans to use the investment to expand its cloud computing infrastructure and hire additional machine learning engineers.'
      }

      const result = await enricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.targeting).toBeDefined()
      expect(result.targeting.mixpeek_category).toBeDefined()
      expect(result.latencyMs).toBeGreaterThan(0)
      expect(result.gptCode).toContain('googletag')
    }, 15000)

    conditionalTest('should enrich sports content', async () => {
      const content = {
        url: 'https://espn.com/nfl/story',
        title: 'NFL Playoffs: Championship Game Preview',
        text: 'The championship game promises to be an exciting matchup between two powerhouse teams. Both football squads have shown exceptional performance throughout the season.'
      }

      const result = await enricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.targeting).toBeDefined()
      expect(result.targeting.mixpeek_sentiment).toBeDefined()
    }, 15000)

    conditionalTest('should handle video content', async () => {
      const content = {
        url: 'https://youtube.com/watch?v=example',
        title: 'Product Review: Latest Smartphone',
        text: 'In this video, we review the latest smartphone release. Great camera quality and amazing battery life make this an excellent choice.',
        type: 'video'
      }

      const result = await enricher.enrich(content)

      expect(result).toBeDefined()
      expect(result.targeting).toBeDefined()
    }, 15000)
  })

  describe('Slot Targeting', () => {
    conditionalTest('should return slot-specific targeting', async () => {
      const content = {
        url: 'https://example.com/finance/article',
        title: 'Investment Strategies for 2024',
        text: 'Learn about effective investment strategies for the coming year. Stock market analysis and financial planning tips.'
      }

      const result = await enricher.getSlotTargeting(content, 'div-gpt-ad-12345')

      expect(result.slotId).toBe('div-gpt-ad-12345')
      expect(result.targeting).toBeDefined()
      expect(result.latencyMs).toBeGreaterThan(0)
    }, 15000)
  })

  describe('Ad Adjacency', () => {
    conditionalTest('should track ad adjacency', async () => {
      // Record some ad impressions
      enricher.recordAdImpression({ advertiserId: 'adv_001', category: 'Technology', creativeId: 'cr_001' })
      enricher.recordAdImpression({ advertiserId: 'adv_002', category: 'Finance', creativeId: 'cr_002' })

      const adjacency = enricher.getAdAdjacency()

      expect(adjacency).toHaveLength(2)
      expect(adjacency[0].advertiserId).toBe('adv_001')
      expect(adjacency[1].advertiserId).toBe('adv_002')
    })

    conditionalTest('should include adjacency in slot targeting', async () => {
      enricher.clearAdAdjacency()
      enricher.recordAdImpression({ advertiserId: 'adv_tech', category: 'Technology' })

      const content = {
        url: 'https://example.com/tech/article',
        title: 'Technology Article',
        text: 'Software development and cloud computing news.'
      }

      const result = await enricher.getSlotTargeting(content, 'slot_123')

      expect(result.targeting.mixpeek_adjacency_score).toBeDefined()
    }, 15000)
  })

  describe('Caching', () => {
    conditionalTest('should cache results', async () => {
      const content = {
        url: 'https://example.com/cached-test',
        title: 'Cache Test Article',
        text: 'This is a test article for caching verification.'
      }

      // First request
      const result1 = await enricher.enrich(content)
      expect(result1.cached).toBe(false)

      // Second request should be cached
      const result2 = await enricher.enrich(content)
      expect(result2.cached).toBe(true)
      expect(result2.latencyMs).toBeLessThan(result1.latencyMs)
    }, 20000)
  })

  describe('Yield Optimization', () => {
    conditionalTest('should provide yield recommendations for premium content', async () => {
      const content = {
        url: 'https://wsj.com/markets/analysis',
        title: 'Market Analysis: Tech Stocks Rally',
        text: 'Technology stocks experienced a significant rally today as investors responded positively to earnings reports. The comprehensive analysis shows strong fundamentals across major tech companies, with cloud computing and artificial intelligence sectors leading the gains. Industry experts predict continued growth in enterprise software and digital transformation initiatives.'
      }

      const result = await enricher.enrich(content)

      expect(result.yield).toBeDefined()
      expect(result.yield.suggestedFloorMultiplier).toBeGreaterThanOrEqual(1.0)
    }, 15000)
  })

  describe('Validation', () => {
    conditionalTest('should validate targeting keys', async () => {
      const content = {
        url: 'https://example.com/article',
        title: 'Test Article',
        text: 'Test content for validation.'
      }

      const result = await enricher.enrich(content)
      const validation = enricher.validateTargeting(result.targeting)

      expect(validation.valid).toBe(true)
      expect(validation.issues).toHaveLength(0)
    }, 15000)
  })
})
