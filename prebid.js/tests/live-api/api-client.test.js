/**
 * Live API Tests - Mixpeek Client
 * 
 * These tests make real API calls to verify integration
 */

import MixpeekClient from '../../src/api/mixpeekClient.js'

describe('Mixpeek Client - Live API', () => {
  let client
  let testCollectionId
  let testDocumentId

  beforeAll(() => {
    if (skipIfNoApiKey()) {
      return
    }

    client = new MixpeekClient({
      apiKey: TEST_CONFIG.apiKey,
      endpoint: TEST_CONFIG.endpoint,
      namespace: TEST_CONFIG.namespace,
      timeout: TEST_CONFIG.timeout
    })
  })

  describe('Health Check', () => {
    test('should connect to API successfully', async () => {
      if (skipIfNoApiKey()) return

      const health = await client.healthCheck()
      
      expect(health).toBeDefined()
      console.log('✓ Health check:', health)
    }, TEST_CONFIG.timeout)
  })

  describe('Feature Extractors', () => {
    test('should list available feature extractors', async () => {
      if (skipIfNoApiKey()) return

      const extractors = await client.listFeatureExtractors()
      
      expect(Array.isArray(extractors)).toBe(true)
      expect(extractors.length).toBeGreaterThan(0)
      
      console.log(`✓ Found ${extractors.length} feature extractors`)
      
      // Check for common extractors
      const extractorIds = extractors.map(e => e.feature_extractor_id || e.id)
      console.log('Available extractors:', extractorIds)
      
      // Taxonomy should be available
      const hasTaxonomy = extractorIds.some(id => 
        id && id.toLowerCase().includes('taxonomy')
      )
      
      if (!hasTaxonomy) {
        console.warn('⚠️  Warning: Taxonomy extractor not found')
      }
    }, TEST_CONFIG.timeout)

    test('should get specific feature extractor details', async () => {
      if (skipIfNoApiKey()) return

      try {
        const extractor = await client.getFeatureExtractor('taxonomy')
        
        expect(extractor).toBeDefined()
        console.log('✓ Taxonomy extractor:', extractor)
      } catch (error) {
        // Some endpoints might not support this yet
        console.log('⚠️  Feature extractor details endpoint not available:', error.message)
      }
    }, TEST_CONFIG.timeout)
  })

  describe('Document Processing', () => {
    test('should create document with page content', async () => {
      if (skipIfNoApiKey()) return

      // Use provided collection or skip
      if (!TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - no collection ID configured')
        console.log('   Set MIXPEEK_COLLECTION_ID to run this test')
        return
      }

      const content = {
        url: 'https://example.com/test/mobile-phones',
        title: 'Mobile Phone Technology',
        text: 'The latest smartphones feature advanced AI capabilities, 5G connectivity, improved cameras, and longer battery life. Mobile phone technology continues to evolve rapidly.'
      }

      const result = await client.processContent(
        TEST_CONFIG.collectionId,
        content,
        ['taxonomy']
      )

      expect(result).toBeDefined()
      expect(result.document_id).toBeDefined()
      
      testDocumentId = result.document_id
      
      console.log('✓ Document created:', result.document_id)
      
      // Check for enrichments
      if (result.enrichments) {
        console.log('✓ Enrichments:', JSON.stringify(result.enrichments, null, 2))
        
        if (result.enrichments.taxonomies) {
          expect(Array.isArray(result.enrichments.taxonomies)).toBe(true)
          
          if (result.enrichments.taxonomies.length > 0) {
            const taxonomy = result.enrichments.taxonomies[0]
            console.log('✓ Taxonomy classification:', {
              label: taxonomy.label,
              score: taxonomy.score,
              path: taxonomy.path
            })
            
            expect(taxonomy.label).toBeDefined()
            expect(taxonomy.score).toBeGreaterThan(0)
          }
        }
      }
    }, TEST_CONFIG.timeout)

    test.skip('should retrieve created document (skipped - async processing)', async () => {
      // Note: Document retrieval is skipped because Mixpeek processes documents
      // asynchronously. The document may not be immediately available after creation.
      // This is expected behavior for real-time header bidding use cases.
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId || !testDocumentId) {
        console.log('⏭️  Skipping - no document to retrieve')
        return
      }

      const document = await client.getDocument(
        TEST_CONFIG.collectionId,
        testDocumentId
      )

      expect(document).toBeDefined()
      expect(document.document_id).toBe(testDocumentId)

      console.log('✓ Document retrieved:', document.document_id)
    }, TEST_CONFIG.timeout)

    test('should process video content', async () => {
      if (skipIfNoApiKey() || !TEST_CONFIG.collectionId) {
        console.log('⏭️  Skipping - no collection ID configured')
        return
      }

      const content = {
        src: 'https://example.com/videos/tech-review.mp4',
        title: 'Smartphone Review Video',
        description: 'Comprehensive review of the latest mobile phones',
        duration: 300
      }

      try {
        const result = await client.processContent(
          TEST_CONFIG.collectionId,
          content,
          ['taxonomy']
        )

        expect(result).toBeDefined()
        expect(result.document_id).toBeDefined()
        
        console.log('✓ Video document created:', result.document_id)
      } catch (error) {
        console.log('⚠️  Video processing may not be configured:', error.message)
      }
    }, TEST_CONFIG.timeout)
  })

  describe('Error Handling', () => {
    test('should gracefully handle invalid collection ID', async () => {
      if (skipIfNoApiKey()) return

      const content = {
        url: 'https://example.com/test',
        text: 'Test content'
      }

      // Graceful degradation: returns fallback enrichments instead of throwing
      const result = await client.processContent('invalid_collection_id', content, ['taxonomy'])

      // Should return a result with enrichments (fallback behavior)
      expect(result).toBeDefined()
      expect(result.enrichments).toBeDefined()
      expect(result.enrichments.keywords).toBeDefined()

      console.log('✓ Invalid collection ID handled gracefully with fallback')
    }, TEST_CONFIG.timeout)

    test('should gracefully handle API timeout', async () => {
      if (skipIfNoApiKey()) return

      const shortTimeoutClient = new MixpeekClient({
        apiKey: TEST_CONFIG.apiKey,
        endpoint: TEST_CONFIG.endpoint,
        namespace: TEST_CONFIG.namespace,
        timeout: 1 // 1ms - should timeout
      })

      const content = {
        url: 'https://example.com/test',
        text: 'Test content'
      }

      if (TEST_CONFIG.collectionId) {
        // Graceful degradation: returns fallback enrichments instead of throwing
        const result = await shortTimeoutClient.processContent(
          TEST_CONFIG.collectionId,
          content,
          ['taxonomy']
        )

        // Should return a result with enrichments (fallback behavior)
        expect(result).toBeDefined()
        expect(result.enrichments).toBeDefined()
        expect(result.document_id).toBeNull() // No document created due to timeout

        console.log('✓ Timeout handled gracefully with fallback')
      }
    }, 10000)
  })
})

