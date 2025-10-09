# Mixpeek Connectors

Official connectors and integrations for the Mixpeek multimodal AI platform.

## Overview

This repository contains production-ready connectors that integrate Mixpeek's contextual intelligence capabilities with various advertising, analytics, and content platforms. Each connector is designed to be easy to integrate, performant, and privacy-first.

## Available Connectors

| Connector | Description | Status | Documentation | Version |
|-----------|-------------|--------|---------------|---------|
| [Prebid.js](./prebid.js) | Real-time contextual data provider for Prebid.js header bidding. Enriches bid requests with multimodal AI-powered content analysis including IAB taxonomy, brand safety, and sentiment. | ✅ Production | [README](./prebid.js/README.md) | v2.0.0 |

## Getting Started

Each connector has its own directory with comprehensive documentation. To get started:

1. Navigate to the connector directory you're interested in
2. Read the README for installation and configuration instructions
3. Check the `/docs` folder for detailed guides and API references
4. Run the included tests to validate your setup

## Common Features

All Mixpeek connectors share these core capabilities:

- **Privacy-First**: No cookies or PII collection required
- **Multimodal Analysis**: Text, images, video, and audio processing
- **IAB Standards**: Automatic classification into IAB content taxonomies
- **Brand Safety**: Real-time content safety scoring
- **Fast Performance**: Optimized for low-latency requirements
- **Graceful Fallbacks**: Never block critical paths
- **Comprehensive Testing**: Unit, integration, and E2E tests included

## Requirements

- **Mixpeek Account**: Sign up at [mixpeek.com](https://mixpeek.com/start)
- **API Key**: Generate an API key in your Mixpeek dashboard
- **Collection**: Create a collection with appropriate feature extractors

## Contributing

We welcome contributions! If you'd like to:

- Report a bug or request a feature, open an issue
- Contribute code, submit a pull request
- Build a new connector, reach out to us at support@mixpeek.com

## Support

- **Email**: support@mixpeek.com
- **Documentation**: [docs.mixpeek.com](https://docs.mixpeek.com)
- **GitHub Issues**: [Create an issue](https://github.com/mixpeek/connectors/issues)
- **Slack Community**: [Join our Slack](https://mixpeek.com/slack)

## License

All connectors are licensed under Apache 2.0 unless otherwise specified. See individual LICENSE files in each connector directory.

## About Mixpeek

Mixpeek is a multimodal AI platform that helps publishers, advertisers, and platforms understand and monetize their content through advanced contextual intelligence. Learn more at [mixpeek.com](https://mixpeek.com).

