/**
 * Unit Tests - Mixpeek API Client
 */

import { createClient, MixpeekClient } from '../../../src/api/mixpeekClient.js';

describe('MixpeekClient', () => {
  const validConfig = {
    apiKey: 'test-api-key',
    collectionId: 'col_123',
    namespace: 'ns_test'
  };

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = createClient(validConfig);
      expect(client).toBeInstanceOf(MixpeekClient);
    });

    it('should throw error without apiKey', () => {
      expect(() => createClient({ collectionId: 'col', namespace: 'ns' }))
        .toThrow('API key is required');
    });

    it('should throw error without collectionId', () => {
      expect(() => createClient({ apiKey: 'key', namespace: 'ns' }))
        .toThrow('Collection ID is required');
    });

    it('should throw error without namespace', () => {
      expect(() => createClient({ apiKey: 'key', collectionId: 'col' }))
        .toThrow('Namespace is required');
    });

    it('should use default endpoint', () => {
      const client = createClient(validConfig);
      expect(client.endpoint).toBe('https://api.mixpeek.com');
    });

    it('should allow custom endpoint', () => {
      const client = createClient({
        ...validConfig,
        endpoint: 'https://custom.api.com'
      });
      expect(client.endpoint).toBe('https://custom.api.com');
    });

    it('should remove trailing slash from endpoint', () => {
      const client = createClient({
        ...validConfig,
        endpoint: 'https://api.example.com/'
      });
      expect(client.endpoint).toBe('https://api.example.com');
    });
  });

  describe('createDocument', () => {
    let client;

    beforeEach(() => {
      client = createClient(validConfig);
    });

    it('should create document successfully', async () => {
      const mockResponse = {
        id: 'doc-123',
        document_id: 'doc-123',
        status: 'created'
      };

      global.fetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await client.createDocument({
        content: { url: 'https://example.com' }
      });

      expect(result.id).toBe('doc-123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/collections/col_123/documents'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });

    it('should add metadata to document', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ id: 'doc-123' }));

      await client.createDocument({
        content: { url: 'https://example.com' },
        metadata: { custom: 'value' }
      });

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.namespace).toBe('ns_test');
      expect(body.metadata.source).toBe('openrtb-connector');
      expect(body.metadata.custom).toBe('value');
    });
  });

  describe('processContent', () => {
    let client;

    beforeEach(() => {
      client = createClient(validConfig);
    });

    it('should process content and return enrichments', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        id: 'doc-123',
        keywords: ['tech', 'news'],
        sentiment: { sentiment: 'positive', score: 0.8 }
      }));

      const result = await client.processContent({
        url: 'https://example.com',
        title: 'Tech News',
        text: 'Latest technology updates'
      });

      expect(result.success).toBe(true);
      expect(result.enrichments.keywords).toContain('tech');
      expect(result.source).toBe('api');
    });

    it('should fallback to local enrichments on API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.processContent({
        url: 'https://example.com',
        title: 'Tech News',
        text: 'Technology and software development'
      });

      expect(result.success).toBe(false);
      expect(result.source).toBe('fallback');
      expect(result.enrichments.keywords).toBeDefined();
      expect(result.enrichments.sentiment).toBeDefined();
    });

    it('should handle timeout', async () => {
      const client = createClient({
        ...validConfig,
        timeout: 10 // Very short timeout
      });

      global.fetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      const result = await client.processContent({
        url: 'https://example.com',
        title: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.source).toBe('fallback');
    });
  });

  describe('healthCheck', () => {
    let client;

    beforeEach(() => {
      client = createClient(validConfig);
    });

    it('should return healthy status', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));

      const result = await client.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeDefined();
    });

    it('should return unhealthy on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await client.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeDefined();
    });
  });

  describe('buildLocalEnrichments', () => {
    let client;

    beforeEach(() => {
      client = createClient(validConfig);
    });

    it('should build enrichments from content', () => {
      const enrichments = client.buildLocalEnrichments({
        title: 'Technology News',
        text: 'Latest updates on software and computer technology'
      });

      expect(enrichments.keywords).toBeDefined();
      expect(enrichments.sentiment).toBeDefined();
      expect(enrichments.categories).toBeDefined();
      expect(enrichments.documentId).toBeNull();
    });
  });
});
