# @mixpeek/aws-s3

AWS S3 integration for Mixpeek — watch buckets for new objects, enrich content, and parse S3 events

## Installation

```bash
npm install @mixpeek/aws-s3 @aws-sdk/client-s3
```

## Quick Start

```js
import s3Watcher from '@mixpeek/aws-s3';

const instance = s3Watcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### S3Watcher

Watches S3 buckets for new/modified objects and triggers Mixpeek enrichment

```js
import { createS3Watcher } from '@mixpeek/aws-s3';

const s3Watcher = createS3Watcher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### S3Enricher

Enriches S3 objects through Mixpeek and stores results back in S3 or metadata

```js
import { createS3Enricher } from '@mixpeek/aws-s3';

const s3Enricher = createS3Enricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### S3EventParser

Parses S3 event notifications (SNS/SQS/EventBridge) into normalized objects

```js
import { createS3EventParser } from '@mixpeek/aws-s3';

const s3EventParser = createS3EventParser({
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
