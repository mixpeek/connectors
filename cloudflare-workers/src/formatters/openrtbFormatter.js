/**
 * OpenRTB 2.6 Formatter
 *
 * Formats content profiles for OpenRTB bid requests.
 * Compatible with:
 * - Prebid Server
 * - SSPs (Supply Side Platforms)
 * - DSPs (Demand Side Platforms)
 *
 * Follows OpenRTB 2.6 specification:
 * https://www.iab.com/wp-content/uploads/2020/09/OpenRTB_2-6_FINAL.pdf
 */

import { IAB_TAXONOMY_VERSION } from '../utils/iabMapping.js'

/**
 * Format content profile for OpenRTB site.content
 * @param {Object} profile - Content profile
 * @returns {Object} OpenRTB formatted response
 */
export function formatForOpenRTB(profile) {
  if (!profile || !profile.profile) {
    return { error: 'Invalid profile' }
  }

  const { profile: p, url, analyzedAt } = profile

  // Build OpenRTB site.content object
  const content = {}

  // Content ID
  if (p.documentId) {
    content.id = p.documentId
  }

  // Title
  if (p.title) {
    content.title = p.title
  }

  // URL
  if (url) {
    content.url = url
  }

  // IAB Content Categories (Section 5.1 of OpenRTB)
  if (p.iab?.all?.length > 0) {
    content.cat = p.iab.all
    content.cattax = IAB_TAXONOMY_VERSION // IAB Content Taxonomy v3.0 = 6
  } else if (p.iab?.primary) {
    content.cat = [p.iab.primary]
    content.cattax = IAB_TAXONOMY_VERSION
  }

  // Genre (human-readable category)
  if (p.taxonomy?.label) {
    content.genre = p.taxonomy.label
  }

  // Keywords (comma-separated string per OpenRTB spec)
  if (p.keywords?.length > 0) {
    content.keywords = p.keywords.join(',')
  }

  // Language detection (if available)
  content.language = 'en' // Default, could be enhanced with detection

  // Content length indicator
  if (p.contentLength) {
    content.len = p.contentLength
  }

  // Extension data (Mixpeek-specific enrichments)
  content.ext = {
    data: {
      mixpeek: {
        // Document tracking
        documentId: p.documentId,
        analyzedAt: analyzedAt,

        // Taxonomy details
        taxonomy: p.taxonomy ? {
          label: p.taxonomy.label,
          nodeId: p.taxonomy.nodeId,
          path: p.taxonomy.path,
          score: p.taxonomy.score
        } : null,

        // Brand safety
        brandSafety: p.brandSafety ? {
          level: p.brandSafety.level,
          score: p.brandSafety.score,
          categories: p.brandSafety.categories
        } : null,

        // Sentiment
        sentiment: p.sentiment ? {
          label: p.sentiment.label,
          score: p.sentiment.score
        } : null,

        // Topics for contextual targeting
        topics: p.topics?.map(t => ({
          name: t.name,
          relevance: t.relevance
        })) || []
      }
    }
  }

  // Build data segments for bidder targeting
  const segments = []

  // IAB category segments
  if (p.iab?.all) {
    p.iab.all.forEach((cat, index) => {
      segments.push({
        id: cat,
        name: `iab_${cat}`,
        value: index === 0 ? '1.0' : '0.8' // Primary vs secondary
      })
    })
  }

  // Brand safety segment
  if (p.brandSafety?.level) {
    segments.push({
      id: `safety_${p.brandSafety.level}`,
      name: 'brand_safety',
      value: p.brandSafety.score.toString()
    })
  }

  // Sentiment segment
  if (p.sentiment?.label) {
    segments.push({
      id: `sentiment_${p.sentiment.label}`,
      name: 'sentiment',
      value: p.sentiment.score.toString()
    })
  }

  return {
    // Primary output: OpenRTB site.content object
    site: {
      content
    },

    // Data segments for First-Party Data (FPD)
    data: [{
      id: 'mixpeek',
      name: 'Mixpeek Content Intelligence',
      segment: segments
    }],

    // User segments (content-based, not user-based)
    user: {
      data: [{
        id: 'mixpeek-contextual',
        name: 'Mixpeek Contextual Segments',
        segment: segments
      }]
    },

    // Prebid.js ortb2Fragments format
    ortb2Fragments: {
      global: {
        site: {
          content
        }
      }
    },

    // Metadata
    _meta: {
      format: 'openrtb',
      version: '2.6',
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Format for Prebid Server ext.data injection
 * @param {Object} profile - Content profile
 * @returns {Object} Prebid Server compatible format
 */
export function formatForPrebidServer(profile) {
  const ortb = formatForOpenRTB(profile)

  return {
    ext: {
      prebid: {
        data: {
          site: ortb.site,
          user: ortb.user
        }
      }
    }
  }
}

/**
 * Format as bid request enrichment
 * This can be merged directly into a bid request
 * @param {Object} profile - Content profile
 * @returns {Object} Bid request enrichment object
 */
export function formatAsBidRequestEnrichment(profile) {
  const ortb = formatForOpenRTB(profile)

  return {
    site: {
      content: ortb.site.content
    },
    user: ortb.user,
    ext: {
      data: ortb.data
    }
  }
}

export default formatForOpenRTB
