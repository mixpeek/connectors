# @mixpeek/n8n-nodes-mixpeek

n8n community node for [Mixpeek](https://mixpeek.com) - multimodal data processing and semantic search API.

**[View all Mixpeek connectors →](https://mixpeek.com/connectors)**

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `@mixpeek/n8n-nodes-mixpeek`
4. Click **Install**

### Manual Installation

```bash
npm install @mixpeek/n8n-nodes-mixpeek
```

## Credentials

You need a Mixpeek API key to use this node. Get your API key from [app.mixpeek.com](https://app.mixpeek.com).

1. In n8n, go to **Credentials** > **Add Credential**
2. Search for "Mixpeek API"
3. Enter your API key

## Supported Resources & Operations

### Namespace
Manage tenant isolation and environments.
- Create, Get, List, Update, Delete

### Bucket
Schema-backed containers for objects/blobs.
- Create, Get, List, Update, Delete

### Collection
Transform objects into searchable documents using ML extractors.
- Create, Get, List, Update, Delete

### Document
Query-ready outputs with full lifecycle management.
- Create, Get, List, Update, Delete

### Retriever
Multi-stage search pipelines with auto-optimization.
- Create, Get, List, Update, Delete
- **Execute** - Run a semantic search query
- **Explain** - Get execution plan for a query

### Upload
File upload management with presigned URLs.
- Create Presigned URL
- Get, List, Delete
- **Confirm** - Verify upload completion

### Task
Async job tracking and monitoring.
- Get, List

### Inference
Direct ML model execution.
- **Execute** - Run inference with OpenAI, Anthropic, Google, or custom models

### Taxonomy
Similarity-based document classification.
- Create, Get, List, Update, Delete

### Cluster
Semantic grouping with triggers.
- Create, Get, List, Delete
- **Execute** - Run clustering

### Webhook
Event-driven automation.
- Create, Get, List, Update, Delete

## Example Usage

### Semantic Search

1. Add a **Mixpeek** node
2. Select **Retriever** as the resource
3. Select **Execute** as the operation
4. Enter the Retriever ID
5. Enter your search query
6. Optionally add filters and limits

### Upload a File

1. Add a **Mixpeek** node
2. Select **Upload** as the resource
3. Select **Create Presigned URL** as the operation
4. Enter the Bucket ID and filename
5. Use the returned presigned URL to upload your file
6. Add another **Mixpeek** node to confirm the upload

### Run Inference

1. Add a **Mixpeek** node
2. Select **Inference** as the resource
3. Select **Execute** as the operation
4. Enter the model (e.g., `openai/gpt-4`, `anthropic/claude-3`)
5. Enter the input as JSON

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd n8n
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
# Unit tests
npm test

# Integration tests (requires MIXPEEK_API_KEY)
MIXPEEK_API_KEY=your_key npm run test:integration
```

### Local Development with n8n

```bash
# Link the package
npm link

# In your n8n custom nodes directory (~/.n8n/custom)
npm link @mixpeek/n8n-nodes-mixpeek

# Start n8n
n8n start
```

## Resources

- [Mixpeek Documentation](https://docs.mixpeek.com)
- [Mixpeek API Reference](https://docs.mixpeek.com/api-reference)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

## Support

- [GitHub Issues](https://github.com/mixpeek/connectors/issues)
- [Mixpeek Support](mailto:support@mixpeek.com)
