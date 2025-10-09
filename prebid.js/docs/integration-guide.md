# Mixpeek Context Adapter - Integration Guide

This guide will walk you through integrating the Mixpeek Context Adapter with Prebid.js.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:

- **Mixpeek Account**: Sign up at [mixpeek.com/start](https://mixpeek.com/start)
- **API Key**: Generate an API key from your Mixpeek dashboard
- **Collection**: Create a collection with feature extractors configured
- **Prebid.js**: Version 6.0.0 or higher installed on your site

### Setting Up Your Mixpeek Collection

1. **Create a Collection**:
   ```bash
   curl -X POST https://api.mixpeek.com/v1/collections \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "contextual-targeting",
       "description": "Collection for contextual ad targeting"
     }'
   ```

2. **Note your Collection ID** from the response (e.g., `col_abc123`)

3. **Verify Feature Extractors** are available:
   ```bash
   curl https://api.mixpeek.com/v1/collections/features/extractors \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## Installation

### Option 1: NPM (Recommended)

```bash
npm install @mixpeek/prebid-contextual-adapter
```

Then include in your JavaScript:

```javascript
import '@mixpeek/prebid-contextual-adapter'
```

### Option 2: CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@mixpeek/prebid-contextual-adapter@latest/dist/mixpeekContextAdapter.js"></script>
```

### Option 3: Download

Download the latest release from [GitHub releases](https://github.com/mixpeek/prebid-contextual-adapter/releases) and include it in your page:

```html
<script src="/path/to/mixpeekContextAdapter.js"></script>
```

## Configuration

### Basic Setup

Add the Mixpeek RTD configuration to your Prebid setup:

```javascript
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

pbjs.que.push(function() {
  // Configure Mixpeek as an RTD provider
  pbjs.setConfig({
    realTimeData: {
      auctionDelay: 250,  // Max time to wait for RTD providers
      dataProviders: [{
        name: 'mixpeek',
        waitForIt: true,  // Wait for Mixpeek before starting auction
        params: {
          apiKey: 'sk_your_api_key_here',
          collectionId: 'col_your_collection_id',
          featureExtractors: ['taxonomy'],
          mode: 'auto',
          timeout: 250,
          cacheTTL: 300
        }
      }]
    }
  });

  // Add your ad units
  pbjs.addAdUnits([...]);

  // Request bids
  pbjs.requestBids({...});
});
```

### Health Check Configuration

The adapter includes smart health check functionality:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_your_api_key_here',
        collectionId: 'col_your_collection_id',
        
        // Health check modes:
        healthCheck: 'lazy',  // Default - check on first request (recommended)
        // healthCheck: 'eager', // Check immediately on init (adds ~200-500ms)
        // healthCheck: false,   // Skip health check (max performance)
      }
    }]
  }
});
```

**Recommended:** Use `lazy` (default) for production - validates API without impacting page load.

See [Health Check Documentation](health-check.md) for details.

### Advanced Configuration

For more control, use the full configuration object:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,  // Max time to wait for all RTD providers
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,  // Wait for this provider before auction
      params: {
        // Required
        apiKey: 'sk_your_api_key_here',
        collectionId: 'col_your_collection_id',
        
        // Optional
        endpoint: 'https://api.mixpeek.com',
        namespace: 'production',
        
        // Content extraction
        mode: 'auto', // 'auto', 'page', 'video', or 'image'
        videoSelector: 'video', // CSS selector for video elements
        maxImages: 5, // Max images to analyze
        
        // Feature extractors
        featureExtractors: [
          'taxonomy',
          'brand-safety',
          'keywords',
          'sentiment'
        ],
        
        // Or with custom configuration
        customExtractors: [
          {
            feature_extractor_id: 'taxonomy',
            payload: {
              version: '3.0',
              threshold: 0.7
            }
          }
        ],
        
        // Performance
        timeout: 250, // ms
        retryAttempts: 2,
        
        // Caching
        enableCache: true,
        cacheTTL: 300, // seconds
        
        // Debugging
        debug: false
      }
    }]
  }
});
```

## Integration Patterns

### Pattern 1: Page-Level Context (Default)

Best for article pages, blog posts, and content sites:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        mode: 'page',
        featureExtractors: ['taxonomy', 'brand-safety']
      }
    }]
  }
});
```

The adapter will automatically extract:
- Page URL and title
- Meta descriptions and keywords
- Body text content
- Open Graph tags
- Structured data (JSON-LD)

### Pattern 2: Video Context

For video content pages or video players:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 300,  // Longer delay for video processing
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        mode: 'video',
        videoSelector: '#main-video', // Specific video element
        featureExtractors: ['taxonomy', 'scene-detection']
      }
    }]
  }
});
```

The adapter will extract:
- Video source URL
- Video metadata (title, description)
- Video dimensions and duration
- Poster image
- Frame snapshots (optional)

### Pattern 3: Image Gallery

For image-heavy pages:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        mode: 'image',
        maxImages: 10,
        featureExtractors: ['taxonomy', 'image-labels']
      }
    }]
  }
});
```

### Pattern 4: Auto-Detection

Let the adapter automatically detect the content type:

```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        mode: 'auto', // Automatically detects page, video, or image content
        featureExtractors: ['taxonomy', 'brand-safety', 'keywords']
      }
    }]
  }
});
```

## Event Handling

Listen to Mixpeek events for debugging and analytics:

```javascript
pbjs.que.push(function() {
  // Context successfully loaded
  pbjs.onEvent('mixpeekContextReady', function(context) {
    console.log('Context:', context);
    
    // Send to analytics
    gtag('event', 'mixpeek_context', {
      taxonomy: context.taxonomy.label,
      score: context.taxonomy.score,
      brand_safety: context.brandSafety
    });
  });

  // Error occurred
  pbjs.onEvent('mixpeekContextError', function(error) {
    console.error('Mixpeek error:', error);
  });

  // Cache hit
  pbjs.onEvent('mixpeekContextCached', function(context) {
    console.log('Using cached context');
  });

  // API request made
  pbjs.onEvent('mixpeekApiRequest', function(data) {
    console.log('API request:', data);
  });

  // API response received
  pbjs.onEvent('mixpeekApiResponse', function(data) {
    console.log('API response:', data);
  });
});
```

## Targeting Keys

The adapter injects the following targeting keys into your ad requests:

| Key | Description | Example |
|-----|-------------|---------|
| `hb_mixpeek_taxonomy` | IAB taxonomy code | `IAB12-6` |
| `hb_mixpeek_category` | Human-readable category | `Technology > Mobile Phones` |
| `hb_mixpeek_node` | Taxonomy node ID | `node_mobile_phones` |
| `hb_mixpeek_path` | Category hierarchy | `tech/mobile/phones` |
| `hb_mixpeek_score` | Confidence score | `0.92` |
| `hb_mixpeek_safety` | Brand safety score | `0.98` |
| `hb_mixpeek_keywords` | Extracted keywords | `mobile,AI,5G` |
| `hb_mixpeek_sentiment` | Content sentiment | `positive` |
| `hb_mixpeek_embed` | Embedding ID | `emb_abc123` |

These keys are available to all bidders and can be used for:
- Contextual targeting
- Brand safety filtering
- Bid price optimization
- Reporting and analytics

## Testing

### 1. Test Configuration

First, verify your configuration is valid:

```javascript
// Enable debug mode
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        debug: true // Enable verbose logging
      }
    }]
  }
});
```

Open your browser console and look for:
```
[mixpeek] Initializing Mixpeek Context Adapter
[mixpeek] Configuration { ... }
[mixpeek] Mixpeek Context Adapter initialized successfully
```

### 2. Test Content Extraction

Check that content is being extracted properly:

```javascript
// Access the adapter directly
const context = await window.MixpeekContextAdapter.getContext();
console.log('Extracted context:', context);
```

### 3. Test API Connection

Verify the API is responding:

```javascript
const health = await window.MixpeekContextAdapter.healthCheck();
console.log('Health check:', health);
```

### 4. Test Targeting Keys

Inspect the enriched ad units:

```javascript
pbjs.onEvent('beforeRequestBids', function(bidRequest) {
  console.log('Ad units:', bidRequest.adUnits);
  
  // Check for Mixpeek keys
  const firstUnit = bidRequest.adUnits[0];
  console.log('Targeting keys:', firstUnit.ortb2Imp.ext.data);
});
```

### 5. Test Caching

Verify caching is working:

```javascript
// First request - should hit API
await window.MixpeekContextAdapter.getContext();

// Second request - should use cache
await window.MixpeekContextAdapter.getContext();

// Check cache stats
const stats = window.MixpeekContextAdapter.getCacheStats();
console.log('Cache stats:', stats);
```

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Remove `debug: true` from configuration
- [ ] Set appropriate `timeout` (250ms recommended)
- [ ] Configure `cacheTTL` based on your content update frequency
- [ ] Test on multiple page types (articles, videos, galleries)
- [ ] Verify targeting keys are reaching bidders
- [ ] Monitor Mixpeek API usage in your dashboard
- [ ] Set up error monitoring for `mixpeekContextError` events
- [ ] Configure fallback behavior for API failures

### Environment Variables

Store sensitive configuration in environment variables:

```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: window.MIXPEEK_API_KEY, // Injected server-side
    collectionId: window.MIXPEEK_COLLECTION_ID,
    namespace: window.MIXPEEK_NAMESPACE
  }
});
```

### Content Security Policy

If using CSP, add Mixpeek API to your policy:

```
connect-src 'self' https://api.mixpeek.com;
```

## Troubleshooting

### Adapter Not Initializing

**Symptom**: No logs in console, no context enrichment

**Solutions**:
1. Verify Prebid.js is loaded before the adapter
2. Check for JavaScript errors in console
3. Ensure configuration is inside `pbjs.que.push()`

```javascript
// Correct
pbjs.que.push(function() {
  pbjs.setConfig({ mixpeek: {...} });
});

// Incorrect
pbjs.setConfig({ mixpeek: {...} }); // Too early
```

### API Errors (401 Unauthorized)

**Symptom**: `mixpeekContextError` events with 401 status

**Solutions**:
1. Verify your API key is correct
2. Check that the API key hasn't expired
3. Ensure the API key has the right permissions

### API Timeout

**Symptom**: Requests timing out, no context returned

**Solutions**:
1. Increase `timeout` value (but keep under 300ms)
2. Check your network connection
3. Verify Mixpeek API status

### No Content Extracted

**Symptom**: Empty context, no classification

**Solutions**:
1. Check page has sufficient content (min 100 characters)
2. Verify the correct `mode` is set
3. For video mode, check `videoSelector` matches your video element
4. Look for errors in content extractors

### Cache Not Working

**Symptom**: Every request hits the API, no cache hits

**Solutions**:
1. Ensure `enableCache: true`
2. Check localStorage is available (not blocked)
3. Verify content isn't changing between requests

### Targeting Keys Not Appearing

**Symptom**: Ad requests don't include Mixpeek keys

**Solutions**:
1. Enable `debug: true` and check for errors
2. Verify context is loaded before bid requests
3. Check the `beforeRequestBids` event is firing
4. Inspect `bidRequest.adUnits[0].ortb2Imp.ext.data`

## Support

- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **Email**: support@mixpeek.com
- **GitHub Issues**: [github.com/mixpeek/prebid-contextual-adapter/issues](https://github.com/mixpeek/prebid-contextual-adapter/issues)
- **Slack Community**: [Join our Slack](https://mixpeek.com/slack)

## Next Steps

- [API Reference](api-reference.md) - Detailed API documentation
- [Examples](../examples/) - Sample implementations
- [Migration Guide](migration-guide.md) - Upgrading from older versions

