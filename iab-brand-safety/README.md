# @mixpeek/iab-brand-safety

IAB Brand Safety and Suitability classifier based on GARM framework.

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

[![npm version](https://badge.fury.io/js/%40mixpeek%2Fiab-brand-safety.svg)](https://www.npmjs.com/package/@mixpeek/iab-brand-safety)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This connector classifies content and products for brand safety using the IAB Ad Product Taxonomy and GARM (Global Alliance for Responsible Media) Brand Safety Floor + Suitability Framework.

## Scope & Intent

This package is a **non-normative reference implementation** for brand safety classification.

It is intended to:
- Identify sensitive content categories (alcohol, gambling, adult, etc.)
- Implement GARM Brand Safety Floor protections
- Support brand suitability customization
- Integrate with IAB Ad Product Taxonomy classifications

It does **not** make targeting or bidding decisions. Those remain the responsibility of downstream systems.

### Key Characteristics

- **GARM-Aligned**: Implements Brand Safety Floor + Suitability Framework
- **Deterministic**: Rule-based classification with explainable decisions
- **Configurable**: Customize blocked categories and risk thresholds
- **Composable**: Works standalone or with IAB Ad Product Taxonomy connector

## Installation

```bash
npm install @mixpeek/iab-brand-safety
```

Optional: For product classification integration:
```bash
npm install @mixpeek/iab-ad-product-taxonomy
```

## Quick Start

```javascript
import { createClassifier, RISK_LEVELS } from '@mixpeek/iab-brand-safety';

// Create classifier
const classifier = createClassifier({
  strictMode: false,  // Block only floor-level categories
  riskThreshold: RISK_LEVELS.HIGH
});

// Classify content
const result = classifier.classifyContent({
  text: 'Article about technology innovation',
  categories: [1115]  // Consumer Electronics
});

console.log(result);
// {
//   safe: true,
//   risk: 'safe',
//   riskScore: 0,
//   blocked: false,
//   reasons: [],
//   garmCategories: [],
//   sensitiveCategories: []
// }

// Classify sensitive content
const sensitiveResult = classifier.classifyContent({
  text: 'Online casino gaming experience',
  categories: [1443]  // Online Gambling
});

console.log(sensitiveResult);
// {
//   safe: false,
//   risk: 'high',
//   riskScore: 0.8,
//   blocked: true,
//   reasons: ['Blocked category: Online Gambling (high)'],
//   garmCategories: ['gambling'],
//   sensitiveCategories: [{ id: 1443, name: 'Online Gambling', risk: 'high' }]
// }
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `blockedKeywords` | string[] | `[]` | Additional keywords to block |
| `blockedCategories` | number[] | `[]` | Additional category IDs to block |
| `riskThreshold` | string | `high` | Minimum acceptable risk level |
| `strictMode` | boolean | `false` | Block all high-risk categories |
| `productMapper` | object | `null` | IAB Ad Product Taxonomy mapper instance |

### Risk Levels

| Level | Score | Description |
|-------|-------|-------------|
| `floor` | 1.0 | GARM Floor - never acceptable |
| `high` | 0.8 | High risk - most brands avoid |
| `medium` | 0.5 | Medium risk - context-dependent |
| `low` | 0.2 | Low risk - generally acceptable |
| `safe` | 0.0 | Safe - no brand safety concerns |

## API Reference

### `createClassifier(config)`

Creates a brand safety classifier instance.

```javascript
const classifier = createClassifier({
  strictMode: true,
  blockedCategories: [1440, 1800]  // Gambling, Tobacco
});
```

### `classifier.classifyContent(content)`

Classifies content for brand safety.

```javascript
const result = classifier.classifyContent({
  text: 'Content text',
  title: 'Content title',
  keywords: ['keyword1', 'keyword2'],
  categories: [1115, 1118]  // IAB category IDs
});
```

### `classifier.classifyProduct(product)`

Classifies a product for brand safety. Integrates with IAB Ad Product Taxonomy mapper if provided.

```javascript
const result = await classifier.classifyProduct({
  title: 'Product name',
  description: 'Product description',
  categoryId: 1004  // Beer
});
```

### `classifier.getGARMReport()`

Returns GARM category coverage report.

```javascript
const report = classifier.getGARMReport();
// {
//   alcohol: { name: 'Alcohol', floor: false, blockedCategories: 5, coverage: '100%' },
//   gambling: { name: 'Gambling', floor: false, blockedCategories: 6, coverage: '100%' },
//   ...
// }
```

## GARM Categories

| Category | Floor | Description |
|----------|-------|-------------|
| `adult_explicit` | Yes | Adult & Explicit Sexual Content |
| `arms_ammunition` | No | Arms & Ammunition |
| `alcohol` | No | Alcohol |
| `drugs` | No | Drugs/Controlled Substances |
| `gambling` | No | Gambling |
| `tobacco` | No | Tobacco |
| `dating` | No | Dating |
| `religion` | No | Religion |
| `debated_social` | No | Debated Sensitive Social Issues |
| `health_sensitive` | No | Health-Sensitive Topics |
| `health_pharma` | No | Pharmaceuticals |

## Sensitive IAB Ad Product Categories

| Category | ID | Default Risk |
|----------|-----|--------------|
| Adult Products | 1008 | floor |
| Alcohol | 1002 | high |
| Cannabis | 1050 | high |
| Gambling | 1440 | high |
| Tobacco | 1800 | high |
| Weapons | 1920 | high |
| Dating | 1210 | medium |
| Pharmaceuticals | 1680 | medium |
| Politics | 1700 | medium |
| Religion | 1710 | medium |
| HFSS Foods | 1190 | medium |

## Integration with IAB Ad Product Taxonomy

```javascript
import { createClassifier } from '@mixpeek/iab-brand-safety';
import { createMapper } from '@mixpeek/iab-ad-product-taxonomy';

// Create product mapper
const mapper = createMapper({ enableSemantic: false });

// Create classifier with mapper integration
const classifier = createClassifier({
  productMapper: mapper,
  strictMode: true
});

// Classify product - will auto-map to IAB category
const result = await classifier.classifyProduct({
  title: 'Budweiser Beer 12-Pack',
  description: 'American lager beer'
});

// {
//   safe: false,
//   risk: 'high',
//   blocked: true,
//   categoryId: 1004,
//   garmCategory: 'alcohol',
//   mapping: { success: true, iab_product: {...} }
// }
```

## Examples

### Brand Safety Filter for Ads

```javascript
import { createClassifier } from '@mixpeek/iab-brand-safety';

const classifier = createClassifier({ strictMode: true });

async function shouldShowAd(adContent, pageContent) {
  // Check page content
  const pageResult = classifier.classifyContent(pageContent);
  if (!pageResult.safe) {
    return { show: false, reason: 'Unsafe page content' };
  }

  // Check ad content
  const adResult = await classifier.classifyProduct(adContent);
  if (!adResult.safe) {
    return { show: false, reason: 'Unsafe ad content' };
  }

  return { show: true };
}
```

### Custom Risk Configuration

```javascript
const classifier = createClassifier({
  // Allow alcohol but block gambling
  blockedCategories: [1440, 1441, 1442, 1443, 1444, 1445],

  // Add custom blocked keywords
  blockedKeywords: ['competitor-brand', 'controversial-topic'],

  // Set risk threshold
  riskThreshold: 'medium'
});

// Remove specific category from blocked list
classifier.removeBlockedCategory(1003);  // Allow Bars and Restaurants
```

## Testing

```bash
npm test
npm run test:coverage
```

## License

Apache 2.0 License - see [LICENSE](LICENSE) for details.

---

## Support

- GitHub Issues: [github.com/mixpeek/connectors/issues](https://github.com/mixpeek/connectors/issues)
- Documentation: [docs.mixpeek.com](https://docs.mixpeek.com)
- Email: info@mixpeek.com
