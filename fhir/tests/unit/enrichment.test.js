/**
 * Unit Tests - FHIR Enrichment Formatting
 */

import { buildFHIREnrichment, mergeEnrichment, stripEnrichment } from '../../src/enrichment.js'

describe('buildFHIREnrichment', () => {
  test('should build extensions from Mixpeek result', () => {
    const result = {
      document_id: 'doc_abc123',
      collection_id: 'col_test',
      enrichments: {
        keywords: ['diabetes', 'insulin', 'glucose'],
        taxonomy: { label: 'Endocrinology', score: 0.85, nodeId: 'cat_endocrinology' },
        sentiment: { label: 'neutral', score: 0.5 }
      }
    }

    const extracted = { resourceType: 'Condition', resourceId: 'cond-1', text: 'test' }
    const enrichment = buildFHIREnrichment(result, extracted)

    expect(enrichment.extensions).toBeDefined()
    expect(enrichment.tags).toBeDefined()

    // Should have document_id extension
    const docIdExt = enrichment.extensions.find(e => e.url.includes('document-id'))
    expect(docIdExt).toBeDefined()
    expect(docIdExt.valueString).toBe('doc_abc123')

    // Should have keyword extensions
    const keywordsExt = enrichment.extensions.find(e => e.url.includes('keywords'))
    expect(keywordsExt).toBeDefined()
    expect(keywordsExt.valueString).toContain('diabetes')

    // Should have taxonomy extension
    const taxonomyExt = enrichment.extensions.find(e => e.url.includes('taxonomy'))
    expect(taxonomyExt).toBeDefined()

    // Should have keyword tags
    const keywordTags = enrichment.tags.filter(t => t.system.includes('keyword'))
    expect(keywordTags.length).toBeGreaterThan(0)
    expect(keywordTags[0].code).toBe('diabetes')

    // Should have taxonomy tag
    const taxonomyTag = enrichment.tags.find(t => t.system.includes('taxonomy'))
    expect(taxonomyTag).toBeDefined()
    expect(taxonomyTag.display).toBe('Endocrinology')
  })

  test('should handle empty enrichments', () => {
    const result = { document_id: null, collection_id: 'col_test', enrichments: {} }
    const enrichment = buildFHIREnrichment(result, { resourceType: 'Patient' })

    expect(enrichment.extensions).toHaveLength(1) // collection_id only
    expect(enrichment.tags).toHaveLength(0)
  })
})

describe('mergeEnrichment', () => {
  test('should merge extensions into resource', () => {
    const resource = {
      resourceType: 'Patient',
      id: 'p1',
      extension: [{ url: 'https://example.com/ext', valueString: 'existing' }]
    }

    const enrichment = {
      extensions: [
        { url: 'https://mixpeek.com/fhir/StructureDefinition/enrichment/document-id', valueString: 'doc_123' }
      ],
      tags: [
        { system: 'https://mixpeek.com/fhir/CodeSystem/keyword', code: 'test' }
      ]
    }

    const merged = mergeEnrichment(resource, enrichment)

    expect(merged.extension).toHaveLength(2)
    expect(merged.meta.tag).toHaveLength(1)
    // Original resource should not be mutated
    expect(resource.extension).toHaveLength(1)
    expect(resource.meta).toBeUndefined()
  })

  test('should handle resource without existing extensions', () => {
    const resource = { resourceType: 'Patient', id: 'p1' }
    const enrichment = {
      extensions: [{ url: 'https://mixpeek.com/test', valueString: 'val' }],
      tags: []
    }

    const merged = mergeEnrichment(resource, enrichment)

    expect(merged.extension).toHaveLength(1)
    expect(merged.meta).toBeUndefined()
  })

  test('should return resource unchanged if no enrichment', () => {
    const resource = { resourceType: 'Patient', id: 'p1' }
    expect(mergeEnrichment(resource, null)).toEqual(resource)
  })
})

describe('stripEnrichment', () => {
  test('should remove Mixpeek extensions and tags', () => {
    const enriched = {
      resourceType: 'Patient',
      id: 'p1',
      extension: [
        { url: 'https://example.com/ext', valueString: 'keep' },
        { url: 'https://mixpeek.com/fhir/StructureDefinition/enrichment/document-id', valueString: 'doc_123' },
        { url: 'https://mixpeek.com/fhir/StructureDefinition/enrichment/keywords', valueString: 'test' }
      ],
      meta: {
        versionId: '1',
        tag: [
          { system: 'https://mixpeek.com/fhir/CodeSystem/keyword', code: 'diabetes' },
          { system: 'http://hl7.org/fhir/tag', code: 'keep-me' }
        ]
      }
    }

    const stripped = stripEnrichment(enriched)

    expect(stripped.extension).toHaveLength(1)
    expect(stripped.extension[0].url).toBe('https://example.com/ext')
    expect(stripped.meta.versionId).toBe('1')
    expect(stripped.meta.tag).toHaveLength(1)
    expect(stripped.meta.tag[0].code).toBe('keep-me')
  })

  test('should clean up empty extension/meta arrays', () => {
    const enriched = {
      resourceType: 'Patient',
      id: 'p1',
      extension: [
        { url: 'https://mixpeek.com/fhir/StructureDefinition/enrichment/doc', valueString: 'x' }
      ],
      meta: {
        tag: [
          { system: 'https://mixpeek.com/fhir/CodeSystem/keyword', code: 'test' }
        ]
      }
    }

    const stripped = stripEnrichment(enriched)

    expect(stripped.extension).toBeUndefined()
    expect(stripped.meta).toBeUndefined()
  })

  test('should handle resource without enrichment gracefully', () => {
    const resource = { resourceType: 'Patient', id: 'p1' }
    const stripped = stripEnrichment(resource)
    expect(stripped).toEqual(resource)
  })

  test('should handle null input', () => {
    expect(stripEnrichment(null)).toBeNull()
  })
})
