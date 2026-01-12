/**
 * Unit Tests - IAB Ad Product Taxonomy Data
 */

import {
  IAB_AD_PRODUCT_TAXONOMY,
  IAB_AD_PRODUCT_TIER1,
  getIABCode,
  getIdFromCode,
  getCategoryById,
  getTier1Categories,
  getChildCategories,
  getCategoryPath,
  getCategoryLabel,
  isValidCategory,
  getTier1Parent
} from '../../src/data/taxonomy.js';

describe('IAB Ad Product Taxonomy Data', () => {
  describe('IAB_AD_PRODUCT_TAXONOMY', () => {
    it('should contain tier 1 categories', () => {
      expect(IAB_AD_PRODUCT_TAXONOMY[1115]).toBeDefined();
      expect(IAB_AD_PRODUCT_TAXONOMY[1115].name).toBe('Consumer Electronics');
      expect(IAB_AD_PRODUCT_TAXONOMY[1115].tier).toBe(1);
    });

    it('should contain tier 2 subcategories', () => {
      expect(IAB_AD_PRODUCT_TAXONOMY[1120]).toBeDefined();
      expect(IAB_AD_PRODUCT_TAXONOMY[1120].name).toBe('Wearables');
      expect(IAB_AD_PRODUCT_TAXONOMY[1120].tier).toBe(2);
      expect(IAB_AD_PRODUCT_TAXONOMY[1120].parent).toBe(1115);
    });

    it('should contain tier 3 subcategories', () => {
      expect(IAB_AD_PRODUCT_TAXONOMY[1121]).toBeDefined();
      expect(IAB_AD_PRODUCT_TAXONOMY[1121].name).toBe('Smartwatches');
      expect(IAB_AD_PRODUCT_TAXONOMY[1121].tier).toBe(3);
      expect(IAB_AD_PRODUCT_TAXONOMY[1121].parent).toBe(1120);
    });
  });

  describe('IAB_AD_PRODUCT_TIER1', () => {
    it('should contain only tier 1 categories', () => {
      const categories = Object.values(IAB_AD_PRODUCT_TIER1);
      expect(categories.length).toBeGreaterThan(30);
      categories.forEach(cat => {
        expect(cat.tier).toBe(1);
      });
    });
  });

  describe('getIABCode', () => {
    it('should return IAB-AP format code', () => {
      expect(getIABCode(1115)).toBe('IAB-AP-1115');
      expect(getIABCode(1121)).toBe('IAB-AP-1121');
    });
  });

  describe('getIdFromCode', () => {
    it('should extract ID from IAB-AP code', () => {
      expect(getIdFromCode('IAB-AP-1115')).toBe(1115);
      expect(getIdFromCode('IAB-AP-1121')).toBe(1121);
    });

    it('should return null for invalid codes', () => {
      expect(getIdFromCode('invalid')).toBeNull();
      expect(getIdFromCode(null)).toBeNull();
    });
  });

  describe('getCategoryById', () => {
    it('should return category info for valid ID', () => {
      const cat = getCategoryById(1115);
      expect(cat.id).toBe(1115);
      expect(cat.name).toBe('Consumer Electronics');
    });

    it('should handle string IDs', () => {
      const cat = getCategoryById('1115');
      expect(cat.id).toBe(1115);
    });

    it('should return null for invalid ID', () => {
      expect(getCategoryById(99999)).toBeNull();
    });
  });

  describe('getTier1Categories', () => {
    it('should return all tier 1 categories', () => {
      const tier1 = getTier1Categories();
      expect(tier1.length).toBeGreaterThan(30);
      tier1.forEach(cat => {
        expect(cat.tier).toBe(1);
        expect(cat.parent).toBeNull();
      });
    });

    it('should include major categories', () => {
      const tier1 = getTier1Categories();
      const names = tier1.map(c => c.name);
      expect(names).toContain('Consumer Electronics');
      expect(names).toContain('Clothing and Accessories');
      expect(names).toContain('Travel and Tourism');
      expect(names).toContain('Vehicles');
    });
  });

  describe('getChildCategories', () => {
    it('should return children of a category', () => {
      const children = getChildCategories(1115); // Consumer Electronics
      expect(children.length).toBeGreaterThan(5);
      children.forEach(child => {
        expect(child.parent).toBe(1115);
      });
    });

    it('should return empty array for leaf category', () => {
      const children = getChildCategories(1121); // Smartwatches (tier 3)
      expect(children.length).toBe(0);
    });
  });

  describe('getCategoryPath', () => {
    it('should return full path from root to category', () => {
      const path = getCategoryPath(1121); // Smartwatches
      expect(path.length).toBe(3);
      expect(path[0].name).toBe('Consumer Electronics');
      expect(path[1].name).toBe('Wearables');
      expect(path[2].name).toBe('Smartwatches');
    });

    it('should return single item for tier 1 category', () => {
      const path = getCategoryPath(1115);
      expect(path.length).toBe(1);
      expect(path[0].name).toBe('Consumer Electronics');
    });
  });

  describe('getCategoryLabel', () => {
    it('should return formatted label path', () => {
      const label = getCategoryLabel(1121);
      expect(label).toBe('Consumer Electronics > Wearables > Smartwatches');
    });

    it('should return simple label for tier 1', () => {
      const label = getCategoryLabel(1115);
      expect(label).toBe('Consumer Electronics');
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory(1115)).toBe(true);
      expect(isValidCategory(1121)).toBe(true);
      expect(isValidCategory('1115')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory(99999)).toBe(false);
      expect(isValidCategory(0)).toBe(false);
    });
  });

  describe('getTier1Parent', () => {
    it('should return tier 1 parent for any category', () => {
      const parent = getTier1Parent(1121); // Smartwatches
      expect(parent.id).toBe(1115);
      expect(parent.name).toBe('Consumer Electronics');
    });

    it('should return same category for tier 1', () => {
      const parent = getTier1Parent(1115);
      expect(parent.id).toBe(1115);
    });
  });
});
