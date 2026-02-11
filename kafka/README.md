# @mixpeek/kafka

Apache Kafka integration for Mixpeek — consume events, produce enrichment results, and transform messages

## Installation

```bash
npm install @mixpeek/kafka kafkajs
```

## Quick Start

```js
import kafkaConsumer from '@mixpeek/kafka';

const instance = kafkaConsumer({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### KafkaConsumer

Consumes Kafka messages and triggers Mixpeek enrichment for each event

```js
import { createKafkaConsumer } from '@mixpeek/kafka';

const kafkaConsumer = createKafkaConsumer({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### KafkaProducer

Produces Mixpeek enrichment results to Kafka output topics

```js
import { createKafkaProducer } from '@mixpeek/kafka';

const kafkaProducer = createKafkaProducer({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MessageTransformer

Transforms Kafka messages to/from Mixpeek enrichment format with schema support

```js
import { createMessageTransformer } from '@mixpeek/kafka';

const messageTransformer = createMessageTransformer({
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
