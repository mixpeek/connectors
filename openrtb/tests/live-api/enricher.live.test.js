/**
 * Live API Tests - OpenRTB Enricher
 *
 * Tests against the real Mixpeek API to verify end-to-end functionality.
 *
 * Run with: npm run test:live
 *
 * Required environment variables:
 * - MIXPEEK_API_KEY
 * - MIXPEEK_COLLECTION_ID
 * - MIXPEEK_NAMESPACE
 */

import { createEnricher } from '../../src/modules/openrtbEnricher.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { liveTestConfig, skipIfNotConfigured } from './setup.js';

describe('Live API Tests - OpenRTB Enricher', () => {
  // Skip all tests if not configured
  const skipTests = skipIfNotConfigured();

  describe('API Health Check', () => {
    it('should verify API connectivity', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const client = createClient({
        apiKey: liveTestConfig.apiKey,
        collectionId: liveTestConfig.collectionId,
        namespace: liveTestConfig.namespace,
        endpoint: liveTestConfig.endpoint
      });

      const health = await client.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.latency).toBeDefined();
      expect(health.latency).toBeLessThan(5000); // Should respond within 5s

      console.log(`API Health: ${health.status}, Latency: ${health.latency}ms`);
    });
  });

  describe('Content Processing', () => {
    let enricher;

    beforeAll(() => {
      if (skipTests) return;

      enricher = createEnricher({
        apiKey: liveTestConfig.apiKey,
        collectionId: liveTestConfig.collectionId,
        namespace: liveTestConfig.namespace,
        endpoint: liveTestConfig.endpoint,
        enableCache: true,
        timeout: 5000 // Generous timeout for live tests
      });
    });

    afterAll(() => {
      if (enricher) {
        enricher.destroy();
      }
    });

    it('should enrich a technology news article', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const techBidRequest = {
        id: 'live-test-tech-001',
        imp: [{ id: 'imp-tech-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'technews.example.com',
          page: 'https://technews.example.com/article/ai-breakthrough',
          cat: ['IAB19'],
          content: {
            title: 'Revolutionary AI System Achieves Human-Level Performance',
            keywords: 'artificial intelligence,machine learning,neural networks,technology,research'
          }
        }
      };

      const result = await enricher.enrich(techBidRequest);

      console.log('Tech Article Result:', {
        success: result.success,
        latency: result.latencyMs,
        keywords: result.enrichments?.keywords?.slice(0, 5),
        sentiment: result.enrichments?.sentiment,
        category: result.enrichments?.categories
      });

      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeDefined();
      expect(result.enrichments).toBeDefined();
      expect(result.enrichments.keywords).toBeDefined();
      expect(result.enrichments.keywords.length).toBeGreaterThan(0);
      expect(result.ortb2.site.content).toBeDefined();
    });

    it('should enrich a sports article', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const sportsBidRequest = {
        id: 'live-test-sports-001',
        imp: [{ id: 'imp-sports-1', banner: { w: 728, h: 90 } }],
        site: {
          domain: 'sportsnetwork.example.com',
          page: 'https://sportsnetwork.example.com/nfl/game-recap',
          cat: ['IAB17'],
          content: {
            title: 'Chiefs Defeat Eagles in Thrilling Overtime Victory',
            keywords: 'nfl,football,chiefs,eagles,touchdown,overtime,sports'
          }
        }
      };

      const result = await enricher.enrich(sportsBidRequest);

      console.log('Sports Article Result:', {
        success: result.success,
        latency: result.latencyMs,
        keywords: result.enrichments?.keywords?.slice(0, 5),
        sentiment: result.enrichments?.sentiment
      });

      expect(result.success).toBe(true);
      expect(result.enrichments.keywords).toBeDefined();
    });

    it('should enrich a finance article', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const financeBidRequest = {
        id: 'live-test-finance-001',
        imp: [{ id: 'imp-finance-1', banner: { w: 300, h: 600 } }],
        site: {
          domain: 'financenews.example.com',
          page: 'https://financenews.example.com/markets/stock-analysis',
          cat: ['IAB13'],
          content: {
            title: 'Federal Reserve Signals Interest Rate Decision Amid Market Volatility',
            keywords: 'federal reserve,interest rates,stock market,investment,economy,finance'
          }
        }
      };

      const result = await enricher.enrich(financeBidRequest);

      console.log('Finance Article Result:', {
        success: result.success,
        latency: result.latencyMs,
        keywords: result.enrichments?.keywords?.slice(0, 5),
        sentiment: result.enrichments?.sentiment
      });

      expect(result.success).toBe(true);
    });

    it('should utilize cache for repeated requests', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const bidRequest = {
        id: 'live-test-cache-001',
        imp: [{ id: 'imp-cache-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'cache-test.example.com',
          page: 'https://cache-test.example.com/article/cached-content',
          content: {
            title: 'Test Article for Cache Verification',
            keywords: 'cache,test,verification'
          }
        }
      };

      // First request - should hit API
      const result1 = await enricher.enrich(bidRequest);
      expect(result1.cached).toBe(false);

      // Second request - should use cache
      const result2 = await enricher.enrich(bidRequest);
      expect(result2.cached).toBe(true);
      expect(result2.latencyMs).toBeLessThan(result1.latencyMs);

      console.log('Cache Test:', {
        firstLatency: result1.latencyMs,
        secondLatency: result2.latencyMs,
        cacheStats: enricher.getCacheStats()
      });
    });
  });

  describe('Full Bid Request Enrichment', () => {
    let enricher;

    beforeAll(() => {
      if (skipTests) return;

      enricher = createEnricher({
        apiKey: liveTestConfig.apiKey,
        collectionId: liveTestConfig.collectionId,
        namespace: liveTestConfig.namespace,
        endpoint: liveTestConfig.endpoint,
        timeout: 5000
      });
    });

    afterAll(() => {
      if (enricher) {
        enricher.destroy();
      }
    });

    it('should produce valid enriched OpenRTB bid request', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const originalRequest = {
        id: 'live-full-test-001',
        at: 1,
        tmax: 150,
        cur: ['USD'],
        imp: [
          {
            id: 'imp-1',
            banner: { w: 300, h: 250 },
            bidfloor: 1.5
          },
          {
            id: 'imp-2',
            banner: { w: 728, h: 90 },
            bidfloor: 2.0
          }
        ],
        site: {
          id: 'live-site-001',
          name: 'Live Test Publisher',
          domain: 'livetest.example.com',
          page: 'https://livetest.example.com/article/comprehensive-test',
          keywords: 'test,comprehensive,live,api',
          cat: ['IAB19'],
          publisher: {
            id: 'live-pub-001',
            name: 'Live Test Media'
          },
          content: {
            title: 'Comprehensive Live API Test Article for OpenRTB Enrichment',
            keywords: 'technology,software,programming,development,api'
          }
        },
        device: {
          ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ip: '203.0.113.100'
        },
        user: {
          id: 'live-user-001'
        }
      };

      const enrichedRequest = await enricher.enrichBidRequest(originalRequest);

      // Verify enrichment structure
      expect(enrichedRequest.site.content).toBeDefined();
      expect(enrichedRequest.site.content.cat).toBeInstanceOf(Array);
      expect(enrichedRequest.site.content.keywords).toBeDefined();
      expect(enrichedRequest.site.content.ext.mixpeek).toBeDefined();

      // Verify Mixpeek extension
      const mixpeek = enrichedRequest.site.content.ext.mixpeek;
      expect(mixpeek.sentiment).toBeDefined();
      expect(mixpeek.brandSafety).toBeDefined();
      expect(mixpeek.version).toBe('1.0.0');

      // Verify impression enrichment
      for (const imp of enrichedRequest.imp) {
        expect(imp.ext.data.mixpeek).toBeDefined();
        expect(imp.ext.data.mixpeek.impId).toBe(imp.id);
      }

      // Verify request-level extension
      expect(enrichedRequest.ext.mixpeek.enriched).toBe(true);

      console.log('Full Enrichment Result:', {
        categories: enrichedRequest.site.content.cat,
        keywords: enrichedRequest.site.content.keywords,
        sentiment: mixpeek.sentiment,
        brandSafety: mixpeek.brandSafety,
        impCount: enrichedRequest.imp.length
      });
    });
  });

  describe('Error Handling & Fallback', () => {
    it('should handle invalid API key gracefully', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const badEnricher = createEnricher({
        apiKey: 'invalid-api-key-12345',
        collectionId: liveTestConfig.collectionId,
        namespace: liveTestConfig.namespace,
        endpoint: liveTestConfig.endpoint,
        enableFallback: true,
        timeout: 5000
      });

      const result = await badEnricher.enrich({
        id: 'error-test',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'test.com',
          content: { title: 'Error Test' }
        }
      });

      // Should fallback, not throw
      expect(result.success).toBe(false);
      expect(result.ortb2).toBeDefined(); // Fallback provided

      console.log('Error Handling Result:', {
        success: result.success,
        error: result.error,
        hasFallback: !!result.ortb2
      });

      badEnricher.destroy();
    });
  });

  describe('Performance Metrics', () => {
    it('should track and report metrics accurately', async () => {
      if (skipTests) {
        console.log('Skipping - API not configured');
        return;
      }

      const enricher = createEnricher({
        apiKey: liveTestConfig.apiKey,
        collectionId: liveTestConfig.collectionId,
        namespace: liveTestConfig.namespace,
        endpoint: liveTestConfig.endpoint,
        enableCache: false, // Disable cache to see all API calls
        timeout: 5000
      });

      // Make several requests
      const requests = [
        { id: 'metrics-1', imp: [{ id: 'i1' }], site: { domain: 'a.com', content: { title: 'Test A' } } },
        { id: 'metrics-2', imp: [{ id: 'i2' }], site: { domain: 'b.com', content: { title: 'Test B' } } },
        { id: 'metrics-3', imp: [{ id: 'i3' }], site: { domain: 'c.com', content: { title: 'Test C' } } }
      ];

      for (const req of requests) {
        await enricher.enrich(req);
      }

      const metrics = enricher.getMetrics();

      expect(metrics.requests).toBe(3);
      expect(metrics.apiCalls).toBe(3);
      expect(metrics.avgLatencyMs).toBeGreaterThan(0);

      console.log('Performance Metrics:', metrics);

      enricher.destroy();
    });
  });
});
