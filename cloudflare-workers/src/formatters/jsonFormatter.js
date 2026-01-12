/**
 * JSON Formatter
 *
 * Formats content profiles as clean JSON for generic API consumption.
 * Suitable for:
 * - Internal services
 * - Custom integrations
 * - Debugging and inspection
 */

/**
 * Format content profile as clean JSON
 * @param {Object} profile - Content profile
 * @returns {Object} Clean JSON format
 */
export function formatForJSON(profile) {
  if (!profile || !profile.profile) {
    return { error: 'Invalid profile' }
  }

  const { profile: p, url, id, analyzedAt } = profile

  return {
    // Profile identification
    id,
    url,
    analyzedAt,

    // Classification
    classification: {
      category: p.taxonomy?.label || null,
      categoryId: p.taxonomy?.nodeId || null,
      categoryPath: p.taxonomy?.path || [],
      confidence: p.taxonomy?.score || null,

      // IAB taxonomy
      iab: {
        primary: p.iab?.primary || null,
        all: p.iab?.all || [],
        version: p.iab?.version || 6
      }
    },

    // Brand safety
    safety: {
      level: p.brandSafety?.level || 'unknown',
      score: p.brandSafety?.score || null,
      flags: p.brandSafety?.categories || []
    },

    // Sentiment
    sentiment: {
      label: p.sentiment?.label || 'neutral',
      score: p.sentiment?.score || 0.5
    },

    // Content signals
    signals: {
      keywords: p.keywords || [],
      topics: p.topics?.map(t => ({
        name: t.name,
        relevance: t.relevance
      })) || [],
      entities: p.entities || []
    },

    // Raw enrichments (for debugging)
    raw: {
      documentId: p.documentId,
      taxonomy: p.taxonomy,
      taxonomies: p.taxonomies
    },

    // Metadata
    _meta: {
      format: 'json',
      version: '1.0',
      generatedAt: new Date().toISOString()
    }
  }
}

export default formatForJSON
