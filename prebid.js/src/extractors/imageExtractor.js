/**
 * Mixpeek Context Adapter - Image Content Extractor
 * @module extractors/imageExtractor
 */

import { sanitizeText } from '../utils/helpers.js'
import logger from '../utils/logger.js'

/**
 * Extract primary images from the page
 * @param {number} maxImages - Maximum number of images to extract
 * @returns {array} Array of image objects
 */
export function extractImages(maxImages = 5) {
  logger.time('extractImages')

  try {
    const images = findPrimaryImages()
    const extracted = images.slice(0, maxImages).map(img => ({
      src: img.src,
      alt: sanitizeText(img.alt || ''),
      title: sanitizeText(img.title || ''),
      width: img.naturalWidth || img.width || 0,
      height: img.naturalHeight || img.height || 0,
      aspectRatio: calculateAspectRatio(img)
    }))

    logger.timeEnd('extractImages')
    logger.info(`Extracted ${extracted.length} images`)

    return extracted
  } catch (error) {
    logger.error('Error extracting images:', error)
    logger.timeEnd('extractImages')
    return []
  }
}

/**
 * Find primary/hero images on the page
 * @private
 * @returns {array} Array of image elements
 */
function findPrimaryImages() {
  const images = Array.from(document.querySelectorAll('img'))
  
  return images
    .filter(img => {
      // Filter out small images (likely icons/thumbnails)
      const width = img.naturalWidth || img.width || 0
      const height = img.naturalHeight || img.height || 0
      return width >= 200 && height >= 200
    })
    .filter(img => {
      // Filter out hidden images
      const style = window.getComputedStyle(img)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
    .filter(img => {
      // Filter out ad images
      const isAd = img.closest('.ad, .advertisement, [id*="ad-"], [class*="ad-"]')
      return !isAd
    })
    .sort((a, b) => {
      // Sort by size (largest first)
      const aSize = (a.naturalWidth || a.width || 0) * (a.naturalHeight || a.height || 0)
      const bSize = (b.naturalWidth || b.width || 0) * (b.naturalHeight || b.height || 0)
      return bSize - aSize
    })
}

/**
 * Calculate aspect ratio
 * @private
 * @param {HTMLImageElement} img - Image element
 * @returns {number} Aspect ratio
 */
function calculateAspectRatio(img) {
  const width = img.naturalWidth || img.width || 0
  const height = img.naturalHeight || img.height || 0
  return height > 0 ? width / height : 0
}

/**
 * Extract Open Graph image
 * @returns {object|null} OG image data
 */
export function extractOGImage() {
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage) {
    return {
      src: ogImage.content,
      alt: document.querySelector('meta[property="og:image:alt"]')?.content || '',
      width: parseInt(document.querySelector('meta[property="og:image:width"]')?.content || '0'),
      height: parseInt(document.querySelector('meta[property="og:image:height"]')?.content || '0')
    }
  }
  return null
}

/**
 * Extract featured/hero image
 * @returns {object|null} Featured image data
 */
export function extractFeaturedImage() {
  // Check for common featured image patterns
  const selectors = [
    '[class*="featured-image"]',
    '[class*="hero-image"]',
    '[class*="header-image"]',
    'article img:first-of-type',
    '.post-thumbnail img'
  ]

  for (const selector of selectors) {
    const img = document.querySelector(selector)
    if (img) {
      return {
        src: img.src,
        alt: sanitizeText(img.alt || ''),
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      }
    }
  }

  return null
}

/**
 * Check if page has significant image content
 * @returns {boolean}
 */
export function hasImages() {
  const images = document.querySelectorAll('img')
  return Array.from(images).some(img => {
    const width = img.naturalWidth || img.width || 0
    const height = img.naturalHeight || img.height || 0
    return width >= 200 && height >= 200
  })
}

