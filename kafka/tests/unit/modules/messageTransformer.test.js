/**
 * Unit Tests — MessageTransformer for @mixpeek/kafka
 */
import { createMessageTransformer, MessageTransformer } from '../../../src/modules/messageTransformer.js';

describe('MessageTransformer', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = createMessageTransformer(validConfig);
      expect(instance).toBeInstanceOf(MessageTransformer);
    });

    it('should throw without apiKey', () => {
      expect(() => createMessageTransformer({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = createMessageTransformer(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = createMessageTransformer({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = createMessageTransformer(validConfig); });
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
      const instance = createMessageTransformer(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = createMessageTransformer({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
