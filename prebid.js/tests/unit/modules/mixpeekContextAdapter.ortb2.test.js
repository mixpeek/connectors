/**
 * Unit Tests for Mixpeek Context Adapter - ortb2 Formatting
 * @file tests/unit/modules/mixpeekContextAdapter.ortb2.test.js
 */

import adapter from '../../../src/modules/mixpeekContextAdapter.js'
import { IAB_TAXONOMY_VERSION } from '../../../src/utils/iabMapping.js'

// Mock dependencies
jest.mock('../../../src/api/mixpeekClient.js')
jest.mock('../../../src/utils/logger.js')

describe('MixpeekContextAdapter - ortb2 Formatting', () => {
  const mockContext = {
    documentId: 'doc_123',
    mode: 'page',
    content: {
      url: 'https://example.com/article',
      title: 'AI Technology Article',
      type: 'page'
    },
    taxonomy: {
      label: 'Technology - Artificial Intelligence',
      nodeId: 'node_tech_ai',
      path: ['technology', 'ai'],
      score: 0.94,
      all: [
        { label: 'Technology - AI', nodeId: 'node_tech_ai', score: 0.94 },
        { label: 'Science', nodeId: 'node_science', score: 0.87 }
      ]
    },
    brandSafety: 0.98,
    keywords: ['ai', 'technology', 'machine learning'],
    sentiment: 'positive',
    embeddingId: 'emb_abc123'
  }

  beforeEach(() => {
    // Mock document for language detection
    global.document = {
      documentElement: {
        lang: 'en'
      },
      title: 'Test Page Title'
    }
    global.window = {
      location: {
        href: 'https://example.com/test'
      }
    }
  })

  describe('formatForOrtb2SiteContent()', () => {
    test('should format complete context data', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result).toBeDefined()
      expect(result.cat).toBeDefined()
      expect(result.cattax).toBe(IAB_TAXONOMY_VERSION)
      expect(result.genre).toBe('Technology - Artificial Intelligence')
      expect(result.keywords).toBe('ai,technology,machine learning')
      expect(result.language).toBe('en')
      expect(result.title).toBeDefined()
      expect(result.url).toBeDefined()
      expect(result.ext).toBeDefined()
      expect(result.ext.data.mixpeek).toBeDefined()
    })

    test('should include IAB category codes', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(Array.isArray(result.cat)).toBe(true)
      expect(result.cat.length).toBeGreaterThan(0)
      // Should be valid IAB code
      expect(result.cat[0]).toMatch(/^IAB\d+(-\d+)?$/)
    })

    test('should include cattax version', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.cattax).toBe(6) // IAB Content Taxonomy v3.0
    })

    test('should format keywords as comma-separated string', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.keywords).toBe('ai,technology,machine learning')
    })

    test('should handle keywords as string', () => {
      const contextWithStringKeywords = {
        ...mockContext,
        keywords: 'ai,technology'
      }
      
      const result = adapter.formatForOrtb2SiteContent(contextWithStringKeywords)
      
      expect(result.keywords).toBe('ai,technology')
    })

    test('should detect language from document', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.language).toBe('en')
    })

    test('should include page metadata', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.title).toBe('Test Page Title')
      expect(result.url).toBe('https://example.com/test')
    })

    test('should use content URL if page URL unavailable', () => {
      global.window.location.href = undefined
      
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.url).toBe('https://example.com/article')
    })

    test('should use content title if page title unavailable', () => {
      global.document.title = undefined
      
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.title).toBe('AI Technology Article')
    })

    test('should include Mixpeek extension data', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.ext.data.mixpeek).toEqual({
        documentId: 'doc_123',
        mode: 'page',
        score: 0.94,
        brandSafety: 0.98,
        sentiment: 'positive',
        embeddingId: 'emb_abc123'
      })
    })

    test('should handle null context', () => {
      const result = adapter.formatForOrtb2SiteContent(null)
      
      expect(result).toBe(null)
    })

    test('should handle undefined context', () => {
      const result = adapter.formatForOrtb2SiteContent(undefined)
      
      expect(result).toBe(null)
    })

    test('should handle context without taxonomy', () => {
      const contextWithoutTaxonomy = {
        documentId: 'doc_123',
        mode: 'page',
        brandSafety: 0.98
      }
      
      const result = adapter.formatForOrtb2SiteContent(contextWithoutTaxonomy)
      
      expect(result).toBeDefined()
      expect(result.cat).toBeUndefined()
      expect(result.cattax).toBeUndefined()
      expect(result.genre).toBeUndefined()
    })

    test('should handle context without keywords', () => {
      const contextWithoutKeywords = {
        ...mockContext,
        keywords: undefined
      }
      
      const result = adapter.formatForOrtb2SiteContent(contextWithoutKeywords)
      
      expect(result.keywords).toBeUndefined()
    })

    test('should handle non-browser environment', () => {
      global.document = undefined
      global.window = undefined
      
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result).toBeDefined()
      // Should still have content from context
      expect(result.url).toBe('https://example.com/article')
      expect(result.title).toBe('AI Technology Article')
    })
  })

  describe('formatForOrtb2Fragments()', () => {
    test('should wrap site.content in ortb2Fragments structure', () => {
      const result = adapter.formatForOrtb2Fragments(mockContext)
      
      expect(result).toBeDefined()
      expect(result.global).toBeDefined()
      expect(result.global.site).toBeDefined()
      expect(result.global.site.content).toBeDefined()
    })

    test('should include all content fields', () => {
      const result = adapter.formatForOrtb2Fragments(mockContext)
      
      const content = result.global.site.content
      expect(content.cat).toBeDefined()
      expect(content.genre).toBeDefined()
      expect(content.keywords).toBeDefined()
      expect(content.ext).toBeDefined()
    })

    test('should return null for null context', () => {
      const result = adapter.formatForOrtb2Fragments(null)
      
      expect(result).toBe(null)
    })

    test('should return null for undefined context', () => {
      const result = adapter.formatForOrtb2Fragments(undefined)
      
      expect(result).toBe(null)
    })

    test('should handle empty content data', () => {
      const emptyContext = {
        documentId: 'doc_123',
        mode: 'page'
      }
      
      const result = adapter.formatForOrtb2Fragments(emptyContext)
      
      expect(result).toBeDefined()
      expect(result.global.site.content).toBeDefined()
    })
  })

  describe('formatAsDataSegments()', () => {
    test('should format as data segments array', () => {
      const result = adapter.formatAsDataSegments(mockContext)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    test('should include primary taxonomy segment', () => {
      const result = adapter.formatAsDataSegments(mockContext)
      
      const primarySegment = result[0]
      expect(primarySegment).toBeDefined()
      expect(primarySegment.id).toMatch(/^IAB\d+(-\d+)?$/) // IAB code
      expect(primarySegment.name).toBe('Technology - Artificial Intelligence')
      expect(primarySegment.value).toBe('0.94')
    })

    test('should include additional taxonomies', () => {
      const result = adapter.formatAsDataSegments(mockContext)
      
      // Should have primary + additional (up to 5 total)
      expect(result.length).toBeLessThanOrEqual(5)
      expect(result.length).toBeGreaterThan(1) // Has additional taxonomies
    })

    test('should map each segment to IAB code', () => {
      const result = adapter.formatAsDataSegments(mockContext)
      
      result.forEach(segment => {
        expect(segment.id).toMatch(/^IAB\d+(-\d+)?$/)
        expect(segment.name).toBeDefined()
        expect(segment.value).toBeDefined()
      })
    })

    test('should limit to 5 segments', () => {
      const contextWithManyTaxonomies = {
        ...mockContext,
        taxonomy: {
          ...mockContext.taxonomy,
          all: [
            { label: 'Cat1', nodeId: 'node_1', score: 0.9 },
            { label: 'Cat2', nodeId: 'node_2', score: 0.8 },
            { label: 'Cat3', nodeId: 'node_3', score: 0.7 },
            { label: 'Cat4', nodeId: 'node_4', score: 0.6 },
            { label: 'Cat5', nodeId: 'node_5', score: 0.5 },
            { label: 'Cat6', nodeId: 'node_6', score: 0.4 },
            { label: 'Cat7', nodeId: 'node_7', score: 0.3 }
          ]
        }
      }
      
      const result = adapter.formatAsDataSegments(contextWithManyTaxonomies)
      
      expect(result.length).toBeLessThanOrEqual(5)
    })

    test('should return empty array for null context', () => {
      const result = adapter.formatAsDataSegments(null)
      
      expect(result).toEqual([])
    })

    test('should return empty array for context without taxonomy', () => {
      const contextWithoutTaxonomy = {
        documentId: 'doc_123',
        mode: 'page'
      }
      
      const result = adapter.formatAsDataSegments(contextWithoutTaxonomy)
      
      expect(result).toEqual([])
    })

    test('should filter out unmapped taxonomies', () => {
      const contextWithUnmapped = {
        ...mockContext,
        taxonomy: {
          label: 'Unknown Category',
          nodeId: 'unknown_node_12345',
          score: 0.94,
          all: [
            { label: 'Unknown', nodeId: 'unknown', score: 0.9 },
            { label: 'Technology', nodeId: 'node_technology', score: 0.8 }
          ]
        }
      }
      
      const result = adapter.formatAsDataSegments(contextWithUnmapped)
      
      // Should only include mapped ones
      result.forEach(segment => {
        expect(segment.id).toMatch(/^IAB\d+(-\d+)?$/)
      })
    })
  })

  describe('Integration with IAB mapping', () => {
    test('should use real IAB codes from mapping', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      // Should map node_tech_ai to IAB19-11
      expect(result.cat).toContain('IAB19-11')
      expect(result.cattax).toBe(6)
    })

    test('should handle Mixpeek OpenAPI example format', () => {
      const openApiContext = {
        documentId: 'doc_456',
        mode: 'page',
        taxonomy: {
          taxonomy_id: 'tax_products',
          label: 'Mobile Phones',
          nodeId: 'node_electronics_phones',
          path: ['products', 'electronics', 'phones'],
          score: 0.87
        }
      }
      
      const result = adapter.formatForOrtb2SiteContent(openApiContext)
      
      expect(result.cat).toContain('IAB19-20') // Mobile phones
      expect(result.genre).toBe('Mobile Phones')
    })
  })

  describe('OpenRTB 2.6 compliance', () => {
    test('should follow OpenRTB 2.6 site.content structure', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      // Required/common OpenRTB 2.6 fields
      expect(result).toHaveProperty('cat')
      expect(result).toHaveProperty('cattax')
      expect(result).toHaveProperty('keywords')
      expect(result).toHaveProperty('ext')
    })

    test('should use correct cattax value for IAB v3.0', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      // IAB Tech Lab Content Taxonomy v3.0 = 6
      expect(result.cattax).toBe(6)
    })

    test('should format ext.data correctly', () => {
      const result = adapter.formatForOrtb2SiteContent(mockContext)
      
      expect(result.ext).toHaveProperty('data')
      expect(result.ext.data).toHaveProperty('mixpeek')
      expect(typeof result.ext.data.mixpeek).toBe('object')
    })
  })
})

