/**
 * Unit Tests for Mixpeek RTD Provider
 * @file tests/unit/modules/mixpeekRtdProvider.test.js
 */

import { mixpeekSubmodule } from '../../../src/modules/mixpeekRtdProvider.js'

// Mock dependencies
jest.mock('../../../src/modules/mixpeekContextAdapter.js')
jest.mock('../../../src/utils/logger.js')

import adapter from '../../../src/modules/mixpeekContextAdapter.js'
import { logInfo, logWarn, logError } from '../../../src/utils/logger.js'

describe('mixpeekRtdProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset adapter state
    adapter.initialized = false
    adapter.getContext = jest.fn()
    adapter.getContextData = jest.fn()
    adapter._buildTargetingKeys = jest.fn()
    adapter._injectTargetingKeys = jest.fn()
    adapter.formatForOrtb2Fragments = jest.fn()
    adapter.init = jest.fn().mockReturnValue(true)
  })

  describe('Module metadata', () => {
    test('should have correct name', () => {
      expect(mixpeekSubmodule.name).toBe('mixpeek')
    })

    test('should have required methods', () => {
      expect(typeof mixpeekSubmodule.init).toBe('function')
      expect(typeof mixpeekSubmodule.getBidRequestData).toBe('function')
      expect(typeof mixpeekSubmodule.getTargetingData).toBe('function')
    })
  })

  describe('init()', () => {
    const validConfig = {
      params: {
        apiKey: 'sk_test_key',
        collectionId: 'col_test'
      }
    }

    test('should initialize with valid config', () => {
      adapter.init.mockReturnValue(true)
      
      const result = mixpeekSubmodule.init(validConfig, null)
      
      expect(result).toBe(true)
      expect(adapter.init).toHaveBeenCalledWith(validConfig.params)
      expect(logInfo).toHaveBeenCalled()
    })

    test('should fail without config', () => {
      const result = mixpeekSubmodule.init(null, null)
      
      expect(result).toBe(false)
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Configuration is required')
      )
    })

    test('should fail without params', () => {
      const result = mixpeekSubmodule.init({}, null)
      
      expect(result).toBe(false)
      expect(logError).toHaveBeenCalled()
    })

    test('should fail without apiKey', () => {
      const config = {
        params: {
          collectionId: 'col_test'
        }
      }
      
      const result = mixpeekSubmodule.init(config, null)
      
      expect(result).toBe(false)
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('apiKey is required')
      )
    })

    test('should fail without collectionId', () => {
      const config = {
        params: {
          apiKey: 'sk_test_key'
        }
      }
      
      const result = mixpeekSubmodule.init(config, null)
      
      expect(result).toBe(false)
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('collectionId is required')
      )
    })

    describe('Consent handling', () => {
      test('should log GDPR consent', () => {
        const userConsent = {
          gdpr: {
            gdprApplies: true,
            purposeConsents: { '1': true, '2': false }
          }
        }
        
        mixpeekSubmodule.init(validConfig, userConsent)
        
        expect(logInfo).toHaveBeenCalledWith(
          expect.stringContaining('GDPR applies: true')
        )
      })

      test('should log USP consent', () => {
        const userConsent = {
          usp: '1YNN'
        }
        
        mixpeekSubmodule.init(validConfig, userConsent)
        
        expect(logInfo).toHaveBeenCalledWith(
          expect.stringContaining('USP consent string: 1YNN')
        )
      })

      test('should handle null consent', () => {
        const result = mixpeekSubmodule.init(validConfig, null)
        
        expect(result).toBe(true)
      })

      test('should handle empty consent', () => {
        const result = mixpeekSubmodule.init(validConfig, {})
        
        expect(result).toBe(true)
      })
    })

    test('should handle initialization errors', () => {
      adapter.init.mockImplementation(() => {
        throw new Error('Init failed')
      })
      
      const result = mixpeekSubmodule.init(validConfig, null)
      
      expect(result).toBe(false)
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Initialization error'),
        expect.any(Error)
      )
    })
  })

  describe('getBidRequestData()', () => {
    const config = {
      params: {
        apiKey: 'sk_test_key',
        collectionId: 'col_test'
      }
    }

    const mockContext = {
      documentId: 'doc_123',
      mode: 'page',
      taxonomy: {
        label: 'Technology - AI',
        nodeId: 'node_tech_ai',
        score: 0.94
      },
      brandSafety: 0.98,
      keywords: ['ai', 'technology']
    }

    beforeEach(() => {
      adapter.initialized = true
    })

    test('should require callback function', () => {
      const reqBidsConfigObj = {}
      
      mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, null, config, null)
      
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Callback is required')
      )
    })

    test('should skip if adapter not initialized', () => {
      adapter.initialized = false
      const callback = jest.fn()
      const reqBidsConfigObj = {}
      
      mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      expect(callback).toHaveBeenCalled()
      expect(logWarn).toHaveBeenCalledWith(
        expect.stringContaining('not initialized')
      )
    })

    test('should inject ortb2Fragments with context data', async () => {
      adapter.getContext.mockResolvedValue(mockContext)
      adapter.formatForOrtb2Fragments.mockReturnValue({
        global: {
          site: {
            content: {
              cat: ['IAB19-11'],
              genre: 'Technology - AI',
              keywords: 'ai,technology'
            }
          }
        }
      })
      adapter._injectTargetingKeys.mockImplementation(adUnits => adUnits)
      
      const callback = jest.fn()
      const reqBidsConfigObj = {
        adUnits: [],
        ortb2Fragments: {}
      }
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(adapter.getContext).toHaveBeenCalled()
      expect(adapter.formatForOrtb2Fragments).toHaveBeenCalledWith(mockContext)
      expect(reqBidsConfigObj.ortb2Fragments.global).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global.site).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global.site.content).toBeDefined()
      expect(callback).toHaveBeenCalled()
    })

    test('should enrich ad units', async () => {
      adapter.getContext.mockResolvedValue(mockContext)
      adapter.formatForOrtb2Fragments.mockReturnValue({
        global: { site: { content: {} } }
      })
      adapter._injectTargetingKeys.mockImplementation(adUnits => {
        return adUnits.map(unit => ({ ...unit, enriched: true }))
      })
      
      const callback = jest.fn()
      const reqBidsConfigObj = {
        adUnits: [
          { code: 'div-1' },
          { code: 'div-2' }
        ]
      }
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(adapter._injectTargetingKeys).toHaveBeenCalledWith(
        expect.arrayContaining([
          { code: 'div-1' },
          { code: 'div-2' }
        ]),
        mockContext
      )
      expect(callback).toHaveBeenCalled()
    })

    test('should call callback when no context available', async () => {
      adapter.getContext.mockResolvedValue(null)
      
      const callback = jest.fn()
      const reqBidsConfigObj = {}
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(logWarn).toHaveBeenCalledWith(
        expect.stringContaining('No context data available')
      )
      expect(callback).toHaveBeenCalled()
    })

    test('should not block auction on error', async () => {
      adapter.getContext.mockRejectedValue(new Error('API error'))
      
      const callback = jest.fn()
      const reqBidsConfigObj = {}
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Error getting context'),
        expect.any(Error)
      )
      expect(callback).toHaveBeenCalled()
    })

    test('should initialize ortb2Fragments if missing', async () => {
      adapter.getContext.mockResolvedValue(mockContext)
      adapter.formatForOrtb2Fragments.mockReturnValue({
        global: { site: { content: { cat: ['IAB19'] } } }
      })
      adapter._injectTargetingKeys.mockImplementation(adUnits => adUnits)
      
      const callback = jest.fn()
      const reqBidsConfigObj = {
        adUnits: []
        // No ortb2Fragments property
      }
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(reqBidsConfigObj.ortb2Fragments).toBeDefined()
      expect(reqBidsConfigObj.ortb2Fragments.global).toBeDefined()
      expect(callback).toHaveBeenCalled()
    })

    test('should handle enrichment errors gracefully', async () => {
      adapter.getContext.mockResolvedValue(mockContext)
      adapter.formatForOrtb2Fragments.mockReturnValue({
        global: { site: { content: {} } }
      })
      adapter._injectTargetingKeys.mockImplementation(() => {
        throw new Error('Enrichment failed')
      })
      
      const callback = jest.fn()
      const reqBidsConfigObj = {
        adUnits: [{ code: 'div-1' }]
      }
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Error enriching ad units'),
        expect.any(Error)
      )
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('getTargetingData()', () => {
    const config = {
      params: {
        apiKey: 'sk_test_key',
        collectionId: 'col_test'
      }
    }

    const mockContext = {
      taxonomy: {
        label: 'Technology - AI',
        nodeId: 'node_tech_ai',
        score: 0.94
      }
    }

    const mockTargetingKeys = {
      hb_mixpeek_category: 'Technology - AI',
      hb_mixpeek_node: 'node_tech_ai',
      hb_mixpeek_score: '0.94'
    }

    test('should return targeting data for ad units', () => {
      adapter.getContextData.mockReturnValue(mockContext)
      adapter._buildTargetingKeys.mockReturnValue(mockTargetingKeys)
      
      const adUnitsCodes = ['div-1', 'div-2', 'div-3']
      
      const result = mixpeekSubmodule.getTargetingData(adUnitsCodes, config)
      
      expect(adapter.getContextData).toHaveBeenCalled()
      expect(adapter._buildTargetingKeys).toHaveBeenCalledWith(mockContext)
      expect(result).toEqual({
        'div-1': mockTargetingKeys,
        'div-2': mockTargetingKeys,
        'div-3': mockTargetingKeys
      })
    })

    test('should return empty object when no context', () => {
      adapter.getContextData.mockReturnValue(null)
      
      const result = mixpeekSubmodule.getTargetingData(['div-1'], config)
      
      expect(result).toEqual({})
      expect(logWarn).toHaveBeenCalledWith(
        expect.stringContaining('No context data available for targeting')
      )
    })

    test('should handle empty ad units array', () => {
      adapter.getContextData.mockReturnValue(mockContext)
      adapter._buildTargetingKeys.mockReturnValue(mockTargetingKeys)
      
      const result = mixpeekSubmodule.getTargetingData([], config)
      
      expect(result).toEqual({})
    })

    test('should handle null ad units', () => {
      adapter.getContextData.mockReturnValue(mockContext)
      adapter._buildTargetingKeys.mockReturnValue(mockTargetingKeys)
      
      const result = mixpeekSubmodule.getTargetingData(null, config)
      
      expect(result).toEqual({})
    })

    test('should handle undefined ad units', () => {
      adapter.getContextData.mockReturnValue(mockContext)
      adapter._buildTargetingKeys.mockReturnValue(mockTargetingKeys)
      
      const result = mixpeekSubmodule.getTargetingData(undefined, config)
      
      expect(result).toEqual({})
    })
  })

  describe('Integration scenarios', () => {
    const config = {
      params: {
        apiKey: 'sk_test_key',
        collectionId: 'col_test',
        featureExtractors: ['taxonomy', 'brand-safety']
      }
    }

    test('should handle full enrichment flow', async () => {
      adapter.initialized = true
      adapter.getContext.mockResolvedValue({
        documentId: 'doc_123',
        taxonomy: {
          label: 'Sports - Football',
          nodeId: 'node_sports_football',
          score: 0.92
        },
        brandSafety: 0.95
      })
      adapter.formatForOrtb2Fragments.mockReturnValue({
        global: {
          site: {
            content: {
              cat: ['IAB17-3'],
              genre: 'Sports - Football'
            }
          }
        }
      })
      adapter._injectTargetingKeys.mockImplementation(adUnits => adUnits)
      
      const callback = jest.fn()
      const reqBidsConfigObj = {
        adUnits: [{ code: 'div-1' }],
        ortb2Fragments: {}
      }
      
      await mixpeekSubmodule.getBidRequestData(reqBidsConfigObj, callback, config, null)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(reqBidsConfigObj.ortb2Fragments.global.site.content.cat).toContain('IAB17-3')
      expect(callback).toHaveBeenCalled()
      expect(logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Injected site.content data')
      )
    })

    test('should work with GDPR consent', async () => {
      const userConsent = {
        gdpr: {
          gdprApplies: true,
          purposeConsents: { '1': true }
        }
      }
      
      const initResult = mixpeekSubmodule.init(config, userConsent)
      
      expect(initResult).toBe(true)
      expect(logInfo).toHaveBeenCalledWith(
        expect.stringContaining('GDPR applies')
      )
    })
  })
})

