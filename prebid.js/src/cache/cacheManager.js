/**
 * Mixpeek Context Adapter - Cache Manager
 * @module cache/cacheManager
 */

import { CACHE_KEYS, DEFAULT_CACHE_TTL } from '../config/constants.js'
import { getTimestamp, isExpired, safeJSONParse } from '../utils/helpers.js'
import logger from '../utils/logger.js'

class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.useLocalStorage = this._checkLocalStorageAvailable()
    this.ttl = DEFAULT_CACHE_TTL
  }

  /**
   * Check if localStorage is available
   * @private
   * @returns {boolean}
   */
  _checkLocalStorageAvailable() {
    try {
      const test = '__mixpeek_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      logger.warn('localStorage not available, using memory cache only')
      return false
    }
  }

  /**
   * Generate cache key
   * @private
   * @param {string} key - Key
   * @returns {string} Cache key
   */
  _getCacheKey(key) {
    return `${CACHE_KEYS.PREFIX}${CACHE_KEYS.VERSION}_${key}`
  }

  /**
   * Set TTL
   * @param {number} ttl - TTL in seconds
   */
  setTTL(ttl) {
    this.ttl = ttl
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {object|null} Cached value or null
   */
  get(key) {
    const cacheKey = this._getCacheKey(key)
    
    // Try memory cache first
    if (this.memoryCache.has(cacheKey)) {
      const item = this.memoryCache.get(cacheKey)
      if (!isExpired(item.timestamp, this.ttl)) {
        logger.info('Cache hit (memory):', key)
        return item.data
      } else {
        logger.info('Cache expired (memory):', key)
        this.memoryCache.delete(cacheKey)
      }
    }

    // Try localStorage
    if (this.useLocalStorage) {
      try {
        const item = localStorage.getItem(cacheKey)
        if (item) {
          const parsed = safeJSONParse(item)
          if (parsed && !isExpired(parsed.timestamp, this.ttl)) {
            logger.info('Cache hit (localStorage):', key)
            // Promote to memory cache
            this.memoryCache.set(cacheKey, parsed)
            return parsed.data
          } else {
            logger.info('Cache expired (localStorage):', key)
            localStorage.removeItem(cacheKey)
          }
        }
      } catch (e) {
        logger.warn('Error reading from localStorage:', e)
      }
    }

    logger.info('Cache miss:', key)
    return null
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @returns {boolean} Success
   */
  set(key, data) {
    const cacheKey = this._getCacheKey(key)
    const item = {
      data,
      timestamp: getTimestamp()
    }

    try {
      // Store in memory cache
      this.memoryCache.set(cacheKey, item)

      // Store in localStorage
      if (this.useLocalStorage) {
        localStorage.setItem(cacheKey, JSON.stringify(item))
      }

      logger.info('Cached:', key)
      return true
    } catch (e) {
      logger.warn('Error setting cache:', e)
      return false
    }
  }

  /**
   * Remove item from cache
   * @param {string} key - Cache key
   * @returns {boolean} Success
   */
  remove(key) {
    const cacheKey = this._getCacheKey(key)
    
    try {
      this.memoryCache.delete(cacheKey)
      if (this.useLocalStorage) {
        localStorage.removeItem(cacheKey)
      }
      logger.info('Cache removed:', key)
      return true
    } catch (e) {
      logger.warn('Error removing cache:', e)
      return false
    }
  }

  /**
   * Clear all cache
   * @returns {boolean} Success
   */
  clear() {
    try {
      this.memoryCache.clear()
      
      if (this.useLocalStorage) {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(CACHE_KEYS.PREFIX)) {
            localStorage.removeItem(key)
          }
        })
      }
      
      logger.info('Cache cleared')
      return true
    } catch (e) {
      logger.warn('Error clearing cache:', e)
      return false
    }
  }

  /**
   * Get cache stats
   * @returns {object} Cache statistics
   */
  getStats() {
    let localStorageSize = 0
    let localStorageCount = 0

    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(CACHE_KEYS.PREFIX)) {
            localStorageCount++
            localStorageSize += localStorage.getItem(key).length
          }
        })
      } catch (e) {
        logger.warn('Error getting cache stats:', e)
      }
    }

    return {
      memoryCount: this.memoryCache.size,
      localStorageCount,
      localStorageSize,
      ttl: this.ttl
    }
  }

  /**
   * Prune expired items
   * @returns {number} Number of items pruned
   */
  prune() {
    let pruned = 0

    // Prune memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (isExpired(item.timestamp, this.ttl)) {
        this.memoryCache.delete(key)
        pruned++
      }
    }

    // Prune localStorage
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(CACHE_KEYS.PREFIX)) {
            const item = safeJSONParse(localStorage.getItem(key))
            if (item && isExpired(item.timestamp, this.ttl)) {
              localStorage.removeItem(key)
              pruned++
            }
          }
        })
      } catch (e) {
        logger.warn('Error pruning cache:', e)
      }
    }

    if (pruned > 0) {
      logger.info(`Pruned ${pruned} expired cache items`)
    }

    return pruned
  }
}

export default new CacheManager()

