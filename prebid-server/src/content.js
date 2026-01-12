/**
 * Content Extraction Utilities
 *
 * Extract content from OpenRTB bid requests
 */

/**
 * Extract content from OpenRTB bid request
 * @param {Object} bidRequest - OpenRTB bid request
 * @returns {Object|null} Extracted content or null
 */
export function extractContent(bidRequest) {
  if (!bidRequest) return null

  const content = {}

  // Extract from site object
  if (bidRequest.site) {
    if (bidRequest.site.page) {
      content.url = bidRequest.site.page
    }
    if (bidRequest.site.ref) {
      content.referrer = bidRequest.site.ref
    }
    if (bidRequest.site.domain) {
      content.domain = bidRequest.site.domain
    }

    // Extract from site.content if available
    if (bidRequest.site.content) {
      if (bidRequest.site.content.url) {
        content.url = bidRequest.site.content.url
      }
      if (bidRequest.site.content.title) {
        content.title = bidRequest.site.content.title
      }
      if (bidRequest.site.content.keywords) {
        content.keywords = bidRequest.site.content.keywords
      }
      if (bidRequest.site.content.language) {
        content.language = bidRequest.site.content.language
      }
    }
  }

  // Extract from app object (mobile apps)
  if (bidRequest.app) {
    if (bidRequest.app.name) {
      content.title = content.title || bidRequest.app.name
    }
    if (bidRequest.app.bundle) {
      content.url = content.url || `app://${bidRequest.app.bundle}`
    }
    if (bidRequest.app.domain) {
      content.domain = content.domain || bidRequest.app.domain
    }

    // Extract from app.content if available
    if (bidRequest.app.content) {
      if (bidRequest.app.content.title) {
        content.title = bidRequest.app.content.title
      }
      if (bidRequest.app.content.url) {
        content.url = bidRequest.app.content.url
      }
    }
  }

  // Extract description from various sources
  if (bidRequest.site?.content?.ext?.description) {
    content.description = bidRequest.site.content.ext.description
  }

  // Extract text from ext.data if available
  if (bidRequest.site?.content?.ext?.data?.text) {
    content.text = bidRequest.site.content.ext.data.text
  }

  // Return null if no meaningful content extracted
  if (!content.url && !content.title && !content.text && !content.description) {
    return null
  }

  return content
}

/**
 * Build content object for enrichment
 * @param {Object} options - Content options
 * @returns {Object} Content object
 */
export function buildContent(options = {}) {
  return {
    url: options.url || null,
    title: options.title || null,
    text: options.text || null,
    description: options.description || null,
    language: options.language || 'en'
  }
}
