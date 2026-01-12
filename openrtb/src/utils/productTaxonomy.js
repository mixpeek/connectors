/**
 * Mixpeek OpenRTB Connector - Product Taxonomy Integration
 *
 * Integrates IAB Ad Product Taxonomy for product-level enrichment.
 * Works alongside IAB Content Taxonomy for comprehensive classification.
 */

/**
 * Format product taxonomy data for OpenRTB extension
 * @param {Object} productMapping - IAB Ad Product Taxonomy mapping result
 * @returns {Object} OpenRTB-formatted product taxonomy data
 */
export function formatProductTaxonomy(productMapping) {
  if (!productMapping || !productMapping.success) {
    return null;
  }

  const { iab_product } = productMapping;

  return {
    // Primary IAB Ad Product category (IAB-AP-XXXX format)
    prodcat: [iab_product.primary],

    // Product category taxonomy version (IAB Ad Product Taxonomy 2.0)
    prodcattax: 2,

    // Mixpeek product extension
    ext: {
      mixpeek_product: {
        primary: iab_product.primary,
        primaryId: iab_product.primaryId,
        label: iab_product.label,
        confidence: iab_product.confidence,

        // Tier 1 parent category
        tier1: iab_product.tier1 || null,
        tier1Id: iab_product.tier1Id || null,
        tier1Label: iab_product.tier1Label || null,

        // Secondary categories if available
        secondary: iab_product.secondary || [],

        // Taxonomy version
        version: iab_product.version || '2.0',

        // Explanation for deterministic mappings
        explanation: iab_product.explanation || null
      }
    }
  };
}

/**
 * Enrich bid request with product taxonomy
 * @param {Object} bidRequest - OpenRTB bid request
 * @param {Object} productMapping - IAB Ad Product Taxonomy mapping result
 * @returns {Object} Enriched bid request
 */
export function enrichWithProductTaxonomy(bidRequest, productMapping) {
  if (!productMapping || !productMapping.success) {
    return bidRequest;
  }

  const productData = formatProductTaxonomy(productMapping);
  if (!productData) {
    return bidRequest;
  }

  // Deep clone to avoid mutating original
  const enriched = JSON.parse(JSON.stringify(bidRequest));

  // Add to site.content if site request
  if (enriched.site) {
    enriched.site.content = enriched.site.content || {};
    enriched.site.content.prodcat = productData.prodcat;
    enriched.site.content.prodcattax = productData.prodcattax;
    enriched.site.content.ext = enriched.site.content.ext || {};
    enriched.site.content.ext.mixpeek_product = productData.ext.mixpeek_product;
  }

  // Add to app.content if app request
  if (enriched.app) {
    enriched.app.content = enriched.app.content || {};
    enriched.app.content.prodcat = productData.prodcat;
    enriched.app.content.prodcattax = productData.prodcattax;
    enriched.app.content.ext = enriched.app.content.ext || {};
    enriched.app.content.ext.mixpeek_product = productData.ext.mixpeek_product;
  }

  // Add to each impression
  if (enriched.imp && Array.isArray(enriched.imp)) {
    for (const imp of enriched.imp) {
      imp.ext = imp.ext || {};
      imp.ext.data = imp.ext.data || {};
      imp.ext.data.mixpeek_product = {
        prodcat: productData.prodcat[0],
        prodcatLabel: productMapping.iab_product.label,
        tier1: productMapping.iab_product.tier1Label || null,
        confidence: productMapping.iab_product.confidence
      };
    }
  }

  return enriched;
}

/**
 * Format product targeting keys for GAM/Prebid
 * @param {Object} productMapping - IAB Ad Product Taxonomy mapping result
 * @returns {Object} Targeting key-values
 */
export function formatProductTargetingKeys(productMapping) {
  if (!productMapping || !productMapping.success) {
    return {};
  }

  const { iab_product } = productMapping;

  return {
    // Primary product category
    mixpeek_prodcat: iab_product.primary,

    // Product category name
    mixpeek_prodcat_name: iab_product.label.split(' > ').pop(),

    // Tier 1 category for broad targeting
    mixpeek_prodcat_tier1: iab_product.tier1 || iab_product.primary,
    mixpeek_prodcat_tier1_name: iab_product.tier1Label || iab_product.label.split(' > ')[0],

    // Confidence level for bidding logic
    mixpeek_prodcat_conf: iab_product.confidence >= 0.9 ? 'high' :
                          iab_product.confidence >= 0.7 ? 'medium' : 'low'
  };
}

/**
 * Extract product info from bid request for classification
 * @param {Object} bidRequest - OpenRTB bid request
 * @returns {Object|null} Product info for classification
 */
export function extractProductInfo(bidRequest) {
  // Check site.content.ext for product data
  const siteProduct = bidRequest.site?.content?.ext?.product;
  if (siteProduct) {
    return {
      title: siteProduct.title,
      description: siteProduct.description,
      category: siteProduct.category,
      brand: siteProduct.brand
    };
  }

  // Check app.content.ext for product data
  const appProduct = bidRequest.app?.content?.ext?.product;
  if (appProduct) {
    return {
      title: appProduct.title,
      description: appProduct.description,
      category: appProduct.category,
      brand: appProduct.brand
    };
  }

  // Check imp[0].ext.product
  if (bidRequest.imp?.[0]?.ext?.product) {
    const impProduct = bidRequest.imp[0].ext.product;
    return {
      title: impProduct.title,
      description: impProduct.description,
      category: impProduct.category,
      brand: impProduct.brand
    };
  }

  // Try to extract from content metadata
  const content = bidRequest.site?.content || bidRequest.app?.content;
  if (content?.title) {
    return {
      title: content.title,
      description: content.keywords || '',
      category: content.cat?.[0] || ''
    };
  }

  return null;
}

export default {
  formatProductTaxonomy,
  enrichWithProductTaxonomy,
  formatProductTargetingKeys,
  extractProductInfo
};
