/**
 * Build script for @mixpeek/llamaindex
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building @mixpeek/llamaindex...');

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

const cjsContent = `'use strict';
let modulePromise = null;
function getModule() { if (!modulePromise) modulePromise = import('./index.js'); return modulePromise; }
module.exports = {
  async createMixpeekReader(config) { const mod = await getModule(); return new mod.MixpeekReader(config); },
  getModule,
  version: '1.0.0'
};
`;

writeFileSync(join(distDir, 'index.cjs'), cjsContent);
console.log('  Created CommonJS wrapper dist/index.cjs');

const dtsContent = `/**
 * @mixpeek/llamaindex — TypeScript declarations
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

export declare class MixpeekReader {
  constructor(config: ConnectorConfig);
  loadData(...args: any[]): any;
  lazyLoadData(...args: any[]): any;
  setCollection(...args: any[]): any;
  setFilters(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class MixpeekRetriever {
  constructor(config: ConnectorConfig);
  retrieve(...args: any[]): any;
  aretrieve(...args: any[]): any;
  configure(...args: any[]): any;
  setNamespace(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class MixpeekToolSpec {
  constructor(config: ConnectorConfig);
  getTools(...args: any[]): any;
  search(...args: any[]): any;
  enrich(...args: any[]): any;
  getToolMetadata(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare function createMixpeekReader(config: ConnectorConfig): MixpeekReader;
export declare function createMixpeekRetriever(config: ConnectorConfig): MixpeekRetriever;
export declare function createMixpeekToolSpec(config: ConnectorConfig): MixpeekToolSpec;

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
`;

writeFileSync(join(distDir, 'index.d.ts'), dtsContent);
console.log('  Created TypeScript declarations dist/index.d.ts');

console.log('Build complete!');
