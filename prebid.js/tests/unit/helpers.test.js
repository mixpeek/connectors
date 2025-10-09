/**
 * Tests for helper utilities
 */

import {
  generateUUID,
  hashString,
  isObject,
  deepMerge,
  validateConfig,
  truncateText,
  extractDomain,
  sanitizeText,
  safeJSONParse,
  formatTaxonomyPath,
  getTimestamp,
  isExpired
} from '../../src/utils/helpers.js'

describe('helpers', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('hashString', () => {
    it('should generate a hash from a string', () => {
      const hash = hashString('test')
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate consistent hashes', () => {
      const hash1 = hashString('test')
      const hash2 = hashString('test')
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different strings', () => {
      const hash1 = hashString('test1')
      const hash2 = hashString('test2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject('string')).toBe(false)
      expect(isObject(123)).toBe(false)
      expect(isObject(undefined)).toBe(false)
    })
  })

  describe('deepMerge', () => {
    it('should merge two objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = deepMerge(target, source)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should deep merge nested objects', () => {
      const target = { a: { b: 1, c: 2 } }
      const source = { a: { c: 3, d: 4 } }
      const result = deepMerge(target, source)
      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } })
    })

    it('should not mutate the target', () => {
      const target = { a: 1 }
      const source = { b: 2 }
      deepMerge(target, source)
      expect(target).toEqual({ a: 1 })
    })
  })

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config = {
        apiKey: 'test-key',
        collectionId: 'test-collection'
      }
      const result = validateConfig(config)
      expect(result.valid).toBe(true)
    })

    it('should reject config without apiKey', () => {
      const config = { collectionId: 'test-collection' }
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('apiKey is required and must be a string')
    })

    it('should reject config without collectionId', () => {
      const config = { apiKey: 'test-key' }
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('collectionId is required and must be a string')
    })

    it('should reject negative timeout', () => {
      const config = {
        apiKey: 'test-key',
        collectionId: 'test-collection',
        timeout: -100
      }
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('timeout must be a positive number')
    })
  })

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Short text'
      expect(truncateText(text, 100)).toBe(text)
    })

    it('should truncate long text', () => {
      const text = 'a'.repeat(1000)
      const truncated = truncateText(text, 500)
      expect(truncated.length).toBe(500)
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com')
      expect(extractDomain('http://www.test.com:8080/page')).toBe('www.test.com')
    })

    it('should return empty string for invalid URL', () => {
      expect(extractDomain('not-a-url')).toBe('')
    })
  })

  describe('sanitizeText', () => {
    it('should normalize whitespace', () => {
      expect(sanitizeText('text   with   spaces')).toBe('text with spaces')
    })

    it('should remove newlines and tabs', () => {
      expect(sanitizeText('line1\nline2\tline3')).toBe('line1 line2 line3')
    })

    it('should trim text', () => {
      expect(sanitizeText('  text  ')).toBe('text')
    })
  })

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"a":1,"b":2}'
      expect(safeJSONParse(json)).toEqual({ a: 1, b: 2 })
    })

    it('should return fallback for invalid JSON', () => {
      expect(safeJSONParse('invalid', null)).toBe(null)
      expect(safeJSONParse('invalid', {})).toEqual({})
    })
  })

  describe('formatTaxonomyPath', () => {
    it('should format taxonomy path array', () => {
      expect(formatTaxonomyPath(['tech', 'ai', 'ml'])).toBe('tech/ai/ml')
    })

    it('should return empty string for empty array', () => {
      expect(formatTaxonomyPath([])).toBe('')
    })
  })

  describe('timestamp functions', () => {
    it('should get current timestamp', () => {
      const timestamp = getTimestamp()
      expect(typeof timestamp).toBe('number')
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should check if timestamp is expired', () => {
      const oldTimestamp = getTimestamp() - 400
      const newTimestamp = getTimestamp()
      
      expect(isExpired(oldTimestamp, 300)).toBe(true)
      expect(isExpired(newTimestamp, 300)).toBe(false)
    })
  })
})

