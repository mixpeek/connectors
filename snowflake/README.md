# @mixpeek/snowflake

Snowflake integration for Mixpeek — external functions, stream processing, and data enrichment

## Installation

```bash
npm install @mixpeek/snowflake snowflake-sdk
```

## Quick Start

```js
import snowflakeClient from '@mixpeek/snowflake';

const instance = snowflakeClient({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### SnowflakeClient

Snowflake client that reads data for Mixpeek enrichment and writes results back

```js
import { createSnowflakeClient } from '@mixpeek/snowflake';

const snowflakeClient = createSnowflakeClient({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ExternalFunction

Implements Snowflake external function interface for calling Mixpeek from SQL

```js
import { createExternalFunction } from '@mixpeek/snowflake';

const externalFunction = createExternalFunction({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### StreamProcessor

Processes Snowflake streams/tasks to enrich new and changed data via Mixpeek

```js
import { createStreamProcessor } from '@mixpeek/snowflake';

const streamProcessor = createStreamProcessor({
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
