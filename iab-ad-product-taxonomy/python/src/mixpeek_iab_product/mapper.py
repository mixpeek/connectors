"""
Mixpeek IAB Ad Product Taxonomy Connector - Product Mapper

Main module for mapping products to IAB Ad Product Taxonomy categories.
"""

from typing import Any, Dict, List, Optional
import re
import time

from .taxonomy import (
    get_category_by_id,
    get_category_label,
    get_iab_code,
    get_tier1_parent,
    is_valid_category
)
from .keyword_mapping import (
    map_keywords_to_categories,
    find_best_match
)
from .cache import CacheManager, create_cache_key
from .client import MixpeekClient


# Mapping modes
MAPPING_MODES = {
    "deterministic": "deterministic",
    "semantic": "semantic",
    "hybrid": "hybrid"
}

# Confidence thresholds
CONFIDENCE_THRESHOLDS = {
    "high": 0.9,
    "medium": 0.7,
    "low": 0.5,
    "minimum": 0.3
}


class ProductMapper:
    """IAB Ad Product Taxonomy mapper for products."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        namespace: Optional[str] = None,
        endpoint: str = "https://api.mixpeek.com",
        timeout: int = 5000,
        cache_ttl: int = 3600,
        enable_cache: bool = True,
        enable_semantic: bool = True,
        mapping_mode: str = "hybrid",
        iab_version: str = "2.0",
        min_confidence: float = 0.3,
        debug: bool = False
    ):
        """
        Initialize product mapper.

        Args:
            api_key: Mixpeek API key (required for semantic mode)
            namespace: Namespace for API isolation
            endpoint: API endpoint URL
            timeout: API timeout in milliseconds
            cache_ttl: Cache TTL in seconds
            enable_cache: Enable response caching
            enable_semantic: Enable semantic mapping
            mapping_mode: Mapping mode (deterministic, semantic, hybrid)
            iab_version: IAB taxonomy version
            min_confidence: Minimum confidence threshold
            debug: Enable debug logging
        """
        self.api_key = api_key
        self.mapping_mode = mapping_mode
        self.iab_version = iab_version
        self.min_confidence = min_confidence
        self.debug = debug

        # Initialize cache
        self.cache = CacheManager(ttl=cache_ttl, enabled=enable_cache) if enable_cache else None

        # Initialize API client
        self.client = None
        if enable_semantic and api_key:
            self.client = MixpeekClient(
                api_key=api_key,
                namespace=namespace,
                endpoint=endpoint,
                timeout=timeout,
                debug=debug
            )

        # Statistics
        self.stats = {
            "requests": 0,
            "cache_hits": 0,
            "deterministic_matches": 0,
            "semantic_matches": 0,
            "no_matches": 0,
            "errors": 0,
            "total_latency_ms": 0
        }

    def map_product(
        self,
        title: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        keywords: Optional[List[str]] = None,
        mode: Optional[str] = None,
        min_confidence: Optional[float] = None,
        include_secondary: bool = True
    ) -> Dict[str, Any]:
        """
        Map a product to IAB Ad Product Taxonomy categories.

        Args:
            title: Product title
            description: Product description
            category: Merchant category
            brand: Brand name
            keywords: Additional keywords
            mode: Override mapping mode
            min_confidence: Override min confidence
            include_secondary: Include secondary categories

        Returns:
            Mapping result with IAB product categories
        """
        start_time = time.time()
        self.stats["requests"] += 1

        # Validate input
        if not title and not description:
            self.stats["errors"] += 1
            return {
                "success": False,
                "error": "At least title or description is required"
            }

        # Build product dict
        product = {
            "title": self._sanitize(title, 500),
            "description": self._sanitize(description, 2000),
            "category": (category or "").strip(),
            "brand": (brand or "").strip(),
            "keywords": keywords or []
        }

        # Check cache
        if self.cache:
            cache_key = create_cache_key(product)
            cached = self.cache.get(cache_key)
            if cached:
                self.stats["cache_hits"] += 1
                return {
                    **cached,
                    "cached": True,
                    "latency_ms": int((time.time() - start_time) * 1000)
                }

        # Determine mapping mode and confidence
        use_mode = mode or self.mapping_mode
        use_confidence = min_confidence if min_confidence is not None else self.min_confidence

        try:
            # Perform mapping
            if use_mode == "deterministic":
                result = self._map_deterministic(product, use_confidence)
            elif use_mode == "semantic":
                result = self._map_semantic(product, use_confidence)
            else:  # hybrid
                result = self._map_hybrid(product, use_confidence)

            # Format result
            formatted = self._format_result(result, product, include_secondary)

            # Cache result
            if self.cache and formatted.get("success"):
                self.cache.set(cache_key, formatted)

            # Update stats
            self.stats["total_latency_ms"] += int((time.time() - start_time) * 1000)

            return {
                **formatted,
                "cached": False,
                "latency_ms": int((time.time() - start_time) * 1000)
            }

        except Exception as e:
            self.stats["errors"] += 1
            return {
                "success": False,
                "error": str(e),
                "latency_ms": int((time.time() - start_time) * 1000)
            }

    def _sanitize(self, text: Optional[str], max_length: int) -> str:
        """Sanitize text input."""
        if not text:
            return ""
        # Remove control characters
        text = re.sub(r"[\x00-\x1F\x7F]", "", text)
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text)
        return text.strip()[:max_length]

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        if not text:
            return []

        stop_words = {
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
            "be", "have", "has", "had", "do", "does", "did", "will", "would",
            "this", "that", "these", "those", "it", "its", "they", "them",
            "what", "which", "who", "where", "when", "why", "how", "all",
            "each", "every", "both", "few", "more", "most", "other", "some",
            "no", "not", "only", "own", "same", "so", "than", "too", "very"
        }

        words = re.sub(r"[^\w\s-]", " ", text.lower()).split()
        words = [w for w in words if len(w) > 2 and w not in stop_words]

        # Count frequencies
        freq = {}
        for word in words:
            freq[word] = freq.get(word, 0) + 1

        # Sort by frequency
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w for w, _ in sorted_words[:20]]

    def _map_deterministic(
        self,
        product: Dict[str, Any],
        min_confidence: float
    ) -> Dict[str, Any]:
        """Map using deterministic keyword matching."""
        # Extract keywords from product
        all_text = " ".join([
            product["title"],
            product["description"],
            product["category"],
            product["brand"]
        ])
        extracted = self._extract_keywords(all_text)
        all_keywords = list(set(product["keywords"] + extracted))

        # Try keyword mapping
        matches = map_keywords_to_categories(all_keywords)

        if matches:
            self.stats["deterministic_matches"] += 1
            return {
                "source": "deterministic",
                "categories": [m for m in matches if m["confidence"] >= min_confidence]
            }

        # Try direct text match
        direct_match = find_best_match(all_text)
        if direct_match and direct_match["confidence"] >= min_confidence:
            self.stats["deterministic_matches"] += 1
            return {
                "source": "deterministic",
                "categories": [direct_match]
            }

        self.stats["no_matches"] += 1
        return {"source": "deterministic", "categories": []}

    def _map_semantic(
        self,
        product: Dict[str, Any],
        min_confidence: float
    ) -> Dict[str, Any]:
        """Map using semantic (AI-powered) matching."""
        if not self.client:
            raise ValueError("API client not initialized. API key required for semantic mapping.")

        api_result = self.client.classify_product(product)

        if api_result["success"] and api_result.get("categories"):
            self.stats["semantic_matches"] += 1
            return {
                "source": "semantic",
                "categories": [c for c in api_result["categories"] if c["confidence"] >= min_confidence]
            }

        self.stats["no_matches"] += 1
        return {"source": "semantic", "categories": [], "error": api_result.get("error")}

    def _map_hybrid(
        self,
        product: Dict[str, Any],
        min_confidence: float
    ) -> Dict[str, Any]:
        """Map using hybrid approach (deterministic first, then semantic)."""
        # Try deterministic first
        deterministic_result = self._map_deterministic(product, min_confidence)

        if deterministic_result["categories"]:
            # Check for high-confidence match
            high_confidence = any(
                c["confidence"] >= CONFIDENCE_THRESHOLDS["high"]
                for c in deterministic_result["categories"]
            )
            if high_confidence:
                return deterministic_result

        # Try semantic if available
        if self.client:
            semantic_result = self._map_semantic(product, min_confidence)

            if semantic_result["categories"]:
                # Merge results
                merged = self._merge_results(
                    deterministic_result["categories"],
                    semantic_result["categories"]
                )
                return {"source": "hybrid", "categories": merged}

        return {"source": "hybrid", "categories": deterministic_result["categories"]}

    def _merge_results(
        self,
        deterministic: List[Dict],
        semantic: List[Dict]
    ) -> List[Dict]:
        """Merge deterministic and semantic results."""
        by_id = {}

        # Add deterministic results
        for cat in deterministic:
            by_id[cat["id"]] = {**cat, "sources": ["deterministic"]}

        # Add/merge semantic results
        for cat in semantic:
            if cat["id"] in by_id:
                # Boost confidence when both sources agree
                by_id[cat["id"]]["confidence"] = min(0.99, by_id[cat["id"]]["confidence"] + 0.1)
                by_id[cat["id"]]["sources"].append("semantic")
            else:
                by_id[cat["id"]] = {**cat, "sources": ["semantic"]}

        # Sort by confidence
        return sorted(by_id.values(), key=lambda x: x["confidence"], reverse=True)

    def _format_result(
        self,
        result: Dict[str, Any],
        product: Dict[str, Any],
        include_secondary: bool
    ) -> Dict[str, Any]:
        """Format the result for output."""
        if not result["categories"]:
            return {
                "success": False,
                "error": "No matching category found",
                "source": result["source"],
                "input": {
                    "title": product["title"],
                    "description": product["description"][:100] if product["description"] else None
                }
            }

        primary = result["categories"][0]

        # Build primary category info
        iab_product = {
            "primary": get_iab_code(primary["id"]),
            "primary_id": primary["id"],
            "label": get_category_label(primary["id"]),
            "confidence": primary["confidence"],
            "version": self.iab_version
        }

        # Add tier 1 parent
        tier1 = get_tier1_parent(primary["id"])
        if tier1 and tier1["id"] != primary["id"]:
            iab_product["tier1"] = get_iab_code(tier1["id"])
            iab_product["tier1_id"] = tier1["id"]
            iab_product["tier1_label"] = tier1["name"]

        # Add secondary categories
        if include_secondary and len(result["categories"]) > 1:
            iab_product["secondary"] = [
                {
                    "code": get_iab_code(cat["id"]),
                    "id": cat["id"],
                    "label": get_category_label(cat["id"]),
                    "confidence": cat["confidence"]
                }
                for cat in result["categories"][1:4]
            ]

        # Add explanation
        if result["source"] == "deterministic" and primary.get("keywords"):
            iab_product["explanation"] = f"Matched keywords: {', '.join(primary['keywords'])}"
        elif result["source"] == "semantic":
            iab_product["explanation"] = "Semantic classification based on product content"
        elif result["source"] == "hybrid":
            iab_product["explanation"] = "Combined deterministic and semantic classification"

        return {
            "success": True,
            "iab_product": iab_product,
            "source": result["source"],
            "input": {
                "title": product["title"],
                "description": product["description"][:100] if product["description"] else None
            }
        }

    def lookup_category(self, id: int) -> Optional[Dict[str, Any]]:
        """Look up category by ID."""
        category = get_category_by_id(id)
        if not category:
            return None

        return {
            "id": category["id"],
            "code": get_iab_code(category["id"]),
            "name": category["name"],
            "label": get_category_label(category["id"]),
            "tier": category["tier"],
            "parent": category.get("parent")
        }

    def validate_category(self, id) -> bool:
        """Validate a category ID or code."""
        return is_valid_category(id)

    def get_stats(self) -> Dict[str, Any]:
        """Get mapper statistics."""
        avg_latency = (
            self.stats["total_latency_ms"] / self.stats["requests"]
            if self.stats["requests"] > 0 else 0
        )

        return {
            **self.stats,
            "avg_latency_ms": f"{avg_latency:.2f}",
            "cache": self.cache.get_stats() if self.cache else None
        }

    def reset_stats(self) -> None:
        """Reset statistics."""
        self.stats = {
            "requests": 0,
            "cache_hits": 0,
            "deterministic_matches": 0,
            "semantic_matches": 0,
            "no_matches": 0,
            "errors": 0,
            "total_latency_ms": 0
        }
        if self.cache:
            self.cache.reset_stats()

    def clear_cache(self) -> None:
        """Clear cache."""
        if self.cache:
            self.cache.clear()

    def health_check(self) -> Dict[str, Any]:
        """Check mapper health status."""
        health = {
            "status": "healthy",
            "mode": self.mapping_mode,
            "cache": self.cache.get_stats() if self.cache else None,
            "api": None
        }

        if self.client:
            health["api"] = self.client.health_check()
            if health["api"]["status"] != "healthy":
                health["status"] = "degraded"

        return health


def create_mapper(**kwargs) -> ProductMapper:
    """Create a product mapper instance."""
    return ProductMapper(**kwargs)


def map_product(
    title: str,
    description: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """Quick mapping function (creates temporary mapper)."""
    mapper = ProductMapper()
    return mapper.map_product(title=title, description=description, **kwargs)
