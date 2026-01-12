/**
 * Live API Test Setup
 *
 * Configuration for tests against the real Mixpeek API.
 *
 * Required environment variables:
 * - MIXPEEK_API_KEY: Your Mixpeek API key
 * - MIXPEEK_COLLECTION_ID: Collection ID to use for tests
 * - MIXPEEK_NAMESPACE: Namespace for test data isolation
 */

// Check for required environment variables
const requiredEnvVars = [
  'MIXPEEK_API_KEY',
  'MIXPEEK_COLLECTION_ID',
  'MIXPEEK_NAMESPACE'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`
╔════════════════════════════════════════════════════════════════╗
║  LIVE API TESTS SKIPPED                                        ║
║                                                                ║
║  Missing required environment variables:                       ║
║  ${missingVars.join(', ').padEnd(60)}║
║                                                                ║
║  To run live API tests, set these variables:                   ║
║                                                                ║
║  export MIXPEEK_API_KEY="your_api_key"                        ║
║  export MIXPEEK_COLLECTION_ID="col_xxxxx"                     ║
║  export MIXPEEK_NAMESPACE="ns_xxxxx"                          ║
║                                                                ║
║  Then run: npm run test:live                                   ║
╚════════════════════════════════════════════════════════════════╝
`);
}

// Export configuration
export const liveTestConfig = {
  apiKey: process.env.MIXPEEK_API_KEY || '',
  collectionId: process.env.MIXPEEK_COLLECTION_ID || '',
  namespace: process.env.MIXPEEK_NAMESPACE || '',
  endpoint: process.env.MIXPEEK_ENDPOINT || 'https://api.mixpeek.com',
  isConfigured: missingVars.length === 0
};

// Skip helper for tests
export function skipIfNotConfigured() {
  if (!liveTestConfig.isConfigured) {
    return true;
  }
  return false;
}

// Jest global setup
beforeAll(() => {
  if (!liveTestConfig.isConfigured) {
    console.log('Live API tests will be skipped - missing configuration');
  } else {
    console.log('Live API tests configured for:', liveTestConfig.endpoint);
  }
});

// Increase timeout for live tests
jest.setTimeout(60000);

// Real fetch for live tests (don't mock)
global.fetch = globalThis.fetch;
