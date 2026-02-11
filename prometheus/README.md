# @mixpeek/prometheus

Prometheus metrics exporter for Mixpeek — expose enrichment metrics, latency histograms, and custom collectors

## Installation

```bash
npm install @mixpeek/prometheus prom-client
```

## Quick Start

```js
import metricsExporter from '@mixpeek/prometheus';

const instance = metricsExporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### MetricsExporter

Exports Mixpeek enrichment metrics as Prometheus metrics (counters, histograms, gauges)

```js
import { createMetricsExporter } from '@mixpeek/prometheus';

const metricsExporter = createMetricsExporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### CollectorRegistry

Manages custom Prometheus collectors for Mixpeek pipeline metrics

```js
import { createCollectorRegistry } from '@mixpeek/prometheus';

const collectorRegistry = createCollectorRegistry({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### AlertRules

Generates Prometheus alerting rules based on Mixpeek SLOs

```js
import { createAlertRules } from '@mixpeek/prometheus';

const alertRules = createAlertRules({
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
