# @mixpeek/pagerduty

PagerDuty integration for Mixpeek — incident management, alert routing, and health monitoring

## Installation

```bash
npm install @mixpeek/pagerduty
```

## Quick Start

```js
import alertManager from '@mixpeek/pagerduty';

const instance = alertManager({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### AlertManager

Manages PagerDuty alerts based on Mixpeek enrichment pipeline status

```js
import { createAlertManager } from '@mixpeek/pagerduty';

const alertManager = createAlertManager({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### IncidentFormatter

Formats Mixpeek errors and degradations into PagerDuty incident payloads

```js
import { createIncidentFormatter } from '@mixpeek/pagerduty';

const incidentFormatter = createIncidentFormatter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### HealthChecker

Periodic health checks of Mixpeek API with PagerDuty alerting

```js
import { createHealthChecker } from '@mixpeek/pagerduty';

const healthChecker = createHealthChecker({
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
