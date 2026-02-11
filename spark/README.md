# @mixpeek/spark

Apache Spark integration for Mixpeek — UDF transformers, batch processing, and schema mapping

## Installation

```bash
npm install @mixpeek/spark
```

## Quick Start

```js
import sparkTransformer from '@mixpeek/spark';

const instance = sparkTransformer({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### SparkTransformer

Spark UDF/transformer that applies Mixpeek enrichment to DataFrame columns

```js
import { createSparkTransformer } from '@mixpeek/spark';

const sparkTransformer = createSparkTransformer({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### BatchProcessor

Batch processes Spark DataFrames through Mixpeek with rate limiting and retries

```js
import { createBatchProcessor } from '@mixpeek/spark';

const batchProcessor = createBatchProcessor({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### SchemaMapper

Maps Spark schemas to/from Mixpeek document schemas for seamless data flow

```js
import { createSchemaMapper } from '@mixpeek/spark';

const schemaMapper = createSchemaMapper({
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
