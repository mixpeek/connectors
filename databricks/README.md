# @mixpeek/databricks

Databricks integration for Mixpeek — notebook helpers, Delta Lake integration, and Unity Catalog connector

## Installation

```bash
npm install @mixpeek/databricks @databricks/sql
```

## Quick Start

```js
import notebookHelper from '@mixpeek/databricks';

const instance = notebookHelper({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### NotebookHelper

Helper functions for using Mixpeek enrichment within Databricks notebooks

```js
import { createNotebookHelper } from '@mixpeek/databricks';

const notebookHelper = createNotebookHelper({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### DeltaLakeIntegration

Reads from and writes enrichment results to Delta Lake tables

```js
import { createDeltaLakeIntegration } from '@mixpeek/databricks';

const deltaLakeIntegration = createDeltaLakeIntegration({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### UnityConnector

Unity Catalog integration for registering Mixpeek as an external data source

```js
import { createUnityConnector } from '@mixpeek/databricks';

const unityConnector = createUnityConnector({
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
