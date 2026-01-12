# @mixpeek/n8n-nodes-mixpeek

Turn URLs, text, images, and video into structured signals inside n8n.

Mixpeek is a multimodal processing API that lets you classify, search, cluster, and run ML inference on unstructured data — directly from n8n workflows.

```
Input → Mixpeek → Structured signals → Any system
```

**[Full docs & examples → mixpeek.com/connectors](https://mixpeek.com/connectors)**

---

## What you can build in minutes

- Auto-tag content from URLs or files
- Semantic search across documents, images, or video
- Content moderation & safety signals
- Dataset enrichment before indexing
- Trigger workflows based on semantic similarity

## Supported modalities

- Text
- Web pages (HTML)
- Images
- Video
- Files (via upload)

## Quick example

**Input:** A URL or file

**Output:**
```json
{
  "categories": ["technology", "ai"],
  "keywords": ["machine learning", "automation"],
  "sentiment": 0.72,
  "embeddings": [0.023, -0.041, ...]
}
```

---

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `@mixpeek/n8n-nodes-mixpeek`
4. Click **Install**

### Manual

```bash
npm install @mixpeek/n8n-nodes-mixpeek
```

## Credentials

Get your API key from [app.mixpeek.com](https://app.mixpeek.com).

1. In n8n: **Credentials** > **Add Credential**
2. Search "Mixpeek API"
3. Enter your API key

---

## All Resources & Operations

### Retriever
Multi-stage search pipelines with auto-optimization.
- Create, Get, List, Update, Delete
- **Execute** - Run a semantic search query
- **Explain** - Get execution plan

### Inference
Direct ML model execution.
- **Execute** - Run inference with OpenAI, Anthropic, Google, or custom models

### Collection
Transform objects into searchable documents using ML extractors.
- Create, Get, List, Update, Delete

### Document
Query-ready outputs with full lifecycle management.
- Create, Get, List, Update, Delete

### Upload
File upload management with presigned URLs.
- Create Presigned URL, Get, List, Delete
- **Confirm** - Verify upload completion

### Bucket
Schema-backed containers for objects/blobs.
- Create, Get, List, Update, Delete

### Namespace
Manage tenant isolation and environments.
- Create, Get, List, Update, Delete

### Taxonomy
Similarity-based document classification.
- Create, Get, List, Update, Delete

### Cluster
Semantic grouping with triggers.
- Create, Get, List, Delete
- **Execute** - Run clustering

### Task
Async job tracking and monitoring.
- Get, List

### Webhook
Event-driven automation.
- Create, Get, List, Update, Delete

---

## Example Workflows

### Semantic Search

1. Add a **Mixpeek** node
2. Resource: **Retriever** → Operation: **Execute**
3. Enter Retriever ID and query
4. Connect to any downstream node

### Upload & Process a File

1. **Mixpeek** node → Upload → Create Presigned URL
2. HTTP node → PUT file to presigned URL
3. **Mixpeek** node → Upload → Confirm

### Run Inference

1. **Mixpeek** node → Inference → Execute
2. Model: `openai/gpt-4` or `anthropic/claude-3`
3. Input: your JSON payload

---

## Development

### Setup

```bash
cd n8n
npm install
npm run build
```

### Test

```bash
npm test

# Integration tests
MIXPEEK_API_KEY=your_key npm run test:integration
```

### Local dev with n8n

```bash
npm link
cd ~/.n8n/custom && npm link @mixpeek/n8n-nodes-mixpeek
n8n start
```

---

## Resources

- [Mixpeek Documentation](https://docs.mixpeek.com)
- [API Reference](https://docs.mixpeek.com/api-reference)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

## Support

- [GitHub Issues](https://github.com/mixpeek/connectors/issues)
- [info@mixpeek.com](mailto:info@mixpeek.com)
