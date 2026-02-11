# @mixpeek/sanity

Sanity.io integration for Mixpeek — webhook handling, document enrichment, and GROQ-powered queries

## Installation

```bash
npm install @mixpeek/sanity @sanity/client
```

## Quick Start

```js
import webhookHandler from '@mixpeek/sanity';

const instance = webhookHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### WebhookHandler

Handles Sanity GROQ-powered webhooks and triggers Mixpeek enrichment

```js
import { createWebhookHandler } from '@mixpeek/sanity';

const webhookHandler = createWebhookHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### DocumentEnricher

Enriches Sanity documents with Mixpeek multimodal analysis stored in custom fields

```js
import { createDocumentEnricher } from '@mixpeek/sanity';

const documentEnricher = createDocumentEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### SanityClient

Sanity client wrapper for reading/writing enrichment data via GROQ and mutations

```js
import { createSanityClient } from '@mixpeek/sanity';

const sanityClient = createSanityClient({
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
