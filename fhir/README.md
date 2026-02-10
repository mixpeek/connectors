# @mixpeek/fhir

Mixpeek FHIR Connector - Enrich FHIR R4 clinical resources with multimodal AI-powered content analysis.

## Overview

This connector extracts text content from FHIR R4 resources (Patient, Observation, Condition, DocumentReference, etc.), processes it through Mixpeek's multimodal AI platform, and returns enrichment as FHIR-compatible extensions and meta tags.

### Supported Resource Types

| Resource Type | Extracted Fields |
|---------------|-----------------|
| Patient | Names, demographics, addresses, narrative |
| DocumentReference | Description, type, category, attachment text |
| DiagnosticReport | Code, conclusion, conclusion codes, category |
| Observation | Code, values (quantity/codeable/string), components, interpretation |
| Condition | Code, clinical status, severity, onset, category |
| Encounter | Type, class, reason codes, period |
| MedicationRequest | Medication, reason codes, dosage instructions |

All other resource types fall back to narrative text extraction (`resource.text.div`).

## Installation

```bash
npm install @mixpeek/fhir
```

## Quick Start

```javascript
import { createEnricher } from '@mixpeek/fhir'

const enricher = createEnricher({
  apiKey: 'your-mixpeek-api-key',
  collectionId: 'your-collection-id',
  namespace: 'ns_your_namespace'
})

// Enrich a single FHIR resource
const patient = {
  resourceType: 'Patient',
  id: 'patient-1',
  name: [{ given: ['John'], family: 'Doe' }],
  gender: 'male',
  birthDate: '1990-01-15'
}

const result = await enricher.enrich(patient)
console.log(result.resource)       // Patient with Mixpeek extensions added
console.log(result.enrichment)     // FHIR extensions and meta tags
console.log(result.extracted)      // What text was extracted
```

## Configuration

```javascript
const enricher = createEnricher({
  // Required
  apiKey: 'your-api-key',           // Mixpeek API key
  collectionId: 'col_xxxxx',        // Target collection for documents
  namespace: 'ns_xxxxx',            // Mixpeek namespace

  // Optional
  endpoint: 'https://api.mixpeek.com',  // API endpoint
  timeout: 5000,                         // Request timeout (ms)
  enableCache: true,                     // In-memory caching
  cacheTTL: 300                          // Cache TTL (seconds)
})
```

## API

### `enricher.enrich(resource)`

Enrich a single FHIR resource. Returns the resource with Mixpeek extensions and meta tags merged in.

```javascript
const result = await enricher.enrich(observation)
// result.resource     - Enriched FHIR resource
// result.enrichment   - { extensions, tags, context }
// result.extracted    - { resourceType, resourceId, text, metadata }
// result.latencyMs    - Processing time
// result.cached       - Whether result came from cache
```

### `enricher.enrichBundle(bundle)`

Enrich all resources in a FHIR Bundle.

```javascript
const result = await enricher.enrichBundle(searchsetBundle)
// result.bundle   - Bundle with enriched entries
// result.results  - Per-entry enrichment results
```

### `enricher.extract(resource)`

Extract text content from a resource without calling Mixpeek. Useful for previewing what text will be sent.

```javascript
const extracted = enricher.extract(condition)
// { resourceType: 'Condition', resourceId: 'cond-1', text: '...', metadata: {...} }
```

### `enricher.strip(resource)`

Remove all Mixpeek enrichment extensions and tags from a resource.

```javascript
const clean = enricher.strip(enrichedResource)
```

### `enricher.healthCheck()`

Check Mixpeek API connectivity.

### `enricher.getSupportedResourceTypes()`

Returns the list of resource types with dedicated extractors.

## FHIR Extensions

Enrichment is stored as FHIR extensions under:

```
https://mixpeek.com/fhir/StructureDefinition/enrichment/
```

| Extension | Type | Description |
|-----------|------|-------------|
| `/document-id` | valueString | Mixpeek document ID |
| `/collection-id` | valueString | Mixpeek collection ID |
| `/keywords` | valueString | Comma-separated keywords |
| `/taxonomy` | complex | Label + score |
| `/sentiment` | complex | Label + score |

Meta tags use the code systems:
- `https://mixpeek.com/fhir/CodeSystem/keyword`
- `https://mixpeek.com/fhir/CodeSystem/taxonomy`

## Testing

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:live     # Live API tests (requires MIXPEEK_API_KEY)
```

## License

Apache 2.0
