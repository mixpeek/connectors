/**
 * Unit Tests - FHIR Content Extraction
 */

import { extractContent, extractBundle, SUPPORTED_RESOURCE_TYPES } from '../../src/extract.js'

describe('extractContent', () => {
  test('should return null for null/undefined input', () => {
    expect(extractContent(null)).toBeNull()
    expect(extractContent(undefined)).toBeNull()
    expect(extractContent({})).toBeNull()
  })

  test('should extract Patient', () => {
    const patient = {
      resourceType: 'Patient',
      id: 'p1',
      name: [
        { prefix: ['Mr'], given: ['John', 'Michael'], family: 'Doe' }
      ],
      gender: 'male',
      birthDate: '1985-03-15',
      address: [
        { line: ['123 Main St'], city: 'Springfield', state: 'IL', postalCode: '62701' }
      ]
    }

    const result = extractContent(patient)

    expect(result.resourceType).toBe('Patient')
    expect(result.resourceId).toBe('p1')
    expect(result.text).toContain('John')
    expect(result.text).toContain('Doe')
    expect(result.text).toContain('male')
    expect(result.text).toContain('1985-03-15')
    expect(result.text).toContain('Springfield')
    expect(result.metadata.gender).toBe('male')
  })

  test('should extract DocumentReference', () => {
    const docRef = {
      resourceType: 'DocumentReference',
      id: 'dr1',
      status: 'current',
      type: {
        coding: [{ display: 'Discharge Summary' }],
        text: 'Discharge Summary'
      },
      description: 'Patient discharge summary for hospital visit',
      category: [
        { coding: [{ display: 'Clinical Note' }] }
      ],
      content: [
        { attachment: { contentType: 'text/plain', title: 'Summary Document' } }
      ]
    }

    const result = extractContent(docRef)

    expect(result.resourceType).toBe('DocumentReference')
    expect(result.text).toContain('Discharge Summary')
    expect(result.text).toContain('discharge summary')
    expect(result.text).toContain('Clinical Note')
    expect(result.metadata.status).toBe('current')
    expect(result.metadata.type).toBe('Discharge Summary')
  })

  test('should extract DiagnosticReport', () => {
    const report = {
      resourceType: 'DiagnosticReport',
      id: 'diag1',
      status: 'final',
      code: {
        coding: [{ display: 'Complete Blood Count' }]
      },
      conclusion: 'All values within normal range',
      conclusionCode: [
        { coding: [{ display: 'Normal' }] }
      ]
    }

    const result = extractContent(report)

    expect(result.resourceType).toBe('DiagnosticReport')
    expect(result.text).toContain('Complete Blood Count')
    expect(result.text).toContain('normal range')
    expect(result.metadata.code).toBe('Complete Blood Count')
  })

  test('should extract Observation with quantity value', () => {
    const obs = {
      resourceType: 'Observation',
      id: 'obs1',
      status: 'final',
      code: { text: 'Blood Pressure' },
      component: [
        {
          code: { text: 'Systolic' },
          valueQuantity: { value: 120, unit: 'mmHg' }
        },
        {
          code: { text: 'Diastolic' },
          valueQuantity: { value: 80, unit: 'mmHg' }
        }
      ]
    }

    const result = extractContent(obs)

    expect(result.text).toContain('Blood Pressure')
    expect(result.text).toContain('Systolic')
    expect(result.text).toContain('120')
    expect(result.text).toContain('Diastolic')
    expect(result.text).toContain('80')
  })

  test('should extract Observation with codeable concept value', () => {
    const obs = {
      resourceType: 'Observation',
      id: 'obs2',
      code: { text: 'Blood Type' },
      valueCodeableConcept: {
        coding: [{ display: 'A positive' }]
      }
    }

    const result = extractContent(obs)
    expect(result.text).toContain('A positive')
  })

  test('should extract Condition', () => {
    const condition = {
      resourceType: 'Condition',
      id: 'cond1',
      code: { text: 'Type 2 Diabetes Mellitus' },
      clinicalStatus: { coding: [{ display: 'Active' }] },
      severity: { coding: [{ display: 'Moderate' }] },
      onsetDateTime: '2020-06-15'
    }

    const result = extractContent(condition)

    expect(result.text).toContain('Type 2 Diabetes')
    expect(result.text).toContain('Active')
    expect(result.text).toContain('Moderate')
    expect(result.text).toContain('2020-06-15')
  })

  test('should extract Encounter', () => {
    const encounter = {
      resourceType: 'Encounter',
      id: 'enc1',
      status: 'finished',
      class: { code: 'IMP', display: 'Inpatient' },
      type: [{ coding: [{ display: 'Annual checkup' }] }],
      reasonCode: [{ text: 'Routine examination' }],
      period: { start: '2024-01-15', end: '2024-01-15' }
    }

    const result = extractContent(encounter)

    expect(result.text).toContain('Annual checkup')
    expect(result.text).toContain('Inpatient')
    expect(result.text).toContain('Routine examination')
    expect(result.metadata.class).toBe('IMP')
  })

  test('should extract MedicationRequest', () => {
    const medReq = {
      resourceType: 'MedicationRequest',
      id: 'med1',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Metformin 500mg' },
      reasonCode: [{ text: 'Type 2 Diabetes' }],
      dosageInstruction: [
        { text: '500mg twice daily', patientInstruction: 'Take with food' }
      ]
    }

    const result = extractContent(medReq)

    expect(result.text).toContain('Metformin 500mg')
    expect(result.text).toContain('Type 2 Diabetes')
    expect(result.text).toContain('twice daily')
    expect(result.text).toContain('Take with food')
    expect(result.metadata.medication).toBe('Metformin 500mg')
  })

  test('should use narrative text as fallback for unknown resources', () => {
    const resource = {
      resourceType: 'AllergyIntolerance',
      id: 'allergy1',
      text: {
        status: 'generated',
        div: '<div>Patient is allergic to <b>penicillin</b></div>'
      }
    }

    const result = extractContent(resource)

    expect(result).toBeDefined()
    expect(result.text).toContain('penicillin')
    expect(result.text).not.toContain('<div>')
  })
})

describe('extractBundle', () => {
  test('should return empty array for non-Bundle', () => {
    expect(extractBundle(null)).toEqual([])
    expect(extractBundle({ resourceType: 'Patient' })).toEqual([])
  })

  test('should extract content from all Bundle entries', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'p1',
            name: [{ given: ['Alice'], family: 'Smith' }]
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'c1',
            code: { text: 'Hypertension' }
          }
        }
      ]
    }

    const results = extractBundle(bundle)

    expect(results).toHaveLength(2)
    expect(results[0].resourceType).toBe('Patient')
    expect(results[1].resourceType).toBe('Condition')
  })
})

describe('SUPPORTED_RESOURCE_TYPES', () => {
  test('should include common clinical resource types', () => {
    expect(SUPPORTED_RESOURCE_TYPES).toContain('Patient')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('Observation')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('Condition')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('DiagnosticReport')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('DocumentReference')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('Encounter')
    expect(SUPPORTED_RESOURCE_TYPES).toContain('MedicationRequest')
  })
})
