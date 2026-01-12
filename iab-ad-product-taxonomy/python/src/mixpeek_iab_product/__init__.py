"""
Mixpeek IAB Ad Product Taxonomy Mapper

Standards-aligned taxonomy mapping utility for converting product metadata
into IAB Tech Lab Ad Product Taxonomy categories.
"""

from .mapper import ProductMapper, create_mapper, map_product
from .taxonomy import (
    IAB_AD_PRODUCT_TAXONOMY,
    IAB_AD_PRODUCT_TIER1,
    get_category_by_id,
    get_category_label,
    get_category_path,
    get_child_categories,
    get_iab_code,
    get_id_from_code,
    get_tier1_categories,
    get_tier1_parent,
    is_valid_category,
)
from .keyword_mapping import (
    KEYWORD_MAPPINGS,
    find_best_match,
    get_all_keywords,
    get_keywords_for_category,
    map_keyword_to_category,
    map_keywords_to_categories,
)
from .client import MixpeekClient, create_client
from .cache import CacheManager, create_cache_manager

__version__ = "1.0.0"
__author__ = "Mixpeek"
__email__ = "info@mixpeek.com"

__all__ = [
    # Main mapper
    "ProductMapper",
    "create_mapper",
    "map_product",
    # Client
    "MixpeekClient",
    "create_client",
    # Cache
    "CacheManager",
    "create_cache_manager",
    # Taxonomy
    "IAB_AD_PRODUCT_TAXONOMY",
    "IAB_AD_PRODUCT_TIER1",
    "get_iab_code",
    "get_id_from_code",
    "get_category_by_id",
    "get_tier1_categories",
    "get_child_categories",
    "get_category_path",
    "get_category_label",
    "is_valid_category",
    "get_tier1_parent",
    # Keyword mapping
    "KEYWORD_MAPPINGS",
    "map_keyword_to_category",
    "map_keywords_to_categories",
    "find_best_match",
    "get_keywords_for_category",
    "get_all_keywords",
]
