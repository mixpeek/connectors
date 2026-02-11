# @mixpeek/langchain

LangChain integration for Mixpeek — retriever, tool, and document loader for LLM-powered applications

## Installation

```bash
npm install @mixpeek/langchain langchain
```

## Quick Start

```js
import mixpeekRetriever from '@mixpeek/langchain';

const instance = mixpeekRetriever({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### MixpeekRetriever

LangChain BaseRetriever implementation backed by Mixpeek multimodal search

```js
import { createMixpeekRetriever } from '@mixpeek/langchain';

const mixpeekRetriever = createMixpeekRetriever({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MixpeekTool

LangChain Tool for agents to search and enrich content via Mixpeek

```js
import { createMixpeekTool } from '@mixpeek/langchain';

const mixpeekTool = createMixpeekTool({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### MixpeekDocumentLoader

LangChain DocumentLoader that loads and enriches documents from Mixpeek collections

```js
import { createMixpeekDocumentLoader } from '@mixpeek/langchain';

const mixpeekDocumentLoader = createMixpeekDocumentLoader({
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
