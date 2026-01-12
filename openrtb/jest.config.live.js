/**
 * Jest Configuration - Live API Tests (ESM)
 *
 * Requires environment variables:
 * - MIXPEEK_API_KEY
 * - MIXPEEK_COLLECTION_ID
 * - MIXPEEK_NAMESPACE
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/live-api/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/live-api/setup.js'],
  // ESM support
  moduleNameMapper: {}
};
