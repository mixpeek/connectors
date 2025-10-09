# GTM Implementation Review: Mixpeek Prebid RTD Module

> 📋 **Review Date:** October 8, 2025  
> 📌 **Purpose:** Validate current implementation against GTM plan and Qortex best practices

---

## Executive Summary

### ✅ What You're Doing RIGHT

1. **Correct Architectural Approach** - You've built a sell-side solution that operates in the publisher's environment
2. **Privacy-First Design** - No PII collection, content-only analysis
3. **Performance Optimization** - Sub-250ms target with caching and graceful fallbacks
4. **Comprehensive Documentation** - Excellent guides and examples
5. **Event-Driven Architecture** - Proper integration with Prebid lifecycle

### ⚠️ CRITICAL GAPS vs. GTM Plan & Best Practices

Based on your GTM plan and Qortex's implementation patterns, there are **5 critical issues** that need addressing:

---

## 1. ❌ NOT A TRUE PREBID RTD SUBMODULE

### Current State
Your implementation uses **custom event hooks** (`beforeRequestBids`) instead of following Prebid's official RTD submodule pattern.

```javascript
// Your current approach (prebidIntegration.js):
pbjs.onEvent('beforeRequestBids', async function(bidRequest) {
  const enrichedAdUnits = await adapter.enrichAdUnits(bidRequest.adUnits || [])
  // ...
})
```

### What It SHOULD Be
Prebid RTD modules must implement a **specific interface** and register as a submodule:

```javascript
// Proper RTD submodule structure (like Qortex/Rayn):
import { submodule } from '../src/hook.js';
import { getGlobal } from '../src/prebidGlobal.js';

export const mixpeekSubmodule = {
  name: 'mixpeek',
  
  /**
   * Initialize the module
   * @param {Object} config
   * @param {Object} userConsent
   * @return {boolean}
   */
  init: function(config, userConsent) {
    // Initialize your adapter
    return true;
  },

  /**
   * Get real-time data and append to bid request
   * @param {Object} reqBidsConfigObj
   * @param {function} callback
   * @param {Object} config
   * @param {Object} userConsent
   */
  getBidRequestData: function(reqBidsConfigObj, callback, config, userConsent) {
    // This is the key method that enriches bid requests
    // Must call callback() when done
  },

  /**
   * Get targeting data (optional)
   * @param {Array} adUnitsCodes
   * @param {Object} config
   * @return {Object}
   */
  getTargetingData: function(adUnitsCodes, config) {
    // Return targeting key-values
  }
};

// Register with RTD module
submodule('realTimeData', mixpeekSubmodule);
```

### Why This Matters
1. **Publisher Build Process** - Publishers need to include your module when building Prebid.js
2. **Standard Configuration** - Should use `realTimeData.dataProviders` config pattern
3. **Consent Management** - Automatic integration with Prebid's consent framework
4. **Auction Delays** - Proper timing management via `auctionDelay` parameter
5. **Community Compliance** - Required for submitting to official Prebid repository

### References
- Qortex: https://github.com/prebid/Prebid.js/blob/master/modules/qortexRtdProvider.js
- Rayn: https://github.com/prebid/Prebid.js/blob/master/modules/raynRtdProvider.js
- Prebid Docs: https://docs.prebid.org/dev-docs/add-rtd-submodule.html

---

## 2. ⚠️ INCOMPLETE ORTB2 DATA STRUCTURE

### Current State
You're injecting data into `ortb2Imp.ext.data` but **NOT** into `ortb2.site.content` as mentioned in your GTM plan.

```javascript
// Current implementation (mixpeekContextAdapter.js:508-520):
adUnit.ortb2Imp.ext.data = {
  hb_mixpeek_taxonomy: "IAB12-6",
  hb_mixpeek_category: "Technology > AI",
  // ...
}
```

### What's Missing
According to your GTM plan: *"Publishers can combine first-party IDs and Mixpeek's content signals in `ortb2.site.content`"*

```javascript
// Should ALSO set global ortb2 config:
pbjs.setConfig({
  ortb2: {
    site: {
      content: {
        // IAB Content Taxonomy
        cat: ["IAB12-6"],          // IAB categories
        genre: "Technology",        // Content genre
        keywords: "AI,ML,tech",     // Content keywords
        
        // Content context
        language: "en",
        title: "Article Title",
        url: "https://...",
        
        // Brand safety
        cattax: 6,                  // IAB Tech Lab Content Taxonomy v3
        
        // Custom extensions
        ext: {
          mixpeek: {
            score: 0.94,
            brandSafety: 0.98,
            sentiment: "positive",
            embeddingId: "emb_abc123"
          }
        }
      }
    }
  }
});
```

### Why This Matters
1. **Demand Partner Expectations** - DSPs expect contextual data in `ortb2.site.content`
2. **IAB Standards** - OpenRTB 2.6 spec defines specific fields for content classification
3. **Identity Module Compatibility** - Identity modules (ID5, RampID) also use `ortb2` structure
4. **Consistent Data Location** - SSPs look for contextual signals in standardized locations

### How Qortex Does It
Qortex sets **both** impression-level (`ortb2Imp`) and site-level (`ortb2.site.content`) data:

```javascript
// Qortex sets global site context:
config.ortb2.site.content = {
  data: [{
    name: 'qortex',
    ext: {
      segtax: 504,
      cids: ['...']
    },
    segment: [
      { id: 'segment1' },
      { id: 'segment2' }
    ]
  }]
};
```

---

## 3. ⚠️ NO CONSENT MANAGEMENT INTEGRATION

### Current State
No mention of GDPR, CCPA, or user consent handling in your code.

### What's Required
Even though contextual targeting doesn't require user consent, **Prebid RTD modules must respect consent signals**:

```javascript
init: function(config, userConsent) {
  // Check consent before making API calls
  if (userConsent && userConsent.gdpr && userConsent.gdpr.gdprApplies) {
    // Ensure you're not processing PII
  }
  
  if (userConsent && userConsent.usp) {
    // Handle CCPA opt-out
  }
  
  // Initialize adapter
}
```

### Why This Matters
1. **Prebid Module Rules** - Required for community approval
2. **Publisher Trust** - Shows respect for privacy frameworks
3. **Legal Compliance** - Even content analysis should acknowledge consent state
4. **Future-Proofing** - If you ever process any user-specific data

---

## 4. ⚠️ MODULE CONFIGURATION DOESN'T FOLLOW STANDARDS

### Current State
Custom configuration at top level:

```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: '...',
    collectionId: '...'
  }
});
```

### Should Follow RTD Pattern
```javascript
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,  // Max time to wait for RTD modules
    dataProviders: [
      {
        name: 'mixpeek',
        waitForIt: true,  // Delay auction for this module
        params: {
          apiKey: 'YOUR_API_KEY',
          collectionId: 'col_...',
          endpoint: 'https://api.mixpeek.com',
          namespace: 'production',
          mode: 'auto',
          featureExtractors: ['taxonomy', 'brand-safety'],
          cacheTTL: 300,
          debug: false
        }
      }
    ]
  }
});
```

### Why This Matters
1. **Consistency** - Publishers familiar with RTD modules expect this structure
2. **Multiple Providers** - Publishers can run multiple RTD modules simultaneously
3. **Auction Timing** - `auctionDelay` and `waitForIt` provide fine-grained control
4. **Integration with Other Modules** - Works seamlessly with ID5, RampID, etc.

---

## 5. ⚠️ MISSING OFFICIAL PREBID INTEGRATION PATH

### Current State
Standalone package that publishers install separately.

### What GTM Plan Says
*"Build a stand-alone RTD module following Qortex and Rayn patterns"*

### Two Integration Paths Needed

#### Path A: Official Prebid Repository (Long-term goal)
1. Submit module to Prebid.js repository as `modules/mixpeekRtdProvider.js`
2. Follow Prebid's contribution guidelines
3. Undergo community review
4. Becomes available in Prebid.js builds

**Benefits:**
- Maximum trust and visibility
- Included in Prebid downloads
- Community support and maintenance
- Appears in official documentation

#### Path B: Standalone Module (Current approach - needs fixes)
1. Build as proper RTD submodule that registers with Prebid
2. Publishers install via npm: `@mixpeek/prebid-rtd-module`
3. Publishers include in their Prebid build
4. Module registers itself with Prebid's RTD framework

**Current Issue:** Your module doesn't properly register with Prebid's RTD framework.

---

## 6. ✅ What You're Doing Well (Keep This!)

### Excellent Practices to Maintain:

1. **Performance-First Design**
   - ✅ 250ms timeout target
   - ✅ Caching with TTL
   - ✅ Graceful fallbacks
   - ✅ Never blocks the auction

2. **Robust Error Handling**
   - ✅ Try/catch blocks
   - ✅ Graceful degradation
   - ✅ Event emissions for errors

3. **Content Extraction**
   - ✅ Multi-modal support (page, video, image)
   - ✅ Auto-detection mode
   - ✅ Comprehensive metadata extraction

4. **Developer Experience**
   - ✅ Debug logging
   - ✅ Health checks
   - ✅ Cache statistics
   - ✅ Event system for monitoring

5. **Documentation**
   - ✅ Integration guide
   - ✅ API reference
   - ✅ Examples
   - ✅ Troubleshooting guide

---

## 7. Comparison with Qortex Implementation

### Qortex's Approach (What to Emulate)

```javascript
// From qortexRtdProvider.js

export const qortexSubmodule = {
  name: 'qortex',
  
  init: function(config, userConsent) {
    // Initialize
    return true;
  },
  
  getBidRequestData: function(reqBidsConfigObj, callback, config, userConsent) {
    // 1. Extract page context
    const pageUrl = getPageUrl();
    
    // 2. Check cache
    if (cachedData) {
      applyContextualData(reqBidsConfigObj, cachedData);
      callback();
      return;
    }
    
    // 3. Call Qortex API
    ajax(endpoint, {
      success: function(response) {
        // 4. Parse response
        const segments = parseResponse(response);
        
        // 5. Inject into ortb2
        reqBidsConfigObj.ortb2Fragments = {
          global: {
            site: {
              content: {
                data: [{
                  name: 'qortex',
                  segment: segments
                }]
              }
            }
          }
        };
        
        // 6. Cache result
        cacheData(segments);
        
        // 7. Call callback to release auction
        callback();
      },
      error: function() {
        // Don't block auction on error
        callback();
      }
    });
  }
};

submodule('realTimeData', qortexSubmodule);
```

### Key Differences

| Aspect | Your Implementation | Qortex Implementation |
|--------|---------------------|----------------------|
| **Registration** | Custom event hooks | Proper RTD submodule |
| **Initialization** | `adapter.init()` | `init()` hook with consent |
| **Bid Enrichment** | `beforeRequestBids` event | `getBidRequestData()` hook |
| **Callback Pattern** | Async/await | Callback-based (required) |
| **ortb2 Injection** | Only `ortb2Imp.ext.data` | Uses `ortb2Fragments` |
| **Configuration** | Custom top-level | `realTimeData.dataProviders[]` |
| **Auction Delay** | No control | Via `auctionDelay` config |
| **Consent** | Not handled | Receives `userConsent` param |

---

## 8. Revised Implementation Plan

### Phase 1: Convert to Proper RTD Submodule (1-2 weeks)

#### Step 1: Create RTD Provider File
Create `/src/modules/mixpeekRtdProvider.js`:

```javascript
import { submodule } from '../src/hook.js';
import { ajax } from '../src/ajax.js';
import { logInfo, logError } from '../src/utils.js';
import adapter from './mixpeekContextAdapter.js';

export const mixpeekSubmodule = {
  name: 'mixpeek',
  
  init: function(config, userConsent) {
    logInfo('Initializing Mixpeek RTD module');
    
    // Initialize adapter with config
    return adapter.init(config.params || {});
  },
  
  getBidRequestData: function(reqBidsConfigObj, callback, config, userConsent) {
    // Get context from adapter
    adapter.getContext()
      .then(context => {
        if (!context) {
          callback();
          return;
        }
        
        // Inject into ortb2Fragments (global site-level data)
        if (!reqBidsConfigObj.ortb2Fragments) {
          reqBidsConfigObj.ortb2Fragments = {};
        }
        if (!reqBidsConfigObj.ortb2Fragments.global) {
          reqBidsConfigObj.ortb2Fragments.global = {};
        }
        
        // Set site.content data
        reqBidsConfigObj.ortb2Fragments.global.site = {
          content: {
            cat: context.taxonomy ? [context.taxonomy.nodeId] : [],
            genre: context.taxonomy ? context.taxonomy.label : '',
            keywords: context.keywords || '',
            ext: {
              mixpeek: {
                score: context.taxonomy?.score,
                brandSafety: context.brandSafety,
                sentiment: context.sentiment,
                embeddingId: context.embeddingId
              }
            }
          }
        };
        
        // Also enrich ad units (impression-level data)
        if (reqBidsConfigObj.adUnits) {
          adapter.enrichAdUnits(reqBidsConfigObj.adUnits);
        }
        
        callback();
      })
      .catch(error => {
        logError('Mixpeek error:', error);
        callback(); // Don't block auction
      });
  },
  
  getTargetingData: function(adUnitsCodes, config) {
    // Return targeting key-values for ad server
    const context = adapter.getContextData();
    if (!context) return {};
    
    return {
      'mixpeek_cat': context.taxonomy?.label,
      'mixpeek_score': context.taxonomy?.score,
      'mixpeek_safety': context.brandSafety
    };
  }
};

// Register with Prebid's RTD framework
submodule('realTimeData', mixpeekSubmodule);
```

#### Step 2: Update Package Structure
```
src/
  modules/
    mixpeekRtdProvider.js  ← NEW: RTD submodule
    mixpeekContextAdapter.js  ← KEEP: Core logic
  api/
    mixpeekClient.js
  ...
```

#### Step 3: Update Documentation
Change all examples to use standard RTD configuration:

```javascript
// OLD (current):
pbjs.setConfig({
  mixpeek: { ... }
});

// NEW (standard):
pbjs.setConfig({
  realTimeData: {
    auctionDelay: 250,
    dataProviders: [{
      name: 'mixpeek',
      waitForIt: true,
      params: { ... }
    }]
  }
});
```

### Phase 2: Add Consent Management (3-5 days)

```javascript
init: function(config, userConsent) {
  // Log consent state for transparency
  if (userConsent) {
    if (userConsent.gdpr && userConsent.gdpr.gdprApplies) {
      logInfo('GDPR applies, purpose consents:', userConsent.gdpr.purposeConsents);
    }
    if (userConsent.usp) {
      logInfo('USP consent string:', userConsent.usp);
    }
  }
  
  // Note: Contextual analysis doesn't require consent,
  // but we respect the consent framework
  return adapter.init(config.params || {});
}
```

### Phase 3: Enhance ortb2 Structure (3-5 days)

Implement IAB-compliant content taxonomy:

```javascript
// Map Mixpeek taxonomy to IAB categories
const IAB_MAPPING = {
  'Technology > AI': 'IAB19-11',  // Technology & Computing > Artificial Intelligence
  'Sports > Football': 'IAB17-3',  // Sports > Football
  // ... full mapping
};

function mapToIAB(mixpeekCategory) {
  return IAB_MAPPING[mixpeekCategory] || null;
}

// In getBidRequestData():
reqBidsConfigObj.ortb2Fragments.global.site.content = {
  cat: [mapToIAB(context.taxonomy.label)],  // IAB category codes
  cattax: 6,  // IAB Tech Lab Content Taxonomy v3.0
  genre: context.taxonomy.label,
  keywords: context.keywords,
  language: detectLanguage(),
  title: document.title,
  url: window.location.href,
  ext: {
    data: {
      mixpeek: {
        score: context.taxonomy.score,
        brandSafety: context.brandSafety
      }
    }
  }
};
```

### Phase 4: Testing & Validation (1 week)

1. **Test with Real Publishers**
   - Validate targeting keys reach bidders
   - Measure CPM uplift
   - Check auction latency

2. **Test with Identity Modules**
   ```javascript
   pbjs.setConfig({
     realTimeData: {
       auctionDelay: 300,
       dataProviders: [
         { name: 'id5', ... },      // Identity
         { name: 'mixpeek', ... }   // Context
       ]
     }
   });
   ```

3. **Test Consent Scenarios**
   - GDPR applies + consent granted
   - GDPR applies + consent denied
   - USP opt-out
   - No consent framework

---

## 9. GTM Plan Alignment Checklist

### Product Positioning ✅ MOSTLY ALIGNED

- ✅ **Sell-side contextual enrichment** - Architecture is correct
- ⚠️ **Complementary to identity** - Need to properly set `ortb2.site.content`
- ✅ **Empowers publishers** - Design gives publishers control
- ⚠️ **Follows Qortex/Rayn pattern** - Need to implement proper RTD submodule

### Target Customers ✅ WELL ALIGNED

- ✅ Targets mid-sized and tier-1 publishers
- ✅ Can work with SSPs running Prebid Server
- ⚠️ Need to validate identity partner compatibility

### Go-to-Market Activities

#### Module Development & Docs ⚠️ NEEDS WORK
- ⚠️ **Not following exact pattern** - Need RTD submodule structure
- ✅ **Excellent documentation** - Integration guide is comprehensive
- ✅ **Configuration examples** - Clear and detailed

#### Pilot Integrations ⏳ READY AFTER FIXES
- Can proceed after implementing proper RTD structure
- Should test alongside ID5/RampID
- Measure CPM uplift and auction latency

#### Marketing & Awareness ✅ READY
- Strong positioning vs. Qortex/Rayn
- Clear value proposition (multi-modal)
- Documentation ready for community

#### Pricing & Packaging ✅ CLEAR
- Freemium model makes sense
- Bundling with identity partners is possible

### Success Metrics ✅ WELL DEFINED

- ✅ Adoption rate tracking
- ✅ Performance uplift measurement
- ✅ Joint integration tracking
- ✅ Community engagement

---

## 10. Critical Path Forward

### Priority 1: RTD Submodule Conversion (MUST DO)
**Timeline:** 1-2 weeks  
**Effort:** Medium  
**Impact:** Critical for GTM plan

Without this, you're not truly following the Qortex/Rayn pattern mentioned in your GTM plan.

### Priority 2: ortb2.site.content Implementation (MUST DO)
**Timeline:** 3-5 days  
**Effort:** Low-Medium  
**Impact:** High for demand partner integration

Your GTM plan specifically mentions `ortb2.site.content` - this needs to be implemented.

### Priority 3: Consent Management (SHOULD DO)
**Timeline:** 3-5 days  
**Effort:** Low  
**Impact:** Required for Prebid community approval

### Priority 4: IAB Taxonomy Mapping (SHOULD DO)
**Timeline:** 1 week  
**Effort:** Medium  
**Impact:** High for DSP compatibility

Demand partners expect IAB category codes, not custom labels.

---

## 11. Specific Code Changes Required

### File 1: Create `/src/modules/mixpeekRtdProvider.js`

See "Phase 1: Create RTD Provider File" above for complete implementation.

### File 2: Update `/src/prebid/prebidIntegration.js`

**REMOVE** the current custom event hook approach and **REPLACE** with proper RTD registration.

### File 3: Update `/src/modules/mixpeekContextAdapter.js`

**ADD** method to format data for ortb2:

```javascript
/**
 * Format context data for OpenRTB 2.6
 * @param {object} context - Context data
 * @returns {object} ortb2 formatted data
 */
formatForOrtb2(context) {
  if (!context) return null;
  
  return {
    site: {
      content: {
        cat: context.taxonomy ? [this._mapToIAB(context.taxonomy.label)] : [],
        cattax: 6,  // IAB Tech Lab Content Taxonomy v3.0
        genre: context.taxonomy?.label || '',
        keywords: context.keywords || '',
        language: this._detectLanguage(),
        title: document.title,
        url: window.location.href,
        ext: {
          data: {
            mixpeek: {
              score: context.taxonomy?.score,
              brandSafety: context.brandSafety,
              sentiment: context.sentiment,
              embeddingId: context.embeddingId,
              documentId: context.documentId
            }
          }
        }
      }
    }
  };
}
```

### File 4: Update `/README.md`

**CHANGE** all configuration examples to use RTD pattern:

```diff
-pbjs.setConfig({
-  mixpeek: {
-    apiKey: 'YOUR_API_KEY',
-    collectionId: 'col_...'
-  }
-});
+pbjs.setConfig({
+  realTimeData: {
+    auctionDelay: 250,
+    dataProviders: [{
+      name: 'mixpeek',
+      waitForIt: true,
+      params: {
+        apiKey: 'YOUR_API_KEY',
+        collectionId: 'col_...'
+      }
+    }]
+  }
+});
```

---

## 12. Answers to Your GTM Questions

### "Are we doing this right?"

**Mostly yes, with critical gaps:**

✅ **Architecture:** Correct sell-side approach  
✅ **Privacy:** Content-only, no PII  
✅ **Performance:** Good optimization practices  
✅ **Documentation:** Excellent quality  

❌ **Prebid Integration:** Not following official RTD submodule pattern  
❌ **Data Structure:** Missing `ortb2.site.content` injection  
❌ **Configuration:** Not using standard `realTimeData` config  
❌ **Consent:** No consent framework integration  

### "Adhering to best practices?"

**Partially:**

✅ You're following best practices for:
- Error handling and graceful degradation
- Performance optimization
- Caching strategies
- Developer experience

❌ You're NOT following best practices for:
- Prebid RTD module structure (critical)
- OpenRTB 2.6 data placement (important)
- Configuration patterns (important)
- Consent management (required for community)

### "Following Qortex's approach?"

**Not quite:**

Your implementation is architecturally similar but technically different:
- Qortex: Proper RTD submodule with `getBidRequestData()` hook
- You: Custom event hooks and configuration

You have the **spirit** of Qortex's approach but not the **implementation pattern**.

---

## 13. Recommendations Summary

### Immediate Actions (Before GTM Launch)

1. ✅ **Convert to RTD Submodule** - Create `mixpeekRtdProvider.js` following Qortex pattern
2. ✅ **Implement ortb2.site.content** - Add global site-level context data
3. ✅ **Update Configuration Pattern** - Use `realTimeData.dataProviders[]` structure
4. ✅ **Add Consent Hooks** - Receive and log consent state
5. ✅ **Update All Documentation** - Change examples to use RTD config

### Medium-Term (First 3 Months)

1. ✅ **IAB Taxonomy Mapping** - Map Mixpeek categories to IAB codes
2. ✅ **Pilot Testing** - Test with publishers using ID5/RampID
3. ✅ **Performance Benchmarking** - Measure CPM uplift and latency
4. ✅ **Community Engagement** - Participate in Prebid discussions

### Long-Term (6-12 Months)

1. ✅ **Submit to Prebid.js Repository** - Contribute module to official repo
2. ✅ **Prebid Server Integration** - Build server-side version
3. ✅ **Bundle with Identity Partners** - Create joint offerings with ID5/RampID

---

## 14. Risk Assessment

### High Risk if NOT Fixed

- ❌ **Not recognized as standard RTD module** by publishers familiar with Prebid
- ❌ **Won't appear in Prebid documentation** or official builds
- ❌ **Demand partners may not receive data** if not in `ortb2.site.content`
- ❌ **Can't be used alongside other RTD modules** effectively

### Medium Risk

- ⚠️ **Adoption friction** due to non-standard configuration
- ⚠️ **Integration issues** with identity modules
- ⚠️ **Community skepticism** without consent framework

### Low Risk (Current Implementation Strengths)

- ✅ **Performance issues** - You've handled this well
- ✅ **Error handling** - Solid graceful degradation
- ✅ **Cache management** - Well implemented

---

## 15. Conclusion

### The Good News 🎉

You've built a **solid foundation** with:
- Correct architectural approach
- Excellent documentation
- Good performance optimization
- Strong developer experience

### The Critical Fix Needed 🔧

You need to **restructure** your Prebid integration to follow the official RTD submodule pattern. This is **not a rewrite** - your core logic (`mixpeekContextAdapter.js`) is fine. You just need to:

1. Create a new `mixpeekRtdProvider.js` file that follows Prebid's RTD interface
2. Update configuration to use `realTimeData.dataProviders[]`
3. Inject data into `ortb2.site.content` in addition to `ortb2Imp`
4. Add consent management hooks

### Timeline to Launch-Ready

- **With fixes:** 2-3 weeks to proper RTD submodule
- **Without fixes:** Risk of low adoption and integration issues

### Final Verdict

**Your GTM plan is solid, but your implementation needs to match it.**

You say you're following Qortex's approach, but technically you're not (yet). The good news is that the fixes are straightforward and your core logic doesn't need to change.

---

## 16. Next Steps

1. **Review this document** with your team
2. **Decide on timeline** for RTD submodule conversion
3. **Prioritize changes** based on launch urgency
4. **Test with pilot publishers** after fixes
5. **Iterate based on feedback**

---

## Appendix: Resources

### Prebid Documentation
- RTD Submodule Developer Guide: https://docs.prebid.org/dev-docs/add-rtd-submodule.html
- Module Rules: https://docs.prebid.org/dev-docs/module-rules.html
- OpenRTB 2.6 in Prebid: https://docs.prebid.org/features/firstPartyData.html

### Reference Implementations
- Qortex RTD Provider: https://github.com/prebid/Prebid.js/blob/master/modules/qortexRtdProvider.js
- Rayn RTD Provider: https://github.com/prebid/Prebid.js/blob/master/modules/raynRtdProvider.js
- ID5 Identity Module: https://github.com/prebid/Prebid.js/blob/master/modules/id5IdSystem.js

### OpenRTB Specifications
- OpenRTB 2.6: https://www.iab.com/wp-content/uploads/2020/09/OpenRTB_2-6_FINAL.pdf
- IAB Content Taxonomy: https://iabtechlab.com/standards/content-taxonomy/

---

**Document prepared by:** AI Review  
**For:** Mixpeek Engineering Team  
**Date:** October 8, 2025  
**Status:** Ready for Review

