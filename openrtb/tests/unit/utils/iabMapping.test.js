/**
 * Unit Tests - IAB Mapping
 */

import {
  IAB_TAXONOMY,
  keywordToIAB,
  keywordsToIAB,
  getCategoryInfo,
  getParentCategory,
  isTier1Category,
  getTier1Categories,
  isValidCategory
} from '../../../src/utils/iabMapping.js';

describe('IAB Mapping', () => {
  describe('IAB_TAXONOMY', () => {
    it('should contain tier 1 categories', () => {
      expect(IAB_TAXONOMY['IAB1']).toBeDefined();
      expect(IAB_TAXONOMY['IAB1'].name).toBe('Arts & Entertainment');
      expect(IAB_TAXONOMY['IAB1'].tier).toBe(1);
    });

    it('should contain tier 2 subcategories', () => {
      expect(IAB_TAXONOMY['IAB1-5']).toBeDefined();
      expect(IAB_TAXONOMY['IAB1-5'].name).toBe('Movies');
      expect(IAB_TAXONOMY['IAB1-5'].tier).toBe(2);
      expect(IAB_TAXONOMY['IAB1-5'].parent).toBe('IAB1');
    });
  });

  describe('keywordToIAB', () => {
    it('should map technology keywords', () => {
      expect(keywordToIAB('technology')).toBe('IAB19');
      expect(keywordToIAB('computer')).toBe('IAB19');
      expect(keywordToIAB('software')).toBe('IAB19');
    });

    it('should map sports keywords', () => {
      expect(keywordToIAB('football')).toBe('IAB17-12');
      expect(keywordToIAB('basketball')).toBe('IAB17-26');
      expect(keywordToIAB('sports')).toBe('IAB17');
    });

    it('should map entertainment keywords', () => {
      expect(keywordToIAB('movie')).toBe('IAB1-5');
      expect(keywordToIAB('music')).toBe('IAB1-6');
      expect(keywordToIAB('television')).toBe('IAB1-7');
    });

    it('should be case insensitive', () => {
      expect(keywordToIAB('TECHNOLOGY')).toBe('IAB19');
      expect(keywordToIAB('Technology')).toBe('IAB19');
    });

    it('should return null for unknown keywords', () => {
      expect(keywordToIAB('xyzabc123')).toBeNull();
      expect(keywordToIAB('')).toBeNull();
      expect(keywordToIAB(null)).toBeNull();
    });
  });

  describe('keywordsToIAB', () => {
    it('should map multiple keywords to categories', () => {
      const keywords = ['technology', 'football', 'movie'];
      const categories = keywordsToIAB(keywords);
      expect(categories).toContain('IAB19');
      expect(categories).toContain('IAB17-12');
      expect(categories).toContain('IAB17'); // Parent of IAB17-12
      expect(categories).toContain('IAB1-5');
      expect(categories).toContain('IAB1'); // Parent of IAB1-5
    });

    it('should deduplicate categories', () => {
      const keywords = ['movie', 'movies', 'film'];
      const categories = keywordsToIAB(keywords);
      const uniqueCount = new Set(categories).size;
      expect(categories.length).toBe(uniqueCount);
    });

    it('should handle empty array', () => {
      expect(keywordsToIAB([])).toEqual([]);
      expect(keywordsToIAB(null)).toEqual([]);
    });
  });

  describe('getCategoryInfo', () => {
    it('should return category info', () => {
      const info = getCategoryInfo('IAB19');
      expect(info.name).toBe('Technology & Computing');
      expect(info.tier).toBe(1);
    });

    it('should return subcategory info with parent', () => {
      const info = getCategoryInfo('IAB17-12');
      expect(info.name).toBe('Football');
      expect(info.parent).toBe('IAB17');
    });

    it('should return null for invalid category', () => {
      expect(getCategoryInfo('IAB999')).toBeNull();
    });
  });

  describe('getParentCategory', () => {
    it('should return parent for subcategory', () => {
      expect(getParentCategory('IAB17-12')).toBe('IAB17');
      expect(getParentCategory('IAB1-5')).toBe('IAB1');
    });

    it('should return null for tier 1 category', () => {
      expect(getParentCategory('IAB19')).toBeNull();
    });

    it('should return null for invalid category', () => {
      expect(getParentCategory('invalid')).toBeNull();
    });
  });

  describe('isTier1Category', () => {
    it('should return true for tier 1 categories', () => {
      expect(isTier1Category('IAB1')).toBe(true);
      expect(isTier1Category('IAB19')).toBe(true);
    });

    it('should return false for tier 2 categories', () => {
      expect(isTier1Category('IAB1-5')).toBe(false);
      expect(isTier1Category('IAB17-12')).toBe(false);
    });
  });

  describe('getTier1Categories', () => {
    it('should return all tier 1 categories', () => {
      const tier1 = getTier1Categories();
      expect(tier1.length).toBeGreaterThan(20);
      expect(tier1).toContain('IAB1');
      expect(tier1).toContain('IAB19');
      expect(tier1).not.toContain('IAB1-5');
    });
  });

  describe('isValidCategory', () => {
    it('should validate known categories', () => {
      expect(isValidCategory('IAB1')).toBe(true);
      expect(isValidCategory('IAB19-18')).toBe(true);
    });

    it('should reject unknown categories', () => {
      expect(isValidCategory('IAB999')).toBe(false);
      expect(isValidCategory('invalid')).toBe(false);
    });
  });
});
