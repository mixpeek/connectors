# Mixpeek Content Intelligence Worker

A **shared content intelligence layer at the edge** that provides cached content profiles for ads, analytics, and personalization systems.

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

## Architecture

```
Request
   |
Cloudflare Worker
   |
Mixpeek Content Analysis
   |
Cached Content Profile (URL / ID)
   |
+-------------+---------------+---------------+
| Ad Server   | Analytics     | Internal ML   |
| (GAM/PBS)   | (GA/BI)       | / Personal.   |
+-------------+---------------+---------------+
```

**One analysis -> Many consumers**

This is edge-based content intelligence as shared infrastructure. Ads are just the first, obvious consumer.

## Cloudflare-Native Design

This Worker is designed to run entirely within Cloudflare's edge environment:

- **No client-side JavaScript required** - Analysis happens at the edge, not in the browser
- **No impact on ad auction latency** - Profiles are pre-cached and served instantly
- **First-party execution model** - Runs on your domain, under your control
- **Cacheable, deterministic outputs** - Same URL always produces same profile
- **KV-native caching** - Uses Cloudflare KV for global, low-latency storage

Content analysis is performed once and reused across all downstream systems.

## When Analysis Happens

This Worker supports two modes:

| Mode | When | Use Case |
|------|------|----------|
| **Pre-warmed** | On content publish/update via `/v1/analyze` | Production deployments |
| **On-demand** | On first request, then cached | Development, long-tail content |

Most production deployments **pre-warm on content publish** and serve cached profiles at request time. This ensures zero latency impact on page loads and ad auctions.

```javascript
// Pre-warm on publish (recommended)
await fetch('https://your-worker.workers.dev/v1/analyze', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com/new-article' })
});
```

## Non-Goals

This Worker does **not**:

- Make bid decisions or auction logic
- Store user identifiers or cookies
- Perform user-level tracking or profiling
- Replace ad servers, DSPs, or SSPs
- Execute client-side JavaScript

It provides **content-level intelligence only** - understanding what the page is about, not who is viewing it.

## Features

- **Edge-first**: Content analysis happens at the edge, close to users
- **Cache-first**: Profiles are cached in Cloudflare KV for instant retrieval
- **Multi-format**: Output formats for GAM, OpenRTB/Prebid, Analytics, and JSON
- **IAB Taxonomy**: Automatic classification into IAB Content Taxonomy v3.0
- **Brand Safety**: Real-time content safety scoring and flagging
- **Sentiment Analysis**: Content sentiment classification
- **Privacy-first**: No cookies or PII collection required

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create KV Namespace

```bash
wrangler kv:namespace create CONTENT_PROFILES
wrangler kv:namespace create CONTENT_PROFILES --preview
```

Update `wrangler.toml` with the namespace IDs.

### 3. Set Secrets

```bash
wrangler secret put MIXPEEK_API_KEY
wrangler secret put MIXPEEK_COLLECTION_ID
wrangler secret put MIXPEEK_NAMESPACE  # optional
```

### 4. Deploy

```bash
# Development
npm run dev

# Production
npm run deploy:production
```

## Endpoints

### POST /v1/analyze

Analyze content and cache the result.

**Request:**
```json
{
  "url": "https://example.com/article",
  "options": {
    "extractors": ["taxonomy", "sentiment", "keywords", "brand_safety"],
    "forceRefresh": false,
    "ttl": 3600
  }
}
```

**Response:**
```json
{
  "id": "profile:abc123",
  "url": "https://example.com/article",
  "analyzedAt": "2024-01-15T10:30:00Z",
  "profile": {
    "taxonomy": {
      "label": "Technology",
      "nodeId": "technology",
      "path": ["Content", "Technology"],
      "score": 0.85
    },
    "iab": {
      "primary": "IAB19",
      "all": ["IAB19", "IAB19-11"],
      "version": 6
    },
    "brandSafety": {
      "level": "safe",
      "score": 0.9,
      "categories": []
    },
    "sentiment": {
      "label": "positive",
      "score": 0.75
    },
    "keywords": ["technology", "software", "innovation"]
  },
  "cached": false,
  "cacheKey": "profile:abc123"
}
```

### GET /v1/profile

Get cached content profile with optional format.

**Parameters:**
- `url` (required): Content URL
- `format`: `json` | `gam` | `openrtb` | `analytics`

**Example:**
```bash
curl "https://your-worker.workers.dev/v1/profile?url=https://example.com/article&format=gam"
```

### GET /v1/profile/gam

Get profile formatted for Google Ad Manager targeting.

**Response:**
```json
{
  "targeting": {
    "mp_iab": "IAB19",
    "mp_iab_all": ["IAB19", "IAB19-11"],
    "mp_cat": "technology",
    "mp_safety": "safe",
    "mp_safety_score": "90",
    "mp_sentiment": "positive",
    "mp_kw": ["technology", "software", "innovation"],
    "mp_domain": "example.com"
  }
}
```

### GET /v1/profile/openrtb

Get profile formatted for OpenRTB 2.6 / Prebid Server.

**Response:**
```json
{
  "site": {
    "content": {
      "cat": ["IAB19", "IAB19-11"],
      "cattax": 6,
      "genre": "Technology",
      "keywords": "technology,software,innovation",
      "ext": {
        "data": {
          "mixpeek": {
            "documentId": "doc_123",
            "brandSafety": { "level": "safe", "score": 0.9 },
            "sentiment": { "label": "positive", "score": 0.75 }
          }
        }
      }
    }
  },
  "data": [{
    "id": "mixpeek",
    "name": "Mixpeek Content Intelligence",
    "segment": [...]
  }],
  "ortb2Fragments": {
    "global": {
      "site": { "content": {...} }
    }
  }
}
```

### GET /v1/profile/analytics

Get profile formatted for analytics (GA4, GTM, BigQuery).

**Response:**
```json
{
  "ga4": {
    "dimensions": {
      "content_iab_category": "IAB19",
      "content_category": "Technology",
      "content_safety_level": "safe",
      "content_sentiment": "positive"
    },
    "metrics": {
      "content_safety_score": 0.9,
      "content_sentiment_score": 0.75
    }
  },
  "dataLayer": {
    "event": "mixpeek_content_analyzed",
    "mixpeek": {...}
  },
  "warehouse": {
    "category_label": "Technology",
    "iab_primary": "IAB19",
    ...
  }
}
```

### POST /v1/batch

Batch analyze multiple URLs.

**Request:**
```json
{
  "urls": [
    "https://example.com/article1",
    "https://example.com/article2"
  ],
  "options": {
    "forceRefresh": false
  }
}
```

### POST /v1/invalidate

Invalidate cached profiles.

**Request:**
```json
{
  "urls": ["https://example.com/article"],
  "pattern": "profile:"
}
```

### GET /health

Health check endpoint.

## Integration Examples

### Google Ad Manager (GPT)

```javascript
// Fetch targeting keys before loading ads
const response = await fetch(
  `https://your-worker.workers.dev/v1/profile/gam?url=${encodeURIComponent(window.location.href)}`
);
const { targeting } = await response.json();

// Apply to GPT
googletag.pubads().setTargeting('mp_iab', targeting.mp_iab);
googletag.pubads().setTargeting('mp_safety', targeting.mp_safety);
googletag.pubads().setTargeting('mp_kw', targeting.mp_kw);
```

### Prebid Server

```javascript
// Add to Prebid config
pbjs.setConfig({
  ortb2: {
    site: {
      content: await fetchMixpeekProfile('openrtb')
    }
  }
});

async function fetchMixpeekProfile(format) {
  const response = await fetch(
    `https://your-worker.workers.dev/v1/profile/${format}?url=${encodeURIComponent(window.location.href)}`
  );
  const data = await response.json();
  return data.site?.content || {};
}
```

### Google Analytics 4

```javascript
// Fetch analytics dimensions
const response = await fetch(
  `https://your-worker.workers.dev/v1/profile/analytics?url=${encodeURIComponent(window.location.href)}`
);
const { dataLayer } = await response.json();

// Push to GTM data layer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push(dataLayer);
```

### Server-Side (Node.js / Edge)

```javascript
// Pre-warm cache on content publish
async function onContentPublish(url) {
  await fetch('https://your-worker.workers.dev/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
}

// Invalidate on content update
async function onContentUpdate(url) {
  await fetch('https://your-worker.workers.dev/v1/invalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: [url] })
  });
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MIXPEEK_API_KEY` | Mixpeek service key (secret) | Required |
| `MIXPEEK_COLLECTION_ID` | Mixpeek collection ID | Required |
| `MIXPEEK_NAMESPACE` | Mixpeek namespace | Optional |
| `MIXPEEK_API_ENDPOINT` | Mixpeek service endpoint | `https://api.mixpeek.com` |
| `CACHE_TTL` | Cache TTL in seconds | `3600` |
| `MAX_BATCH_SIZE` | Maximum batch size | `10` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |

### KV Namespace

The worker requires a KV namespace for caching. Create one:

```bash
wrangler kv:namespace create CONTENT_PROFILES
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Why This Architecture

### Problems This Solves

1. **Client-side JS sprawl**: Prebid RTD, brand safety tags, analytics tags, A/B tools all competing for page load and reliability

2. **Privacy & compliance pressure**: Consent gating breaks JS execution. Edge logic is first-party, deterministic, and auditable

3. **Duplication of expensive logic**: Same page analyzed by adtech vendors, analytics tools, internal ML, personalization engines. Wasted compute, inconsistent outputs.

### What Makes This Different

**A single, cached, edge-side "content brain"**

At request time (or cached on change), the Worker:
1. Understands the page (text, image, video, layout)
2. Produces canonical signals (topic, sentiment, suitability)
3. Stores/caches the result
4. Exposes it everywhere

Once computed, those signals are reused by:
- Google Ad Manager (targeting keys)
- Prebid Server (ext.data)
- Analytics (custom dimensions)
- Logs / BI
- Internal services

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Support

- **Email**: support@mixpeek.com
- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **GitHub Issues**: [Create an issue](https://github.com/mixpeek/connectors/issues)
