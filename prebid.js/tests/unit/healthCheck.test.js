/**
 * Tests for health check functionality
 */

import adapter from '../../src/modules/mixpeekContextAdapter.js'

describe('Health Check', () => {
  beforeEach(() => {
    adapter.clearCache()
    adapter.initialized = false
    adapter.healthCheckPerformed = false
    global.fetch.mockClear()
  })

  describe('Lazy Health Check (default)', () => {
    it('should not perform health check on init', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: 'lazy'
      })

      // Should not have called API during init
      expect(global.fetch).not.toHaveBeenCalled()
      expect(adapter.initialized).toBe(true)
    })

    it('should perform health check on first getContext call', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok', version: '0.81' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            document_id: 'doc_123',
            enrichments: { taxonomies: [] }
          })
        })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: 'lazy'
      })

      await adapter.getContext()

      // Should have called health check first, then create document
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(adapter.healthCheckPerformed).toBe(true)
    })

    it('should only perform health check once', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok' })
        })
        .mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            document_id: 'doc_123',
            enrichments: { taxonomies: [] }
          })
        })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: 'lazy',
        enableCache: false
      })

      await adapter.getContext()
      await adapter.getContext()

      // Health check once + two context requests
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Eager Health Check', () => {
    it('should perform health check on init', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok', version: '0.81' })
      })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: 'eager'
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/health'),
        expect.any(Object)
      )
    })

    it('should continue init even if health check fails', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const result = await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: 'eager'
      })

      expect(result).toBe(true)
      expect(adapter.initialized).toBe(true)
    })
  })

  describe('Disabled Health Check', () => {
    it('should not perform health check when disabled', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: false
      })

      await adapter.getContext()

      // Should only have called create document, no health check
      const calls = global.fetch.mock.calls
      const healthCheckCalls = calls.filter(call =>
        call[0].includes('/v1/health')
      )
      expect(healthCheckCalls.length).toBe(0)
    })
  })

  describe('Manual Health Check', () => {
    it('should allow manual health check via healthCheck method', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy', version: '0.81' })
      })

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: false
      })

      const health = await adapter.healthCheck()

      expect(health.status).toBe('ok')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/health'),
        expect.any(Object)
      )
    })

    it('should return error on failed health check', async () => {
      global.fetch.mockRejectedValue(new Error('Connection refused'))

      await adapter.init({
        apiKey: 'test-key',
        collectionId: 'test-col',
        healthCheck: false
      })

      const health = await adapter.healthCheck()

      expect(health.status).toBe('error')
      expect(health.message).toContain('not initialized')
    })
  })
})

