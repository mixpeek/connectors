/**
 * IAB Mapping Tests
 */

import { describe, it, expect } from 'vitest'
import {
  IAB_TAXONOMY_VERSION,
  isValidIABCode,
  extractIABCode,
  getIABFromTaxonomy,
  mapKeywordsToIAB,
  getIABCategoryName
} from '../../src/utils/iabMapping.js'

describe('IAB Mapping', () => {
  describe('IAB_TAXONOMY_VERSION', () => {
    it('should be 6 for Content Taxonomy v3.0', () => {
      expect(IAB_TAXONOMY_VERSION).toBe(6)
    })
  })

  describe('isValidIABCode', () => {
    it('should validate correct IAB codes', () => {
      expect(isValidIABCode('IAB1')).toBe(true)
      expect(isValidIABCode('IAB19')).toBe(true)
      expect(isValidIABCode('IAB19-11')).toBe(true)
      expect(isValidIABCode('IAB7-18')).toBe(true)
    })

    it('should reject invalid codes', () => {
      expect(isValidIABCode('technology')).toBe(false)
      expect(isValidIABCode('IAB')).toBe(false)
      expect(isValidIABCode('IAB-19')).toBe(false)
      expect(isValidIABCode('iab19')).toBe(false)
      expect(isValidIABCode(null)).toBe(false)
      expect(isValidIABCode('')).toBe(false)
    })
  })

  describe('extractIABCode', () => {
    it('should extract IAB code from string', () => {
      expect(extractIABCode('Category: IAB19 Technology')).toBe('IAB19')
      expect(extractIABCode('IAB7-18 Health')).toBe('IAB7-18')
    })

    it('should return null for no match', () => {
      expect(extractIABCode('technology')).toBeNull()
      expect(extractIABCode(null)).toBeNull()
      expect(extractIABCode('')).toBeNull()
    })
  })

  describe('getIABFromTaxonomy', () => {
    it('should return label if already IAB code', () => {
      const taxonomy = { label: 'IAB19', nodeId: 'tech' }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19')
    })

    it('should extract IAB code from label', () => {
      const taxonomy = { label: 'IAB19 - Technology', nodeId: 'tech' }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19')
    })

    it('should map by node_id', () => {
      const taxonomy = { label: 'Technology', nodeId: 'technology' }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19')
    })

    it('should map by label', () => {
      const taxonomy = { label: 'technology', nodeId: 'custom_tech' }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19')
    })

    it('should handle partial label matches', () => {
      const taxonomy = { label: 'Sports News', nodeId: 'custom' }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB17')
    })

    it('should use path as fallback', () => {
      const taxonomy = { label: 'Custom', nodeId: 'custom', path: ['content', 'technology', 'software'] }
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19')
    })

    it('should return null for no match', () => {
      const taxonomy = { label: 'XYZ', nodeId: 'xyz', path: ['xyz'] }
      expect(getIABFromTaxonomy(taxonomy)).toBeNull()
    })

    it('should return null for null taxonomy', () => {
      expect(getIABFromTaxonomy(null)).toBeNull()
    })

    it('should handle node_id variations', () => {
      expect(getIABFromTaxonomy({ label: 'Tech', nodeId: 'sports' })).toBe('IAB17')
      expect(getIABFromTaxonomy({ label: 'Tech', nodeId: 'business' })).toBe('IAB13')
      expect(getIABFromTaxonomy({ label: 'Tech', nodeId: 'entertainment' })).toBe('IAB9')
    })
  })

  describe('mapKeywordsToIAB', () => {
    it('should map technology keywords', () => {
      const keywords = ['technology', 'software', 'developer']
      const result = mapKeywordsToIAB(keywords)

      // Should contain technology-related IAB codes
      expect(result.some(code => code.startsWith('IAB19'))).toBe(true)
    })

    it('should map multiple categories', () => {
      const keywords = ['technology', 'sports', 'news']
      const result = mapKeywordsToIAB(keywords)

      expect(result).toContain('IAB19')
      expect(result).toContain('IAB17')
      expect(result).toContain('IAB12')
    })

    it('should return unique values', () => {
      const keywords = ['tech', 'technology', 'software']
      const result = mapKeywordsToIAB(keywords)

      const uniqueCount = new Set(result).size
      expect(result.length).toBe(uniqueCount)
    })

    it('should return empty array for empty keywords', () => {
      expect(mapKeywordsToIAB([])).toEqual([])
      expect(mapKeywordsToIAB(null)).toEqual([])
    })

    it('should handle partial matches', () => {
      const keywords = ['automotive', 'cryptocurrency']
      const result = mapKeywordsToIAB(keywords)

      expect(result).toContain('IAB2') // automotive
    })
  })

  describe('getIABCategoryName', () => {
    it('should return category names', () => {
      expect(getIABCategoryName('IAB1')).toBe('Arts & Entertainment')
      expect(getIABCategoryName('IAB19')).toBe('Technology & Computing')
      expect(getIABCategoryName('IAB17')).toBe('Sports')
      expect(getIABCategoryName('IAB7')).toBe('Health & Fitness')
    })

    it('should extract top-level from sub-category', () => {
      expect(getIABCategoryName('IAB19-11')).toBe('Technology & Computing')
      expect(getIABCategoryName('IAB7-18')).toBe('Health & Fitness')
    })

    it('should return Unknown for invalid codes', () => {
      expect(getIABCategoryName('IAB99')).toBe('Unknown')
    })
  })

  describe('category mappings', () => {
    it('should map technology variations', () => {
      expect(getIABFromTaxonomy({ nodeId: 'tech' })).toBe('IAB19')
      expect(getIABFromTaxonomy({ nodeId: 'software' })).toBe('IAB19-18')
      expect(getIABFromTaxonomy({ nodeId: 'artificial_intelligence' })).toBe('IAB19-11')
      expect(getIABFromTaxonomy({ nodeId: 'mobile' })).toBe('IAB19-20')
    })

    it('should map sports variations', () => {
      expect(getIABFromTaxonomy({ nodeId: 'sports' })).toBe('IAB17')
      expect(getIABFromTaxonomy({ nodeId: 'football' })).toBe('IAB17-3')
      expect(getIABFromTaxonomy({ nodeId: 'basketball' })).toBe('IAB17-4')
    })

    it('should map entertainment variations', () => {
      expect(getIABFromTaxonomy({ nodeId: 'entertainment' })).toBe('IAB9')
      expect(getIABFromTaxonomy({ nodeId: 'movies' })).toBe('IAB9-7')
      expect(getIABFromTaxonomy({ nodeId: 'gaming' })).toBe('IAB9-30')
    })

    it('should map health variations', () => {
      expect(getIABFromTaxonomy({ nodeId: 'health' })).toBe('IAB7')
      expect(getIABFromTaxonomy({ nodeId: 'fitness' })).toBe('IAB7-18')
      expect(getIABFromTaxonomy({ nodeId: 'nutrition' })).toBe('IAB7-30')
    })

    it('should map business variations', () => {
      expect(getIABFromTaxonomy({ nodeId: 'business' })).toBe('IAB13')
      expect(getIABFromTaxonomy({ nodeId: 'finance' })).toBe('IAB13-7')
      expect(getIABFromTaxonomy({ nodeId: 'investing' })).toBe('IAB13-5')
    })
  })
})
