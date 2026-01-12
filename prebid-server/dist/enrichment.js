/**
 * OpenRTB Enrichment Functions
 */

import { IAB_CATEGORIES } from './iab.js'

/**
 * Build OpenRTB 2.6 site.content object from enrichment result
 * @param {Object} result - Mixpeek enrichment result
 * @param {Object} content - Original content input
 * @returns {Object} OpenRTB 2.6 compatible object
 */
export function enrichOrtb2(result, content) {
  const ortb2 = {
    site: {
      content: {
        language: content.language || 'en'
      }
    }
  }

  // Add keywords
  if (result.enrichments?.keywords?.length > 0) {
    ortb2.site.content.keywords = result.enrichments.keywords.join(',')
  }

  // Add IAB categories
  if (result.taxonomy) {
    const iabCategory = mapToIAB(result.taxonomy.label)
    if (iabCategory) {
      ortb2.site.content.cat = [iabCategory]
      ortb2.site.content.cattax = 6 // IAB Content Taxonomy v3.0
    }
    ortb2.site.content.genre = result.taxonomy.label
  }

  // Add URL and title if provided
  if (content.url) {
    ortb2.site.content.url = content.url
  }
  if (content.title) {
    ortb2.site.content.title = content.title
  }

  // Add extended data
  ortb2.site.content.ext = {
    data: {
      mixpeek: {
        documentId: result.document_id,
        score: result.taxonomy?.score || 0.5,
        sentiment: result.enrichments?.sentiment?.label || 'neutral',
        brandSafety: {
          score: calculateBrandSafety(result.enrichments?.sentiment),
          level: getBrandSafetyLevel(result.enrichments?.sentiment)
        }
      }
    }
  }

  return ortb2
}

/**
 * Enrich an OpenRTB bid request with Mixpeek data
 * @param {Object} bidRequest - OpenRTB bid request
 * @param {Object} enrichment - Enrichment result from Mixpeek
 * @returns {Object} Enriched bid request
 */
export function enrichBidRequest(bidRequest, enrichment) {
  // Deep clone to avoid mutation
  const enriched = JSON.parse(JSON.stringify(bidRequest))

  // Ensure site object exists
  if (!enriched.site) {
    enriched.site = {}
  }

  // Merge site.content
  enriched.site.content = {
    ...enriched.site.content,
    ...enrichment.ortb2.site.content
  }

  // Add targeting to each impression
  if (enriched.imp && Array.isArray(enriched.imp)) {
    enriched.imp = enriched.imp.map(imp => {
      return {
        ...imp,
        ext: {
          ...imp.ext,
          data: {
            ...imp.ext?.data,
            ...enrichment.targeting
          }
        }
      }
    })
  }

  return enriched
}

/**
 * Map category label to IAB code
 */
function mapToIAB(label) {
  const mapping = {
    'Technology': 'IAB19',
    'Business': 'IAB3',
    'Sports': 'IAB17',
    'Entertainment': 'IAB1',
    'Health': 'IAB7',
    'News': 'IAB12',
    'Science': 'IAB15',
    'Automotive': 'IAB2',
    'Travel': 'IAB20',
    'Food': 'IAB8',
    'General': 'IAB24'
  }
  return mapping[label] || 'IAB24'
}

/**
 * Calculate brand safety score from sentiment
 */
function calculateBrandSafety(sentiment) {
  if (!sentiment) return 0.7
  const score = sentiment.score || 0.5
  // Higher sentiment = higher brand safety
  return score > 0.5 ? 0.8 + (score - 0.5) * 0.4 : 0.5 + score * 0.6
}

/**
 * Get brand safety level from sentiment
 */
function getBrandSafetyLevel(sentiment) {
  if (!sentiment) return 'neutral'
  const score = sentiment.score || 0.5
  if (score > 0.6) return 'safe'
  if (score < 0.4) return 'caution'
  return 'neutral'
}
