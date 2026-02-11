/**
 * Live API Tests — @mixpeek/datadog
 *
 * Tests against the real Mixpeek API. Requires MIXPEEK_API_KEY.
 */
import { createMetricsReporter } from '../../src/modules/metricsReporter.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { liveTestConfig, skipIfNotConfigured } from './setup.js';

describe('Datadog Live API Tests', () => {
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

  describe('MetricsReporter Integration', () => {
    (shouldSkip ? it.skip : it)('should initialize with live API', () => {
      const instance = createMetricsReporter({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });
      expect(instance).toBeDefined();
      instance.destroy();
    });
  });
});
