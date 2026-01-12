/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Cache Manager
 *
 * In-memory LRU cache for mapping results.
 */

import { DEFAULT_CACHE_TTL, MAX_CACHE_ITEMS, CACHE_KEY_PREFIX } from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class CacheManager {
  /**
   * Create a cache manager
   * @param {Object} config - Cache configuration
   * @param {number} [config.ttl] - Time to live in seconds
   * @param {number} [config.maxItems] - Maximum number of items
   * @param {boolean} [config.enabled] - Whether caching is enabled
   */
  constructor(config = {}) {
    this.ttl = (config.ttl || DEFAULT_CACHE_TTL) * 1000; // Convert to ms
    this.maxItems = config.maxItems || MAX_CACHE_ITEMS;
    this.enabled = config.enabled !== false;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    this.logger = getLogger();
  }

  /**
   * Generate cache key with prefix
   * @param {string} key - Base key
   * @returns {string} Prefixed key
   */
  makeKey(key) {
    return `${CACHE_KEY_PREFIX}${key}`;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (!this.enabled) {
      this.stats.misses++;
      return undefined;
    }

    const prefixedKey = this.makeKey(key);
    const entry = this.cache.get(prefixedKey);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(prefixedKey);
      this.stats.misses++;
      return undefined;
    }

    // Move to end for LRU
    this.cache.delete(prefixedKey);
    this.cache.set(prefixedKey, entry);

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Optional TTL override in seconds
   */
  set(key, value, ttl) {
    if (!this.enabled) return;

    const prefixedKey = this.makeKey(key);
    const expiresAt = Date.now() + ((ttl ? ttl * 1000 : this.ttl));

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }

    this.cache.set(prefixedKey, {
      value,
      expiresAt,
      createdAt: Date.now()
    });

    this.stats.sets++;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.enabled) return false;

    const prefixedKey = this.makeKey(key);
    const entry = this.cache.get(prefixedKey);

    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(prefixedKey);
      return false;
    }

    return true;
  }

  /**
   * Delete entry from cache
   * @param {string} key - Cache key
   * @returns {boolean} Whether entry was deleted
   */
  delete(key) {
    const prefixedKey = this.makeKey(key);
    return this.cache.delete(prefixedKey);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Clear expired entries
   * @returns {number} Number of entries cleared
   */
  clearExpired() {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxItems,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0,
      sets: this.stats.sets,
      evictions: this.stats.evictions,
      enabled: this.enabled
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
   * Enable or disable cache
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get all cached keys
   * @returns {string[]}
   */
  keys() {
    return Array.from(this.cache.keys())
      .map(k => k.replace(CACHE_KEY_PREFIX, ''));
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Create a cache manager instance
 * @param {Object} config - Configuration
 * @returns {CacheManager}
 */
export function createCacheManager(config = {}) {
  return new CacheManager(config);
}

export { CacheManager };
export default { createCacheManager, CacheManager };
