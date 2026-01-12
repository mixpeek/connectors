# Changelog

All notable changes to the Mixpeek OpenRTB Connector will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-11

### Added

- Initial release of Mixpeek OpenRTB Connector
- Core enrichment engine for OpenRTB bid requests
- Support for OpenRTB 2.5, 2.6, and 3.0 specifications
- Site bid request processing with full content extraction
- App bid request processing for mobile inventory
- Video bid request handling with media metadata extraction
- Mixpeek API client with retry logic and timeout handling
- In-memory cache with LRU eviction and configurable TTL
- IAB Content Taxonomy 3.0 mapping from keywords
- Automatic category inference from content
- Sentiment analysis (positive/neutral/negative)
- Brand safety scoring with risk levels
- Language detection for multilingual content
- Content type detection (article, video, product, etc.)
- OpenRTB-compliant output formatting:
  - `site.content` enrichment
  - `imp[].ext.data.mixpeek` impression-level data
  - `ext.mixpeek` request-level metadata
- Targeting key-value generation for ad servers
- Graceful fallback on API failures
- Configurable timeout for RTB latency requirements
- Debug logging with performance timing
- Comprehensive test suite:
  - Unit tests for all modules
  - Integration tests for enrichment flow
  - E2E tests simulating real scenarios
  - Live API tests for validation

### Technical Details

- Node.js 14+ compatible
- Zero external dependencies (uses native fetch)
- Sub-100ms typical processing latency
- 200ms default API timeout
- 1000 item cache capacity
- 300 second default cache TTL
