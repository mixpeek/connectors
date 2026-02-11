# @mixpeek/openai

OpenAI integration for Mixpeek — embedding bridge, function calling adapter, and assistant tools

## Installation

```bash
npm install @mixpeek/openai openai
```

## Quick Start

```js
import embeddingBridge from '@mixpeek/openai';

const instance = embeddingBridge({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### EmbeddingBridge

Bridges OpenAI embeddings with Mixpeek vector storage for hybrid search

```js
import { createEmbeddingBridge } from '@mixpeek/openai';

const embeddingBridge = createEmbeddingBridge({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### FunctionCallingAdapter

Provides Mixpeek search/enrichment as OpenAI function calling tools

```js
import { createFunctionCallingAdapter } from '@mixpeek/openai';

const functionCallingAdapter = createFunctionCallingAdapter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### AssistantTool

OpenAI Assistants API tool that provides Mixpeek multimodal search capabilities

```js
import { createAssistantTool } from '@mixpeek/openai';

const assistantTool = createAssistantTool({
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
