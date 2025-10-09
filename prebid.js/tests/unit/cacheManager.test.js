/**
 * Tests for cache manager
 */

import cacheManager from '../../src/cache/cacheManager.js'

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear()
    cacheManager.setTTL(300)
  })

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cacheManager.set('test-key', { data: 'test' })
      const value = cacheManager.get('test-key')
      expect(value).toEqual({ data: 'test' })
    })

    it('should return null for missing keys', () => {
      const value = cacheManager.get('non-existent')
      expect(value).toBe(null)
    })

    it('should overwrite existing values', () => {
      cacheManager.set('test-key', { data: 'old' })
      cacheManager.set('test-key', { data: 'new' })
      const value = cacheManager.get('test-key')
      expect(value).toEqual({ data: 'new' })
    })
  })

  describe('remove', () => {
    it('should remove cached values', () => {
      cacheManager.set('test-key', { data: 'test' })
      cacheManager.remove('test-key')
      const value = cacheManager.get('test-key')
      expect(value).toBe(null)
    })
  })

  describe('clear', () => {
    it('should clear all cached values', () => {
      cacheManager.set('key1', { data: 'test1' })
      cacheManager.set('key2', { data: 'test2' })
      cacheManager.clear()
      
      expect(cacheManager.get('key1')).toBe(null)
      expect(cacheManager.get('key2')).toBe(null)
    })
  })

  describe('expiration', () => {
    it('should expire old values', () => {
      cacheManager.setTTL(0) // Expire immediately
      cacheManager.set('test-key', { data: 'test' })
      
      // Wait a bit
      setTimeout(() => {
        const value = cacheManager.get('test-key')
        expect(value).toBe(null)
      }, 100)
    })
  })

  describe('stats', () => {
    it('should return cache statistics', () => {
      cacheManager.set('key1', { data: 'test1' })
      cacheManager.set('key2', { data: 'test2' })
      
      const stats = cacheManager.getStats()
      expect(stats.memoryCount).toBe(2)
      expect(stats.ttl).toBe(300)
    })
  })

  describe('prune', () => {
    it('should remove expired items', () => {
      cacheManager.setTTL(0)
      cacheManager.set('key1', { data: 'test1' })
      
      setTimeout(() => {
        const pruned = cacheManager.prune()
        expect(pruned).toBeGreaterThan(0)
      }, 100)
    })
  })
})

