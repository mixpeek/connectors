# @mixpeek/sentry

Sentry integration for Mixpeek — error tracking, performance monitoring, and enrichment pipeline observability

## Installation

```bash
npm install @mixpeek/sentry @sentry/node
```

## Quick Start

```js
import errorReporter from '@mixpeek/sentry';

const instance = errorReporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### ErrorReporter

Reports Mixpeek enrichment errors to Sentry with full context

```js
import { createErrorReporter } from '@mixpeek/sentry';

const errorReporter = createErrorReporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### PerformanceMonitor

Monitors Mixpeek enrichment performance and reports to Sentry

```js
import { createPerformanceMonitor } from '@mixpeek/sentry';

const performanceMonitor = createPerformanceMonitor({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MixpeekIntegration

Sentry SDK integration class for automatic Mixpeek instrumentation

```js
import { createMixpeekIntegration } from '@mixpeek/sentry';

const mixpeekIntegration = createMixpeekIntegration({
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
