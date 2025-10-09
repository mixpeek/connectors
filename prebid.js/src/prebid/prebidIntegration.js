/**
 * Prebid.js Integration Module
 * @module prebid/prebidIntegration
 * 
 * This module registers the Mixpeek Context Adapter with Prebid.js and
 * hooks into the bidding lifecycle to enrich requests with contextual data.
 */

import adapter from '../modules/mixpeekContextAdapter.js'
import logger from '../utils/logger.js'

/**
 * Register Mixpeek adapter with Prebid.js
 */
export function registerWithPrebid() {
  if (typeof window === 'undefined' || !window.pbjs) {
    logger.error('Prebid.js not found. Make sure Prebid.js is loaded before the Mixpeek adapter.')
    return false
  }

  const pbjs = window.pbjs

  logger.info('Registering Mixpeek Context Adapter with Prebid.js')

  // Hook into Prebid configuration
  pbjs.que = pbjs.que || []
  pbjs.que.push(function() {
    // Listen for setConfig events
    pbjs.onEvent('setConfig', function(config) {
      if (config.mixpeek) {
        logger.info('Mixpeek configuration detected')
        adapter.init(config.mixpeek)
      }
    })

    // Hook into beforeRequestBids
    pbjs.onEvent('beforeRequestBids', async function(bidRequest) {
      logger.info('beforeRequestBids triggered')
      
      if (!adapter.initialized) {
        logger.warn('Adapter not initialized, skipping enrichment')
        return
      }

      try {
        // Enrich ad units
        const enrichedAdUnits = await adapter.enrichAdUnits(bidRequest.adUnits || [])
        
        // Update bid request
        if (bidRequest.adUnits) {
          bidRequest.adUnits = enrichedAdUnits
        }
      } catch (error) {
        logger.error('Error in beforeRequestBids:', error)
        // Don't block the auction
      }
    })

    // Hook into bidResponse to add analytics
    pbjs.onEvent('bidResponse', function(bidResponse) {
      const context = adapter.getContextData()
      if (context) {
        // Add context data to bid response for analytics
        bidResponse.mixpeekContext = {
          taxonomy: context.taxonomy?.label,
          score: context.taxonomy?.score,
          brandSafety: context.brandSafety
        }
      }
    })

    logger.info('Mixpeek Context Adapter registered with Prebid.js')
  })

  return true
}

/**
 * Initialize Mixpeek with Prebid config
 * @param {object} config - Configuration object
 */
export function initialize(config) {
  if (!config) {
    logger.error('Configuration is required')
    return false
  }

  // Initialize adapter
  const success = adapter.init(config)
  
  if (success) {
    // Register with Prebid
    registerWithPrebid()
  }

  return success
}

// Auto-register if Prebid is already loaded
if (typeof window !== 'undefined' && window.pbjs) {
  registerWithPrebid()
}

export default {
  initialize,
  registerWithPrebid,
  adapter
}

