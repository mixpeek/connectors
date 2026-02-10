/**
 * Build Script for @mixpeek/fhir
 *
 * Creates dist/ folder with source files and TypeScript definitions
 */

import { writeFileSync, mkdirSync, cpSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')

// Create dist directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

console.log('Building @mixpeek/fhir...')

// Copy source files to dist
const srcFiles = ['index.js', 'client.js', 'extract.js', 'enrichment.js']

srcFiles.forEach(file => {
  const srcPath = join(rootDir, 'src', file)
  const distPath = join(distDir, file)
  cpSync(srcPath, distPath)
  console.log(`  Copied ${file}`)
})

// Generate TypeScript definitions
const dtsContent = `/**
 * Mixpeek FHIR Connector
 * TypeScript Definitions
 */

export interface MixpeekFHIRConfig {
  apiKey: string;
  collectionId: string;
  namespace: string;
  endpoint?: string;
  timeout?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface ExtractedContent {
  resourceType: string;
  resourceId: string;
  text: string;
  url?: string;
  metadata: Record<string, unknown>;
}

export interface FHIRExtension {
  url: string;
  valueString?: string;
  valueDecimal?: number;
  extension?: FHIRExtension[];
}

export interface FHIRCoding {
  system: string;
  code: string;
  display?: string;
}

export interface FHIREnrichment {
  extensions: FHIRExtension[];
  tags: FHIRCoding[];
  context: Record<string, unknown>;
}

export interface EnrichResult {
  resource: Record<string, unknown>;
  enrichment: FHIREnrichment | null;
  extracted?: ExtractedContent;
  latencyMs: number;
  cached: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

export interface BundleEnrichResult {
  bundle: Record<string, unknown>;
  results: EnrichResult[];
  latencyMs: number;
  error?: string;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  enabled: boolean;
  ttlMs: number;
}

export interface Enricher {
  enrich(resource: Record<string, unknown>): Promise<EnrichResult>;
  enrichBundle(bundle: Record<string, unknown>): Promise<BundleEnrichResult>;
  extract(resource: Record<string, unknown>): ExtractedContent | null;
  strip(resource: Record<string, unknown>): Record<string, unknown>;
  healthCheck(): Promise<Record<string, unknown>>;
  clearCache(): void;
  getCacheStats(): CacheStats;
  getSupportedResourceTypes(): string[];
}

export function createEnricher(config: MixpeekFHIRConfig): Enricher;

export class MixpeekClient {
  constructor(config: { apiKey: string; endpoint?: string; namespace: string; timeout?: number });
  healthCheck(): Promise<Record<string, unknown>>;
  processContent(collectionId: string, content: ExtractedContent): Promise<Record<string, unknown>>;
}

export function extractContent(resource: Record<string, unknown>): ExtractedContent | null;
export function extractBundle(bundle: Record<string, unknown>): ExtractedContent[];

export function buildFHIREnrichment(result: Record<string, unknown>, extractedContent: ExtractedContent): FHIREnrichment;
export function mergeEnrichment(resource: Record<string, unknown>, enrichment: FHIREnrichment): Record<string, unknown>;
export function stripEnrichment(resource: Record<string, unknown>): Record<string, unknown>;

export const SUPPORTED_RESOURCE_TYPES: string[];

declare const _default: {
  createEnricher: typeof createEnricher;
};

export default _default;
`

writeFileSync(join(distDir, 'index.d.ts'), dtsContent)
console.log('  Generated index.d.ts')

console.log('\\nBuild complete!')
