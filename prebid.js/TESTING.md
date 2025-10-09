# Testing Guide

This document explains how to test the Mixpeek Context Adapter.

## Test Suites

### 1. Unit Tests

Test individual modules in isolation with mocked dependencies.

**Location**: `tests/unit/`

**Run**:
```bash
npm test
```

**Coverage**:
```bash
npm run test:coverage
```

**What's Tested**:
- Helper utilities
- Cache manager
- API client (mocked)
- Content extractors
- Configuration validation

**Example Output**:
```
 PASS  tests/unit/helpers.test.js
 PASS  tests/unit/cacheManager.test.js
 PASS  tests/unit/mixpeekClient.test.js

Test Suites: 3 passed, 3 total
Tests:       42 passed, 42 total
Coverage:    87.3%
```

### 2. Integration Tests

Test module interactions with mocked API responses.

**Location**: `tests/integration/`

**Run**:
```bash
npm test tests/integration/
```

**What's Tested**:
- Full adapter initialization
- Ad unit enrichment flow
- Event emission
- Error handling
- Cache integration

### 3. Live API Tests

Test against the real Mixpeek API (requires credentials).

**Location**: `tests/live-api/`

**Setup**:
```bash
# Set your API key
export MIXPEEK_API_KEY="sk_your_api_key"
export MIXPEEK_COLLECTION_ID="col_your_collection"
```

**Run**:
```bash
npm run test:live
```

**What's Tested**:
- Real API connectivity
- Document creation and retrieval
- Feature extractors
- Taxonomy classification
- Performance timing
- Error recovery

See [tests/live-api/README.md](tests/live-api/README.md) for detailed instructions.

## Running Tests

### All Tests

```bash
# Unit + Integration only (no API)
npm test

# Unit + Integration + Live API
npm run test:all
```

### Watch Mode

```bash
npm run test:watch
```

### Specific Test File

```bash
npx jest tests/unit/helpers.test.js
```

### Specific Test

```bash
npx jest -t "should generate a valid UUID"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Coverage Report

```bash
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Writing Tests

### Unit Test Template

```javascript
import { myFunction } from '../../src/utils/myModule.js'

describe('myModule', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction('input')
      expect(result).toBe('expected')
    })

    it('should handle edge cases', () => {
      expect(() => myFunction(null)).toThrow()
    })
  })
})
```

### Integration Test Template

```javascript
import adapter from '../../src/modules/mixpeekContextAdapter.js'

describe('Feature Integration', () => {
  beforeEach(() => {
    adapter.clearCache()
    global.fetch.mockClear()
  })

  it('should perform end-to-end operation', async () => {
    // Setup
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'mock' })
    })

    // Execute
    const result = await adapter.someMethod()

    // Assert
    expect(result).toBeDefined()
    expect(global.fetch).toHaveBeenCalled()
  })
})
```

### Live API Test Template

```javascript
describe('Live API Feature', () => {
  test('should interact with real API', async () => {
    if (skipIfNoApiKey()) return

    // Your test using real API
    const result = await client.someMethod()
    
    expect(result).toBeDefined()
    console.log('✓ Test passed:', result)
  }, 30000) // Longer timeout for API calls
})
```

## Continuous Integration

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage
      
      # Live API tests (optional)
      - name: Live API Tests
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        env:
          MIXPEEK_API_KEY: ${{ secrets.MIXPEEK_API_KEY }}
          MIXPEEK_COLLECTION_ID: ${{ secrets.MIXPEEK_COLLECTION_ID }}
        run: npm run test:live
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

### Enable Debug Logging

```bash
DEBUG=* npm test
```

### Run Single Test

```bash
npx jest -t "specific test name" --verbose
```

### Inspect Failed Tests

```bash
npm test -- --no-coverage --verbose
```

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Test Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Lines | 80% | 87% |
| Functions | 80% | 85% |
| Branches | 80% | 82% |
| Statements | 80% | 87% |

## Common Issues

### Tests Fail After Module Changes

```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules && npm install
```

### Mock Not Working

Ensure mocks are set up before imports:

```javascript
// Mock BEFORE importing
jest.mock('../../src/api/mixpeekClient.js')

// Then import
import MixpeekClient from '../../src/api/mixpeekClient.js'
```

### Async Test Timing Out

Increase timeout:

```javascript
test('long running test', async () => {
  // test code
}, 30000) // 30 seconds
```

Or set globally in `jest.config.js`:

```javascript
module.exports = {
  testTimeout: 10000
}
```

## Best Practices

1. **Test Behavior, Not Implementation**: Test what the code does, not how it does it
2. **Use Descriptive Names**: Test names should clearly describe what's being tested
3. **One Assertion Per Test**: Keep tests focused and simple
4. **Arrange-Act-Assert**: Structure tests in three clear phases
5. **Mock External Dependencies**: Don't rely on external services in unit tests
6. **Clean Up**: Reset state between tests with `beforeEach`/`afterEach`
7. **Test Edge Cases**: Include tests for error conditions and boundary values
8. **Keep Tests Fast**: Unit tests should run in milliseconds

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Mixpeek API Docs](https://docs.mixpeek.com)

