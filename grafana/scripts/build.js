/**
 * Build script for @mixpeek/grafana
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

console.log('Building @mixpeek/grafana...');

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
  async createPrometheusExporter(config) { const mod = await getModule(); return new mod.PrometheusExporter(config); },
  getModule,
  version: '1.0.0'
};
`;

writeFileSync(join(distDir, 'index.cjs'), cjsContent);
console.log('  Created CommonJS wrapper dist/index.cjs');

const dtsContent = `/**
 * @mixpeek/grafana — TypeScript declarations
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

export declare class PrometheusExporter {
  constructor(config: ConnectorConfig);
  register(...args: any[]): any;
  recordMetric(...args: any[]): any;
  getMetricsEndpoint(...args: any[]): any;
  reset(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class DashboardProvisioner {
  constructor(config: ConnectorConfig);
  createDashboard(...args: any[]): any;
  updateDashboard(...args: any[]): any;
  deleteDashboard(...args: any[]): any;
  exportJson(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare class AnnotationProvider {
  constructor(config: ConnectorConfig);
  createAnnotation(...args: any[]): any;
  queryAnnotations(...args: any[]): any;
  deleteAnnotation(...args: any[]): any;
  getMetrics(): MetricsResult;
  resetMetrics(): void;
  destroy(): void;
}

export declare function createPrometheusExporter(config: ConnectorConfig): PrometheusExporter;
export declare function createDashboardProvisioner(config: ConnectorConfig): DashboardProvisioner;
export declare function createAnnotationProvider(config: ConnectorConfig): AnnotationProvider;

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
