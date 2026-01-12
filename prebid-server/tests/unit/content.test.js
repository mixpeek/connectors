/**
 * Unit Tests - Content Extraction
 */

import { extractContent, buildContent } from '../../src/content.js'

describe('Content Extraction', () => {
  describe('extractContent', () => {
    test('should return null for null input', () => {
      expect(extractContent(null)).toBeNull()
    })

    test('should return null for empty bid request', () => {
      expect(extractContent({})).toBeNull()
    })

    test('should extract site.page as url', () => {
      const bidRequest = {
        site: { page: 'https://example.com/article' }
      }

      const content = extractContent(bidRequest)

      expect(content.url).toBe('https://example.com/article')
    })

    test('should extract site.content fields', () => {
      const bidRequest = {
        site: {
          page: 'https://example.com',
          content: {
            url: 'https://example.com/article',
            title: 'Test Article',
            keywords: 'test,article',
            language: 'en'
          }
        }
      }

      const content = extractContent(bidRequest)

      expect(content.url).toBe('https://example.com/article')
      expect(content.title).toBe('Test Article')
      expect(content.keywords).toBe('test,article')
      expect(content.language).toBe('en')
    })

    test('should extract from app object', () => {
      const bidRequest = {
        app: {
          name: 'Test App',
          bundle: 'com.example.app',
          domain: 'example.com'
        }
      }

      const content = extractContent(bidRequest)

      expect(content.title).toBe('Test App')
      expect(content.url).toBe('app://com.example.app')
      expect(content.domain).toBe('example.com')
    })

    test('should prefer site.content.url over site.page', () => {
      const bidRequest = {
        site: {
          page: 'https://example.com',
          content: {
            url: 'https://example.com/specific-article'
          }
        }
      }

      const content = extractContent(bidRequest)

      expect(content.url).toBe('https://example.com/specific-article')
    })

    test('should extract description from ext', () => {
      const bidRequest = {
        site: {
          page: 'https://example.com',
          content: {
            ext: {
              description: 'This is a test article'
            }
          }
        }
      }

      const content = extractContent(bidRequest)

      expect(content.description).toBe('This is a test article')
    })
  })

  describe('buildContent', () => {
    test('should build content with all fields', () => {
      const content = buildContent({
        url: 'https://example.com',
        title: 'Test',
        text: 'Content text',
        description: 'Description',
        language: 'en'
      })

      expect(content.url).toBe('https://example.com')
      expect(content.title).toBe('Test')
      expect(content.text).toBe('Content text')
      expect(content.description).toBe('Description')
      expect(content.language).toBe('en')
    })

    test('should default language to en', () => {
      const content = buildContent({})

      expect(content.language).toBe('en')
    })

    test('should handle empty options', () => {
      const content = buildContent()

      expect(content.url).toBeNull()
      expect(content.title).toBeNull()
      expect(content.language).toBe('en')
    })
  })
})
