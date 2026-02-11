# @mixpeek/llamaindex

LlamaIndex integration for Mixpeek — reader, retriever, and tool spec for RAG applications

## Installation

```bash
npm install @mixpeek/llamaindex llamaindex
```

## Quick Start

```js
import mixpeekReader from '@mixpeek/llamaindex';

const instance = mixpeekReader({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### MixpeekReader

LlamaIndex BaseReader that reads documents from Mixpeek collections

```js
import { createMixpeekReader } from '@mixpeek/llamaindex';

const mixpeekReader = createMixpeekReader({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MixpeekRetriever

LlamaIndex BaseRetriever backed by Mixpeek multimodal search

```js
import { createMixpeekRetriever } from '@mixpeek/llamaindex';

const mixpeekRetriever = createMixpeekRetriever({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MixpeekToolSpec

LlamaIndex ToolSpec providing Mixpeek search and enrichment capabilities to agents

```js
import { createMixpeekToolSpec } from '@mixpeek/llamaindex';

const mixpeekToolSpec = createMixpeekToolSpec({
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
