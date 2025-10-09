/**
 * Live API Test Setup
 * 
 * These tests run against the actual Mixpeek API.
 * You must provide valid credentials via environment variables:
 * 
 * MIXPEEK_API_KEY=your_api_key
 * MIXPEEK_COLLECTION_ID=your_collection_id (optional, will create one)
 * MIXPEEK_NAMESPACE=your_namespace (optional)
 */

// Check for required environment variables
if (!process.env.MIXPEEK_API_KEY) {
  console.warn('\n⚠️  Warning: MIXPEEK_API_KEY not set. Live API tests will be skipped.\n')
  console.warn('To run live API tests:')
  console.warn('  export MIXPEEK_API_KEY=your_api_key')
  console.warn('  npm run test:live\n')
}

// Mock browser environment for Node.js tests
global.window = {
  location: {
    href: 'https://example.com/test-article',
    hostname: 'example.com',
    pathname: '/test-article'
  },
  localStorage: {
    _data: {},
    setItem(key, value) {
      this._data[key] = value
    },
    getItem(key) {
      return this._data[key] || null
    },
    removeItem(key) {
      delete this._data[key]
    },
    clear() {
      this._data = {}
    }
  },
  performance: {
    now() {
      return Date.now()
    }
  }
}

global.document = {
  title: 'Mobile Phone Technology Article',
  body: {
    cloneNode() {
      return {
        querySelectorAll() {
          return []
        },
        textContent: 'This article discusses the latest mobile phone technology, including AI features, 5G connectivity, and advanced camera systems. Smartphones continue to evolve with better processors and improved battery life.'
      }
    }
  },
  documentElement: {
    lang: 'en'
  },
  querySelector(selector) {
    if (selector === 'meta[name="description"]') {
      return { content: 'Latest mobile phone technology and smartphone features' }
    }
    if (selector === 'meta[property="og:title"]') {
      return { content: 'Mobile Phone Technology' }
    }
    return null
  },
  querySelectorAll() {
    return []
  }
}

// Use real fetch for live API tests
global.fetch = fetch

// Test configuration
global.TEST_CONFIG = {
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  namespace: process.env.MIXPEEK_NAMESPACE,
  endpoint: process.env.MIXPEEK_API_ENDPOINT || 'https://server-xb24.onrender.com',
  timeout: 30000 // 30 seconds for live API calls
}

// Helper to skip tests if no API key
global.skipIfNoApiKey = () => {
  if (!process.env.MIXPEEK_API_KEY) {
    console.log('⏭️  Skipping test - no API key configured')
    return true
  }
  return false
}

