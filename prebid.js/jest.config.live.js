/**
 * Jest configuration for live API tests
 */

module.exports = {
  displayName: 'live-api',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/live-api/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/live-api/setup.js'],
  testTimeout: 30000, // 30 seconds for API calls
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ]
}

