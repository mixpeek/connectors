/**
 * Mixpeek API Client for Server-Side Use
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} apiKey - Mixpeek API key
 * @property {string} endpoint - API endpoint
 * @property {string} namespace - Mixpeek namespace
 * @property {number} timeout - Request timeout in ms
 */

export class MixpeekClient {
  constructor(config) {
    this.apiKey = config.apiKey
    this.endpoint = config.endpoint || 'https://api.mixpeek.com'
    this.namespace = config.namespace
    this.timeout = config.timeout || 200
  }

  /**
   * Make API request with timeout
   */
  async _request(path, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.endpoint}${path}`
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Namespace': this.namespace,
          'User-Agent': 'Mixpeek-Prebid-Server/1.0.0',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw {
          code: 'API_ERROR',
          status: response.status,
          message: error.message || response.statusText,
          path
        }
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw {
          code: 'API_TIMEOUT',
          message: `Request timeout after ${this.timeout}ms`,
          path
        }
      }

      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const start = Date.now()
    const result = await this._request('/v1/health', { method: 'GET' })
    return {
      ...result,
      latencyMs: Date.now() - start
    }
  }

  /**
   * Create document in collection
   */
  async createDocument(collectionId, payload) {
    const path = `/v1/collections/${collectionId}/documents`
    return this._request(path, {
      method: 'POST',
      body: JSON.stringify({
        collection_id: collectionId,
        content: payload.content,
        ...payload.metadata
      })
    })
  }

  /**
   * Process content and return enrichments
   */
  async processContent(collectionId, content) {
    try {
      // Create document
      const document = await this.createDocument(collectionId, {
        content: content.text || content.description || '',
        metadata: {
          url: content.url,
          title: content.title,
          timestamp: Date.now()
        }
      })

      // Build enrichments from content
      const enrichments = this._buildEnrichments(content)

      return {
        document_id: document.document_id,
        collection_id: document.collection_id,
        enrichments,
        taxonomy: this._inferTaxonomy(enrichments.keywords)
      }
    } catch (error) {
      // Graceful degradation
      const enrichments = this._buildEnrichments(content)
      return {
        document_id: null,
        collection_id: collectionId,
        enrichments,
        taxonomy: this._inferTaxonomy(enrichments.keywords),
        error: error.message
      }
    }
  }

  /**
   * Build enrichments from content
   */
  _buildEnrichments(content) {
    const text = content.text || content.description || content.title || ''
    return {
      keywords: this._extractKeywords(text),
      sentiment: this._analyzeSentiment(text),
      embeddings: [{ id: `emb_${this._hash(content.url || text)}` }]
    }
  }

  /**
   * Extract keywords
   */
  _extractKeywords(text) {
    if (!text) return []
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'and', 'but', 'or', 'if', 'this', 'that', 'it', 'its'])

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))

    const wordCount = {}
    words.forEach(word => { wordCount[word] = (wordCount[word] || 0) + 1 })

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  /**
   * Basic sentiment analysis
   */
  _analyzeSentiment(text) {
    if (!text) return { label: 'neutral', score: 0.5 }

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'happy', 'success', 'awesome', 'perfect', 'beautiful']
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'fail', 'poor', 'ugly', 'boring', 'wrong']

    const lowerText = text.toLowerCase()
    let positive = 0, negative = 0

    positiveWords.forEach(word => {
      const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi'))
      if (matches) positive += matches.length
    })
    negativeWords.forEach(word => {
      const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi'))
      if (matches) negative += matches.length
    })

    const total = positive + negative
    if (total === 0) return { label: 'neutral', score: 0.5 }

    const score = positive / total
    return {
      label: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral',
      score
    }
  }

  /**
   * Infer taxonomy from keywords
   */
  _inferTaxonomy(keywords) {
    const categoryMap = {
      'Technology': ['technology', 'software', 'computer', 'digital', 'tech', 'app', 'mobile', 'phone', 'ai'],
      'Business': ['business', 'company', 'market', 'finance', 'investment', 'stock', 'economy'],
      'Sports': ['sports', 'game', 'team', 'player', 'football', 'basketball', 'soccer'],
      'Entertainment': ['movie', 'film', 'music', 'celebrity', 'actor', 'show', 'entertainment'],
      'Health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'fitness'],
      'News': ['news', 'breaking', 'report', 'politics', 'government', 'election'],
      'Science': ['science', 'research', 'study', 'experiment', 'discovery']
    }

    const lowerKeywords = keywords.map(k => k.toLowerCase())
    for (const [category, catKeywords] of Object.entries(categoryMap)) {
      if (lowerKeywords.some(k => catKeywords.includes(k))) {
        return { label: category, score: 0.7, nodeId: `cat_${category.toLowerCase()}` }
      }
    }
    return { label: 'General', score: 0.5, nodeId: 'cat_general' }
  }

  /**
   * Simple hash function
   */
  _hash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }
}
