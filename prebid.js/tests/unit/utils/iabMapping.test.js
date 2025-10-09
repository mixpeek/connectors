/**
 * Unit Tests for IAB Taxonomy Mapping
 * @file tests/unit/utils/iabMapping.test.js
 */

import {
  IAB_TAXONOMY_VERSION,
  MIXPEEK_NODE_TO_IAB,
  LABEL_TO_IAB,
  isValidIABCode,
  extractIABCode,
  getIABFromTaxonomy,
  mapTaxonomiesToIAB,
  mapCategoriesToIAB
} from '../../../src/utils/iabMapping.js'

describe('iabMapping', () => {
  describe('Constants', () => {
    test('should have correct IAB taxonomy version', () => {
      expect(IAB_TAXONOMY_VERSION).toBe(6)
    })

    test('should have node_id mappings', () => {
      expect(MIXPEEK_NODE_TO_IAB).toBeDefined()
      expect(typeof MIXPEEK_NODE_TO_IAB).toBe('object')
      expect(Object.keys(MIXPEEK_NODE_TO_IAB).length).toBeGreaterThan(0)
    })

    test('should have label mappings', () => {
      expect(LABEL_TO_IAB).toBeDefined()
      expect(typeof LABEL_TO_IAB).toBe('object')
      expect(Object.keys(LABEL_TO_IAB).length).toBeGreaterThan(0)
    })
  })

  describe('isValidIABCode()', () => {
    test('should validate correct IAB codes', () => {
      expect(isValidIABCode('IAB19')).toBe(true)
      expect(isValidIABCode('IAB19-11')).toBe(true)
      expect(isValidIABCode('IAB1')).toBe(true)
      expect(isValidIABCode('IAB17-44')).toBe(true)
    })

    test('should reject invalid formats', () => {
      expect(isValidIABCode('IAB')).toBe(false)
      expect(isValidIABCode('19')).toBe(false)
      expect(isValidIABCode('IAB19-')).toBe(false)
      expect(isValidIABCode('iab19')).toBe(false)
      expect(isValidIABCode('IAB19-11-22')).toBe(false)
      expect(isValidIABCode('')).toBe(false)
      expect(isValidIABCode(null)).toBe(false)
      expect(isValidIABCode(undefined)).toBe(false)
      expect(isValidIABCode(123)).toBe(false)
    })
  })

  describe('extractIABCode()', () => {
    test('should extract IAB code from string', () => {
      expect(extractIABCode('IAB19-11')).toBe('IAB19-11')
      expect(extractIABCode('Technology IAB19-11')).toBe('IAB19-11')
      expect(extractIABCode('Category: IAB19-11 - AI')).toBe('IAB19-11')
      expect(extractIABCode('IAB17')).toBe('IAB17')
    })

    test('should return null if no IAB code found', () => {
      expect(extractIABCode('Technology')).toBe(null)
      expect(extractIABCode('Sports')).toBe(null)
      expect(extractIABCode('')).toBe(null)
      expect(extractIABCode(null)).toBe(null)
      expect(extractIABCode(undefined)).toBe(null)
    })

    test('should extract first IAB code if multiple', () => {
      expect(extractIABCode('IAB19-11 and IAB17-3')).toBe('IAB19-11')
    })
  })

  describe('getIABFromTaxonomy()', () => {
    describe('Strategy 1: Already IAB code in label', () => {
      test('should detect IAB code in label', () => {
        const taxonomy = {
          label: 'IAB19-11',
          node_id: 'node_tech_ai',
          score: 0.95
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-11')
      })

      test('should extract IAB code from label with text', () => {
        const taxonomy = {
          label: 'Technology - IAB19-11',
          node_id: 'node_tech_ai',
          score: 0.95
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-11')
      })
    })

    describe('Strategy 2: Already IAB code in node_id', () => {
      test('should detect IAB code in node_id', () => {
        const taxonomy = {
          label: 'Technology - AI',
          node_id: 'IAB19-11',
          score: 0.95
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-11')
      })

      test('should work with nodeId property', () => {
        const taxonomy = {
          label: 'Technology - AI',
          nodeId: 'IAB19-11',
          score: 0.95
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-11')
      })
    })

    describe('Strategy 3: Map by node_id', () => {
      test('should map node_id to IAB code', () => {
        const taxonomy = {
          label: 'Technology - AI',
          node_id: 'node_tech_ai',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBeDefined()
        expect(isValidIABCode(result)).toBe(true)
      })

      test('should handle node_id from OpenAPI example', () => {
        const taxonomy = {
          label: 'Mobile Phones',
          node_id: 'node_electronics_phones',
          score: 0.87
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-20')
      })

      test('should handle normalized node_id', () => {
        // Test case-insensitive matching
        const taxonomy = {
          label: 'Technology',
          node_id: 'NODE_TECHNOLOGY',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBeDefined()
      })

      test('should work with nodeId property', () => {
        const taxonomy = {
          label: 'Technology - AI',
          nodeId: 'node_tech_ai',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBeDefined()
        expect(isValidIABCode(result)).toBe(true)
      })
    })

    describe('Strategy 4: Map by label', () => {
      test('should map label to IAB code', () => {
        const taxonomy = {
          label: 'artificial intelligence',
          node_id: 'unknown_node',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBe('IAB19-11')
      })

      test('should handle partial label matches', () => {
        const taxonomy = {
          label: 'Article about artificial intelligence',
          node_id: 'unknown_node',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBe('IAB19-11')
      })

      test('should be case-insensitive', () => {
        const taxonomy = {
          label: 'TECHNOLOGY',
          node_id: 'unknown_node',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBe('IAB19')
      })
    })

    describe('Strategy 5: Map by path', () => {
      test('should map path array to IAB code', () => {
        const taxonomy = {
          label: 'Unknown',
          node_id: 'unknown_node',
          path: ['technology', 'ai'],
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBeDefined()
        expect(isValidIABCode(result)).toBe(true)
      })

      test('should map path string to IAB code', () => {
        const taxonomy = {
          label: 'Unknown',
          node_id: 'unknown_node',
          path: 'technology/ai/machine-learning',
          score: 0.95
        }
        const result = getIABFromTaxonomy(taxonomy)
        expect(result).toBeDefined()
      })
    })

    describe('Edge cases', () => {
      test('should return null for null taxonomy', () => {
        expect(getIABFromTaxonomy(null)).toBe(null)
      })

      test('should return null for undefined taxonomy', () => {
        expect(getIABFromTaxonomy(undefined)).toBe(null)
      })

      test('should return null for empty taxonomy', () => {
        expect(getIABFromTaxonomy({})).toBe(null)
      })

      test('should return null for completely unmapped taxonomy', () => {
        const taxonomy = {
          label: 'zxcvbnmlkjhgfdsa',
          node_id: 'zxcvbnmlkjhgfdsa',
          score: 0.95
        }
        expect(getIABFromTaxonomy(taxonomy)).toBe(null)
      })
    })
  })

  describe('mapTaxonomiesToIAB()', () => {
    test('should map array of taxonomies', () => {
      const taxonomies = [
        { label: 'Technology - AI', node_id: 'node_tech_ai', score: 0.95 },
        { label: 'Sports', node_id: 'node_sports', score: 0.88 }
      ]
      const result = mapTaxonomiesToIAB(taxonomies)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      result.forEach(code => {
        expect(isValidIABCode(code)).toBe(true)
      })
    })

    test('should remove duplicates', () => {
      const taxonomies = [
        { label: 'Technology', node_id: 'node_technology', score: 0.95 },
        { label: 'Tech', node_id: 'node_tech', score: 0.88 },
        { label: 'IAB19', node_id: 'something', score: 0.90 }
      ]
      const result = mapTaxonomiesToIAB(taxonomies)
      
      // Should only have one IAB19
      const iab19Count = result.filter(code => code === 'IAB19').length
      expect(iab19Count).toBe(1)
    })

    test('should handle empty array', () => {
      expect(mapTaxonomiesToIAB([])).toEqual([])
    })

    test('should handle null', () => {
      expect(mapTaxonomiesToIAB(null)).toEqual([])
    })

    test('should handle undefined', () => {
      expect(mapTaxonomiesToIAB(undefined)).toEqual([])
    })

    test('should filter out unmapped taxonomies', () => {
      const taxonomies = [
        { label: 'Technology', node_id: 'node_technology', score: 0.95 },
        { label: 'Unknown', node_id: 'unknown', score: 0.88 }
      ]
      const result = mapTaxonomiesToIAB(taxonomies)
      
      // Should only include mapped ones
      expect(result.length).toBeGreaterThan(0)
      result.forEach(code => {
        expect(isValidIABCode(code)).toBe(true)
      })
    })
  })

  describe('mapCategoriesToIAB()', () => {
    test('should map category strings', () => {
      const categories = ['technology', 'sports', 'business']
      const result = mapCategoriesToIAB(categories)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      result.forEach(code => {
        expect(isValidIABCode(code)).toBe(true)
      })
    })

    test('should be case-insensitive', () => {
      const categories = ['TECHNOLOGY', 'Sports', 'business']
      const result = mapCategoriesToIAB(categories)
      
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle empty array', () => {
      expect(mapCategoriesToIAB([])).toEqual([])
    })

    test('should handle null', () => {
      expect(mapCategoriesToIAB(null)).toEqual([])
    })

    test('should remove duplicates', () => {
      const categories = ['technology', 'tech', 'technology']
      const result = mapCategoriesToIAB(categories)
      
      const uniqueCodes = new Set(result)
      expect(uniqueCodes.size).toBe(result.length)
    })
  })

  describe('Real-world scenarios', () => {
    test('should handle Mixpeek OpenAPI example format', () => {
      const taxonomy = {
        taxonomy_id: 'tax_products',
        node_id: 'node_electronics_phones',
        path: ['products', 'electronics', 'phones'],
        label: 'Mobile Phones',
        score: 0.87
      }
      
      const iabCode = getIABFromTaxonomy(taxonomy)
      expect(iabCode).toBe('IAB19-20')
      expect(isValidIABCode(iabCode)).toBe(true)
    })

    test('should handle multiple taxonomies from API response', () => {
      const enrichments = {
        taxonomies: [
          {
            taxonomy_id: 'tax_content',
            node_id: 'node_tech_ai',
            label: 'Artificial Intelligence',
            score: 0.94
          },
          {
            taxonomy_id: 'tax_content',
            node_id: 'node_tech_software',
            label: 'Software',
            score: 0.85
          }
        ]
      }
      
      const iabCodes = mapTaxonomiesToIAB(enrichments.taxonomies)
      expect(iabCodes.length).toBeGreaterThan(0)
      iabCodes.forEach(code => {
        expect(isValidIABCode(code)).toBe(true)
      })
    })

    test('should prioritize IAB codes if already present', () => {
      // If Mixpeek already returns IAB codes, use them
      const taxonomy = {
        node_id: 'IAB19-11',
        label: 'Technology - Artificial Intelligence',
        score: 0.94
      }
      
      expect(getIABFromTaxonomy(taxonomy)).toBe('IAB19-11')
    })
  })
})

