/**
 * Mixpeek Context Adapter - Helper Utilities
 * @module utils/helpers
 */

import { ERROR_CODES, PERFORMANCE } from '../config/constants.js'
import logger from './logger.js'

/**
 * Generate a unique identifier
 * @returns {string} UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Generate a hash from a string
 * @param {string} str - String to hash
 * @returns {string} Hash
 */
export function hashString(str) {
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Check if a value is a valid object
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep merge two objects
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export function deepMerge(target, source) {
  const output = Object.assign({}, target)
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

/**
 * Validate configuration
 * @param {object} config - Configuration object
 * @returns {object} Validation result
 */
export function validateConfig(config) {
  const errors = []

  if (!config.apiKey || typeof config.apiKey !== 'string') {
    errors.push('apiKey is required and must be a string')
  }

  if (!config.collectionId || typeof config.collectionId !== 'string') {
    errors.push('collectionId is required and must be a string')
  }

  if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 0)) {
    errors.push('timeout must be a positive number')
  }

  if (config.cacheTTL && (typeof config.cacheTTL !== 'number' || config.cacheTTL < 0)) {
    errors.push('cacheTTL must be a positive number')
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      code: ERROR_CODES.INVALID_CONFIG
    }
  }

  return { valid: true }
}

/**
 * Truncate text to max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = PERFORMANCE.MAX_CONTENT_SIZE) {
  if (!text || text.length <= maxLength) return text
  logger.warn(`Content truncated from ${text.length} to ${maxLength} characters`)
  return text.substring(0, maxLength)
}

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return ''
  }
}

/**
 * Sanitize text content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return ''
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\r\n\t]/g, ' ') // Remove newlines and tabs
    .trim()
}

/**
 * Check if running in browser environment
 * @returns {boolean}
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Parse JSON safely
 * @param {string} json - JSON string
 * @param {*} fallback - Fallback value
 * @returns {*} Parsed JSON or fallback
 */
export function safeJSONParse(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch (e) {
    logger.warn('Failed to parse JSON:', e)
    return fallback
  }
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxAttempts = 3, delay = 100) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        const backoffDelay = delay * Math.pow(2, attempt - 1)
        logger.warn(`Attempt ${attempt} failed, retrying in ${backoffDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
  }
  throw lastError
}

/**
 * Create a timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Timeout promise
 */
export function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms)
  })
}

/**
 * Race a promise against a timeout
 * @param {Promise} promise - Promise to race
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Result or timeout error
 */
export function withTimeout(promise, ms) {
  return Promise.race([promise, timeout(ms)])
}

/**
 * Format taxonomy path
 * @param {array} path - Taxonomy path array
 * @returns {string} Formatted path
 */
export function formatTaxonomyPath(path) {
  if (!Array.isArray(path) || path.length === 0) return ''
  return path.join('/')
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords
 * @returns {array} Array of keywords
 */
export function extractKeywords(text, maxKeywords = 10) {
  if (!text) return []
  
  // Simple keyword extraction (in production, use NLP libraries)
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Get unique words
  const uniqueWords = [...new Set(words)]
  
  // Return top N keywords
  return uniqueWords.slice(0, maxKeywords)
}

/**
 * Get current timestamp
 * @returns {number} Timestamp in seconds
 */
export function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

/**
 * Check if value is expired
 * @param {number} timestamp - Timestamp in seconds
 * @param {number} ttl - TTL in seconds
 * @returns {boolean} True if expired
 */
export function isExpired(timestamp, ttl) {
  return getTimestamp() - timestamp > ttl
}

