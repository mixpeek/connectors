/**
 * Unit Tests - Main Module
 */

import { createEnricher } from '../../src/index.js'

describe('createEnricher', () => {
  test('should throw error if apiKey is missing', () => {
    expect(() => createEnricher({
      collectionId: 'test',
      namespace: 'ns_test'
    })).toThrow('apiKey is required')
  })

  test('should throw error if collectionId is missing', () => {
    expect(() => createEnricher({
      apiKey: 'test_key',
      namespace: 'ns_test'
    })).toThrow('collectionId is required')
  })

  test('should throw error if namespace is missing', () => {
    expect(() => createEnricher({
      apiKey: 'test_key',
      collectionId: 'test'
    })).toThrow('namespace is required')
  })

  test('should create enricher with valid config', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    expect(enricher).toBeDefined()
    expect(typeof enricher.enrich).toBe('function')
    expect(typeof enricher.enrichBundle).toBe('function')
    expect(typeof enricher.extract).toBe('function')
    expect(typeof enricher.strip).toBe('function')
    expect(typeof enricher.healthCheck).toBe('function')
    expect(typeof enricher.clearCache).toBe('function')
    expect(typeof enricher.getCacheStats).toBe('function')
    expect(typeof enricher.getSupportedResourceTypes).toBe('function')
  })

  test('should return cache stats', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      enableCache: true,
      cacheTTL: 600
    })

    const stats = enricher.getCacheStats()

    expect(stats.enabled).toBe(true)
    expect(stats.ttlMs).toBe(600000)
    expect(stats.size).toBe(0)
  })

  test('should clear cache', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    enricher.clearCache()
    expect(enricher.getCacheStats().size).toBe(0)
  })

  test('should list supported resource types', () => {
    const enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })

    const types = enricher.getSupportedResourceTypes()
    expect(types).toContain('Patient')
    expect(types).toContain('Observation')
    expect(types).toContain('Condition')
    expect(types).toContain('DocumentReference')
    expect(types).toContain('DiagnosticReport')
    expect(types).toContain('Encounter')
    expect(types).toContain('MedicationRequest')
  })
})

describe('Enricher.extract', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })
  })

  test('should extract Patient content', () => {
    const patient = {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ given: ['John'], family: 'Doe' }],
      gender: 'male',
      birthDate: '1990-01-15'
    }

    const extracted = enricher.extract(patient)

    expect(extracted).toBeDefined()
    expect(extracted.resourceType).toBe('Patient')
    expect(extracted.resourceId).toBe('patient-1')
    expect(extracted.text).toContain('John')
    expect(extracted.text).toContain('Doe')
    expect(extracted.metadata.gender).toBe('male')
  })

  test('should extract Observation content', () => {
    const observation = {
      resourceType: 'Observation',
      id: 'obs-1',
      code: {
        coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
        text: 'Heart rate'
      },
      valueQuantity: { value: 72, unit: 'beats/minute' },
      status: 'final'
    }

    const extracted = enricher.extract(observation)

    expect(extracted).toBeDefined()
    expect(extracted.resourceType).toBe('Observation')
    expect(extracted.text).toContain('Heart rate')
    expect(extracted.text).toContain('72')
    expect(extracted.metadata.code).toBe('Heart rate')
  })

  test('should extract Condition content', () => {
    const condition = {
      resourceType: 'Condition',
      id: 'cond-1',
      code: {
        coding: [{ system: 'http://snomed.info/sct', code: '73211009', display: 'Diabetes mellitus' }],
        text: 'Diabetes mellitus'
      },
      clinicalStatus: {
        coding: [{ code: 'active', display: 'Active' }]
      },
      severity: {
        coding: [{ display: 'Moderate' }]
      }
    }

    const extracted = enricher.extract(condition)

    expect(extracted).toBeDefined()
    expect(extracted.text).toContain('Diabetes mellitus')
    expect(extracted.text).toContain('Active')
    expect(extracted.text).toContain('Moderate')
  })

  test('should return null for empty resource', () => {
    expect(enricher.extract(null)).toBeNull()
    expect(enricher.extract({})).toBeNull()
  })
})

describe('Enricher.strip', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test'
    })
  })

  test('should strip Mixpeek extensions from enriched resource', () => {
    const enrichedResource = {
      resourceType: 'Patient',
      id: 'patient-1',
      extension: [
        { url: 'https://example.com/ext', valueString: 'keep' },
        { url: 'https://mixpeek.com/fhir/StructureDefinition/enrichment/document-id', valueString: 'doc_123' }
      ],
      meta: {
        versionId: '1',
        tag: [
          { system: 'https://mixpeek.com/fhir/CodeSystem/keyword', code: 'test' },
          { system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue', code: 'other' }
        ]
      }
    }

    const stripped = enricher.strip(enrichedResource)

    expect(stripped.extension).toHaveLength(1)
    expect(stripped.extension[0].url).toBe('https://example.com/ext')
    expect(stripped.meta.tag).toHaveLength(1)
    expect(stripped.meta.tag[0].system).not.toContain('mixpeek')
  })

  test('should handle resource without enrichment', () => {
    const resource = { resourceType: 'Patient', id: 'patient-1' }
    const stripped = enricher.strip(resource)
    expect(stripped).toEqual(resource)
  })
})

describe('Enricher.enrich', () => {
  let enricher

  beforeEach(() => {
    enricher = createEnricher({
      apiKey: 'test_key',
      collectionId: 'test_collection',
      namespace: 'ns_test',
      timeout: 100
    })
    enricher.clearCache()
  })

  test('should skip resources with no extractable text', async () => {
    const result = await enricher.enrich({ resourceType: 'Binary', id: 'bin-1' })

    expect(result.skipped).toBe(true)
    expect(result.enrichment).toBeNull()
  })

  test('should handle API errors gracefully', async () => {
    const patient = {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ given: ['Jane'], family: 'Smith' }],
      gender: 'female'
    }

    const result = await enricher.enrich(patient)

    expect(result).toBeDefined()
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    // Will have an error since no real API is available
    expect(result.resource).toBeDefined()
  })

  test('should cache results', async () => {
    const patient = {
      resourceType: 'Patient',
      id: 'patient-cache-test',
      name: [{ given: ['Cache'], family: 'Test' }]
    }

    const result1 = await enricher.enrich(patient)
    expect(result1.cached).toBe(false)

    const result2 = await enricher.enrich(patient)
    expect(result2.cached).toBe(true)
    expect(result2.latencyMs).toBeLessThan(result1.latencyMs || 100)
  })
})
