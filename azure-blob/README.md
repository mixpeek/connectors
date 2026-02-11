# @mixpeek/azure-blob

Azure Blob Storage integration for Mixpeek — watch containers, enrich blobs, and parse Event Grid events

## Installation

```bash
npm install @mixpeek/azure-blob @azure/storage-blob
```

## Quick Start

```js
import blobWatcher from '@mixpeek/azure-blob';

const instance = blobWatcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### BlobWatcher

Watches Azure Blob containers for new/modified blobs via Event Grid subscriptions

```js
import { createBlobWatcher } from '@mixpeek/azure-blob';

const blobWatcher = createBlobWatcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### BlobEnricher

Enriches Azure Blobs through Mixpeek and stores enrichment metadata

```js
import { createBlobEnricher } from '@mixpeek/azure-blob';

const blobEnricher = createBlobEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### EventGridParser

Parses Azure Event Grid events into normalized blob event objects

```js
import { createEventGridParser } from '@mixpeek/azure-blob';

const eventGridParser = createEventGridParser({
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
