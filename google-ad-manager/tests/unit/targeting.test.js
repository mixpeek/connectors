/**
 * Unit Tests - Targeting Module
 */

import {
  buildTargetingKeys,
  buildSlotTargeting,
  buildPageTargeting,
  buildPMPTargeting,
  buildYieldConditions,
  generateGPTCode,
  validateTargeting,
  TARGETING_KEYS
} from '../../src/targeting.js'

describe('buildTargetingKeys', () => {
  test('should build targeting from enrichment result', () => {
    const result = {
      taxonomy: { label: 'Technology', score: 0.8 },
      enrichments: {
        keywords: ['software', 'cloud', 'data'],
        sentiment: { label: 'positive', score: 0.7 },
        suitability: { level: 'high', score: 0.9, flags: [] },
        contentDepth: { level: 'high', score: 0.8 }
      }
    }

    const targeting = buildTargetingKeys(result)

    expect(targeting[TARGETING_KEYS.IAB_V3]).toBe('19')
    expect(targeting[TARGETING_KEYS.IAB_V2]).toBe('IAB19')
    expect(targeting[TARGETING_KEYS.CATEGORY]).toBe('technology')
    expect(targeting[TARGETING_KEYS.SENTIMENT]).toBe('positive')
    expect(targeting[TARGETING_KEYS.SUITABILITY]).toBe('high')
    expect(targeting[TARGETING_KEYS.CONTENT_DEPTH]).toBe('high')
    expect(targeting[TARGETING_KEYS.KEYWORDS]).toBe('software,cloud,data')
  })

  test('should handle missing enrichments gracefully', () => {
    const result = {
      taxonomy: { label: 'General', score: 0.5 }
    }

    const targeting = buildTargetingKeys(result)

    expect(targeting[TARGETING_KEYS.CATEGORY]).toBe('general')
    expect(targeting[TARGETING_KEYS.KEYWORDS]).toBeUndefined()
  })

  test('should limit keywords', () => {
    const result = {
      enrichments: {
        // Use short keywords so they fit within 40 char limit
        keywords: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o']
      }
    }

    const targeting = buildTargetingKeys(result, { maxKeywords: 5 })

    const keywords = targeting[TARGETING_KEYS.KEYWORDS].split(',')
    expect(keywords.length).toBe(5)
    expect(keywords).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  test('should respect 40 char value limit for keywords', () => {
    const result = {
      enrichments: {
        // Long keywords that would exceed 40 chars total
        keywords: ['verylongkeyword1', 'verylongkeyword2', 'verylongkeyword3']
      }
    }

    const targeting = buildTargetingKeys(result)

    // Should truncate to fit within 40 chars
    expect(targeting[TARGETING_KEYS.KEYWORDS].length).toBeLessThanOrEqual(40)
  })

  test('should include adjacency score when provided', () => {
    const result = {
      taxonomy: { label: 'Technology', score: 0.8 },
      adjacencyScore: 0.85
    }

    const targeting = buildTargetingKeys(result)

    expect(targeting[TARGETING_KEYS.ADJACENCY_SCORE]).toBe('0.85')
  })
})

describe('buildSlotTargeting', () => {
  test('should return array of key-value pairs', () => {
    const result = {
      taxonomy: { label: 'Business', score: 0.7 },
      enrichments: {
        sentiment: { label: 'neutral', score: 0.5 }
      }
    }

    const slotTargeting = buildSlotTargeting(result)

    expect(Array.isArray(slotTargeting)).toBe(true)
    expect(slotTargeting.length).toBeGreaterThan(0)
    expect(slotTargeting[0]).toHaveLength(2) // [key, value]
  })
})

describe('buildPageTargeting', () => {
  test('should return object for page-level targeting', () => {
    const result = {
      taxonomy: { label: 'Sports', score: 0.9 },
      enrichments: {
        sentiment: { label: 'positive', score: 0.8 }
      }
    }

    const pageTargeting = buildPageTargeting(result)

    expect(typeof pageTargeting).toBe('object')
    expect(pageTargeting[TARGETING_KEYS.CATEGORY]).toBe('sports')
  })
})

describe('buildPMPTargeting', () => {
  test('should build PMP-formatted targeting', () => {
    const result = {
      taxonomy: { label: 'Technology', score: 0.85 },
      enrichments: {
        suitability: { level: 'high', score: 0.9 },
        contentDepth: { level: 'high', score: 0.8 }
      }
    }

    const pmpTargeting = buildPMPTargeting(result)

    expect(pmpTargeting.mp_cat).toBe('19')
    expect(pmpTargeting.mp_conf).toBe('0.85')
    expect(pmpTargeting.mp_safe).toBe('high')
    expect(pmpTargeting.mp_qual).toBe('high')
  })
})

describe('buildYieldConditions', () => {
  test('should identify premium content', () => {
    const result = {
      enrichments: {
        contentDepth: { level: 'high', score: 0.8 },
        suitability: { score: 0.9 },
        sentiment: { label: 'positive' }
      },
      taxonomy: { label: 'Technology' }
    }

    const conditions = buildYieldConditions(result)

    expect(conditions.isPremium).toBe(true)
    expect(conditions.isBrandSafe).toBe(true)
    expect(conditions.suggestedFloorMultiplier).toBeGreaterThan(1.0)
  })

  test('should reduce floor for low suitability', () => {
    const result = {
      enrichments: {
        contentDepth: { level: 'low', score: 0.3 },
        suitability: { score: 0.3 },
        sentiment: { label: 'negative' }
      },
      taxonomy: { label: 'General' }
    }

    const conditions = buildYieldConditions(result)

    expect(conditions.isPremium).toBe(false)
    expect(conditions.isBrandSafe).toBe(false)
    expect(conditions.suggestedFloorMultiplier).toBeLessThan(1.0)
  })

  test('should give bonus for premium categories', () => {
    const premiumResult = {
      enrichments: {
        contentDepth: { level: 'medium', score: 0.5 },
        suitability: { score: 0.7 }
      },
      taxonomy: { label: 'Business' }
    }

    const generalResult = {
      enrichments: {
        contentDepth: { level: 'medium', score: 0.5 },
        suitability: { score: 0.7 }
      },
      taxonomy: { label: 'General' }
    }

    const premiumConditions = buildYieldConditions(premiumResult)
    const generalConditions = buildYieldConditions(generalResult)

    expect(premiumConditions.suggestedFloorMultiplier).toBeGreaterThan(generalConditions.suggestedFloorMultiplier)
  })
})

describe('generateGPTCode', () => {
  test('should generate valid GPT code', () => {
    const result = {
      taxonomy: { label: 'Technology', score: 0.8 },
      enrichments: {
        sentiment: { label: 'positive' },
        suitability: { level: 'high', score: 0.9 }
      }
    }

    const code = generateGPTCode(result)

    expect(code).toContain('googletag.cmd.push')
    expect(code).toContain('googletag.pubads().setTargeting')
    expect(code).toContain('mixpeek_category')
    expect(code).toContain('technology')
  })

  test('should escape single quotes in values', () => {
    const result = {
      enrichments: {
        keywords: ["it's", 'test']
      }
    }

    const code = generateGPTCode(result)

    // Should escape the apostrophe
    expect(code).not.toContain("'it's'")
  })
})

describe('validateTargeting', () => {
  test('should validate valid targeting', () => {
    const targeting = {
      mixpeek_category: 'technology',
      mixpeek_sentiment: 'positive'
    }

    const result = validateTargeting(targeting)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  test('should catch keys exceeding max length', () => {
    const targeting = {
      'mixpeek_very_long_key_name_that_exceeds_forty_characters_limit': 'value'
    }

    const result = validateTargeting(targeting)

    expect(result.valid).toBe(false)
    expect(result.issues.some(i => i.includes('max length'))).toBe(true)
  })

  test('should catch invalid characters in keys', () => {
    const targeting = {
      'mixpeek!invalid': 'value'
    }

    const result = validateTargeting(targeting)

    expect(result.valid).toBe(false)
    expect(result.issues.some(i => i.includes('invalid characters'))).toBe(true)
  })

  test('should catch values exceeding max length', () => {
    const targeting = {
      mixpeek_keywords: 'a'.repeat(50)
    }

    const result = validateTargeting(targeting)

    expect(result.valid).toBe(false)
    expect(result.issues.some(i => i.includes('max length'))).toBe(true)
  })
})

describe('TARGETING_KEYS', () => {
  test('should have all required keys defined', () => {
    expect(TARGETING_KEYS.IAB_V3).toBeDefined()
    expect(TARGETING_KEYS.IAB_V2).toBeDefined()
    expect(TARGETING_KEYS.SENTIMENT).toBeDefined()
    expect(TARGETING_KEYS.SUITABILITY).toBeDefined()
    expect(TARGETING_KEYS.ADJACENCY_SCORE).toBeDefined()
    expect(TARGETING_KEYS.CONTENT_DEPTH).toBeDefined()
    expect(TARGETING_KEYS.KEYWORDS).toBeDefined()
    expect(TARGETING_KEYS.CATEGORY).toBeDefined()
    expect(TARGETING_KEYS.BRAND_SAFETY).toBeDefined()
    expect(TARGETING_KEYS.CONTENT_QUALITY).toBeDefined()
  })

  test('should all have mixpeek_ prefix', () => {
    for (const key of Object.values(TARGETING_KEYS)) {
      expect(key).toMatch(/^mixpeek_/)
    }
  })
})
