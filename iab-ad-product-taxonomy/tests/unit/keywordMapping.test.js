/**
 * Unit Tests - Keyword Mapping
 */

import {
  mapKeywordToCategory,
  mapKeywordsToCategories,
  findBestMatch,
  getKeywordsForCategory,
  getAllKeywords
} from '../../src/utils/keywordMapping.js';

describe('Keyword Mapping', () => {
  describe('mapKeywordToCategory', () => {
    it('should map electronics keywords', () => {
      const result = mapKeywordToCategory('smartphone');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1118);
      expect(result.name).toBe('Smartphones');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should map wearables keywords', () => {
      const result = mapKeywordToCategory('smartwatch');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1121);
      expect(result.name).toBe('Smartwatches');
    });

    it('should map travel keywords', () => {
      const result = mapKeywordToCategory('hotel');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1812);
    });

    it('should map automotive keywords', () => {
      const result = mapKeywordToCategory('car');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1861);
    });

    it('should be case insensitive', () => {
      const lower = mapKeywordToCategory('smartphone');
      const upper = mapKeywordToCategory('SMARTPHONE');
      const mixed = mapKeywordToCategory('SmartPhone');

      expect(lower.id).toBe(upper.id);
      expect(lower.id).toBe(mixed.id);
    });

    it('should return null for unknown keywords', () => {
      expect(mapKeywordToCategory('xyzabc123')).toBeNull();
      expect(mapKeywordToCategory('')).toBeNull();
      expect(mapKeywordToCategory(null)).toBeNull();
    });

    it('should map finance keywords', () => {
      const result = mapKeywordToCategory('credit card');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1345);
    });

    it('should map alcohol keywords', () => {
      const result = mapKeywordToCategory('beer');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1004);
    });
  });

  describe('mapKeywordsToCategories', () => {
    it('should map multiple keywords', () => {
      const keywords = ['smartphone', 'laptop', 'tablet'];
      const results = mapKeywordsToCategories(keywords);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.id).toBeDefined();
        expect(r.confidence).toBeGreaterThan(0);
      });
    });

    it('should include match count and keywords', () => {
      const keywords = ['phone', 'smartphone', 'mobile'];
      const results = mapKeywordsToCategories(keywords);

      const phoneMatch = results.find(r => r.id === 1118);
      expect(phoneMatch).toBeDefined();
      expect(phoneMatch.matchCount).toBeGreaterThan(0);
      expect(phoneMatch.keywords.length).toBeGreaterThan(0);
    });

    it('should sort by match count', () => {
      const keywords = ['phone', 'smartphone', 'mobile', 'hotel'];
      const results = mapKeywordsToCategories(keywords);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].matchCount).toBeGreaterThanOrEqual(results[i].matchCount);
      }
    });

    it('should handle empty array', () => {
      expect(mapKeywordsToCategories([])).toEqual([]);
      expect(mapKeywordsToCategories(null)).toEqual([]);
    });
  });

  describe('findBestMatch', () => {
    it('should find match from product title', () => {
      const result = findBestMatch('Smartwatch GPS fitness tracker device');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1121); // Smartwatches
    });

    it('should find match from description', () => {
      const result = findBestMatch('Luxury hotel stay with breakfast included');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1812); // Hotels
    });

    it('should handle two-word phrases', () => {
      const result = findBestMatch('Get your credit card approved today');
      expect(result).not.toBeNull();
      expect(result.id).toBe(1345); // Credit Cards
    });

    it('should return null for no match', () => {
      const result = findBestMatch('xyz abc 123');
      expect(result).toBeNull();
    });
  });

  describe('getKeywordsForCategory', () => {
    it('should return keywords for a category', () => {
      const keywords = getKeywordsForCategory(1118); // Smartphones
      expect(keywords).toContain('smartphone');
      expect(keywords).toContain('phone');
      expect(keywords).toContain('iphone');
    });

    it('should handle string ID', () => {
      const keywords = getKeywordsForCategory('1118');
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('should return empty for invalid category', () => {
      const keywords = getKeywordsForCategory(99999);
      expect(keywords).toEqual([]);
    });
  });

  describe('getAllKeywords', () => {
    it('should return all mapped keywords', () => {
      const keywords = getAllKeywords();
      expect(keywords.length).toBeGreaterThan(100);
      expect(keywords).toContain('smartphone');
      expect(keywords).toContain('hotel');
      expect(keywords).toContain('car');
    });
  });
});
