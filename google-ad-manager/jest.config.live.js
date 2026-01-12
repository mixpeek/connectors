/**
 * Jest Configuration for Live API Tests
 *
 * Run with: MIXPEEK_API_KEY=your_key npm run test:live
 */

export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: [
    '**/tests/live/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  verbose: true,
  testTimeout: 30000
}
