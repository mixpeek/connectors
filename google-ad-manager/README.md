# Mixpeek GPT Targeting Helper

Client-side utility for generating Google Publisher Tag (GPT) custom targeting keys from contextual content signals.

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

## Important Note

This package is **not an official Google Ad Manager integration**.

Google Ad Manager does not endorse or support third-party SDKs. This library is a **client-side utility** that helps publishers generate and apply standard custom targeting keys using Google Publisher Tags (GPT).

All targeting keys emitted by this library are first-party and fully controlled by the publisher.

## Overview

This utility transforms page content into GPT-compatible targeting signals without cookies, user IDs, or auction latency. It generates custom targeting keys that work with existing line items, appear in forecasting, and flow into reporting.

### What This Provides

| Signal | Targeting Key | Description |
|--------|---------------|-------------|
| IAB Category (v3.0) | `mixpeek_iab_v3` | Content category code |
| IAB Category (v2.2) | `mixpeek_iab_v2` | Legacy IAB code |
| Sentiment | `mixpeek_sentiment` | positive / neutral / negative |
| Suitability | `mixpeek_suitability` | high / standard / limited / floor |
| Brand Safety Score | `mixpeek_brand_safety` | 0.00 - 1.00 |
| Content Depth | `mixpeek_content_depth` | high / medium / low |
| Ad Adjacency | `mixpeek_adjacency_score` | Competitive separation score |
| Keywords | `mixpeek_keywords` | Comma-separated keywords |

## Installation

```bash
npm install @mixpeek/google-ad-manager
```

## Quick Start

```javascript
import { createEnricher } from '@mixpeek/google-ad-manager'

// Initialize
const enricher = createEnricher({
  apiKey: 'YOUR_MIXPEEK_API_KEY',
  collectionId: 'YOUR_COLLECTION_ID',
  namespace: 'YOUR_NAMESPACE'
})

// Enrich page content
const result = await enricher.enrich({
  url: window.location.href,
  title: document.title,
  text: document.body.innerText.slice(0, 5000)
})

// Apply to GPT
result.applyToGPT(googletag)
```

## GPT Integration

### Option 1: Direct Application (Recommended)

```javascript
const result = await enricher.enrich(content)

// Apply all targeting keys to GPT
result.applyToGPT(googletag)
```

### Option 2: Manual Page-Level Targeting

```javascript
const result = await enricher.enrich(content)

googletag.cmd.push(function() {
  Object.entries(result.targeting).forEach(([key, value]) => {
    googletag.pubads().setTargeting(key, value)
  })
})
```

### Option 3: Slot-Level Targeting

```javascript
const slotResult = await enricher.getSlotTargeting(content, 'div-gpt-ad-12345')

googletag.cmd.push(function() {
  const slot = googletag.defineSlot('/1234/ad-unit', [300, 250], 'div-gpt-ad-12345')

  Object.entries(slotResult.targeting).forEach(([key, value]) => {
    slot.setTargeting(key, value)
  })

  slot.addService(googletag.pubads())
})
```

## Ad Adjacency Tracking

Track competitive separation across ad requests:

```javascript
// After ad renders
googletag.pubads().addEventListener('slotRenderEnded', function(event) {
  enricher.recordAdImpression({
    advertiserId: event.advertiserId,
    category: event.lineItemId, // or your category logic
    creativeId: event.creativeId
  })
})

// Next slot will have adjacency score
const nextSlot = await enricher.getSlotTargeting(content, 'next-slot-id')
// nextSlot.targeting.mixpeek_adjacency_score indicates competitive separation
```

## Inventory Classification

Use content quality signals for inventory qualification:

```javascript
const result = await enricher.enrich(content)

// Check if content qualifies as premium inventory
if (result.inventory.isPremium) {
  // Content depth is high, suitable for premium deals
}

if (result.inventory.isBrandSafe) {
  // Safe for all advertisers
}

// Suggested floor multiplier based on content quality
// result.inventory.qualityMultiplier (e.g., 1.2 for premium content)
```

## PMP Deal Targeting

For private marketplace deals:

```javascript
const result = await enricher.enrich(content)

// PMP-formatted targeting
// result.pmpTargeting = {
//   mp_cat: '19',        // IAB v3 code
//   mp_conf: '0.85',     // Confidence score
//   mp_safe: 'high',     // Suitability level
//   mp_qual: 'high'      // Content quality
// }
```

## Configuration Options

```javascript
const enricher = createEnricher({
  // Required
  apiKey: 'YOUR_API_KEY',
  collectionId: 'YOUR_COLLECTION_ID',
  namespace: 'YOUR_NAMESPACE',

  // Optional
  endpoint: 'https://api.mixpeek.com',  // API endpoint
  timeout: 200,                          // Request timeout (ms)
  enableCache: true,                     // Enable response caching
  cacheTTL: 300,                         // Cache TTL (seconds)
  shadowMode: false                      // Shadow mode for testing
})
```

## Shadow Mode

Test the integration without affecting production:

```javascript
const enricher = createEnricher({
  apiKey: 'YOUR_API_KEY',
  collectionId: 'YOUR_COLLECTION_ID',
  namespace: 'YOUR_NAMESPACE',
  shadowMode: true  // Results include shadowMode: true flag
})

// Use for A/B testing or validation
if (enricher.isShadowMode()) {
  console.log('Running in shadow mode')
}
```

## Validation

Validate targeting keys before applying:

```javascript
const result = await enricher.enrich(content)
const validation = enricher.validateTargeting(result.targeting)

if (!validation.valid) {
  console.warn('Targeting issues:', validation.issues)
}
```

## Error Handling

The utility gracefully degrades on API errors:

```javascript
const result = await enricher.enrich(content)

if (result.error) {
  // Using fallback enrichment
  console.warn('Using fallback:', result.error)
}

// Targeting is always available
googletag.pubads().setTargeting('mixpeek_category', result.targeting.mixpeek_category)
```

## Caching

```javascript
// Get cache statistics
const stats = enricher.getCacheStats()
// { size: 42, maxSize: 1000, enabled: true, ttlMs: 300000 }

// Clear cache
enricher.clearCache()
```

## Testing

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Live API tests (requires credentials)
MIXPEEK_API_KEY=your_key \
MIXPEEK_COLLECTION_ID=your_collection \
MIXPEEK_NAMESPACE=your_namespace \
npm run test:live

# All tests
npm run test:all
```

## GAM Setup Guide

### 1. Create Custom Targeting Keys

In GAM (Inventory > Key-values), create the following keys:

| Key Name | Value Type | Values |
|----------|------------|--------|
| `mixpeek_iab_v3` | Predefined | 1-23 (IAB codes) |
| `mixpeek_sentiment` | Predefined | positive, neutral, negative |
| `mixpeek_suitability` | Predefined | high, standard, limited, floor |
| `mixpeek_content_depth` | Predefined | high, medium, low |
| `mixpeek_brand_safety` | Free-form | (numeric scores) |
| `mixpeek_adjacency_score` | Free-form | (numeric scores) |
| `mixpeek_keywords` | Free-form | (keywords) |

### 2. Create Line Item Targeting

Target line items using the keys:

```
mixpeek_iab_v3 = 19 (Technology)
AND mixpeek_suitability = high
AND mixpeek_sentiment = positive
```

### 3. Set Up PMP Deals

Use PMP targeting for premium inventory:

```
mp_cat = 19
AND mp_safe = high
AND mp_qual = high
```

## Why Use This

1. **Privacy-safe signals** - No cookies, PPIDs, or user profiling
2. **Inventory differentiation** - Tell buyers what content is actually about
3. **Graded suitability** - Nuanced brand safety instead of binary safe/unsafe
4. **Content-based forecasting** - Forecast by content quality, not just URL
5. **No auction latency** - Keys evaluated inside GAM, no bid-time calls

## API Reference

### `createEnricher(config)`

Creates a new enricher instance.

### `enricher.enrich(content)`

Enriches content and returns targeting keys.

**Returns:** `Promise<EnrichmentResult>`

### `result.applyToGPT(googletag)`

Applies all targeting keys to GPT. Safe, CSP-compliant method.

### `enricher.getSlotTargeting(content, slotId)`

Gets slot-specific targeting with adjacency awareness.

**Returns:** `Promise<SlotTargetingResult>`

### `enricher.recordAdImpression(adData)`

Records an ad impression for adjacency tracking.

### `enricher.healthCheck()`

Checks API health.

**Returns:** `Promise<HealthResult>`

### `enricher.validateTargeting(targeting)`

Validates targeting keys for GAM compatibility.

**Returns:** `ValidationResult`

## License

Apache 2.0
