# Changelog

All notable changes to the Mixpeek Context Adapter for Prebid.js will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-08

### Added

#### Core Features
- **Mixpeek Context Adapter** for Prebid.js integration
- Real-time contextual analysis using Mixpeek's multimodal AI engine
- Support for page, video, and image content extraction
- Automatic IAB taxonomy classification
- Brand safety scoring
- Keyword extraction
- Sentiment analysis

#### Content Extraction
- **Page Extractor**: Extracts text, meta tags, Open Graph data, and structured data
- **Video Extractor**: Extracts video metadata, source URLs, and frame snapshots
- **Image Extractor**: Extracts primary images with metadata and dimensions
- Auto-detection mode for optimal content type selection

#### API Integration
- Full Mixpeek API client with retry logic and timeout handling
- Support for multiple feature extractors
- Custom feature extractor configuration
- Document creation and retrieval
- Health check endpoint

#### Caching
- In-memory cache with configurable TTL
- LocalStorage persistence
- Automatic cache expiration and pruning
- Cache statistics and monitoring

#### Targeting
- Injection of contextual targeting keys into Prebid ad requests
- Support for both `ortb2Imp` and legacy bid params
- Comprehensive key-value schema (taxonomy, brand safety, keywords, etc.)

#### Events
- `mixpeekContextReady` - Context successfully loaded
- `mixpeekContextError` - Error during enrichment
- `mixpeekContextCached` - Cached context used
- `mixpeekApiRequest` - API request initiated
- `mixpeekApiResponse` - API response received

#### Testing
- Comprehensive unit test suite
- Integration tests for end-to-end workflows
- Test setup with mocked browser environment
- Coverage for all core modules

#### Documentation
- Detailed README with quickstart guide
- Integration guide with step-by-step instructions
- API reference documentation
- Example implementation with live demo
- Postman collection for API testing

#### Examples
- Publisher demo with contextual ad enrichment
- Debug panel for real-time monitoring
- Multiple ad unit configurations
- Event listener examples

#### Configuration
- Flexible configuration via `pbjs.setConfig()`
- Support for API key, collection ID, and namespace
- Configurable timeout, cache TTL, and retry attempts
- Debug mode for development
- Multiple content modes (auto, page, video, image)

### Technical Details

- **Language**: JavaScript (ES6)
- **Module Format**: UMD (Universal Module Definition)
- **Browser Support**: Modern browsers with ES6 support
- **Dependencies**: None (standalone)
- **Build System**: Webpack
- **Testing**: Jest
- **Linting**: ESLint with Standard config

### Performance

- API latency: <250ms (typical)
- Cache hit latency: <10ms
- No blocking of ad auction
- Graceful fallback on errors

### Security

- HTTPS-only API communication
- Bearer token authentication
- No PII collection or transmission
- Content-only analysis
- Optional namespace isolation

### Compliance

- GDPR compliant (no user tracking)
- CCPA compliant (contextual only)
- No cookies or user identifiers
- Privacy-first targeting

---

## [Unreleased]

### Planned for v1.1.0
- Server-side adapter for Prebid Server
- WebSocket support for real-time video scene changes
- Batched API calls for multi-slot pages
- Extended video analysis with frame-by-frame processing
- Custom taxonomy support
- Analytics dashboard integration

### Planned for v1.2.0
- Machine learning model caching
- Edge function deployment support
- Advanced clustering and similarity matching
- Multi-language support
- Enhanced brand safety categories

---

## Release History

- **v1.0.0** (2025-10-08) - Initial release

---

## Upgrade Guide

### From Development to v1.0.0

This is the first stable release. No migration required.

---

## Support

For questions, issues, or feature requests:

- **Documentation**: https://docs.mixpeek.com
- **GitHub Issues**: https://github.com/mixpeek/prebid/issues
- **Email**: info@mixpeek.com
- **Slack**: https://mixpeek.com/slack

