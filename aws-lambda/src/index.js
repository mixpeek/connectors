/**
 * @mixpeek/aws-lambda — Mixpeek Aws Lambda Connector
 *
 * AWS Lambda integration for Mixpeek — handler wrappers, event routing, and response formatting for serverless enrichment
 *
 * @module @mixpeek/aws-lambda
 * @version 1.0.0
 */

// Modules
export { createLambdaHandler, LambdaHandler } from './modules/lambdaHandler.js';
export { createEventRouter, EventRouter } from './modules/eventRouter.js';
export { createResponseFormatter, ResponseFormatter } from './modules/responseFormatter.js';

// API client
export { createClient, MixpeekClient } from './api/mixpeekClient.js';

// Cache manager
export { createCacheManager, CacheManager } from './cache/cacheManager.js';

// Utilities
export {
  generateId,
  createCacheKey,
  sanitizeText,
  deepMerge,
  isValidUrl,
  extractDomain
} from './utils/helpers.js';

// Logger
export { getLogger, createLogger, Logger, LOG_LEVELS } from './utils/logger.js';

// Constants
export {
  API_ENDPOINT,
  API_VERSION,
  DEFAULT_TIMEOUT,
  DEFAULT_CACHE_TTL,
  ERROR_CODES,
  DEFAULT_CONFIG
} from './config/constants.js';

// Default export
import { createLambdaHandler } from './modules/lambdaHandler.js';
export default createLambdaHandler;
