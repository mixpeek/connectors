
<p align="center">
  <img src="assets/header.png" alt="Mixpeek Multimodal Contextual Targeting Adapter" />
</p>

# Mixpeek RTD (Real-Time Data) Adapter for Prebid.js

**This is a Real-Time Data (RTD) module for Prebid.js that replaces cookie-based targeting with sub-100ms contextual signals.**

[![npm version](https://img.shields.io/npm/v/@mixpeek/prebid.svg)](https://www.npmjs.com/package/@mixpeek/prebid)
[![npm downloads](https://img.shields.io/npm/dm/@mixpeek/prebid.svg)](https://www.npmjs.com/package/@mixpeek/prebid)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@mixpeek/prebid)](https://bundlephobia.com/package/@mixpeek/prebid)
[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen.svg)](https://www.npmjs.com/package/@mixpeek/prebid)

---

## What This Is

| Type | Status |
|------|--------|
| **RTD Module** (bid enrichment) | Supported |
| Bidder Adapter | Not a bidder |
| Analytics Adapter | Not analytics |
| Identity Module | Not identity |

---

## Why Use This

1. **Ad Adjacency Awareness** - Competitive separation, no repeat creatives
2. **Privacy-First Contextual Targeting** - No cookies, no user tracking
3. **IAB Taxonomy Classification** - Content categorization (v3.0)
4. **Brand Safety Scoring** - Real-time sentiment analysis
5. **Multimodal Analysis** - Text, image, video content understanding
6. **Sub-100ms RTD Performance** - Optimized for header bidding latency

---

## Minimal Setup (Copy-Paste Ready)

```javascript
import '@mixpeek/prebid'

pbjs.setConfig({
  realTimeData: {
    dataProviders: [{
      name: 'mixpeek',
      params: {
        apiKey: 'YOUR_API_KEY',
        collectionId: 'YOUR_COLLECTION_ID',
        namespace: 'YOUR_NAMESPACE'
      }
    }]
  }
})
```

That's it. The RTD module automatically enriches all bid requests.

---

## Installation

```bash
npm install @mixpeek/prebid
```

## Prerequisites

1. **Mixpeek Account** - Sign up at [mixpeek.com](https://mixpeek.com/start)
2. **API Key** - Generate in your Mixpeek dashboard
3. **Collection** - Create a collection with feature extractors
4. **Namespace** - Your namespace ID (format: `ns_xxxxx`)
5. **Prebid.js** - Version 6.0.0 or higher

---

## Full Configuration

```javascript
import '@mixpeek/prebid'

pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,  // Max wait for contextual data (ms)
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,  // Wait for Mixpeek before auction
      params: {
        // Required
        apiKey: 'YOUR_API_KEY',
        collectionId: 'YOUR_COLLECTION_ID',
        namespace: 'YOUR_NAMESPACE',  // e.g., 'ns_abc123'

        // Optional
        endpoint: 'https://api.mixpeek.com',  // Default
        mode: 'auto',        // 'page', 'video', 'image', or 'auto'
        timeout: 250,        // API timeout in ms
        cacheTTL: 300,       // Cache TTL in seconds
        enableCache: true,   // Enable local caching
        debug: false         // Enable debug logging
      }
    }]
  }
})

// Bids are automatically enriched with contextual data
pbjs.requestBids({
  adUnits: [...],
  bidsBackHandler: function(bids) {
    // Bids now include Mixpeek contextual data in ortb2
  }
})
```

---

## Ad Adjacency Awareness (Key Feature)

The adapter automatically tracks previously served ads to enable:

- **Competitive Separation** - Avoid showing competing brands consecutively
- **Creative Frequency** - Prevent the same ad from showing repeatedly
- **Category Diversity** - Improve ad variety for better user experience

### How SSPs/DSPs Use It

```javascript
// Data automatically injected into ortb2Imp.ext.data:
{
  "hb_mixpeek_prev_creative": "12345",     // Last creative ID
  "hb_mixpeek_prev_bidder": "appnexus",    // Last winning bidder
  "hb_mixpeek_prev_adunit": "sidebar-1",   // Last ad unit
  "hb_mixpeek_prev_cat": "IAB18-1,IAB12-3" // Last ad categories
}

// DSP can use for competitive separation:
if (prevCategories.includes('IAB18-1') && currentAd.category === 'IAB18-1') {
  // Don't show competing fashion ads back-to-back
}
```

### Privacy Safe

- No user tracking or identifiers
- Only ad metadata stored (< 200 bytes)
- Session-scoped, localStorage with memory fallback
- GDPR/CCPA compliant (contextual, not behavioral)

---

## OpenRTB 2.6 Output

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
            "score": 0.94,               // Classification confidence
            "brandSafety": 0.98,         // Brand safety score
            "sentiment": "positive"       // Content sentiment
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
| `hb_mixpeek_prev_creative` | Last creative ID | `"12345"` |
| `hb_mixpeek_prev_bidder` | Last winning bidder | `"appnexus"` |
| `hb_mixpeek_prev_cat` | Last ad categories | `"IAB18-1"` |

---

## How It Works

```
USER → WEBSITE → PREBID.JS
                    │
                    ├──→ MIXPEEK RTD Module
                    │    (Extract page content)
                    │    (Get previous ad info)
                    │    ↓
                    │    Returns: categories, keywords, sentiment
                    │    ↓
                 (enrich bid request with ortb2)
                    │
                    ├──→ SSP 1 ──→ DSPs (use contextual signals)
                    ├──→ SSP 2 ──→ DSPs (use adjacency data)
                    └──→ SSP N

                 (collect bids)
                    │
                    ▼
                AD SERVER
                    │
                    ▼
               RELEVANT AD
```

---

## Content Modes

### Page Context (Default)

```javascript
params: {
  mode: 'page',  // Analyze article/page content
  // ...
}
```

### Video Context

```javascript
params: {
  mode: 'video',
  videoSelector: '#main-video',  // CSS selector
  // ...
}
```

### Auto-Detection

```javascript
params: {
  mode: 'auto',  // Automatically detect content type
  // ...
}
```

---

## Event Callbacks

```javascript
// Context ready
pbjs.onEvent('mixpeekContextReady', function(context) {
  console.log('Category:', context.taxonomy?.label)
  console.log('Keywords:', context.keywords)
})

// Error handling
pbjs.onEvent('mixpeekContextError', function(error) {
  // Errors don't block auction (graceful degradation)
  console.error('Mixpeek error:', error)
})

// Cache hit
pbjs.onEvent('mixpeekContextCached', function(data) {
  console.log('Using cached context')
})
```

---

## Testing

```bash
# Run all tests
npm test

# Run with live API (requires credentials)
MIXPEEK_API_KEY=your_key \
MIXPEEK_NAMESPACE=ns_xxxxx \
MIXPEEK_COLLECTION_ID=col_xxxxx \
npm run test:live

# Coverage report
npm run test:coverage
```

---

## Documentation

- [Quick Start](QUICKSTART.md) - Get running in 5 minutes
- [Integration Guide](docs/integration-guide.md) - Step-by-step setup
- [API Reference](docs/api-reference.md) - Complete API docs
- [Testing Guide](TESTING.md) - How to test the adapter

---

## Support

- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **GitHub Issues**: [Create an issue](https://github.com/mixpeek/prebid/issues)
- **Email**: support@mixpeek.com

---

## License

Apache 2.0 - see [LICENSE](LICENSE)

Built by [Mixpeek](https://mixpeek.com) | Integrates with [Prebid.js](https://prebid.org)
