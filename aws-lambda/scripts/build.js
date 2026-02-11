/**
 * Build script for @mixpeek/aws-lambda
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building @mixpeek/aws-lambda...');

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
  async createLambdaHandler(config) { const mod = await getModule(); return new mod.LambdaHandler(config); },
  getModule,
  version: '1.0.0'
};
`;

writeFileSync(join(distDir, 'index.cjs'), cjsContent);
console.log('  Created CommonJS wrapper dist/index.cjs');

const dtsContent = `/**
 * @mixpeek/aws-lambda — TypeScript declarations
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

export declare class LambdaHandler {
  constructor(config: ConnectorConfig);
  handler(...args: any[]): any;
  warmup(...args: any[]): any;
  configure(...args: any[]): any;
  getMetrics(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class EventRouter {
  constructor(config: ConnectorConfig);
  route(...args: any[]): any;
  addRoute(...args: any[]): any;
  removeRoute(...args: any[]): any;
  getRoutes(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class ResponseFormatter {
  constructor(config: ConnectorConfig);
  formatApiGateway(...args: any[]): any;
  formatProxy(...args: any[]): any;
  formatError(...args: any[]): any;
  formatBatch(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare function createLambdaHandler(config: ConnectorConfig): LambdaHandler;
export declare function createEventRouter(config: ConnectorConfig): EventRouter;
export declare function createResponseFormatter(config: ConnectorConfig): ResponseFormatter;

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
