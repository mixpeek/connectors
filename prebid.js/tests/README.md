# Mixpeek Prebid RTD Module - Test Suite

This directory contains tests for the Mixpeek Prebid RTD module.

## Test Structure

```
tests/
├── unit/                   # Unit tests (mocked, fast)
│   ├── modules/           # RTD provider and adapter tests
│   ├── utils/             # Utility function tests
│   └── api/               # API client tests
├── integration/           # Integration tests (mocked dependencies)
├── e2e/                   # End-to-end tests (real API)
├── live-api/              # Live API tests (real API, comprehensive)
└── setup.js               # Jest setup and global mocks
```

## Test Types

### 1. Unit Tests (`tests/unit/`)
**Fast, mocked, run on every commit**

Tests individual components in isolation with mocked dependencies.

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npx jest tests/unit/utils/iabMapping.test.js

# Watch mode
npm run test:watch
```

**No API key needed** ✅

**Features:**
- ✅ Mocked API calls
- ✅ Fast execution (~1-2 seconds)
- ✅ Run in CI/CD
- ✅ Test logic, not integrations

**Coverage:**
- `mixpeekRtdProvider.test.js` - RTD submodule interface
- `mixpeekContextAdapter.ortb2.test.js` - ortb2 formatting
- `iabMapping.test.js` - IAB taxonomy mapping
- `mixpeekClient.test.js` - API client (existing)
- `helpers.test.js` - Utility functions (existing)
- `cacheManager.test.js` - Caching logic (existing)

### 2. E2E Tests (`tests/e2e/`)
**Complete flow, real API, run before releases**

Tests the entire flow from initialization to bid enrichment using real Mixpeek API.

```bash
# Set your API credentials
export MIXPEEK_API_KEY="your_api_key"
export MIXPEEK_COLLECTION_ID="your_collection_id"

# Run E2E tests
npm run test:e2e

# Or with inline env vars
MIXPEEK_API_KEY=your_key MIXPEEK_COLLECTION_ID=your_col npm run test:e2e
```

**Requires API key** 🔑

**Features:**
- ✅ Real API calls
- ✅ Full RTD flow
- ✅ ortb2 injection verification
- ✅ Performance benchmarking
- ⚠️ Slower (~10-30 seconds)

**Coverage:**
- RTD submodule initialization
- Context extraction and API processing
- Bid request enrichment
- ortb2Fragments injection
- Targeting key generation
- Caching behavior
- Error handling
- Performance metrics

### 3. Live API Tests (`tests/live-api/`)
**Comprehensive API validation, real API, run periodically**

Existing comprehensive tests for API client and adapter with real Mixpeek API.

```bash
# Run live API tests
npm run test:live

# Verbose output
npm run test:live:verbose
```

**Requires API key** 🔑

### 4. Integration Tests (`tests/integration/`)
**Multi-component tests, mocked dependencies**

Existing integration tests with mocked dependencies.

```bash
# Included in default test run
npm test
```

## Running Tests

### Quick Test (Development)
```bash
# Unit tests only (fast, no API key needed)
npm run test:unit
```

### Full Test Suite (Pre-commit)
```bash
# Unit + E2E + Live API
npm run test:all
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## Environment Setup

### Required Environment Variables

For **E2E** and **Live API** tests:

```bash
# Required
export MIXPEEK_API_KEY="sk_your_api_key"
export MIXPEEK_COLLECTION_ID="col_your_collection"

# Optional
export MIXPEEK_ENDPOINT="https://server-xb24.onrender.com"  # Default
export MIXPEEK_NAMESPACE="test"  # Optional namespace
```

### Setting Up Test Collection

Create a collection with taxonomy feature extractor:

```bash
curl -X POST https://server-xb24.onrender.com/v1/collections \
  -H "Authorization: Bearer $MIXPEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prebid-rtd-test",
    "description": "Test collection for Prebid RTD module"
  }'
```

Save the `collection_id` from the response.

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit
  
  e2e-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
        env:
          MIXPEEK_API_KEY: ${{ secrets.MIXPEEK_API_KEY }}
          MIXPEEK_COLLECTION_ID: ${{ secrets.MIXPEEK_COLLECTION_ID }}
```

## Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Statements | TBD | 80%+ |
| Branches | TBD | 75%+ |
| Functions | TBD | 85%+ |
| Lines | TBD | 80%+ |

Run coverage report:
```bash
npm run test:coverage
```

## Debugging Tests

### Enable Debug Logging

```bash
# For unit tests
DEBUG=* npm run test:unit

# For E2E tests
DEBUG=* npm run test:e2e
```

### Run Single Test

```bash
# Run specific test file
npx jest tests/unit/utils/iabMapping.test.js

# Run specific test case
npx jest -t "should map node_id to IAB code"
```

### Inspect Test Output

```bash
# Verbose output
npm run test:unit -- --verbose

# Show console.logs
npm run test:unit -- --silent=false
```

## Writing New Tests

### Unit Test Template

```javascript
/**
 * Unit Tests for [Component Name]
 * @file tests/unit/[path]/[component].test.js
 */

import { functionToTest } from '../../../src/[path]/[module].js'

// Mock dependencies
jest.mock('../../../src/[dependency].js')

describe('[Component Name]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('[Method Name]', () => {
    test('should [behavior]', () => {
      // Arrange
      const input = 'test'
      
      // Act
      const result = functionToTest(input)
      
      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### E2E Test Template

```javascript
/**
 * E2E Tests for [Feature]
 * @file tests/e2e/[feature].e2e.test.js
 */

const skipIfNoApiKey = () => {
  if (!process.env.MIXPEEK_API_KEY) {
    console.warn('⚠️  Skipping: MIXPEEK_API_KEY not set')
    return true
  }
  return false
}

describe('[Feature] - E2E', () => {
  test('should [behavior]', async () => {
    if (skipIfNoApiKey()) return
    
    // Test implementation
  }, 30000) // 30 second timeout
})
```

## Troubleshooting

### Tests Failing with "Cannot find module"

Make sure to run from project root:
```bash
cd /path/to/prebid.js
npm test
```

### E2E Tests Skipped

Make sure environment variables are set:
```bash
echo $MIXPEEK_API_KEY  # Should print your key
echo $MIXPEEK_COLLECTION_ID  # Should print your collection
```

### Tests Timing Out

Increase Jest timeout:
```bash
npm run test:e2e -- --testTimeout=60000
```

### Mock Not Working

Clear Jest cache:
```bash
npx jest --clearCache
npm run test:unit
```

## Best Practices

### DO ✅
- Write unit tests for all new functions
- Mock external dependencies in unit tests
- Use descriptive test names
- Test edge cases and error conditions
- Keep tests fast (unit tests < 100ms each)
- Use E2E tests to verify real API behavior

### DON'T ❌
- Don't commit API keys (use env vars)
- Don't make real API calls in unit tests
- Don't write tests that depend on test order
- Don't skip error case testing
- Don't leave `.only()` or `.skip()` in committed tests

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Mixpeek API Docs](https://docs.mixpeek.com)

## Getting Help

If tests are failing:

1. Check if it's an environment issue (API keys, network)
2. Review error messages carefully
3. Run with `--verbose` flag
4. Check [IMPLEMENTATION_STATUS.md](../tasks/IMPLEMENTATION_STATUS.md) for known issues
5. Open an issue on GitHub with:
   - Test command run
   - Error output
   - Environment details (Node version, OS)

