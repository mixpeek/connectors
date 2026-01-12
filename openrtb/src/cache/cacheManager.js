/**
 * Mixpeek OpenRTB Connector - Cache Manager
 *
 * In-memory caching with TTL support for server-side OpenRTB processing.
 */

import { DEFAULT_CACHE_TTL, MAX_CACHE_ITEMS, CACHE_KEY_PREFIX } from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class CacheManager {
  /**
   * Create a cache manager
   * @param {Object} options - Cache options
   * @param {number} [options.ttl] - Time to live in seconds
   * @param {number} [options.maxItems] - Maximum number of items
   * @param {boolean} [options.debug] - Enable debug logging
   */
  constructor(options = {}) {
    this.ttl = (options.ttl || DEFAULT_CACHE_TTL) * 1000; // Convert to ms
    this.maxItems = options.maxItems || MAX_CACHE_ITEMS;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    this.logger = getLogger({ debug: options.debug });

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => this.prune(), 60000); // Every minute
  }

  /**
   * Generate a cache key with prefix
   * @param {string} key - Raw key
   * @returns {string} Prefixed key
   */
  _prefixKey(key) {
    return `${CACHE_KEY_PREFIX}${key}`;
  }

  /**
   * Get an item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const prefixedKey = this._prefixKey(key);
    const item = this.cache.get(prefixedKey);

    if (!item) {
      this.stats.misses++;
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(prefixedKey);
      this.stats.misses++;
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.stats.hits++;
    this.logger.debug(`Cache hit: ${key}`);

    // Update access time for LRU
    item.lastAccess = Date.now();

    return item.data;
  }

  /**
   * Set an item in cache
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} [ttl] - Optional custom TTL in seconds
   */
  set(key, data, ttl = null) {
    const prefixedKey = this._prefixKey(key);
    const expiry = Date.now() + (ttl ? ttl * 1000 : this.ttl);

    // Evict if at capacity
    if (this.cache.size >= this.maxItems) {
      this._evictLRU();
    }

    this.cache.set(prefixedKey, {
      data,
      expiry,
      createdAt: Date.now(),
      lastAccess: Date.now()
    });

    this.stats.sets++;
    this.logger.debug(`Cache set: ${key} (expires in ${Math.round((expiry - Date.now()) / 1000)}s)`);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const prefixedKey = this._prefixKey(key);
    const item = this.cache.get(prefixedKey);

    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.cache.delete(prefixedKey);
      return false;
    }

    return true;
  }

  /**
   * Delete an item from cache
   * @param {string} key - Cache key
   * @returns {boolean} Whether item was deleted
   */
  delete(key) {
    const prefixedKey = this._prefixKey(key);
    return this.cache.delete(prefixedKey);
  }

  /**
   * Clear all cache items
   */
  clear() {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Prune expired items
   * @returns {number} Number of items pruned
   */
  prune() {
    const now = Date.now();
    let pruned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        pruned++;
      }
    }

    if (pruned > 0) {
      this.logger.debug(`Pruned ${pruned} expired items`);
    }

    return pruned;
  }

  /**
   * Evict least recently used item
   * @private
   */
  _evictLRU() {
    let oldestKey = null;
    let oldestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestAccess) {
        oldestAccess = item.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.logger.debug(`Evicted LRU item: ${oldestKey}`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxItems,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      sets: this.stats.sets,
      evictions: this.stats.evictions,
      ttlSeconds: this.ttl / 1000
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Destroy the cache manager
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.logger.debug('Cache manager destroyed');
  }

  /**
   * Get all keys in cache
   * @returns {string[]} Cache keys (without prefix)
   */
  keys() {
    const keys = [];
    const prefixLength = CACHE_KEY_PREFIX.length;

    for (const key of this.cache.keys()) {
      keys.push(key.substring(prefixLength));
    }

    return keys;
  }

  /**
   * Get cache size
   * @returns {number} Number of items in cache
   */
  get size() {
    return this.cache.size;
  }
}

/**
 * Create a cache manager instance
 * @param {Object} options - Cache options
 * @returns {CacheManager} Cache manager instance
 */
export function createCacheManager(options = {}) {
  return new CacheManager(options);
}

export { CacheManager };
export default { createCacheManager, CacheManager };
