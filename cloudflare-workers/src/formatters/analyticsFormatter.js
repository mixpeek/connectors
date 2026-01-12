/**
 * Analytics Formatter
 *
 * Formats content profiles for analytics and BI tools:
 * - Google Analytics 4 (GA4)
 * - Custom BI dashboards
 * - Data warehouses
 *
 * Designed for:
 * - Custom dimensions
 * - Event parameters
 * - User properties
 */

/**
 * Format content profile for analytics
 * @param {Object} profile - Content profile
 * @returns {Object} Analytics-ready format
 */
export function formatForAnalytics(profile) {
  if (!profile || !profile.profile) {
    return { error: 'Invalid profile' }
  }

  const { profile: p, url, analyzedAt, id } = profile

  // GA4-compatible custom dimensions
  const dimensions = {}

  // Content classification
  if (p.iab?.primary) {
    dimensions.content_iab_category = p.iab.primary
  }
  if (p.taxonomy?.label) {
    dimensions.content_category = p.taxonomy.label
  }
  if (p.taxonomy?.score) {
    dimensions.content_category_confidence = categorizeConfidence(p.taxonomy.score)
  }

  // Brand safety
  if (p.brandSafety) {
    dimensions.content_safety_level = p.brandSafety.level
    dimensions.content_safety_tier = categorizeSafety(p.brandSafety.score)
  }

  // Sentiment
  if (p.sentiment) {
    dimensions.content_sentiment = p.sentiment.label
    dimensions.content_sentiment_tier = categorizeSentiment(p.sentiment.score)
  }

  // Topics (first 3 as dimensions)
  if (p.topics?.length > 0) {
    dimensions.content_topic_1 = p.topics[0]?.name || ''
    if (p.topics.length > 1) dimensions.content_topic_2 = p.topics[1]?.name || ''
    if (p.topics.length > 2) dimensions.content_topic_3 = p.topics[2]?.name || ''
  }

  // Keywords count
  if (p.keywords) {
    dimensions.content_keyword_count = p.keywords.length.toString()
  }

  // Analytics metrics
  const metrics = {
    content_safety_score: p.brandSafety?.score || 0,
    content_sentiment_score: p.sentiment?.score || 0.5,
    content_category_score: p.taxonomy?.score || 0,
    content_topics_count: p.topics?.length || 0,
    content_keywords_count: p.keywords?.length || 0
  }

  // Event parameters (for GA4 events)
  const eventParams = {
    content_id: id,
    content_url: url,
    content_analyzed_at: analyzedAt,
    ...flattenDimensions(dimensions)
  }

  // User properties (for user-scoped analytics)
  const userProperties = {}
  if (p.iab?.all?.length > 0) {
    userProperties.interest_categories = p.iab.all.join(',')
  }
  if (p.topics?.length > 0) {
    userProperties.interest_topics = p.topics.map(t => t.name).join(',')
  }

  // Data layer format (for GTM)
  const dataLayer = {
    event: 'mixpeek_content_analyzed',
    mixpeek: {
      profileId: id,
      url: url,
      category: p.taxonomy?.label || 'unknown',
      iabCategory: p.iab?.primary || '',
      safetyLevel: p.brandSafety?.level || 'unknown',
      sentiment: p.sentiment?.label || 'neutral',
      keywords: p.keywords?.slice(0, 10) || [],
      topics: p.topics?.map(t => t.name) || [],
      scores: {
        safety: p.brandSafety?.score || 0,
        sentiment: p.sentiment?.score || 0.5,
        category: p.taxonomy?.score || 0
      }
    }
  }

  // BigQuery/Warehouse format (flat structure)
  const warehouseRow = {
    profile_id: id,
    url: url,
    analyzed_at: analyzedAt,

    // Category
    category_label: p.taxonomy?.label || null,
    category_node_id: p.taxonomy?.nodeId || null,
    category_score: p.taxonomy?.score || null,
    iab_primary: p.iab?.primary || null,
    iab_all: p.iab?.all?.join(',') || null,

    // Safety
    safety_level: p.brandSafety?.level || null,
    safety_score: p.brandSafety?.score || null,
    safety_flags: p.brandSafety?.categories?.join(',') || null,

    // Sentiment
    sentiment_label: p.sentiment?.label || null,
    sentiment_score: p.sentiment?.score || null,

    // Content
    keywords: p.keywords?.join(',') || null,
    keywords_count: p.keywords?.length || 0,
    topics: p.topics?.map(t => t.name).join(',') || null,
    topics_count: p.topics?.length || 0,

    // Metadata
    document_id: p.documentId || null,
    created_at: new Date().toISOString()
  }

  return {
    // GA4 format
    ga4: {
      dimensions,
      metrics,
      eventParams,
      userProperties
    },

    // GTM Data Layer
    dataLayer,

    // BigQuery/Warehouse row
    warehouse: warehouseRow,

    // Generic analytics object
    analytics: {
      id,
      url,
      category: p.taxonomy?.label,
      iabCategory: p.iab?.primary,
      safetyLevel: p.brandSafety?.level,
      sentiment: p.sentiment?.label,
      scores: metrics
    },

    // Metadata
    _meta: {
      format: 'analytics',
      version: '1.0',
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Categorize confidence score into tiers
 */
function categorizeConfidence(score) {
  if (score >= 0.8) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

/**
 * Categorize safety score into tiers
 */
function categorizeSafety(score) {
  if (score >= 0.8) return 'safe'
  if (score >= 0.5) return 'moderate'
  return 'risky'
}

/**
 * Categorize sentiment score into tiers
 */
function categorizeSentiment(score) {
  if (score >= 0.6) return 'positive'
  if (score >= 0.4) return 'neutral'
  return 'negative'
}

/**
 * Flatten dimensions for event parameters
 */
function flattenDimensions(dimensions) {
  const flat = {}
  for (const [key, value] of Object.entries(dimensions)) {
    if (value !== null && value !== undefined && value !== '') {
      flat[key] = value.toString()
    }
  }
  return flat
}

export default formatForAnalytics
