/**
 * Mixpeek OpenRTB Connector - Content Extractor
 *
 * Extracts and normalizes content from OpenRTB bid requests.
 */

import {
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS,
  MAX_IMAGES,
  MAX_VIDEOS,
  CONTENT_TYPES
} from '../config/constants.js';
import { sanitizeText, sanitizeTitle, sanitizeDescription, isValidUrl, extractDomain } from '../utils/helpers.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger();

/**
 * Extract content from an OpenRTB bid request
 * @param {Object} bidRequest - OpenRTB bid request
 * @returns {Object} Extracted content
 */
export function extractFromBidRequest(bidRequest) {
  if (!bidRequest) {
    return createEmptyContent();
  }

  const site = bidRequest.site || {};
  const app = bidRequest.app || {};
  const content = site.content || app.content || {};
  const publisher = site.publisher || app.publisher || {};

  // Determine if this is site or app context
  const isApp = !!bidRequest.app;

  return {
    // URL and domain
    url: sanitizeUrl(site.page || site.ref || ''),
    domain: site.domain || extractDomain(site.page) || '',
    ref: sanitizeUrl(site.ref || ''),

    // Basic content
    title: sanitizeTitle(content.title || site.name || app.name || ''),
    description: sanitizeDescription(content.context || content.keywords || ''),

    // Content metadata
    contentType: detectContentType(content, site),
    language: content.language || site.language || 'en',

    // Keywords from OpenRTB
    keywords: extractKeywordsFromRequest(site, content),

    // Categories from OpenRTB
    categories: extractCategories(site, content),

    // Content details
    content: {
      id: content.id || null,
      episode: content.episode || null,
      season: content.season || null,
      series: content.series || null,
      artist: content.artist || null,
      album: content.album || null,
      isrc: content.isrc || null,
      producer: content.producer ? {
        id: content.producer.id,
        name: content.producer.name
      } : null,
      livestream: content.livestream || 0,
      sourcerelationship: content.sourcerelationship || null,
      len: content.len || null,
      qagmediarating: content.qagmediarating || null,
      embeddable: content.embeddable || null,
      data: content.data || []
    },

    // Publisher info
    publisher: {
      id: publisher.id || null,
      name: publisher.name || null,
      domain: publisher.domain || null,
      cat: publisher.cat || []
    },

    // App-specific (if applicable)
    app: isApp ? {
      id: app.id,
      name: app.name,
      bundle: app.bundle,
      storeurl: app.storeurl,
      ver: app.ver
    } : null,

    // Media assets
    images: extractImages(bidRequest),
    videos: extractVideos(bidRequest),

    // Raw text for analysis (combine available text)
    text: buildTextContent(site, content, publisher),

    // Context flags
    isApp,
    hasContent: !!content.id || !!content.title,
    hasPublisher: !!publisher.id || !!publisher.name
  };
}

/**
 * Create empty content structure
 * @returns {Object} Empty content
 */
function createEmptyContent() {
  return {
    url: '',
    domain: '',
    ref: '',
    title: '',
    description: '',
    contentType: CONTENT_TYPES.OTHER,
    language: 'en',
    keywords: [],
    categories: [],
    content: {
      id: null,
      episode: null,
      season: null,
      series: null,
      artist: null,
      album: null,
      isrc: null,
      producer: null,
      livestream: 0,
      sourcerelationship: null,
      len: null,
      qagmediarating: null,
      embeddable: null,
      data: []
    },
    publisher: {
      id: null,
      name: null,
      domain: null,
      cat: []
    },
    app: null,
    images: [],
    videos: [],
    text: '',
    isApp: false,
    hasContent: false,
    hasPublisher: false
  };
}

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';

  // Remove any control characters
  url = url.replace(/[\x00-\x1F\x7F]/g, '');

  // Validate URL
  if (!isValidUrl(url)) return '';

  return url.substring(0, 2048); // Max URL length
}

/**
 * Detect content type from OpenRTB data
 * @param {Object} content - OpenRTB content object
 * @param {Object} site - OpenRTB site object
 * @returns {string} Content type
 */
function detectContentType(content, site) {
  // Check for video content
  if (content.videoquality || content.len) {
    return CONTENT_TYPES.VIDEO;
  }

  // Check for livestream
  if (content.livestream === 1) {
    return CONTENT_TYPES.VIDEO;
  }

  // Check URL patterns
  const url = site.page || '';
  if (url.includes('/video/') || url.includes('/watch/')) {
    return CONTENT_TYPES.VIDEO;
  }
  if (url.includes('/article/') || url.includes('/news/') || url.includes('/blog/')) {
    return CONTENT_TYPES.ARTICLE;
  }
  if (url.includes('/product/') || url.includes('/shop/') || url.includes('/item/')) {
    return CONTENT_TYPES.PRODUCT;
  }
  if (url.includes('/gallery/') || url.includes('/photos/')) {
    return CONTENT_TYPES.GALLERY;
  }
  if (url.includes('/category/') || url.includes('/tag/')) {
    return CONTENT_TYPES.CATEGORY;
  }
  if (url.includes('/search')) {
    return CONTENT_TYPES.SEARCH;
  }
  if (url === site.domain || url.endsWith('/')) {
    return CONTENT_TYPES.HOMEPAGE;
  }

  return CONTENT_TYPES.ARTICLE; // Default to article
}

/**
 * Extract keywords from bid request
 * @param {Object} site - OpenRTB site object
 * @param {Object} content - OpenRTB content object
 * @returns {string[]} Keywords
 */
function extractKeywordsFromRequest(site, content) {
  const keywords = new Set();

  // From site.keywords
  if (site.keywords) {
    const siteKeywords = site.keywords.split(',').map(k => k.trim().toLowerCase());
    siteKeywords.forEach(k => keywords.add(k));
  }

  // From content.keywords
  if (content.keywords) {
    const contentKeywords = content.keywords.split(',').map(k => k.trim().toLowerCase());
    contentKeywords.forEach(k => keywords.add(k));
  }

  // From content.data segments
  if (content.data && Array.isArray(content.data)) {
    for (const dataItem of content.data) {
      if (dataItem.segment && Array.isArray(dataItem.segment)) {
        for (const segment of dataItem.segment) {
          if (segment.value) {
            keywords.add(segment.value.toLowerCase());
          }
        }
      }
    }
  }

  return Array.from(keywords).slice(0, MAX_KEYWORDS);
}

/**
 * Extract categories from bid request
 * @param {Object} site - OpenRTB site object
 * @param {Object} content - OpenRTB content object
 * @returns {string[]} IAB categories
 */
function extractCategories(site, content) {
  const categories = new Set();

  // From site.cat
  if (site.cat && Array.isArray(site.cat)) {
    site.cat.forEach(c => categories.add(c));
  }

  // From site.sectioncat
  if (site.sectioncat && Array.isArray(site.sectioncat)) {
    site.sectioncat.forEach(c => categories.add(c));
  }

  // From site.pagecat
  if (site.pagecat && Array.isArray(site.pagecat)) {
    site.pagecat.forEach(c => categories.add(c));
  }

  // From content.cat
  if (content.cat && Array.isArray(content.cat)) {
    content.cat.forEach(c => categories.add(c));
  }

  return Array.from(categories);
}

/**
 * Extract images from bid request
 * @param {Object} bidRequest - OpenRTB bid request
 * @returns {Object[]} Image data
 */
function extractImages(bidRequest) {
  const images = [];

  // Check for native ad images
  if (bidRequest.imp && Array.isArray(bidRequest.imp)) {
    for (const imp of bidRequest.imp) {
      if (imp.native && imp.native.request) {
        try {
          const nativeRequest = typeof imp.native.request === 'string'
            ? JSON.parse(imp.native.request)
            : imp.native.request;

          if (nativeRequest.assets && Array.isArray(nativeRequest.assets)) {
            for (const asset of nativeRequest.assets) {
              if (asset.img && asset.img.url) {
                images.push({
                  url: asset.img.url,
                  width: asset.img.w || null,
                  height: asset.img.h || null,
                  type: asset.img.type || null
                });
              }
            }
          }
        } catch {
          logger.debug('Failed to parse native request for images');
        }
      }
    }
  }

  return images.slice(0, MAX_IMAGES);
}

/**
 * Extract videos from bid request
 * @param {Object} bidRequest - OpenRTB bid request
 * @returns {Object[]} Video data
 */
function extractVideos(bidRequest) {
  const videos = [];

  // Check for video impressions
  if (bidRequest.imp && Array.isArray(bidRequest.imp)) {
    for (const imp of bidRequest.imp) {
      if (imp.video) {
        videos.push({
          mimes: imp.video.mimes || [],
          minduration: imp.video.minduration || null,
          maxduration: imp.video.maxduration || null,
          protocols: imp.video.protocols || [],
          w: imp.video.w || null,
          h: imp.video.h || null,
          startdelay: imp.video.startdelay || null,
          linearity: imp.video.linearity || null,
          placement: imp.video.placement || null,
          plcmt: imp.video.plcmt || null,
          skip: imp.video.skip || null,
          pos: imp.video.pos || null,
          api: imp.video.api || []
        });
      }
    }
  }

  return videos.slice(0, MAX_VIDEOS);
}

/**
 * Build combined text content for analysis
 * @param {Object} site - OpenRTB site object
 * @param {Object} content - OpenRTB content object
 * @param {Object} publisher - OpenRTB publisher object
 * @returns {string} Combined text
 */
function buildTextContent(site, content, publisher) {
  const parts = [];

  // Add site name
  if (site.name) parts.push(site.name);

  // Add content title
  if (content.title) parts.push(content.title);

  // Add content series/episode info
  if (content.series) parts.push(content.series);
  if (content.artist) parts.push(content.artist);

  // Add keywords
  if (site.keywords) parts.push(site.keywords);
  if (content.keywords) parts.push(content.keywords);

  // Add publisher name
  if (publisher.name) parts.push(publisher.name);

  const combined = parts.join(' ');
  return sanitizeText(combined, MAX_TEXT_LENGTH);
}

/**
 * Extract content from app bid request
 * @param {Object} bidRequest - OpenRTB bid request with app context
 * @returns {Object} Extracted content
 */
export function extractFromAppRequest(bidRequest) {
  const baseContent = extractFromBidRequest(bidRequest);

  if (!bidRequest.app) {
    return baseContent;
  }

  const app = bidRequest.app;

  return {
    ...baseContent,
    isApp: true,
    app: {
      id: app.id || null,
      name: app.name || null,
      bundle: app.bundle || null,
      storeurl: app.storeurl || null,
      domain: app.domain || null,
      ver: app.ver || null,
      cat: app.cat || [],
      sectioncat: app.sectioncat || [],
      pagecat: app.pagecat || []
    },
    // App-specific categories
    categories: [
      ...(app.cat || []),
      ...(app.sectioncat || []),
      ...(app.pagecat || []),
      ...baseContent.categories
    ].filter((v, i, a) => a.indexOf(v) === i)
  };
}

/**
 * Validate extracted content
 * @param {Object} content - Extracted content
 * @returns {Object} Validation result
 */
export function validateContent(content) {
  const issues = [];

  if (!content.url && !content.domain && !content.isApp) {
    issues.push('No URL or domain provided');
  }

  if (!content.title && !content.text) {
    issues.push('No title or text content');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export default {
  extractFromBidRequest,
  extractFromAppRequest,
  validateContent
};
