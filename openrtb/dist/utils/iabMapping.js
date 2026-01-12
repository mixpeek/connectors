/**
 * Mixpeek OpenRTB Connector - IAB Taxonomy Mapping
 *
 * Maps between Mixpeek categories and IAB Content Taxonomy 3.0
 */

// IAB Content Taxonomy 3.0 Categories
export const IAB_TAXONOMY = {
  // Tier 1 Categories
  'IAB1': { name: 'Arts & Entertainment', tier: 1 },
  'IAB2': { name: 'Automotive', tier: 1 },
  'IAB3': { name: 'Business', tier: 1 },
  'IAB4': { name: 'Careers', tier: 1 },
  'IAB5': { name: 'Education', tier: 1 },
  'IAB6': { name: 'Family & Parenting', tier: 1 },
  'IAB7': { name: 'Health & Fitness', tier: 1 },
  'IAB8': { name: 'Food & Drink', tier: 1 },
  'IAB9': { name: 'Hobbies & Interests', tier: 1 },
  'IAB10': { name: 'Home & Garden', tier: 1 },
  'IAB11': { name: 'Law, Government, & Politics', tier: 1 },
  'IAB12': { name: 'News', tier: 1 },
  'IAB13': { name: 'Personal Finance', tier: 1 },
  'IAB14': { name: 'Society', tier: 1 },
  'IAB15': { name: 'Science', tier: 1 },
  'IAB16': { name: 'Pets', tier: 1 },
  'IAB17': { name: 'Sports', tier: 1 },
  'IAB18': { name: 'Style & Fashion', tier: 1 },
  'IAB19': { name: 'Technology & Computing', tier: 1 },
  'IAB20': { name: 'Travel', tier: 1 },
  'IAB21': { name: 'Real Estate', tier: 1 },
  'IAB22': { name: 'Shopping', tier: 1 },
  'IAB23': { name: 'Religion & Spirituality', tier: 1 },
  'IAB24': { name: 'Uncategorized', tier: 1 },
  'IAB25': { name: 'Non-Standard Content', tier: 1 },
  'IAB26': { name: 'Illegal Content', tier: 1 },

  // Tier 2 Subcategories (selected)
  'IAB1-1': { name: 'Books & Literature', tier: 2, parent: 'IAB1' },
  'IAB1-2': { name: 'Celebrity Fan/Gossip', tier: 2, parent: 'IAB1' },
  'IAB1-3': { name: 'Fine Art', tier: 2, parent: 'IAB1' },
  'IAB1-4': { name: 'Humor', tier: 2, parent: 'IAB1' },
  'IAB1-5': { name: 'Movies', tier: 2, parent: 'IAB1' },
  'IAB1-6': { name: 'Music', tier: 2, parent: 'IAB1' },
  'IAB1-7': { name: 'Television', tier: 2, parent: 'IAB1' },

  'IAB2-1': { name: 'Auto Parts', tier: 2, parent: 'IAB2' },
  'IAB2-2': { name: 'Auto Repair', tier: 2, parent: 'IAB2' },
  'IAB2-3': { name: 'Buying/Selling Cars', tier: 2, parent: 'IAB2' },
  'IAB2-4': { name: 'Car Culture', tier: 2, parent: 'IAB2' },
  'IAB2-5': { name: 'Certified Pre-Owned', tier: 2, parent: 'IAB2' },

  'IAB3-1': { name: 'Advertising', tier: 2, parent: 'IAB3' },
  'IAB3-2': { name: 'Agriculture', tier: 2, parent: 'IAB3' },
  'IAB3-3': { name: 'Biotech/Biomedical', tier: 2, parent: 'IAB3' },
  'IAB3-4': { name: 'Business Software', tier: 2, parent: 'IAB3' },
  'IAB3-5': { name: 'Construction', tier: 2, parent: 'IAB3' },

  'IAB17-1': { name: 'Auto Racing', tier: 2, parent: 'IAB17' },
  'IAB17-2': { name: 'Baseball', tier: 2, parent: 'IAB17' },
  'IAB17-3': { name: 'Bicycling', tier: 2, parent: 'IAB17' },
  'IAB17-4': { name: 'Bodybuilding', tier: 2, parent: 'IAB17' },
  'IAB17-5': { name: 'Boxing', tier: 2, parent: 'IAB17' },
  'IAB17-6': { name: 'Canoeing/Kayaking', tier: 2, parent: 'IAB17' },
  'IAB17-7': { name: 'Cheerleading', tier: 2, parent: 'IAB17' },
  'IAB17-8': { name: 'Climbing', tier: 2, parent: 'IAB17' },
  'IAB17-9': { name: 'Cricket', tier: 2, parent: 'IAB17' },
  'IAB17-10': { name: 'Figure Skating', tier: 2, parent: 'IAB17' },
  'IAB17-11': { name: 'Fly Fishing', tier: 2, parent: 'IAB17' },
  'IAB17-12': { name: 'Football', tier: 2, parent: 'IAB17' },
  'IAB17-13': { name: 'Freshwater Fishing', tier: 2, parent: 'IAB17' },
  'IAB17-14': { name: 'Game & Fish', tier: 2, parent: 'IAB17' },
  'IAB17-15': { name: 'Golf', tier: 2, parent: 'IAB17' },
  'IAB17-16': { name: 'Horse Racing', tier: 2, parent: 'IAB17' },
  'IAB17-17': { name: 'Horses', tier: 2, parent: 'IAB17' },
  'IAB17-18': { name: 'Hunting/Shooting', tier: 2, parent: 'IAB17' },
  'IAB17-19': { name: 'Inline Skating', tier: 2, parent: 'IAB17' },
  'IAB17-20': { name: 'Martial Arts', tier: 2, parent: 'IAB17' },
  'IAB17-21': { name: 'Mountain Biking', tier: 2, parent: 'IAB17' },
  'IAB17-22': { name: 'NASCAR Racing', tier: 2, parent: 'IAB17' },
  'IAB17-23': { name: 'Olympics', tier: 2, parent: 'IAB17' },
  'IAB17-24': { name: 'Paintball', tier: 2, parent: 'IAB17' },
  'IAB17-25': { name: 'Power & Motorcycles', tier: 2, parent: 'IAB17' },
  'IAB17-26': { name: 'Pro Basketball', tier: 2, parent: 'IAB17' },
  'IAB17-27': { name: 'Pro Ice Hockey', tier: 2, parent: 'IAB17' },
  'IAB17-28': { name: 'Rodeo', tier: 2, parent: 'IAB17' },
  'IAB17-29': { name: 'Rugby', tier: 2, parent: 'IAB17' },
  'IAB17-30': { name: 'Running/Jogging', tier: 2, parent: 'IAB17' },
  'IAB17-31': { name: 'Sailing', tier: 2, parent: 'IAB17' },
  'IAB17-32': { name: 'Saltwater Fishing', tier: 2, parent: 'IAB17' },
  'IAB17-33': { name: 'Scuba Diving', tier: 2, parent: 'IAB17' },
  'IAB17-34': { name: 'Skateboarding', tier: 2, parent: 'IAB17' },
  'IAB17-35': { name: 'Skiing', tier: 2, parent: 'IAB17' },
  'IAB17-36': { name: 'Snowboarding', tier: 2, parent: 'IAB17' },
  'IAB17-37': { name: 'Surfing/Bodyboarding', tier: 2, parent: 'IAB17' },
  'IAB17-38': { name: 'Swimming', tier: 2, parent: 'IAB17' },
  'IAB17-39': { name: 'Table Tennis/Ping-Pong', tier: 2, parent: 'IAB17' },
  'IAB17-40': { name: 'Tennis', tier: 2, parent: 'IAB17' },
  'IAB17-41': { name: 'Volleyball', tier: 2, parent: 'IAB17' },
  'IAB17-42': { name: 'Walking', tier: 2, parent: 'IAB17' },
  'IAB17-43': { name: 'Waterski/Wakeboard', tier: 2, parent: 'IAB17' },
  'IAB17-44': { name: 'World Soccer', tier: 2, parent: 'IAB17' },

  'IAB19-1': { name: '3-D Graphics', tier: 2, parent: 'IAB19' },
  'IAB19-2': { name: 'Animation', tier: 2, parent: 'IAB19' },
  'IAB19-3': { name: 'Antivirus Software', tier: 2, parent: 'IAB19' },
  'IAB19-4': { name: 'C/C++', tier: 2, parent: 'IAB19' },
  'IAB19-5': { name: 'Cameras & Camcorders', tier: 2, parent: 'IAB19' },
  'IAB19-6': { name: 'Cell Phones', tier: 2, parent: 'IAB19' },
  'IAB19-7': { name: 'Computer Certification', tier: 2, parent: 'IAB19' },
  'IAB19-8': { name: 'Computer Networking', tier: 2, parent: 'IAB19' },
  'IAB19-9': { name: 'Computer Peripherals', tier: 2, parent: 'IAB19' },
  'IAB19-10': { name: 'Computer Reviews', tier: 2, parent: 'IAB19' },
  'IAB19-11': { name: 'Data Centers', tier: 2, parent: 'IAB19' },
  'IAB19-12': { name: 'Databases', tier: 2, parent: 'IAB19' },
  'IAB19-13': { name: 'Desktop Publishing', tier: 2, parent: 'IAB19' },
  'IAB19-14': { name: 'Desktop Video', tier: 2, parent: 'IAB19' },
  'IAB19-15': { name: 'Email', tier: 2, parent: 'IAB19' },
  'IAB19-16': { name: 'Graphics Software', tier: 2, parent: 'IAB19' },
  'IAB19-17': { name: 'Home Video/DVD', tier: 2, parent: 'IAB19' },
  'IAB19-18': { name: 'Internet Technology', tier: 2, parent: 'IAB19' },
  'IAB19-19': { name: 'Java', tier: 2, parent: 'IAB19' },
  'IAB19-20': { name: 'JavaScript', tier: 2, parent: 'IAB19' },
  'IAB19-21': { name: 'Mac Support', tier: 2, parent: 'IAB19' },
  'IAB19-22': { name: 'MP3/MIDI', tier: 2, parent: 'IAB19' },
  'IAB19-23': { name: 'Net Conferencing', tier: 2, parent: 'IAB19' },
  'IAB19-24': { name: 'Net for Beginners', tier: 2, parent: 'IAB19' },
  'IAB19-25': { name: 'Network Security', tier: 2, parent: 'IAB19' },
  'IAB19-26': { name: 'Palmtops/PDAs', tier: 2, parent: 'IAB19' },
  'IAB19-27': { name: 'PC Support', tier: 2, parent: 'IAB19' },
  'IAB19-28': { name: 'Portable', tier: 2, parent: 'IAB19' },
  'IAB19-29': { name: 'Entertainment', tier: 2, parent: 'IAB19' },
  'IAB19-30': { name: 'Shareware/Freeware', tier: 2, parent: 'IAB19' },
  'IAB19-31': { name: 'Unix', tier: 2, parent: 'IAB19' },
  'IAB19-32': { name: 'Visual Basic', tier: 2, parent: 'IAB19' },
  'IAB19-33': { name: 'Web Clip Art', tier: 2, parent: 'IAB19' },
  'IAB19-34': { name: 'Web Design/HTML', tier: 2, parent: 'IAB19' },
  'IAB19-35': { name: 'Web Search', tier: 2, parent: 'IAB19' },
  'IAB19-36': { name: 'Windows', tier: 2, parent: 'IAB19' }
};

// Keyword to IAB category mapping
const KEYWORD_TO_IAB = {
  // Arts & Entertainment
  'movie': 'IAB1-5', 'movies': 'IAB1-5', 'film': 'IAB1-5', 'cinema': 'IAB1-5',
  'music': 'IAB1-6', 'song': 'IAB1-6', 'album': 'IAB1-6', 'concert': 'IAB1-6',
  'tv': 'IAB1-7', 'television': 'IAB1-7', 'show': 'IAB1-7', 'series': 'IAB1-7',
  'book': 'IAB1-1', 'books': 'IAB1-1', 'novel': 'IAB1-1', 'author': 'IAB1-1',
  'celebrity': 'IAB1-2', 'celeb': 'IAB1-2', 'star': 'IAB1-2', 'famous': 'IAB1-2',
  'art': 'IAB1-3', 'painting': 'IAB1-3', 'gallery': 'IAB1-3', 'museum': 'IAB1-3',
  'comedy': 'IAB1-4', 'funny': 'IAB1-4', 'humor': 'IAB1-4', 'joke': 'IAB1-4',

  // Automotive
  'car': 'IAB2', 'cars': 'IAB2', 'vehicle': 'IAB2', 'automotive': 'IAB2',
  'truck': 'IAB2', 'suv': 'IAB2', 'sedan': 'IAB2', 'coupe': 'IAB2',
  'electric vehicle': 'IAB2', 'ev': 'IAB2', 'hybrid': 'IAB2',
  'motorcycle': 'IAB2', 'motorbike': 'IAB2',

  // Business
  'business': 'IAB3', 'company': 'IAB3', 'corporate': 'IAB3', 'enterprise': 'IAB3',
  'startup': 'IAB3', 'entrepreneur': 'IAB3', 'ceo': 'IAB3',
  'marketing': 'IAB3-1', 'advertising': 'IAB3-1', 'ads': 'IAB3-1',

  // Education
  'education': 'IAB5', 'school': 'IAB5', 'university': 'IAB5', 'college': 'IAB5',
  'learning': 'IAB5', 'student': 'IAB5', 'teacher': 'IAB5', 'course': 'IAB5',

  // Health & Fitness
  'health': 'IAB7', 'medical': 'IAB7', 'doctor': 'IAB7', 'hospital': 'IAB7',
  'fitness': 'IAB7', 'exercise': 'IAB7', 'workout': 'IAB7', 'gym': 'IAB7',
  'diet': 'IAB7', 'nutrition': 'IAB7', 'wellness': 'IAB7',

  // Food & Drink
  'food': 'IAB8', 'recipe': 'IAB8', 'cooking': 'IAB8', 'chef': 'IAB8',
  'restaurant': 'IAB8', 'dining': 'IAB8', 'cuisine': 'IAB8',
  'wine': 'IAB8', 'beer': 'IAB8', 'cocktail': 'IAB8',

  // News
  'news': 'IAB12', 'breaking': 'IAB12', 'headline': 'IAB12', 'report': 'IAB12',
  'politics': 'IAB12', 'election': 'IAB12', 'government': 'IAB12',

  // Personal Finance
  'finance': 'IAB13', 'money': 'IAB13', 'investment': 'IAB13', 'investing': 'IAB13',
  'stock': 'IAB13', 'stocks': 'IAB13', 'market': 'IAB13', 'trading': 'IAB13',
  'bank': 'IAB13', 'banking': 'IAB13', 'loan': 'IAB13', 'mortgage': 'IAB13',
  'credit': 'IAB13', 'savings': 'IAB13', 'insurance': 'IAB13',

  // Sports
  'sport': 'IAB17', 'sports': 'IAB17', 'athlete': 'IAB17', 'team': 'IAB17',
  'football': 'IAB17-12', 'nfl': 'IAB17-12',
  'basketball': 'IAB17-26', 'nba': 'IAB17-26',
  'baseball': 'IAB17-2', 'mlb': 'IAB17-2',
  'soccer': 'IAB17-44', 'fifa': 'IAB17-44',
  'tennis': 'IAB17-40',
  'golf': 'IAB17-15',
  'hockey': 'IAB17-27', 'nhl': 'IAB17-27',
  'running': 'IAB17-30', 'marathon': 'IAB17-30',
  'swimming': 'IAB17-38',
  'skiing': 'IAB17-35', 'snowboarding': 'IAB17-36',

  // Technology
  'technology': 'IAB19', 'tech': 'IAB19', 'computer': 'IAB19', 'software': 'IAB19',
  'hardware': 'IAB19', 'gadget': 'IAB19', 'device': 'IAB19',
  'ai': 'IAB19', 'artificial intelligence': 'IAB19', 'machine learning': 'IAB19',
  'programming': 'IAB19', 'coding': 'IAB19', 'developer': 'IAB19',
  'internet': 'IAB19-18', 'web': 'IAB19-18', 'online': 'IAB19-18',
  'smartphone': 'IAB19-6', 'phone': 'IAB19-6', 'mobile': 'IAB19-6',
  'security': 'IAB19-25', 'cybersecurity': 'IAB19-25', 'privacy': 'IAB19-25',

  // Travel
  'travel': 'IAB20', 'vacation': 'IAB20', 'trip': 'IAB20', 'tourism': 'IAB20',
  'hotel': 'IAB20', 'flight': 'IAB20', 'airline': 'IAB20',
  'destination': 'IAB20', 'beach': 'IAB20', 'adventure': 'IAB20'
};

/**
 * Map a keyword to IAB category
 * @param {string} keyword - Keyword to map
 * @returns {string|null} IAB category ID or null
 */
export function keywordToIAB(keyword) {
  if (!keyword) return null;
  const lower = keyword.toLowerCase().trim();
  return KEYWORD_TO_IAB[lower] || null;
}

/**
 * Map multiple keywords to IAB categories
 * @param {string[]} keywords - Keywords to map
 * @returns {string[]} Unique IAB category IDs
 */
export function keywordsToIAB(keywords) {
  if (!keywords || !Array.isArray(keywords)) return [];

  const categories = new Set();
  for (const keyword of keywords) {
    const category = keywordToIAB(keyword);
    if (category) {
      categories.add(category);
      // Also add parent category if it's a subcategory
      const info = IAB_TAXONOMY[category];
      if (info && info.parent) {
        categories.add(info.parent);
      }
    }
  }

  return Array.from(categories);
}

/**
 * Get category info
 * @param {string} categoryId - IAB category ID
 * @returns {Object|null} Category info
 */
export function getCategoryInfo(categoryId) {
  return IAB_TAXONOMY[categoryId] || null;
}

/**
 * Get parent category for a subcategory
 * @param {string} categoryId - IAB category ID
 * @returns {string|null} Parent category ID
 */
export function getParentCategory(categoryId) {
  const info = IAB_TAXONOMY[categoryId];
  return info ? info.parent || null : null;
}

/**
 * Check if category is Tier 1
 * @param {string} categoryId - IAB category ID
 * @returns {boolean}
 */
export function isTier1Category(categoryId) {
  const info = IAB_TAXONOMY[categoryId];
  return info ? info.tier === 1 : false;
}

/**
 * Get all Tier 1 categories
 * @returns {string[]} Tier 1 category IDs
 */
export function getTier1Categories() {
  return Object.keys(IAB_TAXONOMY).filter(id => IAB_TAXONOMY[id].tier === 1);
}

/**
 * Validate IAB category ID
 * @param {string} categoryId - Category ID to validate
 * @returns {boolean} Whether the category ID is valid
 */
export function isValidCategory(categoryId) {
  return categoryId in IAB_TAXONOMY;
}

export default {
  IAB_TAXONOMY,
  keywordToIAB,
  keywordsToIAB,
  getCategoryInfo,
  getParentCategory,
  isTier1Category,
  getTier1Categories,
  isValidCategory
};
