/**
 * @mixpeek/datadog — Configuration Constants
 */

// API Configuration
export const API_ENDPOINT = 'https://api.mixpeek.com';
export const API_VERSION = 'v1';
export const DEFAULT_TIMEOUT = 30000; // milliseconds
export const MAX_TIMEOUT = 60000;
export const RETRY_ATTEMPTS = 1;
export const RETRY_DELAY = 100; // milliseconds

// Cache Configuration
export const DEFAULT_CACHE_TTL = 300; // seconds (5 minutes)
export const MAX_CACHE_ITEMS = 1000;
export const CACHE_KEY_PREFIX = 'mixpeek_dd_';

// Error Codes
export const ERROR_CODES = {
  API_ERROR: 'MIXPEEK_API_ERROR',
  TIMEOUT: 'MIXPEEK_TIMEOUT',
  INVALID_CONFIG: 'MIXPEEK_INVALID_CONFIG',
  INVALID_REQUEST: 'MIXPEEK_INVALID_REQUEST',
  RATE_LIMITED: 'MIXPEEK_RATE_LIMITED',
  CACHE_ERROR: 'MIXPEEK_CACHE_ERROR'
};

// HTTP Headers
export const HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  USER_AGENT: 'Mixpeek-Datadog-Connector/1.0.0'
};

// Default Configuration
export const DEFAULT_CONFIG = {
  endpoint: API_ENDPOINT,
  timeout: DEFAULT_TIMEOUT,
  cacheTTL: DEFAULT_CACHE_TTL,
  enableCache: true,
  debug: false
};

export default {
  API_ENDPOINT, API_VERSION, DEFAULT_TIMEOUT, MAX_TIMEOUT,
  RETRY_ATTEMPTS, RETRY_DELAY, DEFAULT_CACHE_TTL, MAX_CACHE_ITEMS,
  CACHE_KEY_PREFIX, ERROR_CODES, HEADERS, DEFAULT_CONFIG
};
