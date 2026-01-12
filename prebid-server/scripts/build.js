/**
 * Build Script for @mixpeek/prebid-server
 *
 * Creates dist/ folder with CommonJS and TypeScript definitions
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')

// Create dist directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

console.log('Building @mixpeek/prebid-server...')

// Copy source files to dist
const srcFiles = ['index.js', 'client.js', 'enrichment.js', 'content.js', 'iab.js']

srcFiles.forEach(file => {
  const srcPath = join(rootDir, 'src', file)
  const distPath = join(distDir, file)
  cpSync(srcPath, distPath)
  console.log(`  Copied ${file}`)
})

// Generate TypeScript definitions
const dtsContent = `/**
 * Mixpeek RTD Module for Prebid Server
 * TypeScript Definitions
 */

export interface MixpeekConfig {
  apiKey: string;
  collectionId: string;
  namespace: string;
  endpoint?: string;
  timeout?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface ContentInput {
  url?: string;
  title?: string;
  text?: string;
  description?: string;
  language?: string;
}

export interface Ortb2Content {
  cat?: string[];
  cattax?: number;
  genre?: string;
  keywords?: string;
  language?: string;
  url?: string;
  title?: string;
  ext?: {
    data?: {
      mixpeek?: {
        documentId?: string;
        score?: number;
        sentiment?: string;
        brandSafety?: {
          score: number;
          level: string;
        };
      };
    };
  };
}

export interface EnrichmentResult {
  ortb2: {
    site: {
      content: Ortb2Content;
    };
  };
  targeting: Record<string, string>;
  context: Record<string, unknown>;
  latencyMs: number;
  cached: boolean;
  error?: string;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  enabled: boolean;
  ttlMs: number;
}

export interface Enricher {
  enrich(content: ContentInput): Promise<EnrichmentResult>;
  enrichBidRequest(bidRequest: Record<string, unknown>, content?: ContentInput): Promise<Record<string, unknown>>;
  healthCheck(): Promise<Record<string, unknown>>;
  clearCache(): void;
  getCacheStats(): CacheStats;
}

export function createEnricher(config: MixpeekConfig): Enricher;

export class MixpeekClient {
  constructor(config: { apiKey: string; endpoint?: string; namespace: string; timeout?: number });
  healthCheck(): Promise<Record<string, unknown>>;
  processContent(collectionId: string, content: ContentInput): Promise<Record<string, unknown>>;
}

export function enrichOrtb2(result: Record<string, unknown>, content: ContentInput): { site: { content: Ortb2Content } };
export function enrichBidRequest(bidRequest: Record<string, unknown>, enrichment: EnrichmentResult): Record<string, unknown>;
export function extractContent(bidRequest: Record<string, unknown>): ContentInput | null;
export function buildContent(options?: Partial<ContentInput>): ContentInput;

export const IAB_CATEGORIES: Record<string, string>;
export function getIABCode(label: string): string;
export function getIABLabel(code: string): string;

declare const _default: {
  createEnricher: typeof createEnricher;
};

export default _default;
`

writeFileSync(join(distDir, 'index.d.ts'), dtsContent)
console.log('  Generated index.d.ts')

console.log('\\nBuild complete!')
