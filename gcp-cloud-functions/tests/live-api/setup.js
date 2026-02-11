/**
 * Live API Test Setup for @mixpeek/gcp-functions
 *
 * Requires: MIXPEEK_API_KEY
 */

const requiredEnvVars = ['MIXPEEK_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`Live API tests skipped — missing: ${missingVars.join(', ')}`);
}

export const liveTestConfig = {
  apiKey: process.env.MIXPEEK_API_KEY || '',
  endpoint: process.env.MIXPEEK_ENDPOINT || 'https://api.mixpeek.com',
  isConfigured: missingVars.length === 0
};

export function skipIfNotConfigured() { return !liveTestConfig.isConfigured; }

beforeAll(() => {
  if (!liveTestConfig.isConfigured) console.log('Live API tests will be skipped');
  else console.log('Live API tests configured for:', liveTestConfig.endpoint);
});

jest.setTimeout(60000);
global.fetch = globalThis.fetch;
