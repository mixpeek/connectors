/**
 * Jest Configuration — Live API Tests (ESM)
 *
 * Requires: MIXPEEK_API_KEY
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/live-api/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/live-api/setup.js'],
  moduleNameMapper: {}
};
