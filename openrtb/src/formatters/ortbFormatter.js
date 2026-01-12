/**
 * Mixpeek OpenRTB Connector - OpenRTB Formatter
 *
 * Formats enrichment data into OpenRTB 2.5/2.6/3.0 compliant structures.
 */

import {
  DEFAULT_OPENRTB_VERSION,
  DEFAULT_IAB_VERSION,
  TARGETING_KEYS,
  BRAND_SAFETY_LEVELS
} from '../config/constants.js';
import { keywordsToIAB } from '../utils/iabMapping.js';
import { deepMerge } from '../utils/helpers.js';

/**
 * Format enrichments as OpenRTB site.content object
 * @param {Object} enrichments - Enrichment data
 * @param {Object} extractedContent - Extracted content from request
 * @param {Object} options - Formatting options
 * @returns {Object} OpenRTB site.content object
 */
export function formatSiteContent(enrichments, extractedContent, options = {}) {
  const iabVersion = options.iabVersion || DEFAULT_IAB_VERSION;

  // Get IAB categories from keywords
  const iabCategories = keywordsToIAB(enrichments.keywords || []);

  // Merge with existing categories
  const allCategories = [
    ...iabCategories,
    ...(extractedContent.categories || [])
  ].filter((v, i, a) => a.indexOf(v) === i); // Dedupe

  return {
    // IAB categories
    cat: allCategories.slice(0, 10), // Max 10 categories

    // Content keywords
    keywords: (enrichments.keywords || []).slice(0, 20).join(','),

    // Content metadata from extraction
    title: extractedContent.title || undefined,
    id: extractedContent.content?.id || undefined,
    series: extractedContent.content?.series || undefined,
    season: extractedContent.content?.season || undefined,
    episode: extractedContent.content?.episode || undefined,
    artist: extractedContent.content?.artist || undefined,
    album: extractedContent.content?.album || undefined,
    isrc: extractedContent.content?.isrc || undefined,
    producer: extractedContent.content?.producer || undefined,
    len: extractedContent.content?.len || undefined,
    livestream: extractedContent.content?.livestream || undefined,
    sourcerelationship: extractedContent.content?.sourcerelationship || undefined,
    embeddable: extractedContent.content?.embeddable || undefined,
    language: extractedContent.language || undefined,

    // Quality rating
    qagmediarating: extractedContent.content?.qagmediarating || undefined,

    // Content taxonomy version
    cattax: iabVersion === '3.0' ? 7 : (iabVersion === '2.0' ? 6 : 1),

    // Mixpeek extensions
    ext: {
      mixpeek: {
        // Sentiment analysis
        sentiment: enrichments.sentiment?.sentiment || 'neutral',
        sentimentScore: enrichments.sentiment?.score || 0,

        // Brand safety
        brandSafety: getBrandSafetyFromEnrichments(enrichments),

        // Categories with confidence
        taxonomy: enrichments.categories || null,

        // Document reference
        documentId: enrichments.documentId || null,

        // Embedding reference for semantic matching
        embeddingId: enrichments.embeddings?.id || null,

        // Processing metadata
        source: enrichments.source || 'api',
        version: '1.0.0'
      }
    }
  };
}

/**
 * Format enrichments for impression-level data
 * @param {Object} enrichments - Enrichment data
 * @param {Object} extractedContent - Extracted content
 * @param {string} impId - Impression ID
 * @returns {Object} Impression extension data
 */
export function formatImpExt(enrichments, extractedContent, impId) {
  return {
    data: {
      mixpeek: {
        impId,

        // Primary category
        category: enrichments.categories?.category || null,
        categoryName: enrichments.categories?.categoryName || null,

        // Keywords for targeting
        keywords: (enrichments.keywords || []).slice(0, 10),

        // Sentiment
        sentiment: enrichments.sentiment?.sentiment || 'neutral',

        // Brand safety level
        brandSafetyLevel: getBrandSafetyFromEnrichments(enrichments).level,
        brandSafetyScore: getBrandSafetyFromEnrichments(enrichments).score,

        // Content type
        contentType: extractedContent.contentType || null,

        // Language
        language: extractedContent.language || 'en'
      }
    }
  };
}

/**
 * Format enrichments as targeting key-values
 * @param {Object} enrichments - Enrichment data
 * @param {Object} extractedContent - Extracted content
 * @returns {Object} Targeting key-value pairs
 */
export function formatTargetingKeys(enrichments, extractedContent) {
  const targeting = {};

  // Category
  if (enrichments.categories?.category) {
    targeting[TARGETING_KEYS.CATEGORY] = enrichments.categories.category;
  }
  if (enrichments.categories?.categoryName) {
    targeting[TARGETING_KEYS.SUBCATEGORY] = enrichments.categories.categoryName;
  }

  // Keywords (top 5)
  if (enrichments.keywords && enrichments.keywords.length > 0) {
    targeting[TARGETING_KEYS.KEYWORDS] = enrichments.keywords.slice(0, 5).join(',');
  }

  // Sentiment
  if (enrichments.sentiment?.sentiment) {
    targeting[TARGETING_KEYS.SENTIMENT] = enrichments.sentiment.sentiment;
  }

  // Brand safety
  const brandSafety = getBrandSafetyFromEnrichments(enrichments);
  targeting[TARGETING_KEYS.BRAND_SAFETY] = brandSafety.level;

  // Content type
  if (extractedContent.contentType) {
    targeting[TARGETING_KEYS.CONTENT_TYPE] = extractedContent.contentType;
  }

  // Language
  if (extractedContent.language) {
    targeting[TARGETING_KEYS.LANGUAGE] = extractedContent.language;
  }

  // Embedding ID for semantic targeting
  if (enrichments.embeddings?.id || enrichments.documentId) {
    targeting[TARGETING_KEYS.EMBEDDING_ID] = enrichments.embeddings?.id || enrichments.documentId;
  }

  return targeting;
}

/**
 * Enrich a full OpenRTB bid request
 * @param {Object} bidRequest - Original bid request
 * @param {Object} enrichments - Enrichment data
 * @param {Object} extractedContent - Extracted content
 * @param {Object} options - Options
 * @returns {Object} Enriched bid request
 */
export function enrichBidRequest(bidRequest, enrichments, extractedContent, options = {}) {
  const enriched = JSON.parse(JSON.stringify(bidRequest)); // Deep clone

  // Determine if site or app
  const isSite = !!enriched.site;
  const context = isSite ? 'site' : 'app';

  // Ensure context exists
  if (!enriched[context]) {
    enriched[context] = {};
  }

  // Format and merge site.content
  const siteContent = formatSiteContent(enrichments, extractedContent, options);

  if (!enriched[context].content) {
    enriched[context].content = {};
  }

  enriched[context].content = deepMerge(enriched[context].content, siteContent);

  // Enrich impressions
  if (enriched.imp && Array.isArray(enriched.imp)) {
    for (const imp of enriched.imp) {
      const impExt = formatImpExt(enrichments, extractedContent, imp.id);

      if (!imp.ext) {
        imp.ext = {};
      }

      imp.ext = deepMerge(imp.ext, impExt);
    }
  }

  // Add request-level extension
  if (!enriched.ext) {
    enriched.ext = {};
  }

  enriched.ext.mixpeek = {
    version: '1.0.0',
    enriched: true,
    timestamp: new Date().toISOString(),
    documentId: enrichments.documentId || null,
    source: enrichments.source || 'api'
  };

  return enriched;
}

/**
 * Format enrichments for OpenRTB 3.0 request
 * @param {Object} enrichments - Enrichment data
 * @param {Object} extractedContent - Extracted content
 * @returns {Object} OpenRTB 3.0 context object
 */
export function formatOrtb3Context(enrichments, extractedContent) {
  return {
    site: extractedContent.isApp ? undefined : {
      domain: extractedContent.domain || undefined,
      page: extractedContent.url || undefined,
      ref: extractedContent.ref || undefined,
      content: {
        cattax: 7, // IAB Tech Lab Content Taxonomy 3.0
        cat: keywordsToIAB(enrichments.keywords || []),
        keywords: (enrichments.keywords || []).join(','),
        title: extractedContent.title || undefined,
        lang: extractedContent.language || undefined,
        ext: {
          mixpeek: {
            sentiment: enrichments.sentiment?.sentiment || 'neutral',
            brandSafety: getBrandSafetyFromEnrichments(enrichments),
            documentId: enrichments.documentId || null
          }
        }
      },
      pub: extractedContent.publisher?.id ? {
        id: extractedContent.publisher.id,
        name: extractedContent.publisher.name
      } : undefined
    },
    app: extractedContent.isApp ? {
      bundle: extractedContent.app?.bundle || undefined,
      name: extractedContent.app?.name || undefined,
      domain: extractedContent.app?.domain || undefined,
      storeurl: extractedContent.app?.storeurl || undefined,
      content: {
        cattax: 7,
        cat: keywordsToIAB(enrichments.keywords || []),
        keywords: (enrichments.keywords || []).join(',')
      }
    } : undefined,
    regs: undefined, // Preserve from original
    restrictions: undefined
  };
}

/**
 * Get brand safety assessment from enrichments
 * @param {Object} enrichments - Enrichment data
 * @returns {Object} Brand safety data
 */
function getBrandSafetyFromEnrichments(enrichments) {
  // If brand safety was already calculated
  if (enrichments.brandSafety) {
    return enrichments.brandSafety;
  }

  // Infer from sentiment
  const sentiment = enrichments.sentiment?.sentiment || 'neutral';
  const sentimentScore = enrichments.sentiment?.score || 0;

  let level = BRAND_SAFETY_LEVELS.SAFE;
  let score = 1.0;

  if (sentiment === 'negative' && sentimentScore < -0.5) {
    level = BRAND_SAFETY_LEVELS.MEDIUM_RISK;
    score = 0.5;
  } else if (sentiment === 'negative') {
    level = BRAND_SAFETY_LEVELS.LOW_RISK;
    score = 0.7;
  }

  return { level, score };
}

/**
 * Create a minimal enrichment response
 * @param {Object} options - Options
 * @returns {Object} Minimal response
 */
export function createMinimalResponse(options = {}) {
  return {
    site: {
      content: {
        cat: [],
        keywords: '',
        ext: {
          mixpeek: {
            sentiment: 'neutral',
            brandSafety: { level: BRAND_SAFETY_LEVELS.SAFE, score: 1.0 },
            source: 'fallback',
            version: '1.0.0'
          }
        }
      }
    }
  };
}

export default {
  formatSiteContent,
  formatImpExt,
  formatTargetingKeys,
  enrichBidRequest,
  formatOrtb3Context,
  createMinimalResponse
};
