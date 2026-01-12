"""
Mixpeek IAB Ad Product Taxonomy Connector - API Client

HTTP client for Mixpeek API integration with semantic classification.
"""

from typing import Any, Dict, List, Optional
import requests
import time
import logging

logger = logging.getLogger(__name__)

DEFAULT_ENDPOINT = "https://api.mixpeek.com"
DEFAULT_TIMEOUT = 5000  # milliseconds
API_VERSION = "v1"


class MixpeekClient:
    """Mixpeek API client for semantic product classification."""

    def __init__(
        self,
        api_key: str,
        namespace: Optional[str] = None,
        endpoint: str = DEFAULT_ENDPOINT,
        timeout: int = DEFAULT_TIMEOUT,
        debug: bool = False
    ):
        """
        Initialize Mixpeek API client.

        Args:
            api_key: Mixpeek API key
            namespace: Namespace for data isolation
            endpoint: API endpoint URL
            timeout: Request timeout in milliseconds
            debug: Enable debug logging
        """
        if not api_key:
            raise ValueError("API key is required")

        self.api_key = api_key
        self.namespace = namespace
        self.endpoint = endpoint.rstrip("/")
        self.timeout = timeout / 1000  # Convert to seconds
        self.debug = debug

        if debug:
            logging.basicConfig(level=logging.DEBUG)

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mixpeek-IAB-AdProduct-Python/1.0.0"
        }
        if self.namespace:
            headers["X-Namespace-Id"] = self.namespace
        return headers

    def _request(
        self,
        method: str,
        path: str,
        body: Optional[Dict] = None,
        retries: int = 2
    ) -> Dict[str, Any]:
        """Make HTTP request with retry logic."""
        url = f"{self.endpoint}/{API_VERSION}{path}"
        headers = self._build_headers()

        last_error = None

        for attempt in range(retries + 1):
            try:
                logger.debug(f"API {method} {path} (attempt {attempt + 1})")

                response = requests.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=body,
                    timeout=self.timeout
                )

                response.raise_for_status()
                return response.json()

            except requests.Timeout as e:
                last_error = e
                logger.warning(f"Request timeout after {self.timeout}s")

            except requests.RequestException as e:
                last_error = e
                logger.warning(f"Request failed: {e}")

            if attempt < retries:
                time.sleep(0.1)  # 100ms delay between retries

        raise last_error or Exception("Request failed after retries")

    def classify_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify product using Mixpeek's semantic understanding.

        Args:
            product: Product data with title, description, etc.

        Returns:
            Classification result with categories
        """
        start_time = time.time()

        try:
            # Build classification text
            parts = []
            if product.get("title"):
                parts.append(f"Product: {product['title']}")
            if product.get("description"):
                parts.append(f"Description: {product['description']}")
            if product.get("category"):
                parts.append(f"Category: {product['category']}")
            if product.get("brand"):
                parts.append(f"Brand: {product['brand']}")

            payload = {
                "content": {"text": "\n".join(parts)},
                "taxonomy": "iab_ad_product_2.0",
                "options": {
                    "max_categories": 3,
                    "min_confidence": 0.3,
                    "include_hierarchy": True
                }
            }

            response = self._request("POST", "/classify", payload)

            return {
                "success": True,
                "categories": self._normalize_categories(response),
                "latency_ms": int((time.time() - start_time) * 1000),
                "source": "api"
            }

        except Exception as e:
            logger.warning(f"API classification failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "latency_ms": int((time.time() - start_time) * 1000),
                "source": "api"
            }

    def _normalize_categories(self, response: Dict) -> List[Dict[str, Any]]:
        """Normalize API response to standard format."""
        if not response or "categories" not in response:
            return []

        return [
            {
                "id": cat.get("id") or cat.get("category_id"),
                "name": cat.get("name") or cat.get("category_name"),
                "confidence": cat.get("confidence") or cat.get("score"),
                "tier": cat.get("tier") or cat.get("level"),
                "parent": cat.get("parent_id") or cat.get("parent"),
                "path": cat.get("path") or cat.get("hierarchy")
            }
            for cat in response["categories"]
        ]

    def health_check(self) -> Dict[str, Any]:
        """Check API health status."""
        try:
            start_time = time.time()
            self._request("GET", "/health")
            latency = int((time.time() - start_time) * 1000)

            return {
                "status": "healthy",
                "latency_ms": latency
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


def create_client(
    api_key: str,
    namespace: Optional[str] = None,
    endpoint: str = DEFAULT_ENDPOINT,
    timeout: int = DEFAULT_TIMEOUT,
    debug: bool = False
) -> MixpeekClient:
    """Create a Mixpeek client instance."""
    return MixpeekClient(
        api_key=api_key,
        namespace=namespace,
        endpoint=endpoint,
        timeout=timeout,
        debug=debug
    )
