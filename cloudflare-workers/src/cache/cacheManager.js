/**
 * Cache Manager for Cloudflare KV
 *
 * Provides a caching layer for content profiles with:
 * - TTL-based expiration
 * - Namespace isolation
 * - Pattern-based listing and invalidation
 */

export class CacheManager {
  constructor(kvNamespace, options = {}) {
    this.kv = kvNamespace
    this.defaultTTL = options.defaultTTL || 3600 // 1 hour
    this.prefix = options.prefix || 'mixpeek:'
  }

  /**
   * Get cached value
   */
  async get(key) {
    if (!this.kv) {
      console.warn('KV namespace not configured')
      return null
    }

    try {
      const fullKey = this.getFullKey(key)
      const cached = await this.kv.get(fullKey, { type: 'json' })

      if (cached) {
        // Check if expired
        if (cached._expiry && Date.now() > cached._expiry) {
          await this.delete(key)
          return null
        }

        // Remove internal metadata before returning
        const { _expiry, _createdAt, ...data } = cached
        return data
      }

      return null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set cached value
   */
  async set(key, value, ttl = null) {
    if (!this.kv) {
      console.warn('KV namespace not configured')
      return false
    }

    try {
      const fullKey = this.getFullKey(key)
      const expirationTtl = ttl || this.defaultTTL

      // Add metadata for tracking
      const cacheData = {
        ...value,
        _createdAt: Date.now(),
        _expiry: Date.now() + (expirationTtl * 1000)
      }

      await this.kv.put(fullKey, JSON.stringify(cacheData), {
        expirationTtl
      })

      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete cached value
   */
  async delete(key) {
    if (!this.kv) return false

    try {
      const fullKey = this.getFullKey(key)
      await this.kv.delete(fullKey)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * List keys by pattern (limited functionality in KV)
   */
  async listByPattern(pattern) {
    if (!this.kv) return []

    try {
      const list = await this.kv.list({ prefix: this.prefix + pattern })
      return list.keys.map(k => k.name.replace(this.prefix, ''))
    } catch (error) {
      console.error('Cache list error:', error)
      return []
    }
  }

  /**
   * Get full key with prefix
   */
  getFullKey(key) {
    return this.prefix + key
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.kv) {
      throw new Error('KV namespace not configured')
    }

    // Try a simple operation
    const testKey = '__health_check__'
    await this.kv.put(this.prefix + testKey, 'ok', { expirationTtl: 60 })
    const result = await this.kv.get(this.prefix + testKey)
    await this.kv.delete(this.prefix + testKey)

    if (result !== 'ok') {
      throw new Error('KV health check failed')
    }

    return true
  }

  /**
   * Get cache statistics (approximate)
   */
  async getStats() {
    if (!this.kv) return { available: false }

    try {
      const list = await this.kv.list({ prefix: this.prefix, limit: 1000 })
      return {
        available: true,
        keyCount: list.keys.length,
        hasMore: !list.list_complete
      }
    } catch (error) {
      return { available: false, error: error.message }
    }
  }
}

export default CacheManager
