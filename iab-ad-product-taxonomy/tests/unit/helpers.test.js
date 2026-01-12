/**
 * Unit Tests - Helper Utilities
 */

import {
  generateId,
  createCacheKey,
  sanitizeText,
  sanitizeTitle,
  sanitizeDescription,
  extractKeywords,
  validateConfig,
  validateInput,
  deepMerge,
  normalizeText
} from '../../src/utils/helpers.js';

describe('Helper Utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should return string ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('createCacheKey', () => {
    it('should create consistent keys for same input', () => {
      const input = { title: 'Test Product', description: 'Description' };
      const key1 = createCacheKey(input);
      const key2 = createCacheKey(input);
      expect(key1).toBe(key2);
    });

    it('should create different keys for different input', () => {
      const key1 = createCacheKey({ title: 'Product A' });
      const key2 = createCacheKey({ title: 'Product B' });
      expect(key1).not.toBe(key2);
    });

    it('should be case insensitive', () => {
      const key1 = createCacheKey({ title: 'Test Product' });
      const key2 = createCacheKey({ title: 'test product' });
      expect(key1).toBe(key2);
    });
  });

  describe('sanitizeText', () => {
    it('should replace control characters with spaces', () => {
      const text = 'Hello\x00World\x1F';
      const result = sanitizeText(text);
      expect(result).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const text = 'Hello   World\n\tTest';
      const result = sanitizeText(text);
      expect(result).toBe('Hello World Test');
    });

    it('should trim text', () => {
      const text = '  Hello World  ';
      const result = sanitizeText(text);
      expect(result).toBe('Hello World');
    });

    it('should truncate to max length', () => {
      const text = 'A'.repeat(3000);
      const result = sanitizeText(text, 100);
      expect(result.length).toBe(100);
    });

    it('should handle null/undefined', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });

  describe('sanitizeTitle', () => {
    it('should sanitize and limit title length', () => {
      const title = 'A'.repeat(600);
      const result = sanitizeTitle(title);
      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe('sanitizeDescription', () => {
    it('should sanitize and limit description length', () => {
      const desc = 'A'.repeat(3000);
      const result = sanitizeDescription(desc);
      expect(result.length).toBeLessThanOrEqual(2000);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'Apple iPhone 15 Pro smartphone with camera and display';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('apple');
      expect(keywords).toContain('iphone');
      expect(keywords).toContain('smartphone');
    });

    it('should filter stop words', () => {
      const text = 'This is a test of the keyword extraction system';
      const keywords = extractKeywords(text);

      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('the');
    });

    it('should handle empty input', () => {
      expect(extractKeywords('')).toEqual([]);
      expect(extractKeywords(null)).toEqual([]);
    });

    it('should limit keyword count', () => {
      const text = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 ' +
                   'word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 ' +
                   'word21 word22 word23 word24 word25';
      const keywords = extractKeywords(text);
      expect(keywords.length).toBeLessThanOrEqual(20);
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config = {
        timeout: 5000,
        cacheTTL: 3600,
        minConfidence: 0.5
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject null config', () => {
      const result = validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require API key for semantic mode', () => {
      const config = { enableSemantic: true };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('API key is required for semantic mapping');
    });

    it('should validate timeout is positive', () => {
      const config = { timeout: -100 };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });

    it('should validate minConfidence range', () => {
      const config = { minConfidence: 1.5 };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInput', () => {
    it('should validate valid input', () => {
      const input = { title: 'Test Product' };
      const result = validateInput(input);
      expect(result.valid).toBe(true);
    });

    it('should reject null input', () => {
      const result = validateInput(null);
      expect(result.valid).toBe(false);
    });

    it('should require title or description', () => {
      const result = validateInput({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least title or description is required');
    });

    it('should accept description without title', () => {
      const result = validateInput({ description: 'Test description' });
      expect(result.valid).toBe(true);
    });
  });

  describe('deepMerge', () => {
    it('should merge nested objects', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = deepMerge(target, source);

      expect(result.a).toBe(1);
      expect(result.b.c).toBe(2);
      expect(result.b.d).toBe(3);
      expect(result.e).toBe(4);
    });

    it('should not mutate original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      deepMerge(target, source);

      expect(target.b).toBeUndefined();
    });
  });

  describe('normalizeText', () => {
    it('should lowercase text', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    it('should remove punctuation', () => {
      expect(normalizeText('Hello, World!')).toBe('hello world');
    });

    it('should normalize whitespace', () => {
      expect(normalizeText('Hello   World')).toBe('hello world');
    });

    it('should handle empty input', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText(null)).toBe('');
    });
  });
});
