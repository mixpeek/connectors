/**
 * Unit Tests — AnnotationProvider for @mixpeek/grafana
 */
import { createAnnotationProvider, AnnotationProvider } from '../../../src/modules/annotationProvider.js';

describe('AnnotationProvider', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = createAnnotationProvider(validConfig);
      expect(instance).toBeInstanceOf(AnnotationProvider);
    });

    it('should throw without apiKey', () => {
      expect(() => createAnnotationProvider({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = createAnnotationProvider(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = createAnnotationProvider({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = createAnnotationProvider(validConfig); });
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
      const instance = createAnnotationProvider(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = createAnnotationProvider({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
