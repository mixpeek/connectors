# @mixpeek/shopify

Shopify integration for Mixpeek — webhook handling, product enrichment, and Admin API integration

## Installation

```bash
npm install @mixpeek/shopify @shopify/shopify-api
```

## Quick Start

```js
import shopifyWebhook from '@mixpeek/shopify';

const instance = shopifyWebhook({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### ShopifyWebhook

Handles Shopify webhooks (product create/update/delete) and triggers Mixpeek enrichment

```js
import { createShopifyWebhook } from '@mixpeek/shopify';

const shopifyWebhook = createShopifyWebhook({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ProductEnricher

Enriches Shopify products with Mixpeek multimodal analysis (images, descriptions, metafields)

```js
import { createProductEnricher } from '@mixpeek/shopify';

const productEnricher = createProductEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ShopifyAdmin

Shopify Admin API client for fetching products, collections, and writing enrichment results

```js
import { createShopifyAdmin } from '@mixpeek/shopify';

const shopifyAdmin = createShopifyAdmin({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Testing

```bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:live     # Live API tests (requires MIXPEEK_API_KEY)
npm run test:coverage # Coverage report
```

## License

MIT
