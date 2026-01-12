/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Helper Utilities
 *
 * Common utility functions for text processing and validation.
 */

import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../config/constants.js';

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a cache key from input
 * @param {Object} input - Input object
 * @returns {string} Cache key
 */
export function createCacheKey(input) {
  const normalized = JSON.stringify({
    title: (input.title || '').toLowerCase().trim().slice(0, 100),
    description: (input.description || '').toLowerCase().trim().slice(0, 200),
    category: (input.category || '').toLowerCase().trim()
  });
  return hashString(normalized);
}

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {string} Hash
 */
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @param {number} [maxLength] - Maximum length
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, maxLength = MAX_DESCRIPTION_LENGTH) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x1F\x7F]/g, ' ') // Replace control characters with space
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize title
 * @param {string} title - Title to sanitize
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title) {
  return sanitizeText(title, MAX_TITLE_LENGTH);
}

/**
 * Sanitize description
 * @param {string} description - Description to sanitize
 * @returns {string} Sanitized description
 */
export function sanitizeDescription(description) {
  return sanitizeText(description, MAX_DESCRIPTION_LENGTH);
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} [maxKeywords=20] - Maximum number of keywords
 * @returns {string[]} Keywords
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];

  // Common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
    'their', 'we', 'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his',
    'hers', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'new'
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count frequencies
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  // Sort by frequency and return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Validate configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export function validateConfig(config) {
  const errors = [];

  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }

  // API key is required for semantic mode
  if (config.enableSemantic && !config.apiKey) {
    errors.push('API key is required for semantic mapping');
  }

  // Validate timeout
  if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 0)) {
    errors.push('Timeout must be a positive number');
  }

  // Validate cache TTL
  if (config.cacheTTL && (typeof config.cacheTTL !== 'number' || config.cacheTTL < 0)) {
    errors.push('Cache TTL must be a positive number');
  }

  // Validate min confidence
  if (config.minConfidence && (config.minConfidence < 0 || config.minConfidence > 1)) {
    errors.push('Minimum confidence must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate product input
 * @param {Object} input - Product input to validate
 * @returns {Object} Validation result
 */
export function validateInput(input) {
  const errors = [];

  if (!input) {
    errors.push('Input is required');
    return { valid: false, errors };
  }

  // At least title or description is required
  if (!input.title && !input.description) {
    errors.push('At least title or description is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Normalize product text for matching
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default {
  generateId,
  createCacheKey,
  hashString,
  sanitizeText,
  sanitizeTitle,
  sanitizeDescription,
  extractKeywords,
  validateConfig,
  validateInput,
  deepMerge,
  normalizeText
};
