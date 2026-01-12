/**
 * Integration Tests - OpenRTB Enricher
 *
 * Tests the full enrichment flow with mocked API responses.
 */

import { createEnricher } from '../../src/modules/openrtbEnricher.js';
import { extractFromBidRequest } from '../../src/extractors/contentExtractor.js';
import { formatSiteContent, formatTargetingKeys } from '../../src/formatters/ortbFormatter.js';

describe('OpenRTB Enricher Integration', () => {
  const config = {
    apiKey: 'test-api-key',
    collectionId: 'col_integration',
    namespace: 'ns_integration',
    enableCache: true,
    cacheTTL: 60
  };

  let enricher;

  beforeEach(() => {
    enricher = createEnricher(config);
  });

  afterEach(() => {
    enricher.destroy();
  });

  describe('Full Enrichment Flow', () => {
    it('should enrich a standard site bid request end-to-end', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-integration-1',
        document_id: 'doc-integration-1',
        keywords: ['technology', 'news', 'gadgets', 'reviews'],
        sentiment: { sentiment: 'positive', score: 0.75 },
        categories: {
          category: 'IAB19',
          categoryName: 'Technology & Computing',
          confidence: 0.9
        },
        embeddings: { id: 'emb-int-1' }
      }));

      const bidRequest = {
        id: 'integration-test-1',
        imp: [
          { id: 'imp-int-1', banner: { w: 300, h: 250 } },
          { id: 'imp-int-2', banner: { w: 728, h: 90 } }
        ],
        site: {
          id: 'site-int',
          name: 'Tech News Daily',
          domain: 'technews.example.com',
          page: 'https://technews.example.com/reviews/smartphone-2024',
          keywords: 'smartphone,review,tech',
          cat: ['IAB19'],
          publisher: { id: 'pub-int', name: 'Tech Media Inc' },
          content: {
            title: 'Best Smartphones of 2024 - Complete Review',
            keywords: 'smartphone,mobile,android,ios'
          }
        },
        device: { ua: 'Mozilla/5.0', ip: '10.0.0.1' },
        user: { id: 'user-int' }
      };

      const result = await enricher.enrich(bidRequest);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.cached).toBe(false);
      expect(result.latencyMs).toBeDefined();

      // Verify enrichments
      expect(result.enrichments.keywords).toContain('technology');
      expect(result.enrichments.sentiment.sentiment).toBe('positive');
      expect(result.enrichments.categories.category).toBe('IAB19');

      // Verify OpenRTB format
      expect(result.ortb2.site.content.cat).toBeDefined();
      expect(result.ortb2.site.content.keywords).toBeDefined();
      expect(result.ortb2.site.content.ext.mixpeek).toBeDefined();
      expect(result.ortb2.site.content.ext.mixpeek.sentiment).toBe('positive');

      // Verify targeting keys
      expect(result.targeting.mixpeek_cat).toBe('IAB19');
      expect(result.targeting.mixpeek_sentiment).toBe('positive');
    });

    it('should handle video content enrichment', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-video-1',
        keywords: ['documentary', 'technology', 'innovation'],
        sentiment: { sentiment: 'neutral', score: 0.1 }
      }));

      const videoRequest = {
        id: 'video-test-1',
        imp: [{
          id: 'video-imp-1',
          video: {
            mimes: ['video/mp4'],
            minduration: 15,
            maxduration: 60,
            protocols: [2, 3, 5, 6],
            w: 1920,
            h: 1080,
            linearity: 1,
            placement: 1
          }
        }],
        site: {
          domain: 'videos.example.com',
          page: 'https://videos.example.com/watch/tech-doc-123',
          content: {
            title: 'The Future of Technology',
            series: 'Tech Documentary Series',
            season: '1',
            episode: '5',
            len: 3600,
            livestream: 0
          }
        }
      };

      const result = await enricher.enrich(videoRequest);

      expect(result.success).toBe(true);
      expect(result.extractedContent.videos.length).toBe(1);
      expect(result.extractedContent.contentType).toBe('video');
      expect(result.extractedContent.content.series).toBe('Tech Documentary Series');
    });

    it('should handle app bid requests', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-app-1',
        keywords: ['news', 'breaking', 'politics'],
        sentiment: { sentiment: 'neutral', score: 0 }
      }));

      const appRequest = {
        id: 'app-test-1',
        imp: [{ id: 'app-imp-1', banner: { w: 320, h: 50 } }],
        app: {
          id: 'app-news-123',
          name: 'Breaking News App',
          bundle: 'com.example.newsapp',
          storeurl: 'https://play.google.com/store/apps/details?id=com.example.newsapp',
          cat: ['IAB12'],
          publisher: { id: 'app-pub-1', name: 'News Corp' },
          content: {
            title: 'Latest Breaking News',
            keywords: 'breaking,news,world'
          }
        },
        device: { ua: 'Dalvik/2.1.0', ifa: 'device-123' }
      };

      const result = await enricher.enrich(appRequest);

      expect(result.success).toBe(true);
      expect(result.extractedContent.isApp).toBe(true);
      expect(result.extractedContent.app.bundle).toBe('com.example.newsapp');
    });
  });

  describe('Caching Behavior', () => {
    it('should cache and reuse enrichments', async () => {
      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-cache-1',
        keywords: ['cached', 'content'],
        sentiment: { sentiment: 'positive', score: 0.5 }
      }));

      const bidRequest = {
        id: 'cache-test',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'cache.example.com',
          page: 'https://cache.example.com/article/1',
          content: { title: 'Cached Article' }
        }
      };

      // First request
      const result1 = await enricher.enrich(bidRequest);
      expect(result1.cached).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const result2 = await enricher.enrich(bidRequest);
      expect(result2.cached).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional API call

      // Verify cache stats
      const stats = enricher.getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should clear cache on demand', async () => {
      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-clear-1',
        keywords: ['test']
      }));

      const bidRequest = {
        id: 'clear-test',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: { domain: 'test.com', content: { title: 'Test' } }
      };

      await enricher.enrich(bidRequest);
      expect(enricher.getCacheStats().size).toBe(1);

      enricher.clearCache();
      expect(enricher.getCacheStats().size).toBe(0);

      // Next request should hit API again
      await enricher.enrich(bidRequest);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling & Fallback', () => {
    it('should gracefully fallback on API error', async () => {
      // Create a fresh enricher with caching disabled for this test
      enricher.destroy();
      enricher = createEnricher({ ...config, enableCache: false });

      // Reset and mock both initial and retry attempts to fail
      global.fetch.mockReset();
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      const bidRequest = {
        id: 'error-test-unique-' + Date.now(),
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'error-unique.example.com',
          page: 'https://error-unique.example.com/article/' + Date.now(),
          content: {
            title: 'Unique Error Test Article',
            keywords: 'error,test,unique'
          }
        }
      };

      const result = await enricher.enrich(bidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.ortb2).toBeDefined(); // Fallback response provided
      expect(result.ortb2.site.content.ext.mixpeek.source).toBe('fallback');
    });

    it('should track fallback metrics', async () => {
      global.fetch.mockRejectedValue(new Error('API down'));

      await enricher.enrich(global.sampleBidRequest);
      await enricher.enrich(global.sampleVideoBidRequest);

      const metrics = enricher.getMetrics();
      expect(metrics.fallbacks).toBe(2);
    });
  });

  describe('Bid Request Enrichment', () => {
    it('should enrich bid request in-place', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-enrich-1',
        keywords: ['enriched', 'content'],
        sentiment: { sentiment: 'positive', score: 0.8 }
      }));

      const original = JSON.parse(JSON.stringify(global.sampleBidRequest));
      const enriched = await enricher.enrichBidRequest(global.sampleBidRequest);

      // Original should not be modified
      expect(global.sampleBidRequest).toEqual(original);

      // Enriched should have Mixpeek data
      expect(enriched.site.content.ext.mixpeek).toBeDefined();
      expect(enriched.ext.mixpeek.enriched).toBe(true);

      // All impressions should be enriched
      for (const imp of enriched.imp) {
        expect(imp.ext.data.mixpeek).toBeDefined();
        expect(imp.ext.data.mixpeek.impId).toBe(imp.id);
      }
    });
  });

  describe('Content Extraction Integration', () => {
    it('should extract and pass all relevant content', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-extract-1',
        keywords: ['extracted']
      }));

      const complexRequest = {
        id: 'complex-1',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          id: 'site-complex',
          name: 'Complex Site',
          domain: 'complex.example.com',
          page: 'https://complex.example.com/category/tech/article/ai-trends',
          ref: 'https://google.com/search?q=ai',
          keywords: 'ai,machine learning,tech',
          cat: ['IAB19', 'IAB19-18'],
          sectioncat: ['IAB19-18'],
          pagecat: ['IAB19'],
          publisher: {
            id: 'pub-complex',
            name: 'Complex Publisher',
            domain: 'complex-media.com',
            cat: ['IAB19']
          },
          content: {
            id: 'content-123',
            title: 'AI Trends in 2024',
            series: 'Tech Trends',
            season: '2024',
            episode: '1',
            keywords: 'artificial intelligence,trends,future',
            language: 'en',
            data: [
              {
                name: 'custom-data',
                segment: [
                  { value: 'premium' },
                  { value: 'tech-enthusiast' }
                ]
              }
            ]
          }
        }
      };

      const result = await enricher.enrich(complexRequest);

      expect(result.extractedContent.url).toBe('https://complex.example.com/category/tech/article/ai-trends');
      expect(result.extractedContent.ref).toBe('https://google.com/search?q=ai');
      expect(result.extractedContent.categories).toContain('IAB19');
      expect(result.extractedContent.keywords).toContain('ai');
      expect(result.extractedContent.keywords).toContain('premium');
      expect(result.extractedContent.content.series).toBe('Tech Trends');
    });
  });
});
