# @mixpeek/huggingface

Hugging Face integration for Mixpeek — model bridging, dataset sync, and pipeline adaptation

## Installation

```bash
npm install @mixpeek/huggingface @huggingface/inference
```

## Quick Start

```js
import modelBridge from '@mixpeek/huggingface';

const instance = modelBridge({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### ModelBridge

Bridges Hugging Face model inference with Mixpeek enrichment pipelines

```js
import { createModelBridge } from '@mixpeek/huggingface';

const modelBridge = createModelBridge({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### DatasetSync

Syncs Mixpeek collections with Hugging Face datasets for training/evaluation

```js
import { createDatasetSync } from '@mixpeek/huggingface';

const datasetSync = createDatasetSync({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### PipelineAdapter

Adapts Hugging Face pipeline outputs into Mixpeek enrichment format

```js
import { createPipelineAdapter } from '@mixpeek/huggingface';

const pipelineAdapter = createPipelineAdapter({
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
