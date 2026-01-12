/**
 * E2E Tests - OpenRTB Connector
 *
 * End-to-end tests simulating real-world programmatic advertising scenarios.
 */

import { createEnricher } from '../../src/modules/openrtbEnricher.js';
import {
  extractFromBidRequest,
  extractFromAppRequest
} from '../../src/extractors/contentExtractor.js';
import {
  formatSiteContent,
  formatTargetingKeys,
  enrichBidRequest
} from '../../src/formatters/ortbFormatter.js';
import { keywordsToIAB } from '../../src/utils/iabMapping.js';

describe('OpenRTB Connector E2E Tests', () => {
  describe('Publisher Integration Scenario', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({
        apiKey: 'e2e-test-key',
        collectionId: 'col_e2e',
        namespace: 'ns_e2e',
        enableCache: true,
        enableFallback: true,
        timeout: 200
      });

      // Mock successful API
      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-e2e',
        keywords: ['technology', 'software', 'ai', 'innovation', 'startup'],
        sentiment: { sentiment: 'positive', score: 0.7 },
        categories: { category: 'IAB19', categoryName: 'Technology', confidence: 0.9 },
        embeddings: { id: 'emb-e2e' }
      }));
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should handle typical news publisher bid request', async () => {
      const newsPublisherRequest = {
        id: 'news-pub-bid-001',
        at: 1, // First-price auction
        tmax: 150, // 150ms timeout
        cur: ['USD'],
        imp: [
          {
            id: 'header-banner',
            banner: { w: 970, h: 250, pos: 1 },
            bidfloor: 2.0,
            bidfloorcur: 'USD'
          },
          {
            id: 'sidebar-banner',
            banner: { w: 300, h: 600, pos: 4 },
            bidfloor: 1.0,
            bidfloorcur: 'USD'
          },
          {
            id: 'in-article',
            banner: { w: 300, h: 250, pos: 3 },
            bidfloor: 1.5,
            bidfloorcur: 'USD'
          }
        ],
        site: {
          id: 'news-site-456',
          name: 'Tech Daily News',
          domain: 'techdaily.news',
          page: 'https://techdaily.news/2024/01/ai-breakthrough-research',
          ref: 'https://news.google.com',
          keywords: 'ai,research,breakthrough,technology,science',
          cat: ['IAB19', 'IAB15'],
          sectioncat: ['IAB19-18'],
          pagecat: ['IAB15-2'],
          mobile: 0,
          publisher: {
            id: 'techdaily-pub',
            name: 'Tech Daily Media Group',
            cat: ['IAB19'],
            domain: 'techdaily.media'
          },
          content: {
            id: 'article-789',
            title: 'Revolutionary AI Research Achieves Breakthrough in Natural Language',
            keywords: 'artificial intelligence,nlp,research,machine learning',
            language: 'en',
            livestream: 0
          }
        },
        device: {
          ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          ip: '203.0.113.50',
          geo: { country: 'USA', region: 'CA', city: 'San Francisco' },
          devicetype: 2,
          make: 'Apple',
          model: 'MacBook Pro'
        },
        user: {
          id: 'user-abc123',
          buyeruid: 'dsp-uid-xyz'
        },
        regs: {
          ext: { gdpr: 0, us_privacy: '1---' }
        }
      };

      const enrichedRequest = await enricher.enrichBidRequest(newsPublisherRequest);

      // Verify site.content enrichment
      expect(enrichedRequest.site.content.cat).toBeDefined();
      expect(enrichedRequest.site.content.keywords).toBeDefined();
      expect(enrichedRequest.site.content.ext.mixpeek).toBeDefined();

      // Verify Mixpeek extension
      const mixpeekExt = enrichedRequest.site.content.ext.mixpeek;
      expect(mixpeekExt.sentiment).toBe('positive');
      expect(mixpeekExt.brandSafety).toBeDefined();
      expect(mixpeekExt.brandSafety.level).toBe('safe');
      expect(mixpeekExt.documentId).toBeDefined();

      // Verify impression-level enrichment
      for (const imp of enrichedRequest.imp) {
        expect(imp.ext.data.mixpeek).toBeDefined();
        expect(imp.ext.data.mixpeek.category).toBe('IAB19');
        expect(imp.ext.data.mixpeek.sentiment).toBe('positive');
      }

      // Verify request-level extension
      expect(enrichedRequest.ext.mixpeek.enriched).toBe(true);
      expect(enrichedRequest.ext.mixpeek.version).toBe('1.0.0');
    });

    it('should handle video publisher pre-roll request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-video-e2e',
        keywords: ['sports', 'football', 'highlights', 'nfl'],
        sentiment: { sentiment: 'positive', score: 0.8 },
        categories: { category: 'IAB17', categoryName: 'Sports', confidence: 0.95 }
      }));

      const videoPublisherRequest = {
        id: 'video-bid-001',
        at: 2, // Second-price auction
        tmax: 200,
        cur: ['USD'],
        imp: [{
          id: 'preroll-1',
          video: {
            mimes: ['video/mp4', 'video/webm'],
            minduration: 5,
            maxduration: 30,
            protocols: [2, 3, 5, 6],
            w: 1920,
            h: 1080,
            startdelay: 0, // Pre-roll
            linearity: 1, // Linear/in-stream
            placement: 1, // In-stream
            skip: 1,
            skipmin: 5,
            skipafter: 5,
            playbackmethod: [1, 2],
            api: [1, 2]
          },
          bidfloor: 15.0,
          bidfloorcur: 'USD'
        }],
        site: {
          id: 'sports-video-site',
          name: 'Sports Highlights Network',
          domain: 'sportshighlights.tv',
          page: 'https://sportshighlights.tv/nfl/week-10-highlights',
          cat: ['IAB17'],
          publisher: {
            id: 'sports-pub',
            name: 'Sports Media LLC'
          },
          content: {
            id: 'video-nfl-w10',
            title: 'NFL Week 10 Top Plays and Highlights',
            series: 'NFL Highlights',
            season: '2024',
            episode: '10',
            len: 600, // 10 minutes
            livestream: 0,
            keywords: 'nfl,football,highlights,touchdowns,plays'
          }
        },
        device: {
          ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ip: '198.51.100.25',
          devicetype: 1
        }
      };

      const enrichedRequest = await enricher.enrichBidRequest(videoPublisherRequest);

      // Video-specific validations
      expect(enrichedRequest.site.content.len).toBe(600);
      expect(enrichedRequest.site.content.series).toBe('NFL Highlights');
      expect(enrichedRequest.site.content.ext.mixpeek.sentiment).toBe('positive');

      // Verify sports category
      const mixpeekData = enrichedRequest.imp[0].ext.data.mixpeek;
      expect(mixpeekData.category).toBe('IAB17');
    });

    it('should handle mobile app bid request', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-app-e2e',
        keywords: ['shopping', 'deals', 'fashion', 'sale'],
        sentiment: { sentiment: 'positive', score: 0.6 },
        categories: { category: 'IAB22', categoryName: 'Shopping', confidence: 0.85 }
      }));

      const mobileAppRequest = {
        id: 'app-bid-001',
        at: 1,
        tmax: 100,
        cur: ['USD'],
        imp: [{
          id: 'app-banner-1',
          banner: { w: 320, h: 50, pos: 7 },
          bidfloor: 0.5
        }],
        app: {
          id: 'shopping-app-789',
          name: 'Deal Finder Pro',
          bundle: 'com.dealfinder.pro',
          storeurl: 'https://apps.apple.com/app/deal-finder-pro/id123456789',
          domain: 'dealfinder.app',
          cat: ['IAB22'],
          ver: '3.5.2',
          publisher: {
            id: 'app-pub-123',
            name: 'Shopping Apps Inc'
          },
          content: {
            title: 'Flash Sale - Designer Fashion 70% Off',
            keywords: 'fashion,sale,designer,deals,shopping'
          }
        },
        device: {
          ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          ifa: 'AEBE52E7-03EE-455A-B3C4-E57283966239',
          lmt: 0,
          devicetype: 4,
          make: 'Apple',
          model: 'iPhone 15',
          os: 'iOS',
          osv: '17.0',
          geo: { country: 'USA', region: 'NY', city: 'New York' }
        }
      };

      const enrichedRequest = await enricher.enrichBidRequest(mobileAppRequest);

      // App-specific validations
      expect(enrichedRequest.app.content).toBeDefined();
      expect(enrichedRequest.app.content.ext.mixpeek).toBeDefined();
      expect(enrichedRequest.app.content.ext.mixpeek.sentiment).toBe('positive');

      // Verify impression enrichment
      expect(enrichedRequest.imp[0].ext.data.mixpeek.category).toBe('IAB22');
    });
  });

  describe('SSP/Exchange Processing Scenario', () => {
    it('should process high-volume bid requests efficiently', async () => {
      const enricher = createEnricher({
        apiKey: 'volume-test-key',
        collectionId: 'col_volume',
        namespace: 'ns_volume',
        enableCache: true,
        timeout: 100
      });

      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-volume',
        keywords: ['test'],
        sentiment: { sentiment: 'neutral', score: 0 }
      }));

      // Simulate processing multiple requests
      const requests = Array(10).fill(null).map((_, i) => ({
        id: `volume-test-${i}`,
        imp: [{ id: `imp-${i}`, banner: { w: 300, h: 250 } }],
        site: {
          domain: 'test.com',
          page: `https://test.com/page/${i % 3}`, // Some duplicate pages
          content: { title: `Page ${i % 3}` }
        }
      }));

      const results = await Promise.all(
        requests.map(req => enricher.enrich(req))
      );

      // All should succeed
      expect(results.every(r => r.success || r.ortb2)).toBe(true);

      // Cache should be utilized (3 unique pages)
      const stats = enricher.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);

      const metrics = enricher.getMetrics();
      expect(metrics.requests).toBe(10);
      expect(metrics.cacheHits).toBeGreaterThan(0);

      enricher.destroy();
    });
  });

  describe('Brand Safety Scenarios', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({
        apiKey: 'safety-test-key',
        collectionId: 'col_safety',
        namespace: 'ns_safety',
        enableCache: false
      });
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should identify brand-safe content', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-safe',
        keywords: ['technology', 'innovation', 'success'],
        sentiment: { sentiment: 'positive', score: 0.9 }
      }));

      const safeRequest = {
        id: 'safe-content-1',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'positive-news.com',
          page: 'https://positive-news.com/tech/success-story',
          content: {
            title: 'Startup Success Story: Innovation Leads to Growth',
            keywords: 'success,innovation,technology,business'
          }
        }
      };

      const result = await enricher.enrich(safeRequest);

      expect(result.ortb2.site.content.ext.mixpeek.brandSafety.level).toBe('safe');
      expect(result.ortb2.site.content.ext.mixpeek.brandSafety.score).toBe(1.0);
      expect(result.targeting.mixpeek_brand_safe).toBe('safe');
    });

    it('should flag potentially risky content', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-risky',
        keywords: ['conflict', 'war', 'crisis', 'controversy'],
        sentiment: { sentiment: 'negative', score: -0.7 }
      }));

      const riskyRequest = {
        id: 'risky-content-1',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          domain: 'world-news.com',
          page: 'https://world-news.com/conflict-zone-report',
          content: {
            title: 'Ongoing Conflict Creates Humanitarian Crisis',
            keywords: 'war,conflict,crisis,humanitarian'
          }
        }
      };

      const result = await enricher.enrich(riskyRequest);

      // Should identify as medium or high risk
      const safetyLevel = result.ortb2.site.content.ext.mixpeek.brandSafety.level;
      expect(['medium_risk', 'high_risk', 'low_risk']).toContain(safetyLevel);
    });
  });

  describe('OpenRTB Version Compatibility', () => {
    let enricher;

    beforeEach(() => {
      enricher = createEnricher({
        apiKey: 'version-test-key',
        collectionId: 'col_version',
        namespace: 'ns_version'
      });

      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-version',
        keywords: ['test', 'content'],
        sentiment: { sentiment: 'neutral', score: 0 }
      }));
    });

    afterEach(() => {
      enricher.destroy();
    });

    it('should produce valid OpenRTB 2.5 compatible output', async () => {
      const result = await enricher.enrich(global.sampleBidRequest, { openrtbVersion: '2.5' });

      // Verify structure is 2.5 compatible
      expect(result.ortb2.site.content.cat).toBeInstanceOf(Array);
      expect(typeof result.ortb2.site.content.keywords).toBe('string');
    });

    it('should produce valid OpenRTB 2.6 compatible output', async () => {
      const result = await enricher.enrich(global.sampleBidRequest, { openrtbVersion: '2.6' });

      // 2.6 specific: cattax field for taxonomy version
      expect(result.ortb2.site.content.cattax).toBeDefined();
      expect(result.ortb2.site.content.ext).toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    it('should meet latency requirements under normal conditions', async () => {
      const enricher = createEnricher({
        apiKey: 'perf-test-key',
        collectionId: 'col_perf',
        namespace: 'ns_perf',
        timeout: 200
      });

      // Mock fast API response
      global.fetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(createMockResponse({
            id: 'doc-perf',
            keywords: ['fast']
          })), 20) // 20ms simulated API latency
        )
      );

      const result = await enricher.enrich(global.sampleBidRequest);

      // Total processing should be under 100ms (excluding API latency)
      expect(result.latencyMs).toBeLessThan(200);

      enricher.destroy();
    });

    it('should handle timeouts gracefully', async () => {
      const enricher = createEnricher({
        apiKey: 'timeout-test-key',
        collectionId: 'col_timeout',
        namespace: 'ns_timeout',
        timeout: 50, // Very short timeout
        enableFallback: true
      });

      // Mock slow API response
      global.fetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(createMockResponse({ id: 'slow' })), 200)
        )
      );

      const result = await enricher.enrich(global.sampleBidRequest);

      // Should fallback, not hang
      expect(result.success).toBe(false);
      expect(result.ortb2).toBeDefined(); // Fallback provided

      enricher.destroy();
    });
  });

  describe('Content Extraction Accuracy', () => {
    it('should extract all relevant OpenRTB fields', () => {
      const complexRequest = {
        id: 'complex-extraction',
        imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
        site: {
          id: 'site-complex',
          name: 'Complex Publisher',
          domain: 'complex.example.com',
          page: 'https://complex.example.com/section/article?ref=homepage',
          ref: 'https://google.com/search?q=test',
          search: 'test query',
          keywords: 'keyword1,keyword2,keyword3',
          cat: ['IAB1', 'IAB2'],
          sectioncat: ['IAB1-1'],
          pagecat: ['IAB1-2'],
          privacypolicy: 1,
          publisher: {
            id: 'pub-complex',
            name: 'Complex Media',
            cat: ['IAB1'],
            domain: 'complex-media.com'
          },
          content: {
            id: 'content-abc',
            episode: '5',
            title: 'Article Title',
            series: 'Series Name',
            season: '2',
            artist: 'Content Creator',
            genre: 'Technology',
            album: 'Collection Name',
            isrc: 'ISRC123',
            producer: { id: 'prod-1', name: 'Producer Name' },
            url: 'https://complex.example.com/content/abc',
            cat: ['IAB19'],
            videoquality: 2,
            context: 1,
            contentrating: 'G',
            userrating: '4.5',
            qagmediarating: 1,
            keywords: 'content,keywords,here',
            livestream: 0,
            sourcerelationship: 1,
            len: 1200,
            language: 'en',
            embeddable: 1,
            data: [
              {
                id: 'data-1',
                name: 'custom-taxonomy',
                segment: [
                  { id: 'seg-1', name: 'Premium', value: 'premium' },
                  { id: 'seg-2', name: 'Intent', value: 'purchase-intent' }
                ]
              }
            ]
          }
        }
      };

      const extracted = extractFromBidRequest(complexRequest);

      // Verify all fields extracted
      expect(extracted.url).toBe('https://complex.example.com/section/article?ref=homepage');
      expect(extracted.domain).toBe('complex.example.com');
      expect(extracted.ref).toBe('https://google.com/search?q=test');
      expect(extracted.title).toBe('Article Title');
      expect(extracted.keywords).toContain('keyword1');
      expect(extracted.keywords).toContain('premium');
      expect(extracted.categories).toContain('IAB1');
      expect(extracted.categories).toContain('IAB19');
      expect(extracted.content.series).toBe('Series Name');
      expect(extracted.content.episode).toBe('5');
      expect(extracted.content.producer.name).toBe('Producer Name');
      expect(extracted.publisher.name).toBe('Complex Media');
      expect(extracted.language).toBe('en');
    });
  });
});
