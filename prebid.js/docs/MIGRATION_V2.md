# Migration Guide: v1 → v2 (RTD Module)

> 🔄 **Breaking Changes:** Version 2.0 introduces a proper Prebid RTD submodule structure  
> 📅 **Release Date:** TBD  
> ⏱️ **Migration Time:** ~15-30 minutes

---

## What's Changing?

Version 2.0 restructures the Mixpeek adapter to follow Prebid's official Real-Time Data (RTD) module pattern, matching how modules like **Qortex** and **Rayn** work.

### Key Changes

1. **Configuration Structure** - New `realTimeData.dataProviders[]` pattern
2. **Module Registration** - Now a proper RTD submodule
3. **Data Format** - Enhanced `ortb2.site.content` injection
4. **IAB Mapping** - Built-in IAB Content Taxonomy v3.0 support

---

## Quick Migration Checklist

- [ ] Update configuration from `mixpeek: {}` to `realTimeData.dataProviders[]`
- [ ] Add `auctionDelay` parameter
- [ ] Add `waitForIt` flag
- [ ] Move all params inside `params:` object
- [ ] Test with debug mode enabled
- [ ] Verify `ortb2.site.content` is populated
- [ ] Update IAB mapping with your taxonomy's node_ids (optional)
- [ ] Update tests if using the adapter

---

## Configuration Migration

### v1 (Old) ❌
```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'sk_your_api_key',
    collectionId: 'col_your_collection',
    endpoint: 'https://server-xb24.onrender.com',
    namespace: 'production',
    featureExtractors: ['taxonomy', 'brand-safety'],
    mode: 'auto',
    timeout: 250,
    cacheTTL: 300,
    enableCache: true,
    debug: false
  }
})
```

### v2 (New) ✅
```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,  // NEW: Max time to wait for RTD providers
    dataProviders: [{   // NEW: Array of RTD providers
      name: 'mixpeek',  // NEW: Provider name
      waitForIt: true,  // NEW: Wait for this provider
      params: {         // NEW: Wrap all config in params
        apiKey: 'sk_your_api_key',
        collectionId: 'col_your_collection',
        endpoint: 'https://server-xb24.onrender.com',
        namespace: 'production',
        featureExtractors: ['taxonomy', 'brand-safety'],
        mode: 'auto',
        timeout: 250,
        cacheTTL: 300,
        enableCache: true,
        debug: false
      }
    }]
  }
})
```

---

## Detailed Migration Steps

### Step 1: Update Configuration Structure

**Before (v1):**
```javascript
pbjs.setConfig({
  mixpeek: { /* config */ }
})
```

**After (v2):**
```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: { /* config */ }
    }]
  }
})
```

**Changes:**
1. Replace `mixpeek: {}` with `realTimeData: {}`
2. Add `auctionDelay` at top level
3. Add `dataProviders` array
4. Wrap config in `params: {}`

### Step 2: Add New RTD Parameters

Add these new parameters to control RTD behavior:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `auctionDelay` | number | ❌ | 250 | Max time (ms) to wait for all RTD providers |
| `name` | string | ✅ | - | Must be `'mixpeek'` |
| `waitForIt` | boolean | ❌ | false | Whether to wait for this provider |

**Example:**
```javascript
realTimeData: {
  auctionDelay: 300,  // Wait up to 300ms for RTD data
  dataProviders: [{
    name: 'mixpeek',     // Required
    waitForIt: true,     // Wait for Mixpeek
    params: { /* ... */ }
  }]
}
```

### Step 3: Move All Config to `params`

All your existing Mixpeek configuration goes inside the `params` object:

```javascript
params: {
  // All your existing config
  apiKey: 'sk_...',
  collectionId: 'col_...',
  endpoint: '...',
  // etc.
}
```

### Step 4: Update Multiple RTD Providers (if applicable)

If you're using multiple RTD providers (e.g., with ID5 or RampID):

**Before (v1):**
```javascript
pbjs.setConfig({
  mixpeek: { /* ... */ }
})

// Separate config for ID5
pbjs.setConfig({
  userId: {
    auctionDelay: 50,
    userIds: [{
      name: 'id5Id',
      params: { /* ... */ }
    }]
  }
})
```

**After (v2):**
```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 300,  // Combined delay for all RTD providers
    dataProviders: [
      {
        name: 'mixpeek',
        waitForIt: true,
        params: { /* Mixpeek config */ }
      },
      {
        name: 'id5',
        waitForIt: true,
        params: { /* ID5 config */ }
      }
    ]
  }
})
```

---

## What's New in v2

### 1. Enhanced ortb2 Data Structure ✨

v2 now injects data into **both** site-level and impression-level locations:

**Site-Level (`ortb2.site.content`):**
```javascript
{
  "ortb2": {
    "site": {
      "content": {
        "cat": ["IAB19-11"],        // NEW: IAB categories
        "cattax": 6,                 // NEW: Taxonomy version
        "genre": "Technology - AI",  // NEW: Genre
        "keywords": "ai,tech",       // NEW: Keywords
        "language": "en",            // NEW: Language
        "title": "Page Title",       // NEW: Title
        "url": "https://...",        // NEW: URL
        "ext": {                     // NEW: Extension data
          "data": {
            "mixpeek": {
              "score": 0.94,
              "brandSafety": 0.98,
              "sentiment": "positive"
            }
          }
        }
      }
    }
  }
}
```

**Impression-Level (`ortb2Imp.ext.data`):**
```javascript
{
  "hb_mixpeek_taxonomy": "IAB19-11",
  "hb_mixpeek_category": "Technology > AI",
  // ... same as v1
}
```

### 2. Built-in IAB Mapping 🗺️

v2 includes IAB Content Taxonomy v3.0 mapping:

- Maps Mixpeek's `node_id` to IAB codes
- Multiple fallback strategies
- Configurable mappings

See `src/utils/iabMapping.js` for details.

### 3. Consent Management Integration 🔒

v2 properly integrates with Prebid's consent framework:

```javascript
// Automatically receives and logs consent
init: function(config, userConsent) {
  // userConsent includes GDPR and USP data
}
```

### 4. Standard RTD Interface 🔌

v2 implements Prebid's official RTD submodule interface:

- `init()` - Initialize with consent
- `getBidRequestData()` - Enrich bid requests
- `getTargetingData()` - Provide targeting keys

---

## Testing Your Migration

### 1. Enable Debug Mode

```javascript
realTimeData: {
  auctionDelay: 250,
  dataProviders: [{
    name: 'mixpeek',
    waitForIt: true,
    params: {
      apiKey: 'sk_...',
      collectionId: 'col_...',
      debug: true  // Enable debug logging
    }
  }]
}
```

### 2. Check Console Logs

Look for these messages:

```
[mixpeek] Initializing Mixpeek RTD module
[mixpeek] getBidRequestData called
[mixpeek] Context retrieved successfully
[mixpeek] Injected site.content data
[mixpeek] Enriched 3 ad units
```

### 3. Verify ortb2 Data

Inspect the bid request:

```javascript
pbjs.onEvent('beforeRequestBids', function(bidRequest) {
  console.log('ortb2 site.content:', 
    bidRequest.ortb2Fragments?.global?.site?.content)
  
  console.log('Ad unit enrichment:', 
    bidRequest.adUnits[0]?.ortb2Imp?.ext?.data)
})
```

### 4. Verify Auction Not Blocked

Check that auctions aren't delayed unnecessarily:

```javascript
const startTime = Date.now()

pbjs.requestBids({
  bidsBackHandler: function() {
    const duration = Date.now() - startTime
    console.log(`Auction completed in ${duration}ms`)
    // Should be ~250-500ms depending on API latency
  }
})
```

---

## Common Migration Issues

### Issue 1: "Module not found" or Silent Failure

**Symptoms:**
- No logs in console
- No context enrichment
- No errors

**Cause:** Configuration not properly structured

**Solution:**
```javascript
// Make sure you have this exact structure
pbjs.setConfig({
  realTimeData: {            // Must be "realTimeData"
    dataProviders: [{         // Must be array
      name: 'mixpeek',        // Must be exactly 'mixpeek'
      params: { /* ... */ }   // Must have params object
    }]
  }
})
```

### Issue 2: Auction Blocked Too Long

**Symptoms:**
- Auctions taking > 500ms
- Timeout errors

**Cause:** `auctionDelay` too high or API too slow

**Solution:**
```javascript
realTimeData: {
  auctionDelay: 200,  // Reduce delay
  dataProviders: [{
    name: 'mixpeek',
    waitForIt: false,  // Don't wait if API is slow
    params: {
      timeout: 150     // Reduce API timeout
    }
  }]
}
```

### Issue 3: No ortb2.site.content Data

**Symptoms:**
- `ortb2Imp.ext.data` populated
- `ortb2.site.content` missing

**Cause:** Using v1 module

**Solution:** Ensure you're loading the v2 RTD provider module, not the v1 adapter.

### Issue 4: IAB Codes Not Showing

**Symptoms:**
- Context data present
- No IAB codes in `ortb2.site.content.cat`

**Cause:** Mixpeek taxonomy not mapped

**Solution:**
1. Run E2E tests to discover your node_ids:
   ```bash
   npm run test:e2e
   ```
2. Update `src/utils/iabMapping.js` with your mappings:
   ```javascript
   export const MIXPEEK_NODE_TO_IAB = {
     'your_node_id': 'IAB19-11',
     // ... add your mappings
   }
   ```

---

## Rollback Plan

If you need to rollback to v1:

### 1. Revert Configuration

```javascript
// Back to v1 format
pbjs.setConfig({
  mixpeek: {
    apiKey: 'sk_...',
    collectionId: 'col_...',
    // ... v1 config
  }
})
```

### 2. Revert Package

```bash
npm install @mixpeek/prebid@1.x
```

### 3. Clear Cache

```bash
# Clear browser cache
# Or programmatically:
window.MixpeekContextAdapter.clearCache()
```

---

## Breaking Changes Summary

| Change | v1 | v2 | Required Action |
|--------|----|----|----------------|
| **Config structure** | `mixpeek: {}` | `realTimeData.dataProviders[]` | Update config |
| **Module type** | Custom hooks | RTD submodule | No code change |
| **ortb2 location** | Imp-level only | Site + Imp level | Verify bidders receive data |
| **Consent** | Not handled | Integrated | Test with GDPR/USP |
| **IAB mapping** | Manual | Built-in | Optional: configure mappings |

---

## Benefits of Migrating

✅ **Standard Pattern** - Follows official Prebid RTD structure  
✅ **Better Integration** - Works with other RTD modules  
✅ **Enhanced Data** - ortb2.site.content for DSPs  
✅ **IAB Compliant** - Built-in taxonomy mapping  
✅ **Consent Aware** - Respects GDPR/USP  
✅ **Future Proof** - Ready for Prebid repository submission  

---

## Timeline

### Deprecation Schedule

- **v2.0 Release:** TBD
- **v1 Support:** 6 months after v2 release
- **v1 End of Life:** 12 months after v2 release

### Recommended Migration Timeline

- **Weeks 1-2:** Test v2 in staging environment
- **Week 3:** Gradual rollout to 10% of traffic
- **Week 4:** Rollout to 50% of traffic
- **Week 5:** Full production rollout
- **Week 6+:** Monitor and optimize

---

## Support

Need help with migration?

- **Documentation:** [Full Integration Guide](integration-guide.md)
- **Examples:** See `examples/` directory
- **Issues:** [GitHub Issues](https://github.com/mixpeek/prebid/issues)
- **Email:** support@mixpeek.com
- **Slack:** [Join our Slack](https://mixpeek.com/slack)

---

## FAQ

### Do I need to update my API key?
No, existing API keys work with v2.

### Will my existing collection work?
Yes, collections are fully compatible.

### Do I need to change my ad units?
No, ad unit configuration remains the same.

### What about caching?
Caching works the same way in v2.

### Can I run v1 and v2 simultaneously?
No, only one version should be active at a time.

### Do I need to update my tests?
Yes, if your tests reference the old configuration format.

---

**Ready to migrate?** Follow the steps above and you'll be running v2 in no time! 🚀

