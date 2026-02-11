# @mixpeek/anthropic

Anthropic integration for Mixpeek — tool definitions, content adapters, and MCP server for Claude

## Installation

```bash
npm install @mixpeek/anthropic @anthropic-ai/sdk
```

## Quick Start

```js
import toolDefinitions from '@mixpeek/anthropic';

const instance = toolDefinitions({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### ToolDefinitions

Provides Mixpeek search/enrichment as Claude tool_use definitions

```js
import { createToolDefinitions } from '@mixpeek/anthropic';

const toolDefinitions = createToolDefinitions({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ContentAdapter

Adapts Mixpeek multimodal content for Claude message format (text, images, documents)

```js
import { createContentAdapter } from '@mixpeek/anthropic';

const contentAdapter = createContentAdapter({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### McpServer

Model Context Protocol server exposing Mixpeek as MCP tools and resources

```js
import { createMcpServer } from '@mixpeek/anthropic';

const mcpServer = createMcpServer({
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
