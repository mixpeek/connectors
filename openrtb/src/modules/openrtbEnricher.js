/**
 * Mixpeek OpenRTB Connector - Main Enricher Module
 *
 * Core enrichment engine for OpenRTB bid requests with contextual AI signals.
 */

import { DEFAULT_CONFIG, ERROR_CODES, PERFORMANCE } from '../config/constants.js';
import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { extractFromBidRequest, extractFromAppRequest, validateContent } from '../extractors/contentExtractor.js';
import {
  formatSiteContent,
  formatImpExt,
  formatTargetingKeys,
  enrichBidRequest,
  createMinimalResponse
} from '../formatters/ortbFormatter.js';
import { createCacheKey, assessBrandSafety } from '../utils/helpers.js';
import { getLogger, createLogger } from '../utils/logger.js';

class OpenRTBEnricher {
  /**
   * Create an OpenRTB enricher
   * @param {Object} config - Configuration
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} config.collectionId - Collection ID
   * @param {string} config.namespace - Namespace
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout (ms)
   * @param {number} [config.cacheTTL] - Cache TTL (seconds)
   * @param {boolean} [config.enableCache] - Enable caching
   * @param {boolean} [config.enableFallback] - Enable fallback enrichments
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = createLogger({ debug: this.config.debug, prefix: '[Mixpeek-OpenRTB]' });

    // Validate required config
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }
    if (!config.collectionId) {
      throw new Error('collectionId is required');
    }
    if (!config.namespace) {
      throw new Error('namespace is required');
    }

    // Initialize API client
    this.client = createClient({
      apiKey: config.apiKey,
      collectionId: config.collectionId,
      namespace: config.namespace,
      endpoint: this.config.endpoint,
      timeout: this.config.timeout,
      debug: this.config.debug
    });

    // Initialize cache
    if (this.config.enableCache) {
      this.cache = createCacheManager({
        ttl: this.config.cacheTTL,
        debug: this.config.debug
      });
    }

    // Metrics
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      apiCalls: 0,
      fallbacks: 0,
      errors: 0,
      totalLatency: 0
    };

    // Health status
    this.healthStatus = null;
    this.lastHealthCheck = null;

    this.logger.info('OpenRTB Enricher initialized', {
      endpoint: this.config.endpoint,
      timeout: this.config.timeout,
      cacheEnabled: this.config.enableCache
    });
  }

  /**
   * Enrich an OpenRTB bid request
   * @param {Object} bidRequest - OpenRTB bid request
   * @param {Object} [options] - Processing options
   * @returns {Promise<Object>} Enrichment result
   */
  async enrich(bidRequest, options = {}) {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      // Extract content from bid request
      const extractedContent = bidRequest.app
        ? extractFromAppRequest(bidRequest)
        : extractFromBidRequest(bidRequest);

      // Validate content
      const validation = validateContent(extractedContent);
      if (!validation.valid) {
        this.logger.debug('Content validation issues:', validation.issues);
      }

      // Generate cache key
      const cacheKey = createCacheKey({
        url: extractedContent.url,
        title: extractedContent.title,
        text: extractedContent.text
      });

      // Check cache
      let enrichments = null;
      let cached = false;

      if (this.config.enableCache && this.cache) {
        enrichments = this.cache.get(cacheKey);
        if (enrichments) {
          cached = true;
          this.metrics.cacheHits++;
          this.logger.debug('Cache hit for:', cacheKey);
        }
      }

      // Track if API call succeeded
      let apiSuccess = true;
      let apiError = null;

      // Call API if not cached
      if (!enrichments) {
        this.metrics.apiCalls++;

        const apiResult = await this.client.processContent({
          url: extractedContent.url,
          title: extractedContent.title,
          description: extractedContent.description,
          text: extractedContent.text,
          images: extractedContent.images,
          videos: extractedContent.videos
        });

        enrichments = apiResult.enrichments;
        apiSuccess = apiResult.success;
        apiError = apiResult.error;

        // Add brand safety assessment
        enrichments.brandSafety = assessBrandSafety(
          extractedContent.text,
          enrichments.keywords
        );

        if (!apiResult.success) {
          this.metrics.fallbacks++;
        }

        // Cache the result only if API succeeded
        if (this.config.enableCache && this.cache && apiResult.success) {
          this.cache.set(cacheKey, enrichments);
        }
      }

      // Calculate latency
      const latencyMs = Date.now() - startTime;
      this.metrics.totalLatency += latencyMs;

      // Log performance warning
      if (latencyMs > PERFORMANCE.WARN_LATENCY_MS) {
        this.logger.warn(`High latency: ${latencyMs}ms (target: ${PERFORMANCE.TARGET_LATENCY_MS}ms)`);
      }

      return {
        success: apiSuccess,
        error: apiError,
        enrichments,
        extractedContent,
        ortb2: {
          site: {
            content: formatSiteContent(enrichments, extractedContent, options)
          }
        },
        targeting: formatTargetingKeys(enrichments, extractedContent),
        cached,
        latencyMs
      };
    } catch (error) {
      this.metrics.errors++;
      this.logger.error('Enrichment failed:', error.message);

      const latencyMs = Date.now() - startTime;

      // Return fallback response if enabled
      if (this.config.enableFallback) {
        return {
          success: false,
          error: error.message,
          enrichments: null,
          ortb2: createMinimalResponse(),
          targeting: {},
          cached: false,
          latencyMs
        };
      }

      throw error;
    }
  }

  /**
   * Enrich a bid request in-place and return the modified request
   * @param {Object} bidRequest - OpenRTB bid request
   * @param {Object} [options] - Processing options
   * @returns {Promise<Object>} Enriched bid request
   */
  async enrichBidRequest(bidRequest, options = {}) {
    const result = await this.enrich(bidRequest, options);

    if (!result.success && !this.config.enableFallback) {
      return bidRequest; // Return original if enrichment failed
    }

    return enrichBidRequest(
      bidRequest,
      result.enrichments || {},
      result.extractedContent || {},
      options
    );
  }

  /**
   * Perform a health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const result = await this.client.healthCheck();

      this.healthStatus = result;
      this.lastHealthCheck = new Date().toISOString();

      return {
        status: result.status,
        latency: result.latency,
        timestamp: this.lastHealthCheck,
        cache: this.cache ? this.cache.getStats() : null,
        metrics: this.getMetrics()
      };
    } catch (error) {
      this.healthStatus = { status: 'unhealthy', error: error.message };
      this.lastHealthCheck = new Date().toISOString();

      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: this.lastHealthCheck
      };
    }
  }

  /**
   * Get processing metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    const avgLatency = this.metrics.requests > 0
      ? this.metrics.totalLatency / this.metrics.requests
      : 0;

    const cacheHitRate = this.metrics.requests > 0
      ? (this.metrics.cacheHits / this.metrics.requests) * 100
      : 0;

    return {
      requests: this.metrics.requests,
      cacheHits: this.metrics.cacheHits,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      apiCalls: this.metrics.apiCalls,
      fallbacks: this.metrics.fallbacks,
      errors: this.metrics.errors,
      avgLatencyMs: Math.round(avgLatency * 100) / 100
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      apiCalls: 0,
      fallbacks: 0,
      errors: 0,
      totalLatency: 0
    };
  }

  /**
   * Get cache statistics
   * @returns {Object|null} Cache stats or null if caching disabled
   */
  getCacheStats() {
    return this.cache ? this.cache.getStats() : null;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    if (this.cache) {
      this.cache.clear();
      this.logger.info('Cache cleared');
    }
  }

  /**
   * Destroy the enricher and clean up resources
   */
  destroy() {
    if (this.cache) {
      this.cache.destroy();
    }
    this.logger.info('Enricher destroyed');
  }
}

/**
 * Create an OpenRTB enricher instance
 * @param {Object} config - Configuration
 * @returns {OpenRTBEnricher} Enricher instance
 */
export function createEnricher(config) {
  return new OpenRTBEnricher(config);
}

export { OpenRTBEnricher };
export default { createEnricher, OpenRTBEnricher };
