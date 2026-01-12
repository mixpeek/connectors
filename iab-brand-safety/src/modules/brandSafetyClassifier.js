/**
 * Mixpeek IAB Brand Safety Connector - Brand Safety Classifier
 *
 * Classifies content and products for brand safety and suitability.
 * Supports GARM Brand Safety Floor + Suitability Framework.
 */

import {
  RISK_LEVELS,
  SENSITIVE_CATEGORIES,
  GARM_CATEGORIES,
  getRiskLevel,
  isSensitiveCategory,
  getGARMCategory,
  getCategoriesAtRisk
} from '../data/sensitiveCategories.js';

// Default blocked keywords for content analysis
const DEFAULT_BLOCKED_KEYWORDS = new Set([
  // Violence
  'murder', 'killing', 'violence', 'attack', 'terrorist', 'terrorism',
  'shooting', 'massacre', 'bomb', 'explosion', 'death', 'dead', 'die',

  // Hate speech
  'hate', 'racist', 'racism', 'nazi', 'extremist', 'supremacist',

  // Adult
  'porn', 'xxx', 'nude', 'naked', 'sex', 'erotic', 'adult',

  // Drugs (illegal)
  'cocaine', 'heroin', 'meth', 'fentanyl', 'overdose',

  // Profanity (examples - would be more comprehensive in production)
  'fuck', 'shit', 'damn', 'ass'
]);

// Risk score weights
const RISK_WEIGHTS = {
  [RISK_LEVELS.FLOOR]: 1.0,
  [RISK_LEVELS.HIGH]: 0.8,
  [RISK_LEVELS.MEDIUM]: 0.5,
  [RISK_LEVELS.LOW]: 0.2,
  [RISK_LEVELS.SAFE]: 0.0
};

class BrandSafetyClassifier {
  /**
   * Create a brand safety classifier
   * @param {Object} config - Configuration
   * @param {string[]} [config.blockedKeywords] - Additional blocked keywords
   * @param {number[]} [config.blockedCategories] - Additional blocked category IDs
   * @param {string} [config.riskThreshold] - Minimum acceptable risk level
   * @param {boolean} [config.strictMode] - Block all sensitive categories
   * @param {Object} [config.productMapper] - Optional IAB Ad Product Taxonomy mapper
   */
  constructor(config = {}) {
    this.blockedKeywords = new Set([
      ...DEFAULT_BLOCKED_KEYWORDS,
      ...(config.blockedKeywords || []).map(k => k.toLowerCase())
    ]);

    this.blockedCategories = new Set([
      ...getCategoriesAtRisk(RISK_LEVELS.FLOOR),
      ...(config.blockedCategories || [])
    ]);

    this.riskThreshold = config.riskThreshold || RISK_LEVELS.HIGH;
    this.strictMode = config.strictMode || false;
    this.productMapper = config.productMapper || null;

    // If strict mode, block all high-risk categories
    if (this.strictMode) {
      getCategoriesAtRisk(RISK_LEVELS.HIGH).forEach(id => this.blockedCategories.add(id));
    }

    // Statistics
    this.stats = {
      requests: 0,
      blocked: 0,
      allowed: 0,
      byRisk: {
        [RISK_LEVELS.FLOOR]: 0,
        [RISK_LEVELS.HIGH]: 0,
        [RISK_LEVELS.MEDIUM]: 0,
        [RISK_LEVELS.LOW]: 0,
        [RISK_LEVELS.SAFE]: 0
      }
    };
  }

  /**
   * Classify content for brand safety
   * @param {Object} content - Content to classify
   * @param {string} [content.text] - Text content
   * @param {string} [content.title] - Content title
   * @param {string[]} [content.keywords] - Content keywords
   * @param {number[]} [content.categories] - IAB category IDs
   * @param {Object} [options] - Classification options
   * @returns {Object} Brand safety classification
   */
  classifyContent(content, options = {}) {
    this.stats.requests++;

    const result = {
      safe: true,
      risk: RISK_LEVELS.SAFE,
      riskScore: 0,
      blocked: false,
      reasons: [],
      garmCategories: [],
      sensitiveCategories: [],
      flaggedKeywords: [],
      recommendations: []
    };

    // Check text content for blocked keywords
    const text = [content.text, content.title].filter(Boolean).join(' ').toLowerCase();
    const flaggedKeywords = this.checkKeywords(text);
    if (flaggedKeywords.length > 0) {
      result.flaggedKeywords = flaggedKeywords;
      result.reasons.push(`Blocked keywords found: ${flaggedKeywords.join(', ')}`);
      result.risk = RISK_LEVELS.HIGH;
      result.riskScore = Math.max(result.riskScore, 0.8);
    }

    // Check content keywords
    const contentKeywords = content.keywords || [];
    for (const keyword of contentKeywords) {
      if (this.blockedKeywords.has(keyword.toLowerCase())) {
        if (!result.flaggedKeywords.includes(keyword)) {
          result.flaggedKeywords.push(keyword);
        }
      }
    }

    // Check categories
    const categories = content.categories || [];
    for (const categoryId of categories) {
      if (isSensitiveCategory(categoryId)) {
        const catInfo = SENSITIVE_CATEGORIES[categoryId];
        result.sensitiveCategories.push({
          id: categoryId,
          name: catInfo.name,
          risk: catInfo.risk,
          garmCategory: catInfo.garmCategory
        });

        // Track GARM categories
        if (catInfo.garmCategory && !result.garmCategories.includes(catInfo.garmCategory)) {
          result.garmCategories.push(catInfo.garmCategory);
        }

        // Update risk level
        const riskWeight = RISK_WEIGHTS[catInfo.risk];
        if (riskWeight > result.riskScore) {
          result.risk = catInfo.risk;
          result.riskScore = riskWeight;
        }

        // Check if blocked
        if (this.blockedCategories.has(categoryId)) {
          result.blocked = true;
          result.reasons.push(`Blocked category: ${catInfo.name} (${catInfo.risk})`);
        }
      }
    }

    // Determine final safety status
    result.safe = !result.blocked && result.risk !== RISK_LEVELS.FLOOR;

    // Add recommendations
    if (result.sensitiveCategories.length > 0) {
      result.recommendations.push('Consider brand suitability alignment');
    }
    if (result.flaggedKeywords.length > 0) {
      result.recommendations.push('Review content for policy compliance');
    }

    // Update stats
    if (result.blocked) {
      this.stats.blocked++;
    } else {
      this.stats.allowed++;
    }
    this.stats.byRisk[result.risk]++;

    return result;
  }

  /**
   * Classify a product for brand safety
   * @param {Object} product - Product to classify
   * @param {string} [product.title] - Product title
   * @param {string} [product.description] - Product description
   * @param {string} [product.category] - Product category
   * @param {number} [product.categoryId] - IAB Ad Product category ID
   * @param {Object} [options] - Classification options
   * @returns {Promise<Object>} Brand safety classification
   */
  async classifyProduct(product, options = {}) {
    this.stats.requests++;

    // If we have a product mapper and no category ID, try to classify
    let categoryId = product.categoryId;
    let mappingResult = null;

    if (!categoryId && this.productMapper) {
      mappingResult = await this.productMapper.mapProduct({
        title: product.title,
        description: product.description,
        category: product.category
      });

      if (mappingResult.success) {
        categoryId = mappingResult.iab_product.primaryId;
      }
    }

    // Get risk assessment
    const risk = categoryId ? getRiskLevel(categoryId) : RISK_LEVELS.SAFE;
    const garmCategory = categoryId ? getGARMCategory(categoryId) : null;
    const isSensitive = categoryId ? isSensitiveCategory(categoryId) : false;
    const isBlocked = categoryId ? this.blockedCategories.has(categoryId) : false;

    const result = {
      safe: !isBlocked && risk !== RISK_LEVELS.FLOOR,
      risk,
      riskScore: RISK_WEIGHTS[risk],
      blocked: isBlocked,
      categoryId,
      categoryInfo: categoryId ? SENSITIVE_CATEGORIES[categoryId] : null,
      garmCategory,
      isSensitive,
      reasons: [],
      recommendations: [],
      mapping: mappingResult
    };

    // Add reasons
    if (isBlocked) {
      result.reasons.push(`Product category blocked: ${SENSITIVE_CATEGORIES[categoryId]?.name}`);
    }
    if (isSensitive && !isBlocked) {
      result.reasons.push(`Product in sensitive category: ${SENSITIVE_CATEGORIES[categoryId]?.name}`);
      result.recommendations.push('Verify brand suitability guidelines');
    }

    // Check product text for keywords
    const text = [product.title, product.description].filter(Boolean).join(' ').toLowerCase();
    const flaggedKeywords = this.checkKeywords(text);
    if (flaggedKeywords.length > 0) {
      result.flaggedKeywords = flaggedKeywords;
      result.reasons.push(`Flagged keywords in product: ${flaggedKeywords.join(', ')}`);
      if (result.risk === RISK_LEVELS.SAFE) {
        result.risk = RISK_LEVELS.MEDIUM;
        result.riskScore = 0.5;
      }
    }

    // Update stats
    if (result.blocked) {
      this.stats.blocked++;
    } else {
      this.stats.allowed++;
    }
    this.stats.byRisk[result.risk]++;

    return result;
  }

  /**
   * Check text for blocked keywords
   * @param {string} text - Text to check
   * @returns {string[]} Flagged keywords
   */
  checkKeywords(text) {
    const flagged = [];
    const words = text.split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (this.blockedKeywords.has(cleanWord)) {
        flagged.push(cleanWord);
      }
    }

    return [...new Set(flagged)];
  }

  /**
   * Add blocked keywords
   * @param {string[]} keywords - Keywords to block
   */
  addBlockedKeywords(keywords) {
    for (const keyword of keywords) {
      this.blockedKeywords.add(keyword.toLowerCase());
    }
  }

  /**
   * Add blocked categories
   * @param {number[]} categoryIds - Category IDs to block
   */
  addBlockedCategories(categoryIds) {
    for (const id of categoryIds) {
      this.blockedCategories.add(id);
    }
  }

  /**
   * Remove blocked keyword
   * @param {string} keyword - Keyword to unblock
   */
  removeBlockedKeyword(keyword) {
    this.blockedKeywords.delete(keyword.toLowerCase());
  }

  /**
   * Remove blocked category
   * @param {number} categoryId - Category ID to unblock
   */
  removeBlockedCategory(categoryId) {
    this.blockedCategories.delete(categoryId);
  }

  /**
   * Check if a category is blocked
   * @param {number} categoryId - Category ID
   * @returns {boolean}
   */
  isCategoryBlocked(categoryId) {
    return this.blockedCategories.has(categoryId);
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      blockedRate: this.stats.requests > 0
        ? ((this.stats.blocked / this.stats.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      requests: 0,
      blocked: 0,
      allowed: 0,
      byRisk: {
        [RISK_LEVELS.FLOOR]: 0,
        [RISK_LEVELS.HIGH]: 0,
        [RISK_LEVELS.MEDIUM]: 0,
        [RISK_LEVELS.LOW]: 0,
        [RISK_LEVELS.SAFE]: 0
      }
    };
  }

  /**
   * Get GARM report for current configuration
   * @returns {Object}
   */
  getGARMReport() {
    const report = {};

    for (const [key, garm] of Object.entries(GARM_CATEGORIES)) {
      const blockedCount = garm.categories.filter(id => this.blockedCategories.has(id)).length;
      report[key] = {
        name: garm.name,
        floor: garm.floor,
        totalCategories: garm.categories.length,
        blockedCategories: blockedCount,
        coverage: ((blockedCount / garm.categories.length) * 100).toFixed(0) + '%'
      };
    }

    return report;
  }
}

/**
 * Create a brand safety classifier
 * @param {Object} config - Configuration
 * @returns {BrandSafetyClassifier}
 */
export function createClassifier(config = {}) {
  return new BrandSafetyClassifier(config);
}

/**
 * Quick check if content is brand safe
 * @param {Object} content - Content to check
 * @param {Object} [options] - Options
 * @returns {boolean}
 */
export function isBrandSafe(content, options = {}) {
  const classifier = new BrandSafetyClassifier(options);
  const result = classifier.classifyContent(content);
  return result.safe;
}

/**
 * Quick check if product is brand safe
 * @param {Object} product - Product to check
 * @param {Object} [options] - Options
 * @returns {Promise<boolean>}
 */
export async function isProductBrandSafe(product, options = {}) {
  const classifier = new BrandSafetyClassifier(options);
  const result = await classifier.classifyProduct(product);
  return result.safe;
}

export {
  BrandSafetyClassifier,
  RISK_LEVELS,
  GARM_CATEGORIES
};

export default {
  createClassifier,
  isBrandSafe,
  isProductBrandSafe,
  BrandSafetyClassifier,
  RISK_LEVELS,
  GARM_CATEGORIES
};
