/**
 * IAB Content Taxonomy Mapping
 *
 * Maps Mixpeek taxonomy to IAB Content Taxonomy v3.0 codes.
 * Reference: https://iabtechlab.com/standards/content-taxonomy/
 *
 * IAB Content Taxonomy v3.0 = cattax value 6 in OpenRTB
 */

/**
 * IAB Taxonomy version identifier
 * IAB Tech Lab Content Taxonomy v3.0 = 6
 */
export const IAB_TAXONOMY_VERSION = 6

/**
 * Map Mixpeek node_ids to IAB codes
 */
export const MIXPEEK_NODE_TO_IAB = {
  // Technology & Computing (IAB19)
  'technology': 'IAB19',
  'tech': 'IAB19',
  'tech_computing': 'IAB19',
  'tech_ai': 'IAB19-11',
  'artificial_intelligence': 'IAB19-11',
  'machine_learning': 'IAB19-11',
  'software': 'IAB19-18',
  'hardware': 'IAB19-19',
  'mobile': 'IAB19-20',
  'internet': 'IAB19-21',
  'cybersecurity': 'IAB19-22',
  'cloud_computing': 'IAB19-23',
  'data_science': 'IAB19-24',

  // Sports (IAB17)
  'sports': 'IAB17',
  'football': 'IAB17-3',
  'american_football': 'IAB17-3',
  'soccer': 'IAB17-44',
  'basketball': 'IAB17-4',
  'baseball': 'IAB17-5',
  'tennis': 'IAB17-37',
  'golf': 'IAB17-13',
  'hockey': 'IAB17-15',
  'olympics': 'IAB17-22',
  'boxing': 'IAB17-6',
  'mma': 'IAB17-20',

  // News & Politics (IAB12)
  'news': 'IAB12',
  'politics': 'IAB12-2',
  'business_news': 'IAB12-3',
  'tech_news': 'IAB12-6',
  'international_news': 'IAB12-1',
  'local_news': 'IAB12-4',
  'weather': 'IAB12-7',

  // Business & Finance (IAB13)
  'business': 'IAB13',
  'finance': 'IAB13-7',
  'investing': 'IAB13-5',
  'banking': 'IAB13-1',
  'insurance': 'IAB13-4',
  'retirement': 'IAB13-8',
  'cryptocurrency': 'IAB13-12',
  'stocks': 'IAB13-10',
  'real_estate_finance': 'IAB13-9',

  // Entertainment (IAB9)
  'entertainment': 'IAB9',
  'movies': 'IAB9-7',
  'television': 'IAB9-23',
  'tv': 'IAB9-23',
  'music': 'IAB9-8',
  'celebrity': 'IAB9-2',
  'gaming': 'IAB9-30',
  'video_games': 'IAB9-30',
  'comics': 'IAB9-4',
  'humor': 'IAB9-6',
  'streaming': 'IAB9-31',

  // Health & Fitness (IAB7)
  'health': 'IAB7',
  'fitness': 'IAB7-18',
  'nutrition': 'IAB7-30',
  'wellness': 'IAB7-44',
  'medical': 'IAB7-27',
  'mental_health': 'IAB7-28',
  'exercise': 'IAB7-16',
  'yoga': 'IAB7-45',
  'weight_loss': 'IAB7-42',

  // Travel (IAB20)
  'travel': 'IAB20',
  'hotels': 'IAB20-12',
  'flights': 'IAB20-8',
  'destinations': 'IAB20-6',
  'adventure_travel': 'IAB20-1',
  'business_travel': 'IAB20-4',
  'cruises': 'IAB20-5',
  'vacation': 'IAB20-26',

  // Food & Drink (IAB8)
  'food': 'IAB8',
  'cooking': 'IAB8-5',
  'restaurants': 'IAB8-9',
  'recipes': 'IAB8-8',
  'wine': 'IAB8-13',
  'beer': 'IAB8-1',
  'coffee': 'IAB8-4',
  'vegetarian': 'IAB8-11',
  'vegan': 'IAB8-12',

  // Automotive (IAB2)
  'automotive': 'IAB2',
  'cars': 'IAB2-2',
  'electric_vehicles': 'IAB2-4',
  'trucks': 'IAB2-20',
  'motorcycles': 'IAB2-11',
  'auto_buying': 'IAB2-1',
  'auto_repair': 'IAB2-13',

  // Real Estate (IAB21)
  'real_estate': 'IAB21',
  'apartments': 'IAB21-1',
  'buying_home': 'IAB21-2',
  'selling_home': 'IAB21-3',

  // Education (IAB5)
  'education': 'IAB5',
  'college': 'IAB5-3',
  'grad_school': 'IAB5-5',
  'k12': 'IAB5-7',
  'online_education': 'IAB5-11',
  'language_learning': 'IAB5-8',

  // Fashion & Style (IAB18)
  'fashion': 'IAB18',
  'beauty': 'IAB18-1',
  'clothing': 'IAB18-3',
  'accessories': 'IAB18-5',
  'jewelry': 'IAB18-4',

  // Home & Garden (IAB10)
  'home': 'IAB10',
  'garden': 'IAB10-3',
  'interior_design': 'IAB10-5',
  'home_improvement': 'IAB10-4',
  'appliances': 'IAB10-1',

  // Science (IAB15)
  'science': 'IAB15',
  'biology': 'IAB15-1',
  'chemistry': 'IAB15-2',
  'physics': 'IAB15-5',
  'space': 'IAB15-8',
  'environment': 'IAB15-4',

  // Arts & Entertainment (IAB1)
  'arts': 'IAB1',
  'books': 'IAB1-1',
  'fine_art': 'IAB1-4',
  'photography': 'IAB1-5',
  'theater': 'IAB1-7',

  // Pets (IAB16)
  'pets': 'IAB16',
  'dogs': 'IAB16-3',
  'cats': 'IAB16-2',

  // Family & Parenting (IAB6)
  'family': 'IAB6',
  'parenting': 'IAB6-7',
  'babies': 'IAB6-1',
  'pregnancy': 'IAB6-8',

  // Religion & Spirituality (IAB23)
  'religion': 'IAB23',
  'spirituality': 'IAB23-10',

  // Shopping (IAB22)
  'shopping': 'IAB22',
  'comparison_shopping': 'IAB22-1',
  'coupons': 'IAB22-2',

  // Law & Government (IAB11)
  'legal': 'IAB11',
  'government': 'IAB11-3',
  'immigration': 'IAB11-4',

  // Careers (IAB4)
  'careers': 'IAB4',
  'job_search': 'IAB4-5',
  'resume': 'IAB4-9',

  // Personal Finance (IAB13)
  'personal_finance': 'IAB13-7',
  'credit': 'IAB13-2',
  'debt': 'IAB13-3'
}

/**
 * Fallback label-based mapping
 */
export const LABEL_TO_IAB = {
  'technology': 'IAB19',
  'tech': 'IAB19',
  'ai': 'IAB19-11',
  'artificial intelligence': 'IAB19-11',
  'machine learning': 'IAB19-11',
  'software': 'IAB19-18',
  'hardware': 'IAB19-19',
  'mobile': 'IAB19-20',
  'computing': 'IAB19',
  'sports': 'IAB17',
  'football': 'IAB17-3',
  'soccer': 'IAB17-44',
  'basketball': 'IAB17-4',
  'baseball': 'IAB17-5',
  'news': 'IAB12',
  'politics': 'IAB12-2',
  'business': 'IAB13',
  'finance': 'IAB13-7',
  'investing': 'IAB13-5',
  'entertainment': 'IAB9',
  'movies': 'IAB9-7',
  'television': 'IAB9-23',
  'music': 'IAB9-8',
  'gaming': 'IAB9-30',
  'health': 'IAB7',
  'fitness': 'IAB7-18',
  'wellness': 'IAB7',
  'nutrition': 'IAB7-30',
  'travel': 'IAB20',
  'food': 'IAB8',
  'automotive': 'IAB2',
  'cars': 'IAB2',
  'real estate': 'IAB21',
  'education': 'IAB5',
  'fashion': 'IAB18',
  'beauty': 'IAB18-1',
  'home': 'IAB10',
  'science': 'IAB15',
  'arts': 'IAB1',
  'pets': 'IAB16',
  'family': 'IAB6',
  'parenting': 'IAB6-7',
  'religion': 'IAB23',
  'shopping': 'IAB22',
  'legal': 'IAB11',
  'careers': 'IAB4',
  'general': 'IAB24'
}

/**
 * Check if a string is already a valid IAB category code
 */
export function isValidIABCode(value) {
  if (!value || typeof value !== 'string') return false
  return /^IAB\d+(-\d+)?$/.test(value)
}

/**
 * Extract IAB code from a string if present
 */
export function extractIABCode(value) {
  if (!value || typeof value !== 'string') return null
  const match = value.match(/IAB\d+(-\d+)?/)
  return match ? match[0] : null
}

/**
 * Map Mixpeek taxonomy to IAB code
 * @param {Object} taxonomy - Taxonomy object with {label, nodeId, path, score}
 * @returns {string|null} IAB category code
 */
export function getIABFromTaxonomy(taxonomy) {
  if (!taxonomy) return null

  // Strategy 1: Check if already IAB code
  if (taxonomy.label && isValidIABCode(taxonomy.label)) {
    return taxonomy.label
  }

  const iabInLabel = extractIABCode(taxonomy.label)
  if (iabInLabel) return iabInLabel

  // Strategy 2: Check node_id
  const nodeId = taxonomy.nodeId || taxonomy.node_id
  if (nodeId) {
    if (isValidIABCode(nodeId)) return nodeId

    const iabInNode = extractIABCode(nodeId)
    if (iabInNode) return iabInNode

    // Map by node_id
    const normalizedNode = nodeId.toLowerCase().replace(/[^a-z0-9]/g, '_')
    if (MIXPEEK_NODE_TO_IAB[normalizedNode]) {
      return MIXPEEK_NODE_TO_IAB[normalizedNode]
    }

    // Partial match
    for (const [key, value] of Object.entries(MIXPEEK_NODE_TO_IAB)) {
      if (normalizedNode.includes(key) || key.includes(normalizedNode)) {
        return value
      }
    }
  }

  // Strategy 3: Map by label
  if (taxonomy.label) {
    const label = taxonomy.label.toLowerCase()

    if (LABEL_TO_IAB[label]) {
      return LABEL_TO_IAB[label]
    }

    // Partial match
    for (const [key, value] of Object.entries(LABEL_TO_IAB)) {
      if (label.includes(key)) {
        return value
      }
    }
  }

  // Strategy 4: Try path
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
 * Map keywords to IAB codes
 * @param {Array<string>} keywords - Keywords
 * @returns {Array<string>} IAB codes
 */
export function mapKeywordsToIAB(keywords) {
  if (!Array.isArray(keywords)) return []

  const iabCodes = new Set()

  for (const keyword of keywords) {
    const lower = keyword.toLowerCase()
    if (LABEL_TO_IAB[lower]) {
      iabCodes.add(LABEL_TO_IAB[lower])
    }

    // Partial match
    for (const [key, value] of Object.entries(LABEL_TO_IAB)) {
      if (lower.includes(key) || key.includes(lower)) {
        iabCodes.add(value)
      }
    }
  }

  return [...iabCodes]
}

/**
 * Get IAB category name from code
 * @param {string} code - IAB code
 * @returns {string} Category name
 */
export function getIABCategoryName(code) {
  const categories = {
    'IAB1': 'Arts & Entertainment',
    'IAB2': 'Automotive',
    'IAB3': 'Business',
    'IAB4': 'Careers',
    'IAB5': 'Education',
    'IAB6': 'Family & Parenting',
    'IAB7': 'Health & Fitness',
    'IAB8': 'Food & Drink',
    'IAB9': 'Hobbies & Interests',
    'IAB10': 'Home & Garden',
    'IAB11': 'Law, Government & Politics',
    'IAB12': 'News',
    'IAB13': 'Personal Finance',
    'IAB14': 'Society',
    'IAB15': 'Science',
    'IAB16': 'Pets',
    'IAB17': 'Sports',
    'IAB18': 'Style & Fashion',
    'IAB19': 'Technology & Computing',
    'IAB20': 'Travel',
    'IAB21': 'Real Estate',
    'IAB22': 'Shopping',
    'IAB23': 'Religion & Spirituality',
    'IAB24': 'Uncategorized',
    'IAB25': 'Non-Standard Content',
    'IAB26': 'Illegal Content'
  }

  // Get top-level category
  const topLevel = code.split('-')[0]
  return categories[topLevel] || 'Unknown'
}

export default {
  IAB_TAXONOMY_VERSION,
  MIXPEEK_NODE_TO_IAB,
  LABEL_TO_IAB,
  isValidIABCode,
  extractIABCode,
  getIABFromTaxonomy,
  mapKeywordsToIAB,
  getIABCategoryName
}
