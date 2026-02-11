/**
 * E2E Tests — @mixpeek/kafka
 */
import { createKafkaConsumer } from '../../src/modules/kafkaConsumer.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { createCacheManager } from '../../src/cache/cacheManager.js';

describe('Kafka Connector E2E', () => {
  describe('Full Integration Flow', () => {
    let instance;

    beforeEach(() => {
      instance = createKafkaConsumer({
        apiKey: 'e2e-test-key',
        enableCache: true,
        timeout: 5000
      });

      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-e2e',
        status: 'ok',
        enrichments: { keywords: ['test'], categories: ['general'] }
      }));
    });

    afterEach(() => { instance.destroy(); });

    it('should initialize all components', () => {
      expect(instance.client).toBeDefined();
      expect(instance.cache).toBeDefined();
      expect(instance.logger).toBeDefined();
    });

    it('should track metrics across operations', () => {
      const metrics = instance.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.requests).toBe(0);
      expect(metrics.cache).toBeDefined();
    });

    it('should handle cache lifecycle', () => {
      const cache = createCacheManager({ ttl: 60 });
      cache.set('test-key', { data: 'value' });
      expect(cache.get('test-key')).toEqual({ data: 'value' });
      expect(cache.has('test-key')).toBe(true);
      cache.clear();
      expect(cache.get('test-key')).toBeNull();
      cache.destroy();
    });
  });

  describe('API Client Integration', () => {
    let client;

    beforeEach(() => {
      client = createClient({ apiKey: 'e2e-test-key' });
    });

    it('should perform health check', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));
      const health = await client.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const health = await client.healthCheck();
      expect(health.status).toBe('unhealthy');
    });

    it('should search with query', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        results: [{ id: '1', score: 0.95 }]
      }));
      const results = await client.search({ text: 'test' });
      expect(results.results).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout gracefully', async () => {
      const client = createClient({ apiKey: 'test', timeout: 10 });
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 5000)));
      const health = await client.healthCheck();
      expect(health.status).toBe('unhealthy');
    });
  });
});
