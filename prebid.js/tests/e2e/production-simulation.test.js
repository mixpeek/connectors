/**
 * Production Simulation E2E Tests
 *
 * Simulates real Prebid auction scenarios with actual API calls
 */

import adapter from '../../src/modules/mixpeekContextAdapter.js'
import { TARGETING_KEYS } from '../../src/config/constants.js'

// Test configuration - uses environment variables
const API_KEY = process.env.MIXPEEK_API_KEY
const NAMESPACE = process.env.MIXPEEK_NAMESPACE || 'ns_601294666a'
const COLLECTION_ID = process.env.MIXPEEK_COLLECTION_ID || 'col_3ed3a98666'

// Simulated page content scenarios
const PAGE_SCENARIOS = {
  techArticle: {
    title: 'The Future of AI in Mobile Technology',
    description: 'Exploring how artificial intelligence is revolutionizing smartphone capabilities',
    body: `
      Artificial intelligence is transforming the mobile phone industry at an unprecedented pace.
      From advanced camera systems that use machine learning to enhance photos, to voice assistants
      that understand natural language, AI is becoming central to the smartphone experience.

      The latest flagship devices from Apple, Samsung, and Google all feature dedicated neural
      processing units (NPUs) that enable on-device AI processing. This allows for real-time
      translation, advanced photography features, and personalized user experiences.

      5G connectivity is accelerating this trend by enabling cloud-based AI services that were
      previously impossible on mobile devices. The combination of edge computing and 5G networks
      creates new possibilities for augmented reality, real-time video analysis, and more.
    `,
    url: 'https://techblog.example.com/ai-mobile-future',
    expectedCategory: 'Technology'
  },

  sportsNews: {
    title: 'Championship Finals: Teams Prepare for Historic Match',
    description: 'The biggest game of the season is set for this weekend',
    body: `
      The championship finals are set to begin this weekend as two powerhouse teams prepare
      for what promises to be a historic matchup. Both teams have shown exceptional form
      throughout the season, with star players on both sides ready to compete.

      The home team's quarterback has been in outstanding form, throwing for over 3,000 yards
      this season. Meanwhile, the visiting team's defense has allowed the fewest points in
      the league. Sports analysts are calling this the most anticipated final in decades.

      Ticket sales have broken records, with fans traveling from across the country to
      witness the game in person. The stadium is expected to reach full capacity.
    `,
    url: 'https://sports.example.com/championship-finals',
    expectedCategory: 'Sports'
  },

  financeArticle: {
    title: 'Market Analysis: Q4 Investment Strategies',
    description: 'Expert insights on portfolio management for the upcoming quarter',
    body: `
      As we enter the fourth quarter, investors are reassessing their portfolio strategies
      amid changing market conditions. The Federal Reserve's interest rate decisions continue
      to influence both equity and bond markets.

      Financial advisors recommend diversification across asset classes, including stocks,
      bonds, and alternative investments. The technology sector has shown resilience despite
      market volatility, while energy stocks have benefited from rising commodity prices.

      For long-term investors, dollar-cost averaging remains a solid strategy. Market timing
      is notoriously difficult, and consistent investment over time tends to outperform
      attempts to time market movements.
    `,
    url: 'https://finance.example.com/q4-strategies',
    expectedCategory: 'Business'
  }
}

// Realistic Prebid ad unit configurations
const AD_UNITS = {
  leaderboard: {
    code: 'div-leaderboard-728x90',
    mediaTypes: {
      banner: {
        sizes: [[728, 90], [970, 90], [970, 250]]
      }
    },
    bids: [
      { bidder: 'appnexus', params: { placementId: '13144370' } },
      { bidder: 'rubicon', params: { accountId: '14062', siteId: '70608', zoneId: '335918' } },
      { bidder: 'pubmatic', params: { publisherId: '156209', adSlot: 'pub_728x90' } }
    ]
  },

  sidebar: {
    code: 'div-sidebar-300x250',
    mediaTypes: {
      banner: {
        sizes: [[300, 250], [300, 600]]
      }
    },
    bids: [
      { bidder: 'appnexus', params: { placementId: '13144371' } },
      { bidder: 'ix', params: { siteId: '123456', size: [300, 250] } }
    ]
  },

  inArticle: {
    code: 'div-in-article-300x250',
    mediaTypes: {
      banner: {
        sizes: [[300, 250]]
      }
    },
    bids: [
      { bidder: 'appnexus', params: { placementId: '13144372' } }
    ]
  },

  video: {
    code: 'div-video-outstream',
    mediaTypes: {
      video: {
        context: 'outstream',
        playerSize: [640, 480],
        mimes: ['video/mp4', 'video/webm'],
        protocols: [2, 3, 5, 6],
        playbackmethod: [1, 2]
      }
    },
    bids: [
      { bidder: 'appnexus', params: { placementId: '13144373' } }
    ]
  }
}

describe('Production Simulation E2E Tests', () => {

  beforeAll(() => {
    if (!API_KEY) {
      console.warn('⚠️  MIXPEEK_API_KEY not set - tests will be skipped')
    }
  })

  beforeEach(() => {
    // Clear cache between tests
    adapter.clearCache?.()
  })

  describe('Scenario 1: Tech News Publisher', () => {

    test('should enrich ad units for technology article page', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      // Setup page content
      const scenario = PAGE_SCENARIOS.techArticle
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: (sel) => {
          if (sel === 'meta[name="description"]') return { content: scenario.description }
          if (sel === 'meta[property="og:title"]') return { content: scenario.title }
          return null
        },
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'techblog.example.com', pathname: '/ai-mobile-future' }

      // Initialize adapter
      const initSuccess = await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000,
        debug: true
      })
      expect(initSuccess).toBe(true)

      // Get ad units
      const adUnits = [AD_UNITS.leaderboard, AD_UNITS.sidebar, AD_UNITS.inArticle]

      // Measure enrichment time
      const startTime = performance.now()
      const enrichedUnits = await adapter.enrichAdUnits(adUnits)
      const enrichmentTime = performance.now() - startTime

      console.log(`\n📊 Tech Article Enrichment Results:`)
      console.log(`   Enrichment time: ${enrichmentTime.toFixed(2)}ms`)

      // Verify enrichment
      expect(enrichedUnits).toHaveLength(3)

      // Check each ad unit has ortb2Imp
      enrichedUnits.forEach((unit, idx) => {
        expect(unit.ortb2Imp).toBeDefined()
        expect(unit.ortb2Imp.ext).toBeDefined()
        expect(unit.ortb2Imp.ext.data).toBeDefined()

        const data = unit.ortb2Imp.ext.data
        console.log(`   Ad Unit ${idx + 1} (${unit.code}):`)
        console.log(`     - Category: ${data[TARGETING_KEYS.CATEGORY]}`)
        console.log(`     - Keywords: ${data[TARGETING_KEYS.KEYWORDS]}`)
        console.log(`     - Sentiment: ${data[TARGETING_KEYS.SENTIMENT]}`)
        console.log(`     - Safety: ${data[TARGETING_KEYS.SAFETY]}`)
      })

      // Get context for additional verification
      const context = await adapter.getContext()
      console.log(`   Context:`)
      console.log(`     - Mode: ${context.mode}`)
      console.log(`     - Taxonomy: ${context.taxonomy?.label}`)
      console.log(`     - Keywords: ${context.keywords?.slice(0, 5).join(', ')}`)
      console.log(`     - Document ID: ${context.documentId}`)

      // Verify we got technology-related content
      expect(context.keywords).toBeDefined()
      expect(context.keywords.length).toBeGreaterThan(0)

    }, 30000)
  })

  describe('Scenario 2: Sports News Publisher', () => {

    test('should enrich ad units for sports article', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      const scenario = PAGE_SCENARIOS.sportsNews
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: (sel) => {
          if (sel === 'meta[name="description"]') return { content: scenario.description }
          return null
        },
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'sports.example.com', pathname: '/championship-finals' }

      await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000
      })

      const adUnits = [AD_UNITS.leaderboard, AD_UNITS.sidebar]

      const startTime = performance.now()
      const enrichedUnits = await adapter.enrichAdUnits(adUnits)
      const enrichmentTime = performance.now() - startTime

      console.log(`\n📊 Sports Article Enrichment Results:`)
      console.log(`   Enrichment time: ${enrichmentTime.toFixed(2)}ms`)

      const context = await adapter.getContext()
      console.log(`   Keywords: ${context.keywords?.slice(0, 5).join(', ')}`)
      console.log(`   Category: ${context.taxonomy?.label}`)

      expect(enrichedUnits).toHaveLength(2)
      expect(context.keywords).toBeDefined()

    }, 30000)
  })

  describe('Scenario 3: Multi-Ad Auction Simulation', () => {

    test('should handle multiple ad units in single auction', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      const scenario = PAGE_SCENARIOS.financeArticle
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: () => null,
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'finance.example.com', pathname: '/q4-strategies' }

      await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000
      })

      // All ad units at once (typical auction scenario)
      const allAdUnits = [
        AD_UNITS.leaderboard,
        AD_UNITS.sidebar,
        AD_UNITS.inArticle,
        AD_UNITS.video
      ]

      const startTime = performance.now()
      const enrichedUnits = await adapter.enrichAdUnits(allAdUnits)
      const enrichmentTime = performance.now() - startTime

      console.log(`\n📊 Multi-Ad Auction Results:`)
      console.log(`   Total ad units: ${allAdUnits.length}`)
      console.log(`   Total enrichment time: ${enrichmentTime.toFixed(2)}ms`)
      console.log(`   Per-unit average: ${(enrichmentTime / allAdUnits.length).toFixed(2)}ms`)

      expect(enrichedUnits).toHaveLength(4)

      // All units should have same site-level context
      const firstUnitData = enrichedUnits[0].ortb2Imp.ext.data
      enrichedUnits.forEach(unit => {
        expect(unit.ortb2Imp.ext.data[TARGETING_KEYS.CATEGORY]).toBe(firstUnitData[TARGETING_KEYS.CATEGORY])
      })

    }, 30000)
  })

  describe('Scenario 4: Ad Adjacency Tracking', () => {

    test('should track previous ad for competitive separation', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      const scenario = PAGE_SCENARIOS.techArticle
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: () => null,
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'techblog.example.com', pathname: '/test' }

      await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000
      })

      // Simulate first ad render
      adapter.recordAdRender?.({
        adUnitCode: 'div-leaderboard-728x90',
        creativeId: 'creative_12345',
        bidder: 'appnexus',
        category: 'IAB19-11'
      })

      // Now enrich for next auction
      const adUnits = [AD_UNITS.sidebar]
      const enrichedUnits = await adapter.enrichAdUnits(adUnits)

      console.log(`\n📊 Ad Adjacency Results:`)

      if (enrichedUnits[0].ortb2Imp?.ext?.data) {
        const data = enrichedUnits[0].ortb2Imp.ext.data
        console.log(`   Previous Creative: ${data[TARGETING_KEYS.PREV_AD_CREATIVE_ID] || 'N/A'}`)
        console.log(`   Previous Bidder: ${data[TARGETING_KEYS.PREV_AD_BIDDER] || 'N/A'}`)
        console.log(`   Previous Category: ${data[TARGETING_KEYS.PREV_AD_CAT] || 'N/A'}`)
      }

      expect(enrichedUnits).toHaveLength(1)

    }, 30000)
  })

  describe('Scenario 5: OpenRTB 2.6 Fragment Generation', () => {

    test('should generate valid ortb2Fragments for SSPs', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      const scenario = PAGE_SCENARIOS.techArticle
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: (sel) => {
          if (sel === 'meta[name="description"]') return { content: scenario.description }
          return null
        },
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'techblog.example.com', pathname: '/test' }

      await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000
      })

      // Get ortb2 fragments
      const context = await adapter.getContext()
      const ortb2Fragments = adapter.formatForOrtb2Fragments?.(context) || {}

      console.log(`\n📊 OpenRTB 2.6 Fragments:`)
      console.log(JSON.stringify(ortb2Fragments, null, 2))

      // Verify structure
      if (ortb2Fragments.global?.site?.content) {
        const content = ortb2Fragments.global.site.content
        console.log(`\n   Site Content:`)
        console.log(`     - Categories: ${JSON.stringify(content.cat)}`)
        console.log(`     - Taxonomy ID: ${content.cattax}`)
        console.log(`     - Genre: ${content.genre}`)
        console.log(`     - Keywords: ${content.keywords}`)
        console.log(`     - Language: ${content.language}`)
      }

      expect(context).toBeDefined()
      expect(context.mode).toBeDefined()

    }, 30000)
  })

  describe('Scenario 6: Performance Under Load', () => {

    test('should maintain sub-second latency with caching', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      const scenario = PAGE_SCENARIOS.techArticle
      global.document = {
        title: scenario.title,
        body: {
          cloneNode: () => ({
            querySelectorAll: () => [],
            textContent: scenario.body
          }),
          textContent: scenario.body
        },
        documentElement: { lang: 'en' },
        querySelector: () => null,
        querySelectorAll: () => []
      }
      global.window.location = { href: scenario.url, hostname: 'techblog.example.com', pathname: '/test' }

      await adapter.init({
        apiKey: API_KEY,
        collectionId: COLLECTION_ID,
        namespace: NAMESPACE,
        timeout: 5000,
        enableCache: true,
        cacheTTL: 300
      })

      const adUnits = [AD_UNITS.leaderboard, AD_UNITS.sidebar]
      const results = []

      // Simulate 5 consecutive auctions (page refresh, lazy load, etc.)
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now()
        await adapter.enrichAdUnits(adUnits)
        const duration = performance.now() - startTime
        results.push(duration)
      }

      console.log(`\n📊 Performance Under Load:`)
      console.log(`   Request 1 (cold): ${results[0].toFixed(2)}ms`)
      console.log(`   Request 2 (cached): ${results[1].toFixed(2)}ms`)
      console.log(`   Request 3 (cached): ${results[2].toFixed(2)}ms`)
      console.log(`   Request 4 (cached): ${results[3].toFixed(2)}ms`)
      console.log(`   Request 5 (cached): ${results[4].toFixed(2)}ms`)
      console.log(`   Average: ${(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}ms`)

      // Cached requests should be much faster
      expect(results[1]).toBeLessThan(results[0])
      expect(results[2]).toBeLessThan(50) // Cached should be < 50ms

    }, 60000)
  })

  describe('Scenario 7: Error Recovery in Production', () => {

    test('should not block auction on API errors', async () => {
      if (!API_KEY) {
        console.log('⏭️  Skipping - no API key')
        return
      }

      // Initialize with invalid collection to simulate API error
      await adapter.init({
        apiKey: API_KEY,
        collectionId: 'invalid_collection_xyz',
        namespace: NAMESPACE,
        timeout: 2000
      })

      const adUnits = [AD_UNITS.leaderboard, AD_UNITS.sidebar]

      const startTime = performance.now()
      const enrichedUnits = await adapter.enrichAdUnits(adUnits)
      const duration = performance.now() - startTime

      console.log(`\n📊 Error Recovery Results:`)
      console.log(`   Duration: ${duration.toFixed(2)}ms`)
      console.log(`   Ad units returned: ${enrichedUnits.length}`)

      // Should return ad units (with fallback data) even on error
      expect(enrichedUnits).toHaveLength(2)
      // Should not take excessively long
      expect(duration).toBeLessThan(10000)

    }, 30000)
  })
})
