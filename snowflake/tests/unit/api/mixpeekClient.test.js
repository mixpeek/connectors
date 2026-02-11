/**
 * Unit Tests — MixpeekClient for @mixpeek/snowflake
 */
import { createClient, MixpeekClient } from '../../../src/api/mixpeekClient.js';

describe('MixpeekClient', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = createClient(validConfig);
      expect(client).toBeInstanceOf(MixpeekClient);
    });

    it('should throw without apiKey', () => {
      expect(() => createClient({})).toThrow('API key is required');
    });

    it('should use default endpoint', () => {
      const client = createClient(validConfig);
      expect(client.endpoint).toBe('https://api.mixpeek.com');
    });

    it('should allow custom endpoint', () => {
      const client = createClient({ ...validConfig, endpoint: 'https://custom.api.com' });
      expect(client.endpoint).toBe('https://custom.api.com');
    });
  });

  describe('healthCheck', () => {
    let client;
    beforeEach(() => { client = createClient(validConfig); });

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

  describe('search', () => {
    let client;
    beforeEach(() => { client = createClient(validConfig); });

    it('should call search endpoint', async () => {
      const mockResults = { results: [{ id: '1', score: 0.95 }] };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResults));

      const result = await client.search({ text: 'test query' });
      expect(result.results).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/features/search'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('retry logic', () => {
    let client;
    beforeEach(() => { client = createClient({ ...validConfig, timeout: 5000 }); });

    it('should retry on failure', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockResponse({ ok: true }));

      const result = await client.healthCheck();
      expect(result.status).toBe('healthy');
    });
  });
});
