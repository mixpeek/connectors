# Live API Integration Tests

These tests run against the actual Mixpeek API to verify real-world integration.

## Prerequisites

1. **Mixpeek Account**: Sign up at [mixpeek.com/start](https://mixpeek.com/start)
2. **API Key**: Generate an API key from your dashboard
3. **Collection**: Create a collection with taxonomy feature extractor enabled

## Setup

### 1. Set Environment Variables

```bash
# Required
export MIXPEEK_API_KEY="sk_your_api_key_here"

# Optional (will create if not provided)
export MIXPEEK_COLLECTION_ID="col_your_collection_id"
export MIXPEEK_NAMESPACE="test"
```

### 2. Create a Collection (if needed)

```bash
curl -X POST https://api.mixpeek.com/v1/collections \
  -H "Authorization: Bearer $MIXPEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prebid-test",
    "description": "Test collection for Prebid integration"
  }'
```

Save the `collection_id` from the response.

## Running Tests

### Run All Live API Tests

```bash
npm run test:live
```

### Run Specific Test Suite

```bash
# API client tests only
npx jest tests/live-api/api-client.test.js

# Adapter integration tests only
npx jest tests/live-api/adapter.test.js
```

### Run with Verbose Output

```bash
npm run test:live -- --verbose
```

## What Gets Tested

### API Client Tests (`api-client.test.js`)

- ✅ Health check connectivity
- ✅ Feature extractor discovery
- ✅ Document creation with page content
- ✅ Document creation with video content
- ✅ Document retrieval
- ✅ Taxonomy enrichment
- ✅ Error handling (invalid IDs, timeouts)

### Adapter Integration Tests (`adapter.test.js`)

- ✅ Initialization with live credentials
- ✅ Page content extraction and processing
- ✅ Context caching and retrieval
- ✅ Ad unit enrichment with targeting keys
- ✅ Performance timing
- ✅ Error recovery and graceful degradation

## Expected Output

```
 PASS  tests/live-api/api-client.test.js
  Mixpeek Client - Live API
    Health Check
      ✓ should connect to API successfully (245ms)
    Feature Extractors
      ✓ should list available feature extractors (412ms)
    Document Processing
      ✓ should create document with page content (1823ms)
      ✓ should retrieve created document (156ms)

 PASS  tests/live-api/adapter.test.js
  Mixpeek Adapter - Live API Integration
    Initialization
      ✓ should initialize with live API credentials (23ms)
    Context Extraction and Processing
      ✓ should extract and process page context (1654ms)
      ✓ should cache context for subsequent requests (1889ms)
    Ad Unit Enrichment
      ✓ should enrich ad units with live contextual data (1702ms)

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
Time:        8.234s
```

## Troubleshooting

### "API key not set" Warning

```
⚠️  Warning: MIXPEEK_API_KEY not set. Live API tests will be skipped.
```

**Solution**: Set the `MIXPEEK_API_KEY` environment variable.

### "No collection ID configured"

```
⏭️  Skipping - no collection ID configured
```

**Solution**: Either:
1. Create a collection manually and set `MIXPEEK_COLLECTION_ID`
2. The tests will create one automatically (if API key has permissions)

### API Timeout Errors

If tests are timing out, the API might be slow or unavailable.

**Solutions**:
- Check Mixpeek API status
- Increase timeout in `setup.js` (default is 30 seconds)
- Try again later

### 401 Unauthorized

```
Error: API error: 401 Unauthorized
```

**Solution**: Verify your API key is correct and has not expired.

### 404 Collection Not Found

```
Error: API error: 404 Not Found
```

**Solution**: Verify your collection ID is correct:

```bash
curl https://api.mixpeek.com/v1/collections/$MIXPEEK_COLLECTION_ID \
  -H "Authorization: Bearer $MIXPEEK_API_KEY"
```

## Performance Benchmarks

Expected latency (live API):

- Health check: ~200-500ms
- List extractors: ~300-600ms
- Create document: ~1500-3000ms
- Retrieve document: ~100-300ms
- Full enrichment: ~1500-4000ms

Cached requests: <10ms

## Clean Up

After running tests, you may want to clean up test documents:

```bash
# List documents in collection
curl https://api.mixpeek.com/v1/collections/$MIXPEEK_COLLECTION_ID/documents \
  -H "Authorization: Bearer $MIXPEEK_API_KEY"

# Delete test collection (optional)
curl -X DELETE https://api.mixpeek.com/v1/collections/$MIXPEEK_COLLECTION_ID \
  -H "Authorization: Bearer $MIXPEEK_API_KEY"
```

## CI/CD Integration

To run these tests in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Live API Tests
  env:
    MIXPEEK_API_KEY: ${{ secrets.MIXPEEK_API_KEY }}
    MIXPEEK_COLLECTION_ID: ${{ secrets.MIXPEEK_COLLECTION_ID }}
  run: npm run test:live
```

## Support

For issues with the live API or tests:

- **Documentation**: https://docs.mixpeek.com
- **API Status**: https://status.mixpeek.com
- **Support**: support@mixpeek.com

