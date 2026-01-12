# mixpeek-iab-product

IAB Ad Product Taxonomy mapper for standardized product classification with deterministic and semantic mapping.

[![PyPI version](https://badge.fury.io/py/mixpeek-iab-product.svg)](https://pypi.org/project/mixpeek-iab-product/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This package converts arbitrary product metadata into standardized **IAB Tech Lab Ad Product Taxonomy 2.0** categories. It provides publishers with stronger signals to control ad delivery and measure ad performance.

## Scope & Intent

This package is a **non-normative reference implementation** for mapping product metadata to the IAB Ad Product Taxonomy.

It is intended to:
- Standardize product classification across systems
- Provide deterministic and explainable mappings
- Support validation, QA, and offline processing

It does **not** define or modify the IAB taxonomy itself. Taxonomy definitions are sourced from the published IAB Ad Product Taxonomy and versioned locally for reproducibility.

### Key Characteristics

- **Deterministic First**: Keyword matching with optional semantic fallback
- **Explainable**: Every classification includes matched keywords and confidence
- **Offline-Ready**: No network required for deterministic mode
- **Batch Processing**: Efficient processing of large product feeds
- **Type-Annotated**: Full type hints for IDE support

## Installation

```bash
pip install mixpeek-iab-product
```

## Quick Start

```python
from mixpeek_iab_product import create_mapper, map_product

# Create mapper instance
mapper = create_mapper(
    enable_cache=True,
    mapping_mode="hybrid"  # "deterministic", "semantic", or "hybrid"
)

# Map a product
result = mapper.map_product(
    title="Apple Watch Series 9",
    description="GPS smartwatch with heart rate monitor"
)

print(result)
# {
#     "success": True,
#     "iab_product": {
#         "primary": "IAB-AP-1121",
#         "primary_id": 1121,
#         "label": "Consumer Electronics > Wearables > Smartwatches",
#         "confidence": 0.95,
#         "version": "2.0",
#         "tier1": "IAB-AP-1115",
#         "tier1_label": "Consumer Electronics"
#     },
#     "cached": False,
#     "latency_ms": 5
# }

# Or use quick function
result = map_product(
    title="Nike Running Shoes",
    description="Lightweight athletic footwear"
)
```

## Configuration

```python
mapper = create_mapper(
    api_key="your_mixpeek_api_key",  # Required for semantic mode
    namespace="your_namespace",
    endpoint="https://api.mixpeek.com",
    timeout=5000,  # milliseconds
    cache_ttl=3600,  # seconds
    enable_cache=True,
    enable_semantic=True,
    mapping_mode="hybrid",  # "deterministic", "semantic", "hybrid"
    iab_version="2.0",
    min_confidence=0.3,
    debug=False
)
```

## Mapping Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `deterministic` | Keyword-based matching only | High-speed, predictable, explainable results |
| `semantic` | Semantic classification (optional fallback) | Better coverage, requires API key |
| `hybrid` | Deterministic first, semantic fallback | Determinism with graceful degradation |

## When to Use PyPI vs npm

| Use Case | Package |
|----------|---------|
| Real-time ad pipelines | **npm** - Sub-10ms latency |
| Product feed labeling | **PyPI** - Batch processing |
| QA / data validation | **PyPI** - Offline mode |
| Jupyter notebooks | **PyPI** - Interactive exploration |
| Edge / CDN workers | **npm** - Browser-compatible |
| ML training pipelines | **PyPI** - Pandas/NumPy integration |

## API Reference

### `mapper.map_product()`

```python
result = mapper.map_product(
    title="Product Title",
    description="Product description",
    category="Merchant category",
    brand="Brand name",
    keywords=["additional", "keywords"],
    mode="deterministic",  # Override mode
    min_confidence=0.5,     # Override threshold
    include_secondary=True  # Include secondary categories
)
```

### `mapper.lookup_category(id)`

```python
category = mapper.lookup_category(1121)
# {"id": 1121, "code": "IAB-AP-1121", "name": "Smartwatches", ...}
```

### `mapper.validate_category(id)`

```python
mapper.validate_category(1121)           # True
mapper.validate_category("IAB-AP-1121")  # True
mapper.validate_category(99999)          # False
```

### `mapper.get_stats()`

```python
stats = mapper.get_stats()
# {"requests": 100, "cache_hits": 60, "avg_latency_ms": "4.50", ...}
```

## Direct Taxonomy Access

```python
from mixpeek_iab_product import (
    get_category_by_id,
    get_category_label,
    get_tier1_categories,
    get_iab_code,
    is_valid_category
)

# Get category info
cat = get_category_by_id(1121)
# {"id": 1121, "name": "Smartwatches", "tier": 3, "parent": 1120}

# Get label path
label = get_category_label(1121)
# "Consumer Electronics > Wearables > Smartwatches"

# Get all tier 1 categories
tier1 = get_tier1_categories()
# [{"id": 1115, "name": "Consumer Electronics", ...}, ...]
```

## Keyword Mapping

```python
from mixpeek_iab_product import (
    map_keyword_to_category,
    map_keywords_to_categories,
    find_best_match
)

# Single keyword
match = map_keyword_to_category("smartphone")
# {"id": 1118, "name": "Smartphones", "confidence": 0.95}

# Multiple keywords
matches = map_keywords_to_categories(["phone", "mobile", "iphone"])

# Best match from text
best = find_best_match("Apple iPhone 15 Pro smartphone")
```

## Examples

### Product Feed Processing

```python
from mixpeek_iab_product import create_mapper

mapper = create_mapper(enable_cache=True)

def process_product_feed(products):
    results = []
    for product in products:
        result = mapper.map_product(
            title=product["title"],
            description=product.get("description"),
            category=product.get("category")
        )
        results.append({
            **product,
            "iab_category": result["iab_product"]["primary"] if result["success"] else None
        })
    return results
```

### Brand Safety Filtering

```python
from mixpeek_iab_product import create_mapper, get_tier1_parent

BLOCKED_CATEGORIES = [1002, 1008, 1050, 1440, 1800, 1920]  # Alcohol, Adult, etc.

mapper = create_mapper()

def is_brand_safe(product):
    result = mapper.map_product(**product)
    if not result["success"]:
        return True  # Unknown products pass

    tier1 = get_tier1_parent(result["iab_product"]["primary_id"])
    return tier1["id"] not in BLOCKED_CATEGORIES
```

## Testing

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# With coverage
pytest --cov=mixpeek_iab_product
```

## License

Apache 2.0 License

## Support

- GitHub Issues: [github.com/mixpeek/connectors/issues](https://github.com/mixpeek/connectors/issues)
- Documentation: [docs.mixpeek.com](https://docs.mixpeek.com)
- Email: info@mixpeek.com
