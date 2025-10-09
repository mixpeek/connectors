# Analytics & Benchmarking Framework

> 📁 **Internal Document** - Platform analytics + formal IR evaluation

---

## 🎯 Overview

This document covers two complementary approaches to measuring retrieval system performance:

### 1. **Operational Analytics** (Real-Time)
- Measure system behavior in production
- Track retriever interactions, latency, cache performance
- Use implicit signals (clicks, dwell time, refinements)
- Continuous monitoring

### 2. **Formal Benchmarking** (Evaluation)
- Measure retrieval quality against ground truth
- Standard IR metrics (Precision, Recall, F1, MAP, NDCG, MRR)
- Require explicit relevance judgments
- Periodic evaluation

**Both are needed:** Analytics for monitoring, benchmarking for optimization.

---

# Part 1: Operational Analytics

## 📊 Critical Analytics (Real-Time Production Metrics)

### 1. Retriever Performance Metrics

**Why Valuable:** Monitor production performance, detect issues

```javascript
GET /v1/analytics/retrievers
{
  "period": "last_30_days",
  "by_retriever": {
    "semantic_search": {
      "total_queries": 123456,
      "avg_latency_ms": 45,
      "p95_latency_ms": 89,
      "avg_results_returned": 12.3,
      
      // Result position metrics
      "avg_first_interaction_position": 2.4,  // Users typically click 2nd-3rd result
      "results_with_interaction": 0.87,        // 87% of queries had ≥1 interaction
      "avg_results_viewed": 5.2,
      
      // Quality signals
      "zero_result_queries": 234,              // Queries with no results
      "zero_result_rate": 0.002,
      "low_confidence_results": 1234,          // Results <0.5 confidence
      
      // Re-ranking effectiveness
      "rerank_improvement_score": 0.23         // How much reranking improved results
    }
  }
}
```

**Actionable Insights:**
- High first interaction position → ranking needs optimization
- High zero-result rate → index coverage gap
- Low rerank improvement → reranking not helping

---

### 2. Retriever Interaction Signals

**Why Valuable:** Understand user behavior, train ranking models

```javascript
GET /v1/analytics/interactions
{
  "period": "last_30_days",
  "interaction_patterns": {
    // Click patterns
    "result_clicks_by_position": {
      "position_1": 45678,
      "position_2": 23456,
      "position_3": 12345,
      "position_4": 6789,
      "position_5": 3456
      // CTR drops off by position
    },
    
    // Engagement depth
    "single_result_queries": 0.34,      // Only viewed 1 result
    "multi_result_queries": 0.66,       // Viewed multiple results
    "avg_results_per_query": 3.4,
    
    // Refinement behavior
    "queries_with_refinement": 0.12,    // 12% refined their query
    "avg_refinements_per_query": 1.3,
    
    // Feedback signals (if available)
    "explicit_feedback": {
      "thumbs_up": 12345,
      "thumbs_down": 456,
      "positive_rate": 0.96
    }
  },
  
  // Dwell time on results
  "dwell_time_distribution": {
    "<1s": 0.15,    // Bounced quickly
    "1-5s": 0.25,
    "5-15s": 0.35,
    "15-60s": 0.20,
    ">60s": 0.05    // Deep engagement
  }
}
```

**Actionable Insights:**
- High position-1 clicks → good ranking
- High refinement rate → initial results not relevant
- Short dwell time → poor result quality
- Use interaction data for re-ranking model training

---

### 3. Embedding Quality Metrics

**Why Valuable:** Monitor model performance, detect drift

```javascript
GET /v1/analytics/embeddings
{
  "period": "last_30_days",
  "embedding_stats": {
    // Generation performance
    "total_embeddings_created": 234567,
    "avg_generation_time_ms": 23,
    "p95_generation_time_ms": 45,
    
    // Vector space characteristics
    "avg_vector_norm": 0.87,
    "norm_std_dev": 0.12,
    "avg_cosine_similarity": 0.34,      // Avg similarity between random pairs
    
    // Clustering quality
    "silhouette_score": 0.67,            // Higher = better defined clusters
    "avg_cluster_size": 145,
    "num_clusters": 234,
    
    // Diversity metrics
    "avg_pairwise_distance": 0.76,       // Higher = more diverse
    "coverage_in_vector_space": 0.89     // How well corpus covers space
  },
  
  // Model drift detection
  "drift_indicators": {
    "embedding_distribution_shift": 0.05,  // KL divergence from baseline
    "avg_confidence_drift": -0.02,         // Confidence dropping over time?
    "cluster_stability": 0.94              // Are clusters stable?
  }
}
```

**Actionable Insights:**
- High distribution shift → model drift, need retraining
- Low silhouette score → embeddings not well-separated
- Dropping confidence → data distribution changed

---

### 4. Feature Extractor Performance

**Why Valuable:** Optimize model selection, detect issues

```javascript
GET /v1/analytics/feature-extractors
{
  "period": "last_30_days",
  "by_extractor": {
    "taxonomy": {
      "total_extractions": 123456,
      "avg_latency_ms": 234,
      "success_rate": 0.987,
      
      // Confidence distribution
      "confidence_distribution": {
        "high (>0.8)": 0.67,
        "medium (0.5-0.8)": 0.25,
        "low (<0.5)": 0.08
      },
      
      // Output characteristics
      "avg_features_per_doc": 4.3,
      "max_features_per_doc": 12,
      "zero_feature_docs": 234,           // Docs with no features extracted
      
      // Feature diversity
      "unique_features_extracted": 1234,
      "feature_frequency_entropy": 3.45,  // Higher = more diverse
      
      // Correlation with other extractors
      "correlation_with_keywords": 0.76,
      "correlation_with_sentiment": 0.34
    }
  },
  
  // Cross-extractor insights
  "extractor_combinations": {
    "taxonomy_plus_keywords": {
      "frequency": 89012,
      "avg_combined_latency_ms": 345,
      "correlation_score": 0.82
    }
  }
}
```

**Actionable Insights:**
- High zero-feature rate → extractor failing on content type
- Low confidence → model needs retraining
- High correlation → redundant extractors?

---

### 5. Query Pattern Analysis

**Why Valuable:** Optimize indexing, pre-compute popular queries

```javascript
GET /v1/analytics/query-patterns
{
  "period": "last_30_days",
  
  // Query frequency
  "top_queries": [
    {
      "query_hash": "abc123",
      "query_text": "machine learning tutorials",  // If not PII
      "frequency": 12345,
      "avg_latency_ms": 45,
      "avg_results": 23,
      "cache_hit_rate": 0.89
    }
    // ... more
  ],
  
  // Query clustering
  "query_clusters": [
    {
      "cluster_id": "tech_queries",
      "size": 45678,
      "representative_query": "python tutorial",
      "avg_results": 34,
      "common_filters": ["language:python"]
    }
  ],
  
  // Query characteristics
  "query_stats": {
    "avg_query_length_tokens": 4.5,
    "avg_filters_per_query": 1.2,
    "multimodal_queries": 0.23,        // 23% include image/video
    "text_only_queries": 0.77
  },
  
  // Temporal patterns
  "query_volume_by_hour": {
    "00": 1234,
    "01": 890,
    // ... peak hours
    "14": 5678,
    "15": 6789
  }
}
```

**Actionable Insights:**
- Cache popular queries
- Pre-compute results for common query clusters
- Optimize for peak hours
- Identify query patterns for indexing strategy

---

### 6. Collection Health Metrics

**Why Valuable:** Monitor data quality, optimize storage

```javascript
GET /v1/analytics/collections/{collection_id}
{
  "period": "last_30_days",
  "collection_health": {
    // Size & growth
    "total_documents": 1234567,
    "documents_added": 45678,
    "documents_deleted": 1234,
    "growth_rate": 0.037,              // 3.7% growth
    
    // Index health
    "index_size_gb": 123.4,
    "avg_doc_size_kb": 102.3,
    "index_fragmentation": 0.12,       // Lower is better
    
    // Freshness
    "avg_doc_age_days": 45,
    "docs_updated_last_7d": 12345,
    "update_frequency_per_doc": 0.23,  // Avg updates per doc
    
    // Coverage
    "docs_with_all_features": 0.89,    // 89% have all extractors run
    "docs_with_embeddings": 0.95,
    "docs_missing_features": 6789,
    
    // Quality indicators
    "avg_feature_confidence": 0.84,
    "low_quality_docs": 234,           // Docs with all low confidence
    "duplicate_content_detected": 123
  }
}
```

**Actionable Insights:**
- High fragmentation → needs index rebuild
- Low coverage → some docs not fully processed
- Duplicate detection → dedupe needed

---

### 7. Model Confidence & Calibration

**Why Valuable:** Trust model predictions

```javascript
GET /v1/analytics/model-confidence
{
  "period": "last_30_days",
  "by_model": {
    "taxonomy_classifier": {
      // Confidence distribution
      "confidence_distribution": {
        "0.0-0.1": 234,
        "0.1-0.2": 456,
        // ...
        "0.9-1.0": 23456
      },
      
      // Calibration (if validation data available)
      "calibration_error": 0.05,       // Lower is better
      "over_confidence_rate": 0.12,    // Model too confident
      "under_confidence_rate": 0.08,
      
      // Prediction characteristics
      "avg_confidence": 0.84,
      "std_confidence": 0.15,
      "entropy": 2.34,                 // Prediction uncertainty
      
      // Drift detection
      "confidence_drift_7d": -0.02,    // Confidence dropping?
      "prediction_drift_7d": 0.03      // Distribution changing?
    }
  }
}
```

**Actionable Insights:**
- High calibration error → model confidence unreliable
- Confidence drift → data distribution changing
- Filter low-confidence predictions

---

### 8. Reranking Effectiveness

**Why Valuable:** Measure reranking impact

```javascript
GET /v1/analytics/reranking
{
  "period": "last_30_days",
  "reranking_stats": {
    // Overall impact
    "queries_reranked": 45678,
    "avg_position_change": 2.3,        // Avg positions moved
    "avg_top_result_change": 0.45,     // How often #1 changed
    
    // Quality improvement
    "click_rate_before_rerank": 0.76,
    "click_rate_after_rerank": 0.89,
    "improvement_pct": 17.1,
    
    // Interaction improvement
    "avg_click_position_before": 3.2,
    "avg_click_position_after": 2.1,
    "position_improvement": 1.1,
    
    // Reranking latency
    "avg_rerank_latency_ms": 23,
    "p95_rerank_latency_ms": 45
  },
  
  // Reranking factors
  "rerank_factor_importance": {
    "semantic_similarity": 0.45,
    "freshness": 0.20,
    "popularity": 0.15,
    "diversity": 0.10,
    "user_feedback": 0.10
  }
}
```

**Actionable Insights:**
- Low improvement → reranking not helping
- High latency → optimize reranker
- Factor importance → tune reranking weights

---

### 9. Cache Effectiveness

**Why Valuable:** Optimize caching strategy

```javascript
GET /v1/analytics/cache
{
  "period": "last_30_days",
  "cache_metrics": {
    // Overall performance
    "hit_rate": 0.76,
    "hits": 938271,
    "misses": 296296,
    
    // Latency impact
    "avg_latency_hit_ms": 12,
    "avg_latency_miss_ms": 456,
    "latency_improvement": 37.3,       // 37× faster on hits
    
    // Cache by content type
    "by_content_type": {
      "text": {
        "hit_rate": 0.82,
        "avg_ttl_used": 3600
      },
      "embeddings": {
        "hit_rate": 0.91,
        "avg_ttl_used": 86400
      },
      "retriever_results": {
        "hit_rate": 0.65,
        "avg_ttl_used": 1800
      }
    },
    
    // Cache efficiency
    "eviction_rate": 0.05,
    "avg_entry_age": 3456,             // Seconds
    "hot_entries": 12345,              // Frequently accessed
    "cold_entries": 6789               // Rarely accessed
  }
}
```

**Actionable Insights:**
- Low hit rate → increase TTL or cache size
- High eviction rate → cache too small
- Different TTL by content type

---

### 10. Cross-Modal Retrieval Performance

**Why Valuable:** Measure multimodal effectiveness

```javascript
GET /v1/analytics/multimodal
{
  "period": "last_30_days",
  "cross_modal_stats": {
    // Text → Image
    "text_to_image_queries": 12345,
    "avg_similarity_score": 0.67,
    "interaction_rate": 0.78,
    
    // Image → Text
    "image_to_text_queries": 6789,
    "avg_similarity_score": 0.71,
    "interaction_rate": 0.82,
    
    // Video → Text
    "video_to_text_queries": 3456,
    "avg_frame_relevance": 0.69
  }
}
```

---

### 11. Feature Correlation Analysis

**Why Valuable:** Identify redundant features

```javascript
GET /v1/analytics/feature-correlation
{
  "correlation_matrix": {
    "taxonomy": {
      "keywords": 0.76,       // High correlation
      "sentiment": 0.23,
      "embeddings": 0.45
    },
    "keywords": {
      "sentiment": 0.34,
      "embeddings": 0.67
    }
  },
  "redundancy_score": 0.34,   // How much overlap
  "optimization_recommendation": "Consider removing keywords if taxonomy is present"
}
```

---

### 12. User Feedback Loop

**Why Valuable:** Improve models with feedback

```javascript
GET /v1/analytics/feedback
{
  "period": "last_30_days",
  "feedback_stats": {
    // Explicit feedback
    "total_feedback_events": 12345,
    "positive_feedback": 11234,
    "negative_feedback": 1111,
    "positive_rate": 0.91,
    
    // Implicit feedback
    "clicks": 123456,
    "skips": 23456,
    "refinements": 12345,
    
    // Feedback quality
    "feedback_with_context": 0.87,   // Has query context
    "feedback_with_reason": 0.23     // User provided reason
  },
  
  // Use for training
  "feedback_for_training": {
    "labeled_pairs": 10234,          // Query-document pairs
    "positive_pairs": 8901,
    "negative_pairs": 1333,
    "usable_for_training": 0.83
  }
}
```

---

# Part 2: Formal Benchmarking

## 🎯 Standard Information Retrieval Metrics

### Challenge: Need Ground Truth Data

**Three approaches to collect relevance judgments:**

1. **Explicit Annotation** (Gold standard, expensive)
2. **Implicit Feedback** (Free, noisy)
3. **Hybrid** (Best of both)

---

## 📊 Core IR Evaluation Metrics

### 1. Precision, Recall, F1 Score

**What They Measure:** Basic retrieval quality

```javascript
// Ground truth: Which documents are relevant?
{
  "query": "machine learning tutorials",
  "relevant_docs": ["doc_1", "doc_5", "doc_7", "doc_12"],  // Ground truth
  "retrieved_docs": ["doc_1", "doc_3", "doc_5", "doc_9"]   // What we returned
}

// Calculate
Precision = (relevant retrieved) / (total retrieved) = 2/4 = 0.50
Recall    = (relevant retrieved) / (total relevant)  = 2/4 = 0.50
F1        = 2 * (Precision * Recall) / (P + R)       = 0.50
```

**API Response:**
```javascript
GET /v1/benchmarks/metrics?query_id=q123
{
  "query_id": "q123",
  "metrics": {
    // Binary relevance
    "precision": 0.50,
    "recall": 0.50,
    "f1_score": 0.50,
    
    // At different cutoffs
    "precision_at_5": 0.40,
    "recall_at_5": 0.50,
    "f1_at_5": 0.44,
    
    "precision_at_10": 0.30,
    "recall_at_10": 0.75,
    "f1_at_10": 0.43
  }
}
```

---

### 2. Mean Average Precision (MAP)

**What It Measures:** Quality across all ranks (rewards relevant docs at top)

```javascript
GET /v1/benchmarks/aggregate
{
  "test_collection": "benchmark_v1",
  "num_queries": 100,
  "metrics": {
    "map": 0.753,                    // Mean Average Precision
    "map_at_5": 0.812,
    "map_at_10": 0.789,
    
    "ap_distribution": {
      "min": 0.12,
      "median": 0.78,
      "max": 0.98
    }
  }
}
```

---

### 3. Normalized Discounted Cumulative Gain (NDCG)

**What It Measures:** Graded relevance (accounts for position and relevance degree)

```javascript
// Supports multi-level relevance (0=not, 1=somewhat, 2=relevant, 3=highly)
{
  "query": "machine learning tutorials",
  "results": [
    {"doc_id": "doc_1", "score": 0.95, "relevance": 3},  // Highly relevant
    {"doc_id": "doc_3", "score": 0.87, "relevance": 1},  // Somewhat
    {"doc_id": "doc_5", "score": 0.82, "relevance": 2},  // Relevant
    {"doc_id": "doc_9", "score": 0.76, "relevance": 0}   // Not relevant
  ]
}
```

**API Response:**
```javascript
GET /v1/benchmarks/metrics?query_id=q123
{
  "metrics": {
    "ndcg": 0.876,
    "ndcg_at_5": 0.912,
    "ndcg_at_10": 0.887,
    "ndcg_at_20": 0.876
  }
}
```

---

### 4. Mean Reciprocal Rank (MRR)

**What It Measures:** Position of first relevant result

```javascript
// Query 1: First relevant at position 2 → RR = 1/2 = 0.50
// Query 2: First relevant at position 1 → RR = 1/1 = 1.00
// Query 3: First relevant at position 4 → RR = 1/4 = 0.25

MRR = (0.50 + 1.00 + 0.25) / 3 = 0.583
```

**API Response:**
```javascript
GET /v1/benchmarks/aggregate
{
  "metrics": {
    "mrr": 0.583,
    "mrr_at_10": 0.623,
    
    "rr_distribution": {
      "position_1": 0.34,        // 34% had relevant at #1
      "position_2": 0.23,
      "position_3_10": 0.33,
      "no_relevant": 0.10        // 10% had none in top-10
    }
  }
}
```

---

### 5. Hit Rate (Success@K)

**What It Measures:** % of queries with at least one relevant result in top-K

```javascript
GET /v1/benchmarks/aggregate
{
  "metrics": {
    "hit_rate_at_1": 0.42,
    "hit_rate_at_5": 0.78,
    "hit_rate_at_10": 0.87,
    "hit_rate_at_20": 0.93
  }
}
```

---

## 🏗️ Ground Truth Infrastructure

### 1. Explicit Annotation (Gold Standard)

```javascript
POST /v1/benchmarks/test-collections
{
  "name": "benchmark_v1",
  "description": "100 queries with human relevance judgments",
  "queries": [
    {
      "query_id": "q1",
      "query_text": "machine learning tutorials",
      "relevance_judgments": [
        {"doc_id": "doc_1", "relevance": 3},  // 0-3 scale
        {"doc_id": "doc_5", "relevance": 2},
        {"doc_id": "doc_7", "relevance": 3},
        {"doc_id": "doc_12", "relevance": 1}
      ]
    }
    // ... more queries
  ]
}
```

**Collection Methods:**
- Manual annotation (expensive but accurate)
- Expert judgments
- Crowdsourcing (Amazon MTurk)
- Internal team review

**Annotation Interface:**
```javascript
GET /v1/benchmarks/annotate?query_id=q1
// Returns: Query + candidate docs for rating
// User rates: 0=not relevant, 1=somewhat, 2=relevant, 3=highly relevant
```

---

### 2. Implicit Feedback (Pseudo Ground Truth)

```javascript
// Use interaction signals as proxy for relevance
POST /v1/benchmarks/implicit-labels
{
  "strategy": "clicks_and_dwell_time",
  "rules": {
    // Positive signals
    "relevant_if": {
      "clicked": true,
      "dwell_time_seconds": ">= 10",
      "no_refinement": true
    },
    
    // Negative signals
    "not_relevant_if": {
      "skipped": true,
      "immediate_refinement": true,
      "bounce_rate": "> 0.8"
    }
  },
  
  "lookback_days": 30,
  "min_interactions": 5  // Need 5+ data points
}
```

**Pros:** Free, scales automatically, real user behavior  
**Cons:** Noisy, position bias, missing negatives

---

### 3. Hybrid Approach (Recommended)

```javascript
POST /v1/benchmarks/hybrid-labels
{
  "strategy": "implicit_then_validate",
  
  // Step 1: Generate candidates from implicit feedback
  "implicit_config": {
    "lookback_days": 90,
    "min_interactions": 10
  },
  
  // Step 2: Validate subset with human annotation
  "validation_config": {
    "sample_size": 100,
    "sample_strategy": "stratified",
    "annotators_per_query": 3
  },
  
  // Step 3: Calibrate implicit signals
  "calibration_config": {
    "adjust_weights": true,
    "confidence_threshold": 0.7
  }
}
```

---

## 🧪 Benchmarking API Design

### Run Benchmark Evaluation

```javascript
POST /v1/benchmarks/evaluate
{
  "test_collection_id": "benchmark_v1",
  "retriever_config": {
    "retriever_id": "semantic_search_v2",
    "embedding_model": "mixpeek-embed-v1",
    "rerank": true,
    "top_k": 20
  },
  "metrics": [
    "precision", "recall", "f1",
    "map", "map_at_10",
    "ndcg", "ndcg_at_10",
    "mrr", "mrr_at_10",
    "hit_rate_at_10"
  ]
}

// Response
{
  "benchmark_run_id": "run_abc123",
  "status": "completed",
  "num_queries": 100,
  
  "results": {
    // Aggregate metrics
    "precision_at_10": 0.678,
    "recall_at_10": 0.812,
    "f1_at_10": 0.738,
    "map": 0.753,
    "map_at_10": 0.789,
    "ndcg": 0.876,
    "ndcg_at_10": 0.887,
    "mrr": 0.823,
    "hit_rate_at_10": 0.93,
    
    // Performance
    "avg_query_time_ms": 45,
    "p95_query_time_ms": 89
  }
}
```

---

### Compare Multiple Retrievers

```javascript
POST /v1/benchmarks/compare
{
  "test_collection_id": "benchmark_v1",
  "retrievers": [
    {
      "name": "baseline",
      "retriever_id": "keyword_search"
    },
    {
      "name": "semantic_v2",
      "retriever_id": "semantic_search_v2"
    },
    {
      "name": "hybrid",
      "retriever_id": "hybrid_search",
      "config": {
        "keyword_weight": 0.3,
        "semantic_weight": 0.7
      }
    }
  ],
  "metrics": ["map_at_10", "ndcg_at_10", "mrr"]
}

// Response
{
  "comparison_id": "cmp_xyz789",
  "results": {
    "by_retriever": {
      "baseline": {
        "map_at_10": 0.567,
        "ndcg_at_10": 0.678,
        "mrr": 0.623
      },
      "semantic_v2": {
        "map_at_10": 0.789,
        "ndcg_at_10": 0.887,
        "mrr": 0.823
      },
      "hybrid": {
        "map_at_10": 0.834,
        "ndcg_at_10": 0.901,
        "mrr": 0.856
      }
    },
    
    // Statistical significance
    "significance_tests": {
      "hybrid_vs_semantic_v2": {
        "map_improvement": 0.045,
        "p_value": 0.021,
        "significant": true
      }
    },
    
    "best_retriever": "hybrid"
  }
}
```

---

### Query-Level Analysis

```javascript
GET /v1/benchmarks/runs/{run_id}/queries/{query_id}
{
  "query_id": "q1",
  "query_text": "machine learning tutorials",
  
  // What was retrieved
  "retrieved_docs": [
    {
      "doc_id": "doc_1",
      "rank": 1,
      "score": 0.95,
      "relevant": true,
      "relevance_label": 3
    },
    {
      "doc_id": "doc_3",
      "rank": 2,
      "score": 0.87,
      "relevant": false,
      "relevance_label": 0
    }
    // ... more
  ],
  
  // What was missed
  "missed_relevant_docs": [
    {
      "doc_id": "doc_45",
      "relevance_label": 2,
      "why_missed": "Low semantic similarity",
      "score": 0.34,
      "rank": 234
    }
  ],
  
  // Metrics
  "metrics": {
    "precision_at_10": 0.70,
    "recall_at_10": 0.88,
    "f1_at_10": 0.78,
    "ap": 0.83,
    "ndcg_at_10": 0.91
  }
}
```

---

## 📈 Leaderboard & Experiment Tracking

### Model Leaderboard

```javascript
GET /v1/benchmarks/leaderboard?test_collection=benchmark_v1
{
  "test_collection": "benchmark_v1",
  "updated_at": "2024-01-15T10:30:00Z",
  
  "rankings": [
    {
      "rank": 1,
      "model_name": "hybrid_v3",
      "map_at_10": 0.834,
      "ndcg_at_10": 0.901,
      "mrr": 0.856,
      "submitted_at": "2024-01-10"
    },
    {
      "rank": 2,
      "model_name": "semantic_v2",
      "map_at_10": 0.789,
      "ndcg_at_10": 0.887,
      "mrr": 0.823,
      "submitted_at": "2024-01-05"
    }
  ]
}
```

---

### Experiment Tracking

```javascript
POST /v1/benchmarks/experiments
{
  "experiment_name": "test_reranking_weights",
  "variants": [
    {
      "name": "control",
      "config": {
        "semantic_weight": 0.7,
        "freshness_weight": 0.2,
        "popularity_weight": 0.1
      }
    },
    {
      "name": "variant_a",
      "config": {
        "semantic_weight": 0.8,
        "freshness_weight": 0.1,
        "popularity_weight": 0.1
      }
    }
  ],
  "test_collection_id": "benchmark_v1"
}

// Response
{
  "experiment_id": "exp_123",
  "results": {
    "control": {
      "map_at_10": 0.789,
      "ndcg_at_10": 0.887
    },
    "variant_a": {
      "map_at_10": 0.812,
      "ndcg_at_10": 0.903,
      "improvement_vs_control": {
        "map_at_10": "+2.9%",
        "p_value": 0.034,
        "significant": true
      }
    }
  },
  "recommendation": "Deploy variant_a"
}
```

---

## 🔄 Integration: Analytics ↔ Benchmarking

### Combine Operational + Evaluation Metrics

```javascript
GET /v1/analytics/retrieval-quality-combined
{
  "period": "last_30_days",
  
  // Real-time quality (implicit feedback)
  "operational_metrics": {
    "avg_click_position": 2.3,
    "results_with_clicks": 0.87,
    "avg_dwell_time_seconds": 34.5,
    "refinement_rate": 0.12,
    "mrr_from_clicks": 0.812       // MRR based on clicks
  },
  
  // Formal benchmarks (ground truth)
  "benchmark_metrics": {
    "last_run": "2024-01-10",
    "test_collection": "benchmark_v1",
    "precision_at_10": 0.678,
    "recall_at_10": 0.812,
    "f1_at_10": 0.738,
    "map_at_10": 0.789,
    "ndcg_at_10": 0.887,
    "mrr": 0.823
  },
  
  // How well do they correlate?
  "correlation": {
    "clicks_vs_relevance": 0.78,      // Clicks predict relevance
    "dwell_time_vs_relevance": 0.82,
    "refinement_vs_relevance": -0.65,  // Refinement = bad results
    
    "recommendation": "Clicks and dwell time are good proxies for relevance"
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Operational Analytics (Week 1-2)
1. ✅ API usage & performance
2. ✅ Retriever interactions (clicks, dwell time)
3. ✅ Feature extractor stats
4. ✅ Cache performance
5. ✅ Query patterns

**Outcome:** Real-time production monitoring

---

### Phase 2: Ground Truth Collection (Week 3-4)
6. ✅ Test collection infrastructure
7. ✅ Annotation interface
8. ✅ Implicit feedback labeling
9. ✅ Create initial benchmark dataset (100 queries)

**Outcome:** First benchmark dataset

---

### Phase 3: Formal Benchmarking (Week 5-6)
10. ✅ Implement Precision, Recall, F1
11. ✅ Implement MAP, NDCG, MRR
12. ✅ Per-query analysis
13. ✅ Multi-retriever comparison

**Outcome:** Formal evaluation capability

---

### Phase 4: Advanced Features (Week 7-8)
14. ✅ Leaderboard
15. ✅ Experiment tracking
16. ✅ Statistical significance testing
17. ✅ Automated A/B testing

**Outcome:** Complete benchmarking platform

---

## 📊 Key Principles

### Industry Agnostic ✅
- Retriever interactions (not business metrics)
- Embedding quality (not revenue)
- Model confidence (not ROI)
- IR metrics (not domain-specific KPIs)

### Two-Tier Approach ✅
- **Operational:** Continuous, real-time, implicit signals
- **Evaluation:** Periodic, formal, ground truth

### Actionable ✅
- Every metric → optimization opportunity
- Drift detection → trigger retraining
- Low scores → investigate and fix
- A/B testing → data-driven decisions

### Privacy-Preserving ✅
- Query hashing (no PII)
- Aggregated metrics
- Anonymous interactions
- No user tracking

---

## 🎯 Summary

### Operational Analytics Tracks:
1. Retriever performance (latency, results)
2. User interactions (clicks, dwell time, refinements)
3. Embedding quality & drift
4. Feature extractor usage
5. Cache effectiveness
6. Query patterns
7. Model confidence

### Formal Benchmarking Measures:
1. Precision, Recall, F1
2. Mean Average Precision (MAP)
3. Normalized DCG (NDCG)
4. Mean Reciprocal Rank (MRR)
5. Hit Rate
6. Statistical significance
7. Model comparison

### Together They Provide:
- **Monitoring:** Real-time system health
- **Optimization:** Data-driven improvements
- **Quality Assurance:** Formal evaluation
- **Experimentation:** A/B testing framework
- **Feedback Loop:** Continuous improvement

---

## Questions for Mixpeek Team

1. **Interaction tracking:** What signals can be captured (clicks, dwell time, refinements)?
2. **Feedback API:** Can clients send explicit feedback (thumbs up/down)?
3. **Ground truth:** Should Mixpeek provide standard benchmark datasets?
4. **Annotation UI:** Built-in interface for relevance judgments?
5. **Storage:** How long to retain analytics and benchmark data?
6. **Telemetry:** What events are already tracked?
7. **Model retraining:** Can interaction data feed back into training?
8. **Real-time:** What's feasible for analytics refresh rate?

---

*This framework provides both continuous operational monitoring AND formal quality evaluation.*

