
<p align="center">
  <img src="assets/header.png" alt="Mixpeek Server-Side RTD Reference Implementation" />
</p>

# Mixpeek Server-Side RTD Reference for Prebid Server

**Reference implementation and test harness for server-side OpenRTB bid request enrichment.**

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

[![npm version](https://img.shields.io/npm/v/@mixpeek/prebid-server.svg)](https://www.npmjs.com/package/@mixpeek/prebid-server)
[![npm downloads](https://img.shields.io/npm/dm/@mixpeek/prebid-server.svg)](https://www.npmjs.com/package/@mixpeek/prebid-server)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Status](https://img.shields.io/badge/Status-Reference-blue.svg)](https://www.npmjs.com/package/@mixpeek/prebid-server)

---

## How This Relates to Prebid Server

Prebid Server is implemented in **Go** and does not directly consume npm packages at runtime.

This package provides:

- **Reference implementation** of Mixpeek's server-side RTD logic
- **OpenRTB field mappings** identical to the Prebid Server data provider
- **Local test harness** for validating bid request enrichment
- **Utilities** for teams running Prebid Server behind Node-based gateways or proxies

The canonical Prebid Server integration is implemented as a Go data provider and documented separately.

---

## What This Is

| Type | Status |
|------|--------|
| **Reference Implementation** | OpenRTB enrichment logic |
| **Test Harness** | Validate bid request enrichment |
| **Node Gateway Utility** | For PBS proxy/gateway layers |
| Prebid Server Runtime | Not a Go module |

**SSPs and DSPs can use these field mappings via `ortb2.site.content` and `ortb2Imp.ext.data`.**

---

## Who This Is For

- **Engineers** building or validating Prebid Server data providers
- **Teams** running Node-based gateways in front of Prebid Server
- **Developers** testing OpenRTB enrichment logic locally
- **Ad Tech Platforms** evaluating Mixpeek contextual signals

Used in Mixpeek production demos and SSP integration testing.

---

## Why Use This

1. **Spec-Aligned** - Identical field mappings to the Go data provider
2. **Local Testing** - Validate enrichment without deploying to PBS
3. **Privacy-First** - No cookies, no user tracking
4. **IAB Taxonomy v3.0** - Standard content categorization
5. **Graceful Degradation** - Never blocks bid requests on API failures

**Graceful Failure:** If Mixpeek is unavailable or times out, bid requests proceed with fallback enrichment.

---

## Quick Start

```javascript
import { createEnricher } from '@mixpeek/prebid-server'

const enricher = createEnricher({
  apiKey: 'YOUR_API_KEY',
  collectionId: 'YOUR_COLLECTION_ID',
  namespace: 'YOUR_NAMESPACE'
})

// Enrich a bid request
const enrichedBidRequest = await enricher.enrichBidRequest(bidRequest, {
  url: pageUrl,
  title: pageTitle,
  text: pageContent
})
```

---

## Installation

```bash
npm install @mixpeek/prebid-server
```

## Prerequisites

1. **Mixpeek Account** - Sign up at [mixpeek.com](https://mixpeek.com/start)
2. **API Key** - Generate in your Mixpeek dashboard
3. **Collection** - Create a collection with feature extractors
4. **Namespace** - Your namespace ID (format: `ns_xxxxx`)
5. **Node.js** - Version 16.0.0 or higher

---

## Full Configuration

```javascript
import { createEnricher } from '@mixpeek/prebid-server'

const enricher = createEnricher({
  // Required
  apiKey: 'YOUR_API_KEY',
  collectionId: 'YOUR_COLLECTION_ID',
  namespace: 'YOUR_NAMESPACE',  // e.g., 'ns_abc123'

  // Optional
  endpoint: 'https://api.mixpeek.com',  // Default
  timeout: 200,        // API timeout in ms
  enableCache: true,   // Enable response caching
  cacheTTL: 300        // Cache TTL in seconds
})
```

---

## API Reference

### createEnricher(config)

Creates a new enricher instance.

**Config Options:**

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Mixpeek API key |
| `collectionId` | string | Yes | - | Collection ID |
| `namespace` | string | Yes | - | Namespace (ns_xxxxx) |
| `endpoint` | string | No | https://api.mixpeek.com | API endpoint |
| `timeout` | number | No | 200 | Request timeout (ms) |
| `enableCache` | boolean | No | true | Enable caching |
| `cacheTTL` | number | No | 300 | Cache TTL (seconds) |

### enricher.enrich(content)

Enrich content and return OpenRTB 2.6 compatible data.

```javascript
const result = await enricher.enrich({
  url: 'https://example.com/article',
  title: 'Article Title',
  text: 'Article content...',
  language: 'en'
})

// Result:
{
  ortb2: {
    site: {
      content: { ... }
    }
  },
  targeting: {
    hb_mixpeek_category: 'Technology',
    hb_mixpeek_score: '0.92',
    hb_mixpeek_keywords: 'ai,ml,tech'
  },
  context: { ... },
  latencyMs: 45,
  cached: false
}
```

### enricher.enrichBidRequest(bidRequest, content?)

Enrich an OpenRTB bid request in-place.

```javascript
const enriched = await enricher.enrichBidRequest(bidRequest, {
  url: pageUrl,
  title: pageTitle,
  text: pageContent
})
```

### enricher.healthCheck()

Check API connectivity.

### enricher.clearCache()

Clear the in-memory cache.

### enricher.getCacheStats()

Get cache statistics.

```javascript
const stats = enricher.getCacheStats()
// { size: 42, maxSize: 1000, enabled: true, ttlMs: 300000 }
```

---

## OpenRTB 2.6 Field Mappings

These mappings are **identical** to the Prebid Server Go data provider.

### Site-Level Data (`ortb2.site.content`)

```javascript
{
  "site": {
    "content": {
      "cat": ["IAB19-11"],              // IAB Content Categories
      "cattax": 6,                       // IAB Taxonomy v3.0
      "genre": "Technology",             // Human-readable category
      "keywords": "ai,technology,ml",    // Extracted keywords
      "language": "en",                  // Content language
      "ext": {
        "data": {
          "mixpeek": {
            "documentId": "doc_abc123",
            "score": 0.94,               // Classification confidence
            "brandSafety": {
              "score": 0.98,
              "level": "safe"
            },
            "sentiment": "positive"
          }
        }
      }
    }
  }
}
```

### Impression-Level Keys (`ortb2Imp.ext.data`)

| Key | Description | Example |
|-----|-------------|---------|
| `hb_mixpeek_category` | Content category | `"Technology"` |
| `hb_mixpeek_score` | Classification confidence | `"0.94"` |
| `hb_mixpeek_safety` | Brand safety score | `"0.98"` |
| `hb_mixpeek_keywords` | Extracted keywords | `"AI,ML,tech"` |
| `hb_mixpeek_sentiment` | Content sentiment | `"positive"` |

---

## Use Case: Node Gateway in Front of PBS

If you run a Node-based gateway or proxy in front of Prebid Server, you can use this package to enrich requests before forwarding:

```javascript
import express from 'express'
import { createEnricher } from '@mixpeek/prebid-server'

const app = express()
app.use(express.json())

const enricher = createEnricher({
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  namespace: process.env.MIXPEEK_NAMESPACE
})

// Gateway endpoint - enriches then forwards to PBS
app.post('/openrtb/auction', async (req, res) => {
  const bidRequest = req.body

  // Enrich with contextual data
  const content = {
    url: bidRequest.site?.page,
    title: bidRequest.site?.content?.title,
    text: req.body.pageContent
  }
  const enrichedRequest = await enricher.enrichBidRequest(bidRequest, content)

  // Forward to Prebid Server
  const pbsResponse = await fetch('http://prebid-server:8000/openrtb2/auction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrichedRequest)
  })

  res.json(await pbsResponse.json())
})

app.listen(3000)
```

---

## Testing

```bash
# Run unit tests
npm test

# Run with live API (requires credentials)
MIXPEEK_API_KEY=your_key \
MIXPEEK_NAMESPACE=ns_xxxxx \
MIXPEEK_COLLECTION_ID=col_xxxxx \
npm run test:live
```

---

## Support

- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **GitHub Issues**: [Create an issue](https://github.com/mixpeek/connectors/issues)
- **Email**: support@mixpeek.com

---

## License

Apache 2.0 - see [LICENSE](LICENSE)

Built by [Mixpeek](https://mixpeek.com) | Reference for [Prebid Server](https://prebid.org)
