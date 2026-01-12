/**
 * Build script for @mixpeek/openrtb
 *
 * Creates distribution files:
 * - dist/index.js (ESM)
 * - dist/index.cjs (CommonJS)
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building @mixpeek/openrtb...');

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
 * @mixpeek/openrtb - CommonJS entry point
 *
 * For ESM, use: import { OpenRTBEnricher } from '@mixpeek/openrtb'
 * For CommonJS, use: const { OpenRTBEnricher } = require('@mixpeek/openrtb')
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
  async createEnricher(config) {
    const mod = await getModule();
    return new mod.OpenRTBEnricher(config);
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
 * @mixpeek/openrtb - TypeScript declarations
 */

export interface MixpeekConfig {
  apiKey: string;
  collectionId?: string;
  namespace?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  shadowMode?: boolean;
}

export interface EnrichmentOptions {
  features?: string[];
  model?: string;
  timeout?: number;
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number;
  maxSize?: number;
}

export interface OpenRTBEnricherConfig {
  mixpeek: MixpeekConfig;
  cache?: CacheConfig;
  enrichment?: EnrichmentOptions;
  fallback?: {
    enabled?: boolean;
    localKeywords?: boolean;
    localSentiment?: boolean;
    localCategories?: boolean;
  };
}

export interface OpenRTBBidRequest {
  id: string;
  imp: Array<{
    id: string;
    banner?: { w: number; h: number };
    video?: { mimes: string[]; w?: number; h?: number };
    native?: object;
  }>;
  site?: {
    id?: string;
    name?: string;
    domain?: string;
    page?: string;
    keywords?: string;
    cat?: string[];
    content?: {
      title?: string;
      keywords?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  app?: {
    id?: string;
    name?: string;
    bundle?: string;
    domain?: string;
    cat?: string[];
    content?: {
      title?: string;
      keywords?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  device?: object;
  user?: object;
  [key: string]: any;
}

export interface EnrichmentResult {
  success: boolean;
  cached: boolean;
  latencyMs: number;
  enrichments: {
    keywords: string[];
    sentiment: {
      sentiment: 'positive' | 'negative' | 'neutral';
      score: number;
    };
    categories: {
      category: string | null;
      categoryName: string | null;
      confidence: number;
    };
    brandSafety: {
      level: 'safe' | 'medium_risk' | 'high_risk';
      score: number;
    };
    language?: string;
    embeddings?: {
      id: string;
      vector: number[];
    };
  };
  ortb: {
    site?: object;
    app?: object;
    content?: object;
  };
  error?: string;
}

export declare class OpenRTBEnricher {
  constructor(config: OpenRTBEnricherConfig);
  enrich(bidRequest: OpenRTBBidRequest): Promise<EnrichmentResult>;
  getStats(): {
    requests: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    avgLatencyMs: number;
  };
  clearCache(): void;
}

export declare class MixpeekClient {
  constructor(config: MixpeekConfig);
  processContent(content: object): Promise<{
    success: boolean;
    enrichments: object;
    error?: string;
  }>;
}

export declare class CacheManager {
  constructor(config?: CacheConfig);
  get(key: string): any | null;
  set(key: string, value: any): void;
  clear(): void;
  getStats(): { hits: number; misses: number; size: number };
}

export declare class ContentExtractor {
  extract(bidRequest: OpenRTBBidRequest): {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    categories: string[];
    contentType: string;
  };
}

export declare class ORTBFormatter {
  format(enrichments: object, originalBidRequest: OpenRTBBidRequest): object;
}

export declare const VERSION: string;
export declare const DEFAULT_CONFIG: OpenRTBEnricherConfig;
`;

writeFileSync(join(distDir, 'index.d.ts'), dtsContent);
console.log('✓ Created TypeScript declarations dist/index.d.ts');

console.log('\nBuild complete!');
