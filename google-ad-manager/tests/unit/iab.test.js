/**
 * Unit Tests - IAB Taxonomy Module
 */

import {
  IAB_V2_CATEGORIES,
  IAB_V3_CATEGORIES,
  getIABCode,
  getIABv3Code,
  getIABLabel,
  getIABv3Label,
  convertV2toV3,
  convertV3toV2,
  getParentCategories,
  isBrandSafe
} from '../../src/iab.js'

describe('IAB_V2_CATEGORIES', () => {
  test('should have all tier 1 categories', () => {
    expect(IAB_V2_CATEGORIES['IAB1']).toBe('Arts & Entertainment')
    expect(IAB_V2_CATEGORIES['IAB19']).toBe('Technology & Computing')
    expect(IAB_V2_CATEGORIES['IAB3']).toBe('Business')
    expect(IAB_V2_CATEGORIES['IAB17']).toBe('Sports')
  })

  test('should have technology subcategories', () => {
    expect(IAB_V2_CATEGORIES['IAB19-4']).toBe('AI/Machine Learning')
    expect(IAB_V2_CATEGORIES['IAB19-9']).toBe('Cloud Computing')
    expect(IAB_V2_CATEGORIES['IAB19-33']).toBe('Programming')
  })
})

describe('IAB_V3_CATEGORIES', () => {
  test('should have all tier 1 categories', () => {
    expect(IAB_V3_CATEGORIES['1']).toBe('Arts & Entertainment')
    expect(IAB_V3_CATEGORIES['19']).toBe('Technology & Computing')
    expect(IAB_V3_CATEGORIES['3']).toBe('Business')
    expect(IAB_V3_CATEGORIES['17']).toBe('Sports')
  })

  test('should have technology subcategories', () => {
    expect(IAB_V3_CATEGORIES['19-1']).toBe('Artificial Intelligence')
    expect(IAB_V3_CATEGORIES['19-3']).toBe('Cloud Computing')
    expect(IAB_V3_CATEGORIES['19-12']).toBe('Programming')
  })
})

describe('getIABCode', () => {
  test('should return correct IAB v2.2 code for labels', () => {
    expect(getIABCode('Technology')).toBe('IAB19')
    expect(getIABCode('Business')).toBe('IAB3')
    expect(getIABCode('Sports')).toBe('IAB17')
    expect(getIABCode('Entertainment')).toBe('IAB1')
    expect(getIABCode('Health')).toBe('IAB7')
  })

  test('should handle full label names', () => {
    expect(getIABCode('Technology & Computing')).toBe('IAB19')
    expect(getIABCode('Arts & Entertainment')).toBe('IAB1')
    expect(getIABCode('Health & Fitness')).toBe('IAB7')
  })

  test('should return IAB24 for unknown categories', () => {
    expect(getIABCode('Unknown')).toBe('IAB24')
    expect(getIABCode('Random')).toBe('IAB24')
  })
})

describe('getIABv3Code', () => {
  test('should return correct IAB v3.0 code for labels', () => {
    expect(getIABv3Code('Technology')).toBe('19')
    expect(getIABv3Code('Business')).toBe('3')
    expect(getIABv3Code('Sports')).toBe('17')
    expect(getIABv3Code('Entertainment')).toBe('1')
    expect(getIABv3Code('Health')).toBe('7')
  })

  test('should return 24 for unknown categories', () => {
    expect(getIABv3Code('Unknown')).toBe('24')
    expect(getIABv3Code('Random')).toBe('24')
  })
})

describe('getIABLabel', () => {
  test('should return correct label for IAB v2.2 code', () => {
    expect(getIABLabel('IAB19')).toBe('Technology & Computing')
    expect(getIABLabel('IAB3')).toBe('Business')
    expect(getIABLabel('IAB17')).toBe('Sports')
  })

  test('should return Uncategorized for unknown codes', () => {
    expect(getIABLabel('IAB99')).toBe('Uncategorized')
    expect(getIABLabel('INVALID')).toBe('Uncategorized')
  })
})

describe('getIABv3Label', () => {
  test('should return correct label for IAB v3.0 code', () => {
    expect(getIABv3Label('19')).toBe('Technology & Computing')
    expect(getIABv3Label('3')).toBe('Business')
    expect(getIABv3Label('17')).toBe('Sports')
  })

  test('should return Uncategorized for unknown codes', () => {
    expect(getIABv3Label('99')).toBe('Uncategorized')
    expect(getIABv3Label('invalid')).toBe('Uncategorized')
  })
})

describe('convertV2toV3', () => {
  test('should convert IAB v2.2 to v3.0 codes', () => {
    expect(convertV2toV3('IAB19')).toBe('19')
    expect(convertV2toV3('IAB3')).toBe('3')
    expect(convertV2toV3('IAB17-12')).toBe('17-12')
  })

  test('should handle non-IAB prefixed codes', () => {
    expect(convertV2toV3('19')).toBe('19')
    expect(convertV2toV3('3')).toBe('3')
  })
})

describe('convertV3toV2', () => {
  test('should convert IAB v3.0 to v2.2 codes', () => {
    expect(convertV3toV2('19')).toBe('IAB19')
    expect(convertV3toV2('3')).toBe('IAB3')
    expect(convertV3toV2('17-12')).toBe('IAB17-12')
  })

  test('should handle already prefixed codes', () => {
    expect(convertV3toV2('IAB19')).toBe('IAB19')
    expect(convertV3toV2('IAB3')).toBe('IAB3')
  })
})

describe('getParentCategories', () => {
  test('should return only tier 1 categories', () => {
    const parents = getParentCategories()

    expect(parents['19']).toBe('Technology & Computing')
    expect(parents['3']).toBe('Business')

    // Should not include subcategories
    expect(parents['19-1']).toBeUndefined()
    expect(parents['17-12']).toBeUndefined()
  })

  test('should return all parent categories', () => {
    const parents = getParentCategories()

    // Should have at least 20 parent categories
    expect(Object.keys(parents).length).toBeGreaterThanOrEqual(20)
  })
})

describe('isBrandSafe', () => {
  test('should return true for standard categories', () => {
    expect(isBrandSafe('19')).toBe(true)
    expect(isBrandSafe('3')).toBe(true)
    expect(isBrandSafe('IAB19')).toBe(true)
    expect(isBrandSafe('IAB3')).toBe(true)
  })

  test('should return false for unsafe categories', () => {
    expect(isBrandSafe('24')).toBe(false) // Uncategorized
    expect(isBrandSafe('25')).toBe(false) // Non-Standard Content
    expect(isBrandSafe('26')).toBe(false) // Illegal Content
    expect(isBrandSafe('IAB24')).toBe(false)
    expect(isBrandSafe('IAB25')).toBe(false)
    expect(isBrandSafe('IAB26')).toBe(false)
  })
})
