# Feature Requests for Mixpeek API

> ⚠️ **UPDATED:** See [REVISED_GAP_ANALYSIS.md](REVISED_GAP_ANALYSIS.md) for corrected analysis.
> 
> **Key Changes:** Many items below should be built **client-side** using Mixpeek's existing infrastructure. True API needs are much smaller (2-3 pre-built models).

---

Based on Prebid contextual advertising requirements, here are prioritized feature requests for the Mixpeek API team.

## 🔴 Critical (P0)

### 1. Dedicated Contextual Classification Endpoint

**Request:**
```http
POST /v1/contextual/classify
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "url": "https://example.com/article",
  "text": "Optional: pre-extracted text",
  "video_url": "Optional: video URL",
  "image_urls": ["Optional: image URLs"],
  "options": {
    "include_iab_taxonomy": true,
    "include_brand_safety": true,
    "include_keywords": true,
    "include_sentiment": true,
    "fast_mode": true
  }
}
```

**Response:**
```json
{
  "url": "https://example.com/article",
  "iab_content_taxonomy": [
    {
      "code": "IAB12-6",
      "name": "Cell Phones",
      "tier": 2,
      "confidence": 0.92,
      "path": ["Technology & Computing", "Consumer Electronics", "Cell Phones"]
    }
  ],
  "brand_safety": {
    "score": 0.98,
    "garm_level": "floor",
    "categories": {
      "adult_content": 0.01,
      "hate_speech": 0.00,
      "violence": 0.02
    },
    "suitable_for": ["general", "family"]
  },
  "keywords": {
    "primary": ["smartphone", "5G", "technology"],
    "entities": {
      "brands": ["Apple", "Samsung"],
      "products": ["iPhone 15"]
    }
  },
  "sentiment": {
    "overall": "positive",
    "score": 0.78
  },
  "confidence": 0.94,
  "processing_time_ms": 123,
  "cache_ttl": 3600
}
```

**Why:**
- Current document API requires collection management
- Not optimized for real-time ad requests
- Response format not ad-tech friendly

**Impact:** High - Simplifies integration, reduces latency

---

### 2. IAB Content Taxonomy v3.0 Native Support

**Request:**
- Native IAB Content Taxonomy v3.0 classification
- Return standard IAB codes (e.g., "IAB12-6")
- Support both Tier 1 and Tier 2 categories
- Include taxonomy hierarchy/path

**Reference:** https://iabtechlab.com/standards/content-taxonomy/

**Current Workaround:** Manual mapping from custom labels

**Why:**
- Industry standard for content classification
- DSPs expect IAB codes
- Required for programmatic advertising

**Impact:** Critical - Required for DSP compatibility

---

### 3. Brand Safety Scoring (GARM-Compatible)

**Request:**
```json
{
  "brand_safety": {
    "overall_score": 0.98,
    "garm_level": "floor",
    "categories": {
      "adult_content": 0.01,
      "hate_speech": 0.00,
      "illegal_content": 0.00,
      "violence": 0.02,
      "profanity": 0.03,
      "controversial": 0.15
    },
    "risks": [],
    "suitable_for": ["general", "family", "conservative"]
  }
}
```

**Reference:** GARM Brand Safety Floor Framework

**Why:**
- Advertisers need brand safety validation
- Pre-bid brand safety is industry standard
- Avoid serving ads on unsafe content

**Impact:** Critical - Required by advertisers

---

### 4. Performance: <100ms Target for Fast Mode

**Request:**
- Fast mode: <100ms response time
- Cached results: <50ms
- Async processing option for complex analysis

**Current:** ~1500-3000ms for document processing

**Why:**
- Real-time bidding requires sub-100ms
- Page load performance
- User experience

**Implementation Ideas:**
- Lightweight classification model for fast mode
- Pre-computed results for popular URLs
- Edge deployment for low latency

**Impact:** Critical - Required for production scale

---

## 🟡 High Priority (P1)

### 5. URL-Based Caching with ETag Support

**Request:**
```http
GET /v1/contextual/url/{url_hash}
If-None-Match: "etag_abc123"

Response:
304 Not Modified
OR
200 OK + classifications
ETag: "etag_xyz789"
Cache-Control: public, max-age=3600
```

**Why:**
- Reduce redundant processing
- CDN-friendly
- Lower costs for high-traffic sites

**Impact:** High - Reduces API calls by 80%+

---

### 6. Batch Processing API

**Request:**
```http
POST /v1/contextual/batch
{
  "items": [
    {"url": "https://site.com/page1"},
    {"url": "https://site.com/page2", "text": "..."},
    {"url": "https://site.com/page3"}
  ],
  "options": {...}
}
```

**Why:**
- Pre-cache multiple pages
- Efficient for sitemaps
- Reduce overhead for galleries

**Impact:** High - Improves efficiency for large sites

---

### 7. Video Scene-Level Analysis

**Request:**
```json
{
  "video_analysis": {
    "overall": {
      "iab_content": ["IAB12-6"],
      "brand_safety": 0.95
    },
    "scenes": [
      {
        "start_time": 0,
        "end_time": 30,
        "iab_content": ["IAB12-6"],
        "brand_safety": 0.98,
        "description": "Product review"
      }
    ],
    "ad_breaks": [
      {"time": 15, "context": {...}},
      {"time": 45, "context": {...}}
    ]
  }
}
```

**Why:**
- Different context per ad break
- Mid-roll targeting
- Scene-level brand safety

**Impact:** High - Enables video monetization

---

### 8. OpenRTB 2.6 Native Format

**Request:**
- Return data in OpenRTB 2.6 `site.content.data` format
- Compatible with standard DSP integrations
- No custom parsing needed

**Example:**
```json
{
  "site": {
    "content": {
      "data": [
        {
          "id": "iab_content_taxonomy",
          "name": "IAB Content Taxonomy v3.0",
          "segment": [
            {"id": "IAB12-6", "value": "0.92"}
          ]
        }
      ]
    }
  }
}
```

**Impact:** High - Industry standard format

---

## 🟢 Medium Priority (P2)

### 9. Documented Rate Limits

**Request:**
- Clear rate limit documentation
- Support 1000+ requests/second for enterprise
- Rate limit headers in responses
- Burst capacity for traffic spikes

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1609459200
```

**Impact:** Medium - Required for scale planning

---

### 10. Async Processing with Webhooks

**Request:**
```http
POST /v1/contextual/classify?async=true
{
  "url": "...",
  "webhook_url": "https://publisher.com/webhook"
}

Response:
{
  "job_id": "job_abc123",
  "status": "processing",
  "estimated_time_ms": 2000
}
```

**Why:**
- Don't block on slow processing
- Pre-cache during content ingestion
- Better for large videos

**Impact:** Medium - Improves UX for slow operations

---

### 11. Audience Segment Signals

**Request:**
```json
{
  "audience_segments": [
    {
      "segment_id": "tech_enthusiasts",
      "iab_audience": "IAB13-7",
      "confidence": 0.85,
      "signals": ["technical_content", "product_reviews"]
    }
  ]
}
```

**Reference:** IAB Audience Taxonomy v1.1

**Why:**
- Contextual + audience hybrid targeting
- Privacy-compliant segments
- Better targeting precision

**Impact:** Medium - Competitive differentiator

---

### 12. Sentiment Analysis (Structured)

**Request:**
```json
{
  "sentiment": {
    "overall": "positive",
    "score": 0.78,
    "emotions": {
      "joy": 0.6,
      "excitement": 0.4,
      "trust": 0.7
    },
    "suitable_for_brands": ["luxury", "tech", "lifestyle"]
  }
}
```

**Why:**
- Avoid negative news for brand campaigns
- Match brand tone
- Emotional targeting

**Impact:** Medium - Premium feature

---

## 🔵 Low Priority (P3)

### 13. Testing Sandbox Environment

**Request:**
- `api-sandbox.mixpeek.com`
- Test API keys (no charges)
- Deterministic responses
- Sample data fixtures

**Impact:** Low - Developer experience

---

### 14. Usage Analytics Dashboard

**Request:**
- API call volume over time
- Latency metrics (p50, p95, p99)
- Error rates
- Cache hit rates
- Cost tracking

**Impact:** Low - Monitoring & optimization

---

### 15. Classification Quality Feedback

**Request:**
```http
POST /v1/contextual/feedback
{
  "job_id": "job_abc123",
  "correct": true/false,
  "correct_classifications": ["IAB12-6"],
  "comment": "..."
}
```

**Why:**
- Improve ML models
- Custom training
- Quality assurance

**Impact:** Low - Long-term improvement

---

## Implementation Priorities

### Must Have (Launch Blockers)
1. Dedicated contextual endpoint
2. IAB taxonomy support
3. Brand safety scoring
4. <100ms performance

**Without these:** Not production-ready for ad tech

### Should Have (Competitive)
5. URL caching
6. Batch processing
7. Video scene analysis
8. OpenRTB format

**Without these:** Functional but inefficient

### Nice to Have (Enhancements)
9. Rate limits documentation
10. Async processing
11. Audience segments
12. Sentiment analysis

**Without these:** Still competitive

---

## Questions for Mixpeek Product Team

1. **Timeline:** What's the roadmap for these features?
2. **Beta Access:** Can we beta test new features?
3. **Custom Development:** Open to sponsored development?
4. **Pricing:** How will new features impact pricing?
5. **Feedback:** Best way to submit detailed feedback?

---

## Current Workarounds

While waiting for API enhancements:

| Gap | Current Workaround | Impact |
|-----|-------------------|--------|
| No dedicated endpoint | Use document creation API | Slower, more complex |
| No IAB taxonomy | Manual mapping table | Maintenance overhead |
| No brand safety | External service or skip | Missing critical feature |
| Slow performance | High timeouts, aggressive cache | Poor UX |
| No batch processing | Sequential calls | Inefficient |
| No URL caching | Client-side only | Redundant processing |

---

*These feature requests are based on analysis of Prebid.js integration requirements and industry standards for contextual advertising.*

*Contact: ethan@mixpeek.com*
*Date: 2025-10-08*

