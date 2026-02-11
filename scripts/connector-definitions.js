/**
 * Connector Definitions
 *
 * All 25 connector configurations for auto-generation.
 * Each entry defines metadata, modules, and peer dependencies.
 */

export const connectors = [
  // ─── Monitoring (5) ───────────────────────────────────────────
  {
    name: 'prometheus',
    package: '@mixpeek/prometheus',
    description: 'Prometheus metrics exporter for Mixpeek — expose enrichment metrics, latency histograms, and custom collectors',
    keywords: ['prometheus', 'metrics', 'monitoring', 'observability', 'grafana', 'alerting'],
    loggerPrefix: '[Mixpeek-Prometheus]',
    cacheKeyPrefix: 'mixpeek_prom_',
    userAgent: 'Mixpeek-Prometheus-Connector/1.0.0',
    category: 'monitoring',
    peerDependencies: { 'prom-client': '>=14.0.0' },
    modules: [
      {
        name: 'metricsExporter',
        className: 'MetricsExporter',
        description: 'Exports Mixpeek enrichment metrics as Prometheus metrics (counters, histograms, gauges)',
        methods: ['register', 'recordEnrichment', 'recordLatency', 'recordError', 'getMetrics', 'reset']
      },
      {
        name: 'collectorRegistry',
        className: 'CollectorRegistry',
        description: 'Manages custom Prometheus collectors for Mixpeek pipeline metrics',
        methods: ['addCollector', 'removeCollector', 'collect', 'getCollectors']
      },
      {
        name: 'alertRules',
        className: 'AlertRules',
        description: 'Generates Prometheus alerting rules based on Mixpeek SLOs',
        methods: ['addRule', 'removeRule', 'generateConfig', 'validate']
      }
    ]
  },
  {
    name: 'datadog',
    package: '@mixpeek/datadog',
    description: 'Datadog integration for Mixpeek — metrics, logs, and distributed tracing for enrichment pipelines',
    keywords: ['datadog', 'monitoring', 'metrics', 'logging', 'tracing', 'apm', 'observability'],
    loggerPrefix: '[Mixpeek-Datadog]',
    cacheKeyPrefix: 'mixpeek_dd_',
    userAgent: 'Mixpeek-Datadog-Connector/1.0.0',
    category: 'monitoring',
    peerDependencies: { 'dd-trace': '>=4.0.0' },
    modules: [
      {
        name: 'metricsReporter',
        className: 'MetricsReporter',
        description: 'Reports Mixpeek enrichment metrics to Datadog (counters, gauges, distributions)',
        methods: ['increment', 'gauge', 'distribution', 'flush', 'getStats']
      },
      {
        name: 'logForwarder',
        className: 'LogForwarder',
        description: 'Forwards Mixpeek enrichment logs to Datadog Logs with structured metadata',
        methods: ['log', 'error', 'warn', 'info', 'setTags', 'flush']
      },
      {
        name: 'traceIntegration',
        className: 'TraceIntegration',
        description: 'Integrates Mixpeek enrichment spans into Datadog APM traces',
        methods: ['startSpan', 'finishSpan', 'addTags', 'setError', 'getCurrentTrace']
      }
    ]
  },
  {
    name: 'grafana',
    package: '@mixpeek/grafana',
    description: 'Grafana integration for Mixpeek — dashboard provisioning, annotations, and Prometheus metric export',
    keywords: ['grafana', 'dashboard', 'monitoring', 'visualization', 'prometheus', 'annotations'],
    loggerPrefix: '[Mixpeek-Grafana]',
    cacheKeyPrefix: 'mixpeek_graf_',
    userAgent: 'Mixpeek-Grafana-Connector/1.0.0',
    category: 'monitoring',
    peerDependencies: {},
    modules: [
      {
        name: 'prometheusExporter',
        className: 'PrometheusExporter',
        description: 'Exports Mixpeek metrics in Prometheus format for Grafana consumption',
        methods: ['register', 'recordMetric', 'getMetricsEndpoint', 'reset']
      },
      {
        name: 'dashboardProvisioner',
        className: 'DashboardProvisioner',
        description: 'Generates and provisions Grafana dashboards for Mixpeek monitoring',
        methods: ['createDashboard', 'updateDashboard', 'deleteDashboard', 'exportJson']
      },
      {
        name: 'annotationProvider',
        className: 'AnnotationProvider',
        description: 'Provides Grafana annotations for Mixpeek enrichment events',
        methods: ['createAnnotation', 'queryAnnotations', 'deleteAnnotation']
      }
    ]
  },
  {
    name: 'sentry',
    package: '@mixpeek/sentry',
    description: 'Sentry integration for Mixpeek — error tracking, performance monitoring, and enrichment pipeline observability',
    keywords: ['sentry', 'error-tracking', 'monitoring', 'performance', 'observability', 'debugging'],
    loggerPrefix: '[Mixpeek-Sentry]',
    cacheKeyPrefix: 'mixpeek_sentry_',
    userAgent: 'Mixpeek-Sentry-Connector/1.0.0',
    category: 'monitoring',
    peerDependencies: { '@sentry/node': '>=7.0.0' },
    modules: [
      {
        name: 'errorReporter',
        className: 'ErrorReporter',
        description: 'Reports Mixpeek enrichment errors to Sentry with full context',
        methods: ['captureException', 'captureMessage', 'setContext', 'addBreadcrumb', 'flush']
      },
      {
        name: 'performanceMonitor',
        className: 'PerformanceMonitor',
        description: 'Monitors Mixpeek enrichment performance and reports to Sentry',
        methods: ['startTransaction', 'startSpan', 'finishTransaction', 'setMeasurement']
      },
      {
        name: 'mixpeekIntegration',
        className: 'MixpeekIntegration',
        description: 'Sentry SDK integration class for automatic Mixpeek instrumentation',
        methods: ['setupOnce', 'install', 'uninstall', 'getOptions']
      }
    ]
  },
  {
    name: 'pagerduty',
    package: '@mixpeek/pagerduty',
    description: 'PagerDuty integration for Mixpeek — incident management, alert routing, and health monitoring',
    keywords: ['pagerduty', 'alerting', 'incident-management', 'on-call', 'monitoring'],
    loggerPrefix: '[Mixpeek-PagerDuty]',
    cacheKeyPrefix: 'mixpeek_pd_',
    userAgent: 'Mixpeek-PagerDuty-Connector/1.0.0',
    category: 'monitoring',
    peerDependencies: {},
    modules: [
      {
        name: 'alertManager',
        className: 'AlertManager',
        description: 'Manages PagerDuty alerts based on Mixpeek enrichment pipeline status',
        methods: ['trigger', 'acknowledge', 'resolve', 'getOpenAlerts', 'setRoutingKey']
      },
      {
        name: 'incidentFormatter',
        className: 'IncidentFormatter',
        description: 'Formats Mixpeek errors and degradations into PagerDuty incident payloads',
        methods: ['formatIncident', 'formatChange', 'addCustomDetails', 'setSeverity']
      },
      {
        name: 'healthChecker',
        className: 'HealthChecker',
        description: 'Periodic health checks of Mixpeek API with PagerDuty alerting',
        methods: ['start', 'stop', 'check', 'getStatus', 'setInterval']
      }
    ]
  },

  // ─── Cloud Services (5) ───────────────────────────────────────
  {
    name: 'aws-s3',
    package: '@mixpeek/aws-s3',
    description: 'AWS S3 integration for Mixpeek — watch buckets for new objects, enrich content, and parse S3 events',
    keywords: ['aws', 's3', 'cloud-storage', 'bucket', 'event-driven', 'lambda', 'serverless'],
    loggerPrefix: '[Mixpeek-AWS-S3]',
    cacheKeyPrefix: 'mixpeek_s3_',
    userAgent: 'Mixpeek-AWS-S3-Connector/1.0.0',
    category: 'cloud',
    peerDependencies: { '@aws-sdk/client-s3': '>=3.0.0' },
    modules: [
      {
        name: 's3Watcher',
        className: 'S3Watcher',
        description: 'Watches S3 buckets for new/modified objects and triggers Mixpeek enrichment',
        methods: ['watch', 'stop', 'onObject', 'processEvent', 'getWatchedBuckets']
      },
      {
        name: 's3Enricher',
        className: 'S3Enricher',
        description: 'Enriches S3 objects through Mixpeek and stores results back in S3 or metadata',
        methods: ['enrich', 'enrichBatch', 'getEnrichment', 'setOutputBucket']
      },
      {
        name: 's3EventParser',
        className: 'S3EventParser',
        description: 'Parses S3 event notifications (SNS/SQS/EventBridge) into normalized objects',
        methods: ['parse', 'parseRecord', 'isSupported', 'getObjectKey', 'getBucketName']
      }
    ]
  },
  {
    name: 'gcs',
    package: '@mixpeek/gcs',
    description: 'Google Cloud Storage integration for Mixpeek — watch buckets, enrich objects, and parse GCS events',
    keywords: ['gcp', 'google-cloud', 'gcs', 'cloud-storage', 'bucket', 'event-driven'],
    loggerPrefix: '[Mixpeek-GCS]',
    cacheKeyPrefix: 'mixpeek_gcs_',
    userAgent: 'Mixpeek-GCS-Connector/1.0.0',
    category: 'cloud',
    peerDependencies: { '@google-cloud/storage': '>=7.0.0' },
    modules: [
      {
        name: 'gcsWatcher',
        className: 'GCSWatcher',
        description: 'Watches GCS buckets for new/modified objects via Pub/Sub notifications',
        methods: ['watch', 'stop', 'onObject', 'processNotification', 'getWatchedBuckets']
      },
      {
        name: 'gcsEnricher',
        className: 'GCSEnricher',
        description: 'Enriches GCS objects through Mixpeek and stores enrichment results',
        methods: ['enrich', 'enrichBatch', 'getEnrichment', 'setOutputBucket']
      },
      {
        name: 'gcsEventParser',
        className: 'GCSEventParser',
        description: 'Parses GCS event notifications (Pub/Sub, Eventarc) into normalized objects',
        methods: ['parse', 'parseRecord', 'isSupported', 'getObjectName', 'getBucketName']
      }
    ]
  },
  {
    name: 'azure-blob',
    package: '@mixpeek/azure-blob',
    description: 'Azure Blob Storage integration for Mixpeek — watch containers, enrich blobs, and parse Event Grid events',
    keywords: ['azure', 'blob-storage', 'cloud-storage', 'event-grid', 'serverless'],
    loggerPrefix: '[Mixpeek-Azure-Blob]',
    cacheKeyPrefix: 'mixpeek_azblob_',
    userAgent: 'Mixpeek-Azure-Blob-Connector/1.0.0',
    category: 'cloud',
    peerDependencies: { '@azure/storage-blob': '>=12.0.0' },
    modules: [
      {
        name: 'blobWatcher',
        className: 'BlobWatcher',
        description: 'Watches Azure Blob containers for new/modified blobs via Event Grid subscriptions',
        methods: ['watch', 'stop', 'onBlob', 'processEvent', 'getWatchedContainers']
      },
      {
        name: 'blobEnricher',
        className: 'BlobEnricher',
        description: 'Enriches Azure Blobs through Mixpeek and stores enrichment metadata',
        methods: ['enrich', 'enrichBatch', 'getEnrichment', 'setOutputContainer']
      },
      {
        name: 'eventGridParser',
        className: 'EventGridParser',
        description: 'Parses Azure Event Grid events into normalized blob event objects',
        methods: ['parse', 'parseRecord', 'isSupported', 'getBlobName', 'getContainerName']
      }
    ]
  },
  {
    name: 'aws-lambda',
    package: '@mixpeek/aws-lambda',
    description: 'AWS Lambda integration for Mixpeek — handler wrappers, event routing, and response formatting for serverless enrichment',
    keywords: ['aws', 'lambda', 'serverless', 'event-driven', 'api-gateway', 'function'],
    loggerPrefix: '[Mixpeek-Lambda]',
    cacheKeyPrefix: 'mixpeek_lambda_',
    userAgent: 'Mixpeek-AWS-Lambda-Connector/1.0.0',
    category: 'cloud',
    peerDependencies: {},
    modules: [
      {
        name: 'lambdaHandler',
        className: 'LambdaHandler',
        description: 'Wraps Mixpeek enrichment in an AWS Lambda handler with cold start optimization',
        methods: ['handler', 'warmup', 'configure', 'getMetrics']
      },
      {
        name: 'eventRouter',
        className: 'EventRouter',
        description: 'Routes Lambda events (API Gateway, S3, SQS, EventBridge) to appropriate Mixpeek operations',
        methods: ['route', 'addRoute', 'removeRoute', 'getRoutes']
      },
      {
        name: 'responseFormatter',
        className: 'ResponseFormatter',
        description: 'Formats Mixpeek enrichment results into Lambda-compatible response objects',
        methods: ['formatApiGateway', 'formatProxy', 'formatError', 'formatBatch']
      }
    ]
  },
  {
    name: 'gcp-functions',
    package: '@mixpeek/gcp-functions',
    description: 'Google Cloud Functions integration for Mixpeek — handler wrappers, event routing, and response formatting',
    keywords: ['gcp', 'cloud-functions', 'serverless', 'event-driven', 'google-cloud'],
    loggerPrefix: '[Mixpeek-GCF]',
    cacheKeyPrefix: 'mixpeek_gcf_',
    userAgent: 'Mixpeek-GCP-Functions-Connector/1.0.0',
    category: 'cloud',
    peerDependencies: {},
    modules: [
      {
        name: 'functionHandler',
        className: 'FunctionHandler',
        description: 'Wraps Mixpeek enrichment in a Cloud Functions handler with cold start optimization',
        methods: ['httpHandler', 'eventHandler', 'configure', 'getMetrics']
      },
      {
        name: 'eventRouter',
        className: 'EventRouter',
        description: 'Routes Cloud Function events (HTTP, Pub/Sub, GCS, Firestore) to Mixpeek operations',
        methods: ['route', 'addRoute', 'removeRoute', 'getRoutes']
      },
      {
        name: 'responseFormatter',
        className: 'ResponseFormatter',
        description: 'Formats Mixpeek enrichment results into Cloud Functions response objects',
        methods: ['formatHttp', 'formatJson', 'formatError', 'formatBatch']
      }
    ]
  },

  // ─── CMS & Content (5) ────────────────────────────────────────
  {
    name: 'shopify',
    package: '@mixpeek/shopify',
    description: 'Shopify integration for Mixpeek — webhook handling, product enrichment, and Admin API integration',
    keywords: ['shopify', 'ecommerce', 'product-enrichment', 'webhook', 'admin-api', 'storefront'],
    loggerPrefix: '[Mixpeek-Shopify]',
    cacheKeyPrefix: 'mixpeek_shopify_',
    userAgent: 'Mixpeek-Shopify-Connector/1.0.0',
    category: 'cms',
    peerDependencies: { '@shopify/shopify-api': '>=9.0.0' },
    modules: [
      {
        name: 'shopifyWebhook',
        className: 'ShopifyWebhook',
        description: 'Handles Shopify webhooks (product create/update/delete) and triggers Mixpeek enrichment',
        methods: ['handleWebhook', 'verifyHmac', 'registerWebhooks', 'listWebhooks', 'deleteWebhook']
      },
      {
        name: 'productEnricher',
        className: 'ProductEnricher',
        description: 'Enriches Shopify products with Mixpeek multimodal analysis (images, descriptions, metafields)',
        methods: ['enrichProduct', 'enrichCollection', 'enrichBatch', 'getEnrichment', 'writeMetafield']
      },
      {
        name: 'shopifyAdmin',
        className: 'ShopifyAdmin',
        description: 'Shopify Admin API client for fetching products, collections, and writing enrichment results',
        methods: ['getProduct', 'getProducts', 'updateProduct', 'getCollection', 'graphql']
      }
    ]
  },
  {
    name: 'wordpress',
    package: '@mixpeek/wordpress',
    description: 'WordPress integration for Mixpeek — REST API handlers, post enrichment, and hook management',
    keywords: ['wordpress', 'cms', 'rest-api', 'content-enrichment', 'hooks', 'posts'],
    loggerPrefix: '[Mixpeek-WordPress]',
    cacheKeyPrefix: 'mixpeek_wp_',
    userAgent: 'Mixpeek-WordPress-Connector/1.0.0',
    category: 'cms',
    peerDependencies: {},
    modules: [
      {
        name: 'restApiHandler',
        className: 'RestApiHandler',
        description: 'Handles WordPress REST API events and triggers Mixpeek enrichment on content changes',
        methods: ['handleCreate', 'handleUpdate', 'handleDelete', 'registerRoutes', 'verifyNonce']
      },
      {
        name: 'postEnricher',
        className: 'PostEnricher',
        description: 'Enriches WordPress posts/pages with Mixpeek analysis and stores as custom fields',
        methods: ['enrichPost', 'enrichPage', 'enrichBatch', 'getEnrichment', 'setCustomField']
      },
      {
        name: 'hookManager',
        className: 'HookManager',
        description: 'Manages WordPress action/filter hooks for automatic Mixpeek enrichment on publish',
        methods: ['addAction', 'removeAction', 'addFilter', 'removeFilter', 'getRegistered']
      }
    ]
  },
  {
    name: 'contentful',
    package: '@mixpeek/contentful',
    description: 'Contentful integration for Mixpeek — webhook handling, content enrichment, and management API integration',
    keywords: ['contentful', 'cms', 'headless-cms', 'content-enrichment', 'webhook', 'content-management'],
    loggerPrefix: '[Mixpeek-Contentful]',
    cacheKeyPrefix: 'mixpeek_ctfl_',
    userAgent: 'Mixpeek-Contentful-Connector/1.0.0',
    category: 'cms',
    peerDependencies: { 'contentful-management': '>=10.0.0' },
    modules: [
      {
        name: 'webhookHandler',
        className: 'WebhookHandler',
        description: 'Handles Contentful webhooks (entry publish/unpublish/archive) and triggers enrichment',
        methods: ['handleWebhook', 'verifySignature', 'registerWebhook', 'listWebhooks', 'deleteWebhook']
      },
      {
        name: 'contentEnricher',
        className: 'ContentEnricher',
        description: 'Enriches Contentful entries with Mixpeek multimodal analysis stored in custom fields',
        methods: ['enrichEntry', 'enrichAsset', 'enrichBatch', 'getEnrichment', 'writeField']
      },
      {
        name: 'contentfulClient',
        className: 'ContentfulClient',
        description: 'Contentful Management API client for reading/writing enrichment data',
        methods: ['getEntry', 'getEntries', 'updateEntry', 'getAsset', 'publishEntry']
      }
    ]
  },
  {
    name: 'strapi',
    package: '@mixpeek/strapi',
    description: 'Strapi integration for Mixpeek — lifecycle hooks, content enrichment, and plugin configuration',
    keywords: ['strapi', 'cms', 'headless-cms', 'content-enrichment', 'lifecycle', 'plugin'],
    loggerPrefix: '[Mixpeek-Strapi]',
    cacheKeyPrefix: 'mixpeek_strapi_',
    userAgent: 'Mixpeek-Strapi-Connector/1.0.0',
    category: 'cms',
    peerDependencies: {},
    modules: [
      {
        name: 'strapiLifecycle',
        className: 'StrapiLifecycle',
        description: 'Hooks into Strapi content lifecycle events (beforeCreate, afterUpdate) for enrichment',
        methods: ['register', 'beforeCreate', 'afterCreate', 'afterUpdate', 'afterDelete']
      },
      {
        name: 'contentEnricher',
        className: 'ContentEnricher',
        description: 'Enriches Strapi content types with Mixpeek multimodal analysis',
        methods: ['enrichEntry', 'enrichMedia', 'enrichBatch', 'getEnrichment', 'setField']
      },
      {
        name: 'pluginConfig',
        className: 'PluginConfig',
        description: 'Strapi plugin configuration and registration for Mixpeek integration',
        methods: ['register', 'bootstrap', 'getConfig', 'setConfig', 'validate']
      }
    ]
  },
  {
    name: 'sanity',
    package: '@mixpeek/sanity',
    description: 'Sanity.io integration for Mixpeek — webhook handling, document enrichment, and GROQ-powered queries',
    keywords: ['sanity', 'cms', 'headless-cms', 'content-enrichment', 'webhook', 'groq'],
    loggerPrefix: '[Mixpeek-Sanity]',
    cacheKeyPrefix: 'mixpeek_sanity_',
    userAgent: 'Mixpeek-Sanity-Connector/1.0.0',
    category: 'cms',
    peerDependencies: { '@sanity/client': '>=6.0.0' },
    modules: [
      {
        name: 'webhookHandler',
        className: 'WebhookHandler',
        description: 'Handles Sanity GROQ-powered webhooks and triggers Mixpeek enrichment',
        methods: ['handleWebhook', 'verifySignature', 'parsePayload', 'filterDocuments']
      },
      {
        name: 'documentEnricher',
        className: 'DocumentEnricher',
        description: 'Enriches Sanity documents with Mixpeek multimodal analysis stored in custom fields',
        methods: ['enrichDocument', 'enrichImage', 'enrichBatch', 'getEnrichment', 'patchDocument']
      },
      {
        name: 'sanityClient',
        className: 'SanityClient',
        description: 'Sanity client wrapper for reading/writing enrichment data via GROQ and mutations',
        methods: ['fetch', 'getDocument', 'patchDocument', 'createDocument', 'query']
      }
    ]
  },

  // ─── AI & ML (5) ──────────────────────────────────────────────
  {
    name: 'langchain',
    package: '@mixpeek/langchain',
    description: 'LangChain integration for Mixpeek — retriever, tool, and document loader for LLM-powered applications',
    keywords: ['langchain', 'llm', 'retriever', 'document-loader', 'ai', 'rag', 'tool'],
    loggerPrefix: '[Mixpeek-LangChain]',
    cacheKeyPrefix: 'mixpeek_lc_',
    userAgent: 'Mixpeek-LangChain-Connector/1.0.0',
    category: 'ai',
    peerDependencies: { 'langchain': '>=0.1.0' },
    modules: [
      {
        name: 'mixpeekRetriever',
        className: 'MixpeekRetriever',
        description: 'LangChain BaseRetriever implementation backed by Mixpeek multimodal search',
        methods: ['getRelevantDocuments', 'invoke', 'configure', 'setNamespace', 'setFilters']
      },
      {
        name: 'mixpeekTool',
        className: 'MixpeekTool',
        description: 'LangChain Tool for agents to search and enrich content via Mixpeek',
        methods: ['call', 'invoke', 'getDescription', 'getSchema']
      },
      {
        name: 'mixpeekDocumentLoader',
        className: 'MixpeekDocumentLoader',
        description: 'LangChain DocumentLoader that loads and enriches documents from Mixpeek collections',
        methods: ['load', 'loadAndSplit', 'setCollection', 'setFilters']
      }
    ]
  },
  {
    name: 'llamaindex',
    package: '@mixpeek/llamaindex',
    description: 'LlamaIndex integration for Mixpeek — reader, retriever, and tool spec for RAG applications',
    keywords: ['llamaindex', 'llm', 'retriever', 'reader', 'ai', 'rag', 'tool'],
    loggerPrefix: '[Mixpeek-LlamaIndex]',
    cacheKeyPrefix: 'mixpeek_li_',
    userAgent: 'Mixpeek-LlamaIndex-Connector/1.0.0',
    category: 'ai',
    peerDependencies: { 'llamaindex': '>=0.1.0' },
    modules: [
      {
        name: 'mixpeekReader',
        className: 'MixpeekReader',
        description: 'LlamaIndex BaseReader that reads documents from Mixpeek collections',
        methods: ['loadData', 'lazyLoadData', 'setCollection', 'setFilters']
      },
      {
        name: 'mixpeekRetriever',
        className: 'MixpeekRetriever',
        description: 'LlamaIndex BaseRetriever backed by Mixpeek multimodal search',
        methods: ['retrieve', 'aretrieve', 'configure', 'setNamespace']
      },
      {
        name: 'mixpeekToolSpec',
        className: 'MixpeekToolSpec',
        description: 'LlamaIndex ToolSpec providing Mixpeek search and enrichment capabilities to agents',
        methods: ['getTools', 'search', 'enrich', 'getToolMetadata']
      }
    ]
  },
  {
    name: 'huggingface',
    package: '@mixpeek/huggingface',
    description: 'Hugging Face integration for Mixpeek — model bridging, dataset sync, and pipeline adaptation',
    keywords: ['huggingface', 'transformers', 'ml', 'model', 'dataset', 'pipeline', 'inference'],
    loggerPrefix: '[Mixpeek-HuggingFace]',
    cacheKeyPrefix: 'mixpeek_hf_',
    userAgent: 'Mixpeek-HuggingFace-Connector/1.0.0',
    category: 'ai',
    peerDependencies: { '@huggingface/inference': '>=2.0.0' },
    modules: [
      {
        name: 'modelBridge',
        className: 'ModelBridge',
        description: 'Bridges Hugging Face model inference with Mixpeek enrichment pipelines',
        methods: ['infer', 'embedText', 'embedImage', 'classify', 'setModel']
      },
      {
        name: 'datasetSync',
        className: 'DatasetSync',
        description: 'Syncs Mixpeek collections with Hugging Face datasets for training/evaluation',
        methods: ['exportToDataset', 'importFromDataset', 'sync', 'getStatus']
      },
      {
        name: 'pipelineAdapter',
        className: 'PipelineAdapter',
        description: 'Adapts Hugging Face pipeline outputs into Mixpeek enrichment format',
        methods: ['adapt', 'registerPipeline', 'transform', 'getSupportedTasks']
      }
    ]
  },
  {
    name: 'openai',
    package: '@mixpeek/openai',
    description: 'OpenAI integration for Mixpeek — embedding bridge, function calling adapter, and assistant tools',
    keywords: ['openai', 'gpt', 'embeddings', 'function-calling', 'assistant', 'ai', 'chatgpt'],
    loggerPrefix: '[Mixpeek-OpenAI]',
    cacheKeyPrefix: 'mixpeek_oai_',
    userAgent: 'Mixpeek-OpenAI-Connector/1.0.0',
    category: 'ai',
    peerDependencies: { 'openai': '>=4.0.0' },
    modules: [
      {
        name: 'embeddingBridge',
        className: 'EmbeddingBridge',
        description: 'Bridges OpenAI embeddings with Mixpeek vector storage for hybrid search',
        methods: ['embed', 'embedBatch', 'store', 'search', 'setModel']
      },
      {
        name: 'functionCallingAdapter',
        className: 'FunctionCallingAdapter',
        description: 'Provides Mixpeek search/enrichment as OpenAI function calling tools',
        methods: ['getTools', 'handleToolCall', 'getSchemas', 'registerFunction']
      },
      {
        name: 'assistantTool',
        className: 'AssistantTool',
        description: 'OpenAI Assistants API tool that provides Mixpeek multimodal search capabilities',
        methods: ['createTool', 'handleRun', 'getToolOutput', 'configure']
      }
    ]
  },
  {
    name: 'anthropic',
    package: '@mixpeek/anthropic',
    description: 'Anthropic integration for Mixpeek — tool definitions, content adapters, and MCP server for Claude',
    keywords: ['anthropic', 'claude', 'mcp', 'tool-use', 'ai', 'content-adapter'],
    loggerPrefix: '[Mixpeek-Anthropic]',
    cacheKeyPrefix: 'mixpeek_anth_',
    userAgent: 'Mixpeek-Anthropic-Connector/1.0.0',
    category: 'ai',
    peerDependencies: { '@anthropic-ai/sdk': '>=0.20.0' },
    modules: [
      {
        name: 'toolDefinitions',
        className: 'ToolDefinitions',
        description: 'Provides Mixpeek search/enrichment as Claude tool_use definitions',
        methods: ['getTools', 'handleToolUse', 'getSchemas', 'registerTool']
      },
      {
        name: 'contentAdapter',
        className: 'ContentAdapter',
        description: 'Adapts Mixpeek multimodal content for Claude message format (text, images, documents)',
        methods: ['adaptContent', 'adaptImage', 'adaptDocument', 'formatResults']
      },
      {
        name: 'mcpServer',
        className: 'McpServer',
        description: 'Model Context Protocol server exposing Mixpeek as MCP tools and resources',
        methods: ['start', 'stop', 'registerTool', 'registerResource', 'handleRequest']
      }
    ]
  },

  // ─── Data Pipeline (5) ────────────────────────────────────────
  {
    name: 'kafka',
    package: '@mixpeek/kafka',
    description: 'Apache Kafka integration for Mixpeek — consume events, produce enrichment results, and transform messages',
    keywords: ['kafka', 'streaming', 'event-driven', 'message-queue', 'data-pipeline', 'confluent'],
    loggerPrefix: '[Mixpeek-Kafka]',
    cacheKeyPrefix: 'mixpeek_kafka_',
    userAgent: 'Mixpeek-Kafka-Connector/1.0.0',
    category: 'pipeline',
    peerDependencies: { 'kafkajs': '>=2.0.0' },
    modules: [
      {
        name: 'kafkaConsumer',
        className: 'KafkaConsumer',
        description: 'Consumes Kafka messages and triggers Mixpeek enrichment for each event',
        methods: ['subscribe', 'start', 'stop', 'pause', 'resume', 'getStatus']
      },
      {
        name: 'kafkaProducer',
        className: 'KafkaProducer',
        description: 'Produces Mixpeek enrichment results to Kafka output topics',
        methods: ['send', 'sendBatch', 'connect', 'disconnect', 'getMetrics']
      },
      {
        name: 'messageTransformer',
        className: 'MessageTransformer',
        description: 'Transforms Kafka messages to/from Mixpeek enrichment format with schema support',
        methods: ['transform', 'setInputSchema', 'setOutputSchema', 'validate']
      }
    ]
  },
  {
    name: 'airflow',
    package: '@mixpeek/airflow',
    description: 'Apache Airflow integration for Mixpeek — custom operators, DAG generators, and task builders',
    keywords: ['airflow', 'workflow', 'dag', 'orchestration', 'data-pipeline', 'etl'],
    loggerPrefix: '[Mixpeek-Airflow]',
    cacheKeyPrefix: 'mixpeek_airflow_',
    userAgent: 'Mixpeek-Airflow-Connector/1.0.0',
    category: 'pipeline',
    peerDependencies: {},
    modules: [
      {
        name: 'mixpeekOperator',
        className: 'MixpeekOperator',
        description: 'Airflow operator that executes Mixpeek enrichment tasks within DAGs',
        methods: ['execute', 'configure', 'getTaskId', 'setUpstream', 'setDownstream']
      },
      {
        name: 'dagGenerator',
        className: 'DagGenerator',
        description: 'Generates Airflow DAG definitions for Mixpeek enrichment pipelines',
        methods: ['generate', 'addTask', 'setSchedule', 'setDependencies', 'export']
      },
      {
        name: 'taskBuilder',
        className: 'TaskBuilder',
        description: 'Fluent builder for creating Mixpeek enrichment tasks within Airflow DAGs',
        methods: ['withCollection', 'withNamespace', 'withFilters', 'withCallback', 'build']
      }
    ]
  },
  {
    name: 'spark',
    package: '@mixpeek/spark',
    description: 'Apache Spark integration for Mixpeek — UDF transformers, batch processing, and schema mapping',
    keywords: ['spark', 'big-data', 'batch-processing', 'data-pipeline', 'distributed', 'etl'],
    loggerPrefix: '[Mixpeek-Spark]',
    cacheKeyPrefix: 'mixpeek_spark_',
    userAgent: 'Mixpeek-Spark-Connector/1.0.0',
    category: 'pipeline',
    peerDependencies: {},
    modules: [
      {
        name: 'sparkTransformer',
        className: 'SparkTransformer',
        description: 'Spark UDF/transformer that applies Mixpeek enrichment to DataFrame columns',
        methods: ['transform', 'createUDF', 'registerUDF', 'setInputColumn', 'setOutputColumn']
      },
      {
        name: 'batchProcessor',
        className: 'BatchProcessor',
        description: 'Batch processes Spark DataFrames through Mixpeek with rate limiting and retries',
        methods: ['process', 'processBatch', 'setRateLimit', 'setConcurrency', 'getMetrics']
      },
      {
        name: 'schemaMapper',
        className: 'SchemaMapper',
        description: 'Maps Spark schemas to/from Mixpeek document schemas for seamless data flow',
        methods: ['mapToMixpeek', 'mapFromMixpeek', 'inferSchema', 'validate']
      }
    ]
  },
  {
    name: 'snowflake',
    package: '@mixpeek/snowflake',
    description: 'Snowflake integration for Mixpeek — external functions, stream processing, and data enrichment',
    keywords: ['snowflake', 'data-warehouse', 'sql', 'external-function', 'stream', 'data-pipeline'],
    loggerPrefix: '[Mixpeek-Snowflake]',
    cacheKeyPrefix: 'mixpeek_sf_',
    userAgent: 'Mixpeek-Snowflake-Connector/1.0.0',
    category: 'pipeline',
    peerDependencies: { 'snowflake-sdk': '>=1.6.0' },
    modules: [
      {
        name: 'snowflakeClient',
        className: 'SnowflakeClient',
        description: 'Snowflake client that reads data for Mixpeek enrichment and writes results back',
        methods: ['connect', 'disconnect', 'query', 'execute', 'getConnection']
      },
      {
        name: 'externalFunction',
        className: 'ExternalFunction',
        description: 'Implements Snowflake external function interface for calling Mixpeek from SQL',
        methods: ['handler', 'validate', 'formatResponse', 'getDefinition']
      },
      {
        name: 'streamProcessor',
        className: 'StreamProcessor',
        description: 'Processes Snowflake streams/tasks to enrich new and changed data via Mixpeek',
        methods: ['processStream', 'createTask', 'start', 'stop', 'getStatus']
      }
    ]
  },
  {
    name: 'databricks',
    package: '@mixpeek/databricks',
    description: 'Databricks integration for Mixpeek — notebook helpers, Delta Lake integration, and Unity Catalog connector',
    keywords: ['databricks', 'delta-lake', 'unity-catalog', 'lakehouse', 'spark', 'data-pipeline'],
    loggerPrefix: '[Mixpeek-Databricks]',
    cacheKeyPrefix: 'mixpeek_dbx_',
    userAgent: 'Mixpeek-Databricks-Connector/1.0.0',
    category: 'pipeline',
    peerDependencies: { '@databricks/sql': '>=1.0.0' },
    modules: [
      {
        name: 'notebookHelper',
        className: 'NotebookHelper',
        description: 'Helper functions for using Mixpeek enrichment within Databricks notebooks',
        methods: ['enrich', 'enrichColumn', 'search', 'display', 'configure']
      },
      {
        name: 'deltaLakeIntegration',
        className: 'DeltaLakeIntegration',
        description: 'Reads from and writes enrichment results to Delta Lake tables',
        methods: ['readTable', 'writeTable', 'mergeTable', 'getSchema', 'setTable']
      },
      {
        name: 'unityConnector',
        className: 'UnityConnector',
        description: 'Unity Catalog integration for registering Mixpeek as an external data source',
        methods: ['register', 'unregister', 'createFunction', 'getConnection', 'listTables']
      }
    ]
  }
];

export default connectors;
