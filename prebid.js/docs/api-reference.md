# API Reference

Complete API documentation for the Mixpeek Context Adapter.

## Table of Contents

- [Configuration](#configuration)
- [Adapter Methods](#adapter-methods)
- [Events](#events)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)

## Configuration

### `pbjs.setConfig({ mixpeek: {...} })`

Configure the Mixpeek Context Adapter.

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `apiKey` | string | Your Mixpeek API key (starts with `sk_`) |
| `collectionId` | string | Mixpeek collection ID (starts with `col_`) |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `endpoint` | string | `https://api.mixpeek.com` | Mixpeek API endpoint |
| `namespace` | string | `null` | Optional namespace for data isolation |
| `mode` | string | `auto` | Content mode: `auto`, `page`, `video`, or `image` |
| `videoSelector` | string | `video` | CSS selector for video elements |
| `maxImages` | number | `5` | Maximum number of images to analyze |
| `featureExtractors` | array | `['taxonomy']` | Feature extractors to use |
| `customExtractors` | array | `[]` | Custom feature extractor configurations |
| `timeout` | number | `250` | API request timeout in milliseconds |
| `retryAttempts` | number | `2` | Number of retry attempts on failure |
| `enableCache` | boolean | `true` | Enable local caching |
| `cacheTTL` | number | `300` | Cache time-to-live in seconds |
| `debug` | boolean | `false` | Enable debug logging |
| `batchSize` | number | `1` | Number of concurrent requests |

#### Example

```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'sk_1234567890abcdef',
    collectionId: 'col_abc123xyz',
    namespace: 'production',
    mode: 'auto',
    featureExtractors: ['taxonomy', 'brand-safety', 'keywords'],
    timeout: 250,
    cacheTTL: 300,
    enableCache: true,
    debug: false
  }
});
```

## Adapter Methods

### Direct Access

The adapter is available globally as `window.MixpeekContextAdapter`.

### `init(config)`

Initialize the adapter with configuration.

**Parameters:**
- `config` (object): Configuration object (same as setConfig)

**Returns:** `boolean` - Success status

**Example:**
```javascript
const success = window.MixpeekContextAdapter.init({
  apiKey: 'sk_...',
  collectionId: 'col_...'
});
```

### `enrichAdUnits(adUnits)`

Enrich ad units with contextual data.

**Parameters:**
- `adUnits` (array): Array of Prebid ad unit objects

**Returns:** `Promise<array>` - Enriched ad units

**Example:**
```javascript
const enriched = await window.MixpeekContextAdapter.enrichAdUnits(adUnits);
```

### `getContext()`

Get contextual data for the current page.

**Returns:** `Promise<object>` - Context data object

**Example:**
```javascript
const context = await window.MixpeekContextAdapter.getContext();
console.log(context.taxonomy.label); // "IAB12-6: Mobile Phones"
```

### `getContextData()`

Get the most recent context data (synchronous).

**Returns:** `object|null` - Context data or null

**Example:**
```javascript
const context = window.MixpeekContextAdapter.getContextData();
if (context) {
  console.log(context.taxonomy);
}
```

### `clearCache()`

Clear all cached context data.

**Example:**
```javascript
window.MixpeekContextAdapter.clearCache();
```

### `getCacheStats()`

Get cache statistics.

**Returns:** `object` - Cache statistics

**Example:**
```javascript
const stats = window.MixpeekContextAdapter.getCacheStats();
console.log(stats);
// {
//   memoryCount: 5,
//   localStorageCount: 3,
//   localStorageSize: 12450,
//   ttl: 300
// }
```

### `healthCheck()`

Perform a health check on the Mixpeek API.

**Returns:** `Promise<object>` - Health status

**Example:**
```javascript
const health = await window.MixpeekContextAdapter.healthCheck();
console.log(health.status); // "ok"
```

### `on(event, callback)`

Register an event listener.

**Parameters:**
- `event` (string): Event name
- `callback` (function): Callback function

**Example:**
```javascript
window.MixpeekContextAdapter.on('mixpeekContextReady', function(context) {
  console.log('Context ready:', context);
});
```

## Events

All events are emitted through Prebid's event system and can be listened to via `pbjs.onEvent()` or `adapter.on()`.

### `mixpeekContextReady`

Fired when context data is successfully loaded.

**Callback Parameters:**
- `context` (object): Context data object

**Example:**
```javascript
pbjs.onEvent('mixpeekContextReady', function(context) {
  console.log('Taxonomy:', context.taxonomy.label);
  console.log('Score:', context.taxonomy.score);
  console.log('Brand Safety:', context.brandSafety);
});
```

### `mixpeekContextError`

Fired when an error occurs during context enrichment.

**Callback Parameters:**
- `error` (object): Error object

**Example:**
```javascript
pbjs.onEvent('mixpeekContextError', function(error) {
  console.error('Error:', error.message);
  console.error('Code:', error.code);
});
```

### `mixpeekContextCached`

Fired when cached context data is used.

**Callback Parameters:**
- `context` (object): Cached context data

**Example:**
```javascript
pbjs.onEvent('mixpeekContextCached', function(context) {
  console.log('Using cached context');
});
```

### `mixpeekApiRequest`

Fired when an API request is made.

**Callback Parameters:**
- `data` (object): Request data

**Example:**
```javascript
pbjs.onEvent('mixpeekApiRequest', function(data) {
  console.log('API request:', data.content, data.mode);
});
```

### `mixpeekApiResponse`

Fired when an API response is received.

**Callback Parameters:**
- `data` (object): Response data

**Example:**
```javascript
pbjs.onEvent('mixpeekApiResponse', function(data) {
  console.log('Document ID:', data.document_id);
});
```

## Data Structures

### Context Object

The context object returned by `getContext()` and `mixpeekContextReady` event:

```typescript
{
  documentId: string,           // Mixpeek document ID
  mode: string,                 // Content mode: 'page', 'video', or 'image'
  content: {
    url: string,                // Content URL
    title: string,              // Content title
    type: string                // Content type
  },
  taxonomy?: {
    label: string,              // Taxonomy label (e.g., "IAB12-6: Mobile Phones")
    nodeId: string,             // Taxonomy node ID
    path: string[],             // Hierarchical path
    score: number,              // Confidence score (0-1)
    all: array                  // All taxonomy results
  },
  brandSafety?: number | object, // Brand safety score or object
  keywords?: string[],          // Extracted keywords
  sentiment?: string | object,  // Sentiment analysis
  embeddingId?: string          // Embedding ID for retrieval
}
```

### Ad Unit Object

Ad units are enriched with Mixpeek targeting keys:

```typescript
{
  code: string,
  mediaTypes: {...},
  ortb2Imp: {
    ext: {
      data: {
        // Current page context
        hb_mixpeek_taxonomy: string,    // IAB taxonomy code
        hb_mixpeek_category: string,    // Category label
        hb_mixpeek_node: string,        // Taxonomy node ID
        hb_mixpeek_path: string,        // Category path
        hb_mixpeek_score: string,       // Confidence score
        hb_mixpeek_safety: string,      // Brand safety score
        hb_mixpeek_keywords: string,    // Comma-separated keywords
        hb_mixpeek_sentiment: string,   // Sentiment label
        hb_mixpeek_embed: string,       // Embedding ID
        
        // Previous ad context (adjacency awareness)
        hb_mixpeek_prev_creative: string,  // Last creative ID
        hb_mixpeek_prev_bidder: string,    // Last winning bidder
        hb_mixpeek_prev_adunit: string,    // Last ad unit code
        hb_mixpeek_prev_cat: string        // Last ad categories (comma-separated)
      }
    }
  },
  bids: [
    {
      bidder: string,
      params: {
        keywords: {
          // Same targeting keys as above
        }
      }
    }
  ]
}
```

### Feature Extractor Configuration

Custom feature extractor configuration:

```typescript
{
  feature_extractor_id: string,  // Feature extractor ID
  payload?: {                    // Optional payload
    [key: string]: any
  }
}
```

**Example:**
```javascript
{
  feature_extractor_id: 'taxonomy',
  payload: {
    version: '3.0',
    threshold: 0.7,
    top_k: 5
  }
}
```

## Error Codes

### `INVALID_CONFIG`

Configuration validation failed.

**Common Causes:**
- Missing `apiKey` or `collectionId`
- Invalid data types
- Negative timeout or cacheTTL

### `API_TIMEOUT`

API request exceeded timeout limit.

**Common Causes:**
- Network latency
- Timeout set too low
- Mixpeek API performance issues

### `API_ERROR`

API returned an error response.

**Common Causes:**
- Invalid API key
- Collection not found
- Rate limit exceeded
- Server error

### `NETWORK_ERROR`

Network request failed.

**Common Causes:**
- No internet connection
- CORS issues
- Firewall blocking requests

### `INVALID_RESPONSE`

API response could not be parsed.

**Common Causes:**
- Malformed JSON
- Unexpected response structure

### `MISSING_CONTENT`

No content could be extracted from the page.

**Common Causes:**
- Empty page
- Content blocked by scripts
- Incorrect content mode

### `CACHE_ERROR`

Cache operation failed.

**Common Causes:**
- localStorage unavailable
- Storage quota exceeded

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check request payload |
| 401 | Unauthorized | Verify API key |
| 403 | Forbidden | Check API permissions |
| 404 | Not Found | Verify collection ID |
| 429 | Rate Limited | Implement backoff |
| 500 | Server Error | Retry request |

## Rate Limits

Default Mixpeek API rate limits:

- **Requests per minute**: 100
- **Requests per hour**: 5,000
- **Burst**: 10 concurrent

Contact Mixpeek to increase limits for production use.

## Best Practices

1. **Cache Effectively**: Set `cacheTTL` based on content update frequency
2. **Handle Errors**: Always listen to `mixpeekContextError` events
3. **Optimize Timeout**: Balance between speed and reliability (250ms recommended)
4. **Monitor Performance**: Track API latency and cache hit rate
5. **Test Thoroughly**: Verify targeting keys reach all bidders
6. **Debug Locally**: Use `debug: true` during development only

## Support

For questions or issues:

- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **Email**: info@mixpeek.com
- **GitHub**: [github.com/mixpeek/prebid](https://github.com/mixpeek/prebid)

