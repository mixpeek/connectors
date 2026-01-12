/**
 * Jest Configuration - E2E Tests
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/e2e/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  injectGlobals: true
};
