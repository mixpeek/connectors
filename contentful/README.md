# @mixpeek/contentful

Contentful integration for Mixpeek — webhook handling, content enrichment, and management API integration

## Installation

```bash
npm install @mixpeek/contentful contentful-management
```

## Quick Start

```js
import webhookHandler from '@mixpeek/contentful';

const instance = webhookHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### WebhookHandler

Handles Contentful webhooks (entry publish/unpublish/archive) and triggers enrichment

```js
import { createWebhookHandler } from '@mixpeek/contentful';

const webhookHandler = createWebhookHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ContentEnricher

Enriches Contentful entries with Mixpeek multimodal analysis stored in custom fields

```js
import { createContentEnricher } from '@mixpeek/contentful';

const contentEnricher = createContentEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ContentfulClient

Contentful Management API client for reading/writing enrichment data

```js
import { createContentfulClient } from '@mixpeek/contentful';

const contentfulClient = createContentfulClient({
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
