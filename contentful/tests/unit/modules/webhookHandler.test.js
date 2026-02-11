/**
 * Unit Tests — WebhookHandler for @mixpeek/contentful
 */
import { createWebhookHandler, WebhookHandler } from '../../../src/modules/webhookHandler.js';

describe('WebhookHandler', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = createWebhookHandler(validConfig);
      expect(instance).toBeInstanceOf(WebhookHandler);
    });

    it('should throw without apiKey', () => {
      expect(() => createWebhookHandler({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = createWebhookHandler(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = createWebhookHandler({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = createWebhookHandler(validConfig); });
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
      const instance = createWebhookHandler(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = createWebhookHandler({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
