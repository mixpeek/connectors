/**
 * Unit Tests - Enrichment Functions
 */

import { enrichOrtb2, enrichBidRequest } from '../../src/enrichment.js'

describe('Enrichment Functions', () => {
  describe('enrichOrtb2', () => {
    test('should build basic ortb2 object with language', () => {
      const result = {
        document_id: 'doc_123',
        enrichments: {},
        taxonomy: null
      }
      const content = { language: 'en' }

      const ortb2 = enrichOrtb2(result, content)

      expect(ortb2.site.content.language).toBe('en')
    })

    test('should add keywords to ortb2', () => {
      const result = {
        document_id: 'doc_123',
        enrichments: {
          keywords: ['technology', 'ai', 'machine learning']
        }
      }
      const content = {}

      const ortb2 = enrichOrtb2(result, content)

      expect(ortb2.site.content.keywords).toBe('technology,ai,machine learning')
    })

    test('should add taxonomy with IAB category', () => {
      const result = {
        document_id: 'doc_123',
        enrichments: {},
        taxonomy: {
          label: 'Technology',
          score: 0.9
        }
      }
      const content = {}

      const ortb2 = enrichOrtb2(result, content)

      expect(ortb2.site.content.cat).toEqual(['IAB19'])
      expect(ortb2.site.content.cattax).toBe(6)
      expect(ortb2.site.content.genre).toBe('Technology')
    })

    test('should add URL and title when provided', () => {
      const result = {
        document_id: 'doc_123',
        enrichments: {}
      }
      const content = {
        url: 'https://example.com/article',
        title: 'Test Article'
      }

      const ortb2 = enrichOrtb2(result, content)

      expect(ortb2.site.content.url).toBe('https://example.com/article')
      expect(ortb2.site.content.title).toBe('Test Article')
    })

    test('should add mixpeek extended data', () => {
      const result = {
        document_id: 'doc_123',
        enrichments: {
          sentiment: { label: 'positive', score: 0.8 }
        },
        taxonomy: { label: 'Tech', score: 0.85 }
      }
      const content = {}

      const ortb2 = enrichOrtb2(result, content)

      expect(ortb2.site.content.ext.data.mixpeek).toBeDefined()
      expect(ortb2.site.content.ext.data.mixpeek.documentId).toBe('doc_123')
      expect(ortb2.site.content.ext.data.mixpeek.sentiment).toBe('positive')
      expect(ortb2.site.content.ext.data.mixpeek.brandSafety).toBeDefined()
    })
  })

  describe('enrichBidRequest', () => {
    test('should create site object if not present', () => {
      const bidRequest = { id: 'bid_123' }
      const enrichment = {
        ortb2: {
          site: {
            content: { keywords: 'tech,ai' }
          }
        },
        targeting: { hb_mixpeek_category: 'Technology' }
      }

      const enriched = enrichBidRequest(bidRequest, enrichment)

      expect(enriched.site).toBeDefined()
      expect(enriched.site.content.keywords).toBe('tech,ai')
    })

    test('should merge site.content data', () => {
      const bidRequest = {
        id: 'bid_123',
        site: {
          page: 'https://example.com',
          content: { language: 'en' }
        }
      }
      const enrichment = {
        ortb2: {
          site: {
            content: { keywords: 'tech,ai', cat: ['IAB19'] }
          }
        },
        targeting: {}
      }

      const enriched = enrichBidRequest(bidRequest, enrichment)

      expect(enriched.site.page).toBe('https://example.com')
      expect(enriched.site.content.language).toBe('en')
      expect(enriched.site.content.keywords).toBe('tech,ai')
      expect(enriched.site.content.cat).toEqual(['IAB19'])
    })

    test('should add targeting to impressions', () => {
      const bidRequest = {
        id: 'bid_123',
        imp: [
          { id: 'imp_1', banner: { w: 300, h: 250 } },
          { id: 'imp_2', banner: { w: 728, h: 90 } }
        ]
      }
      const enrichment = {
        ortb2: { site: { content: {} } },
        targeting: {
          hb_mixpeek_category: 'Technology',
          hb_mixpeek_score: '0.9'
        }
      }

      const enriched = enrichBidRequest(bidRequest, enrichment)

      expect(enriched.imp[0].ext.data.hb_mixpeek_category).toBe('Technology')
      expect(enriched.imp[0].ext.data.hb_mixpeek_score).toBe('0.9')
      expect(enriched.imp[1].ext.data.hb_mixpeek_category).toBe('Technology')
    })

    test('should not mutate original bid request', () => {
      const bidRequest = {
        id: 'bid_123',
        site: { page: 'https://example.com' }
      }
      const enrichment = {
        ortb2: { site: { content: { keywords: 'test' } } },
        targeting: {}
      }

      const enriched = enrichBidRequest(bidRequest, enrichment)

      expect(bidRequest.site.content).toBeUndefined()
      expect(enriched.site.content.keywords).toBe('test')
    })
  })
})
