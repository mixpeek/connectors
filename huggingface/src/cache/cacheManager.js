/**
 * @mixpeek/huggingface — Cache Manager
 *
 * In-memory LRU caching with TTL support.
 */

import { DEFAULT_CACHE_TTL, MAX_CACHE_ITEMS, CACHE_KEY_PREFIX } from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class CacheManager {
  constructor(options = {}) {
    this.ttl = (options.ttl || DEFAULT_CACHE_TTL) * 1000;
    this.maxItems = options.maxItems || MAX_CACHE_ITEMS;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };
    this.logger = getLogger({ debug: options.debug });
    this.cleanupInterval = setInterval(() => this.prune(), 60000);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  _prefixKey(key) { return `${CACHE_KEY_PREFIX}${key}`; }

  get(key) {
    const item = this.cache.get(this._prefixKey(key));
    if (!item) { this.stats.misses++; return null; }
    if (Date.now() > item.expiry) { this.cache.delete(this._prefixKey(key)); this.stats.misses++; return null; }
    this.stats.hits++;
    item.lastAccess = Date.now();
    return item.data;
  }

  set(key, data, ttl = null) {
    if (this.cache.size >= this.maxItems) this._evictLRU();
    this.cache.set(this._prefixKey(key), {
      data, expiry: Date.now() + (ttl ? ttl * 1000 : this.ttl),
      createdAt: Date.now(), lastAccess: Date.now()
    });
    this.stats.sets++;
  }

  has(key) {
    const item = this.cache.get(this._prefixKey(key));
    if (!item) return false;
    if (Date.now() > item.expiry) { this.cache.delete(this._prefixKey(key)); return false; }
    return true;
  }

  delete(key) { return this.cache.delete(this._prefixKey(key)); }
  clear() { this.cache.clear(); }

  prune() {
    const now = Date.now();
    let pruned = 0;
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) { this.cache.delete(key); pruned++; }
    }
    return pruned;
  }

  _evictLRU() {
    let oldestKey = null, oldestAccess = Infinity;
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestAccess) { oldestAccess = item.lastAccess; oldestKey = key; }
    }
    if (oldestKey) { this.cache.delete(oldestKey); this.stats.evictions++; }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size, maxSize: this.maxItems,
      hits: this.stats.hits, misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 10000) / 100 : 0,
      sets: this.stats.sets, evictions: this.stats.evictions, ttlSeconds: this.ttl / 1000
    };
  }

  resetStats() { this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 }; }

  destroy() {
    if (this.cleanupInterval) { clearInterval(this.cleanupInterval); this.cleanupInterval = null; }
    this.cache.clear();
  }

  get size() { return this.cache.size; }
}

export function createCacheManager(options = {}) { return new CacheManager(options); }
export { CacheManager };
export default { createCacheManager, CacheManager };
