/**
 * Live API Tests — @mixpeek/openai
 *
 * Tests against the real Mixpeek API. Requires MIXPEEK_API_KEY.
 */
import { createEmbeddingBridge } from '../../src/modules/embeddingBridge.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { liveTestConfig, skipIfNotConfigured } from './setup.js';

describe('Openai Live API Tests', () => {
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

  describe('EmbeddingBridge Integration', () => {
    (shouldSkip ? it.skip : it)('should initialize with live API', () => {
      const instance = createEmbeddingBridge({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });
      expect(instance).toBeDefined();
      instance.destroy();
    });
  });
});
