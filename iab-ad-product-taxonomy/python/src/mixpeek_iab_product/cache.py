"""
Mixpeek IAB Ad Product Taxonomy Connector - Cache Manager

In-memory LRU cache for mapping results.
"""

from typing import Any, Dict, Optional
from cachetools import TTLCache
import hashlib
import json


class CacheManager:
    """LRU cache manager with TTL support."""

    def __init__(
        self,
        maxsize: int = 10000,
        ttl: int = 3600,
        enabled: bool = True
    ):
        """
        Initialize cache manager.

        Args:
            maxsize: Maximum number of items in cache
            ttl: Time to live in seconds
            enabled: Whether caching is enabled
        """
        self.maxsize = maxsize
        self.ttl = ttl
        self.enabled = enabled
        self._cache = TTLCache(maxsize=maxsize, ttl=ttl)
        self._stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0
        }

    def _make_key(self, key: str) -> str:
        """Generate cache key with prefix."""
        return f"mixpeek_iab_ap_{key}"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.enabled:
            self._stats["misses"] += 1
            return None

        prefixed_key = self._make_key(key)
        value = self._cache.get(prefixed_key)

        if value is None:
            self._stats["misses"] += 1
            return None

        self._stats["hits"] += 1
        return value

    def set(self, key: str, value: Any) -> None:
        """Set value in cache."""
        if not self.enabled:
            return

        prefixed_key = self._make_key(key)
        self._cache[prefixed_key] = value
        self._stats["sets"] += 1

    def has(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.enabled:
            return False
        return self._make_key(key) in self._cache

    def delete(self, key: str) -> bool:
        """Delete entry from cache."""
        prefixed_key = self._make_key(key)
        if prefixed_key in self._cache:
            del self._cache[prefixed_key]
            return True
        return False

    def clear(self) -> None:
        """Clear all cache entries."""
        self._cache.clear()

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self._stats["hits"] + self._stats["misses"]
        hit_rate = (self._stats["hits"] / total * 100) if total > 0 else 0

        return {
            "size": len(self._cache),
            "maxsize": self.maxsize,
            "hits": self._stats["hits"],
            "misses": self._stats["misses"],
            "hit_rate": f"{hit_rate:.2f}",
            "sets": self._stats["sets"],
            "enabled": self.enabled
        }

    def reset_stats(self) -> None:
        """Reset statistics."""
        self._stats = {"hits": 0, "misses": 0, "sets": 0}

    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable cache."""
        self.enabled = enabled


def create_cache_manager(
    maxsize: int = 10000,
    ttl: int = 3600,
    enabled: bool = True
) -> CacheManager:
    """Create a cache manager instance."""
    return CacheManager(maxsize=maxsize, ttl=ttl, enabled=enabled)


def create_cache_key(input_data: Dict[str, Any]) -> str:
    """Create cache key from input data."""
    normalized = json.dumps({
        "title": (input_data.get("title") or "").lower().strip()[:100],
        "description": (input_data.get("description") or "").lower().strip()[:200],
        "category": (input_data.get("category") or "").lower().strip()
    }, sort_keys=True)
    return hashlib.md5(normalized.encode()).hexdigest()
