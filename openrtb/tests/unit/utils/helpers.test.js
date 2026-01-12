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
  analyzeSentiment,
  inferCategory,
  assessBrandSafety,
  detectLanguage,
  deepMerge,
  isValidUrl,
  extractDomain
} from '../../../src/utils/helpers.js';

describe('Helper Utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('createCacheKey', () => {
    it('should create consistent cache keys for same content', () => {
      const content = { url: 'https://example.com', title: 'Test' };
      const key1 = createCacheKey(content);
      const key2 = createCacheKey(content);
      expect(key1).toBe(key2);
    });

    it('should create different keys for different content', () => {
      const key1 = createCacheKey({ url: 'https://example.com' });
      const key2 = createCacheKey({ url: 'https://other.com' });
      expect(key1).not.toBe(key2);
    });

    it('should handle missing properties', () => {
      const key = createCacheKey({});
      expect(key).toContain('mixpeek_');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeText('<p>Hello <strong>World</strong></p>');
      expect(result).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const result = sanitizeText('Hello    World\n\nTest');
      expect(result).toBe('Hello World Test');
    });

    it('should truncate to max length', () => {
      const longText = 'a'.repeat(100000);
      const result = sanitizeText(longText);
      expect(result.length).toBeLessThanOrEqual(50000);
    });

    it('should handle null/undefined', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });

  describe('sanitizeTitle', () => {
    it('should truncate long titles', () => {
      const longTitle = 'a'.repeat(500);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('sanitizeDescription', () => {
    it('should truncate long descriptions', () => {
      const longDesc = 'a'.repeat(1000);
      const result = sanitizeDescription(longDesc);
      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'Technology companies are developing artificial intelligence systems';
      const keywords = extractKeywords(text);
      expect(keywords).toContain('technology');
      expect(keywords).toContain('companies');
      expect(keywords).toContain('artificial');
    });

    it('should filter out stop words', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const keywords = extractKeywords(text);
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('over');
    });

    it('should limit number of keywords', () => {
      const text = 'word1 word2 word3 word4 word5 '.repeat(100);
      const keywords = extractKeywords(text, 10);
      expect(keywords.length).toBeLessThanOrEqual(10);
    });

    it('should handle empty text', () => {
      expect(extractKeywords('')).toEqual([]);
      expect(extractKeywords(null)).toEqual([]);
    });
  });

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const result = analyzeSentiment('This is amazing and wonderful! Great product!');
      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', () => {
      const result = analyzeSentiment('This is terrible and awful. Horrible experience!');
      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(0);
    });

    it('should detect neutral sentiment', () => {
      const result = analyzeSentiment('The weather today is partly cloudy.');
      expect(result.sentiment).toBe('neutral');
    });

    it('should handle empty text', () => {
      const result = analyzeSentiment('');
      expect(result.sentiment).toBe('neutral');
      expect(result.score).toBe(0);
    });
  });

  describe('inferCategory', () => {
    it('should infer technology category', () => {
      const keywords = ['technology', 'software', 'computer', 'programming'];
      const result = inferCategory(keywords);
      expect(result.category).toBe('IAB19');
      expect(result.categoryName).toBe('Technology & Computing');
    });

    it('should infer sports category', () => {
      const keywords = ['football', 'team', 'game', 'athlete'];
      const result = inferCategory(keywords);
      expect(result.category).toBe('IAB17');
    });

    it('should return null for unknown categories', () => {
      const result = inferCategory(['xyz123', 'abc456']);
      expect(result.category).toBeNull();
    });

    it('should handle empty keywords', () => {
      const result = inferCategory([]);
      expect(result.category).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('assessBrandSafety', () => {
    it('should mark safe content', () => {
      const result = assessBrandSafety('Technology news about new smartphones');
      expect(result.level).toBe('safe');
      expect(result.score).toBe(1.0);
    });

    it('should detect medium risk content', () => {
      const result = assessBrandSafety('The war and conflict continue to cause crisis');
      expect(result.level).toBe('medium_risk');
      expect(result.score).toBeLessThan(1.0);
    });

    it('should detect high risk content', () => {
      const result = assessBrandSafety('Violence and drug-related crime incidents');
      expect(result.level).toBe('high_risk');
      expect(result.score).toBeLessThan(0.5);
    });

    it('should handle empty text', () => {
      const result = assessBrandSafety('');
      expect(result.level).toBe('safe');
    });
  });

  describe('detectLanguage', () => {
    it('should detect English', () => {
      const result = detectLanguage('The quick brown fox jumps over the lazy dog');
      expect(result).toBe('en');
    });

    it('should detect Spanish', () => {
      const result = detectLanguage('El rapido zorro marron salta sobre el perro perezoso');
      expect(result).toBe('es');
    });

    it('should detect French', () => {
      const result = detectLanguage('Le renard brun rapide saute par dessus le chien paresseux');
      expect(result).toBe('fr');
    });

    it('should default to English for short text', () => {
      const result = detectLanguage('Hi');
      expect(result).toBe('en');
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should not mutate original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      deepMerge(target, source);
      expect(target).toEqual({ a: 1 });
    });

    it('should handle arrays', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };
      const result = deepMerge(target, source);
      expect(result.a).toEqual([3, 4]);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(extractDomain('https://sub.domain.com:8080/path')).toBe('sub.domain.com');
    });

    it('should return null for invalid URLs', () => {
      expect(extractDomain('invalid')).toBeNull();
      expect(extractDomain(null)).toBeNull();
    });
  });
});
