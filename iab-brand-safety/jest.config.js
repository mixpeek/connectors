/**
 * Jest Configuration
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 10000,
  verbose: true
};
