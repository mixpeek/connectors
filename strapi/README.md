# @mixpeek/strapi

Strapi integration for Mixpeek — lifecycle hooks, content enrichment, and plugin configuration

## Installation

```bash
npm install @mixpeek/strapi
```

## Quick Start

```js
import strapiLifecycle from '@mixpeek/strapi';

const instance = strapiLifecycle({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

## Modules

### StrapiLifecycle

Hooks into Strapi content lifecycle events (beforeCreate, afterUpdate) for enrichment

```js
import { createStrapiLifecycle } from '@mixpeek/strapi';

const strapiLifecycle = createStrapiLifecycle({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### ContentEnricher

Enriches Strapi content types with Mixpeek multimodal analysis

```js
import { createContentEnricher } from '@mixpeek/strapi';

const contentEnricher = createContentEnricher({
  apiKey: process.env.MIXPEEK_API_KEY
});
```

### PluginConfig

Strapi plugin configuration and registration for Mixpeek integration

```js
import { createPluginConfig } from '@mixpeek/strapi';

const pluginConfig = createPluginConfig({
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
