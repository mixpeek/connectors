/**
 * Google Ad Manager Targeting Key Builder
 *
 * Transforms Mixpeek enrichment results into GAM custom targeting keys
 */

import { getIABCode, getIABv3Code } from './iab.js'

/**
 * GAM targeting key prefix
 */
export const KEY_PREFIX = 'mixpeek'

/**
 * Standard targeting key names
 */
export const TARGETING_KEYS = {
  IAB_V3: `${KEY_PREFIX}_iab_v3`,
  IAB_V2: `${KEY_PREFIX}_iab_v2`,
  SENTIMENT: `${KEY_PREFIX}_sentiment`,
  SUITABILITY: `${KEY_PREFIX}_suitability`,
  ADJACENCY_SCORE: `${KEY_PREFIX}_adjacency_score`,
  CONTENT_DEPTH: `${KEY_PREFIX}_content_depth`,
  KEYWORDS: `${KEY_PREFIX}_keywords`,
  CATEGORY: `${KEY_PREFIX}_category`,
  BRAND_SAFETY: `${KEY_PREFIX}_brand_safety`,
  CONTENT_QUALITY: `${KEY_PREFIX}_content_quality`
}

/**
 * Build GAM targeting keys from enrichment result
 * @param {Object} result - Mixpeek enrichment result
 * @param {Object} options - Options for targeting key generation
 * @returns {Object} GAM-compatible targeting key-value pairs
 */
export function buildTargetingKeys(result, options = {}) {
  const targeting = {}

  // IAB Category (v3.0)
  if (result.taxonomy) {
    const iabCode = getIABv3Code(result.taxonomy.label)
    targeting[TARGETING_KEYS.IAB_V3] = iabCode
    targeting[TARGETING_KEYS.IAB_V2] = getIABCode(result.taxonomy.label)
    targeting[TARGETING_KEYS.CATEGORY] = sanitizeValue(result.taxonomy.label)
  }

  // Sentiment
  if (result.enrichments?.sentiment) {
    targeting[TARGETING_KEYS.SENTIMENT] = result.enrichments.sentiment.label
  }

  // Suitability / Brand Safety
  if (result.enrichments?.suitability) {
    targeting[TARGETING_KEYS.SUITABILITY] = result.enrichments.suitability.level
    targeting[TARGETING_KEYS.BRAND_SAFETY] = formatScore(result.enrichments.suitability.score)
  }

  // Content Depth / Quality
  if (result.enrichments?.contentDepth) {
    targeting[TARGETING_KEYS.CONTENT_DEPTH] = result.enrichments.contentDepth.level
    targeting[TARGETING_KEYS.CONTENT_QUALITY] = formatScore(result.enrichments.contentDepth.score)
  }

  // Keywords (limited to GAM max value length of 40 chars)
  if (result.enrichments?.keywords?.length > 0) {
    const maxKeywords = options.maxKeywords || 10
    const allKeywords = result.enrichments.keywords
      .slice(0, maxKeywords)
      .map(k => sanitizeValue(k))

    // Build keywords string, respecting 40 char limit
    let keywordsStr = ''
    for (const kw of allKeywords) {
      const next = keywordsStr ? `${keywordsStr},${kw}` : kw
      if (next.length <= 40) {
        keywordsStr = next
      } else {
        break
      }
    }
    if (keywordsStr) {
      targeting[TARGETING_KEYS.KEYWORDS] = keywordsStr
    }
  }

  // Ad Adjacency Score (if provided)
  if (result.adjacencyScore !== undefined) {
    targeting[TARGETING_KEYS.ADJACENCY_SCORE] = formatScore(result.adjacencyScore)
  }

  return targeting
}

/**
 * Build GAM slot-level targeting for GPT
 * @param {Object} result - Mixpeek enrichment result
 * @param {Object} options - Options
 * @returns {Array} Array of [key, value] pairs for setTargeting
 */
export function buildSlotTargeting(result, options = {}) {
  const targeting = buildTargetingKeys(result, options)
  return Object.entries(targeting).map(([key, value]) => [key, value])
}

/**
 * Build page-level targeting for GPT
 * @param {Object} result - Mixpeek enrichment result
 * @param {Object} options - Options
 * @returns {Object} Page-level targeting object
 */
export function buildPageTargeting(result, options = {}) {
  return buildTargetingKeys(result, options)
}

/**
 * Generate GPT setTargeting code snippet
 * @param {Object} result - Mixpeek enrichment result
 * @param {Object} options - Options
 * @returns {string} JavaScript code snippet
 */
export function generateGPTCode(result, options = {}) {
  const targeting = buildTargetingKeys(result, options)
  const lines = Object.entries(targeting).map(([key, value]) => {
    const escapedValue = typeof value === 'string' ? value.replace(/'/g, "\\'") : value
    return `  googletag.pubads().setTargeting('${key}', '${escapedValue}');`
  })

  return `// Mixpeek contextual targeting for Google Ad Manager\ngoogletag.cmd.push(function() {\n${lines.join('\n')}\n});`
}

/**
 * Format for GAM key-value PMP deals
 * @param {Object} result - Mixpeek enrichment result
 * @returns {Object} PMP-formatted targeting
 */
export function buildPMPTargeting(result) {
  const targeting = {}

  // Premium inventory signals
  if (result.taxonomy) {
    targeting.mp_cat = getIABv3Code(result.taxonomy.label)
    targeting.mp_conf = formatScore(result.taxonomy.score)
  }

  if (result.enrichments?.suitability) {
    targeting.mp_safe = result.enrichments.suitability.level
  }

  if (result.enrichments?.contentDepth) {
    targeting.mp_qual = result.enrichments.contentDepth.level
  }

  return targeting
}

/**
 * Build yield rule conditions
 * @param {Object} result - Mixpeek enrichment result
 * @returns {Object} Yield optimization data
 */
export function buildYieldConditions(result) {
  const conditions = {
    isPremium: false,
    isBrandSafe: false,
    suggestedFloorMultiplier: 1.0
  }

  // Check for premium content
  if (result.enrichments?.contentDepth?.level === 'high') {
    conditions.isPremium = true
    conditions.suggestedFloorMultiplier += 0.2
  }

  // Check brand safety
  if (result.enrichments?.suitability?.score >= 0.8) {
    conditions.isBrandSafe = true
    conditions.suggestedFloorMultiplier += 0.1
  } else if (result.enrichments?.suitability?.score < 0.5) {
    conditions.suggestedFloorMultiplier -= 0.2
  }

  // Positive sentiment bonus
  if (result.enrichments?.sentiment?.label === 'positive') {
    conditions.suggestedFloorMultiplier += 0.05
  }

  // Category-specific adjustments
  const premiumCategories = ['Technology', 'Business', 'Health', 'Science', 'Automotive']
  if (premiumCategories.includes(result.taxonomy?.label)) {
    conditions.suggestedFloorMultiplier += 0.1
  }

  return conditions
}

/**
 * Sanitize value for GAM targeting
 * GAM has restrictions on key-value characters
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') return String(value)
  // GAM allows alphanumeric, underscore, hyphen
  // Remove special characters and limit length
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) // GAM value length limit
}

/**
 * Format score as string for GAM
 */
function formatScore(score) {
  if (typeof score !== 'number') return '0.5'
  return score.toFixed(2)
}

/**
 * Validate targeting keys for GAM compatibility
 * @param {Object} targeting - Targeting key-value pairs
 * @returns {Object} Validation result
 */
export function validateTargeting(targeting) {
  const issues = []
  const MAX_KEY_LENGTH = 40  // GAM allows up to 40 characters for key names
  const MAX_VALUE_LENGTH = 40
  const MAX_VALUES = 500

  for (const [key, value] of Object.entries(targeting)) {
    if (key.length > MAX_KEY_LENGTH) {
      issues.push(`Key "${key}" exceeds max length ${MAX_KEY_LENGTH}`)
    }

    const strValue = String(value)
    if (strValue.length > MAX_VALUE_LENGTH) {
      issues.push(`Value for "${key}" exceeds max length ${MAX_VALUE_LENGTH}`)
    }

    // Check for invalid characters
    if (!/^[a-z0-9_]+$/i.test(key)) {
      issues.push(`Key "${key}" contains invalid characters`)
    }
  }

  return {
    valid: issues.length === 0,
    issues
  }
}
