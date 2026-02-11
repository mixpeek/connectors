/**
 * Unit Tests — ShopifyAdmin for @mixpeek/shopify
 */
import { createShopifyAdmin, ShopifyAdmin } from '../../../src/modules/shopifyAdmin.js';

describe('ShopifyAdmin', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = createShopifyAdmin(validConfig);
      expect(instance).toBeInstanceOf(ShopifyAdmin);
    });

    it('should throw without apiKey', () => {
      expect(() => createShopifyAdmin({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = createShopifyAdmin(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = createShopifyAdmin({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = createShopifyAdmin(validConfig); });
    afterEach(() => { instance.destroy(); });

    it('should return initial metrics', () => {
      const metrics = instance.getMetrics();
      expect(metrics.requests).toBe(0);
      expect(metrics.errors).toBe(0);
    });

    it('should reset metrics', () => {
      instance.metrics.requests = 5;
      instance.resetMetrics();
      expect(instance.getMetrics().requests).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('should destroy cleanly', () => {
      const instance = createShopifyAdmin(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = createShopifyAdmin({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
