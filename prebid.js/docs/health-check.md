# Health Check Configuration

The Mixpeek Context Adapter includes configurable health check functionality to validate API connectivity and credentials.

## Health Check Modes

### 1. Lazy Health Check (Default - Recommended)

Performs health check on the **first context request** rather than initialization.

**Pros:**
- ✅ No page load impact
- ✅ Validates API before first real use
- ✅ Catches issues early but not too early
- ✅ Best for production

**Configuration:**
```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'YOUR_API_KEY',
    collectionId: 'YOUR_COLLECTION_ID',
    healthCheck: 'lazy' // Default
  }
});
```

**Behavior:**
```
Page Load
  ↓
Prebid Init
  ↓
Mixpeek Init (fast, no API call)
  ↓
First Bid Request
  ↓
Health Check → Context Request → Enriched Bid
```

### 2. Eager Health Check

Performs health check **immediately during initialization**.

**Pros:**
- ✅ Validates connectivity early
- ✅ Fail fast if API is down
- ✅ Good for debugging

**Cons:**
- ⚠️ Adds ~200-500ms to initialization
- ⚠️ Extra HTTP request on every page load
- ⚠️ May impact page load metrics

**Configuration:**
```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'YOUR_API_KEY',
    collectionId: 'YOUR_COLLECTION_ID',
    healthCheck: 'eager'
  }
});
```

**Use When:**
- Testing and debugging
- Development environment
- You need immediate validation

### 3. No Health Check

Skips health check entirely.

**Pros:**
- ✅ Minimal overhead
- ✅ Fastest initialization

**Cons:**
- ⚠️ No early warning of API issues
- ⚠️ Errors only caught during enrichment

**Configuration:**
```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'YOUR_API_KEY',
    collectionId: 'YOUR_COLLECTION_ID',
    healthCheck: false
  }
});
```

**Use When:**
- Maximum performance is critical
- You have external monitoring
- API reliability is guaranteed

## Health Check Response

### Success

```javascript
{
  healthy: true,
  status: 'ok',
  version: '0.81',
  latency: 234, // milliseconds
  message: 'API responding in 234ms'
}
```

### Failure

```javascript
{
  healthy: false,
  error: 'Network error: ECONNREFUSED',
  message: 'API health check failed'
}
```

## Monitoring Health Checks

### Listen to Health Check Events

```javascript
pbjs.onEvent('mixpeekHealthCheck', function(result) {
  if (result.healthy) {
    console.log('✅ Mixpeek API healthy:', result.latency + 'ms');
    
    // Send to analytics
    gtag('event', 'mixpeek_health', {
      status: 'healthy',
      latency: result.latency,
      version: result.version
    });
  } else {
    console.error('❌ Mixpeek API unhealthy:', result.error);
    
    // Alert monitoring system
    reportError('mixpeek_health_failed', result.error);
  }
});
```

### Check Health Status Manually

```javascript
// After initialization
const health = await window.MixpeekContextAdapter.healthCheck();

if (health.status === 'ok') {
  console.log('API is healthy');
} else {
  console.error('API is unhealthy:', health);
}
```

## Recommended Configuration by Environment

### Development

```javascript
pbjs.setConfig({
  mixpeek: {
    endpoint: 'https://api.mixpeek.com',
    healthCheck: 'eager', // Validate immediately
    debug: true,
    timeout: 5000
  }
});
```

### Staging

```javascript
pbjs.setConfig({
  mixpeek: {
    endpoint: 'https://api.mixpeek.com',
    healthCheck: 'lazy', // Balance validation & performance
    debug: true,
    timeout: 3000
  }
});
```

### Production

```javascript
pbjs.setConfig({
  mixpeek: {
    endpoint: 'https://api.mixpeek.com',
    healthCheck: 'lazy', // Recommended
    debug: false,
    timeout: 250
  }
});
```

### High-Performance Production

```javascript
pbjs.setConfig({
  mixpeek: {
    endpoint: 'https://api.mixpeek.com',
    healthCheck: false, // Skip for max performance
    debug: false,
    timeout: 250
  }
});
```

## Performance Impact

| Mode | Init Time | First Request | Subsequent Requests |
|------|-----------|---------------|---------------------|
| `false` | +0ms | +0ms | +0ms |
| `lazy` | +0ms | +200-500ms (once) | +0ms |
| `eager` | +200-500ms | +0ms | +0ms |

**Note:** Health check latency varies by endpoint:
- Production API: ~200-300ms
- Development server: ~400-800ms
- Local server: ~10-50ms

## Error Handling

Health check failures **do not block** the adapter:

```javascript
// Even if health check fails, adapter continues
pbjs.setConfig({
  mixpeek: {
    healthCheck: 'eager'
  }
});

// If API is down:
// 1. Health check logs warning
// 2. Initialization completes successfully
// 3. First context request will fail gracefully
// 4. Ad auction proceeds without enrichment
```

This ensures **resilient behavior** where API issues never break your ads.

## Debugging Health Issues

### Check Network

```bash
# Test endpoint manually
curl https://api.mixpeek.com/v1/health

# With authentication
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.mixpeek.com/v1/health
```

### Enable Debug Logging

```javascript
pbjs.setConfig({
  mixpeek: {
    healthCheck: 'eager',
    debug: true // Shows detailed health check logs
  }
});
```

Console output:
```
[mixpeek] Performing health check...
[mixpeek] API Request: GET https://api.mixpeek.com/v1/health
[mixpeek] API Response: { status: 200, ... }
[mixpeek] Health check passed: API responding in 234ms
```

### Monitor in Production

```javascript
// Track health check metrics
let healthChecks = {
  passed: 0,
  failed: 0,
  totalLatency: 0
};

pbjs.onEvent('mixpeekHealthCheck', function(result) {
  if (result.healthy) {
    healthChecks.passed++;
    healthChecks.totalLatency += result.latency;
  } else {
    healthChecks.failed++;
  }
  
  // Report to analytics every 100 checks
  if ((healthChecks.passed + healthChecks.failed) % 100 === 0) {
    const avgLatency = healthChecks.totalLatency / healthChecks.passed;
    const successRate = healthChecks.passed / (healthChecks.passed + healthChecks.failed);
    
    analytics.track('mixpeek_health_stats', {
      success_rate: successRate,
      avg_latency: avgLatency,
      total_checks: healthChecks.passed + healthChecks.failed
    });
  }
});
```

## Best Practices

1. **Use `lazy` in production** - Best balance of validation and performance
2. **Use `eager` in development** - Immediate feedback on configuration issues
3. **Monitor health events** - Track API reliability in production
4. **Set appropriate timeouts** - Higher for dev servers, lower for production
5. **Have fallback behavior** - Never let health checks block your ads

## FAQ

### Q: Will health checks slow down my page?

**A:** With `lazy` mode (default), health checks add **0ms to page load** and ~200-500ms to the first bid request only. Subsequent requests use cache.

### Q: What if the health check fails?

**A:** The adapter continues to work. The first context enrichment will fail gracefully, and your ad auction proceeds without contextual data. The adapter will retry on subsequent requests.

### Q: Should I use health checks in production?

**A:** Yes, use `lazy` mode. It provides early warning of API issues with minimal performance impact.

### Q: Can I disable health checks completely?

**A:** Yes, set `healthCheck: false`. This is safe if you have external monitoring and prioritize maximum performance.

### Q: How do I test if health checks are working?

**A:** Enable debug mode and check console logs, or listen to `mixpeekHealthCheck` events.

## Related

- [Configuration Options](../README.md#configuration-options)
- [API Reference](api-reference.md)
- [Error Handling](integration-guide.md#error-handling)
- [Performance Optimization](integration-guide.md#performance)

