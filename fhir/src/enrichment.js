/**
 * FHIR Enrichment Formatting
 *
 * Converts Mixpeek enrichment results back into FHIR-compatible structures
 * (extensions, codings, and meta tags).
 */

/**
 * @typedef {Object} FHIREnrichment
 * @property {Object[]} extensions - FHIR extensions array to merge into a resource
 * @property {Object[]} tags - FHIR meta.tag codings
 * @property {Object} context - Raw enrichment data from Mixpeek
 */

const MIXPEEK_EXTENSION_URL = 'https://mixpeek.com/fhir/StructureDefinition/enrichment'

/**
 * Build FHIR-compatible enrichment output from a Mixpeek result
 * @param {Object} result - Mixpeek processContent result
 * @param {Object} extractedContent - Original extracted content
 * @returns {FHIREnrichment} FHIR-formatted enrichment
 */
export function buildFHIREnrichment(result, extractedContent) {
  const extensions = []
  const tags = []

  // Document ID extension
  if (result.document_id) {
    extensions.push({
      url: `${MIXPEEK_EXTENSION_URL}/document-id`,
      valueString: result.document_id
    })
  }

  // Collection ID extension
  if (result.collection_id) {
    extensions.push({
      url: `${MIXPEEK_EXTENSION_URL}/collection-id`,
      valueString: result.collection_id
    })
  }

  // Enrichment data as a complex extension
  const enrichments = result.enrichments || {}

  if (enrichments.keywords?.length > 0) {
    extensions.push({
      url: `${MIXPEEK_EXTENSION_URL}/keywords`,
      valueString: enrichments.keywords.join(', ')
    })

    // Add keywords as meta tags
    for (const keyword of enrichments.keywords.slice(0, 10)) {
      tags.push({
        system: 'https://mixpeek.com/fhir/CodeSystem/keyword',
        code: keyword,
        display: keyword
      })
    }
  }

  if (enrichments.taxonomy) {
    extensions.push({
      url: `${MIXPEEK_EXTENSION_URL}/taxonomy`,
      extension: [
        {
          url: 'label',
          valueString: enrichments.taxonomy.label
        },
        {
          url: 'score',
          valueDecimal: enrichments.taxonomy.score
        }
      ]
    })

    tags.push({
      system: 'https://mixpeek.com/fhir/CodeSystem/taxonomy',
      code: enrichments.taxonomy.nodeId || enrichments.taxonomy.label,
      display: enrichments.taxonomy.label
    })
  }

  if (enrichments.sentiment) {
    extensions.push({
      url: `${MIXPEEK_EXTENSION_URL}/sentiment`,
      extension: [
        {
          url: 'label',
          valueString: enrichments.sentiment.label
        },
        {
          url: 'score',
          valueDecimal: enrichments.sentiment.score
        }
      ]
    })
  }

  return {
    extensions,
    tags,
    context: result
  }
}

/**
 * Merge enrichment extensions into a FHIR resource (returns new object)
 * @param {Object} resource - Original FHIR resource
 * @param {FHIREnrichment} enrichment - Enrichment to merge
 * @returns {Object} New resource with enrichment extensions and tags
 */
export function mergeEnrichment(resource, enrichment) {
  if (!resource || !enrichment) return resource

  const enriched = { ...resource }

  // Merge extensions
  if (enrichment.extensions.length > 0) {
    enriched.extension = [
      ...(resource.extension || []),
      ...enrichment.extensions
    ]
  }

  // Merge meta tags
  if (enrichment.tags.length > 0) {
    enriched.meta = {
      ...(resource.meta || {}),
      tag: [
        ...(resource.meta?.tag || []),
        ...enrichment.tags
      ]
    }
  }

  return enriched
}

/**
 * Strip Mixpeek enrichment extensions from a resource
 * @param {Object} resource - Enriched FHIR resource
 * @returns {Object} Resource without Mixpeek extensions
 */
export function stripEnrichment(resource) {
  if (!resource) return resource

  const cleaned = { ...resource }

  // Remove Mixpeek extensions
  if (cleaned.extension) {
    cleaned.extension = cleaned.extension.filter(
      ext => !ext.url?.startsWith(MIXPEEK_EXTENSION_URL)
    )
    if (cleaned.extension.length === 0) delete cleaned.extension
  }

  // Remove Mixpeek meta tags
  if (cleaned.meta?.tag) {
    cleaned.meta = {
      ...cleaned.meta,
      tag: cleaned.meta.tag.filter(
        tag => !tag.system?.startsWith('https://mixpeek.com/fhir/')
      )
    }
    if (cleaned.meta.tag.length === 0) {
      const { tag, ...rest } = cleaned.meta
      cleaned.meta = Object.keys(rest).length > 0 ? rest : undefined
    }
    if (!cleaned.meta) delete cleaned.meta
  }

  return cleaned
}
