/**
 * Unit Tests - OpenRTB Enricher
 */

import { createEnricher, OpenRTBEnricher } from '../../../src/modules/openrtbEnricher.js';

describe('OpenRTBEnricher', () => {
  const validConfig = {
    apiKey: 'test-api-key',
    collectionId: 'col_123',
    namespace: 'ns_test'
  };

  describe('constructor', () => {
    it('should create enricher with valid config', () => {
      const enricher = createEnricher(validConfig);
      expect(enricher).toBeInstanceOf(OpenRTBEnricher);
    });

    it('should throw error without required config', () => {
      expect(() => createEnricher({})).toThrow('apiKey is required');
      expect(() => createEnricher({ apiKey: 'key' })).toThrow('collectionId is required');
      expect(() => createEnricher({ apiKey: 'key', collectionId: 'col' })).toThrow('namespace is required');
    });

    it('should use default config values', () => {
      const enricher = createEnricher(validConfig);
      expect(enricher.config.enableCache).toBe(true);
      expect(enricher.config.enableFallback).toBe(true);
      expect(enricher.config.timeout).toBe(200);
    });

    it('should allow config overrides', () => {
      const enricher = createEnricher({
        ...validConfig,
        timeout: 500,
        enableCache: false
      });
      expect(enricher.config.timeout).toBe(500);
      expect(enricher.config.enableCache).toBe(false);
    });
  });

  describe('enrich', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({ ...validConfig, enableCache: false });
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should enrich a site bid request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const result = await enricher.enrich(global.sampleBidRequest);

      expect(result.success).toBe(true);
      expect(result.enrichments).toBeDefined();
      expect(result.ortb2).toBeDefined();
      expect(result.ortb2.site.content).toBeDefined();
      expect(result.targeting).toBeDefined();
    });

    it('should enrich an app bid request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const result = await enricher.enrich(global.sampleAppBidRequest);

      expect(result.success).toBe(true);
      expect(result.extractedContent.isApp).toBe(true);
    });

    it('should enrich a video bid request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const result = await enricher.enrich(global.sampleVideoBidRequest);

      expect(result.success).toBe(true);
      expect(result.extractedContent.videos.length).toBeGreaterThan(0);
    });

    it('should return fallback response on error', async () => {
      // Reset mock and configure for rejection on all calls
      global.fetch.mockReset();
      global.fetch.mockRejectedValue(new Error('API Error'));

      const result = await enricher.enrich(global.sampleBidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.ortb2).toBeDefined(); // Fallback response

      // Reset mock after this test
      global.fetch.mockReset();
    });

    it('should use cache for repeated requests', async () => {
      const cachedEnricher = createEnricher({ ...validConfig, enableCache: true });

      global.fetch.mockReset();
      global.fetch.mockResolvedValue(createMockResponse(global.sampleApiResponse));

      // First request - should call API
      const result1 = await cachedEnricher.enrich(global.sampleBidRequest);
      expect(result1.cached).toBe(false);

      // Second request - should use cache
      const result2 = await cachedEnricher.enrich(global.sampleBidRequest);
      expect(result2.cached).toBe(true);

      // API should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);

      cachedEnricher.destroy();
    });

    it('should track latency', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const result = await enricher.enrich(global.sampleBidRequest);

      expect(result.latencyMs).toBeDefined();
      expect(typeof result.latencyMs).toBe('number');
    });
  });

  describe('enrichBidRequest', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({ ...validConfig, enableCache: false });
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should return enriched bid request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const enrichedRequest = await enricher.enrichBidRequest(global.sampleBidRequest);

      expect(enrichedRequest.site.content).toBeDefined();
      expect(enrichedRequest.site.content.cat).toBeDefined();
      expect(enrichedRequest.site.content.ext.mixpeek).toBeDefined();
      expect(enrichedRequest.ext.mixpeek.enriched).toBe(true);
    });

    it('should enrich impressions', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      const enrichedRequest = await enricher.enrichBidRequest(global.sampleBidRequest);

      expect(enrichedRequest.imp[0].ext.data.mixpeek).toBeDefined();
      expect(enrichedRequest.imp[0].ext.data.mixpeek.impId).toBe('imp-1');
    });
  });

  describe('healthCheck', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher(validConfig);
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should return health status', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));

      const health = await enricher.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.metrics).toBeDefined();
    });

    it('should include cache stats', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));

      const health = await enricher.healthCheck();

      expect(health.cache).toBeDefined();
      expect(health.cache.size).toBeDefined();
    });
  });

  describe('metrics', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({ ...validConfig, enableCache: false });
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should track request count', async () => {
      global.fetch.mockResolvedValue(createMockResponse(global.sampleApiResponse));

      await enricher.enrich(global.sampleBidRequest);
      await enricher.enrich(global.sampleBidRequest);

      const metrics = enricher.getMetrics();
      expect(metrics.requests).toBe(2);
    });

    it('should track errors', async () => {
      const noFallbackEnricher = createEnricher({
        ...validConfig,
        enableCache: false,
        enableFallback: false
      });

      // Reset and mock both initial and retry attempts
      global.fetch.mockReset();
      global.fetch.mockRejectedValue(new Error('API Error'));

      try {
        await noFallbackEnricher.enrich(global.sampleBidRequest);
      } catch (e) {
        // Expected
      }

      const metrics = noFallbackEnricher.getMetrics();
      expect(metrics.errors).toBe(1);

      noFallbackEnricher.destroy();
      // Reset mock after this test
      global.fetch.mockReset();
    });

    it('should calculate average latency', async () => {
      global.fetch.mockResolvedValue(createMockResponse(global.sampleApiResponse));

      await enricher.enrich(global.sampleBidRequest);
      await enricher.enrich(global.sampleBidRequest);

      const metrics = enricher.getMetrics();
      expect(metrics.avgLatencyMs).toBeGreaterThan(0);
    });

    it('should reset metrics', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      await enricher.enrich(global.sampleBidRequest);
      enricher.resetMetrics();

      const metrics = enricher.getMetrics();
      expect(metrics.requests).toBe(0);
    });
  });

  describe('cache management', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher(validConfig);
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should return cache stats', () => {
      const stats = enricher.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats.size).toBe(0);
    });

    it('should clear cache', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse(global.sampleApiResponse));

      await enricher.enrich(global.sampleBidRequest);
      expect(enricher.getCacheStats().size).toBe(1);

      enricher.clearCache();
      expect(enricher.getCacheStats().size).toBe(0);
    });
  });
});
