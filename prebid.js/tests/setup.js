/**
 * Jest test setup
 */

// Mock browser globals
global.window = {
  location: {
    href: 'https://example.com/article/test',
    hostname: 'example.com',
    pathname: '/article/test'
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
  title: 'Test Article',
  body: {
    cloneNode() {
      return {
        querySelectorAll() {
          return []
        },
        textContent: 'This is a test article about technology and AI.'
      }
    },
    textContent: 'This is a test article about technology and AI.'
  },
  documentElement: {
    lang: 'en'
  },
  querySelector(selector) {
    if (selector === 'meta[name="description"]') {
      return { content: 'Test article description' }
    }
    return null
  },
  querySelectorAll(selector) {
    return []
  }
}

// Mock fetch
global.fetch = jest.fn()

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
  table: jest.fn()
}

