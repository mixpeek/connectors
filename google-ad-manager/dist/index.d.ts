/**
 * Mixpeek Google Ad Manager Connector
 * Type Declarations
 */

export interface MixpeekGAMConfig {
  apiKey: string
  collectionId: string
  namespace: string
  endpoint?: string
  timeout?: number
  enableCache?: boolean
  cacheTTL?: number
  shadowMode?: boolean
}

export interface ContentInput {
  url?: string
  title?: string
  text?: string
  description?: string
  language?: string
}

export interface EnrichmentResult {
  targeting: Record<string, string>
  pmpTargeting: Record<string, string>
  context: any
  yield: YieldConditions
  gptCode: string
  latencyMs: number
  cached: boolean
  shadowMode?: boolean
  error?: string
}

export interface YieldConditions {
  isPremium: boolean
  isBrandSafe: boolean
  suggestedFloorMultiplier: number
}

export interface SlotTargetingResult {
  slotId: string
  targeting: Record<string, string>
  latencyMs: number
}

export interface ValidationResult {
  valid: boolean
  issues: string[]
}

export interface CacheStats {
  size: number
  maxSize: number
  enabled: boolean
  ttlMs: number
}

export interface Enricher {
  enrich(content: ContentInput): Promise<EnrichmentResult>
  getSlotTargeting(content: ContentInput, slotId: string): Promise<SlotTargetingResult>
  recordAdImpression(adData: any): void
  getAdAdjacency(): any[]
  clearAdAdjacency(): void
  healthCheck(): Promise<any>
  clearCache(): void
  getCacheStats(): CacheStats
  validateTargeting(targeting: Record<string, string>): ValidationResult
  isShadowMode(): boolean
}

export function createEnricher(config: MixpeekGAMConfig): Enricher

export const TARGETING_KEYS: {
  IAB_V3: string
  IAB_V2: string
  SENTIMENT: string
  SUITABILITY: string
  ADJACENCY_SCORE: string
  CONTENT_DEPTH: string
  KEYWORDS: string
  CATEGORY: string
  BRAND_SAFETY: string
  CONTENT_QUALITY: string
}

export function buildTargetingKeys(result: any, options?: any): Record<string, string>
export function buildSlotTargeting(result: any, options?: any): [string, string][]
export function buildPageTargeting(result: any, options?: any): Record<string, string>
export function buildPMPTargeting(result: any): Record<string, string>
export function buildYieldConditions(result: any): YieldConditions
export function generateGPTCode(result: any, options?: any): string
export function validateTargeting(targeting: Record<string, string>): ValidationResult

export function getIABCode(label: string): string
export function getIABv3Code(label: string): string
export function getIABLabel(code: string): string
export function getIABv3Label(code: string): string

export const IAB_V2_CATEGORIES: Record<string, string>
export const IAB_V3_CATEGORIES: Record<string, string>