/**
 * IAB Content Taxonomy Mapping
 * @module utils/iabMapping
 * 
 * Maps Mixpeek taxonomy to IAB Content Taxonomy v3.0 codes
 * Reference: https://iabtechlab.com/standards/content-taxonomy/
 * 
 * ✅ VERIFIED: Mixpeek Response Format (from OpenAPI spec)
 * 
 * Mixpeek returns TaxonomyAssignment objects in enrichments.taxonomies:
 * ```javascript
 * {
 *   "taxonomy_id": "tax_products",
 *   "node_id": "node_electronics_phones",  // ← Custom Mixpeek node ID
 *   "path": ["products", "electronics", "phones"],
 *   "label": "Mobile Phones",  // Human-readable label
 *   "score": 0.87
 * }
 * ```
 * 
 * This means we're in **Scenario B**: Mixpeek uses custom node_ids like
 * "node_electronics_phones" that need to be mapped to IAB codes like "IAB19-20".
 * 
 * Three mapping strategies (in order of priority):
 * 
 * 1. **Check if already IAB** (safety check)
 *    - If node_id or label contains IAB code pattern, use it directly
 * 
 * 2. **Map by node_id** (primary method) ⭐
 *    - Map Mixpeek node_id → IAB code using MIXPEEK_NODE_TO_IAB
 *    - Most reliable when properly configured
 *    - Requires discovering actual node_ids from your taxonomy
 * 
 * 3. **Map by label** (fallback)
 *    - Map human-readable labels to IAB codes
 *    - Less precise but provides coverage
 * 
 * To populate the mapping with YOUR taxonomy's node_ids:
 * ```bash
 * # Run the verification script to discover node_ids
 * MIXPEEK_API_KEY=your_key COLLECTION_ID=your_collection \
 *   node scripts/verify-mixpeek-taxonomy.js
 * 
 * # This will show you the actual node_id values like:
 * # node_id: "node_electronics_phones" → Map to: IAB19-20
 * # node_id: "node_sports_football" → Map to: IAB17-3
 * ```
 */

/**
 * IAB Taxonomy version identifier
 * IAB Tech Lab Content Taxonomy v3.0 = 6
 */
export const IAB_TAXONOMY_VERSION = 6

/**
 * Map Mixpeek node_ids to IAB codes
 * 
 * ✅ CONFIRMED: Mixpeek uses custom node_ids (from OpenAPI spec)
 * Example from spec: "node_electronics_phones" → should map to "IAB19-20"
 * 
 * ⚠️ TODO: Populate with YOUR taxonomy's actual node_ids
 * The placeholders below use common patterns, but you need to run the
 * verification script to get the exact node_ids from YOUR Mixpeek taxonomy.
 * 
 * Format: 'mixpeek_node_id': 'IAB_CODE'
 * 
 * To discover YOUR node_ids:
 *   1. Run: node scripts/verify-mixpeek-taxonomy.js
 *   2. Note the node_id values returned
 *   3. Map each to the appropriate IAB code
 * 
 * Example mapping (update with your actual node_ids):
 *   'node_tech_ai': 'IAB19-11',           // Tech > AI
 *   'node_electronics_phones': 'IAB19-20', // Mobile/Phones
 *   'node_sports_football': 'IAB17-3',     // Sports > Football
 */
export const MIXPEEK_NODE_TO_IAB = {
  // Technology & Computing (IAB19)
  // Replace these with actual node_ids from YOUR Mixpeek taxonomy
  'node_technology': 'IAB19',
  'node_tech_computing': 'IAB19',
  'node_tech_ai': 'IAB19-11',
  'node_tech_artificial_intelligence': 'IAB19-11',
  'node_tech_machine_learning': 'IAB19-11',
  'node_tech_software': 'IAB19-18',
  'node_tech_hardware': 'IAB19-19',
  'node_tech_mobile': 'IAB19-20',
  'node_electronics_phones': 'IAB19-20',  // From OpenAPI example
  'node_tech_internet': 'IAB19-21',
  
  // Sports (IAB17)
  'sports': 'IAB17',
  'sports_football': 'IAB17-3',
  'sports_soccer': 'IAB17-44',
  'sports_basketball': 'IAB17-4',
  'sports_baseball': 'IAB17-5',
  'sports_tennis': 'IAB17-37',
  
  // News (IAB12)
  'news': 'IAB12',
  'news_politics': 'IAB12-2',
  'news_business': 'IAB12-3',
  'news_technology': 'IAB12-6',
  
  // Business & Finance (IAB13)
  'business': 'IAB13',
  'business_finance': 'IAB13-7',
  'business_investing': 'IAB13-5',
  
  // Entertainment (IAB9)
  'entertainment': 'IAB9',
  'entertainment_movies': 'IAB9-7',
  'entertainment_tv': 'IAB9-23',
  'entertainment_music': 'IAB9-8',
  
  // Health & Fitness (IAB7)
  'health': 'IAB7',
  'health_fitness': 'IAB7-18',
  'health_nutrition': 'IAB7-30',
  
  // Travel (IAB20)
  'travel': 'IAB20',
  'travel_hotels': 'IAB20-12',
  
  // Food & Drink (IAB8)
  'food': 'IAB8',
  'food_cooking': 'IAB8-5',
  'food_restaurants': 'IAB8-9',
  
  // Automotive (IAB2)
  'automotive': 'IAB2',
  'automotive_cars': 'IAB2',
  
  // Real Estate (IAB21)
  'real_estate': 'IAB21',
  
  // Education (IAB5)
  'education': 'IAB5',
  
  // Fashion & Style (IAB18)
  'fashion': 'IAB18',
  'fashion_beauty': 'IAB18-1',
  
  // Home & Garden (IAB10)
  'home': 'IAB10',
  'home_garden': 'IAB10-3',
  
  // Science (IAB15)
  'science': 'IAB15',
  
  // Arts (IAB1)
  'arts': 'IAB1',
  'arts_design': 'IAB1-4'
}

/**
 * Fallback label-based mapping (Scenario C)
 * Used when node_id mapping fails
 */
export const LABEL_TO_IAB = {
  // Technology patterns
  'technology': 'IAB19',
  'tech': 'IAB19',
  'ai': 'IAB19-11',
  'artificial intelligence': 'IAB19-11',
  'machine learning': 'IAB19-11',
  'software': 'IAB19-18',
  'hardware': 'IAB19-19',
  'mobile': 'IAB19-20',
  'computing': 'IAB19',
  
  // Sports patterns
  'sports': 'IAB17',
  'football': 'IAB17-3',
  'soccer': 'IAB17-44',
  'basketball': 'IAB17-4',
  'baseball': 'IAB17-5',
  
  // News patterns
  'news': 'IAB12',
  'politics': 'IAB12-2',
  
  // Business patterns
  'business': 'IAB13',
  'finance': 'IAB13-7',
  'investing': 'IAB13-5',
  
  // Entertainment patterns
  'entertainment': 'IAB9',
  'movies': 'IAB9-7',
  'television': 'IAB9-23',
  'music': 'IAB9-8',
  'gaming': 'IAB9-30',
  
  // Health patterns
  'health': 'IAB7',
  'fitness': 'IAB7-18',
  'wellness': 'IAB7',
  'nutrition': 'IAB7-30',
  
  // Other categories
  'travel': 'IAB20',
  'food': 'IAB8',
  'automotive': 'IAB2',
  'cars': 'IAB2',
  'real estate': 'IAB21',
  'education': 'IAB5',
  'fashion': 'IAB18',
  'home': 'IAB10',
  'science': 'IAB15',
  'arts': 'IAB1'
}

/**
 * Check if a string is already a valid IAB category code
 * @param {string} value - Potential IAB code
 * @returns {boolean} True if valid IAB code format
 */
export function isValidIABCode(value) {
  if (!value || typeof value !== 'string') return false
  return /^IAB\d+(-\d+)?$/.test(value)
}

/**
 * Extract IAB code from a string if present
 * @param {string} value - String that might contain IAB code
 * @returns {string|null} IAB code if found, null otherwise
 */
export function extractIABCode(value) {
  if (!value || typeof value !== 'string') return null
  const match = value.match(/IAB\d+(-\d+)?/)
  return match ? match[0] : null
}

/**
 * Map Mixpeek taxonomy to IAB code using multiple strategies
 * @param {object} taxonomy - Mixpeek taxonomy object with {label, node_id, path, score}
 * @returns {string|null} IAB category code or null if not found
 */
export function getIABFromTaxonomy(taxonomy) {
  if (!taxonomy) return null
  
  // Strategy 1: Check if label is already an IAB code (Scenario A)
  if (taxonomy.label) {
    if (isValidIABCode(taxonomy.label)) {
      return taxonomy.label
    }
    
    // Check if label contains IAB code
    const iabInLabel = extractIABCode(taxonomy.label)
    if (iabInLabel) {
      return iabInLabel
    }
  }
  
  // Strategy 2: Check if node_id is an IAB code (Scenario A)
  if (taxonomy.nodeId || taxonomy.node_id) {
    const nodeId = taxonomy.nodeId || taxonomy.node_id
    
    if (isValidIABCode(nodeId)) {
      return nodeId
    }
    
    // Check if node_id contains IAB code
    const iabInNode = extractIABCode(nodeId)
    if (iabInNode) {
      return iabInNode
    }
  }
  
  // Strategy 3: Map by Mixpeek node_id (Scenario B)
  if (taxonomy.nodeId || taxonomy.node_id) {
    const nodeId = (taxonomy.nodeId || taxonomy.node_id).toLowerCase()
    
    // Direct match
    if (MIXPEEK_NODE_TO_IAB[nodeId]) {
      return MIXPEEK_NODE_TO_IAB[nodeId]
    }
    
    // Try without underscores/hyphens
    const normalizedNode = nodeId.replace(/[_-]/g, '')
    for (const [key, value] of Object.entries(MIXPEEK_NODE_TO_IAB)) {
      if (key.replace(/[_-]/g, '') === normalizedNode) {
        return value
      }
    }
  }
  
  // Strategy 4: Map by label text (Scenario C - fallback)
  if (taxonomy.label) {
    const label = taxonomy.label.toLowerCase()
    
    // Direct match
    if (LABEL_TO_IAB[label]) {
      return LABEL_TO_IAB[label]
    }
    
    // Try partial matches
    for (const [key, value] of Object.entries(LABEL_TO_IAB)) {
      if (label.includes(key)) {
        return value
      }
    }
  }
  
  // Strategy 5: Try path if available
  if (taxonomy.path) {
    const pathString = Array.isArray(taxonomy.path) 
      ? taxonomy.path.join(' ').toLowerCase()
      : taxonomy.path.toLowerCase()
    
    for (const [key, value] of Object.entries(LABEL_TO_IAB)) {
      if (pathString.includes(key)) {
        return value
      }
    }
  }
  
  return null
}

/**
 * Map multiple taxonomies to IAB codes
 * @param {Array<object>} taxonomies - Array of taxonomy objects
 * @returns {Array<string>} Array of IAB codes (duplicates removed)
 */
export function mapTaxonomiesToIAB(taxonomies) {
  if (!Array.isArray(taxonomies)) return []
  
  const iabCodes = taxonomies
    .map(tax => getIABFromTaxonomy(tax))
    .filter(code => code !== null)
  
  // Remove duplicates
  return [...new Set(iabCodes)]
}

/**
 * Map categories to IAB codes (deprecated - use getIABFromTaxonomy)
 * @deprecated Use getIABFromTaxonomy for taxonomy objects
 * @param {Array<string>} categories - Array of category strings
 * @returns {Array<string>} Array of IAB codes
 */
export function mapCategoriesToIAB(categories) {
  if (!Array.isArray(categories)) return []
  
  const iabCodes = categories
    .map(cat => {
      const normalized = cat.toLowerCase()
      return LABEL_TO_IAB[normalized] || null
    })
    .filter(code => code !== null)
  
  return [...new Set(iabCodes)]
}

export default {
  IAB_TAXONOMY_VERSION,
  MIXPEEK_NODE_TO_IAB,
  LABEL_TO_IAB,
  isValidIABCode,
  extractIABCode,
  getIABFromTaxonomy,
  mapTaxonomiesToIAB,
  mapCategoriesToIAB
}
