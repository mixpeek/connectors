/**
 * Cache Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CacheManager } from '../../src/cache/cacheManager.js'

describe('CacheManager', () => {
  let mockKV
  let cache

  beforeEach(() => {
    // Mock Cloudflare KV namespace
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn()
    }

    cache = new CacheManager(mockKV, {
      defaultTTL: 3600,
      prefix: 'test:'
    })
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const defaultCache = new CacheManager(mockKV)

      expect(defaultCache.defaultTTL).toBe(3600)
      expect(defaultCache.prefix).toBe('mixpeek:')
    })

    it('should accept custom options', () => {
      expect(cache.defaultTTL).toBe(3600)
      expect(cache.prefix).toBe('test:')
    })
  })

  describe('getFullKey', () => {
    it('should prefix keys correctly', () => {
      expect(cache.getFullKey('my-key')).toBe('test:my-key')
    })
  })

  describe('get', () => {
    it('should return cached value', async () => {
      const cachedData = {
        data: 'test',
        _expiry: Date.now() + 10000,
        _createdAt: Date.now()
      }
      mockKV.get.mockResolvedValue(cachedData)

      const result = await cache.get('my-key')

      expect(mockKV.get).toHaveBeenCalledWith('test:my-key', { type: 'json' })
      expect(result).toEqual({ data: 'test' })
    })

    it('should return null for expired cache', async () => {
      const expiredData = {
        data: 'test',
        _expiry: Date.now() - 10000,
        _createdAt: Date.now() - 20000
      }
      mockKV.get.mockResolvedValue(expiredData)

      const result = await cache.get('my-key')

      expect(result).toBeNull()
      expect(mockKV.delete).toHaveBeenCalled()
    })

    it('should return null for non-existent key', async () => {
      mockKV.get.mockResolvedValue(null)

      const result = await cache.get('non-existent')

      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'))

      const result = await cache.get('error-key')

      expect(result).toBeNull()
    })

    it('should warn when KV namespace not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const noKVCache = new CacheManager(null)

      const result = await noKVCache.get('key')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('KV namespace not configured')
      consoleSpy.mockRestore()
    })
  })

  describe('set', () => {
    it('should store value with metadata', async () => {
      mockKV.put.mockResolvedValue(undefined)

      const result = await cache.set('my-key', { data: 'test' }, 7200)

      expect(result).toBe(true)
      expect(mockKV.put).toHaveBeenCalled()

      const callArgs = mockKV.put.mock.calls[0]
      expect(callArgs[0]).toBe('test:my-key')

      const storedData = JSON.parse(callArgs[1])
      expect(storedData.data).toBe('test')
      expect(storedData._createdAt).toBeDefined()
      expect(storedData._expiry).toBeDefined()

      expect(callArgs[2]).toEqual({ expirationTtl: 7200 })
    })

    it('should use default TTL when not specified', async () => {
      mockKV.put.mockResolvedValue(undefined)

      await cache.set('my-key', { data: 'test' })

      const callArgs = mockKV.put.mock.calls[0]
      expect(callArgs[2]).toEqual({ expirationTtl: 3600 })
    })

    it('should handle errors gracefully', async () => {
      mockKV.put.mockRejectedValue(new Error('KV error'))

      const result = await cache.set('error-key', { data: 'test' })

      expect(result).toBe(false)
    })

    it('should return false when KV not configured', async () => {
      const noKVCache = new CacheManager(null)

      const result = await noKVCache.set('key', { data: 'test' })

      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete cached value', async () => {
      mockKV.delete.mockResolvedValue(undefined)

      const result = await cache.delete('my-key')

      expect(result).toBe(true)
      expect(mockKV.delete).toHaveBeenCalledWith('test:my-key')
    })

    it('should handle errors gracefully', async () => {
      mockKV.delete.mockRejectedValue(new Error('KV error'))

      const result = await cache.delete('error-key')

      expect(result).toBe(false)
    })
  })

  describe('listByPattern', () => {
    it('should list keys by pattern', async () => {
      mockKV.list.mockResolvedValue({
        keys: [
          { name: 'test:profile:123' },
          { name: 'test:profile:456' }
        ]
      })

      const result = await cache.listByPattern('profile:')

      expect(mockKV.list).toHaveBeenCalledWith({ prefix: 'test:profile:' })
      expect(result).toEqual(['profile:123', 'profile:456'])
    })

    it('should return empty array on error', async () => {
      mockKV.list.mockRejectedValue(new Error('KV error'))

      const result = await cache.listByPattern('profile:')

      expect(result).toEqual([])
    })
  })

  describe('healthCheck', () => {
    it('should pass health check', async () => {
      mockKV.put.mockResolvedValue(undefined)
      mockKV.get.mockResolvedValue('ok')
      mockKV.delete.mockResolvedValue(undefined)

      const result = await cache.healthCheck()

      expect(result).toBe(true)
    })

    it('should throw when KV not configured', async () => {
      const noKVCache = new CacheManager(null)

      await expect(noKVCache.healthCheck()).rejects.toThrow('KV namespace not configured')
    })

    it('should throw on health check failure', async () => {
      mockKV.put.mockResolvedValue(undefined)
      mockKV.get.mockResolvedValue('not-ok')
      mockKV.delete.mockResolvedValue(undefined)

      await expect(cache.healthCheck()).rejects.toThrow('KV health check failed')
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      mockKV.list.mockResolvedValue({
        keys: Array(100).fill({ name: 'key' }),
        list_complete: false
      })

      const stats = await cache.getStats()

      expect(stats.available).toBe(true)
      expect(stats.keyCount).toBe(100)
      expect(stats.hasMore).toBe(true)
    })

    it('should return unavailable when KV not configured', async () => {
      const noKVCache = new CacheManager(null)

      const stats = await noKVCache.getStats()

      expect(stats.available).toBe(false)
    })
  })
})
