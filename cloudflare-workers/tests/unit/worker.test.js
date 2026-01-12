/**
 * Worker Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContentIntelligenceWorker } from '../../src/index.js'

describe('ContentIntelligenceWorker', () => {
  let worker
  let mockEnv
  let mockKV

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn()
    }

    mockEnv = {
      MIXPEEK_API_KEY: 'test-api-key',
      MIXPEEK_API_ENDPOINT: 'https://api.mixpeek.com',
      MIXPEEK_NAMESPACE: 'test-namespace',
      MIXPEEK_COLLECTION_ID: 'test-collection',
      CONTENT_PROFILES: mockKV,
      CACHE_TTL: '3600',
      CORS_ORIGIN: '*'
    }

    worker = new ContentIntelligenceWorker(mockEnv)
  })

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(worker.env).toBe(mockEnv)
      expect(worker.client).toBeDefined()
      expect(worker.cache).toBeDefined()
    })
  })

  describe('generateCacheKey', () => {
    it('should generate deterministic cache keys', () => {
      const key1 = worker.generateCacheKey('https://example.com/page')
      const key2 = worker.generateCacheKey('https://example.com/page')

      expect(key1).toBe(key2)
      expect(key1.startsWith('profile:')).toBe(true)
    })

    it('should normalize URLs', () => {
      const key1 = worker.generateCacheKey('https://example.com/page/')
      const key2 = worker.generateCacheKey('https://example.com/page')
      const key3 = worker.generateCacheKey('https://example.com/page?query=1')

      expect(key1).toBe(key2)
      expect(key1).toBe(key3)
    })
  })

  describe('hashString', () => {
    it('should generate consistent hashes', () => {
      const hash1 = worker.hashString('test')
      const hash2 = worker.hashString('test')

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different strings', () => {
      const hash1 = worker.hashString('test1')
      const hash2 = worker.hashString('test2')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('jsonResponse', () => {
    it('should create JSON response', () => {
      const response = worker.jsonResponse({ data: 'test' }, 200)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should include additional headers', () => {
      const response = worker.jsonResponse({ data: 'test' }, 200, {
        'X-Custom': 'value'
      })

      expect(response.headers.get('X-Custom')).toBe('value')
    })
  })

  describe('handleRequest routing', () => {
    it('should handle OPTIONS requests for CORS', async () => {
      const request = new Request('https://worker.example.com/v1/analyze', {
        method: 'OPTIONS'
      })

      const response = await worker.handleRequest(request)

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should route to health endpoint', async () => {
      const request = new Request('https://worker.example.com/health')

      // Mock health check
      vi.spyOn(worker.client, 'healthCheck').mockResolvedValue({ status: 'ok' })
      mockKV.put.mockResolvedValue(undefined)
      mockKV.get.mockResolvedValue('ok')
      mockKV.delete.mockResolvedValue(undefined)

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(body.status).toBeDefined()
    })

    it('should return 404 for unknown routes', async () => {
      const request = new Request('https://worker.example.com/unknown')

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error).toBe('Not Found')
    })
  })

  describe('handleAnalyze', () => {
    it('should require POST method', async () => {
      const request = new Request('https://worker.example.com/v1/analyze', {
        method: 'GET'
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.error).toBe('Method Not Allowed')
    })

    it('should require url or content', async () => {
      const request = new Request('https://worker.example.com/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toContain('required')
    })

    it('should return cached profile', async () => {
      const cachedProfile = {
        id: 'profile:123',
        url: 'https://example.com',
        profile: { taxonomy: { label: 'Tech' } },
        _expiry: Date.now() + 100000
      }

      mockKV.get.mockResolvedValue(cachedProfile)

      const request = new Request('https://worker.example.com/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(body.cached).toBe(true)
    })
  })

  describe('handleGetProfile', () => {
    it('should require url parameter', async () => {
      const request = new Request('https://worker.example.com/v1/profile')

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toContain('url parameter')
    })

    it('should return 404 for missing profile', async () => {
      mockKV.get.mockResolvedValue(null)

      const request = new Request('https://worker.example.com/v1/profile?url=https://example.com')

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error).toBe('Profile not found')
    })

    it('should return cached profile', async () => {
      const cachedProfile = {
        id: 'profile:123',
        url: 'https://example.com',
        profile: {
          taxonomy: { label: 'Tech' },
          iab: { primary: 'IAB19' }
        },
        _expiry: Date.now() + 100000
      }

      mockKV.get.mockResolvedValue(cachedProfile)

      const request = new Request('https://worker.example.com/v1/profile?url=https://example.com')

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.classification).toBeDefined()
    })

    it('should support different formats', async () => {
      const cachedProfile = {
        id: 'profile:123',
        url: 'https://example.com',
        profile: {
          taxonomy: { label: 'Tech' },
          iab: { primary: 'IAB19' }
        },
        _expiry: Date.now() + 100000
      }

      mockKV.get.mockResolvedValue(cachedProfile)

      // Test GAM format
      const gamRequest = new Request('https://worker.example.com/v1/profile?url=https://example.com&format=gam')
      const gamResponse = await worker.handleRequest(gamRequest)
      const gamBody = await gamResponse.json()
      expect(gamBody.targeting).toBeDefined()

      // Reset mock
      mockKV.get.mockResolvedValue(cachedProfile)

      // Test OpenRTB format
      const ortbRequest = new Request('https://worker.example.com/v1/profile?url=https://example.com&format=openrtb')
      const ortbResponse = await worker.handleRequest(ortbRequest)
      const ortbBody = await ortbResponse.json()
      expect(ortbBody.site).toBeDefined()
    })
  })

  describe('handleBatchAnalyze', () => {
    it('should require POST method', async () => {
      const request = new Request('https://worker.example.com/v1/batch', {
        method: 'GET'
      })

      const response = await worker.handleRequest(request)
      expect(response.status).toBe(405)
    })

    it('should require urls array', async () => {
      const request = new Request('https://worker.example.com/v1/batch', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toContain('urls array')
    })

    it('should enforce batch size limit', async () => {
      const request = new Request('https://worker.example.com/v1/batch', {
        method: 'POST',
        body: JSON.stringify({
          urls: Array(20).fill('https://example.com')
        })
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toContain('maximum')
    })
  })

  describe('handleInvalidate', () => {
    it('should require POST method', async () => {
      const request = new Request('https://worker.example.com/v1/invalidate', {
        method: 'GET'
      })

      const response = await worker.handleRequest(request)
      expect(response.status).toBe(405)
    })

    it('should invalidate by urls', async () => {
      mockKV.delete.mockResolvedValue(undefined)

      const request = new Request('https://worker.example.com/v1/invalidate', {
        method: 'POST',
        body: JSON.stringify({
          urls: ['https://example.com/1', 'https://example.com/2']
        })
      })

      const response = await worker.handleRequest(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.invalidated).toBe(2)
    })
  })
})
