/**
 * Live API Tests — @mixpeek/langchain
 *
 * Tests against the real Mixpeek API. Requires MIXPEEK_API_KEY.
 */
import { createMixpeekRetriever } from '../../src/modules/mixpeekRetriever.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { liveTestConfig, skipIfNotConfigured } from './setup.js';

describe('Langchain Live API Tests', () => {
  const shouldSkip = skipIfNotConfigured();

  describe('API Connectivity', () => {
    (shouldSkip ? it.skip : it)('should connect to Mixpeek API', async () => {
      const client = createClient({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });

      const health = await client.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.latency).toBeLessThan(5000);
    });
  });

  describe('MixpeekRetriever Integration', () => {
    (shouldSkip ? it.skip : it)('should initialize with live API', () => {
      const instance = createMixpeekRetriever({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });
      expect(instance).toBeDefined();
      instance.destroy();
    });
  });
});
