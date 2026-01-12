"""
Tests for Product Mapper
"""

import pytest
from mixpeek_iab_product import (
    ProductMapper,
    create_mapper,
    map_product,
    get_category_by_id,
    get_category_label,
    get_iab_code,
    map_keyword_to_category,
    is_valid_category
)


class TestProductMapper:
    """Tests for ProductMapper class."""

    @pytest.fixture
    def mapper(self):
        """Create mapper instance for tests."""
        return create_mapper(
            enable_cache=True,
            enable_semantic=False,
            mapping_mode="deterministic",
            debug=False
        )

    def test_map_electronics_product(self, mapper):
        """Test mapping electronics product."""
        result = mapper.map_product(
            title="Apple Watch Series 9",
            description="GPS smartwatch with heart rate monitor"
        )

        assert result["success"] is True
        assert "iab_product" in result
        assert result["iab_product"]["primary"].startswith("IAB-AP-")
        assert result["iab_product"]["confidence"] > 0.5

    def test_map_clothing_product(self, mapper):
        """Test mapping clothing product."""
        result = mapper.map_product(
            title="Nike Air Max Running Shoes",
            description="Lightweight running shoes with air cushioning"
        )

        assert result["success"] is True
        assert "Footwear" in result["iab_product"]["label"]

    def test_map_travel_product(self, mapper):
        """Test mapping travel product."""
        result = mapper.map_product(
            title="Marriott Hotel Booking",
            description="Luxury hotel stay in New York City"
        )

        assert result["success"] is True
        assert result["iab_product"]["tier1_label"] == "Travel and Tourism"

    def test_invalid_input(self, mapper):
        """Test handling invalid input."""
        result = mapper.map_product(title="", description="")

        assert result["success"] is False
        assert "error" in result

    def test_caching(self, mapper):
        """Test result caching."""
        product = {
            "title": "Test Product Smartphone",
            "description": "Test description mobile phone"
        }

        result1 = mapper.map_product(**product)
        result2 = mapper.map_product(**product)

        assert result1["success"] is True
        assert result2["success"] is True
        assert result2["cached"] is True

    def test_stats(self, mapper):
        """Test statistics tracking."""
        mapper.map_product(title="Test smartphone")
        mapper.map_product(title="Test smartphone")  # Cache hit

        stats = mapper.get_stats()

        assert stats["requests"] == 2
        assert stats["cache_hits"] == 1

    def test_lookup_category(self, mapper):
        """Test category lookup."""
        category = mapper.lookup_category(1115)

        assert category is not None
        assert category["name"] == "Consumer Electronics"
        assert category["code"] == "IAB-AP-1115"

    def test_validate_category(self, mapper):
        """Test category validation."""
        assert mapper.validate_category(1115) is True
        assert mapper.validate_category("IAB-AP-1115") is True
        assert mapper.validate_category(99999) is False


class TestTaxonomy:
    """Tests for taxonomy functions."""

    def test_get_category_by_id(self):
        """Test getting category by ID."""
        cat = get_category_by_id(1115)

        assert cat is not None
        assert cat["id"] == 1115
        assert cat["name"] == "Consumer Electronics"

    def test_get_category_label(self):
        """Test getting category label."""
        label = get_category_label(1121)

        assert label == "Consumer Electronics > Wearables > Smartwatches"

    def test_get_iab_code(self):
        """Test IAB code generation."""
        code = get_iab_code(1115)

        assert code == "IAB-AP-1115"

    def test_is_valid_category(self):
        """Test category validation."""
        assert is_valid_category(1115) is True
        assert is_valid_category(99999) is False


class TestKeywordMapping:
    """Tests for keyword mapping."""

    def test_map_keyword_to_category(self):
        """Test single keyword mapping."""
        result = map_keyword_to_category("smartphone")

        assert result is not None
        assert result["id"] == 1118
        assert result["name"] == "Smartphones"

    def test_case_insensitive(self):
        """Test case insensitivity."""
        lower = map_keyword_to_category("smartphone")
        upper = map_keyword_to_category("SMARTPHONE")

        assert lower["id"] == upper["id"]

    def test_unknown_keyword(self):
        """Test unknown keyword."""
        result = map_keyword_to_category("xyzabc123")

        assert result is None


class TestQuickMapping:
    """Tests for quick mapping function."""

    def test_map_product_function(self):
        """Test standalone map_product function."""
        result = map_product(
            title="Apple iPhone 15",
            description="Smartphone with A17 chip"
        )

        assert result["success"] is True
        assert "iab_product" in result


class TestEdgeCases:
    """Tests for edge cases."""

    @pytest.fixture
    def mapper(self):
        return create_mapper(enable_semantic=False)

    def test_long_title(self, mapper):
        """Test handling long title."""
        result = mapper.map_product(
            title="Smartphone mobile phone " + "A" * 1000,
            description="Test mobile phone"
        )

        assert result["success"] is True

    def test_special_characters(self, mapper):
        """Test handling special characters."""
        result = mapper.map_product(
            title="iPhone 15 Pro™ - Apple®",
            description="Smartphone with 48MP camera & USB-C"
        )

        assert result["success"] is True

    def test_no_match(self, mapper):
        """Test handling no match."""
        result = mapper.map_product(
            title="xyz abc 123",
            description="nothing recognizable"
        )

        assert result["success"] is False


class TestRealProducts:
    """End-to-end tests with real product examples."""

    @pytest.fixture
    def mapper(self):
        return create_mapper(enable_semantic=False)

    @pytest.mark.parametrize("product,expected_tier1", [
        ({"title": "Smartwatch GPS Wearable Device", "description": "Smart wearable electronics"}, "Consumer Electronics"),
        ({"title": "Nike Running Shoes", "description": "Athletic footwear"}, "Clothing and Accessories"),
        ({"title": "Marriott Hotel Stay", "description": "Luxury accommodation"}, "Travel and Tourism"),
        ({"title": "Chase Credit Card Visa", "description": "Cashback credit card rewards"}, "Finance and Insurance"),
        ({"title": "Budweiser Beer", "description": "American lager"}, "Alcohol"),
        ({"title": "DraftKings Sportsbook", "description": "Sports betting"}, "Gambling"),
    ])
    def test_real_products(self, mapper, product, expected_tier1):
        """Test real product mapping."""
        result = mapper.map_product(**product)

        assert result["success"] is True
        tier1 = result["iab_product"].get("tier1_label") or result["iab_product"]["label"].split(" > ")[0]
        assert tier1 == expected_tier1
