/**
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
