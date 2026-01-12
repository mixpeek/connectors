/**
 * Build script for @mixpeek/iab-ad-product-taxonomy
 *
 * Creates distribution files:
 * - dist/index.js (ESM)
 * - dist/index.cjs (CommonJS)
 * - dist/index.d.ts (TypeScript declarations)
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building @mixpeek/iab-ad-product-taxonomy...');

// Create dist directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy src to dist (ESM version)
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.js')) {
      cpSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, distDir);
console.log('✓ Copied ESM source to dist/');

// Create CommonJS bundle
const cjsContent = `/**
 * @mixpeek/iab-ad-product-taxonomy - CommonJS entry point
 *
 * For ESM, use: import { createMapper } from '@mixpeek/iab-ad-product-taxonomy'
 * For CommonJS, use: const { createMapper } = require('@mixpeek/iab-ad-product-taxonomy')
 */

'use strict';

// Dynamic import wrapper for CommonJS compatibility
let modulePromise = null;

function getModule() {
  if (!modulePromise) {
    modulePromise = import('./index.js');
  }
  return modulePromise;
}

// Export a promise-based API for CommonJS
module.exports = {
  // Async factory function
  async createMapper(config) {
    const mod = await getModule();
    return mod.createMapper(config);
  },

  // Quick mapping function
  async mapProduct(product, options) {
    const mod = await getModule();
    return mod.mapProduct(product, options);
  },

  // Get the full module (for advanced usage)
  getModule,

  // Version info
  version: '1.0.0'
};
`;

writeFileSync(join(distDir, 'index.cjs'), cjsContent);
console.log('✓ Created CommonJS wrapper dist/index.cjs');

// Create TypeScript declaration file
const dtsContent = `/**
 * @mixpeek/iab-ad-product-taxonomy - TypeScript declarations
 */

export interface MapperConfig {
  apiKey?: string;
  namespace?: string;
  endpoint?: string;
  timeout?: number;
  cacheTTL?: number;
  enableCache?: boolean;
  enableSemantic?: boolean;
  mappingMode?: 'deterministic' | 'semantic' | 'hybrid';
  iabVersion?: string;
  minConfidence?: number;
  debug?: boolean;
}

export interface ProductInput {
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  keywords?: string[];
}

export interface MappingOptions {
  mode?: 'deterministic' | 'semantic' | 'hybrid';
  minConfidence?: number;
  includeSecondary?: boolean;
}

export interface SecondaryCategory {
  code: string;
  id: number;
  label: string;
  confidence: number;
}

export interface IABProductResult {
  primary: string;
  primaryId: number;
  label: string;
  confidence: number;
  version: string;
  tier1?: string;
  tier1Id?: number;
  tier1Label?: string;
  secondary?: SecondaryCategory[];
  explanation?: string;
}

export interface MappingResult {
  success: boolean;
  iab_product?: IABProductResult;
  source?: string;
  cached?: boolean;
  latencyMs?: number;
  input?: {
    title: string;
    description?: string;
  };
  error?: string;
  errorCode?: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  tier: number;
  parent: number | null;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: string;
  sets: number;
  evictions: number;
  enabled: boolean;
}

export interface MapperStats {
  requests: number;
  cacheHits: number;
  deterministicMatches: number;
  semanticMatches: number;
  noMatches: number;
  errors: number;
  totalLatencyMs: number;
  avgLatencyMs: string;
  cache: CacheStats | null;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  mode: string;
  cache: CacheStats | null;
  api: {
    status: string;
    latency?: number;
    error?: string;
  } | null;
}

export declare class ProductMapper {
  constructor(config?: MapperConfig);
  mapProduct(product: ProductInput, options?: MappingOptions): Promise<MappingResult>;
  mapProducts(products: ProductInput[], options?: MappingOptions): Promise<MappingResult[]>;
  lookupCategory(id: number | string): CategoryInfo | null;
  validateCategory(id: number | string): boolean;
  getStats(): MapperStats;
  resetStats(): void;
  clearCache(): void;
  healthCheck(): Promise<HealthStatus>;
}

export declare class MixpeekClient {
  constructor(config: { apiKey: string; namespace?: string; endpoint?: string; timeout?: number; debug?: boolean });
  classifyProduct(product: ProductInput): Promise<{
    success: boolean;
    categories?: Array<{
      id: number;
      name: string;
      confidence: number;
      tier: number;
      parent: number | null;
    }>;
    error?: string;
  }>;
  healthCheck(): Promise<{ status: string; latency?: number; error?: string }>;
}

export declare class CacheManager {
  constructor(config?: { ttl?: number; maxItems?: number; enabled?: boolean });
  get(key: string): any | undefined;
  set(key: string, value: any, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  clearExpired(): number;
  getStats(): CacheStats;
  resetStats(): void;
  setEnabled(enabled: boolean): void;
  keys(): string[];
  size(): number;
}

export declare function createMapper(config?: MapperConfig): ProductMapper;
export declare function mapProduct(product: ProductInput, options?: MappingOptions): Promise<MappingResult>;
export declare function createClient(config: { apiKey: string; namespace?: string; endpoint?: string; timeout?: number; debug?: boolean }): MixpeekClient;
export declare function createCacheManager(config?: { ttl?: number; maxItems?: number; enabled?: boolean }): CacheManager;

// Taxonomy exports
export declare const IAB_AD_PRODUCT_TAXONOMY: Record<number, CategoryInfo>;
export declare const IAB_AD_PRODUCT_TIER1: Record<number, CategoryInfo>;
export declare function getIABCode(id: number): string;
export declare function getIdFromCode(code: string): number | null;
export declare function getCategoryById(id: number | string): CategoryInfo | null;
export declare function getTier1Categories(): CategoryInfo[];
export declare function getChildCategories(parentId: number | string): CategoryInfo[];
export declare function getCategoryPath(id: number): CategoryInfo[];
export declare function getCategoryLabel(id: number): string;
export declare function isValidCategory(id: number | string): boolean;
export declare function getTier1Parent(id: number): CategoryInfo | null;

// Keyword mapping exports
export declare const KEYWORD_MAPPINGS: Record<string, number>;
export declare function mapKeywordToCategory(keyword: string): { id: number; name: string; tier: number; parent: number | null; confidence: number } | null;
export declare function mapKeywordsToCategories(keywords: string[]): Array<{ id: number; name: string; confidence: number; matchCount: number; keywords: string[] }>;
export declare function findBestMatch(text: string): { id: number; name: string; confidence: number } | null;
export declare function getKeywordsForCategory(categoryId: number): string[];
export declare function getAllKeywords(): string[];

// Utility exports
export declare function generateId(): string;
export declare function createCacheKey(input: { title?: string; description?: string; category?: string }): string;
export declare function sanitizeText(text: string, maxLength?: number): string;
export declare function sanitizeTitle(title: string): string;
export declare function sanitizeDescription(description: string): string;
export declare function extractKeywords(text: string): string[];
export declare function validateConfig(config: any): { valid: boolean; errors: string[] };
export declare function validateInput(input: any): { valid: boolean; errors: string[] };
export declare function deepMerge(target: object, source: object): object;
export declare function normalizeText(text: string): string;

// Constants
export declare const API_ENDPOINT: string;
export declare const API_VERSION: string;
export declare const DEFAULT_TIMEOUT: number;
export declare const DEFAULT_CACHE_TTL: number;
export declare const IAB_AD_PRODUCT_VERSIONS: Record<string, string>;
export declare const DEFAULT_IAB_VERSION: string;
export declare const MAPPING_MODES: { DETERMINISTIC: string; SEMANTIC: string; HYBRID: string };
export declare const DEFAULT_MAPPING_MODE: string;
export declare const CONFIDENCE_THRESHOLDS: { HIGH: number; MEDIUM: number; LOW: number; MINIMUM: number };
export declare const ERROR_CODES: Record<string, string>;
export declare const DEFAULT_CONFIG: MapperConfig;

// Logger
export declare const LOG_LEVELS: { NONE: number; ERROR: number; WARN: number; INFO: number; DEBUG: number };
export declare class Logger {
  constructor(config?: { debug?: boolean; prefix?: string });
  setLevel(level: number): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  time(label: string): void;
  timeEnd(label: string): number;
}
export declare function getLogger(config?: { debug?: boolean }): Logger;
export declare function createLogger(config?: { debug?: boolean; prefix?: string }): Logger;

export default createMapper;
`;

writeFileSync(join(distDir, 'index.d.ts'), dtsContent);
console.log('✓ Created TypeScript declarations dist/index.d.ts');

console.log('\\nBuild complete!');
