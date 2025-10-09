/**
 * Tests for Mixpeek API client
 */

import MixpeekClient from '../../src/api/mixpeekClient.js'
import { ERROR_CODES } from '../../src/config/constants.js'

describe('MixpeekClient', () => {
  let client

  beforeEach(() => {
    client = new MixpeekClient({
      apiKey: 'test-api-key',
      endpoint: 'https://api.mixpeek.com',
      timeout: 1000
    })

    // Reset fetch mock
    global.fetch.mockClear()
  })

  describe('configuration', () => {
    it('should initialize with config', () => {
      expect(client.apiKey).toBe('test-api-key')
      expect(client.endpoint).toBe('https://api.mixpeek.com')
      expect(client.timeout).toBe(1000)
    })

    it('should update config', () => {
      client.configure({ apiKey: 'new-key' })
      expect(client.apiKey).toBe('new-key')
    })
  })

  describe('createDocument', () => {
    it('should create document successfully', async () => {
      const mockResponse = {
        document_id: 'doc_123',
        object_id: 'obj_123'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const result = await client.createDocument('col_123', {
        objectId: 'obj_123',
        metadata: {},
        features: []
      })

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid request' })
      })

      await expect(
        client.createDocument('col_123', {})
      ).rejects.toMatchObject({
        code: ERROR_CODES.API_ERROR,
        status: 400
      })
    })

    it('should handle timeouts', async () => {
      client.timeout = 100

      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 200))
      )

      await expect(
        client.createDocument('col_123', {})
      ).rejects.toMatchObject({
        code: ERROR_CODES.API_TIMEOUT
      })
    })
  })

  describe('processContent', () => {
    it('should process content with feature extractors', async () => {
      const mockResponse = {
        document_id: 'doc_123',
        enrichments: {
          taxonomies: [
            {
              label: 'Technology',
              node_id: 'node_tech',
              path: ['tech'],
              score: 0.95
            }
          ]
        }
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const content = {
        url: 'https://example.com/article',
        title: 'Test Article',
        text: 'Article content'
      }

      const result = await client.processContent('col_123', content, ['taxonomy'])

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('headers', () => {
    it('should include authorization header', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await client.createDocument('col_123', {})

      const call = global.fetch.mock.calls[0]
      const headers = call[1].headers

      expect(headers.Authorization).toBe('Bearer test-api-key')
    })

    it('should include namespace header if provided', async () => {
      client.namespace = 'test-namespace'

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await client.createDocument('col_123', {})

      const call = global.fetch.mock.calls[0]
      const headers = call[1].headers

      expect(headers['X-Namespace']).toBe('test-namespace')
    })
  })

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      client.retryAttempts = 2

      // Fail twice, then succeed
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ document_id: 'doc_123' })
        })

      const result = await client.createDocument('col_123', {})

      expect(result.document_id).toBe('doc_123')
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })
})

