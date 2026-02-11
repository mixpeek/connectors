/**
 * Unit Tests — BlobWatcher for @mixpeek/azure-blob
 */
import { createBlobWatcher, BlobWatcher } from '../../../src/modules/blobWatcher.js';

describe('BlobWatcher', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = createBlobWatcher(validConfig);
      expect(instance).toBeInstanceOf(BlobWatcher);
    });

    it('should throw without apiKey', () => {
      expect(() => createBlobWatcher({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = createBlobWatcher(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = createBlobWatcher({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = createBlobWatcher(validConfig); });
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
      const instance = createBlobWatcher(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = createBlobWatcher({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
