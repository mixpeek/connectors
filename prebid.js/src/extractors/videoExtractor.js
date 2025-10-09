/**
 * Mixpeek Context Adapter - Video Content Extractor
 * @module extractors/videoExtractor
 */

import { sanitizeText } from '../utils/helpers.js'
import logger from '../utils/logger.js'

/**
 * Extract video content from the page
 * @param {string} selector - CSS selector for video element
 * @returns {object|null} Extracted video content
 */
export function extractVideoContent(selector = 'video') {
  logger.time('extractVideoContent')

  try {
    const videos = findVideoElements(selector)
    
    if (videos.length === 0) {
      logger.info('No video elements found')
      logger.timeEnd('extractVideoContent')
      return null
    }

    // Use the first (typically largest/main) video
    const video = videos[0]
    const content = {
      src: getVideoSource(video),
      poster: video.poster || '',
      title: extractVideoTitle(video),
      description: extractVideoDescription(video),
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      dimensions: {
        width: video.videoWidth || video.width || 0,
        height: video.videoHeight || video.height || 0
      },
      metadata: extractVideoMetadata(video)
    }

    logger.timeEnd('extractVideoContent')
    logger.info('Extracted video content:', {
      src: content.src,
      title: content.title,
      duration: content.duration
    })

    return content
  } catch (error) {
    logger.error('Error extracting video content:', error)
    logger.timeEnd('extractVideoContent')
    return null
  }
}

/**
 * Find video elements on the page
 * @private
 * @param {string} selector - CSS selector
 * @returns {array} Array of video elements
 */
function findVideoElements(selector) {
  const videos = Array.from(document.querySelectorAll(selector))
  
  // Sort by size (largest first)
  return videos.sort((a, b) => {
    const aSize = (a.videoWidth || a.width || 0) * (a.videoHeight || a.height || 0)
    const bSize = (b.videoWidth || b.width || 0) * (b.videoHeight || b.height || 0)
    return bSize - aSize
  })
}

/**
 * Get video source URL
 * @private
 * @param {HTMLVideoElement} video - Video element
 * @returns {string} Video source URL
 */
function getVideoSource(video) {
  // Check src attribute
  if (video.src) return video.src

  // Check source elements
  const source = video.querySelector('source')
  if (source && source.src) return source.src

  // Check currentSrc
  if (video.currentSrc) return video.currentSrc

  return ''
}

/**
 * Extract video title
 * @private
 * @param {HTMLVideoElement} video - Video element
 * @returns {string} Video title
 */
function extractVideoTitle(video) {
  // Check data attributes
  const title = video.getAttribute('data-title') ||
                video.getAttribute('title') ||
                video.getAttribute('aria-label')
  
  if (title) return sanitizeText(title)

  // Check parent container
  const container = video.closest('[data-video-title]')
  if (container) {
    return sanitizeText(container.getAttribute('data-video-title'))
  }

  // Check nearby heading
  const heading = video.previousElementSibling?.querySelector('h1, h2, h3') ||
                 video.parentElement?.querySelector('h1, h2, h3')
  if (heading) {
    return sanitizeText(heading.textContent)
  }

  return ''
}

/**
 * Extract video description
 * @private
 * @param {HTMLVideoElement} video - Video element
 * @returns {string} Video description
 */
function extractVideoDescription(video) {
  const desc = video.getAttribute('data-description') ||
              video.getAttribute('aria-description')
  
  if (desc) return sanitizeText(desc)

  // Check parent container
  const container = video.closest('[data-video-description]')
  if (container) {
    return sanitizeText(container.getAttribute('data-video-description'))
  }

  return ''
}

/**
 * Extract video metadata
 * @private
 * @param {HTMLVideoElement} video - Video element
 * @returns {object} Video metadata
 */
function extractVideoMetadata(video) {
  const metadata = {}
  
  // Extract all data attributes
  Array.from(video.attributes).forEach(attr => {
    if (attr.name.startsWith('data-')) {
      const key = attr.name.replace('data-', '').replace(/-/g, '_')
      metadata[key] = attr.value
    }
  })

  return metadata
}

/**
 * Capture video frame as base64 image
 * @param {HTMLVideoElement} video - Video element
 * @param {number} quality - JPEG quality (0-1)
 * @returns {string|null} Base64 encoded image
 */
export function captureVideoFrame(video, quality = 0.8) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || video.width || 640
    canvas.height = video.videoHeight || video.height || 360
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', quality)
  } catch (error) {
    logger.warn('Error capturing video frame:', error)
    return null
  }
}

/**
 * Extract video player information (YouTube, Vimeo, etc.)
 * @returns {object|null} Video player info
 */
export function extractVideoPlayerInfo() {
  // YouTube
  const ytPlayer = document.querySelector('iframe[src*="youtube.com"]')
  if (ytPlayer) {
    const src = ytPlayer.src
    const videoIdMatch = src.match(/embed\/([^?]+)/)
    return {
      platform: 'youtube',
      videoId: videoIdMatch ? videoIdMatch[1] : '',
      src
    }
  }

  // Vimeo
  const vimeoPlayer = document.querySelector('iframe[src*="vimeo.com"]')
  if (vimeoPlayer) {
    const src = vimeoPlayer.src
    const videoIdMatch = src.match(/video\/(\d+)/)
    return {
      platform: 'vimeo',
      videoId: videoIdMatch ? videoIdMatch[1] : '',
      src
    }
  }

  return null
}

/**
 * Check if page has video content
 * @returns {boolean}
 */
export function hasVideo() {
  return document.querySelector('video') !== null ||
         document.querySelector('iframe[src*="youtube.com"]') !== null ||
         document.querySelector('iframe[src*="vimeo.com"]') !== null
}

