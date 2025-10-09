/**
 * Mixpeek Context Adapter - Page Content Extractor
 * @module extractors/pageExtractor
 */

import { PERFORMANCE } from '../config/constants.js'
import { sanitizeText, truncateText, extractDomain } from '../utils/helpers.js'
import logger from '../utils/logger.js'

/**
 * Extract content from the current page
 * @returns {object} Extracted page content
 */
export function extractPageContent() {
  logger.time('extractPageContent')

  try {
    const content = {
      url: window.location.href,
      domain: extractDomain(window.location.href),
      title: document.title,
      description: extractMetaDescription(),
      text: extractBodyText(),
      keywords: extractMetaKeywords(),
      ogTags: extractOpenGraphTags(),
      structuredData: extractStructuredData(),
      language: document.documentElement.lang || 'en'
    }

    logger.timeEnd('extractPageContent')
    logger.info('Extracted page content:', {
      url: content.url,
      textLength: content.text.length,
      keywords: content.keywords.length
    })

    return content
  } catch (error) {
    logger.error('Error extracting page content:', error)
    logger.timeEnd('extractPageContent')
    return null
  }
}

/**
 * Extract meta description
 * @private
 * @returns {string} Meta description
 */
function extractMetaDescription() {
  const metaDesc = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]')
  return metaDesc ? sanitizeText(metaDesc.content) : ''
}

/**
 * Extract meta keywords
 * @private
 * @returns {array} Keywords array
 */
function extractMetaKeywords() {
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords) {
    return metaKeywords.content.split(',').map(k => k.trim()).filter(Boolean)
  }
  return []
}

/**
 * Extract body text content
 * @private
 * @returns {string} Body text
 */
function extractBodyText() {
  // Remove script, style, and other non-content elements
  const clone = document.body.cloneNode(true)
  const elementsToRemove = clone.querySelectorAll('script, style, iframe, nav, footer, aside, .ad, .advertisement')
  elementsToRemove.forEach(el => el.remove())

  // Get text content
  const text = clone.textContent || clone.innerText || ''
  
  // Sanitize and truncate
  return truncateText(sanitizeText(text), PERFORMANCE.MAX_CONTENT_SIZE)
}

/**
 * Extract Open Graph tags
 * @private
 * @returns {object} Open Graph data
 */
function extractOpenGraphTags() {
  const ogTags = {}
  const metaTags = document.querySelectorAll('meta[property^="og:"]')
  
  metaTags.forEach(tag => {
    const property = tag.getAttribute('property').replace('og:', '')
    ogTags[property] = tag.content
  })

  return ogTags
}

/**
 * Extract structured data (JSON-LD)
 * @private
 * @returns {array} Structured data objects
 */
function extractStructuredData() {
  const structuredData = []
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  
  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent)
      structuredData.push(data)
    } catch (e) {
      logger.warn('Failed to parse structured data:', e)
    }
  })

  return structuredData
}

/**
 * Extract article-specific content
 * @returns {object|null} Article content
 */
export function extractArticleContent() {
  try {
    const article = document.querySelector('article') || 
                   document.querySelector('[role="article"]') ||
                   document.querySelector('.article') ||
                   document.querySelector('.post')

    if (!article) return null

    return {
      headline: extractHeadline(article),
      author: extractAuthor(article),
      datePublished: extractPublishDate(article),
      content: sanitizeText(article.textContent || article.innerText || '')
    }
  } catch (error) {
    logger.warn('Error extracting article content:', error)
    return null
  }
}

/**
 * Extract headline
 * @private
 * @param {Element} article - Article element
 * @returns {string} Headline
 */
function extractHeadline(article) {
  const h1 = article.querySelector('h1')
  const headline = article.querySelector('[itemprop="headline"]')
  return sanitizeText((h1 || headline)?.textContent || '')
}

/**
 * Extract author
 * @private
 * @param {Element} article - Article element
 * @returns {string} Author
 */
function extractAuthor(article) {
  const author = article.querySelector('[itemprop="author"]') ||
                article.querySelector('[rel="author"]') ||
                article.querySelector('.author')
  return sanitizeText(author?.textContent || '')
}

/**
 * Extract publish date
 * @private
 * @param {Element} article - Article element
 * @returns {string} Publish date
 */
function extractPublishDate(article) {
  const dateEl = article.querySelector('[itemprop="datePublished"]') ||
                article.querySelector('time[datetime]')
  return dateEl?.getAttribute('datetime') || dateEl?.textContent || ''
}

/**
 * Check if current page is an article
 * @returns {boolean}
 */
export function isArticlePage() {
  return document.querySelector('article') !== null ||
         document.querySelector('[itemtype*="Article"]') !== null ||
         document.querySelector('meta[property="og:type"][content="article"]') !== null
}

