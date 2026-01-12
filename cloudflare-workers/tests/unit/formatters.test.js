/**
 * Formatter Tests
 */

import { describe, it, expect } from 'vitest'
import { formatForGAM } from '../../src/formatters/gamFormatter.js'
import { formatForOpenRTB } from '../../src/formatters/openrtbFormatter.js'
import { formatForAnalytics } from '../../src/formatters/analyticsFormatter.js'
import { formatForJSON } from '../../src/formatters/jsonFormatter.js'

// Sample profile for testing
const sampleProfile = {
  id: 'profile:abc123',
  url: 'https://example.com/article/tech-news',
  analyzedAt: '2024-01-15T10:30:00Z',
  profile: {
    documentId: 'doc_123',
    title: 'Tech News Article',
    taxonomy: {
      label: 'Technology',
      nodeId: 'technology',
      path: ['Content', 'Technology'],
      score: 0.85
    },
    iab: {
      primary: 'IAB19',
      all: ['IAB19', 'IAB19-11'],
      version: 6
    },
    brandSafety: {
      level: 'safe',
      score: 0.9,
      categories: []
    },
    sentiment: {
      label: 'positive',
      score: 0.75
    },
    keywords: ['technology', 'software', 'innovation', 'startup'],
    topics: [
      { name: 'technology', relevance: 0.9 },
      { name: 'software', relevance: 0.8 }
    ],
    entities: []
  }
}

describe('GAM Formatter', () => {
  describe('formatForGAM', () => {
    it('should return error for invalid profile', () => {
      const result = formatForGAM(null)
      expect(result.error).toBe('Invalid profile')
    })

    it('should format IAB categories', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_iab).toBe('IAB19')
      expect(result.targeting.mp_iab_all).toEqual(['IAB19', 'IAB19-11'])
    })

    it('should format taxonomy data', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_cat).toBe('technology')
      expect(result.targeting.mp_cat_id).toBe('technology')
      expect(result.targeting.mp_cat_score).toBe('85')
    })

    it('should format brand safety data', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_safety).toBe('safe')
      expect(result.targeting.mp_safety_score).toBe('90')
    })

    it('should format sentiment data', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_sentiment).toBe('positive')
      expect(result.targeting.mp_sentiment_score).toBe('75')
    })

    it('should format keywords', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_kw).toBeInstanceOf(Array)
      expect(result.targeting.mp_kw).toContain('technology')
    })

    it('should extract domain from URL', () => {
      const result = formatForGAM(sampleProfile)

      expect(result.targeting.mp_domain).toBe('example.com')
    })

    it('should include metadata', () => {
      const result = formatForGAM(sampleProfile)

      expect(result._meta.format).toBe('gam')
      expect(result._meta.version).toBe('1.0')
    })

    it('should limit keywords to 10', () => {
      const profileWithManyKeywords = {
        ...sampleProfile,
        profile: {
          ...sampleProfile.profile,
          keywords: Array(20).fill(0).map((_, i) => `keyword${i}`)
        }
      }

      const result = formatForGAM(profileWithManyKeywords)

      expect(result.targeting.mp_kw.length).toBeLessThanOrEqual(10)
    })
  })
})

describe('OpenRTB Formatter', () => {
  describe('formatForOpenRTB', () => {
    it('should return error for invalid profile', () => {
      const result = formatForOpenRTB(null)
      expect(result.error).toBe('Invalid profile')
    })

    it('should format site.content object', () => {
      const result = formatForOpenRTB(sampleProfile)

      expect(result.site.content.url).toBe('https://example.com/article/tech-news')
      expect(result.site.content.cat).toEqual(['IAB19', 'IAB19-11'])
      expect(result.site.content.cattax).toBe(6)
      expect(result.site.content.genre).toBe('Technology')
    })

    it('should format keywords as comma-separated string', () => {
      const result = formatForOpenRTB(sampleProfile)

      expect(result.site.content.keywords).toBe('technology,software,innovation,startup')
    })

    it('should include ext.data.mixpeek', () => {
      const result = formatForOpenRTB(sampleProfile)

      const mixpeekData = result.site.content.ext.data.mixpeek
      expect(mixpeekData.documentId).toBe('doc_123')
      expect(mixpeekData.taxonomy.label).toBe('Technology')
      expect(mixpeekData.brandSafety.level).toBe('safe')
      expect(mixpeekData.sentiment.label).toBe('positive')
    })

    it('should format data segments', () => {
      const result = formatForOpenRTB(sampleProfile)

      expect(result.data).toBeInstanceOf(Array)
      expect(result.data[0].id).toBe('mixpeek')
      expect(result.data[0].segment.length).toBeGreaterThan(0)
    })

    it('should include IAB category segments', () => {
      const result = formatForOpenRTB(sampleProfile)

      const segments = result.data[0].segment
      const iabSegment = segments.find(s => s.id === 'IAB19')

      expect(iabSegment).toBeDefined()
      expect(iabSegment.value).toBe('1.0')
    })

    it('should include ortb2Fragments for Prebid', () => {
      const result = formatForOpenRTB(sampleProfile)

      expect(result.ortb2Fragments.global.site.content).toBeDefined()
    })

    it('should include user data', () => {
      const result = formatForOpenRTB(sampleProfile)

      expect(result.user.data).toBeInstanceOf(Array)
      expect(result.user.data[0].id).toBe('mixpeek-contextual')
    })
  })
})

describe('Analytics Formatter', () => {
  describe('formatForAnalytics', () => {
    it('should return error for invalid profile', () => {
      const result = formatForAnalytics(null)
      expect(result.error).toBe('Invalid profile')
    })

    it('should format GA4 dimensions', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.ga4.dimensions.content_iab_category).toBe('IAB19')
      expect(result.ga4.dimensions.content_category).toBe('Technology')
      expect(result.ga4.dimensions.content_safety_level).toBe('safe')
      expect(result.ga4.dimensions.content_sentiment).toBe('positive')
    })

    it('should format GA4 metrics', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.ga4.metrics.content_safety_score).toBe(0.9)
      expect(result.ga4.metrics.content_sentiment_score).toBe(0.75)
      expect(result.ga4.metrics.content_category_score).toBe(0.85)
    })

    it('should format GTM data layer', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.dataLayer.event).toBe('mixpeek_content_analyzed')
      expect(result.dataLayer.mixpeek.category).toBe('Technology')
      expect(result.dataLayer.mixpeek.iabCategory).toBe('IAB19')
    })

    it('should format warehouse row', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.warehouse.category_label).toBe('Technology')
      expect(result.warehouse.iab_primary).toBe('IAB19')
      expect(result.warehouse.safety_level).toBe('safe')
    })

    it('should include topics as dimensions', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.ga4.dimensions.content_topic_1).toBe('technology')
      expect(result.ga4.dimensions.content_topic_2).toBe('software')
    })

    it('should categorize confidence correctly', () => {
      const result = formatForAnalytics(sampleProfile)

      expect(result.ga4.dimensions.content_category_confidence).toBe('high')
    })
  })
})

describe('JSON Formatter', () => {
  describe('formatForJSON', () => {
    it('should return error for invalid profile', () => {
      const result = formatForJSON(null)
      expect(result.error).toBe('Invalid profile')
    })

    it('should format classification data', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.classification.category).toBe('Technology')
      expect(result.classification.categoryId).toBe('technology')
      expect(result.classification.categoryPath).toEqual(['Content', 'Technology'])
      expect(result.classification.confidence).toBe(0.85)
    })

    it('should format IAB data', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.classification.iab.primary).toBe('IAB19')
      expect(result.classification.iab.all).toEqual(['IAB19', 'IAB19-11'])
      expect(result.classification.iab.version).toBe(6)
    })

    it('should format safety data', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.safety.level).toBe('safe')
      expect(result.safety.score).toBe(0.9)
      expect(result.safety.flags).toEqual([])
    })

    it('should format sentiment data', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.sentiment.label).toBe('positive')
      expect(result.sentiment.score).toBe(0.75)
    })

    it('should format signals', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.signals.keywords).toEqual(['technology', 'software', 'innovation', 'startup'])
      expect(result.signals.topics.length).toBe(2)
    })

    it('should include raw data', () => {
      const result = formatForJSON(sampleProfile)

      expect(result.raw.documentId).toBe('doc_123')
      expect(result.raw.taxonomy).toBeDefined()
    })

    it('should include metadata', () => {
      const result = formatForJSON(sampleProfile)

      expect(result._meta.format).toBe('json')
      expect(result._meta.version).toBe('1.0')
    })
  })
})
