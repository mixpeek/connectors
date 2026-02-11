#!/usr/bin/env node

/**
 * Connector Generator
 *
 * Generates all boilerplate files for Mixpeek connectors from definitions.
 * Usage: node scripts/generate-connector.js [connectorName]
 *   - No args: generates all connectors
 *   - With name: generates only that connector
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectors } from './connector-definitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function writeFile(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content);
}

function pascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function camelCase(str) {
  const p = pascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function titleCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Templates ──────────────────────────────────────────────────

function genPackageJson(c) {
  const peerDeps = Object.keys(c.peerDependencies).length > 0 ? c.peerDependencies : undefined;
  const pkg = {
    name: c.package,
    version: '1.0.0',
    description: c.description,
    type: 'module',
    main: 'dist/index.js',
    module: 'src/index.js',
    types: 'dist/index.d.ts',
    exports: {
      '.': {
        import: './src/index.js',
        require: './dist/index.cjs'
      }
    },
    files: ['dist', 'src', 'README.md', 'CHANGELOG.md'],
    scripts: {
      build: 'node scripts/build.js',
      test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.js',
      'test:unit': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.js --testPathPattern=tests/unit',
      'test:e2e': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.e2e.js --testPathPattern=tests/e2e',
      'test:live': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.live.js --testPathPattern=tests/live-api',
      'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.js --watch',
      'test:coverage': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.js --coverage',
      lint: 'eslint src tests',
      'lint:fix': 'eslint src tests --fix',
      prepublishOnly: 'npm run build && npm test'
    },
    keywords: [...c.keywords, 'mixpeek', 'multimodal', 'enrichment', 'connector'],
    author: 'Mixpeek <info@mixpeek.com>',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/mixpeek/connectors.git',
      directory: c.name
    },
    bugs: { url: 'https://github.com/mixpeek/connectors/issues' },
    homepage: `https://github.com/mixpeek/connectors/tree/main/${c.name}#readme`,
    engines: { node: '>=14.0.0' },
    devDependencies: {
      jest: '^29.7.0',
      eslint: '^8.57.0'
    },
    ...(peerDeps ? { peerDependencies: peerDeps } : {}),
    dependencies: {}
  };

  return JSON.stringify(pkg, null, 2) + '\n';
}

function genIndex(c) {
  const moduleExports = c.modules.map(m => {
    const factoryName = `create${m.className}`;
    return `export { ${factoryName}, ${m.className} } from './modules/${m.name}.js';`;
  }).join('\n');

  const defaultFactory = `create${c.modules[0].className}`;

  return `/**
 * ${c.package} — Mixpeek ${titleCase(c.name)} Connector
 *
 * ${c.description}
 *
 * @module ${c.package}
 * @version 1.0.0
 */

// Modules
${moduleExports}

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
import { ${defaultFactory} } from './modules/${c.modules[0].name}.js';
export default ${defaultFactory};
`;
}

function genConstants(c) {
  return `/**
 * ${c.package} — Configuration Constants
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
export const CACHE_KEY_PREFIX = '${c.cacheKeyPrefix}';

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
  USER_AGENT: '${c.userAgent}'
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
`;
}

function genMixpeekClient(c) {
  return `/**
 * ${c.package} — Mixpeek API Client
 *
 * HTTP client for Mixpeek API integration with retry logic and timeout handling.
 */

import {
  API_ENDPOINT, API_VERSION, DEFAULT_TIMEOUT,
  RETRY_ATTEMPTS, RETRY_DELAY, ERROR_CODES, HEADERS
} from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class MixpeekClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in ms
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    if (!config.apiKey) throw new Error('API key is required');

    this.apiKey = config.apiKey;
    this.endpoint = (config.endpoint || API_ENDPOINT).replace(/\\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.logger = getLogger({ debug: config.debug });
  }

  async request(method, path, body = null) {
    const url = \`\${this.endpoint}/\${API_VERSION}\${path}\`;
    const headers = {
      'Authorization': \`Bearer \${this.apiKey}\`,
      'Content-Type': HEADERS.CONTENT_TYPE,
      'Accept': HEADERS.ACCEPT,
      'User-Agent': HEADERS.USER_AGENT
    };

    let lastError;
    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        this.logger.debug(\`API \${method} \${path} (attempt \${attempt + 1})\`);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(\`HTTP \${response.status}: \${errorBody}\`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          lastError = new Error(\`Request timeout after \${this.timeout}ms\`);
          lastError.code = ERROR_CODES.TIMEOUT;
        }
        if (attempt < RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
        }
      }
    }

    this.logger.error('API request failed after retries:', lastError.message);
    throw lastError;
  }

  async healthCheck() {
    try {
      const start = Date.now();
      const response = await this.request('GET', '/health');
      return { status: 'healthy', latency: Date.now() - start, timestamp: new Date().toISOString(), response };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async search(query, options = {}) {
    return this.request('POST', '/features/search', { query, ...options });
  }

  async getDocument(collectionId, documentId) {
    return this.request('GET', \`/collections/\${collectionId}/documents/\${documentId}\`);
  }

  async createDocument(collectionId, payload) {
    return this.request('POST', \`/collections/\${collectionId}/documents\`, payload);
  }

  async listDocuments(collectionId, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request('GET', \`/collections/\${collectionId}/documents\${params ? '?' + params : ''}\`);
  }
}

export function createClient(config) {
  return new MixpeekClient(config);
}

export { MixpeekClient };
export default { createClient, MixpeekClient };
`;
}

function genCacheManager(c) {
  return `/**
 * ${c.package} — Cache Manager
 *
 * In-memory LRU caching with TTL support.
 */

import { DEFAULT_CACHE_TTL, MAX_CACHE_ITEMS, CACHE_KEY_PREFIX } from '../config/constants.js';
import { getLogger } from '../utils/logger.js';

class CacheManager {
  constructor(options = {}) {
    this.ttl = (options.ttl || DEFAULT_CACHE_TTL) * 1000;
    this.maxItems = options.maxItems || MAX_CACHE_ITEMS;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };
    this.logger = getLogger({ debug: options.debug });
    this.cleanupInterval = setInterval(() => this.prune(), 60000);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  _prefixKey(key) { return \`\${CACHE_KEY_PREFIX}\${key}\`; }

  get(key) {
    const item = this.cache.get(this._prefixKey(key));
    if (!item) { this.stats.misses++; return null; }
    if (Date.now() > item.expiry) { this.cache.delete(this._prefixKey(key)); this.stats.misses++; return null; }
    this.stats.hits++;
    item.lastAccess = Date.now();
    return item.data;
  }

  set(key, data, ttl = null) {
    if (this.cache.size >= this.maxItems) this._evictLRU();
    this.cache.set(this._prefixKey(key), {
      data, expiry: Date.now() + (ttl ? ttl * 1000 : this.ttl),
      createdAt: Date.now(), lastAccess: Date.now()
    });
    this.stats.sets++;
  }

  has(key) {
    const item = this.cache.get(this._prefixKey(key));
    if (!item) return false;
    if (Date.now() > item.expiry) { this.cache.delete(this._prefixKey(key)); return false; }
    return true;
  }

  delete(key) { return this.cache.delete(this._prefixKey(key)); }
  clear() { this.cache.clear(); }

  prune() {
    const now = Date.now();
    let pruned = 0;
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) { this.cache.delete(key); pruned++; }
    }
    return pruned;
  }

  _evictLRU() {
    let oldestKey = null, oldestAccess = Infinity;
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestAccess) { oldestAccess = item.lastAccess; oldestKey = key; }
    }
    if (oldestKey) { this.cache.delete(oldestKey); this.stats.evictions++; }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size, maxSize: this.maxItems,
      hits: this.stats.hits, misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 10000) / 100 : 0,
      sets: this.stats.sets, evictions: this.stats.evictions, ttlSeconds: this.ttl / 1000
    };
  }

  resetStats() { this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 }; }

  destroy() {
    if (this.cleanupInterval) { clearInterval(this.cleanupInterval); this.cleanupInterval = null; }
    this.cache.clear();
  }

  get size() { return this.cache.size; }
}

export function createCacheManager(options = {}) { return new CacheManager(options); }
export { CacheManager };
export default { createCacheManager, CacheManager };
`;
}

function genLogger(c) {
  return `/**
 * ${c.package} — Logger Utility
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 };

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '${c.loggerPrefix}';
    this.level = options.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    this.enabled = options.enabled !== false;
    this.timers = new Map();
  }

  setLevel(level) {
    this.level = typeof level === 'string' ? (LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO) : level;
  }
  setEnabled(enabled) { this.enabled = enabled; }

  _log(level, levelName, ...args) {
    if (!this.enabled || level < this.level) return;
    const ts = new Date().toISOString();
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a);
    const msg = \`\${ts} \${this.prefix} [\${levelName}]\`;
    if (level === LOG_LEVELS.ERROR) console.error(msg, ...formatted);
    else if (level === LOG_LEVELS.WARN) console.warn(msg, ...formatted);
    else if (level === LOG_LEVELS.DEBUG) console.debug(msg, ...formatted);
    else console.log(msg, ...formatted);
  }

  debug(...args) { this._log(LOG_LEVELS.DEBUG, 'DEBUG', ...args); }
  info(...args) { this._log(LOG_LEVELS.INFO, 'INFO', ...args); }
  warn(...args) { this._log(LOG_LEVELS.WARN, 'WARN', ...args); }
  error(...args) { this._log(LOG_LEVELS.ERROR, 'ERROR', ...args); }

  time(label) { this.timers.set(label, performance.now ? performance.now() : Date.now()); }
  timeEnd(label) {
    const start = this.timers.get(label);
    if (!start) return 0;
    const elapsed = (performance.now ? performance.now() : Date.now()) - start;
    this.timers.delete(label);
    this.debug(\`\${label}: \${elapsed.toFixed(2)}ms\`);
    return elapsed;
  }

  child(subPrefix) {
    return new Logger({ prefix: \`\${this.prefix}[\${subPrefix}]\`, debug: this.level === LOG_LEVELS.DEBUG, enabled: this.enabled });
  }
}

let defaultLogger = null;
export function getLogger(options = {}) {
  if (!defaultLogger) { defaultLogger = new Logger(options); }
  else if (Object.keys(options).length > 0) {
    if (options.debug !== undefined) defaultLogger.setLevel(options.debug ? 'DEBUG' : 'INFO');
    if (options.enabled !== undefined) defaultLogger.setEnabled(options.enabled);
  }
  return defaultLogger;
}

export function createLogger(options = {}) { return new Logger(options); }
export { Logger, LOG_LEVELS };
export default { getLogger, createLogger, Logger, LOG_LEVELS };
`;
}

function genHelpers(c) {
  return `/**
 * ${c.package} — Helper Utilities
 */

export function generateId() {
  return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
}

export function createCacheKey(content) {
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return \`mixpeek_\${Math.abs(hash).toString(36)}\`;
}

export function sanitizeText(text, maxLength = 50000) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim().substring(0, maxLength);
}

export function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
        ? deepMerge(target[key], source[key]) : { ...source[key] };
    } else if (Array.isArray(source[key])) {
      result[key] = [...source[key]];
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try { new URL(url); return true; } catch { return false; }
}

export function extractDomain(url) {
  if (!isValidUrl(url)) return null;
  try { return new URL(url).hostname; } catch { return null; }
}

export default { generateId, createCacheKey, sanitizeText, deepMerge, isValidUrl, extractDomain };
`;
}

function genModule(c, mod) {
  const factoryName = `create${mod.className}`;
  const methodImpls = mod.methods.map(m => {
    if (m === 'destroy') {
      return `  destroy() {
    if (this.cache) this.cache.destroy();
    this.logger.info('${mod.className} destroyed');
  }`;
    }
    // For methods likely to be async (API calls)
    const isAsync = ['start', 'stop', 'handler', 'httpHandler', 'eventHandler',
      'send', 'sendBatch', 'connect', 'disconnect', 'subscribe',
      'process', 'processBatch', 'processStream', 'processEvent', 'processNotification',
      'enrich', 'enrichProduct', 'enrichCollection', 'enrichEntry', 'enrichAsset',
      'enrichDocument', 'enrichImage', 'enrichBatch', 'enrichColumn',
      'getEnrichment', 'writeMetafield', 'writeField', 'setField', 'patchDocument',
      'handleWebhook', 'handleToolCall', 'handleToolUse', 'handleRun', 'handleCreate',
      'handleUpdate', 'handleDelete', 'handleRequest',
      'getProduct', 'getProducts', 'updateProduct', 'getCollection', 'graphql',
      'getEntry', 'getEntries', 'updateEntry', 'getAsset', 'publishEntry',
      'fetch', 'getDocument', 'createDocument', 'query',
      'search', 'infer', 'embedText', 'embedImage', 'classify', 'embed', 'embedBatch', 'store',
      'load', 'loadAndSplit', 'loadData', 'lazyLoadData',
      'getRelevantDocuments', 'invoke', 'call', 'retrieve', 'aretrieve',
      'exportToDataset', 'importFromDataset', 'sync',
      'readTable', 'writeTable', 'mergeTable',
      'execute', 'flush', 'check',
      'trigger', 'acknowledge', 'resolve',
      'captureException', 'captureMessage',
      'startTransaction', 'startSpan', 'finishTransaction',
      'createAnnotation', 'queryAnnotations', 'deleteAnnotation',
      'createDashboard', 'updateDashboard', 'deleteDashboard',
      'registerWebhooks', 'registerWebhook', 'listWebhooks', 'deleteWebhook',
      'createTask',
    ].includes(m);

    if (isAsync) {
      return `  async ${m}(...args) {
    this.logger.debug('${mod.className}.${m} called');
    // TODO: Implement ${m}
    throw new Error('${mod.className}.${m} not yet implemented');
  }`;
    }

    return `  ${m}(...args) {
    this.logger.debug('${mod.className}.${m} called');
    // TODO: Implement ${m}
    throw new Error('${mod.className}.${m} not yet implemented');
  }`;
  }).join('\n\n');

  return `/**
 * ${c.package} — ${mod.className}
 *
 * ${mod.description}
 */

import { createClient } from '../api/mixpeekClient.js';
import { createCacheManager } from '../cache/cacheManager.js';
import { getLogger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/constants.js';

class ${mod.className} {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Mixpeek API key
   * @param {string} [config.endpoint] - API endpoint
   * @param {number} [config.timeout] - Request timeout in ms
   * @param {number} [config.cacheTTL] - Cache TTL in seconds
   * @param {boolean} [config.enableCache] - Enable caching
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config = {}) {
    if (!config.apiKey) throw new Error('apiKey is required for ${mod.className}');

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = createClient({
      apiKey: config.apiKey,
      endpoint: this.config.endpoint,
      timeout: this.config.timeout,
      debug: this.config.debug
    });
    this.cache = this.config.enableCache ? createCacheManager({ ttl: this.config.cacheTTL, debug: this.config.debug }) : null;
    this.logger = getLogger({ debug: this.config.debug });
    this.metrics = { requests: 0, errors: 0, totalLatencyMs: 0 };
    this.logger.info('${mod.className} initialized');
  }

${methodImpls}

  getMetrics() {
    return {
      ...this.metrics,
      avgLatencyMs: this.metrics.requests > 0 ? this.metrics.totalLatencyMs / this.metrics.requests : 0,
      cache: this.cache ? this.cache.getStats() : null
    };
  }

  resetMetrics() {
    this.metrics = { requests: 0, errors: 0, totalLatencyMs: 0 };
    if (this.cache) this.cache.resetStats();
  }

  destroy() {
    if (this.cache) this.cache.destroy();
    this.logger.info('${mod.className} destroyed');
  }
}

export function ${factoryName}(config) {
  return new ${mod.className}(config);
}

export { ${mod.className} };
export default { ${factoryName}, ${mod.className} };
`;
}

function genBuildScript(c) {
  const className = c.modules[0].className;
  const factoryName = `create${className}`;

  const moduleTypeDeclarations = c.modules.map(m => {
    const methods = m.methods.map(method => `  ${method}(...args: any[]): any;`).join('\n');
    return `export declare class ${m.className} {
  constructor(config: ConnectorConfig);
${methods}
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}`;
  }).join('\n\n');

  const moduleFactoryDeclarations = c.modules.map(m =>
    `export declare function create${m.className}(config: ConnectorConfig): ${m.className};`
  ).join('\n');

  return `/**
 * Build script for ${c.package}
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building ${c.package}...');

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else if (entry.name.endsWith('.js')) cpSync(srcPath, destPath);
  }
}

copyDir(srcDir, distDir);
console.log('  Copied ESM source to dist/');

const cjsContent = \`'use strict';
let modulePromise = null;
function getModule() { if (!modulePromise) modulePromise = import('./index.js'); return modulePromise; }
module.exports = {
  async ${factoryName}(config) { const mod = await getModule(); return new mod.${className}(config); },
  getModule,
  version: '1.0.0'
};
\`;

writeFileSync(join(distDir, 'index.cjs'), cjsContent);
console.log('  Created CommonJS wrapper dist/index.cjs');

const dtsContent = \`/**
 * ${c.package} — TypeScript declarations
 */

export interface ConnectorConfig {
  apiKey: string;
  endpoint?: string;
  timeout?: number;
  cacheTTL?: number;
  enableCache?: boolean;
  debug?: boolean;
}

export interface MetricsResult {
  requests: number;
  errors: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  cache: { size: number; hits: number; misses: number; hitRate: number } | null;
}

${moduleTypeDeclarations}

${moduleFactoryDeclarations}

export declare class MixpeekClient {
  constructor(config: ConnectorConfig);
  request(method: string, path: string, body?: any): Promise<any>;
  healthCheck(): Promise<{ status: string; latency?: number; error?: string }>;
  search(query: any, options?: any): Promise<any>;
}

export declare class CacheManager {
  constructor(options?: { ttl?: number; maxItems?: number; debug?: boolean });
  get(key: string): any | null;
  set(key: string, value: any, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  getStats(): { size: number; hits: number; misses: number; hitRate: number };
  destroy(): void;
}

export declare function createClient(config: ConnectorConfig): MixpeekClient;
export declare function createCacheManager(options?: any): CacheManager;
\`;

writeFileSync(join(distDir, 'index.d.ts'), dtsContent);
console.log('  Created TypeScript declarations dist/index.d.ts');

console.log('Build complete!');
`;
}

function genJestConfig(c) {
  return `/**
 * Jest Configuration — Unit Tests (ESM)
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/unit/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  },
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  injectGlobals: true,
  moduleNameMapper: {}
};
`;
}

function genJestConfigE2e() {
  return `/**
 * Jest Configuration — E2E Tests (ESM)
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/e2e/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {}
};
`;
}

function genJestConfigLive() {
  return `/**
 * Jest Configuration — Live API Tests (ESM)
 *
 * Requires: MIXPEEK_API_KEY
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/live-api/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/live-api/setup.js'],
  moduleNameMapper: {}
};
`;
}

function genTestSetup(c) {
  return `/**
 * Jest Test Setup for ${c.package} (ESM)
 */
import { jest, beforeEach, beforeAll, afterAll } from '@jest/globals';

globalThis.jest = jest;
global.fetch = jest.fn();

if (typeof performance === 'undefined') {
  global.performance = { now: () => Date.now() };
}

beforeEach(() => {
  jest.clearAllMocks();
  if (global.fetch.mockReset) global.fetch.mockReset();
});

const originalConsole = { ...console };

beforeAll(() => {
  if (process.env.DEBUG !== 'true') {
    console.log = jest.fn();
    console.debug = jest.fn();
    console.info = jest.fn();
  }
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

global.createMockResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
};

global.createMockErrorResponse = (message, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message)
  });
};

global.sampleApiResponse = {
  id: 'doc-123',
  document_id: 'doc-123',
  status: 'ok',
  enrichments: {
    keywords: ['test', 'sample'],
    categories: ['general']
  }
};
`;
}

function genLiveApiSetup(c) {
  return `/**
 * Live API Test Setup for ${c.package}
 *
 * Requires: MIXPEEK_API_KEY
 */

const requiredEnvVars = ['MIXPEEK_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(\`Live API tests skipped — missing: \${missingVars.join(', ')}\`);
}

export const liveTestConfig = {
  apiKey: process.env.MIXPEEK_API_KEY || '',
  endpoint: process.env.MIXPEEK_ENDPOINT || 'https://api.mixpeek.com',
  isConfigured: missingVars.length === 0
};

export function skipIfNotConfigured() { return !liveTestConfig.isConfigured; }

beforeAll(() => {
  if (!liveTestConfig.isConfigured) console.log('Live API tests will be skipped');
  else console.log('Live API tests configured for:', liveTestConfig.endpoint);
});

jest.setTimeout(60000);
global.fetch = globalThis.fetch;
`;
}

function genUnitTestClient(c) {
  return `/**
 * Unit Tests — MixpeekClient for ${c.package}
 */
import { createClient, MixpeekClient } from '../../../src/api/mixpeekClient.js';

describe('MixpeekClient', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = createClient(validConfig);
      expect(client).toBeInstanceOf(MixpeekClient);
    });

    it('should throw without apiKey', () => {
      expect(() => createClient({})).toThrow('API key is required');
    });

    it('should use default endpoint', () => {
      const client = createClient(validConfig);
      expect(client.endpoint).toBe('https://api.mixpeek.com');
    });

    it('should allow custom endpoint', () => {
      const client = createClient({ ...validConfig, endpoint: 'https://custom.api.com' });
      expect(client.endpoint).toBe('https://custom.api.com');
    });
  });

  describe('healthCheck', () => {
    let client;
    beforeEach(() => { client = createClient(validConfig); });

    it('should return healthy status', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));
      const result = await client.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.latency).toBeDefined();
    });

    it('should return unhealthy on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection failed'));
      const result = await client.healthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeDefined();
    });
  });

  describe('search', () => {
    let client;
    beforeEach(() => { client = createClient(validConfig); });

    it('should call search endpoint', async () => {
      const mockResults = { results: [{ id: '1', score: 0.95 }] };
      global.fetch.mockResolvedValueOnce(createMockResponse(mockResults));

      const result = await client.search({ text: 'test query' });
      expect(result.results).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/features/search'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('retry logic', () => {
    let client;
    beforeEach(() => { client = createClient({ ...validConfig, timeout: 5000 }); });

    it('should retry on failure', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockResponse({ ok: true }));

      const result = await client.healthCheck();
      expect(result.status).toBe('healthy');
    });
  });
});
`;
}

function genUnitTestModule(c, mod) {
  const factoryName = `create${mod.className}`;

  return `/**
 * Unit Tests — ${mod.className} for ${c.package}
 */
import { ${factoryName}, ${mod.className} } from '../../../src/modules/${mod.name}.js';

describe('${mod.className}', () => {
  const validConfig = { apiKey: 'test-api-key' };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = ${factoryName}(validConfig);
      expect(instance).toBeInstanceOf(${mod.className});
    });

    it('should throw without apiKey', () => {
      expect(() => ${factoryName}({})).toThrow('apiKey is required');
    });

    it('should use default config values', () => {
      const instance = ${factoryName}(validConfig);
      expect(instance.config.enableCache).toBe(true);
    });

    it('should allow config overrides', () => {
      const instance = ${factoryName}({ ...validConfig, timeout: 5000, enableCache: false });
      expect(instance.config.timeout).toBe(5000);
      expect(instance.config.enableCache).toBe(false);
    });
  });

  describe('metrics', () => {
    let instance;
    beforeEach(() => { instance = ${factoryName}(validConfig); });
    afterEach(() => { instance.destroy(); });

    it('should return initial metrics', () => {
      const metrics = instance.getMetrics();
      expect(metrics.requests).toBe(0);
      expect(metrics.errors).toBe(0);
    });

    it('should reset metrics', () => {
      instance.metrics.requests = 5;
      instance.resetMetrics();
      expect(instance.getMetrics().requests).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('should destroy cleanly', () => {
      const instance = ${factoryName}(validConfig);
      expect(() => instance.destroy()).not.toThrow();
    });

    it('should destroy with cache disabled', () => {
      const instance = ${factoryName}({ ...validConfig, enableCache: false });
      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
`;
}

function genE2eTest(c) {
  const mainMod = c.modules[0];
  const factoryName = `create${mainMod.className}`;

  return `/**
 * E2E Tests — ${c.package}
 */
import { ${factoryName} } from '../../src/modules/${mainMod.name}.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { createCacheManager } from '../../src/cache/cacheManager.js';

describe('${titleCase(c.name)} Connector E2E', () => {
  describe('Full Integration Flow', () => {
    let instance;

    beforeEach(() => {
      instance = ${factoryName}({
        apiKey: 'e2e-test-key',
        enableCache: true,
        timeout: 5000
      });

      global.fetch.mockResolvedValue(createMockResponse({
        id: 'doc-e2e',
        status: 'ok',
        enrichments: { keywords: ['test'], categories: ['general'] }
      }));
    });

    afterEach(() => { instance.destroy(); });

    it('should initialize all components', () => {
      expect(instance.client).toBeDefined();
      expect(instance.cache).toBeDefined();
      expect(instance.logger).toBeDefined();
    });

    it('should track metrics across operations', () => {
      const metrics = instance.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.requests).toBe(0);
      expect(metrics.cache).toBeDefined();
    });

    it('should handle cache lifecycle', () => {
      const cache = createCacheManager({ ttl: 60 });
      cache.set('test-key', { data: 'value' });
      expect(cache.get('test-key')).toEqual({ data: 'value' });
      expect(cache.has('test-key')).toBe(true);
      cache.clear();
      expect(cache.get('test-key')).toBeNull();
      cache.destroy();
    });
  });

  describe('API Client Integration', () => {
    let client;

    beforeEach(() => {
      client = createClient({ apiKey: 'e2e-test-key' });
    });

    it('should perform health check', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({ status: 'ok' }));
      const health = await client.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const health = await client.healthCheck();
      expect(health.status).toBe('unhealthy');
    });

    it('should search with query', async () => {
      global.fetch.mockResolvedValueOnce(createMockResponse({
        results: [{ id: '1', score: 0.95 }]
      }));
      const results = await client.search({ text: 'test' });
      expect(results.results).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout gracefully', async () => {
      const client = createClient({ apiKey: 'test', timeout: 10 });
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 5000)));
      const health = await client.healthCheck();
      expect(health.status).toBe('unhealthy');
    });
  });
});
`;
}

function genLiveApiTest(c) {
  const mainMod = c.modules[0];
  const factoryName = `create${mainMod.className}`;

  return `/**
 * Live API Tests — ${c.package}
 *
 * Tests against the real Mixpeek API. Requires MIXPEEK_API_KEY.
 */
import { ${factoryName} } from '../../src/modules/${mainMod.name}.js';
import { createClient } from '../../src/api/mixpeekClient.js';
import { liveTestConfig, skipIfNotConfigured } from './setup.js';

describe('${titleCase(c.name)} Live API Tests', () => {
  const shouldSkip = skipIfNotConfigured();

  describe('API Connectivity', () => {
    (shouldSkip ? it.skip : it)('should connect to Mixpeek API', async () => {
      const client = createClient({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });

      const health = await client.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.latency).toBeLessThan(5000);
    });
  });

  describe('${mainMod.className} Integration', () => {
    (shouldSkip ? it.skip : it)('should initialize with live API', () => {
      const instance = ${factoryName}({
        apiKey: liveTestConfig.apiKey,
        endpoint: liveTestConfig.endpoint
      });
      expect(instance).toBeDefined();
      instance.destroy();
    });
  });
});
`;
}

function genReadme(c) {
  const installCmd = Object.keys(c.peerDependencies).length > 0
    ? `npm install ${c.package} ${Object.keys(c.peerDependencies).join(' ')}`
    : `npm install ${c.package}`;

  const moduleExamples = c.modules.map(m => {
    const factoryName = `create${m.className}`;
    return `### ${m.className}

${m.description}

\`\`\`js
import { ${factoryName} } from '${c.package}';

const ${camelCase(m.className)} = ${factoryName}({
  apiKey: process.env.MIXPEEK_API_KEY
});
\`\`\``;
  }).join('\n\n');

  return `# ${c.package}

${c.description}

## Installation

\`\`\`bash
${installCmd}
\`\`\`

## Quick Start

\`\`\`js
import ${camelCase(c.modules[0].className)} from '${c.package}';

const instance = ${camelCase(c.modules[0].className)}({
  apiKey: process.env.MIXPEEK_API_KEY
});
\`\`\`

## Modules

${moduleExamples}

## Testing

\`\`\`bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:live     # Live API tests (requires MIXPEEK_API_KEY)
npm run test:coverage # Coverage report
\`\`\`

## License

MIT
`;
}

function genChangelog(c) {
  return `# Changelog

## 1.0.0 (${new Date().toISOString().split('T')[0]})

- Initial release
- ${c.modules.map(m => m.className).join(', ')} modules
- Mixpeek API client with retry logic
- In-memory LRU cache
- Unit, E2E, and live API tests
`;
}

function genLicense() {
  return `MIT License

Copyright (c) ${new Date().getFullYear()} Mixpeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function genNpmIgnore() {
  return `tests/
*.test.js
jest.config.js
jest.config.*.js
.eslintrc*
.prettierrc*
.editorconfig
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
.DS_Store
Thumbs.db
*.log
npm-debug.log*
scripts/
docs/
`;
}

// ─── Main Generator ─────────────────────────────────────────────

function generateConnector(c) {
  const dir = join(ROOT, c.name);

  if (existsSync(dir)) {
    console.log(`  SKIP ${c.name}/ (already exists)`);
    return false;
  }

  console.log(`  Generating ${c.name}/`);

  // Root files
  writeFile(join(dir, 'package.json'), genPackageJson(c));
  writeFile(join(dir, 'jest.config.js'), genJestConfig(c));
  writeFile(join(dir, 'jest.config.e2e.js'), genJestConfigE2e());
  writeFile(join(dir, 'jest.config.live.js'), genJestConfigLive());
  writeFile(join(dir, 'README.md'), genReadme(c));
  writeFile(join(dir, 'CHANGELOG.md'), genChangelog(c));
  writeFile(join(dir, 'LICENSE'), genLicense());
  writeFile(join(dir, '.npmignore'), genNpmIgnore());

  // src/
  writeFile(join(dir, 'src', 'index.js'), genIndex(c));
  writeFile(join(dir, 'src', 'config', 'constants.js'), genConstants(c));
  writeFile(join(dir, 'src', 'api', 'mixpeekClient.js'), genMixpeekClient(c));
  writeFile(join(dir, 'src', 'cache', 'cacheManager.js'), genCacheManager(c));
  writeFile(join(dir, 'src', 'utils', 'logger.js'), genLogger(c));
  writeFile(join(dir, 'src', 'utils', 'helpers.js'), genHelpers(c));

  // src/modules/
  for (const mod of c.modules) {
    writeFile(join(dir, 'src', 'modules', `${mod.name}.js`), genModule(c, mod));
  }

  // scripts/
  writeFile(join(dir, 'scripts', 'build.js'), genBuildScript(c));

  // tests/
  writeFile(join(dir, 'tests', 'setup.js'), genTestSetup(c));
  writeFile(join(dir, 'tests', 'unit', 'api', 'mixpeekClient.test.js'), genUnitTestClient(c));
  for (const mod of c.modules) {
    writeFile(join(dir, 'tests', 'unit', 'modules', `${mod.name}.test.js`), genUnitTestModule(c, mod));
  }
  writeFile(join(dir, 'tests', 'e2e', `${c.name}.e2e.test.js`), genE2eTest(c));
  writeFile(join(dir, 'tests', 'live-api', 'setup.js'), genLiveApiSetup(c));
  writeFile(join(dir, 'tests', 'live-api', `${c.name}.live.test.js`), genLiveApiTest(c));

  return true;
}

// ─── CLI ────────────────────────────────────────────────────────

const targetName = process.argv[2];

console.log('Mixpeek Connector Generator');
console.log('===========================\n');

if (targetName) {
  const def = connectors.find(c => c.name === targetName);
  if (!def) {
    console.error(`Unknown connector: ${targetName}`);
    console.log(`Available: ${connectors.map(c => c.name).join(', ')}`);
    process.exit(1);
  }
  const created = generateConnector(def);
  console.log(created ? `\nCreated ${targetName}/` : `\n${targetName}/ already exists`);
} else {
  let created = 0;
  let skipped = 0;
  for (const c of connectors) {
    if (generateConnector(c)) created++;
    else skipped++;
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped`);
}
