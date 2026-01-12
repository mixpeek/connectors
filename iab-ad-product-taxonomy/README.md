# @mixpeek/iab-ad-product-taxonomy

IAB Ad Product Taxonomy mapper for standardized product classification with deterministic and semantic mapping.

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

[![npm version](https://badge.fury.io/js/%40mixpeek%2Fiab-ad-product-taxonomy.svg)](https://www.npmjs.com/package/@mixpeek/iab-ad-product-taxonomy)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This connector converts arbitrary product metadata into standardized **IAB Tech Lab Ad Product Taxonomy 2.0** categories. It provides publishers with stronger signals to control ad delivery and measure ad performance.

## Scope & Intent

This package is a **non-normative reference implementation** for mapping product metadata to the IAB Ad Product Taxonomy.

It is intended to:
- Standardize product classification across systems
- Provide deterministic and explainable mappings
- Support validation, QA, and offline processing

It does **not** define or modify the IAB taxonomy itself. Taxonomy definitions are sourced from the published IAB Ad Product Taxonomy and versioned locally for reproducibility.

### What It Does

**Inputs:**
- Product title
- Description
- Merchant category
- Brand metadata
- Optional images/video

**Outputs:**
```json
{
  "iab_product": {
    "primary": "IAB-AP-1121",
    "primaryId": 1121,
    "label": "Consumer Electronics > Wearables > Smartwatches",
    "confidence": 0.95,
    "version": "2.0",
    "tier1": "IAB-AP-1115",
    "tier1Id": 1115,
    "tier1Label": "Consumer Electronics"
  }
}
```

### Key Characteristics

- **Standards-Aligned**: Maps to IAB Tech Lab Ad Product Taxonomy 2.0
- **Deterministic First**: Keyword matching with optional semantic fallback
- **Explainable**: Every classification includes matched keywords and confidence
- **Privacy-First**: No user tracking—pure product classification
- **High Performance**: Sub-10ms latency for deterministic mapping
- **Cached Results**: Built-in LRU caching

## Who This Is For

- **SSP/DSP Platform Teams**: Ad product classification for inventory
- **Publishers**: Control ad types via product taxonomy signals
- **Ad Operations**: Standardize product feed classification
- **Data Teams**: Offline labeling and QA validation
- **Standards Engineers**: IAB-compliant taxonomy mapping

## Installation

```bash
npm install @mixpeek/iab-ad-product-taxonomy
```

## Quick Start

```javascript
import { createMapper } from '@mixpeek/iab-ad-product-taxonomy';

// Create mapper instance
const mapper = createMapper({
  enableCache: true,
  mappingMode: 'hybrid'  // 'deterministic', 'semantic', or 'hybrid'
});

// Map a product
const result = await mapper.mapProduct({
  title: 'Apple Watch Series 9',
  description: 'GPS smartwatch with heart rate monitor'
});

console.log(result);
// {
//   success: true,
//   iab_product: {
//     primary: 'IAB-AP-1121',
//     label: 'Consumer Electronics > Wearables > Smartwatches',
//     confidence: 0.95,
//     version: '2.0'
//   },
//   cached: false,
//   latencyMs: 5
// }
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | - | Mixpeek API key (required for semantic mode) |
| `namespace` | string | - | Namespace for API isolation |
| `endpoint` | string | `https://api.mixpeek.com` | API endpoint |
| `timeout` | number | `5000` | Request timeout in milliseconds |
| `cacheTTL` | number | `3600` | Cache TTL in seconds |
| `enableCache` | boolean | `true` | Enable response caching |
| `enableSemantic` | boolean | `true` | Enable semantic mapping |
| `mappingMode` | string | `hybrid` | Mapping mode (see below) |
| `iabVersion` | string | `2.0` | IAB taxonomy version |
| `minConfidence` | number | `0.3` | Minimum confidence threshold |
| `debug` | boolean | `false` | Enable debug logging |

### Mapping Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `deterministic` | Keyword-based matching only | High-speed, predictable, explainable results |
| `semantic` | Semantic classification (optional fallback) | Better coverage, requires API key |
| `hybrid` | Deterministic first, semantic fallback | Determinism with graceful degradation |

## API Reference

### `createMapper(config)`

Creates a new mapper instance.

```javascript
const mapper = createMapper({
  enableCache: true,
  mappingMode: 'deterministic'
});
```

### `mapper.mapProduct(product, options?)`

Maps a single product to IAB Ad Product Taxonomy.

```javascript
const result = await mapper.mapProduct({
  title: 'Product Title',
  description: 'Product description',
  category: 'Merchant category',
  brand: 'Brand name',
  keywords: ['additional', 'keywords']
}, {
  mode: 'deterministic',      // Override mapping mode
  minConfidence: 0.5,         // Override min confidence
  includeSecondary: true      // Include secondary categories
});
```

### `mapper.mapProducts(products, options?)`

Maps multiple products in batch.

```javascript
const results = await mapper.mapProducts([
  { title: 'Product 1' },
  { title: 'Product 2' }
]);
```

### `mapper.lookupCategory(id)`

Look up category information by ID.

```javascript
const category = mapper.lookupCategory(1121);
// {
//   id: 1121,
//   code: 'IAB-AP-1121',
//   name: 'Smartwatches',
//   label: 'Consumer Electronics > Wearables > Smartwatches',
//   tier: 3,
//   parent: 1120
// }
```

### `mapper.validateCategory(id)`

Validate a category ID or code.

```javascript
mapper.validateCategory(1121);           // true
mapper.validateCategory('IAB-AP-1121');  // true
mapper.validateCategory(99999);          // false
```

### `mapper.getStats()`

Get mapper statistics.

```javascript
const stats = mapper.getStats();
// {
//   requests: 100,
//   cacheHits: 60,
//   deterministicMatches: 35,
//   semanticMatches: 5,
//   noMatches: 0,
//   errors: 0,
//   avgLatencyMs: '4.50',
//   cache: { size: 40, hits: 60, misses: 40, hitRate: '60.00' }
// }
```

### `mapper.healthCheck()`

Check mapper health status.

```javascript
const health = await mapper.healthCheck();
// { status: 'healthy', mode: 'hybrid', cache: {...}, api: {...} }
```

## Taxonomy Access

Access the taxonomy data directly:

```javascript
import {
  IAB_AD_PRODUCT_TAXONOMY,
  getCategoryById,
  getCategoryLabel,
  getTier1Categories,
  getChildCategories,
  isValidCategory
} from '@mixpeek/iab-ad-product-taxonomy';

// Get all tier 1 categories
const tier1 = getTier1Categories();
// [{ id: 1115, name: 'Consumer Electronics', tier: 1 }, ...]

// Get category label
const label = getCategoryLabel(1121);
// 'Consumer Electronics > Wearables > Smartwatches'

// Get children
const children = getChildCategories(1115);
// [{ id: 1116, name: 'Computers and Laptops' }, ...]
```

## Keyword Mapping

Use deterministic keyword mapping directly:

```javascript
import {
  mapKeywordToCategory,
  mapKeywordsToCategories,
  findBestMatch
} from '@mixpeek/iab-ad-product-taxonomy';

// Map single keyword
const match = mapKeywordToCategory('smartphone');
// { id: 1118, name: 'Smartphones', confidence: 0.95 }

// Map multiple keywords
const matches = mapKeywordsToCategories(['phone', 'mobile', 'iphone']);
// [{ id: 1118, name: 'Smartphones', matchCount: 3, confidence: 0.97 }]

// Find best match from text
const best = findBestMatch('Apple iPhone 15 Pro smartphone');
// { id: 1118, name: 'Smartphones', confidence: 0.95 }
```

## IAB Ad Product Taxonomy 2.0 Coverage

The connector covers all major IAB Ad Product Taxonomy 2.0 categories:

| Category | ID | Examples |
|----------|----|---------
| Alcohol | 1002 | Beer, Wine, Spirits |
| Cannabis | 1050 | CBD, THC Products |
| Clothing | 1055 | Apparel, Footwear, Jewelry |
| Consumer Electronics | 1115 | Phones, Wearables, Audio |
| Consumer Packaged Goods | 1150 | Food, Personal Care, Beauty |
| Dating | 1210 | Dating Apps, Matchmaking |
| Education | 1260 | Colleges, Online Courses |
| Finance | 1340 | Banking, Insurance, Investing |
| Gambling | 1440 | Casinos, Sports Betting |
| Health | 1480 | Healthcare, Dental, Mental Health |
| Media | 1560 | Streaming, News, Social Media |
| Pharmaceuticals | 1680 | Prescription, OTC, Vitamins |
| Real Estate | 1720 | Residential, Commercial |
| Retail | 1750 | E-commerce, Department Stores |
| Travel | 1810 | Airlines, Hotels, Car Rental |
| Vehicles | 1860 | Automotive, Motorcycles, EVs |
| Weapons | 1920 | Firearms, Ammunition |

## Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Live API tests (requires credentials)
export MIXPEEK_API_KEY="your_key"
npm run test:live

# Coverage report
npm run test:coverage
```

## Performance

| Metric | Deterministic | Hybrid |
|--------|---------------|--------|
| Latency (cold) | <10ms | 10-50ms |
| Latency (cached) | <1ms | <1ms |
| Cache hit rate | 60-80% | 60-80% |
| Memory footprint | <10MB | <20MB |

## Examples

### OpenRTB Enrichment

```javascript
import { createMapper } from '@mixpeek/iab-ad-product-taxonomy';

const mapper = createMapper();

async function enrichBidRequest(bidRequest) {
  const product = bidRequest.ext?.product || {};

  const mapping = await mapper.mapProduct({
    title: product.title,
    description: product.description,
    category: product.category
  });

  if (mapping.success) {
    bidRequest.ext = bidRequest.ext || {};
    bidRequest.ext.iab_product = mapping.iab_product;
  }

  return bidRequest;
}
```

### Product Feed Processing

```javascript
import { createMapper } from '@mixpeek/iab-ad-product-taxonomy';

const mapper = createMapper({ enableCache: true });

async function processProductFeed(products) {
  const results = await mapper.mapProducts(products);

  return results.map((result, i) => ({
    ...products[i],
    iab_category: result.success ? result.iab_product.primary : null,
    iab_label: result.success ? result.iab_product.label : null
  }));
}
```

### Brand Safety Filtering

```javascript
import { createMapper, getTier1Parent } from '@mixpeek/iab-ad-product-taxonomy';

const BLOCKED_CATEGORIES = [1002, 1008, 1050, 1440, 1800, 1920]; // Alcohol, Adult, Cannabis, Gambling, Tobacco, Weapons

const mapper = createMapper();

async function isBrandSafe(product) {
  const result = await mapper.mapProduct(product);

  if (!result.success) return true; // Unknown products pass

  const tier1 = getTier1Parent(result.iab_product.primaryId);
  return !BLOCKED_CATEGORIES.includes(tier1?.id);
}
```

## Language Support

| Package | Platform | Use Case |
|---------|----------|----------|
| **npm** | Node.js / Browser | Real-time pipelines, adtech infrastructure, edge usage |
| **PyPI** | Python | Offline labeling, data validation, QA, analytics |

## Changelog

### v1.0.0

- Initial release
- IAB Ad Product Taxonomy 2.0 support
- Deterministic keyword mapping (400+ keywords)
- Semantic classification (optional, explainable fallback)
- Hybrid mapping mode
- LRU caching
- Full test suite

## License

Apache 2.0 License - see [LICENSE](LICENSE) for details.

---

## Support

- GitHub Issues: [github.com/mixpeek/connectors/issues](https://github.com/mixpeek/connectors/issues)
- Documentation: [docs.mixpeek.com](https://docs.mixpeek.com)
- Email: info@mixpeek.com
