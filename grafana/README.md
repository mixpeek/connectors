# @mixpeek/grafana

Grafana integration for Mixpeek — dashboard provisioning, annotations, and Prometheus metric export

## Installation

```bash
npm install @mixpeek/grafana
```

## Quick Start

```js
import prometheusExporter from '@mixpeek/grafana';

const instance = prometheusExporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### PrometheusExporter

Exports Mixpeek metrics in Prometheus format for Grafana consumption

```js
import { createPrometheusExporter } from '@mixpeek/grafana';

const prometheusExporter = createPrometheusExporter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### DashboardProvisioner

Generates and provisions Grafana dashboards for Mixpeek monitoring

```js
import { createDashboardProvisioner } from '@mixpeek/grafana';

const dashboardProvisioner = createDashboardProvisioner({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### AnnotationProvider

Provides Grafana annotations for Mixpeek enrichment events

```js
import { createAnnotationProvider } from '@mixpeek/grafana';

const annotationProvider = createAnnotationProvider({
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
