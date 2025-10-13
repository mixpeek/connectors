/**
 * Previous Ad Tracker
 * Stores minimal information about the most recently served ad
 * using in-memory storage with optional localStorage persistence.
 */

import { isBrowser, safeJSONParse } from './helpers.js'
import logger from './logger.js'

const STORAGE_KEY = 'mixpeek_prev_ad_v1'

class PreviousAdTracker {
  constructor() {
    this.lastAd = null
    this.storageAvailable = this._checkLocalStorage()
    this._loadFromStorage()
  }

  _checkLocalStorage() {
    if (!isBrowser()) return false
    try {
      const k = '__mixpeek_prev_test__'
      localStorage.setItem(k, '1')
      localStorage.removeItem(k)
      return true
    } catch (e) {
      return false
    }
  }

  _loadFromStorage() {
    if (!this.storageAvailable) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = safeJSONParse(raw)
        if (parsed && typeof parsed === 'object') {
          this.lastAd = parsed
        }
      }
    } catch (e) {
      logger.warn('Failed to load previous ad from storage:', e)
    }
  }

  _persist() {
    if (!this.storageAvailable) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lastAd))
    } catch (e) {
      logger.warn('Failed to persist previous ad:', e)
    }
  }

  /**
   * Record the last served ad from a Prebid bidResponse
   * @param {object} bidResponse
   */
  record(bidResponse) {
    if (!bidResponse || typeof bidResponse !== 'object') return
    const info = {
      creativeId: bidResponse.creativeId || bidResponse.creative_id || null,
      bidder: bidResponse.bidder || bidResponse.bidderCode || null,
      adUnitCode: bidResponse.adUnitCode || null,
      cpm: typeof bidResponse.cpm === 'number' ? bidResponse.cpm : null,
      currency: bidResponse.currency || null,
      categories: Array.isArray(bidResponse.meta?.adServerCatId) ? bidResponse.meta.adServerCatId : (bidResponse.meta?.primaryCat ? [bidResponse.meta.primaryCat] : []),
      timestamp: Date.now()
    }
    this.lastAd = info
    this._persist()
  }

  /**
   * Get last ad info
   * @returns {object|null}
   */
  getLast() {
    return this.lastAd
  }

  /**
   * Clear last ad
   */
  clear() {
    this.lastAd = null
    if (this.storageAvailable) {
      try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
    }
  }
}

export default new PreviousAdTracker()


