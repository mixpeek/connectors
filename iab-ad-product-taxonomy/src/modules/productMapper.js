/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Product Mapper
 *
 * Main module for mapping products to IAB Ad Product Taxonomy categories.
 * Supports deterministic (keyword-based) and semantic (AI-powered) mapping modes.
 */

import {
  DEFAULT_CONFIG,
  MAPPING_MODES,
  CONFIDENCE_THRESHOLDS,
  ERROR_CODES
} from '../config/constants.js';
import {
  IAB_AD_PRODUCT_TAXONOMY,
  getCategoryById,
  getCategoryLabel,
  getCategoryPath,
  getTier1Parent,
  getIABCode,
  isValidCategory
} from '../data/taxonomy.js';
import {
  mapKeywordToCategory,
  mapKeywordsToCategories,
  findBestMatch
} from '../utils/keywordMapping.js';
import {
  validateConfig,
  validateInput,
  createCacheKey,
  extractKeywords,
  sanitizeTitle,
  sanitizeDescription,
  deepMerge
} from '../utils/helpers.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { createClient } from '../api/mixpeekClient.js';
import { getLogger } from '../utils/logger.js';

class ProductMapper {
  /**
   * Create a product mapper instance
   * @param {Object} config - Configuration options
   * @param {string} [config.apiKey] - Mixpeek API key (required for semantic mode)
   * @param {string} [config.namespace] - Namespace for API isolation
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - API timeout in milliseconds
   * @param {number} [config.cacheTTL] - Cache TTL in seconds
   * @param {boolean} [config.enableCache] - Enable caching
   * @param {boolean} [config.enableSemantic] - Enable semantic mapping
   * @param {string} [config.mappingMode] - Mapping mode (deterministic, semantic, hybrid)
   * @param {string} [config.iabVersion] - IAB taxonomy version
   * @param {number} [config.minConfidence] - Minimum confidence threshold
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config = {}) {
    this.config = deepMerge(DEFAULT_CONFIG, config);

    // Validate configuration
    const validation = validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Initialize components
    this.logger = getLogger({ debug: this.config.debug });
    this.cache = this.config.enableCache
      ? createCacheManager({ ttl: this.config.cacheTTL })
      : null;

    // Initialize API client if semantic mode is enabled
    this.client = null;
    if (this.config.enableSemantic && this.config.apiKey) {
      this.client = createClient({
        apiKey: this.config.apiKey,
        namespace: this.config.namespace,
        endpoint: this.config.endpoint,
        timeout: this.config.timeout,
        debug: this.config.debug
      });
    }

    // Statistics
    this.stats = {
      requests: 0,
      cacheHits: 0,
      deterministicMatches: 0,
      semanticMatches: 0,
      noMatches: 0,
      errors: 0,
      totalLatencyMs: 0
    };

    this.logger.log('ProductMapper initialized', {
      mode: this.config.mappingMode,
      semantic: !!this.client,
      cache: !!this.cache
    });
  }

  /**
   * Map a product to IAB Ad Product Taxonomy categories
   * @param {Object} product - Product data
   * @param {string} product.title - Product title
   * @param {string} [product.description] - Product description
   * @param {string} [product.category] - Merchant category
   * @param {string} [product.brand] - Brand name
   * @param {string[]} [product.keywords] - Additional keywords
   * @param {Object} [options] - Mapping options
   * @param {string} [options.mode] - Override mapping mode
   * @param {number} [options.minConfidence] - Override min confidence
   * @param {boolean} [options.includeSecondary] - Include secondary categories
   * @returns {Promise<Object>} Mapping result
   */
  async mapProduct(product, options = {}) {
    const startTime = Date.now();
    this.stats.requests++;

    // Validate input
    const inputValidation = validateInput(product);
    if (!inputValidation.valid) {
      this.stats.errors++;
      return {
        success: false,
        error: inputValidation.errors.join(', '),
        errorCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // Sanitize input
    const sanitized = {
      title: sanitizeTitle(product.title),
      description: sanitizeDescription(product.description),
      category: product.category?.trim() || '',
      brand: product.brand?.trim() || '',
      keywords: product.keywords || []
    };

    // Check cache
    const cacheKey = createCacheKey(sanitized);
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        this.logger.log('Cache hit for product mapping');
        return {
          ...cached,
          cached: true,
          latencyMs: Date.now() - startTime
        };
      }
    }

    // Determine mapping mode
    const mode = options.mode || this.config.mappingMode;
    const minConfidence = options.minConfidence || this.config.minConfidence;
    const includeSecondary = options.includeSecondary !== false;

    let result;

    try {
      switch (mode) {
        case MAPPING_MODES.DETERMINISTIC:
          result = await this.mapDeterministic(sanitized, minConfidence);
          break;

        case MAPPING_MODES.SEMANTIC:
          result = await this.mapSemantic(sanitized, minConfidence);
          break;

        case MAPPING_MODES.HYBRID:
        default:
          result = await this.mapHybrid(sanitized, minConfidence);
          break;
      }

      // Format result
      const formattedResult = this.formatResult(result, sanitized, includeSecondary);

      // Cache result
      if (this.cache && formattedResult.success) {
        this.cache.set(cacheKey, formattedResult);
      }

      // Update stats
      this.stats.totalLatencyMs += Date.now() - startTime;

      return {
        ...formattedResult,
        cached: false,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Mapping error:', error.message);

      return {
        success: false,
        error: error.message,
        errorCode: ERROR_CODES.MAPPING_ERROR,
        latencyMs: Date.now() - startTime
      };
    }
  }

  /**
   * Map using deterministic keyword matching
   * @param {Object} product - Sanitized product data
   * @param {number} minConfidence - Minimum confidence
   * @returns {Promise<Object>} Mapping result
   */
  async mapDeterministic(product, minConfidence) {
    // Extract keywords from product
    const allText = [product.title, product.description, product.category, product.brand]
      .filter(Boolean)
      .join(' ');

    const extractedKeywords = extractKeywords(allText);
    const allKeywords = [...new Set([...product.keywords, ...extractedKeywords])];

    // Try keyword mapping
    const matches = mapKeywordsToCategories(allKeywords);

    if (matches.length > 0) {
      this.stats.deterministicMatches++;
      return {
        source: 'deterministic',
        categories: matches.filter(m => m.confidence >= minConfidence)
      };
    }

    // Try direct text match
    const directMatch = findBestMatch(allText);
    if (directMatch && directMatch.confidence >= minConfidence) {
      this.stats.deterministicMatches++;
      return {
        source: 'deterministic',
        categories: [directMatch]
      };
    }

    this.stats.noMatches++;
    return {
      source: 'deterministic',
      categories: []
    };
  }

  /**
   * Map using semantic (AI-powered) matching
   * @param {Object} product - Sanitized product data
   * @param {number} minConfidence - Minimum confidence
   * @returns {Promise<Object>} Mapping result
   */
  async mapSemantic(product, minConfidence) {
    if (!this.client) {
      throw new Error('API client not initialized. API key required for semantic mapping.');
    }

    const apiResult = await this.client.classifyProduct(product);

    if (apiResult.success && apiResult.categories.length > 0) {
      this.stats.semanticMatches++;
      return {
        source: 'semantic',
        categories: apiResult.categories.filter(c => c.confidence >= minConfidence)
      };
    }

    this.stats.noMatches++;
    return {
      source: 'semantic',
      categories: [],
      error: apiResult.error
    };
  }

  /**
   * Map using hybrid approach (deterministic first, then semantic)
   * @param {Object} product - Sanitized product data
   * @param {number} minConfidence - Minimum confidence
   * @returns {Promise<Object>} Mapping result
   */
  async mapHybrid(product, minConfidence) {
    // Try deterministic first
    const deterministicResult = await this.mapDeterministic(product, minConfidence);

    if (deterministicResult.categories.length > 0) {
      // Check if we have a high-confidence match
      const highConfidenceMatch = deterministicResult.categories.find(
        c => c.confidence >= CONFIDENCE_THRESHOLDS.HIGH
      );

      if (highConfidenceMatch) {
        return deterministicResult;
      }
    }

    // Try semantic if available and deterministic didn't find high-confidence match
    if (this.client) {
      const semanticResult = await this.mapSemantic(product, minConfidence);

      if (semanticResult.categories.length > 0) {
        // Merge results, preferring higher confidence
        const merged = this.mergeResults(
          deterministicResult.categories,
          semanticResult.categories
        );

        return {
          source: 'hybrid',
          categories: merged
        };
      }
    }

    // Return deterministic result (may be empty)
    return {
      source: 'hybrid',
      categories: deterministicResult.categories
    };
  }

  /**
   * Merge deterministic and semantic results
   * @param {Object[]} deterministic - Deterministic matches
   * @param {Object[]} semantic - Semantic matches
   * @returns {Object[]} Merged results
   */
  mergeResults(deterministic, semantic) {
    const byId = new Map();

    // Add deterministic results
    for (const cat of deterministic) {
      byId.set(cat.id, {
        ...cat,
        sources: ['deterministic']
      });
    }

    // Add/merge semantic results
    for (const cat of semantic) {
      const existing = byId.get(cat.id);
      if (existing) {
        // Boost confidence when both sources agree
        existing.confidence = Math.min(0.99, existing.confidence + 0.1);
        existing.sources.push('semantic');
      } else {
        byId.set(cat.id, {
          ...cat,
          sources: ['semantic']
        });
      }
    }

    // Sort by confidence
    return Array.from(byId.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Format the result for output
   * @param {Object} result - Raw mapping result
   * @param {Object} product - Original product data
   * @param {boolean} includeSecondary - Include secondary categories
   * @returns {Object} Formatted result
   */
  formatResult(result, product, includeSecondary) {
    if (!result.categories || result.categories.length === 0) {
      return {
        success: false,
        error: 'No matching category found',
        errorCode: ERROR_CODES.NO_MATCH,
        source: result.source,
        input: {
          title: product.title,
          description: product.description?.slice(0, 100)
        }
      };
    }

    const primary = result.categories[0];
    const primaryCategory = getCategoryById(primary.id);

    // Build primary category info
    const iabProduct = {
      primary: getIABCode(primary.id),
      primaryId: primary.id,
      label: getCategoryLabel(primary.id),
      confidence: primary.confidence,
      version: this.config.iabVersion
    };

    // Add tier 1 parent
    const tier1 = getTier1Parent(primary.id);
    if (tier1 && tier1.id !== primary.id) {
      iabProduct.tier1 = getIABCode(tier1.id);
      iabProduct.tier1Id = tier1.id;
      iabProduct.tier1Label = tier1.name;
    }

    // Add secondary categories
    if (includeSecondary && result.categories.length > 1) {
      iabProduct.secondary = result.categories.slice(1, 4).map(cat => ({
        code: getIABCode(cat.id),
        id: cat.id,
        label: getCategoryLabel(cat.id),
        confidence: cat.confidence
      }));
    }

    // Add explanation
    if (result.source === 'deterministic' && primary.keywords) {
      iabProduct.explanation = `Matched keywords: ${primary.keywords.join(', ')}`;
    } else if (result.source === 'semantic') {
      iabProduct.explanation = 'Semantic classification based on product content';
    } else if (result.source === 'hybrid') {
      iabProduct.explanation = 'Combined deterministic and semantic classification';
    }

    return {
      success: true,
      iab_product: iabProduct,
      source: result.source,
      input: {
        title: product.title,
        description: product.description?.slice(0, 100)
      }
    };
  }

  /**
   * Map multiple products in batch
   * @param {Object[]} products - Array of products
   * @param {Object} [options] - Mapping options
   * @returns {Promise<Object[]>} Array of mapping results
   */
  async mapProducts(products, options = {}) {
    const results = await Promise.all(
      products.map(product => this.mapProduct(product, options))
    );
    return results;
  }

  /**
   * Look up a category by ID
   * @param {number|string} id - Category ID
   * @returns {Object|null} Category info
   */
  lookupCategory(id) {
    const category = getCategoryById(id);
    if (!category) return null;

    return {
      id: category.id,
      code: getIABCode(category.id),
      name: category.name,
      label: getCategoryLabel(category.id),
      tier: category.tier,
      parent: category.parent,
      path: getCategoryPath(category.id)
    };
  }

  /**
   * Validate an IAB Ad Product category
   * @param {number|string} id - Category ID or code
   * @returns {boolean} Whether valid
   */
  validateCategory(id) {
    // Handle IAB-AP-XXXX format
    if (typeof id === 'string' && id.startsWith('IAB-AP-')) {
      const numId = parseInt(id.replace('IAB-AP-', ''), 10);
      return isValidCategory(numId);
    }
    return isValidCategory(id);
  }

  /**
   * Get mapper statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const avgLatency = this.stats.requests > 0
      ? this.stats.totalLatencyMs / this.stats.requests
      : 0;

    return {
      ...this.stats,
      avgLatencyMs: avgLatency.toFixed(2),
      cache: this.cache ? this.cache.getStats() : null
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      requests: 0,
      cacheHits: 0,
      deterministicMatches: 0,
      semanticMatches: 0,
      noMatches: 0,
      errors: 0,
      totalLatencyMs: 0
    };
    if (this.cache) {
      this.cache.resetStats();
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    if (this.cache) {
      this.cache.clear();
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mode: this.config.mappingMode,
      cache: this.cache ? this.cache.getStats() : null,
      api: null
    };

    if (this.client) {
      health.api = await this.client.healthCheck();
      if (health.api.status !== 'healthy') {
        health.status = 'degraded';
      }
    }

    return health;
  }
}

/**
 * Create a product mapper instance
 * @param {Object} config - Configuration
 * @returns {ProductMapper}
 */
export function createMapper(config = {}) {
  return new ProductMapper(config);
}

/**
 * Quick mapping function (creates temporary mapper)
 * @param {Object} product - Product to map
 * @param {Object} [options] - Options
 * @returns {Promise<Object>} Mapping result
 */
export async function mapProduct(product, options = {}) {
  const mapper = new ProductMapper(options);
  return mapper.mapProduct(product);
}

export { ProductMapper };
export default { createMapper, mapProduct, ProductMapper };
