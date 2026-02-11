# @mixpeek/gcs

Google Cloud Storage integration for Mixpeek — watch buckets, enrich objects, and parse GCS events

## Installation

```bash
npm install @mixpeek/gcs @google-cloud/storage
```

## Quick Start

```js
import gCSWatcher from '@mixpeek/gcs';

const instance = gCSWatcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### GCSWatcher

Watches GCS buckets for new/modified objects via Pub/Sub notifications

```js
import { createGCSWatcher } from '@mixpeek/gcs';

const gCSWatcher = createGCSWatcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### GCSEnricher

Enriches GCS objects through Mixpeek and stores enrichment results

```js
import { createGCSEnricher } from '@mixpeek/gcs';

const gCSEnricher = createGCSEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### GCSEventParser

Parses GCS event notifications (Pub/Sub, Eventarc) into normalized objects

```js
import { createGCSEventParser } from '@mixpeek/gcs';

const gCSEventParser = createGCSEventParser({
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
