/**
 * FHIR Resource Content Extraction
 *
 * Extracts text and metadata from FHIR R4 resources for Mixpeek enrichment.
 * Supports common resource types: Patient, DocumentReference, DiagnosticReport,
 * Observation, Condition, Encounter, MedicationRequest, etc.
 */

/**
 * @typedef {Object} ExtractedContent
 * @property {string} resourceType - FHIR resource type
 * @property {string} resourceId - Logical ID of the resource
 * @property {string} text - Extracted text content for enrichment
 * @property {string} [url] - Reference URL if available
 * @property {Object} metadata - Structured metadata from the resource
 */

/**
 * Extract content from any FHIR R4 resource
 * @param {Object} resource - FHIR R4 resource object
 * @returns {ExtractedContent|null} Extracted content or null if unsupported
 */
export function extractContent(resource) {
  if (!resource || !resource.resourceType) return null

  const extractor = EXTRACTORS[resource.resourceType]
  if (extractor) {
    return extractor(resource)
  }

  // Generic fallback: use resource narrative if present
  return extractGeneric(resource)
}

/**
 * Extract content from a FHIR Bundle (returns array)
 * @param {Object} bundle - FHIR Bundle resource
 * @returns {ExtractedContent[]} Extracted content for each entry
 */
export function extractBundle(bundle) {
  if (!bundle || bundle.resourceType !== 'Bundle') return []

  const entries = bundle.entry || []
  return entries
    .map(entry => extractContent(entry.resource))
    .filter(Boolean)
}

/**
 * Get human-readable text from a FHIR Narrative (resource.text)
 * @param {Object} resource - FHIR resource with text.div
 * @returns {string} Plain text extracted from narrative HTML
 */
function getNarrativeText(resource) {
  const div = resource?.text?.div
  if (!div) return ''
  // Strip HTML tags to get plain text
  return div.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Get display text from a CodeableConcept
 * @param {Object} concept - FHIR CodeableConcept
 * @returns {string} Display text
 */
function getCodeableConceptText(concept) {
  if (!concept) return ''
  if (concept.text) return concept.text
  const coding = concept.coding?.[0]
  return coding?.display || coding?.code || ''
}

/**
 * Get display text from a Reference
 * @param {Object} ref - FHIR Reference
 * @returns {string} Display text
 */
function getReferenceText(ref) {
  if (!ref) return ''
  return ref.display || ref.reference || ''
}

// ── Resource-specific extractors ────────────────────────────────────

function extractPatient(resource) {
  const names = (resource.name || [])
    .map(n => [n.prefix, n.given, n.family].flat().filter(Boolean).join(' '))
    .join('; ')

  const conditions = []
  if (resource.gender) conditions.push(`Gender: ${resource.gender}`)
  if (resource.birthDate) conditions.push(`DOB: ${resource.birthDate}`)

  const addresses = (resource.address || [])
    .map(a => [a.line, a.city, a.state, a.postalCode, a.country].flat().filter(Boolean).join(', '))
    .join('; ')

  const parts = [names, ...conditions]
  if (addresses) parts.push(`Address: ${addresses}`)

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'Patient',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      gender: resource.gender,
      birthDate: resource.birthDate,
      identifier: resource.identifier?.map(id => ({ system: id.system, value: id.value }))
    }
  }
}

function extractDocumentReference(resource) {
  const parts = []

  // Description
  if (resource.description) parts.push(resource.description)

  // Type
  const typeText = getCodeableConceptText(resource.type)
  if (typeText) parts.push(`Type: ${typeText}`)

  // Category
  const categories = (resource.category || []).map(getCodeableConceptText).filter(Boolean)
  if (categories.length) parts.push(`Category: ${categories.join(', ')}`)

  // Subject
  const subject = getReferenceText(resource.subject)
  if (subject) parts.push(`Subject: ${subject}`)

  // Content attachments (titles + text data)
  const contents = resource.content || []
  for (const c of contents) {
    const attachment = c.attachment
    if (!attachment) continue
    if (attachment.title) parts.push(attachment.title)
    // Decode base64 text content if small enough
    if (attachment.contentType?.startsWith('text/') && attachment.data) {
      try {
        const decoded = typeof atob === 'function'
          ? atob(attachment.data)
          : Buffer.from(attachment.data, 'base64').toString('utf-8')
        if (decoded.length < 10000) parts.push(decoded)
      } catch { /* skip */ }
    }
  }

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'DocumentReference',
    resourceId: resource.id,
    text: parts.join('. '),
    url: contents[0]?.attachment?.url,
    metadata: {
      status: resource.status,
      docStatus: resource.docStatus,
      type: typeText,
      date: resource.date,
      contentType: contents[0]?.attachment?.contentType
    }
  }
}

function extractDiagnosticReport(resource) {
  const parts = []

  const codeText = getCodeableConceptText(resource.code)
  if (codeText) parts.push(codeText)

  if (resource.conclusion) parts.push(resource.conclusion)

  const conclusionCodes = (resource.conclusionCode || []).map(getCodeableConceptText).filter(Boolean)
  if (conclusionCodes.length) parts.push(`Conclusions: ${conclusionCodes.join(', ')}`)

  const categories = (resource.category || []).map(getCodeableConceptText).filter(Boolean)
  if (categories.length) parts.push(`Category: ${categories.join(', ')}`)

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'DiagnosticReport',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      status: resource.status,
      code: codeText,
      effectiveDateTime: resource.effectiveDateTime,
      issued: resource.issued,
      category: categories
    }
  }
}

function extractObservation(resource) {
  const parts = []

  const codeText = getCodeableConceptText(resource.code)
  if (codeText) parts.push(codeText)

  // Value
  if (resource.valueQuantity) {
    parts.push(`Value: ${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}`)
  } else if (resource.valueCodeableConcept) {
    parts.push(`Value: ${getCodeableConceptText(resource.valueCodeableConcept)}`)
  } else if (resource.valueString) {
    parts.push(`Value: ${resource.valueString}`)
  }

  // Interpretation
  const interp = (resource.interpretation || []).map(getCodeableConceptText).filter(Boolean)
  if (interp.length) parts.push(`Interpretation: ${interp.join(', ')}`)

  // Components (e.g., blood pressure systolic/diastolic)
  const components = resource.component || []
  for (const comp of components) {
    const compCode = getCodeableConceptText(comp.code)
    if (comp.valueQuantity) {
      parts.push(`${compCode}: ${comp.valueQuantity.value} ${comp.valueQuantity.unit || ''}`)
    }
  }

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'Observation',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      status: resource.status,
      code: codeText,
      effectiveDateTime: resource.effectiveDateTime,
      category: (resource.category || []).map(getCodeableConceptText).filter(Boolean)
    }
  }
}

function extractCondition(resource) {
  const parts = []

  const codeText = getCodeableConceptText(resource.code)
  if (codeText) parts.push(codeText)

  const clinicalStatus = getCodeableConceptText(resource.clinicalStatus)
  if (clinicalStatus) parts.push(`Status: ${clinicalStatus}`)

  const verificationStatus = getCodeableConceptText(resource.verificationStatus)
  if (verificationStatus) parts.push(`Verification: ${verificationStatus}`)

  const severity = getCodeableConceptText(resource.severity)
  if (severity) parts.push(`Severity: ${severity}`)

  const categories = (resource.category || []).map(getCodeableConceptText).filter(Boolean)
  if (categories.length) parts.push(`Category: ${categories.join(', ')}`)

  if (resource.onsetDateTime) parts.push(`Onset: ${resource.onsetDateTime}`)

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'Condition',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      status: clinicalStatus,
      code: codeText,
      severity,
      onsetDateTime: resource.onsetDateTime,
      recordedDate: resource.recordedDate
    }
  }
}

function extractEncounter(resource) {
  const parts = []

  const typeTexts = (resource.type || []).map(getCodeableConceptText).filter(Boolean)
  if (typeTexts.length) parts.push(typeTexts.join(', '))

  if (resource.class?.display || resource.class?.code) {
    parts.push(`Class: ${resource.class.display || resource.class.code}`)
  }

  const reasonCodes = (resource.reasonCode || []).map(getCodeableConceptText).filter(Boolean)
  if (reasonCodes.length) parts.push(`Reason: ${reasonCodes.join(', ')}`)

  const subject = getReferenceText(resource.subject)
  if (subject) parts.push(`Patient: ${subject}`)

  if (resource.period?.start) parts.push(`Start: ${resource.period.start}`)
  if (resource.period?.end) parts.push(`End: ${resource.period.end}`)

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'Encounter',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      status: resource.status,
      class: resource.class?.code,
      types: typeTexts,
      periodStart: resource.period?.start,
      periodEnd: resource.period?.end
    }
  }
}

function extractMedicationRequest(resource) {
  const parts = []

  const medText = getCodeableConceptText(resource.medicationCodeableConcept)
  if (medText) parts.push(medText)

  const reasonCodes = (resource.reasonCode || []).map(getCodeableConceptText).filter(Boolean)
  if (reasonCodes.length) parts.push(`Reason: ${reasonCodes.join(', ')}`)

  // Dosage instructions
  const dosages = resource.dosageInstruction || []
  for (const dosage of dosages) {
    if (dosage.text) parts.push(`Dosage: ${dosage.text}`)
    if (dosage.patientInstruction) parts.push(`Instructions: ${dosage.patientInstruction}`)
  }

  const narrative = getNarrativeText(resource)
  if (narrative) parts.push(narrative)

  return {
    resourceType: 'MedicationRequest',
    resourceId: resource.id,
    text: parts.join('. '),
    metadata: {
      status: resource.status,
      intent: resource.intent,
      medication: medText,
      authoredOn: resource.authoredOn
    }
  }
}

function extractGeneric(resource) {
  const narrative = getNarrativeText(resource)
  const codeText = resource.code ? getCodeableConceptText(resource.code) : ''

  const text = [codeText, narrative].filter(Boolean).join('. ')
  if (!text) return null

  return {
    resourceType: resource.resourceType,
    resourceId: resource.id,
    text,
    metadata: {
      status: resource.status
    }
  }
}

// ── Extractor registry ──────────────────────────────────────────────

const EXTRACTORS = {
  Patient: extractPatient,
  DocumentReference: extractDocumentReference,
  DiagnosticReport: extractDiagnosticReport,
  Observation: extractObservation,
  Condition: extractCondition,
  Encounter: extractEncounter,
  MedicationRequest: extractMedicationRequest
}

/**
 * List of resource types with dedicated extractors
 */
export const SUPPORTED_RESOURCE_TYPES = Object.keys(EXTRACTORS)
