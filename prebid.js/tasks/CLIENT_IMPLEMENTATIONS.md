# Client-Side Implementations Plan

> 📁 **Internal Document** - This is an implementation plan for the development team.

---

This document outlines what we'll build **client-side** in the Prebid adapter, leveraging Mixpeek's existing infrastructure.

## ✅ Already Built

1. **Content Extraction** - Page, video, image extractors
2. **Caching Layer** - localStorage + memory cache
3. **API Client** - With retry logic and timeouts
4. **Prebid Integration** - Hooks into bid lifecycle
5. **Error Handling** - Graceful degradation

---

## 🚀 To Build (Priority Order)

### 1. IAB Taxonomy Mapper

**Why:** Until Mixpeek provides pre-built IAB taxonomy, we need to map

**Implementation:**
```javascript
// src/mapping/iabTaxonomy.js
export const IAB_TAXONOMY_MAP = {
  // Mixpeek Label → IAB Code
  'Mobile Phones': 'IAB12-6',
  'Consumer Electronics': 'IAB12',
  'Smartphones': 'IAB12-6',
  'Technology': 'IAB19',
  'Automotive': 'IAB2',
  'Electric Vehicles': 'IAB2-23',
  // ... 600+ mappings
};

export class IABTaxonomyMapper {
  map(mixpeekTaxonomies) {
    return mixpeekTaxonomies.map(tax => ({
      iab_code: IAB_TAXONOMY_MAP[tax.label] || 'IAB24', // Uncategorized
      iab_name: this.getIABName(IAB_TAXONOMY_MAP[tax.label]),
      iab_tier: this.getTier(IAB_TAXONOMY_MAP[tax.label]),
      confidence: tax.score,
      original_label: tax.label
    }));
  }
  
  getTier(iabCode) {
    return iabCode.includes('-') ? 2 : 1;
  }
  
  getIABName(iabCode) {
    // Lookup from IAB standard
    return IAB_NAMES[iabCode];
  }
}
```

**Files:**
- `src/mapping/iabTaxonomy.js` - Mapping table
- `src/mapping/iabNames.js` - IAB code → name lookup
- `src/utils/taxonomyMapper.js` - Mapper class

**Maintenance:** Update when IAB releases new taxonomy versions

---

### 2. Brand Safety Scorer (Basic)

**Why:** Until Mixpeek provides brand safety model, build rule-based

**Implementation:**
```javascript
// src/scoring/brandSafety.js
export class BrandSafetyScorer {
  score(context) {
    let score = 1.0;
    const categories = {
      adult_content: 0,
      hate_speech: 0,
      violence: 0,
      profanity: 0,
      controversial: 0,
      illegal: 0
    };
    
    // Check keywords for unsafe signals
    const unsafePatterns = {
      adult_content: ['porn', 'xxx', 'adult', 'sex'],
      hate_speech: ['hate', 'racist', 'discrimination'],
      violence: ['violence', 'murder', 'assault', 'weapon'],
      profanity: ['fuck', 'shit', 'damn'],
      illegal: ['drugs', 'illegal', 'piracy']
    };
    
    context.keywords.forEach(keyword => {
      for (const [category, patterns] of Object.entries(unsafePatterns)) {
        if (patterns.some(p => keyword.toLowerCase().includes(p))) {
          categories[category] += 0.2;
          score -= 0.1;
        }
      }
    });
    
    // Check sentiment
    if (context.sentiment === 'negative') {
      score -= 0.1;
      categories.controversial += 0.1;
    }
    
    // Check taxonomies for unsafe categories
    context.taxonomies.forEach(tax => {
      if (this.isUnsafeCategory(tax.label)) {
        score -= 0.2;
        this.categorizeUnsafe(tax.label, categories);
      }
    });
    
    return {
      overall_score: Math.max(0, Math.min(1, score)),
      categories: this.normalizeCategoriesCategories),
      garm_level: this.getGARMLevel(score),
      risks: this.identifyRisks(categories),
      suitable_for: this.getSuitability(score)
    };
  }
  
  getGARMLevel(score) {
    if (score >= 0.95) return 'floor';
    if (score >= 0.85) return 'low';
    if (score >= 0.70) return 'medium';
    return 'high';
  }
  
  getSuitability(score) {
    const suitable = [];
    if (score >= 0.95) suitable.push('family', 'conservative');
    if (score >= 0.85) suitable.push('general');
    if (score >= 0.70) suitable.push('news');
    if (score >= 0.50) suitable.push('entertainment');
    return suitable;
  }
}
```

**Note:** This is basic rule-based scoring. For production, consider:
- Integrating external service (IAS, DoubleVerify)
- Training custom model
- Using Mixpeek's brand safety feature extractor (once available)

---

### 3. OpenRTB Transformer

**Why:** DSPs expect OpenRTB 2.6 format

**Implementation:**
```javascript
// src/formats/openrtb.js
export class OpenRTBTransformer {
  transform(mixpeekContext, iabCodes, brandSafety) {
    return {
      site: {
        page: mixpeekContext.content.url,
        content: {
          title: mixpeekContext.content.title,
          language: 'en',
          data: [
            // IAB Content Taxonomy
            {
              id: 'iab_content_taxonomy',
              name: 'IAB Content Taxonomy v3.0',
              ext: {
                segtax: 6 // IAB Content Taxonomy
              },
              segment: iabCodes.map(iab => ({
                id: iab.iab_code,
                name: iab.iab_name,
                value: iab.confidence.toString()
              }))
            },
            
            // Brand Safety
            {
              id: 'brand_safety',
              name: 'Brand Safety',
              ext: {
                provider: 'mixpeek',
                score: brandSafety.overall_score,
                garm_level: brandSafety.garm_level
              }
            },
            
            // Keywords
            {
              id: 'contextual_keywords',
              name: 'Keywords',
              segment: mixpeekContext.keywords.slice(0, 10).map(k => ({
                id: k,
                name: k,
                value: '1'
              }))
            },
            
            // Sentiment
            {
              id: 'sentiment',
              name: 'Sentiment',
              ext: {
                sentiment: mixpeekContext.sentiment,
                score: this.sentimentToScore(mixpeekContext.sentiment)
              }
            }
          ]
        }
      }
    };
  }
  
  sentimentToScore(sentiment) {
    const map = { positive: 0.8, neutral: 0.5, negative: 0.2 };
    return map[sentiment] || 0.5;
  }
}
```

**Standards Compliance:**
- OpenRTB 2.6
- IAB Content Taxonomy segtax=6
- IAB Audience Taxonomy segtax=7

---

### 4. Performance Optimizer

**Why:** Achieve <100ms for cached requests, <250ms for new

**Implementation:**
```javascript
// src/optimization/performance.js
export class PerformanceOptimizer {
  constructor(config) {
    this.config = config;
    this.requestQueue = [];
    this.processing = false;
  }
  
  // Content optimization
  optimizeContent(content) {
    return {
      ...content,
      // Truncate text to reduce processing
      text: content.text?.substring(0, 10000),
      // Only send essential metadata
      metadata: this.filterMetadata(content.metadata)
    };
  }
  
  // Request deduplication
  async deduplicateRequest(cacheKey, requestFn) {
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    const promise = requestFn();
    this.pendingRequests.set(cacheKey, promise);
    
    try {
      return await promise;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  // Parallel processing
  async processBatch(items) {
    const chunks = this.chunk(items, this.config.batchSize || 5);
    const results = [];
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(item => this.processItem(item))
      );
      results.push(...chunkResults);
    }
    
    return results;
  }
  
  // Timeout management
  async withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      )
    ]);
  }
  
  // Background pre-caching
  async precacheUrls(urls) {
    this.requestQueue.push(...urls);
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, 10);
      await this.processBatch(batch);
      
      // Rate limiting
      await this.sleep(100);
    }
    
    this.processing = false;
  }
}
```

**Techniques:**
- Content truncation
- Request deduplication
- Parallel processing
- Timeout management
- Background pre-caching
- Rate limiting

---

### 5. Audience Segment Detector

**Why:** Contextual + audience hybrid targeting

**Implementation:**
```javascript
// src/segments/audienceDetector.js
export class AudienceSegmentDetector {
  detect(context, iabCodes) {
    const segments = [];
    
    // Technology Enthusiasts
    if (this.isTechContent(context, iabCodes)) {
      segments.push({
        segment_id: 'tech_enthusiasts',
        iab_audience: 'IAB13-7', // Tech Adopters
        confidence: this.calculateConfidence(context, ['technology', 'gadget']),
        signals: context.keywords.filter(k => 
          ['tech', 'gadget', 'review', 'specs'].includes(k)
        )
      });
    }
    
    // Auto Intenders
    if (this.isAutoContent(iabCodes)) {
      segments.push({
        segment_id: 'auto_intenders',
        iab_audience: 'IAB2-3', // Auto Buying & Selling
        confidence: 0.75,
        signals: ['automotive', 'car', 'vehicle']
      });
    }
    
    // Luxury Buyers
    if (this.isLuxuryContent(context)) {
      segments.push({
        segment_id: 'luxury_buyers',
        confidence: this.calculateLuxuryScore(context),
        signals: ['luxury', 'premium', 'high-end']
      });
    }
    
    // Parents
    if (this.isParentingContent(iabCodes)) {
      segments.push({
        segment_id: 'parents',
        iab_audience: 'IAB6-7', // Parenting
        confidence: 0.80
      });
    }
    
    return segments;
  }
  
  isTechContent(context, iabCodes) {
    return iabCodes.some(c => c.iab_code.startsWith('IAB12')) ||
           iabCodes.some(c => c.iab_code.startsWith('IAB19'));
  }
  
  calculateConfidence(context, keywords) {
    const matches = context.keywords.filter(k =>
      keywords.some(kw => k.toLowerCase().includes(kw))
    ).length;
    
    return Math.min(0.95, 0.5 + (matches * 0.1));
  }
}
```

**Segments:**
- Tech enthusiasts
- Auto intenders
- Luxury buyers
- Parents
- Travelers
- Home improvers
- Sports fans
- Fitness enthusiasts

---

### 6. Analytics & Monitoring

**Why:** Track performance and quality

**Implementation:**
```javascript
// src/analytics/monitor.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      cache_hits: 0,
      cache_misses: 0,
      api_calls: 0,
      errors: 0,
      latency: []
    };
  }
  
  recordRequest(latency, cached) {
    this.metrics.requests++;
    this.metrics.latency.push(latency);
    
    if (cached) {
      this.metrics.cache_hits++;
    } else {
      this.metrics.cache_misses++;
      this.metrics.api_calls++;
    }
  }
  
  recordError(error) {
    this.metrics.errors++;
    console.error('[Mixpeek] Error:', error);
  }
  
  getStats() {
    return {
      ...this.metrics,
      cache_hit_rate: this.metrics.cache_hits / this.metrics.requests,
      avg_latency: this.average(this.metrics.latency),
      p95_latency: this.percentile(this.metrics.latency, 0.95),
      error_rate: this.metrics.errors / this.metrics.requests
    };
  }
  
  // Send to analytics service
  async report() {
    const stats = this.getStats();
    
    // Send to Google Analytics
    if (window.gtag) {
      gtag('event', 'mixpeek_stats', stats);
    }
    
    // Send to custom analytics
    await fetch('/api/analytics/mixpeek', {
      method: 'POST',
      body: JSON.stringify(stats)
    });
  }
}
```

---

## 📁 Proposed File Structure

```
src/
├── modules/
│   └── mixpeekContextAdapter.js (existing)
│
├── mapping/
│   ├── iabTaxonomy.js          # 🆕 IAB mapping table
│   ├── iabNames.js              # 🆕 IAB code → name
│   └── taxonomyMapper.js        # 🆕 Mapper class
│
├── scoring/
│   └── brandSafety.js           # 🆕 Brand safety scorer
│
├── formats/
│   └── openrtb.js               # 🆕 OpenRTB transformer
│
├── optimization/
│   └── performance.js           # 🆕 Performance optimizer
│
├── segments/
│   └── audienceDetector.js      # 🆕 Audience segments
│
├── analytics/
│   └── monitor.js               # 🆕 Performance monitoring
│
└── utils/
    ├── helpers.js (existing)
    └── logger.js (existing)
```

---

## 🎯 Implementation Timeline

### Week 1: Core Mapping
- [ ] IAB taxonomy mapping table (600+ entries)
- [ ] IAB taxonomy mapper class
- [ ] Basic brand safety scorer
- [ ] Tests for mapping accuracy

### Week 2: Format & Performance
- [ ] OpenRTB transformer
- [ ] Performance optimizer
- [ ] Batch processing
- [ ] Tests for format compliance

### Week 3: Advanced Features
- [ ] Audience segment detector
- [ ] Analytics & monitoring
- [ ] Documentation
- [ ] Integration tests

### Week 4: Polish & Deploy
- [ ] End-to-end testing
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Release v1.0

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('IABTaxonomyMapper', () => {
  it('should map Mixpeek labels to IAB codes', () => {
    const mapper = new IABTaxonomyMapper();
    const result = mapper.map([
      { label: 'Mobile Phones', score: 0.92 }
    ]);
    
    expect(result[0].iab_code).toBe('IAB12-6');
    expect(result[0].iab_tier).toBe(2);
  });
});
```

### Integration Tests
```javascript
describe('Full Enrichment Flow', () => {
  it('should enrich ad units with all features', async () => {
    const context = await adapter.getContext();
    const iabCodes = iabMapper.map(context.taxonomies);
    const brandSafety = brandSafetyScorer.score(context);
    const openrtb = openrtbTransformer.transform(context, iabCodes, brandSafety);
    
    expect(openrtb.site.content.data).toHaveLength(4);
    expect(openrtb.site.content.data[0].segment[0].id).toMatch(/^IAB/);
  });
});
```

---

## 📊 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|---------------|
| IAB Mapping Accuracy | >95% | Manual validation |
| Brand Safety F1 Score | >0.80 | Against labeled dataset |
| Cache Hit Rate | >80% | Analytics tracking |
| P95 Latency (cached) | <50ms | Performance monitoring |
| P95 Latency (uncached) | <2000ms | Performance monitoring |
| Error Rate | <1% | Error tracking |

---

## 💡 Key Takeaway

**Most ad-tech features can be built client-side** on top of Mixpeek's infrastructure!

**Only waiting on Mixpeek for:**
1. Pre-built IAB Content Taxonomy v3.0 feature extractor
2. Pre-built Brand Safety model/feature extractor

**Everything else:** We can build ourselves! 🚀

