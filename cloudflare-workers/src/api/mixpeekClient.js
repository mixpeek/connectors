/**
 * Mixpeek API Client for Cloudflare Workers
 *
 * Optimized for edge runtime with:
 * - Built-in timeout handling
 * - Retry with exponential backoff
 * - Streaming support
 */

import { getIABFromTaxonomy, mapKeywordsToIAB } from '../utils/iabMapping.js'

export class MixpeekClient {
  constructor(config) {
    this.apiKey = config.apiKey
    this.endpoint = config.endpoint || 'https://api.mixpeek.com'
    this.namespace = config.namespace
    this.collectionId = config.collectionId
    this.timeout = config.timeout || 5000
    this.retryAttempts = config.retryAttempts || 2
  }

  /**
   * Build request headers
   */
  buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'Mixpeek-Cloudflare-Worker/1.0.0'
    }

    if (this.namespace) {
      headers['X-Namespace'] = this.namespace
    }

    return headers
  }

  /**
   * Make API request with timeout and retry
   */
  async request(path, options = {}) {
    const url = `${this.endpoint}${path}`
    const headers = this.buildHeaders()

    const fetchOptions = {
      ...options,
      headers: { ...headers, ...options.headers }
    }

    let lastError = null

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(`API error ${response.status}: ${errorBody}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error

        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${this.timeout}ms`)
        }

        // Don't retry on 4xx errors
        if (error.message && error.message.includes('API error 4')) {
          throw error
        }

        // Wait before retry with exponential backoff
        if (attempt < this.retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  /**
   * Analyze content and extract features
   */
  async analyzeContent({ url, content, extractors = [] }) {
    // Build the content payload
    const payload = {
      collection_id: this.collectionId
    }

    // If URL provided, fetch and analyze
    if (url) {
      payload.url = url

      // Try to fetch page content for better analysis
      try {
        const pageContent = await this.fetchPageContent(url)
        if (pageContent) {
          payload.content = pageContent.text
          payload.metadata = {
            url,
            title: pageContent.title,
            description: pageContent.description,
            timestamp: Date.now()
          }
        }
      } catch (error) {
        console.warn('Failed to fetch page content:', error.message)
        // Continue with URL-only analysis
      }
    }

    // If direct content provided
    if (content) {
      payload.content = content.text || content
      payload.metadata = {
        url: content.url,
        title: content.title,
        ...content.metadata
      }
    }

    // Call Mixpeek API to create document and get enrichments
    let document = null
    let enrichments = {}

    try {
      // Create document in collection
      document = await this.createDocument(payload)

      // Get enrichments from the document
      if (document.enrichments) {
        enrichments = document.enrichments
      }
    } catch (error) {
      console.warn('Mixpeek API call failed, using local analysis:', error.message)
    }

    // Build local enrichments as fallback or supplement
    const localEnrichments = this.buildLocalEnrichments(payload.content || '', payload.metadata)

    // Merge API enrichments with local fallbacks
    const mergedEnrichments = {
      taxonomy: enrichments.taxonomies?.[0] || localEnrichments.taxonomy,
      taxonomies: enrichments.taxonomies || [localEnrichments.taxonomy],
      keywords: enrichments.keywords || localEnrichments.keywords,
      sentiment: enrichments.sentiment || localEnrichments.sentiment,
      brandSafety: enrichments.brand_safety || localEnrichments.brandSafety,
      entities: enrichments.entities || [],
      topics: enrichments.topics || localEnrichments.topics
    }

    // Map to IAB taxonomy
    const iabCategory = getIABFromTaxonomy(mergedEnrichments.taxonomy)
    const iabCategories = mergedEnrichments.taxonomies
      .map(t => getIABFromTaxonomy(t))
      .filter(Boolean)

    return {
      documentId: document?.document_id || null,
      url: url || content?.url,
      title: payload.metadata?.title || '',
      ...mergedEnrichments,
      iab: {
        primary: iabCategory,
        all: [...new Set(iabCategories)],
        version: 6 // IAB Content Taxonomy v3.0
      }
    }
  }

  /**
   * Create document in Mixpeek collection
   */
  async createDocument(payload) {
    const path = `/v1/collections/${this.collectionId}/documents`

    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  /**
   * Fetch page content for analysis
   */
  async fetchPageContent(url) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mixpeek-ContentBot/1.0',
          'Accept': 'text/html'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return null
      }

      const html = await response.text()

      // Extract key content from HTML
      return this.parseHTML(html)
    } catch (error) {
      console.warn('Failed to fetch page:', error.message)
      return null
    }
  }

  /**
   * Parse HTML to extract content
   */
  parseHTML(html) {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
    const description = descMatch ? descMatch[1].trim() : ''

    // Extract og:description as fallback
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : ''

    // Extract main content (simplified)
    let text = ''

    // Try to get article content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch) {
      text = this.stripHTML(articleMatch[1])
    } else {
      // Get body content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        // Remove script and style tags
        let body = bodyMatch[1]
        body = body.replace(/<script[\s\S]*?<\/script>/gi, '')
        body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
        body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '')
        body = body.replace(/<footer[\s\S]*?<\/footer>/gi, '')
        body = body.replace(/<header[\s\S]*?<\/header>/gi, '')
        text = this.stripHTML(body)
      }
    }

    // Limit text length
    text = text.substring(0, 10000)

    return {
      title,
      description: description || ogDescription,
      text
    }
  }

  /**
   * Strip HTML tags from text
   */
  stripHTML(html) {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Build local enrichments (fallback analysis)
   */
  buildLocalEnrichments(text, metadata) {
    const keywords = this.extractKeywords(text)
    const sentiment = this.analyzeSentiment(text)
    const brandSafety = this.analyzeBrandSafety(text, sentiment)
    const taxonomy = this.inferTaxonomy(keywords, metadata)
    const topics = this.extractTopics(text, keywords)

    return {
      keywords,
      sentiment,
      brandSafety,
      taxonomy,
      topics
    }
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    if (!text) return []

    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of',
      'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
      'and', 'but', 'or', 'if', 'this', 'that', 'these', 'those', 'it', 'its',
      'you', 'your', 'we', 'our', 'they', 'their', 'he', 'she', 'his', 'her',
      'more', 'most', 'some', 'any', 'all', 'each', 'every', 'both', 'few',
      'than', 'then', 'now', 'just', 'only', 'also', 'very', 'much', 'many',
      'such', 'like', 'when', 'where', 'what', 'which', 'who', 'how', 'why',
      'been', 'being', 'here', 'there', 'about', 'out', 'up', 'down', 'over'
    ])

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))

    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word)
  }

  /**
   * Analyze sentiment
   */
  analyzeSentiment(text) {
    if (!text) return { label: 'neutral', score: 0.5 }

    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'best', 'love', 'happy', 'positive', 'success', 'win', 'awesome',
      'brilliant', 'perfect', 'beautiful', 'enjoy', 'exciting', 'innovative',
      'breakthrough', 'remarkable', 'outstanding', 'incredible', 'superb'
    ]

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad',
      'negative', 'fail', 'loss', 'poor', 'ugly', 'boring', 'disappointing',
      'wrong', 'problem', 'issue', 'error', 'crisis', 'danger', 'warning',
      'risk', 'threat', 'concern', 'trouble', 'difficult', 'controversy'
    ]

    const lowerText = text.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) positiveCount += matches.length
    })

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) negativeCount += matches.length
    })

    const total = positiveCount + negativeCount
    if (total === 0) return { label: 'neutral', score: 0.5 }

    const score = (positiveCount - negativeCount + total) / (2 * total)
    let label = 'neutral'
    if (score > 0.6) label = 'positive'
    else if (score < 0.4) label = 'negative'

    return { label, score: Math.round(score * 100) / 100 }
  }

  /**
   * Analyze brand safety
   */
  analyzeBrandSafety(text, sentiment) {
    if (!text) return { level: 'unknown', score: 0.5, categories: [] }

    const unsafePatterns = {
      violence: /\b(kill|murder|attack|assault|weapon|gun|shoot|bomb|terror|war|death|dead)\b/gi,
      adult: /\b(sex|porn|nude|explicit|xxx|adult content)\b/gi,
      hate: /\b(hate|racist|discrimination|slur|bigot)\b/gi,
      drugs: /\b(drug|cocaine|heroin|marijuana|cannabis|weed|overdose)\b/gi,
      gambling: /\b(gambling|casino|betting|poker|lottery)\b/gi,
      controversial: /\b(controversy|scandal|lawsuit|fraud|corrupt)\b/gi
    }

    const flaggedCategories = []
    let totalFlags = 0

    for (const [category, pattern] of Object.entries(unsafePatterns)) {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        flaggedCategories.push(category)
        totalFlags += matches.length
      }
    }

    // Calculate safety score (lower flags = higher safety)
    const baseScore = sentiment.score > 0.5 ? 0.7 : 0.5
    const penaltyPerFlag = 0.05
    const score = Math.max(0.1, baseScore - (totalFlags * penaltyPerFlag))

    let level = 'safe'
    if (score < 0.4) level = 'unsafe'
    else if (score < 0.6) level = 'caution'

    return {
      level,
      score: Math.round(score * 100) / 100,
      categories: flaggedCategories
    }
  }

  /**
   * Infer taxonomy from keywords and metadata
   */
  inferTaxonomy(keywords, metadata) {
    const categoryKeywords = {
      'Technology': ['technology', 'software', 'computer', 'digital', 'tech', 'programming', 'code', 'developer', 'app', 'mobile', 'ai', 'machine', 'learning', 'data', 'cloud', 'startup'],
      'Business': ['business', 'company', 'market', 'finance', 'investment', 'stock', 'economy', 'corporate', 'startup', 'entrepreneur', 'revenue', 'profit', 'growth'],
      'Sports': ['sports', 'game', 'team', 'player', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'golf', 'match', 'championship', 'league', 'score'],
      'Entertainment': ['movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'show', 'concert', 'entertainment', 'tv', 'television', 'streaming', 'netflix', 'disney'],
      'Health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'fitness', 'wellness', 'diet', 'nutrition', 'exercise', 'mental', 'therapy'],
      'News': ['news', 'breaking', 'report', 'politics', 'government', 'election', 'policy', 'world', 'international', 'president', 'congress', 'senate'],
      'Science': ['science', 'research', 'study', 'experiment', 'discovery', 'scientist', 'physics', 'chemistry', 'biology', 'space', 'nasa', 'climate'],
      'Automotive': ['car', 'vehicle', 'auto', 'automotive', 'driving', 'electric', 'engine', 'motor', 'truck', 'tesla', 'ev', 'hybrid'],
      'Travel': ['travel', 'vacation', 'hotel', 'flight', 'destination', 'tourism', 'trip', 'adventure', 'booking', 'airline'],
      'Food': ['food', 'recipe', 'cooking', 'restaurant', 'cuisine', 'chef', 'meal', 'dinner', 'lunch', 'breakfast'],
      'Fashion': ['fashion', 'style', 'clothing', 'designer', 'beauty', 'makeup', 'skincare', 'trend'],
      'Real Estate': ['real estate', 'property', 'home', 'house', 'apartment', 'mortgage', 'rent'],
      'Education': ['education', 'school', 'university', 'college', 'learning', 'student', 'teacher', 'course']
    }

    const scores = {}
    const lowerKeywords = keywords.map(k => k.toLowerCase())

    for (const [category, catKeywords] of Object.entries(categoryKeywords)) {
      scores[category] = 0
      for (const keyword of lowerKeywords) {
        if (catKeywords.some(ck => keyword.includes(ck) || ck.includes(keyword))) {
          scores[category]++
        }
      }
    }

    // Find best matching category
    const sorted = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])

    if (sorted.length === 0) {
      return {
        label: 'General',
        nodeId: 'general',
        path: ['Content', 'General'],
        score: 0.5
      }
    }

    const [topCategory, topScore] = sorted[0]
    const confidence = Math.min(0.95, 0.5 + (topScore * 0.1))

    return {
      label: topCategory,
      nodeId: topCategory.toLowerCase().replace(/\s+/g, '_'),
      path: ['Content', topCategory],
      score: confidence
    }
  }

  /**
   * Extract topics from content
   */
  extractTopics(text, keywords) {
    // Use top keywords as topics
    return keywords.slice(0, 5).map(keyword => ({
      name: keyword,
      relevance: 0.8
    }))
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.request('/v1/health', { method: 'GET' })
      return { status: 'ok', ...response }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
}

export default MixpeekClient
