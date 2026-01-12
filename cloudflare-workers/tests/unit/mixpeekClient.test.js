/**
 * Mixpeek Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MixpeekClient } from '../../src/api/mixpeekClient.js'

describe('MixpeekClient', () => {
  let client

  beforeEach(() => {
    client = new MixpeekClient({
      apiKey: 'test-api-key',
      endpoint: 'https://api.mixpeek.com',
      namespace: 'test-namespace',
      collectionId: 'test-collection',
      timeout: 5000,
      retryAttempts: 2
    })
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const defaultClient = new MixpeekClient({
        apiKey: 'key'
      })

      expect(defaultClient.endpoint).toBe('https://api.mixpeek.com')
      expect(defaultClient.timeout).toBe(5000)
      expect(defaultClient.retryAttempts).toBe(2)
    })

    it('should accept custom configuration', () => {
      expect(client.apiKey).toBe('test-api-key')
      expect(client.namespace).toBe('test-namespace')
      expect(client.collectionId).toBe('test-collection')
    })
  })

  describe('buildHeaders', () => {
    it('should include required headers', () => {
      const headers = client.buildHeaders()

      expect(headers['Content-Type']).toBe('application/json')
      expect(headers['Authorization']).toBe('Bearer test-api-key')
      expect(headers['User-Agent']).toContain('Mixpeek-Cloudflare-Worker')
    })

    it('should include namespace header when configured', () => {
      const headers = client.buildHeaders()
      expect(headers['X-Namespace']).toBe('test-namespace')
    })

    it('should not include namespace header when not configured', () => {
      const clientNoNamespace = new MixpeekClient({ apiKey: 'key' })
      const headers = clientNoNamespace.buildHeaders()
      expect(headers['X-Namespace']).toBeUndefined()
    })
  })

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'Technology and software development are important for business growth'
      const keywords = client.extractKeywords(text)

      expect(keywords).toBeInstanceOf(Array)
      expect(keywords.length).toBeGreaterThan(0)
      expect(keywords).toContain('technology')
      expect(keywords).toContain('software')
    })

    it('should filter stop words', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      const keywords = client.extractKeywords(text)

      expect(keywords).not.toContain('the')
      expect(keywords).not.toContain('over')
    })

    it('should return empty array for empty text', () => {
      expect(client.extractKeywords('')).toEqual([])
      expect(client.extractKeywords(null)).toEqual([])
    })

    it('should limit to top 15 keywords', () => {
      const longText = Array(100).fill('word1 word2 word3 word4 word5 unique').join(' ')
      const keywords = client.extractKeywords(longText)

      expect(keywords.length).toBeLessThanOrEqual(15)
    })
  })

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const text = 'This is an excellent, amazing, and wonderful product'
      const sentiment = client.analyzeSentiment(text)

      expect(sentiment.label).toBe('positive')
      expect(sentiment.score).toBeGreaterThan(0.5)
    })

    it('should detect negative sentiment', () => {
      const text = 'This is terrible, awful, and horrible'
      const sentiment = client.analyzeSentiment(text)

      expect(sentiment.label).toBe('negative')
      expect(sentiment.score).toBeLessThan(0.5)
    })

    it('should detect neutral sentiment', () => {
      const text = 'This is a regular product that exists'
      const sentiment = client.analyzeSentiment(text)

      expect(sentiment.label).toBe('neutral')
      expect(sentiment.score).toBe(0.5)
    })

    it('should return neutral for empty text', () => {
      const sentiment = client.analyzeSentiment('')
      expect(sentiment.label).toBe('neutral')
      expect(sentiment.score).toBe(0.5)
    })
  })

  describe('analyzeBrandSafety', () => {
    it('should flag unsafe content', () => {
      const text = 'This article discusses violence, murder, drugs, weapons, terrorism, and attack'
      const sentiment = { label: 'negative', score: 0.3 }
      const safety = client.analyzeBrandSafety(text, sentiment)

      // Should flag multiple categories
      expect(safety.categories.length).toBeGreaterThan(0)
      // Score should be below safe threshold
      expect(safety.score).toBeLessThan(0.7)
      // Level should not be safe
      expect(safety.level).not.toBe('safe')
    })

    it('should identify safe content', () => {
      const text = 'This is a wonderful article about technology and innovation'
      const sentiment = { label: 'positive', score: 0.8 }
      const safety = client.analyzeBrandSafety(text, sentiment)

      expect(safety.level).toBe('safe')
      expect(safety.categories.length).toBe(0)
      expect(safety.score).toBeGreaterThan(0.5)
    })

    it('should identify specific unsafe categories', () => {
      const text = 'The casino gambling industry and poker tournaments'
      const sentiment = { label: 'neutral', score: 0.5 }
      const safety = client.analyzeBrandSafety(text, sentiment)

      expect(safety.categories).toContain('gambling')
    })

    it('should return unknown for empty text', () => {
      const safety = client.analyzeBrandSafety('', { label: 'neutral', score: 0.5 })
      expect(safety.level).toBe('unknown')
    })
  })

  describe('inferTaxonomy', () => {
    it('should infer technology category', () => {
      const keywords = ['software', 'programming', 'developer', 'code']
      const taxonomy = client.inferTaxonomy(keywords, {})

      expect(taxonomy.label).toBe('Technology')
      expect(taxonomy.nodeId).toBe('technology')
    })

    it('should infer sports category', () => {
      const keywords = ['football', 'team', 'player', 'championship']
      const taxonomy = client.inferTaxonomy(keywords, {})

      expect(taxonomy.label).toBe('Sports')
    })

    it('should infer business category', () => {
      const keywords = ['company', 'market', 'investment', 'profit']
      const taxonomy = client.inferTaxonomy(keywords, {})

      expect(taxonomy.label).toBe('Business')
    })

    it('should return general for unmatched keywords', () => {
      const keywords = ['xyz', 'abc', 'random']
      const taxonomy = client.inferTaxonomy(keywords, {})

      expect(taxonomy.label).toBe('General')
      expect(taxonomy.score).toBe(0.5)
    })
  })

  describe('parseHTML', () => {
    it('should extract title', () => {
      const html = '<html><head><title>Test Page Title</title></head><body></body></html>'
      const result = client.parseHTML(html)

      expect(result.title).toBe('Test Page Title')
    })

    it('should extract meta description', () => {
      const html = '<html><head><meta name="description" content="Test description"></head><body></body></html>'
      const result = client.parseHTML(html)

      expect(result.description).toBe('Test description')
    })

    it('should extract article content', () => {
      const html = '<html><body><article>Article content here</article></body></html>'
      const result = client.parseHTML(html)

      expect(result.text).toContain('Article content')
    })

    it('should strip script and style tags', () => {
      const html = '<html><body><script>alert("test")</script><style>.foo{}</style><p>Real content</p></body></html>'
      const result = client.parseHTML(html)

      expect(result.text).not.toContain('alert')
      expect(result.text).not.toContain('.foo')
      expect(result.text).toContain('Real content')
    })
  })

  describe('stripHTML', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>'
      const text = client.stripHTML(html)

      expect(text).toBe('Hello world')
    })

    it('should normalize whitespace', () => {
      const html = '<p>Hello</p>  \n  <p>World</p>'
      const text = client.stripHTML(html)

      expect(text).toBe('Hello World')
    })
  })

  describe('extractTopics', () => {
    it('should extract topics from keywords', () => {
      const keywords = ['technology', 'software', 'innovation']
      const topics = client.extractTopics('some text', keywords)

      expect(topics.length).toBe(3)
      expect(topics[0].name).toBe('technology')
      expect(topics[0].relevance).toBe(0.8)
    })

    it('should limit to 5 topics', () => {
      const keywords = Array(10).fill(0).map((_, i) => `keyword${i}`)
      const topics = client.extractTopics('text', keywords)

      expect(topics.length).toBe(5)
    })
  })
})
