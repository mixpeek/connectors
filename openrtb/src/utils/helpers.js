/**
 * Mixpeek OpenRTB Connector - Helper Utilities
 *
 * Common utility functions for the connector.
 */

import { MAX_TEXT_LENGTH, MAX_KEYWORDS, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../config/constants.js';

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a cache key from content
 * @param {Object} content - Content object
 * @returns {string} Cache key
 */
export function createCacheKey(content) {
  const normalized = {
    url: content.url || '',
    title: (content.title || '').substring(0, 100),
    text: (content.text || '').substring(0, 500)
  };

  // Simple hash function
  const str = JSON.stringify(normalized);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `mixpeek_${Math.abs(hash).toString(36)}`;
}

/**
 * Sanitize and truncate text content
 * @param {string} text - Raw text
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, maxLength = MAX_TEXT_LENGTH) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/<[^>]*>/g, ' ')           // Remove HTML tags
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Keep printable ASCII + extended
    .trim()
    .substring(0, maxLength);
}

/**
 * Sanitize title
 * @param {string} title - Raw title
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title) {
  return sanitizeText(title, MAX_TITLE_LENGTH);
}

/**
 * Sanitize description
 * @param {string} description - Raw description
 * @returns {string} Sanitized description
 */
export function sanitizeDescription(description) {
  return sanitizeText(description, MAX_DESCRIPTION_LENGTH);
}

/**
 * Extract keywords from text
 * @param {string} text - Text content
 * @param {number} maxKeywords - Maximum keywords to return
 * @returns {string[]} Array of keywords
 */
export function extractKeywords(text, maxKeywords = MAX_KEYWORDS) {
  if (!text || typeof text !== 'string') return [];

  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where',
    'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'any', 'also', 'get', 'got',
    'over', 'out', 'up', 'down', 'off', 'away', 'back'
  ]);

  // Tokenize and filter
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word =>
      word.length >= 3 &&
      word.length <= 30 &&
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Filter pure numbers
    );

  // Count word frequency
  const frequency = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Analyze sentiment from text
 * @param {string} text - Text content
 * @returns {Object} Sentiment analysis result
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0 };
  }

  const lowerText = text.toLowerCase();

  // Simple word-based sentiment analysis
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'best', 'love', 'happy', 'beautiful', 'perfect', 'awesome', 'brilliant',
    'success', 'successful', 'positive', 'outstanding', 'remarkable', 'superb'
  ];

  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad',
    'ugly', 'poor', 'fail', 'failure', 'negative', 'disappointing',
    'disaster', 'crisis', 'problem', 'issue', 'wrong', 'mistake', 'error'
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) positiveCount += matches.length;
  }

  for (const word of negativeWords) {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) negativeCount += matches.length;
  }

  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { sentiment: 'neutral', score: 0 };
  }

  const score = (positiveCount - negativeCount) / total;

  let sentiment;
  if (score > 0.2) {
    sentiment = 'positive';
  } else if (score < -0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return { sentiment, score: Math.round(score * 100) / 100 };
}

/**
 * Infer content category from keywords
 * @param {string[]} keywords - Extracted keywords
 * @returns {Object} Category inference result
 */
export function inferCategory(keywords) {
  if (!keywords || keywords.length === 0) {
    return { category: null, subcategory: null, confidence: 0 };
  }

  // Category keyword mappings (IAB Content Taxonomy 3.0 based)
  const categoryMappings = {
    'IAB1': { // Arts & Entertainment
      keywords: ['movie', 'film', 'music', 'art', 'entertainment', 'celebrity', 'theater', 'concert', 'show', 'television', 'tv'],
      name: 'Arts & Entertainment'
    },
    'IAB2': { // Automotive
      keywords: ['car', 'vehicle', 'auto', 'automotive', 'truck', 'suv', 'motorcycle', 'electric', 'hybrid', 'driving'],
      name: 'Automotive'
    },
    'IAB3': { // Business
      keywords: ['business', 'company', 'corporate', 'industry', 'market', 'stock', 'investment', 'finance', 'economy', 'trade'],
      name: 'Business'
    },
    'IAB4': { // Careers
      keywords: ['job', 'career', 'employment', 'hiring', 'resume', 'interview', 'salary', 'work', 'profession', 'occupation'],
      name: 'Careers'
    },
    'IAB5': { // Education
      keywords: ['education', 'school', 'university', 'college', 'learning', 'student', 'teacher', 'course', 'degree', 'study'],
      name: 'Education'
    },
    'IAB6': { // Family & Parenting
      keywords: ['family', 'parent', 'child', 'baby', 'kids', 'mother', 'father', 'parenting', 'pregnancy', 'toddler'],
      name: 'Family & Parenting'
    },
    'IAB7': { // Health & Fitness
      keywords: ['health', 'fitness', 'medical', 'doctor', 'exercise', 'diet', 'nutrition', 'wellness', 'hospital', 'disease'],
      name: 'Health & Fitness'
    },
    'IAB8': { // Food & Drink
      keywords: ['food', 'recipe', 'cooking', 'restaurant', 'drink', 'wine', 'beer', 'cuisine', 'chef', 'meal'],
      name: 'Food & Drink'
    },
    'IAB9': { // Hobbies & Interests
      keywords: ['hobby', 'craft', 'collecting', 'diy', 'garden', 'photography', 'games', 'puzzle', 'reading', 'writing'],
      name: 'Hobbies & Interests'
    },
    'IAB10': { // Home & Garden
      keywords: ['home', 'house', 'garden', 'interior', 'furniture', 'decor', 'renovation', 'apartment', 'real estate', 'property'],
      name: 'Home & Garden'
    },
    'IAB12': { // News
      keywords: ['news', 'breaking', 'headline', 'report', 'journalist', 'media', 'press', 'politics', 'election', 'government'],
      name: 'News'
    },
    'IAB13': { // Personal Finance
      keywords: ['money', 'bank', 'loan', 'credit', 'mortgage', 'savings', 'insurance', 'tax', 'budget', 'debt'],
      name: 'Personal Finance'
    },
    'IAB17': { // Sports
      keywords: ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'golf', 'athlete', 'team', 'game'],
      name: 'Sports'
    },
    'IAB19': { // Technology & Computing
      keywords: ['technology', 'computer', 'software', 'hardware', 'internet', 'app', 'digital', 'ai', 'data', 'programming'],
      name: 'Technology & Computing'
    },
    'IAB20': { // Travel
      keywords: ['travel', 'vacation', 'hotel', 'flight', 'tourism', 'destination', 'trip', 'holiday', 'beach', 'adventure'],
      name: 'Travel'
    }
  };

  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
  let bestMatch = null;
  let maxScore = 0;

  for (const [categoryId, { keywords: categoryKeywords, name }] of Object.entries(categoryMappings)) {
    let score = 0;
    for (const keyword of categoryKeywords) {
      if (keywordSet.has(keyword)) {
        score++;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = { id: categoryId, name };
    }
  }

  if (!bestMatch || maxScore === 0) {
    return { category: null, subcategory: null, confidence: 0 };
  }

  const confidence = Math.min(maxScore / 3, 1); // Cap at 1.0

  return {
    category: bestMatch.id,
    categoryName: bestMatch.name,
    subcategory: null, // Could be extended for subcategory detection
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * Assess brand safety from content
 * @param {string} text - Text content
 * @param {string[]} keywords - Extracted keywords
 * @returns {Object} Brand safety assessment
 */
export function assessBrandSafety(text, keywords = []) {
  const lowerText = (text || '').toLowerCase();
  const keywordSet = new Set((keywords || []).map(k => k.toLowerCase()));

  // High-risk keywords indicating unsafe content
  const highRiskKeywords = [
    'violence', 'violent', 'death', 'kill', 'murder', 'attack', 'terrorist',
    'drug', 'drugs', 'cocaine', 'heroin', 'overdose',
    'adult', 'explicit', 'porn', 'xxx', 'nude',
    'hate', 'racist', 'discrimination', 'extremist'
  ];

  // Medium-risk keywords
  const mediumRiskKeywords = [
    'crime', 'criminal', 'arrest', 'prison', 'lawsuit',
    'scandal', 'controversy', 'controversial', 'protest',
    'war', 'conflict', 'disaster', 'tragedy', 'crisis',
    'alcohol', 'beer', 'wine', 'gambling', 'casino'
  ];

  let highRiskCount = 0;
  let mediumRiskCount = 0;

  for (const word of highRiskKeywords) {
    if (lowerText.includes(word) || keywordSet.has(word)) {
      highRiskCount++;
    }
  }

  for (const word of mediumRiskKeywords) {
    if (lowerText.includes(word) || keywordSet.has(word)) {
      mediumRiskCount++;
    }
  }

  let level;
  let score;

  if (highRiskCount >= 3) {
    level = 'blocked';
    score = 0;
  } else if (highRiskCount >= 1) {
    level = 'high_risk';
    score = 0.2;
  } else if (mediumRiskCount >= 3) {
    level = 'medium_risk';
    score = 0.5;
  } else if (mediumRiskCount >= 1) {
    level = 'low_risk';
    score = 0.7;
  } else {
    level = 'safe';
    score = 1.0;
  }

  return {
    level,
    score,
    flags: {
      highRisk: highRiskCount,
      mediumRisk: mediumRiskCount
    }
  };
}

/**
 * Detect language from text
 * @param {string} text - Text content
 * @returns {string} ISO 639-1 language code
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string' || text.length < 20) {
    return 'en'; // Default to English
  }

  const lowerText = text.toLowerCase();

  // Simple language detection based on common words
  const languageIndicators = {
    'es': ['el', 'la', 'de', 'que', 'en', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'es', 'una'],
    'fr': ['le', 'la', 'de', 'et', 'en', 'un', 'une', 'du', 'est', 'que', 'les', 'des', 'ce', 'dans', 'pour'],
    'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im'],
    'pt': ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'uma', 'os', 'no', 'se'],
    'it': ['di', 'che', 'e', 'la', 'il', 'un', 'a', 'per', 'in', 'una', 'sono', 'non', 'si', 'da', 'del'],
    'nl': ['de', 'het', 'een', 'van', 'en', 'in', 'is', 'dat', 'op', 'te', 'voor', 'met', 'zijn', 'aan', 'wordt'],
    'en': ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with']
  };

  const words = lowerText.split(/\s+/);
  const wordSet = new Set(words);

  let bestLang = 'en';
  let maxScore = 0;

  for (const [lang, indicators] of Object.entries(languageIndicators)) {
    let score = 0;
    for (const word of indicators) {
      if (wordSet.has(word)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  return bestLang;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = { ...source[key] };
      }
    } else if (Array.isArray(source[key])) {
      result[key] = [...source[key]];
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string|null} Domain
 */
export function extractDomain(url) {
  if (!isValidUrl(url)) return null;

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

export default {
  generateId,
  createCacheKey,
  sanitizeText,
  sanitizeTitle,
  sanitizeDescription,
  extractKeywords,
  analyzeSentiment,
  inferCategory,
  assessBrandSafety,
  detectLanguage,
  deepMerge,
  isValidUrl,
  extractDomain
};
