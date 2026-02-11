/**
 * @mixpeek/kafka — Mixpeek Kafka Connector
 *
 * Apache Kafka integration for Mixpeek — consume events, produce enrichment results, and transform messages
 *
 * @module @mixpeek/kafka
 * @version 1.0.0
 */

// Modules
export { createKafkaConsumer, KafkaConsumer } from './modules/kafkaConsumer.js';
export { createKafkaProducer, KafkaProducer } from './modules/kafkaProducer.js';
export { createMessageTransformer, MessageTransformer } from './modules/messageTransformer.js';

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
import { createKafkaConsumer } from './modules/kafkaConsumer.js';
export default createKafkaConsumer;
