# Quick Start Guide

Get the Mixpeek Context Adapter running in 5 minutes.

## 1. Get Your API Key

1. Sign up at [mixpeek.com/start](https://mixpeek.com/start)
2. Navigate to your dashboard
3. Generate an API key (starts with `sk_`)
4. Copy the API key

## 2. Set Up Environment

```bash
# Clone or navigate to the repository
cd /path/to/prebid.js

# Install dependencies
npm install

# Set your API credentials
export MIXPEEK_API_KEY="sk_your_api_key_here"

# Use production API endpoint
export MIXPEEK_API_ENDPOINT="https://api.mixpeek.com"

# Optional: Set a collection ID (will create if not set)
export MIXPEEK_COLLECTION_ID="col_your_collection_id"
```

> **Note**: Use the production API: `https://api.mixpeek.com`.

## 3. Validate Setup

```bash
npm run validate
```

Expected output:
```
🔍 Mixpeek API Setup Validation

================================

📋 Configuration Check:
   API Key: ✅ Set
   Collection ID: ⚠️  Not set (will create)
   Namespace: ⚠️  Not set (using default)
   Endpoint: https://api.mixpeek.com

🌐 Testing API Connection...

✅ API Connection: Success
   Status: healthy

🧩 Testing Feature Extractors Endpoint...

✅ Feature Extractors: Available
   Found 12 extractors
   Available: taxonomy, brand-safety, keywords, sentiment, clustering

================================

✅ Setup validation complete!
```

## 4. Run Tests

### Unit Tests (No API Required)

```bash
npm test
```

### Live API Tests

```bash
npm run test:live
```

### All Tests

```bash
npm run test:all
```

## 5. Build the Adapter

```bash
npm run build
```

Output: `dist/mixpeekContextAdapter.js`

## 6. Try the Example

```bash
# Update the example with your credentials
# Edit: examples/publisher-demo/index.html

# Run the demo
cd examples/publisher-demo
npm install
npm start

# Open http://localhost:8080
```

## 7. Integrate with Your Site

### Basic Integration

```html
<!-- Load Prebid.js -->
<script src="https://cdn.jsdelivr.net/npm/prebid.js@latest/dist/prebid.js"></script>

<!-- Load Mixpeek Adapter -->
<script src="path/to/mixpeekContextAdapter.js"></script>

<script>
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

pbjs.que.push(function() {
  // Configure Mixpeek as an RTD provider
  pbjs.setConfig({
    realTimeData: {
      auctionDelay: 250,  // Max time to wait for contextual data
      dataProviders: [{
        name: 'mixpeek',
        waitForIt: true,  // Wait for Mixpeek before starting auction
        params: {
          apiKey: 'YOUR_API_KEY',
          collectionId: 'YOUR_COLLECTION_ID',
          endpoint: 'https://api.mixpeek.com', // Production API
          featureExtractors: ['taxonomy'],
          mode: 'auto',
          timeout: 5000, // Higher timeout for dev server
          cacheTTL: 300
        }
      }]
    }
  });

  // Add your ad units
  pbjs.addAdUnits([
    {
      code: 'div-banner-1',
      mediaTypes: {
        banner: { sizes: [[300, 250]] }
      },
      bids: [
        {
          bidder: 'rubicon',
          params: { /* ... */ }
        }
      ]
    }
  ]);

  // Request bids
  pbjs.requestBids({
    bidsBackHandler: function(bids) {
      // Your bid handling code
      // Bids now include Mixpeek contextual data in ortb2
    }
  });
});
</script>
```

## Troubleshooting

### "API key not set"

```bash
export MIXPEEK_API_KEY="sk_your_key"
npm run validate
```

### "Collection not found"

Create a collection:

```bash
curl -X POST https://api.mixpeek.com/v1/collections \
  -H "Authorization: Bearer $MIXPEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prebid-contextual",
    "description": "Contextual targeting for Prebid"
  }'
```

Save the `collection_id` and export it:

```bash
export MIXPEEK_COLLECTION_ID="col_abc123"
```

### Tests Timing Out

Increase timeout in `jest.config.live.js`:

```javascript
testTimeout: 60000 // 60 seconds
```

## Next Steps

- 📚 [Integration Guide](docs/integration-guide.md) - Detailed integration instructions
- 📖 [API Reference](docs/api-reference.md) - Complete API documentation
- 🧪 [Testing Guide](TESTING.md) - Comprehensive testing guide
- 🎯 [Examples](examples/) - Sample implementations

## Support

- **Documentation**: https://docs.mixpeek.com
- **Email**: support@mixpeek.com
- **GitHub Issues**: https://github.com/mixpeek/prebid/issues

## What's Next?

The adapter is now set up and ready to use! Here's what happens:

1. **Page loads** with Prebid and Mixpeek adapter
2. **Content is extracted** from the page (text, images, video)
3. **Mixpeek API classifies** the content into IAB categories
4. **Targeting keys** are injected into bid requests
5. **Bidders receive** enriched requests with contextual signals
6. **Ads are served** based on content relevance

All of this happens in <250ms without blocking your ad auction! 🚀

