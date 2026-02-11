# @mixpeek/aws-lambda

AWS Lambda integration for Mixpeek — handler wrappers, event routing, and response formatting for serverless enrichment

## Installation

```bash
npm install @mixpeek/aws-lambda
```

## Quick Start

```js
import lambdaHandler from '@mixpeek/aws-lambda';

const instance = lambdaHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### LambdaHandler

Wraps Mixpeek enrichment in an AWS Lambda handler with cold start optimization

```js
import { createLambdaHandler } from '@mixpeek/aws-lambda';

const lambdaHandler = createLambdaHandler({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### EventRouter

Routes Lambda events (API Gateway, S3, SQS, EventBridge) to appropriate Mixpeek operations

```js
import { createEventRouter } from '@mixpeek/aws-lambda';

const eventRouter = createEventRouter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ResponseFormatter

Formats Mixpeek enrichment results into Lambda-compatible response objects

```js
import { createResponseFormatter } from '@mixpeek/aws-lambda';

const responseFormatter = createResponseFormatter({
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
