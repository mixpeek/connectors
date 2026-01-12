/**
 * E2E Tests - Full Mapping Workflow
 */

import { createMapper } from '../../src/index.js';

describe('IAB Ad Product Taxonomy Mapping E2E', () => {
  let mapper;

  beforeAll(() => {
    mapper = createMapper({
      enableCache: true,
      enableSemantic: false,
      debug: false
    });
  });

  describe('Real Product Mapping Scenarios', () => {
    const testCases = [
      {
        name: 'Consumer Electronics - Wearable',
        product: {
          title: 'GPS Smartwatch Fitness Tracker',
          description: 'Smartwatch with heart rate monitor and fitness tracking',
          category: 'Electronics',
          brand: 'Apple'
        },
        expectedTier1: 'Consumer Electronics'
      },
      {
        name: 'Clothing - Footwear',
        product: {
          title: 'Nike Air Max Running Shoes',
          description: 'Lightweight running shoes with air cushioning',
          category: 'Footwear',
          brand: 'Nike'
        },
        expectedTier1: 'Clothing and Accessories'
      },
      {
        name: 'Travel - Hotels',
        product: {
          title: 'Marriott Bonvoy Hotel Stay',
          description: 'Luxury hotel accommodation with breakfast included',
          category: 'Travel',
          brand: 'Marriott'
        },
        expectedTier1: 'Travel and Tourism'
      },
      {
        name: 'Finance - Credit Cards',
        product: {
          title: 'Chase Credit Card Cashback Visa',
          description: 'Credit card with 2x points on dining and purchases',
          category: 'Finance',
          brand: 'Chase'
        },
        expectedTier1: 'Finance and Insurance'
      },
      {
        name: 'Vehicles - Electric',
        product: {
          title: 'Tesla Model 3',
          description: 'All-electric sedan with autopilot capability',
          category: 'Vehicles',
          brand: 'Tesla'
        },
        expectedContains: ['Vehicle', 'Electric']
      },
      {
        name: 'Health - Pharmaceuticals',
        product: {
          title: 'One A Day Vitamins',
          description: 'Complete multivitamin for adults',
          category: 'Health',
          brand: 'Bayer'
        },
        expectedTier1: 'Pharmaceuticals'
      },
      {
        name: 'Gaming - Hardware',
        product: {
          title: 'PlayStation 5 Console',
          description: 'Next-gen gaming console with 4K graphics',
          category: 'Gaming',
          brand: 'Sony'
        },
        expectedContains: ['Gaming', 'Electronics', 'Software']
      },
      {
        name: 'Food - Coffee',
        product: {
          title: 'Starbucks Coffee Beans',
          description: 'Premium arabica coffee beans, medium roast',
          category: 'Food',
          brand: 'Starbucks'
        },
        expectedContains: ['Coffee', 'Food', 'Beverage']
      }
    ];

    testCases.forEach(({ name, product, expectedTier1, expectedContains }) => {
      it(`should correctly map: ${name}`, async () => {
        const result = await mapper.mapProduct(product);

        expect(result.success).toBe(true);
        expect(result.iab_product).toBeDefined();
        expect(result.iab_product.primary).toMatch(/IAB-AP-\d+/);
        expect(result.iab_product.confidence).toBeGreaterThan(0.3);

        if (expectedTier1) {
          expect(result.iab_product.tier1Label || result.iab_product.label.split(' > ')[0])
            .toBe(expectedTier1);
        }

        if (expectedContains) {
          const label = result.iab_product.label;
          const matchFound = expectedContains.some(term => label.includes(term));
          expect(matchFound).toBe(true);
        }
      });
    });
  });

  describe('Sensitive Category Detection', () => {
    const sensitiveCases = [
      {
        name: 'Alcohol - Beer',
        product: { title: 'Budweiser Beer 6-Pack', description: 'American lager beer' },
        expectedTier1: 'Alcohol'
      },
      {
        name: 'Tobacco - Vaping',
        product: { title: 'JUUL Vape Device', description: 'Electronic vaporizer' },
        expectedTier1: 'Tobacco'
      },
      {
        name: 'Gambling - Sports Betting',
        product: { title: 'DraftKings Sportsbook', description: 'Online sports betting platform' },
        expectedTier1: 'Gambling'
      }
    ];

    sensitiveCases.forEach(({ name, product, expectedTier1 }) => {
      it(`should detect sensitive category: ${name}`, async () => {
        const result = await mapper.mapProduct(product);

        expect(result.success).toBe(true);
        expect(result.iab_product.tier1Label || result.iab_product.label.split(' > ')[0])
          .toBe(expectedTier1);
      });
    });
  });

  describe('Output Format Validation', () => {
    it('should return properly formatted IAB product result', async () => {
      const result = await mapper.mapProduct({
        title: 'iPhone 15 Pro',
        description: 'Apple smartphone with A17 chip'
      });

      expect(result.success).toBe(true);

      // Validate required fields
      expect(result.iab_product.primary).toBeDefined();
      expect(result.iab_product.primaryId).toBeDefined();
      expect(result.iab_product.label).toBeDefined();
      expect(result.iab_product.confidence).toBeDefined();
      expect(result.iab_product.version).toBe('2.0');

      // Validate format
      expect(result.iab_product.primary).toMatch(/^IAB-AP-\d+$/);
      expect(typeof result.iab_product.primaryId).toBe('number');
      expect(result.iab_product.confidence).toBeGreaterThanOrEqual(0);
      expect(result.iab_product.confidence).toBeLessThanOrEqual(1);
    });

    it('should include hierarchy information', async () => {
      const result = await mapper.mapProduct({
        title: 'Smartwatch GPS tracker',
        description: 'Fitness wearable device'
      });

      expect(result.success).toBe(true);

      // Should have tier 1 parent info
      if (result.iab_product.tier1) {
        expect(result.iab_product.tier1).toMatch(/^IAB-AP-\d+$/);
        expect(result.iab_product.tier1Id).toBeDefined();
        expect(result.iab_product.tier1Label).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should process products quickly', async () => {
      const product = {
        title: 'Test Product Smartphone',
        description: 'Test mobile phone device'
      };

      // First pass to warm the cache
      await mapper.mapProduct(product);
      mapper.resetStats();

      // Second pass - all should be cache hits
      const products = Array(100).fill(product);
      const start = Date.now();
      const results = await mapper.mapProducts(products);
      const elapsed = Date.now() - start;

      // Should process 100 products in under 1 second
      expect(elapsed).toBeLessThan(1000);
      expect(results.length).toBe(100);

      // All should be cache hits after warming
      const stats = mapper.getStats();
      expect(stats.cacheHits).toBe(100);
    });

    it('should have low latency per request', async () => {
      // Warm up cache
      await mapper.mapProduct({ title: 'Warm up smartphone' });
      mapper.resetStats();

      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        await mapper.mapProduct({
          title: `Product ${i} laptop computer`,
          description: 'Electronic device'
        });
      }

      const stats = mapper.getStats();
      const avgLatency = parseFloat(stats.avgLatencyMs);

      // Average should be under 10ms for deterministic mapping
      expect(avgLatency).toBeLessThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long product titles', async () => {
      const result = await mapper.mapProduct({
        title: 'Smartphone mobile phone device ' + 'A'.repeat(1000),
        description: 'Test mobile phone'
      });

      expect(result.success).toBe(true);
    });

    it('should handle special characters', async () => {
      const result = await mapper.mapProduct({
        title: 'iPhone 15 Pro™ - Apple®',
        description: 'Smartphone with 48MP camera & USB-C'
      });

      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const result = await mapper.mapProduct({
        title: '华为手机 Huawei Smartphone',
        description: 'Mobile phone with 5G'
      });

      expect(result.success).toBe(true);
    });

    it('should handle empty description', async () => {
      const result = await mapper.mapProduct({
        title: 'Apple iPhone smartphone mobile'
      });

      expect(result.success).toBe(true);
    });

    it('should return no match gracefully', async () => {
      const result = await mapper.mapProduct({
        title: 'xyz abc 123',
        description: 'nothing recognizable here'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
