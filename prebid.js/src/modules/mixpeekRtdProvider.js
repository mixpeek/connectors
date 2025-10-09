/**
 * Mixpeek Real-Time Data (RTD) Provider for Prebid.js
 * @module modules/mixpeekRtdProvider
 * 
 * This module implements the official Prebid RTD submodule interface
 * to enrich bid requests with Mixpeek's multimodal contextual data.
 * 
 * References:
 * - Prebid RTD Module Docs: https://docs.prebid.org/dev-docs/add-rtd-submodule.html
 * - Qortex Implementation: https://github.com/prebid/Prebid.js/blob/master/modules/qortexRtdProvider.js
 * - OpenRTB 2.6 Spec: https://www.iab.com/wp-content/uploads/2020/09/OpenRTB_2-6_FINAL.pdf
 */

import adapter from './mixpeekContextAdapter.js'
import { logInfo, logWarn, logError } from '../utils/logger.js'
import { isBrowser } from '../utils/helpers.js'

/**
 * Module name (used for registration)
 */
const MODULE_NAME = 'mixpeek'

/**
 * Mixpeek RTD Submodule
 * 
 * Implements the standard Prebid RTD interface:
 * - init(): Initialize the module with configuration
 * - getBidRequestData(): Enrich bid requests with contextual data
 * - getTargetingData(): Provide targeting key-values for ad server
 */
export const mixpeekSubmodule = {
  name: MODULE_NAME,
  
  /**
   * Initialize the Mixpeek RTD module
   * 
   * @param {Object} config - Module configuration from realTimeData.dataProviders[]
   * @param {Object} config.params - Mixpeek-specific parameters
   * @param {string} config.params.apiKey - Mixpeek API key
   * @param {string} config.params.collectionId - Mixpeek collection ID
   * @param {string} [config.params.endpoint] - API endpoint
   * @param {string} [config.params.namespace] - Namespace for data isolation
   * @param {string} [config.params.mode='auto'] - Content mode (auto, page, video, image)
   * @param {Array<string>} [config.params.featureExtractors] - Feature extractors to use
   * @param {number} [config.params.timeout=250] - API timeout in ms
   * @param {number} [config.params.cacheTTL=300] - Cache TTL in seconds
   * @param {boolean} [config.params.enableCache=true] - Enable caching
   * @param {boolean} [config.params.debug=false] - Debug mode
   * @param {Object} userConsent - User consent data (GDPR, USP)
   * @param {Object} [userConsent.gdpr] - GDPR consent data
   * @param {boolean} [userConsent.gdpr.gdprApplies] - Whether GDPR applies
   * @param {Object} [userConsent.gdpr.purposeConsents] - Purpose consents
   * @param {string} [userConsent.usp] - USP consent string
   * @returns {boolean} True if initialization successful
   */
  init: function(config, userConsent) {
    logInfo(`[${MODULE_NAME}] Initializing Mixpeek RTD module`)
    
    // Validate configuration
    if (!config || !config.params) {
      logError(`[${MODULE_NAME}] Configuration is required`)
      return false
    }
    
    const params = config.params
    
    // Validate required parameters
    if (!params.apiKey) {
      logError(`[${MODULE_NAME}] apiKey is required`)
      return false
    }
    
    if (!params.collectionId) {
      logError(`[${MODULE_NAME}] collectionId is required`)
      return false
    }
    
    // Log consent state (for transparency and debugging)
    if (userConsent) {
      if (userConsent.gdpr) {
        logInfo(`[${MODULE_NAME}] GDPR applies: ${userConsent.gdpr.gdprApplies}`)
        if (userConsent.gdpr.gdprApplies && params.debug) {
          logInfo(`[${MODULE_NAME}] Purpose consents:`, userConsent.gdpr.purposeConsents)
        }
      }
      
      if (userConsent.usp) {
        logInfo(`[${MODULE_NAME}] USP consent string: ${userConsent.usp}`)
      }
    }
    
    // Note: Contextual analysis doesn't require user consent as it only
    // analyzes page content, not user behavior. However, we respect the
    // consent framework and log the state for transparency.
    
    // Initialize the adapter
    try {
      const success = adapter.init(params)
      
      if (success) {
        logInfo(`[${MODULE_NAME}] Successfully initialized`)
      } else {
        logError(`[${MODULE_NAME}] Initialization failed`)
      }
      
      return success
    } catch (error) {
      logError(`[${MODULE_NAME}] Initialization error:`, error)
      return false
    }
  },
  
  /**
   * Get real-time data and enrich bid request
   * 
   * This is the core method that:
   * 1. Extracts page/video content
   * 2. Calls Mixpeek API (with caching)
   * 3. Formats response as OpenRTB 2.6 data
   * 4. Injects into ortb2Fragments (site-level) and ortb2Imp (impression-level)
   * 5. Calls callback to release the auction
   * 
   * @param {Object} reqBidsConfigObj - Bid request configuration
   * @param {Array} reqBidsConfigObj.adUnits - Ad units for the auction
   * @param {Object} reqBidsConfigObj.ortb2Fragments - ortb2 data fragments
   * @param {Function} callback - Callback to call when done (REQUIRED)
   * @param {Object} config - Module configuration
   * @param {Object} userConsent - User consent data
   */
  getBidRequestData: function(reqBidsConfigObj, callback, config, userConsent) {
    logInfo(`[${MODULE_NAME}] getBidRequestData called`)
    
    // Ensure we have a callback
    if (typeof callback !== 'function') {
      logError(`[${MODULE_NAME}] Callback is required`)
      return
    }
    
    // Check if adapter is initialized
    if (!adapter.initialized) {
      logWarn(`[${MODULE_NAME}] Adapter not initialized, skipping enrichment`)
      callback()
      return
    }
    
    // Check if in browser environment
    if (!isBrowser()) {
      logWarn(`[${MODULE_NAME}] Not in browser environment, skipping enrichment`)
      callback()
      return
    }
    
    // Get context from adapter (async)
    adapter.getContext()
      .then(context => {
        if (!context) {
          logWarn(`[${MODULE_NAME}] No context data available`)
          callback()
          return
        }
        
        logInfo(`[${MODULE_NAME}] Context retrieved successfully`)
        
        // Format for ortb2Fragments (site-level global data)
        const ortb2Fragments = adapter.formatForOrtb2Fragments(context)
        
        if (ortb2Fragments) {
          // Initialize ortb2Fragments if needed
          if (!reqBidsConfigObj.ortb2Fragments) {
            reqBidsConfigObj.ortb2Fragments = {}
          }
          if (!reqBidsConfigObj.ortb2Fragments.global) {
            reqBidsConfigObj.ortb2Fragments.global = {}
          }
          
          // Merge site.content data
          if (ortb2Fragments.global.site) {
            if (!reqBidsConfigObj.ortb2Fragments.global.site) {
              reqBidsConfigObj.ortb2Fragments.global.site = {}
            }
            
            // Merge content data (deep merge to preserve existing data)
            Object.assign(
              reqBidsConfigObj.ortb2Fragments.global.site,
              ortb2Fragments.global.site
            )
            
            logInfo(`[${MODULE_NAME}] Injected site.content data:`, 
              reqBidsConfigObj.ortb2Fragments.global.site.content)
          }
        }
        
        // Also enrich ad units (impression-level data)
        if (reqBidsConfigObj.adUnits && Array.isArray(reqBidsConfigObj.adUnits)) {
          try {
            reqBidsConfigObj.adUnits = adapter._injectTargetingKeys(
              reqBidsConfigObj.adUnits,
              context
            )
            
            logInfo(`[${MODULE_NAME}] Enriched ${reqBidsConfigObj.adUnits.length} ad units`)
          } catch (error) {
            logError(`[${MODULE_NAME}] Error enriching ad units:`, error)
          }
        }
        
        // Success - release auction
        callback()
      })
      .catch(error => {
        logError(`[${MODULE_NAME}] Error getting context:`, error)
        
        // Don't block the auction on error - graceful degradation
        callback()
      })
  },
  
  /**
   * Get targeting data for ad server
   * 
   * This method is called after the auction to get key-value pairs
   * that should be sent to the ad server (e.g., GAM, AppNexus).
   * 
   * @param {Array<string>} adUnitsCodes - Ad unit codes to get targeting for
   * @param {Object} config - Module configuration
   * @returns {Object} Targeting data object keyed by ad unit code
   */
  getTargetingData: function(adUnitsCodes, config) {
    logInfo(`[${MODULE_NAME}] getTargetingData called for ${adUnitsCodes?.length || 0} ad units`)
    
    // Get current context data
    const context = adapter.getContextData()
    
    if (!context) {
      logWarn(`[${MODULE_NAME}] No context data available for targeting`)
      return {}
    }
    
    // Build targeting key-values
    const targetingKeys = adapter._buildTargetingKeys(context)
    
    // Return same targeting for all ad units (site-level context)
    // Format: { adUnitCode1: { key: value }, adUnitCode2: { key: value } }
    const targetingData = {}
    
    if (Array.isArray(adUnitsCodes)) {
      adUnitsCodes.forEach(code => {
        targetingData[code] = targetingKeys
      })
    }
    
    logInfo(`[${MODULE_NAME}] Returning targeting data for ${Object.keys(targetingData).length} ad units`)
    
    return targetingData
  }
}

/**
 * Register submodule with Prebid
 * 
 * This is called when the module is loaded. It registers the mixpeekSubmodule
 * with Prebid's Real-Time Data module system.
 * 
 * Note: This requires Prebid.js to have the realTimeData module included.
 */
function registerSubmodule() {
  if (typeof window !== 'undefined' && window.pbjs) {
    // Check if RTD module is loaded
    if (!window.pbjs.registerRtdSubmodule) {
      logError(`[${MODULE_NAME}] Prebid RTD module not loaded. Please include realTimeData module in your Prebid build.`)
      return false
    }
    
    try {
      window.pbjs.registerRtdSubmodule(mixpeekSubmodule)
      logInfo(`[${MODULE_NAME}] RTD submodule registered successfully`)
      return true
    } catch (error) {
      logError(`[${MODULE_NAME}] Failed to register RTD submodule:`, error)
      return false
    }
  } else {
    // Not in browser or Prebid not loaded yet
    // This is normal during build/test
    return false
  }
}

// Auto-register when loaded in browser
if (isBrowser()) {
  // Use Prebid's queue to ensure Prebid is loaded
  window.pbjs = window.pbjs || {}
  window.pbjs.que = window.pbjs.que || []
  window.pbjs.que.push(function() {
    registerSubmodule()
  })
}

// Export for testing and direct usage
export default {
  name: MODULE_NAME,
  submodule: mixpeekSubmodule,
  registerSubmodule
}

