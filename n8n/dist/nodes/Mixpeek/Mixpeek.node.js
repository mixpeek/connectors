"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mixpeek = void 0;
const n8n_workflow_1 = require("n8n-workflow");
// Helper functions outside the class
function getMethod(operation) {
    switch (operation) {
        case 'create':
            return 'POST';
        case 'update':
            return 'PATCH';
        case 'delete':
            return 'DELETE';
        case 'list':
            return 'POST';
        case 'execute':
            return 'POST';
        case 'explain':
            return 'POST';
        case 'confirm':
            return 'POST';
        default:
            return 'GET';
    }
}
function buildNamespaceRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('namespaceName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.metadata) {
                body.metadata = JSON.parse(additionalFields.metadata);
            }
            return '/v1/namespaces';
        }
        case 'get': {
            const namespaceId = ctx.getNodeParameter('namespaceId', index);
            return `/v1/namespaces/${namespaceId}`;
        }
        case 'update': {
            const namespaceId = ctx.getNodeParameter('namespaceId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            if (additionalFields.metadata) {
                body.metadata = JSON.parse(additionalFields.metadata);
            }
            return `/v1/namespaces/${namespaceId}`;
        }
        case 'delete': {
            const namespaceId = ctx.getNodeParameter('namespaceId', index);
            return `/v1/namespaces/${namespaceId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/namespaces/list';
        }
        default:
            return '/v1/namespaces/list';
    }
}
function buildBucketRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('bucketName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.schema) {
                body.schema = JSON.parse(additionalFields.schema);
            }
            return '/v1/buckets';
        }
        case 'get': {
            const bucketId = ctx.getNodeParameter('bucketId', index);
            return `/v1/buckets/${bucketId}`;
        }
        case 'update': {
            const bucketId = ctx.getNodeParameter('bucketId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            if (additionalFields.schema) {
                body.schema = JSON.parse(additionalFields.schema);
            }
            return `/v1/buckets/${bucketId}`;
        }
        case 'delete': {
            const bucketId = ctx.getNodeParameter('bucketId', index);
            return `/v1/buckets/${bucketId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/buckets/list';
        }
        default:
            return '/v1/buckets/list';
    }
}
function buildCollectionRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('collectionName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.extractors) {
                body.extractors = JSON.parse(additionalFields.extractors);
            }
            return '/v1/collections';
        }
        case 'get': {
            const collectionId = ctx.getNodeParameter('collectionId', index);
            return `/v1/collections/${collectionId}`;
        }
        case 'update': {
            const collectionId = ctx.getNodeParameter('collectionId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            if (additionalFields.extractors) {
                body.extractors = JSON.parse(additionalFields.extractors);
            }
            return `/v1/collections/${collectionId}`;
        }
        case 'delete': {
            const collectionId = ctx.getNodeParameter('collectionId', index);
            return `/v1/collections/${collectionId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/collections/list';
        }
        default:
            return '/v1/collections/list';
    }
}
function buildDocumentRequest(ctx, index, operation, body) {
    const collectionId = ctx.getNodeParameter('collectionId', index);
    switch (operation) {
        case 'create': {
            const documentData = ctx.getNodeParameter('documentData', index);
            Object.assign(body, JSON.parse(documentData));
            return `/v1/collections/${collectionId}/documents`;
        }
        case 'get': {
            const documentId = ctx.getNodeParameter('documentId', index);
            return `/v1/collections/${collectionId}/documents/${documentId}`;
        }
        case 'update': {
            const documentId = ctx.getNodeParameter('documentId', index);
            const updateData = ctx.getNodeParameter('updateData', index);
            Object.assign(body, JSON.parse(updateData));
            return `/v1/collections/${collectionId}/documents/${documentId}`;
        }
        case 'delete': {
            const documentId = ctx.getNodeParameter('documentId', index);
            return `/v1/collections/${collectionId}/documents/${documentId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return `/v1/collections/${collectionId}/documents/list`;
        }
        default:
            return `/v1/collections/${collectionId}/documents/list`;
    }
}
function buildRetrieverRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('retrieverName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.stages) {
                body.stages = JSON.parse(additionalFields.stages);
            }
            return '/v1/retrievers';
        }
        case 'get': {
            const retrieverId = ctx.getNodeParameter('retrieverId', index);
            return `/v1/retrievers/${retrieverId}`;
        }
        case 'update': {
            const retrieverId = ctx.getNodeParameter('retrieverId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            if (additionalFields.stages) {
                body.stages = JSON.parse(additionalFields.stages);
            }
            return `/v1/retrievers/${retrieverId}`;
        }
        case 'delete': {
            const retrieverId = ctx.getNodeParameter('retrieverId', index);
            return `/v1/retrievers/${retrieverId}`;
        }
        case 'execute': {
            const retrieverId = ctx.getNodeParameter('retrieverId', index);
            const query = ctx.getNodeParameter('query', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { inputs: { query } }, additionalFields);
            if (additionalFields.filters) {
                body.filters = JSON.parse(additionalFields.filters);
            }
            return `/v1/retrievers/${retrieverId}/execute`;
        }
        case 'explain': {
            const retrieverId = ctx.getNodeParameter('retrieverId', index);
            const query = ctx.getNodeParameter('query', index);
            Object.assign(body, { inputs: { query } });
            return `/v1/retrievers/${retrieverId}/execute/explain`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/retrievers/list';
        }
        default:
            return '/v1/retrievers/list';
    }
}
function buildUploadRequest(ctx, index, operation, body) {
    const bucketId = ctx.getNodeParameter('bucketId', index);
    switch (operation) {
        case 'create': {
            const filename = ctx.getNodeParameter('filename', index);
            const contentType = ctx.getNodeParameter('contentType', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { filename, content_type: contentType }, additionalFields);
            if (additionalFields.metadata) {
                body.metadata = JSON.parse(additionalFields.metadata);
            }
            return `/v1/buckets/${bucketId}/uploads`;
        }
        case 'get': {
            const uploadId = ctx.getNodeParameter('uploadId', index);
            return `/v1/buckets/${bucketId}/uploads/${uploadId}`;
        }
        case 'confirm': {
            const uploadId = ctx.getNodeParameter('uploadId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            return `/v1/buckets/${bucketId}/uploads/${uploadId}/confirm`;
        }
        case 'delete': {
            const uploadId = ctx.getNodeParameter('uploadId', index);
            return `/v1/buckets/${bucketId}/uploads/${uploadId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return `/v1/buckets/${bucketId}/uploads/list`;
        }
        default:
            return `/v1/buckets/${bucketId}/uploads/list`;
    }
}
function buildTaskRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'get': {
            const taskId = ctx.getNodeParameter('taskId', index);
            return `/v1/tasks/${taskId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/tasks/list';
        }
        default:
            return '/v1/tasks/list';
    }
}
function buildInferenceBody(ctx, index) {
    const model = ctx.getNodeParameter('model', index);
    const input = ctx.getNodeParameter('input', index);
    const additionalFields = ctx.getNodeParameter('additionalFields', index);
    const body = {
        model,
        input: JSON.parse(input),
    };
    if (additionalFields.parameters) {
        body.parameters = JSON.parse(additionalFields.parameters);
    }
    return body;
}
function buildTaxonomyRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('taxonomyName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.categories) {
                body.categories = JSON.parse(additionalFields.categories);
            }
            return '/v1/taxonomies';
        }
        case 'get': {
            const taxonomyId = ctx.getNodeParameter('taxonomyId', index);
            return `/v1/taxonomies/${taxonomyId}`;
        }
        case 'update': {
            const taxonomyId = ctx.getNodeParameter('taxonomyId', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, additionalFields);
            if (additionalFields.categories) {
                body.categories = JSON.parse(additionalFields.categories);
            }
            return `/v1/taxonomies/${taxonomyId}`;
        }
        case 'delete': {
            const taxonomyId = ctx.getNodeParameter('taxonomyId', index);
            return `/v1/taxonomies/${taxonomyId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/taxonomies/list';
        }
        default:
            return '/v1/taxonomies/list';
    }
}
function buildClusterRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const name = ctx.getNodeParameter('clusterName', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { name }, additionalFields);
            if (additionalFields.configuration) {
                body.configuration = JSON.parse(additionalFields.configuration);
            }
            return '/v1/clusters';
        }
        case 'get': {
            const clusterId = ctx.getNodeParameter('clusterId', index);
            return `/v1/clusters/${clusterId}`;
        }
        case 'execute': {
            const clusterId = ctx.getNodeParameter('clusterId', index);
            return `/v1/clusters/${clusterId}/execute`;
        }
        case 'delete': {
            const clusterId = ctx.getNodeParameter('clusterId', index);
            return `/v1/clusters/${clusterId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/clusters/list';
        }
        default:
            return '/v1/clusters/list';
    }
}
function buildWebhookRequest(ctx, index, operation, body) {
    switch (operation) {
        case 'create': {
            const url = ctx.getNodeParameter('webhookUrl', index);
            const events = ctx.getNodeParameter('events', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { url, events }, additionalFields);
            return '/v1/organizations/webhooks';
        }
        case 'get': {
            const webhookId = ctx.getNodeParameter('webhookId', index);
            return `/v1/organizations/webhooks/${webhookId}`;
        }
        case 'update': {
            const webhookId = ctx.getNodeParameter('webhookId', index);
            const events = ctx.getNodeParameter('events', index);
            const additionalFields = ctx.getNodeParameter('additionalFields', index);
            Object.assign(body, { events }, additionalFields);
            return `/v1/organizations/webhooks/${webhookId}`;
        }
        case 'delete': {
            const webhookId = ctx.getNodeParameter('webhookId', index);
            return `/v1/organizations/webhooks/${webhookId}`;
        }
        case 'list': {
            const pagination = ctx.getNodeParameter('pagination', index, {});
            Object.assign(body, pagination);
            return '/v1/organizations/webhooks/list';
        }
        default:
            return '/v1/organizations/webhooks/list';
    }
}
class Mixpeek {
    constructor() {
        this.description = {
            displayName: 'Mixpeek',
            name: 'mixpeek',
            icon: 'file:mixpeek.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with Mixpeek multimodal data processing and semantic search API',
            defaults: {
                name: 'Mixpeek',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                {
                    name: 'mixpeekApi',
                    required: true,
                },
            ],
            properties: [
                // Resource selector
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        { name: 'Bucket', value: 'bucket' },
                        { name: 'Collection', value: 'collection' },
                        { name: 'Cluster', value: 'cluster' },
                        { name: 'Document', value: 'document' },
                        { name: 'Inference', value: 'inference' },
                        { name: 'Namespace', value: 'namespace' },
                        { name: 'Retriever', value: 'retriever' },
                        { name: 'Task', value: 'task' },
                        { name: 'Taxonomy', value: 'taxonomy' },
                        { name: 'Upload', value: 'upload' },
                        { name: 'Webhook', value: 'webhook' },
                    ],
                    default: 'namespace',
                },
                // ==================== NAMESPACE OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['namespace'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a namespace' },
                        { name: 'Delete', value: 'delete', action: 'Delete a namespace' },
                        { name: 'Get', value: 'get', action: 'Get a namespace' },
                        { name: 'List', value: 'list', action: 'List namespaces' },
                        { name: 'Update', value: 'update', action: 'Update a namespace' },
                    ],
                    default: 'list',
                },
                // Namespace fields
                {
                    displayName: 'Namespace ID',
                    name: 'namespaceId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['namespace'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                    description: 'The ID of the namespace',
                },
                {
                    displayName: 'Namespace Name',
                    name: 'namespaceName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['namespace'],
                            operation: ['create'],
                        },
                    },
                    description: 'The name for the new namespace',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['namespace'],
                            operation: ['create', 'update'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Metadata (JSON)',
                            name: 'metadata',
                            type: 'json',
                            default: '{}',
                            description: 'Additional metadata as JSON',
                        },
                    ],
                },
                // ==================== BUCKET OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['bucket'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a bucket' },
                        { name: 'Delete', value: 'delete', action: 'Delete a bucket' },
                        { name: 'Get', value: 'get', action: 'Get a bucket' },
                        { name: 'List', value: 'list', action: 'List buckets' },
                        { name: 'Update', value: 'update', action: 'Update a bucket' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Bucket ID',
                    name: 'bucketId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['bucket'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Bucket Name',
                    name: 'bucketName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['bucket'],
                            operation: ['create'],
                        },
                    },
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['bucket'],
                            operation: ['create', 'update'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Schema (JSON)',
                            name: 'schema',
                            type: 'json',
                            default: '{}',
                            description: 'Bucket schema definition',
                        },
                        {
                            displayName: 'Namespace ID',
                            name: 'namespace_id',
                            type: 'string',
                            default: '',
                        },
                    ],
                },
                // ==================== COLLECTION OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['collection'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a collection' },
                        { name: 'Delete', value: 'delete', action: 'Delete a collection' },
                        { name: 'Get', value: 'get', action: 'Get a collection' },
                        { name: 'List', value: 'list', action: 'List collections' },
                        { name: 'Update', value: 'update', action: 'Update a collection' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Collection ID',
                    name: 'collectionId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['collection'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Collection Name',
                    name: 'collectionName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['collection'],
                            operation: ['create'],
                        },
                    },
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['collection'],
                            operation: ['create', 'update'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Bucket ID',
                            name: 'bucket_id',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Extractors (JSON)',
                            name: 'extractors',
                            type: 'json',
                            default: '[]',
                            description: 'Feature extractors configuration',
                        },
                        {
                            displayName: 'Namespace ID',
                            name: 'namespace_id',
                            type: 'string',
                            default: '',
                        },
                    ],
                },
                // ==================== DOCUMENT OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['document'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a document' },
                        { name: 'Delete', value: 'delete', action: 'Delete a document' },
                        { name: 'Get', value: 'get', action: 'Get a document' },
                        { name: 'List', value: 'list', action: 'List documents' },
                        { name: 'Update', value: 'update', action: 'Update a document' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Collection ID',
                    name: 'collectionId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['document'],
                        },
                    },
                    description: 'The collection ID containing the documents',
                },
                {
                    displayName: 'Document ID',
                    name: 'documentId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['document'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Document Data (JSON)',
                    name: 'documentData',
                    type: 'json',
                    default: '{}',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['document'],
                            operation: ['create'],
                        },
                    },
                    description: 'The document data as JSON',
                },
                {
                    displayName: 'Update Data (JSON)',
                    name: 'updateData',
                    type: 'json',
                    default: '{}',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['document'],
                            operation: ['update'],
                        },
                    },
                },
                // ==================== RETRIEVER OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['retriever'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a retriever' },
                        { name: 'Delete', value: 'delete', action: 'Delete a retriever' },
                        { name: 'Execute', value: 'execute', action: 'Execute a retriever search' },
                        { name: 'Explain', value: 'explain', action: 'Explain retriever execution plan' },
                        { name: 'Get', value: 'get', action: 'Get a retriever' },
                        { name: 'List', value: 'list', action: 'List retrievers' },
                        { name: 'Update', value: 'update', action: 'Update a retriever' },
                    ],
                    default: 'execute',
                },
                {
                    displayName: 'Retriever ID',
                    name: 'retrieverId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['retriever'],
                            operation: ['get', 'update', 'delete', 'execute', 'explain'],
                        },
                    },
                },
                {
                    displayName: 'Retriever Name',
                    name: 'retrieverName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['retriever'],
                            operation: ['create'],
                        },
                    },
                },
                {
                    displayName: 'Query',
                    name: 'query',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['retriever'],
                            operation: ['execute', 'explain'],
                        },
                    },
                    description: 'The search query text',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['retriever'],
                            operation: ['create', 'update', 'execute'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Stages (JSON)',
                            name: 'stages',
                            type: 'json',
                            default: '[]',
                            description: 'Retriever pipeline stages configuration',
                        },
                        {
                            displayName: 'Filters (JSON)',
                            name: 'filters',
                            type: 'json',
                            default: '{}',
                            description: 'Query filters',
                        },
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 10,
                            description: 'Maximum number of results',
                        },
                        {
                            displayName: 'Namespace ID',
                            name: 'namespace_id',
                            type: 'string',
                            default: '',
                        },
                    ],
                },
                // ==================== UPLOAD OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                        },
                    },
                    options: [
                        { name: 'Confirm', value: 'confirm', action: 'Confirm an upload' },
                        { name: 'Create Presigned URL', value: 'create', action: 'Create presigned upload URL' },
                        { name: 'Delete', value: 'delete', action: 'Delete an upload' },
                        { name: 'Get', value: 'get', action: 'Get upload details' },
                        { name: 'List', value: 'list', action: 'List uploads' },
                    ],
                    default: 'create',
                },
                {
                    displayName: 'Bucket ID',
                    name: 'bucketId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                        },
                    },
                },
                {
                    displayName: 'Upload ID',
                    name: 'uploadId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                            operation: ['get', 'confirm', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Filename',
                    name: 'filename',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                            operation: ['create'],
                        },
                    },
                    description: 'The name of the file to upload',
                },
                {
                    displayName: 'Content Type',
                    name: 'contentType',
                    type: 'string',
                    default: 'application/octet-stream',
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                            operation: ['create'],
                        },
                    },
                    description: 'The MIME type of the file',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['upload'],
                            operation: ['create', 'confirm'],
                        },
                    },
                    options: [
                        {
                            displayName: 'File Hash',
                            name: 'file_hash',
                            type: 'string',
                            default: '',
                            description: 'SHA-256 hash for deduplication',
                        },
                        {
                            displayName: 'Metadata (JSON)',
                            name: 'metadata',
                            type: 'json',
                            default: '{}',
                        },
                        {
                            displayName: 'ETag',
                            name: 'etag',
                            type: 'string',
                            default: '',
                            description: 'ETag from S3 upload response (for confirm)',
                        },
                        {
                            displayName: 'File Size',
                            name: 'file_size',
                            type: 'number',
                            default: 0,
                            description: 'File size in bytes (for confirm)',
                        },
                    ],
                },
                // ==================== TASK OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['task'],
                        },
                    },
                    options: [
                        { name: 'Get', value: 'get', action: 'Get task status' },
                        { name: 'List', value: 'list', action: 'List tasks' },
                    ],
                    default: 'get',
                },
                {
                    displayName: 'Task ID',
                    name: 'taskId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['task'],
                            operation: ['get'],
                        },
                    },
                },
                // ==================== INFERENCE OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['inference'],
                        },
                    },
                    options: [
                        { name: 'Execute', value: 'execute', action: 'Execute inference' },
                    ],
                    default: 'execute',
                },
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['inference'],
                            operation: ['execute'],
                        },
                    },
                    description: 'The model to use (e.g., openai/gpt-4, anthropic/claude-3)',
                },
                {
                    displayName: 'Input (JSON)',
                    name: 'input',
                    type: 'json',
                    default: '{}',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['inference'],
                            operation: ['execute'],
                        },
                    },
                    description: 'The input for the model',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['inference'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Parameters (JSON)',
                            name: 'parameters',
                            type: 'json',
                            default: '{}',
                            description: 'Model-specific parameters',
                        },
                    ],
                },
                // ==================== TAXONOMY OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['taxonomy'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a taxonomy' },
                        { name: 'Delete', value: 'delete', action: 'Delete a taxonomy' },
                        { name: 'Get', value: 'get', action: 'Get a taxonomy' },
                        { name: 'List', value: 'list', action: 'List taxonomies' },
                        { name: 'Update', value: 'update', action: 'Update a taxonomy' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Taxonomy ID',
                    name: 'taxonomyId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['taxonomy'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Taxonomy Name',
                    name: 'taxonomyName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['taxonomy'],
                            operation: ['create'],
                        },
                    },
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['taxonomy'],
                            operation: ['create', 'update'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Categories (JSON)',
                            name: 'categories',
                            type: 'json',
                            default: '[]',
                            description: 'Taxonomy categories',
                        },
                        {
                            displayName: 'Namespace ID',
                            name: 'namespace_id',
                            type: 'string',
                            default: '',
                        },
                    ],
                },
                // ==================== CLUSTER OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['cluster'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a cluster' },
                        { name: 'Delete', value: 'delete', action: 'Delete a cluster' },
                        { name: 'Execute', value: 'execute', action: 'Execute clustering' },
                        { name: 'Get', value: 'get', action: 'Get a cluster' },
                        { name: 'List', value: 'list', action: 'List clusters' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Cluster ID',
                    name: 'clusterId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['cluster'],
                            operation: ['get', 'delete', 'execute'],
                        },
                    },
                },
                {
                    displayName: 'Cluster Name',
                    name: 'clusterName',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['cluster'],
                            operation: ['create'],
                        },
                    },
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['cluster'],
                            operation: ['create'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Description',
                            name: 'description',
                            type: 'string',
                            default: '',
                        },
                        {
                            displayName: 'Configuration (JSON)',
                            name: 'configuration',
                            type: 'json',
                            default: '{}',
                            description: 'Clustering configuration',
                        },
                        {
                            displayName: 'Namespace ID',
                            name: 'namespace_id',
                            type: 'string',
                            default: '',
                        },
                    ],
                },
                // ==================== WEBHOOK OPERATIONS ====================
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                        },
                    },
                    options: [
                        { name: 'Create', value: 'create', action: 'Create a webhook' },
                        { name: 'Delete', value: 'delete', action: 'Delete a webhook' },
                        { name: 'Get', value: 'get', action: 'Get a webhook' },
                        { name: 'List', value: 'list', action: 'List webhooks' },
                        { name: 'Update', value: 'update', action: 'Update a webhook' },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Webhook ID',
                    name: 'webhookId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['get', 'update', 'delete'],
                        },
                    },
                },
                {
                    displayName: 'Webhook URL',
                    name: 'webhookUrl',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create'],
                        },
                    },
                    description: 'The URL to receive webhook events',
                },
                {
                    displayName: 'Events',
                    name: 'events',
                    type: 'multiOptions',
                    options: [
                        { name: 'Document Created', value: 'document.created' },
                        { name: 'Document Updated', value: 'document.updated' },
                        { name: 'Document Deleted', value: 'document.deleted' },
                        { name: 'Upload Completed', value: 'upload.completed' },
                        { name: 'Task Completed', value: 'task.completed' },
                        { name: 'Task Failed', value: 'task.failed' },
                    ],
                    default: [],
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create', 'update'],
                        },
                    },
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create', 'update'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Secret',
                            name: 'secret',
                            type: 'string',
                            typeOptions: { password: true },
                            default: '',
                            description: 'Secret for webhook signature verification',
                        },
                        {
                            displayName: 'Active',
                            name: 'active',
                            type: 'boolean',
                            default: true,
                        },
                    ],
                },
                // ==================== PAGINATION OPTIONS (shared) ====================
                {
                    displayName: 'Pagination',
                    name: 'pagination',
                    type: 'collection',
                    placeholder: 'Add Pagination',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['list'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 50,
                            description: 'Maximum number of items to return',
                        },
                        {
                            displayName: 'Offset',
                            name: 'offset',
                            type: 'number',
                            default: 0,
                            description: 'Number of items to skip',
                        },
                        {
                            displayName: 'Cursor',
                            name: 'cursor',
                            type: 'string',
                            default: '',
                            description: 'Pagination cursor for next page',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('mixpeekApi');
        const baseUrl = credentials.baseUrl || 'https://api.mixpeek.com';
        for (let i = 0; i < items.length; i++) {
            try {
                let endpoint = '';
                let method = 'GET';
                let body = {};
                // Build request based on resource and operation
                switch (resource) {
                    case 'namespace':
                        endpoint = buildNamespaceRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'bucket':
                        endpoint = buildBucketRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'collection':
                        endpoint = buildCollectionRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'document':
                        endpoint = buildDocumentRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'retriever':
                        endpoint = buildRetrieverRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'upload':
                        endpoint = buildUploadRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'task':
                        endpoint = buildTaskRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'inference':
                        endpoint = '/v1/inference';
                        method = 'POST';
                        body = buildInferenceBody(this, i);
                        break;
                    case 'taxonomy':
                        endpoint = buildTaxonomyRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'cluster':
                        endpoint = buildClusterRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    case 'webhook':
                        endpoint = buildWebhookRequest(this, i, operation, body);
                        method = getMethod(operation);
                        break;
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
                }
                // Make the API request
                const response = await this.helpers.httpRequest({
                    method,
                    url: `${baseUrl}${endpoint}`,
                    body: Object.keys(body).length > 0 ? body : undefined,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${credentials.apiKey}`,
                    },
                    json: true,
                });
                returnData.push({ json: response });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Mixpeek = Mixpeek;
//# sourceMappingURL=Mixpeek.node.js.map