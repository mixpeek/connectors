# API Endpoint Configuration

The Mixpeek adapter can work with different API endpoints. This is useful for development, staging, and production environments.

## Available Endpoints

| Environment | URL | Use Case |
|-------------|-----|----------|
| **Development** | `https://api.mixpeek.com` | Testing and development |
| **Production** | `https://api.mixpeek.com` | Production deployment |
| **Local** | `http://localhost:8000` | Local development |

## Quick Configuration

### Method 1: Environment Variable (Recommended)

Set the endpoint before running tests or building:

```bash
# Use production API endpoint (recommended)
export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com

# Or use production
export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com

# Or use local server
export MIXPEEK_API_ENDPOINT=http://localhost:8000
```

### Method 2: Configuration File

Edit `.mixpeek.config.js`:

```javascript
module.exports = {
  // Option 1: Direct URL
  endpoint: 'https://api.mixpeek.com',
  
  // Option 2: Use predefined names
  endpoint: 'production', // or 'local'
  
  // Your credentials
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  
  // Other settings...
  timeout: 5000,
  debug: true
}
```

### Method 3: Prebid Configuration

Set the endpoint directly in your Prebid setup:

```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'YOUR_API_KEY',
    collectionId: 'YOUR_COLLECTION_ID',
    endpoint: 'https://api.mixpeek.com', // Production API
    timeout: 5000,
    featureExtractors: ['taxonomy']
  }
});
```

### Method 4: Window Global (Browser)

For browser-based configuration:

```html
<script>
  // Set before loading the adapter
  window.MIXPEEK_API_ENDPOINT = 'https://api.mixpeek.com';
</script>
<script src="mixpeekContextAdapter.js"></script>
```

## Switching Between Endpoints

### For Development & Testing

```bash
# Set production endpoint
export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
export MIXPEEK_API_KEY=your_dev_key

# Validate setup
npm run validate

# Run tests
npm run test:live
```

### For Production Deployment

```bash
# Set production endpoint
export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
export MIXPEEK_API_KEY=your_prod_key

# Build
npm run build

# Test
npm run test:live
```

### Quick Switch Script

Create a shell script for easy switching:

```bash
#!/bin/bash
# switch-endpoint.sh

case "$1" in
  prod|production)
    export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
    echo "✅ Switched to production: https://api.mixpeek.com"
    ;;
  local)
    export MIXPEEK_API_ENDPOINT=http://localhost:8000
    echo "✅ Switched to local: http://localhost:8000"
    ;;
  *)
    echo "Usage: source switch-endpoint.sh [dev|prod|local]"
    return 1
    ;;
esac

# Usage:
# source switch-endpoint.sh dev
# npm run test:live
```

## Environment-Specific Configuration

### Development (.env.development)

```bash
MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
MIXPEEK_API_KEY=sk_dev_key
MIXPEEK_COLLECTION_ID=col_dev_collection
MIXPEEK_NAMESPACE=development
```

### Production (.env.production)

```bash
MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
MIXPEEK_API_KEY=sk_prod_key
MIXPEEK_COLLECTION_ID=col_prod_collection
MIXPEEK_NAMESPACE=production
```

Load with:

```bash
# Development
export $(cat .env.development | xargs)
npm run test:live

# Production
export $(cat .env.production | xargs)
npm run build
```

## Verifying Current Endpoint

Check which endpoint is configured:

```bash
# Validation script shows current endpoint
npm run validate
```

Output will show:
```
📋 Configuration Check:
   API Key: ✅ Set
   Collection ID: ✅ Set
   Namespace: ⚠️  Not set (using default)
   Endpoint: https://api.mixpeek.com  👈 Current endpoint
```

## CI/CD Configuration

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test against production API
        env:
          MIXPEEK_API_ENDPOINT: https://api.mixpeek.com
          MIXPEEK_API_KEY: ${{ secrets.MIXPEEK_PROD_API_KEY }}
        run: npm run test:live

  test-prod:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Test against production
        env:
          MIXPEEK_API_ENDPOINT: https://api.mixpeek.com
          MIXPEEK_API_KEY: ${{ secrets.MIXPEEK_PROD_API_KEY }}
        run: npm run test:live
```

## Performance Considerations

Different endpoints may have different performance characteristics:

| Endpoint | Typical Latency | Notes |
|----------|----------------|-------|
| Development | 500-2000ms | Slower, may cold start |
| Production | 100-500ms | Optimized, globally distributed |
| Local | 10-50ms | Fastest, no network latency |

Adjust timeout accordingly:

```javascript
pbjs.setConfig({
  mixpeek: {
    endpoint: 'https://api.mixpeek.com',
    timeout: 250
  }
});
```

## Troubleshooting

### "Cannot connect to endpoint"

Check if the API is reachable:

```bash
curl https://api.mixpeek.com/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

### "Wrong endpoint being used"

Verify environment variable is set:

```bash
echo $MIXPEEK_API_ENDPOINT
```

Clear and reset if needed:

```bash
unset MIXPEEK_API_ENDPOINT
export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
```

### "Different results between endpoints"

Development and production may have:
- Different feature extractor versions
- Different taxonomy versions
- Different data/collections

Use the same collection ID across environments when possible.

## Current Default

The adapter defaults to the **production API**:

```
https://api.mixpeek.com
```

This can be changed in:
- `.env.example` - Default environment file
- `.mixpeek.config.js` - Configuration file
- `src/config/constants.js` - Code default
- `tests/live-api/setup.js` - Test default

## Support

For endpoint-specific issues:
- **Production API**: Check [https://status.mixpeek.com](https://status.mixpeek.com)
- **General help**: info@mixpeek.com

