# @mixpeek/wordpress

WordPress integration for Mixpeek — REST API handlers, post enrichment, and hook management

## Installation

```bash
npm install @mixpeek/wordpress
```

## Quick Start

```js
import restApiHandler from '@mixpeek/wordpress';

const instance = restApiHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### RestApiHandler

Handles WordPress REST API events and triggers Mixpeek enrichment on content changes

```js
import { createRestApiHandler } from '@mixpeek/wordpress';

const restApiHandler = createRestApiHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### PostEnricher

Enriches WordPress posts/pages with Mixpeek analysis and stores as custom fields

```js
import { createPostEnricher } from '@mixpeek/wordpress';

const postEnricher = createPostEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### HookManager

Manages WordPress action/filter hooks for automatic Mixpeek enrichment on publish

```js
import { createHookManager } from '@mixpeek/wordpress';

const hookManager = createHookManager({
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
