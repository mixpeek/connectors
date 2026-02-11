# @mixpeek/gcp-functions

Google Cloud Functions integration for Mixpeek — handler wrappers, event routing, and response formatting

## Installation

```bash
npm install @mixpeek/gcp-functions
```

## Quick Start

```js
import functionHandler from '@mixpeek/gcp-functions';

const instance = functionHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### FunctionHandler

Wraps Mixpeek enrichment in a Cloud Functions handler with cold start optimization

```js
import { createFunctionHandler } from '@mixpeek/gcp-functions';

const functionHandler = createFunctionHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### EventRouter

Routes Cloud Function events (HTTP, Pub/Sub, GCS, Firestore) to Mixpeek operations

```js
import { createEventRouter } from '@mixpeek/gcp-functions';

const eventRouter = createEventRouter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ResponseFormatter

Formats Mixpeek enrichment results into Cloud Functions response objects

```js
import { createResponseFormatter } from '@mixpeek/gcp-functions';

const responseFormatter = createResponseFormatter({
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
