/**
 * Test Setup
 */

// Mock global fetch
global.fetch = global.fetch || (() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({})
}))

// Mock Request/Response if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map(Object.entries(options.headers || {}))
      this._body = options.body
    }

    async json() {
      return JSON.parse(this._body)
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options = {}) {
      this._body = body
      this.status = options.status || 200
      this.headers = new Map(Object.entries(options.headers || {}))
    }

    async json() {
      return JSON.parse(this._body)
    }

    async text() {
      return this._body
    }
  }
}

// Mock URL if needed
if (typeof URL === 'undefined') {
  const { URL } = require('url')
  global.URL = URL
}
