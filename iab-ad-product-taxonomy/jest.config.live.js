/**
 * Jest Configuration - Live API Tests
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/live-api/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  injectGlobals: true
};
