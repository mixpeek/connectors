/**
 * Google Ad Manager (GAM) Formatter
 *
 * Formats content profiles as key-value pairs for GAM targeting.
 * These keys can be used in:
 * - Line item targeting
 * - Key-value reports
 * - Programmatic Guaranteed deals
 *
 * Key naming follows GAM conventions:
 * - Lowercase with underscores
 * - Short keys for efficiency
 * - Values as strings or arrays
 */

/**
 * Format content profile for GAM targeting
 * @param {Object} profile - Content profile
 * @returns {Object} GAM key-value pairs
 */
export function formatForGAM(profile) {
  if (!profile || !profile.profile) {
    return { error: 'Invalid profile' }
  }

  const { profile: p, url, analyzedAt } = profile
  const kv = {}

  // IAB Content Category (primary use case for ad targeting)
  if (p.iab?.primary) {
    kv.mp_iab = p.iab.primary
  }
  if (p.iab?.all?.length > 0) {
    kv.mp_iab_all = p.iab.all.slice(0, 5) // Limit to 5 categories
  }

  // Taxonomy / Category
  if (p.taxonomy?.label) {
    kv.mp_cat = sanitizeValue(p.taxonomy.label)
  }
  if (p.taxonomy?.nodeId) {
    kv.mp_cat_id = p.taxonomy.nodeId
  }
  if (p.taxonomy?.score) {
    kv.mp_cat_score = Math.round(p.taxonomy.score * 100).toString()
  }

  // Brand Safety (critical for advertiser controls)
  if (p.brandSafety) {
    kv.mp_safety = p.brandSafety.level
    kv.mp_safety_score = Math.round(p.brandSafety.score * 100).toString()

    if (p.brandSafety.categories?.length > 0) {
      kv.mp_safety_flags = p.brandSafety.categories.slice(0, 5)
    }
  }

  // Sentiment (for brand alignment)
  if (p.sentiment) {
    kv.mp_sentiment = p.sentiment.label
    kv.mp_sentiment_score = Math.round(p.sentiment.score * 100).toString()
  }

  // Keywords (for contextual targeting)
  if (p.keywords?.length > 0) {
    kv.mp_kw = p.keywords.slice(0, 10).map(k => sanitizeValue(k))
  }

  // Topics (high-level content themes)
  if (p.topics?.length > 0) {
    kv.mp_topics = p.topics.slice(0, 5).map(t => sanitizeValue(t.name))
  }

  // Content metadata
  if (url) {
    // Extract domain for site-level targeting
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      kv.mp_domain = domain
    } catch (e) {
      // Invalid URL
    }
  }

  // Analysis freshness (for debugging and auditing)
  if (analyzedAt) {
    // How many hours ago was this analyzed
    const hoursAgo = Math.floor((Date.now() - new Date(analyzedAt).getTime()) / (1000 * 60 * 60))
    kv.mp_age = hoursAgo.toString()
  }

  // Document ID (for cross-referencing)
  if (p.documentId) {
    kv.mp_doc_id = p.documentId
  }

  return {
    targeting: kv,
    // Include metadata for debugging
    _meta: {
      format: 'gam',
      version: '1.0',
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Format as GPT targeting string for programmatic
 * @param {Object} profile - Content profile
 * @returns {string} GPT-compatible targeting string
 */
export function formatAsGPTTargeting(profile) {
  const { targeting } = formatForGAM(profile)

  // Convert to key=value pairs
  const pairs = []
  for (const [key, value] of Object.entries(targeting)) {
    if (Array.isArray(value)) {
      value.forEach(v => pairs.push(`${key}=${encodeURIComponent(v)}`))
    } else {
      pairs.push(`${key}=${encodeURIComponent(value)}`)
    }
  }

  return pairs.join('&')
}

/**
 * Sanitize value for GAM compatibility
 */
function sanitizeValue(value) {
  if (!value) return ''

  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .substring(0, 40) // GAM key-value limit
}

export default formatForGAM
