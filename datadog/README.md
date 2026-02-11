# @mixpeek/datadog

Datadog integration for Mixpeek — metrics, logs, and distributed tracing for enrichment pipelines

## Installation

```bash
npm install @mixpeek/datadog dd-trace
```

## Quick Start

```js
import metricsReporter from '@mixpeek/datadog';

const instance = metricsReporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### MetricsReporter

Reports Mixpeek enrichment metrics to Datadog (counters, gauges, distributions)

```js
import { createMetricsReporter } from '@mixpeek/datadog';

const metricsReporter = createMetricsReporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### LogForwarder

Forwards Mixpeek enrichment logs to Datadog Logs with structured metadata

```js
import { createLogForwarder } from '@mixpeek/datadog';

const logForwarder = createLogForwarder({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### TraceIntegration

Integrates Mixpeek enrichment spans into Datadog APM traces

```js
import { createTraceIntegration } from '@mixpeek/datadog';

const traceIntegration = createTraceIntegration({
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
