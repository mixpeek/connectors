# @mixpeek/airflow

Apache Airflow integration for Mixpeek — custom operators, DAG generators, and task builders

## Installation

```bash
npm install @mixpeek/airflow
```

## Quick Start

```js
import mixpeekOperator from '@mixpeek/airflow';

const instance = mixpeekOperator({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### MixpeekOperator

Airflow operator that executes Mixpeek enrichment tasks within DAGs

```js
import { createMixpeekOperator } from '@mixpeek/airflow';

const mixpeekOperator = createMixpeekOperator({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### DagGenerator

Generates Airflow DAG definitions for Mixpeek enrichment pipelines

```js
import { createDagGenerator } from '@mixpeek/airflow';

const dagGenerator = createDagGenerator({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### TaskBuilder

Fluent builder for creating Mixpeek enrichment tasks within Airflow DAGs

```js
import { createTaskBuilder } from '@mixpeek/airflow';

const taskBuilder = createTaskBuilder({
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
