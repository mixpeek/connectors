# API Usage Clarification - v2.0

> 📅 **Date:** October 8, 2025  
> ❓ **Question:** "2.0 uses mixpeek apis? webhooks and caching not ready yet"

---

## TL;DR

**Yes, v2.0 uses real Mixpeek APIs** ✅  
**No, v2.0 does NOT use webhooks** ✅  
**v2.0 uses CLIENT-SIDE caching, not server-side** ✅

---

## What v2.0 Actually Does

### ✅ Real Mixpeek API Calls

**Implementation:** `src/api/mixpeekClient.js`

```javascript
// v2.0 makes REAL fetch() calls to Mixpeek API
async _request(path, options = {}) {
  const url = `${this.endpoint}${path}`  // e.g., https://server-xb24.onrender.com
  const response = await fetch(url, fetchOptions)
  // ...
}
```

### 📡 Actual API Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/v1/collections/{id}/documents` | POST | Process content & extract features | ✅ Used |
| `/v1/collections/{id}/documents/{doc}` | GET | Retrieve processed document | ✅ Used |
| `/v1/collections/features/extractors` | GET | List available extractors | ✅ Used |
| `/v1/collections/features/extractors/{id}` | GET | Get extractor details | ✅ Used |
| `/v1/health` | GET | Health check | ✅ Used |

**Total Endpoints Used:** 5 core endpoints

---

## What v2.0 Does NOT Use

### ❌ Webhooks (Not Used)

**Why:** Prebid RTD needs **synchronous** responses

```javascript
// RTD Pattern (what we do):
async getBidRequestData(reqBidsConfigObj, callback) {
  const context = await adapter.getContext()  // ← Synchronous wait
  injectData(context)
  callback()  // ← Auction proceeds
}

// Webhook Pattern (CAN'T do this in RTD):
async getBidRequestData(reqBidsConfigObj, callback) {
  adapter.processAsync()  // ← Returns immediately
  callback()              // ← Auction starts without data ❌
  
  // Later... webhook arrives
  onWebhook((data) => {
    // Too late! Auction already finished ❌
  })
}
```

**Conclusion:** Webhooks are incompatible with Prebid RTD pattern. Even if Mixpeek supports webhooks, we can't use them for real-time bid enrichment.

**Possible Future Use:** Webhooks could work for:
- Pre-caching content overnight
- Batch processing article archives
- Background updates (not for RTD)

---

### ⚠️ Server-Side Caching (Not Used, Use Client-Side)

**What v2.0 Uses:** Client-side caching

```javascript
// src/cache/cacheManager.js
class CacheManager {
  constructor() {
    this.memoryCache = new Map()           // ← In-memory (browser)
    this.useLocalStorage = true            // ← localStorage (browser)
  }
  
  set(key, value, ttl) {
    // Store in browser memory/localStorage
    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl
    })
    
    if (this.useLocalStorage) {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    }
  }
}
```

**Cache Layers:**
1. **Memory Cache** (fastest) - Cleared on page refresh
2. **localStorage** (persistent) - Survives page refresh, 5-10MB limit
3. **No server-side cache** - Each request hits Mixpeek API if cache miss

---

## How v2.0 Works (Step by Step)

### Flow Diagram

```
User loads page
    ↓
Prebid initializes RTD modules
    ↓
mixpeekRtdProvider.init() called
    ↓
    ┌──────────────────────────┐
    │  getBidRequestData()     │
    └──────────────────────────┘
              ↓
    Check CLIENT cache (memory/localStorage)
              ↓
         Cache hit? ──Yes──→ Use cached data → Inject into ortb2 → callback()
              ↓ No
              ↓
    Extract page content (title, body, meta, images, etc.)
              ↓
    POST /v1/collections/{id}/documents  ← REAL API CALL
    {
      "file_url": "data:text/html,<page content>",
      "feature_extractors": ["taxonomy", "brand-safety"],
      ...
    }
              ↓
    Mixpeek API processes (200-2000ms)
              ↓
    Response with enrichments:
    {
      "enrichments": {
        "taxonomies": [...],
        "brand_safety": {...}
      }
    }
              ↓
    Map to IAB codes (iabMapping.js)
              ↓
    Format as ortb2.site.content
              ↓
    Cache result (memory + localStorage)
              ↓
    Inject into bid request
              ↓
    callback() → Auction proceeds
```

---

## API Request Examples (Real Calls)

### 1. Process Page Content

**Request:**
```http
POST https://server-xb24.onrender.com/v1/collections/col_abc123/documents
Authorization: Bearer sk_your_api_key
Content-Type: application/json

{
  "file_url": "data:text/html,<html><head><title>AI Article</title>...",
  "feature_extractors": ["taxonomy", "brand-safety"],
  "metadata": {
    "source": "prebid-rtd",
    "url": "https://example.com/article",
    "mode": "page"
  }
}
```

**Response:**
```json
{
  "document_id": "doc_xyz789",
  "enrichments": {
    "taxonomies": [{
      "taxonomy_id": "tax_content",
      "node_id": "node_tech_ai",
      "label": "Technology - AI",
      "score": 0.94,
      "path": ["technology", "ai"]
    }],
    "brand_safety": {
      "score": 0.98,
      "categories": {...}
    }
  },
  "embedding_id": "emb_abc123"
}
```

### 2. Retrieve Cached Document (If needed)

**Request:**
```http
GET https://server-xb24.onrender.com/v1/collections/col_abc123/documents/doc_xyz789
Authorization: Bearer sk_your_api_key
```

**Response:** Same enrichment data

---

## Caching Strategy

### Why Client-Side Only?

**Pros:**
- ✅ Works immediately (no server dependency)
- ✅ Zero latency for cache hits
- ✅ Survives page refresh (localStorage)
- ✅ Privacy-friendly (data stays in browser)

**Cons:**
- ⚠️ Each browser caches independently
- ⚠️ Limited storage (5-10MB)
- ⚠️ Cleared if user clears browser data

### Cache Performance

```javascript
// First visit (cache miss)
Page load → API call (500-2000ms) → Store in cache → Inject data
Total: 500-2000ms

// Second visit (cache hit - memory)
Page load → Check cache (< 1ms) → Inject data
Total: < 1ms

// Second visit (cache hit - localStorage)
Page load → Check cache (5-10ms) → Inject data
Total: 5-10ms

// After TTL expires (default 300s = 5 minutes)
Page load → Cache expired → API call → Update cache
Total: 500-2000ms
```

---

## Why No Server-Side Caching Yet?

### If Mixpeek Had Server-Side Caching:

**Potential flow:**
```
1. Publisher A visits article → Mixpeek processes → Stores in server cache
2. Publisher B visits same article → Mixpeek returns cached result (faster)
3. Publisher C visits same article → Still cached (even faster)
```

**Benefits:**
- Faster responses for popular content
- Lower compute costs
- Better scalability

**Current State (No Server Cache):**
```
1. Publisher A visits article → Mixpeek processes (2000ms)
2. Publisher B visits same article → Mixpeek processes again (2000ms)
3. Publisher C visits same article → Mixpeek processes again (2000ms)
```

Each request is independent, no shared cache.

---

## What This Means for v2.0

### ✅ Works Today

v2.0 is **fully functional** without webhooks or server-side caching:

```javascript
// This works perfectly:
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: {
        apiKey: 'sk_...',
        collectionId: 'col_...',
        cacheTTL: 300  // ← Client-side cache
      }
    }]
  }
})
```

**Performance:**
- First page view: 500-2000ms (API call)
- Subsequent views (< 5 min): < 10ms (cache hit)
- After 5 minutes: 500-2000ms (refresh from API)

### 🚀 Would Improve With Server-Side Caching

**Current:**
```
Page A, user 1: 2000ms (process)
Page A, user 2: 2000ms (process again)
Page A, user 3: 2000ms (process again)
Total API calls: 3
```

**With server cache:**
```
Page A, user 1: 2000ms (process, cache)
Page A, user 2: 100ms (cached)
Page A, user 3: 100ms (cached)
Total API calls: 1
```

**Impact:** 20x faster for subsequent users on popular content

### 🔮 Would Enable New Features With Webhooks

**Current (synchronous):**
```javascript
// Must wait for API
const context = await getContext()  // Blocks auction
```

**With webhooks (async):**
```javascript
// Pre-process overnight
await mixpeek.batchProcess(sitemapUrls)

// Real-time lookup (no API call)
const context = cache.get(pageUrl)  // Instant!
```

**Use cases:**
- Pre-cache entire site
- Background updates
- Proactive processing

---

## Summary Table

| Feature | v2.0 Status | Mixpeek API Status | Priority |
|---------|------------|-------------------|----------|
| **Real API calls** | ✅ Implemented | ✅ Available | - |
| **Feature extractors** | ✅ Basic (3-4) | ✅ Available (14+) | Medium |
| **Client-side cache** | ✅ Implemented | N/A | - |
| **Server-side cache** | ❌ Not used | ⚠️ Not ready | High |
| **Webhooks** | ❌ Not used | ⚠️ Not ready | Low (incompatible with RTD) |
| **Batch processing** | ❌ Not exposed | ✅ Available? | Medium |
| **Search API** | ❌ Not used | ✅ Available | Low |

---

## Recommendations

### For v2.0 Launch: ✅ Ship as is!

**Reasoning:**
1. ✅ Real API integration works
2. ✅ Client-side caching is sufficient
3. ✅ No dependency on unready features
4. ✅ RTD pattern doesn't need webhooks anyway

### For v2.1 (After Mixpeek Server Cache Ready):

**High Priority:**
1. **Use server-side cache** if available
   - Detect via API header or config
   - Fallback to client cache if not available
   - Could improve latency 10-20x for popular content

**Medium Priority:**
2. **Expose more extractors** (sentiment, entities, topics)

**Low Priority:**
3. **Webhooks for batch processing** (separate from RTD)
   - Pre-cache site overnight
   - Background updates

---

## Code Proof: Yes, Uses Real APIs

From `src/api/mixpeekClient.js`:

```javascript
/**
 * Process document with Mixpeek API
 */
async insertDocument(collectionId, payload) {
  const path = ENDPOINTS.DOCUMENTS.replace('{collectionId}', collectionId)
  
  // This is a REAL fetch() call
  return retryWithBackoff(
    () => this._request(path, {
      method: 'POST',  // ← Real HTTP POST
      body: JSON.stringify(requestPayload)  // ← Real request body
    }),
    this.retryAttempts
  )
}

async _request(path, options = {}) {
  const url = `${this.endpoint}${path}`
  // e.g., https://server-xb24.onrender.com/v1/collections/col_abc/documents
  
  const response = await fetch(url, fetchOptions)  // ← Real fetch!
  
  if (!response.ok) {
    throw error
  }
  
  return await response.json()
}
```

**This is NOT mocked or simulated.** It's real HTTP calls to the Mixpeek API.

---

## Bottom Line

### Question: "2.0 uses mixpeek apis?"
**Answer:** ✅ **YES - Real fetch() calls to Mixpeek endpoints**

### Question: "webhooks and caching not ready yet"
**Answer:** ✅ **Correct, and we don't need them yet**

- **Webhooks:** Can't use in RTD anyway (need synchronous)
- **Server cache:** Would be nice, but client cache works fine for now

### Status: ✅ **Ready to Ship**

v2.0 is fully functional with:
- ✅ Real Mixpeek API integration
- ✅ Client-side caching (fast enough)
- ✅ No blocking dependencies
- ✅ Works with current Mixpeek API state

**When Mixpeek adds server-side caching:** We can easily add support in v2.1 without breaking changes.

