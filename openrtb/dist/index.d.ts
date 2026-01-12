/**
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
