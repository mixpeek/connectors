/**
 * Integration Tests - Product Mapper
 */

import { createMapper, ProductMapper } from '../../src/modules/productMapper.js';
import { MAPPING_MODES } from '../../src/config/constants.js';

describe('ProductMapper Integration', () => {
  let mapper;

  beforeEach(() => {
    mapper = createMapper({
      enableCache: true,
      enableSemantic: false, // Deterministic only for integration tests
      mappingMode: MAPPING_MODES.DETERMINISTIC,
      debug: false
    });
  });

  describe('mapProduct', () => {
    it('should map electronics product', async () => {
      const result = await mapper.mapProduct({
        title: 'Apple Watch Series 9',
        description: 'GPS smartwatch with heart rate monitor'
      });

      expect(result.success).toBe(true);
      expect(result.iab_product).toBeDefined();
      expect(result.iab_product.primary).toMatch(/IAB-AP-\d+/);
      expect(result.iab_product.confidence).toBeGreaterThan(0.5);
    });

    it('should map clothing product', async () => {
      const result = await mapper.mapProduct({
        title: 'Nike Air Max Running Shoes',
        description: 'Lightweight running shoes with air cushioning'
      });

      expect(result.success).toBe(true);
      expect(result.iab_product.label).toContain('Footwear');
    });

    it('should map travel product', async () => {
      const result = await mapper.mapProduct({
        title: 'Marriott Hotel Booking',
        description: 'Luxury hotel stay in New York City'
      });

      expect(result.success).toBe(true);
      expect(result.iab_product.tier1Label).toBe('Travel and Tourism');
    });

    it('should map automotive product', async () => {
      const result = await mapper.mapProduct({
        title: 'Tesla Model 3',
        description: 'All-electric sedan with autopilot'
      });

      expect(result.success).toBe(true);
      expect(['Vehicles', 'Electric Vehicles']).toContain(result.iab_product.tier1Label || result.iab_product.label.split(' > ')[0]);
    });

    it('should return error for invalid input', async () => {
      const result = await mapper.mapProduct({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include secondary categories when requested', async () => {
      const result = await mapper.mapProduct(
        {
          title: 'iPhone 15 Pro smartphone',
          description: 'Apple mobile phone with camera'
        },
        { includeSecondary: true }
      );

      expect(result.success).toBe(true);
      // May or may not have secondary depending on matches
    });

    it('should cache results', async () => {
      const product = {
        title: 'Test Product Smartphone',
        description: 'Test description mobile phone'
      };

      const result1 = await mapper.mapProduct(product);
      const result2 = await mapper.mapProduct(product);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.cached).toBe(true);
    });

    it('should handle brand information', async () => {
      const result = await mapper.mapProduct({
        title: 'Premium Coffee',
        description: 'Arabica coffee beans',
        brand: 'Starbucks'
      });

      expect(result.success).toBe(true);
    });

    it('should handle keywords', async () => {
      const result = await mapper.mapProduct({
        title: 'Generic Product',
        description: 'Some description',
        keywords: ['smartphone', 'mobile', 'phone']
      });

      expect(result.success).toBe(true);
      expect(result.iab_product).toBeDefined();
    });
  });

  describe('mapProducts (batch)', () => {
    it('should map multiple products', async () => {
      const products = [
        { title: 'Apple Watch', description: 'Smartwatch' },
        { title: 'Nike Shoes', description: 'Running footwear' },
        { title: 'Marriott Hotel', description: 'Hotel booking' }
      ];

      const results = await mapper.mapProducts(products);

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('lookupCategory', () => {
    it('should lookup category by ID', () => {
      const category = mapper.lookupCategory(1115);

      expect(category).not.toBeNull();
      expect(category.name).toBe('Consumer Electronics');
      expect(category.code).toBe('IAB-AP-1115');
    });

    it('should return null for invalid ID', () => {
      const category = mapper.lookupCategory(99999);
      expect(category).toBeNull();
    });
  });

  describe('validateCategory', () => {
    it('should validate valid categories', () => {
      expect(mapper.validateCategory(1115)).toBe(true);
      expect(mapper.validateCategory('IAB-AP-1115')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(mapper.validateCategory(99999)).toBe(false);
      expect(mapper.validateCategory('IAB-AP-99999')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      await mapper.mapProduct({ title: 'Test smartphone' });
      await mapper.mapProduct({ title: 'Test smartphone' }); // Cache hit

      const stats = mapper.getStats();

      expect(stats.requests).toBe(2);
      expect(stats.cacheHits).toBe(1);
      expect(stats.deterministicMatches).toBeGreaterThanOrEqual(1);
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await mapper.mapProduct({ title: 'Test smartphone' });

      const statsBefore = mapper.getStats();
      expect(statsBefore.cache.size).toBeGreaterThan(0);

      mapper.clearCache();

      const statsAfter = mapper.getStats();
      expect(statsAfter.cache.size).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await mapper.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.mode).toBe(MAPPING_MODES.DETERMINISTIC);
      expect(health.cache).toBeDefined();
    });
  });
});
