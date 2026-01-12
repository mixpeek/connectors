# @mixpeek/openrtb

OpenRTB 2.5/2.6/3.0 reference implementation for contextual content enrichment.

[![npm version](https://badge.fury.io/js/%40mixpeek%2Fopenrtb.svg)](https://www.npmjs.com/package/@mixpeek/openrtb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Scope & Intent

This package is a **non-normative reference implementation** intended to:

- Demonstrate valid OpenRTB 2.5/2.6/3.0 enrichment patterns
- Provide executable examples of `site.content` and `imp.ext.data` usage
- Validate field mappings against the OpenRTB specification
- Show compliant IAB Content Taxonomy 3.0 category assignment

It is **not** a required runtime dependency for OpenRTB implementations. Production systems may implement equivalent logic in any language.

## Overview

This reference implementation extracts content from OpenRTB bid requests, processes it through Mixpeek's content analysis API, and returns enrichments formatted as spec-compliant OpenRTB fields. All output conforms to OpenRTB 2.5/2.6/3.0 field definitions.

### Key Characteristics

- **Spec-Compliant Output**: All enrichments map to standard OpenRTB fields
- **RTB-Safe Latency**: Sub-200ms processing, never blocks bid flow
- **IAB Taxonomy 3.0**: Category assignments use `cattax: 7` per spec
- **Graceful Degradation**: Fallback enrichments on API failure
- **Privacy-First**: No user tracking or PII—pure contextual signals

## Who This Is For

- **Engineers** implementing or validating OpenRTB pipelines
- **SSP/DSP platform teams** testing contextual enrichment patterns
- **Standards reviewers** evaluating non-normative examples
- **Ad tech teams** building spec-compliant RTB infrastructure

## Installation

```bash
npm install @mixpeek/openrtb
```

## Quick Start

```javascript
import { createEnricher } from '@mixpeek/openrtb';

// Create enricher instance
const enricher = createEnricher({
  apiKey: 'your_mixpeek_api_key',
  collectionId: 'your_collection_id',
  namespace: 'your_namespace'
});

// Enrich an OpenRTB bid request
const bidRequest = {
  id: 'request-123',
  imp: [{ id: 'imp-1', banner: { w: 300, h: 250 } }],
  site: {
    domain: 'example.com',
    page: 'https://example.com/article/tech-news',
    content: {
      title: 'Latest Technology News',
      keywords: 'technology,software,ai'
    }
  }
};

// Get enriched bid request
const enrichedRequest = await enricher.enrichBidRequest(bidRequest);

// Or get enrichment data separately
const result = await enricher.enrich(bidRequest);
console.log(result.ortb2);      // OpenRTB site.content
console.log(result.targeting);  // Targeting key-values
console.log(result.enrichments); // Raw enrichment data
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | **required** | Mixpeek API key |
| `collectionId` | string | **required** | Collection ID for document storage |
| `namespace` | string | **required** | Namespace for data isolation |
| `endpoint` | string | `https://api.mixpeek.com` | API endpoint |
| `timeout` | number | `200` | Request timeout in milliseconds |
| `cacheTTL` | number | `300` | Cache TTL in seconds |
| `enableCache` | boolean | `true` | Enable response caching |
| `enableFallback` | boolean | `true` | Enable fallback enrichments on API failure |
| `debug` | boolean | `false` | Enable debug logging |

### Full Configuration Example

```javascript
const enricher = createEnricher({
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  namespace: process.env.MIXPEEK_NAMESPACE,
  endpoint: 'https://api.mixpeek.com',
  timeout: 200,
  cacheTTL: 300,
  enableCache: true,
  enableFallback: true,
  debug: false
});
```

## API Reference

### `createEnricher(config)`

Creates a new OpenRTB enricher instance.

```javascript
const enricher = createEnricher(config);
```

### `enricher.enrich(bidRequest, options?)`

Processes a bid request and returns enrichment data.

```javascript
const result = await enricher.enrich(bidRequest);

// Result structure:
{
  success: true,
  enrichments: {
    keywords: ['technology', 'software', 'ai'],
    sentiment: { sentiment: 'positive', score: 0.7 },
    categories: { category: 'IAB19', categoryName: 'Technology', confidence: 0.9 },
    brandSafety: { level: 'safe', score: 1.0 },
    documentId: 'doc-123'
  },
  extractedContent: { /* extracted OpenRTB content */ },
  ortb2: {
    site: {
      content: { /* OpenRTB 2.6 site.content */ }
    }
  },
  targeting: {
    mixpeek_cat: 'IAB19',
    mixpeek_sentiment: 'positive',
    mixpeek_brand_safe: 'safe'
  },
  cached: false,
  latencyMs: 45
}
```

### `enricher.enrichBidRequest(bidRequest, options?)`

Enriches a bid request in-place and returns the modified request.

```javascript
const enrichedRequest = await enricher.enrichBidRequest(bidRequest);

// The returned request includes:
// - site.content with Mixpeek enrichments
// - imp[].ext.data.mixpeek for each impression
// - ext.mixpeek at request level
```

### `enricher.healthCheck()`

Checks API health and returns status.

```javascript
const health = await enricher.healthCheck();
// { status: 'healthy', latency: 50, timestamp: '...', cache: {...}, metrics: {...} }
```

### `enricher.getMetrics()`

Returns processing metrics.

```javascript
const metrics = enricher.getMetrics();
// { requests: 100, cacheHits: 40, cacheHitRate: 40, apiCalls: 60, avgLatencyMs: 45 }
```

### `enricher.clearCache()`

Clears the enrichment cache.

### `enricher.destroy()`

Cleans up resources (timers, cache).

## OpenRTB Output Format

### Site Content (OpenRTB 2.6)

```javascript
{
  site: {
    content: {
      cat: ['IAB19', 'IAB19-18'],      // IAB categories
      keywords: 'technology,software,ai', // Keywords string
      cattax: 7,                        // IAB Tech Lab Content Taxonomy 3.0
      ext: {
        mixpeek: {
          sentiment: 'positive',        // positive/neutral/negative
          sentimentScore: 0.7,          // -1.0 to 1.0
          brandSafety: {
            level: 'safe',              // safe/low_risk/medium_risk/high_risk/blocked
            score: 1.0                  // 0.0 to 1.0
          },
          taxonomy: {
            category: 'IAB19',
            categoryName: 'Technology & Computing',
            confidence: 0.9
          },
          documentId: 'doc-123',
          embeddingId: 'emb-123',
          source: 'api',
          version: '1.0.0'
        }
      }
    }
  }
}
```

### Impression Extension

```javascript
{
  imp: [{
    id: 'imp-1',
    ext: {
      data: {
        mixpeek: {
          impId: 'imp-1',
          category: 'IAB19',
          categoryName: 'Technology & Computing',
          keywords: ['technology', 'software', 'ai'],
          sentiment: 'positive',
          brandSafetyLevel: 'safe',
          brandSafetyScore: 1.0,
          contentType: 'article',
          language: 'en'
        }
      }
    }
  }]
}
```

### Targeting Keys

| Key | Description | Example |
|-----|-------------|---------|
| `mixpeek_cat` | Primary IAB category | `IAB19` |
| `mixpeek_subcat` | Category name | `Technology & Computing` |
| `mixpeek_kw` | Top keywords | `technology,software,ai` |
| `mixpeek_sentiment` | Sentiment | `positive` |
| `mixpeek_brand_safe` | Brand safety level | `safe` |
| `mixpeek_content_type` | Content type | `article` |
| `mixpeek_lang` | Language | `en` |
| `mixpeek_emb_id` | Embedding ID | `emb-123` |

## Supported Bid Request Types

### Site Requests

```javascript
{
  site: {
    domain: 'example.com',
    page: 'https://example.com/article',
    keywords: 'news,technology',
    cat: ['IAB19'],
    content: {
      title: 'Article Title',
      keywords: 'content,keywords'
    }
  }
}
```

### App Requests

```javascript
{
  app: {
    name: 'News App',
    bundle: 'com.example.newsapp',
    cat: ['IAB12'],
    content: {
      title: 'News Feed',
      keywords: 'news,breaking'
    }
  }
}
```

### Video Requests

```javascript
{
  imp: [{
    video: {
      mimes: ['video/mp4'],
      minduration: 5,
      maxduration: 30
    }
  }],
  site: {
    content: {
      title: 'Video Title',
      series: 'Series Name',
      len: 1800,
      livestream: 0
    }
  }
}
```

## Caching

The connector includes built-in caching to minimize API calls and latency:

- **In-memory cache** with configurable TTL
- **LRU eviction** when max items reached
- **Automatic cache key generation** from URL/title/content
- **Cache statistics** available via `getCacheStats()`

```javascript
// Check cache stats
const stats = enricher.getCacheStats();
console.log(stats);
// { size: 150, maxSize: 1000, hits: 500, misses: 200, hitRate: 71.43, ... }
```

## Error Handling & Fallback

The connector never blocks bid processing:

1. **Timeout**: Requests timeout after configurable duration (default 200ms)
2. **Fallback**: On API failure, local enrichments are provided
3. **Graceful Degradation**: Always returns a valid response structure

```javascript
const result = await enricher.enrich(bidRequest);

if (!result.success) {
  console.log('API failed, using fallback:', result.error);
  // result.ortb2 still contains fallback data
}
```

## Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Live API tests (requires credentials)
export MIXPEEK_API_KEY="your_key"
export MIXPEEK_COLLECTION_ID="col_xxx"
export MIXPEEK_NAMESPACE="ns_xxx"
npm run test:live

# Coverage report
npm run test:coverage
```

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Processing latency | <100ms | 30-50ms |
| API timeout | 200ms | - |
| Cache hit rate | >50% | 60-80% |
| Memory footprint | <50MB | 10-30MB |

## Examples

### Basic Enrichment

```javascript
import { createEnricher } from '@mixpeek/openrtb';

const enricher = createEnricher({
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  namespace: process.env.MIXPEEK_NAMESPACE,
  timeout: 150 // RTB-safe timeout
});

async function processBidRequest(bidRequest) {
  // Enrich and return spec-compliant output
  const enrichedRequest = await enricher.enrichBidRequest(bidRequest);
  return enrichedRequest;
}
```

### Validating Output Fields

```javascript
const result = await enricher.enrich(bidRequest);

// Verify IAB Taxonomy 3.0 compliance
console.log(result.ortb2.site.content.cattax); // 7 (IAB Tech Lab Content Taxonomy 3.0)
console.log(result.ortb2.site.content.cat);    // ['IAB19', 'IAB19-18']

// Check standard field mappings
console.log(result.ortb2.site.content.keywords); // 'technology,software,ai'
```

## Changelog

### v1.0.0

- Initial release
- OpenRTB 2.5/2.6/3.0 support
- Site, app, and video bid request handling
- IAB Content Taxonomy 3.0 mapping
- Brand safety scoring
- Sentiment analysis
- In-memory caching with LRU eviction
- Comprehensive test suite

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Appendix: Example Downstream Usage (Non-spec)

The following examples show how enriched data might be consumed by downstream systems. These patterns are **not part of the OpenRTB specification** and are provided for illustration only.

### SSP: Enriching Before Auction

```javascript
async function processBidRequest(bidRequest) {
  const enrichedRequest = await enricher.enrichBidRequest(bidRequest);

  // Send enriched request to DSPs
  const responses = await sendToDSPs(enrichedRequest);
  return responses;
}
```

### DSP: Using Enrichments for Bid Decisions

```javascript
async function evaluateBidRequest(bidRequest) {
  const result = await enricher.enrich(bidRequest);

  // Brand safety check
  if (result.enrichments.brandSafety.level === 'high_risk') {
    return null; // Don't bid
  }

  // Context-based bid adjustment
  let bidModifier = 1.0;
  if (result.enrichments.categories.category === 'IAB19') {
    bidModifier = 1.2; // Tech content premium
  }

  return calculateBid(bidRequest, bidModifier);
}
```

---

## Support

- GitHub Issues: [github.com/mixpeek/connectors/issues](https://github.com/mixpeek/connectors/issues)
- Documentation: [docs.mixpeek.com](https://docs.mixpeek.com)
- Email: support@mixpeek.com
