# Mixpeek Contextual Adapter for Prebid.js

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/%40mixpeek%2Fprebid-contextual-adapter.svg)](https://www.npmjs.com/package/@mixpeek/prebid-contextual-adapter)

## 🎯 Overview

The Mixpeek Contextual Adapter enables publishers and SSPs using **Prebid.js** to enrich bid requests with real-time contextual data powered by Mixpeek's multimodal AI engine. This adapter provides:

- **Privacy-First Targeting**: No cookies, just content-based context
- **Multimodal Analysis**: Text, images, video, and audio processing
- **IAB Taxonomy**: Automatic classification into IAB content categories
- **Brand Safety**: Real-time brand safety scoring
- **Sub-100ms Performance**: Optimized for header bidding speed requirements
- **Graceful Fallbacks**: Never blocks the auction

## 🚀 Quick Start

### Installation

```bash
npm install @mixpeek/prebid-contextual-adapter
```

### Basic Setup

```javascript
// 1. Include the Mixpeek RTD module
import '@mixpeek/prebid-contextual-adapter'

// 2. Configure Mixpeek as an RTD provider
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,  // Max time to wait for contextual data (ms)
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,  // Wait for Mixpeek before starting auction
      params: {
        apiKey: 'YOUR_MIXPEEK_API_KEY',
        collectionId: 'your-collection-id',
        
        // Use development server (temporary)
        endpoint: 'https://server-xb24.onrender.com',
        // Or production: endpoint: 'https://api.mixpeek.com',
        
        namespace: 'your-namespace', // optional
        featureExtractors: ['taxonomy', 'brand-safety'],
        mode: 'page', // 'page', 'video', or 'auto'
        timeout: 5000, // ms - higher for dev server
        cacheTTL: 300 // seconds
      }
    }]
  }
})

// 3. The RTD module automatically enriches bid requests!
pbjs.requestBids({
  adUnits: [...],
  bidsBackHandler: function(bids) {
    // Bids now include Mixpeek contextual data in ortb2
  }
})
```

## 📋 Prerequisites

1. **Mixpeek Account**: Sign up at [mixpeek.com](https://mixpeek.com/start)
2. **API Key**: Generate an API key in your Mixpeek dashboard
3. **Collection**: Create a collection with feature extractors configured
4. **Prebid.js**: Version 6.0.0 or higher

## 🔧 Configuration Options

### RTD Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `realTimeData.auctionDelay` | number | ❌ | 250 | Max time to wait for all RTD providers (ms) |
| `realTimeData.dataProviders[].name` | string | ✅ | - | Must be `'mixpeek'` |
| `realTimeData.dataProviders[].waitForIt` | boolean | ❌ | false | Wait for Mixpeek before starting auction |

### Mixpeek Parameters

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `params.apiKey` | string | ✅ | - | Your Mixpeek API key |
| `params.collectionId` | string | ✅ | - | Mixpeek collection ID for document processing |
| `params.endpoint` | string | ❌ | `https://server-xb24.onrender.com` | Mixpeek API endpoint (dev server default) |
| `params.namespace` | string | ❌ | - | Optional namespace for data isolation |
| `params.featureExtractors` | array | ❌ | `['taxonomy']` | Feature extractors to use (taxonomy, brand-safety, etc.) |
| `params.mode` | string | ❌ | `auto` | Content mode: `page`, `video`, `image`, or `auto` |
| `params.timeout` | number | ❌ | 250 | API request timeout in milliseconds |
| `params.cacheTTL` | number | ❌ | 300 | Cache TTL in seconds |
| `params.enableCache` | boolean | ❌ | `true` | Enable local caching |
| `params.debug` | boolean | ❌ | `false` | Enable debug logging |
| `params.batchSize` | number | ❌ | 1 | Number of concurrent requests |
| `params.retryAttempts` | number | ❌ | 2 | Number of retry attempts on failure |

## 📊 Output: OpenRTB 2.6 Data Structure

The RTD module injects contextual data into your bid requests using the OpenRTB 2.6 standard:

### Site-Level Data (`ortb2.site.content`)
```javascript
{
  "ortb2": {
    "site": {
      "content": {
        "cat": ["IAB19-11"],              // IAB Content Categories
        "cattax": 6,                       // IAB Content Taxonomy v3.0
        "genre": "Technology - AI",        // Human-readable category
        "keywords": "ai,technology,ml",    // Extracted keywords
        "language": "en",                  // Content language
        "title": "Article Title",          // Page title
        "url": "https://example.com",      // Page URL
        "ext": {
          "data": {
            "mixpeek": {
              "score": 0.94,               // Confidence score
              "brandSafety": 0.98,         // Brand safety score
              "sentiment": "positive",      // Content sentiment
              "embeddingId": "emb_abc123"  // Embedding ID
            }
          }
        }
      }
    }
  }
}
```

### Impression-Level Data (`ortb2Imp.ext.data`)
```javascript
{
  "hb_mixpeek_taxonomy": "IAB19-11",       // Primary IAB taxonomy code
  "hb_mixpeek_category": "Technology > AI", // Human-readable category
  "hb_mixpeek_node": "node_tech_ai",       // Taxonomy node ID
  "hb_mixpeek_path": "tech/ai/ml",         // Hierarchical path
  "hb_mixpeek_score": "0.94",              // Confidence score
  "hb_mixpeek_safety": "0.98",             // Brand safety score
  "hb_mixpeek_keywords": "AI,ML,tech",     // Extracted keywords
  "hb_mixpeek_embed": "emb_abc123"         // Embedding ID for retrieval
}
```

## 🎥 Usage Examples

### Page Context (Articles, Blogs)

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_your_api_key',
        collectionId: 'col_articles',
        mode: 'page',
        featureExtractors: ['taxonomy', 'brand-safety', 'keywords']
      }
    }]
  }
})
```

### Video Context (Pre-roll, Mid-roll)

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 300,  // Longer delay for video processing
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_your_api_key',
        collectionId: 'col_videos',
        mode: 'video',
        videoSelector: '#main-video', // CSS selector for video element
        featureExtractors: ['taxonomy', 'scene-detection']
      }
    }]
  }
})
```

### Multi-Content Auto-Detection

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_your_api_key',
        collectionId: 'col_mixed',
        mode: 'auto', // Automatically detects page, video, or image content
        featureExtractors: ['taxonomy', 'brand-safety', 'clustering']
      }
    }]
  }
})
```

## 🏗️ How It Works

```mermaid
sequenceDiagram
    participant Publisher
    participant Prebid
    participant MixpeekAdapter
    participant MixpeekAPI
    participant SSP

    Publisher->>Prebid: Request Bids
    Prebid->>MixpeekAdapter: beforeRequestBids event
    MixpeekAdapter->>MixpeekAdapter: Extract page/video content
    MixpeekAdapter->>MixpeekAdapter: Check cache
    alt Cache Miss
        MixpeekAdapter->>MixpeekAPI: POST /collections/{id}/documents
        MixpeekAPI->>MixpeekAPI: Process with feature extractors
        MixpeekAPI-->>MixpeekAdapter: Return enrichments
        MixpeekAdapter->>MixpeekAdapter: Cache result
    end
    MixpeekAdapter->>Prebid: Inject contextual key-values
    Prebid->>SSP: Send enriched bid request
    SSP-->>Prebid: Return bids
    Prebid-->>Publisher: Render ad
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📖 Advanced Configuration

### Custom Feature Extractors

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_your_api_key',
        collectionId: 'col_custom',
        customExtractors: [
          {
            feature_extractor_id: 'sentiment-analyzer',
            payload: {
              model: 'sentiment-v2',
              threshold: 0.7
            }
          }
        ]
      }
    }]
  }
})
```

### Conditional Loading

```javascript
// Only enrich on specific pages
if (window.location.pathname.startsWith('/articles/')) {
  pbjs.setConfig({
    realTimeData: {
      auctionDelay: 250,
      dataProviders: [{
        name: 'mixpeek',
        waitForIt: true,
        params: {
          apiKey: 'sk_your_api_key',
          collectionId: 'col_articles',
          mode: 'page'
        }
      }]
    }
  })
}
```

### Event Callbacks

```javascript
pbjs.onEvent('mixpeekContextReady', function(context) {
  console.log('Mixpeek context loaded:', context)
  // Custom analytics or modifications
})

pbjs.onEvent('mixpeekContextError', function(error) {
  console.error('Mixpeek context error:', error)
  // Custom error handling
})
```

## 🔒 Security & Privacy

- **No PII**: The adapter never sends user identifiers or cookies
- **Content-Only**: Only page/video content is analyzed
- **HTTPS**: All API calls use TLS encryption
- **API Key Safety**: Store API keys securely (environment variables, server-side rendering)
- **GDPR/CCPA Compliant**: Contextual targeting doesn't require user consent

## 📚 Documentation

### User Guides
- [Quick Start](QUICKSTART.md) - Get running in 5 minutes
- [Integration Guide](docs/integration-guide.md) - Step-by-step integration
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Testing Guide](TESTING.md) - How to test the adapter
- [Endpoint Configuration](ENDPOINTS.md) - Configure API endpoints
- [Health Check](docs/health-check.md) - Health check configuration

### Developer Resources
- [Mixpeek API Docs](https://docs.mixpeek.com) - Platform documentation
- [Internal Planning](tasks/) - Gap analysis & implementation plans (internal)

## 🤝 Support

- **Email**: support@mixpeek.com
- **GitHub Issues**: [Create an issue](https://github.com/mixpeek/prebid-contextual-adapter/issues)
- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **Slack Community**: [Join our Slack](https://mixpeek.com/slack)

## 📄 License

Apache 2.0 - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with ❤️ by [Mixpeek](https://mixpeek.com)

Integrates with [Prebid.js](https://prebid.org) - an open-source header bidding solution

