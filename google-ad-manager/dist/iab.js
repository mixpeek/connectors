/**
 * IAB Content Taxonomy Mappings
 *
 * Supports both IAB Content Taxonomy v2.2 and v3.0
 * Reference: https://iabtechlab.com/standards/content-taxonomy/
 */

/**
 * IAB Content Taxonomy v3.0 (cattax: 6)
 * Primary taxonomy for modern GAM implementations
 */
export const IAB_V3_CATEGORIES = {
  // Tier 1 Categories
  '1': 'Arts & Entertainment',
  '2': 'Automotive',
  '3': 'Business',
  '4': 'Careers',
  '5': 'Education',
  '6': 'Family & Parenting',
  '7': 'Health & Fitness',
  '8': 'Food & Drink',
  '9': 'Hobbies & Interests',
  '10': 'Home & Garden',
  '11': 'Law, Government & Politics',
  '12': 'News',
  '13': 'Personal Finance',
  '14': 'Society',
  '15': 'Science',
  '16': 'Pets',
  '17': 'Sports',
  '18': 'Style & Fashion',
  '19': 'Technology & Computing',
  '20': 'Travel',
  '21': 'Real Estate',
  '22': 'Shopping',
  '23': 'Religion & Spirituality',

  // Technology subcategories
  '19-1': 'Artificial Intelligence',
  '19-2': 'Augmented Reality',
  '19-3': 'Cloud Computing',
  '19-4': 'Computer Hardware',
  '19-5': 'Computer Software',
  '19-6': 'Consumer Electronics',
  '19-7': 'Cybersecurity',
  '19-8': 'Data Science',
  '19-9': 'Internet of Things',
  '19-10': 'Mobile Technology',
  '19-11': 'Networking',
  '19-12': 'Programming',
  '19-13': 'Robotics',
  '19-14': 'Virtual Reality',
  '19-15': 'Web Development',

  // Business subcategories
  '3-1': 'Advertising',
  '3-2': 'Agriculture',
  '3-3': 'Banking',
  '3-4': 'Biotech',
  '3-5': 'Business Services',
  '3-6': 'Construction',
  '3-7': 'E-commerce',
  '3-8': 'Energy',
  '3-9': 'Entrepreneurship',
  '3-10': 'Financial Services',
  '3-11': 'Insurance',
  '3-12': 'Logistics',
  '3-13': 'Manufacturing',
  '3-14': 'Marketing',
  '3-15': 'Retail',

  // Health subcategories
  '7-1': 'Diseases & Conditions',
  '7-2': 'Drugs & Medications',
  '7-3': 'Exercise & Fitness',
  '7-4': 'Healthcare',
  '7-5': 'Mental Health',
  '7-6': 'Nutrition',
  '7-7': 'Senior Health',
  '7-8': 'Weight Loss',
  '7-9': 'Womens Health',

  // Sports subcategories
  '17-1': 'American Football',
  '17-2': 'Baseball',
  '17-3': 'Basketball',
  '17-4': 'Boxing',
  '17-5': 'Golf',
  '17-6': 'Hockey',
  '17-7': 'Mixed Martial Arts',
  '17-8': 'Motorsports',
  '17-9': 'Olympics',
  '17-10': 'Soccer',
  '17-11': 'Tennis',
  '17-12': 'Wrestling'
}

/**
 * IAB Content Taxonomy v2.2 (legacy)
 * For backward compatibility
 */
export const IAB_V2_CATEGORIES = {
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
  'IAB26': 'Illegal Content',

  // Technology subcategories
  'IAB19-1': '3G',
  'IAB19-2': '4G',
  'IAB19-3': '5G',
  'IAB19-4': 'AI/Machine Learning',
  'IAB19-5': 'Antivirus',
  'IAB19-6': 'Blogging',
  'IAB19-7': 'Camera Phones',
  'IAB19-8': 'Cell Phone Culture',
  'IAB19-9': 'Cloud Computing',
  'IAB19-10': 'Computer Certification',
  'IAB19-11': 'Computer Networking',
  'IAB19-12': 'Computer Peripherals',
  'IAB19-13': 'Computer Reviews',
  'IAB19-14': 'Data Centers',
  'IAB19-15': 'Databases',
  'IAB19-16': 'Desktop Video',
  'IAB19-17': 'Digital Audio',
  'IAB19-18': 'Email',
  'IAB19-19': 'Graphics Software',
  'IAB19-20': 'Home Entertainment',
  'IAB19-21': 'Internet Technology',
  'IAB19-22': 'Java',
  'IAB19-23': 'JavaScript',
  'IAB19-24': 'Mac Support',
  'IAB19-25': 'Mobile Apps & Add-Ons',
  'IAB19-26': 'MP3/MIDI',
  'IAB19-27': 'Net Conferencing',
  'IAB19-28': 'Net for Beginners',
  'IAB19-29': 'Network Security',
  'IAB19-30': 'Palmtops/PDAs',
  'IAB19-31': 'PC Support',
  'IAB19-32': 'Portable',
  'IAB19-33': 'Programming',
  'IAB19-34': 'Search',
  'IAB19-35': 'Shareware/Freeware',
  'IAB19-36': 'Software',
  'IAB19-37': 'Web Clip Art',
  'IAB19-38': 'Web Design/HTML',
  'IAB19-39': 'Web Development',
  'IAB19-40': 'Wearable Technology',

  // Sports subcategories
  'IAB17-1': 'Auto Racing',
  'IAB17-2': 'Baseball',
  'IAB17-3': 'Basketball',
  'IAB17-4': 'Bodybuilding',
  'IAB17-5': 'Boxing',
  'IAB17-6': 'Canoeing/Kayaking',
  'IAB17-7': 'Cheerleading',
  'IAB17-8': 'Climbing',
  'IAB17-9': 'Cricket',
  'IAB17-10': 'Figure Skating',
  'IAB17-11': 'Fly Fishing',
  'IAB17-12': 'Football',
  'IAB17-13': 'Freshwater Fishing',
  'IAB17-14': 'Game & Fish',
  'IAB17-15': 'Golf',
  'IAB17-16': 'Horse Racing',
  'IAB17-17': 'Horses',
  'IAB17-18': 'Hunting/Shooting',
  'IAB17-19': 'Inline Skating',
  'IAB17-20': 'Martial Arts',
  'IAB17-21': 'Mountain Biking',
  'IAB17-22': 'NASCAR Racing',
  'IAB17-23': 'Olympics',
  'IAB17-24': 'Paintball',
  'IAB17-25': 'Power & Motorcycles',
  'IAB17-26': 'Pro Basketball',
  'IAB17-27': 'Pro Ice Hockey',
  'IAB17-28': 'Rodeo',
  'IAB17-29': 'Rugby',
  'IAB17-30': 'Running/Jogging',
  'IAB17-31': 'Sailing',
  'IAB17-32': 'Saltwater Fishing',
  'IAB17-33': 'Scuba Diving',
  'IAB17-34': 'Skateboarding',
  'IAB17-35': 'Skiing',
  'IAB17-36': 'Snowboarding',
  'IAB17-37': 'Surfing/Bodyboarding',
  'IAB17-38': 'Swimming',
  'IAB17-39': 'Table Tennis/Ping-Pong',
  'IAB17-40': 'Tennis',
  'IAB17-41': 'Volleyball',
  'IAB17-42': 'Walking',
  'IAB17-43': 'Waterski/Wakeboard',
  'IAB17-44': 'World Soccer'
}

/**
 * Label to IAB v2.2 code mapping
 */
const LABEL_TO_IAB_V2 = {
  'Technology': 'IAB19',
  'Technology & Computing': 'IAB19',
  'Business': 'IAB3',
  'Sports': 'IAB17',
  'Entertainment': 'IAB1',
  'Arts & Entertainment': 'IAB1',
  'Health': 'IAB7',
  'Health & Fitness': 'IAB7',
  'News': 'IAB12',
  'Science': 'IAB15',
  'Automotive': 'IAB2',
  'Travel': 'IAB20',
  'Food': 'IAB8',
  'Food & Drink': 'IAB8',
  'Fashion': 'IAB18',
  'Style & Fashion': 'IAB18',
  'Real Estate': 'IAB21',
  'Education': 'IAB5',
  'Finance': 'IAB13',
  'Personal Finance': 'IAB13',
  'Home & Garden': 'IAB10',
  'Hobbies & Interests': 'IAB9',
  'General': 'IAB24',
  'Uncategorized': 'IAB24'
}

/**
 * Label to IAB v3.0 code mapping
 */
const LABEL_TO_IAB_V3 = {
  'Technology': '19',
  'Technology & Computing': '19',
  'Business': '3',
  'Sports': '17',
  'Entertainment': '1',
  'Arts & Entertainment': '1',
  'Health': '7',
  'Health & Fitness': '7',
  'News': '12',
  'Science': '15',
  'Automotive': '2',
  'Travel': '20',
  'Food': '8',
  'Food & Drink': '8',
  'Fashion': '18',
  'Style & Fashion': '18',
  'Real Estate': '21',
  'Education': '5',
  'Finance': '13',
  'Personal Finance': '13',
  'Home & Garden': '10',
  'Hobbies & Interests': '9',
  'General': '24',
  'Uncategorized': '24'
}

/**
 * Get IAB v2.2 code for a category label
 * @param {string} label - Category label
 * @returns {string} IAB v2.2 code
 */
export function getIABCode(label) {
  return LABEL_TO_IAB_V2[label] || 'IAB24'
}

/**
 * Get IAB v3.0 code for a category label
 * @param {string} label - Category label
 * @returns {string} IAB v3.0 code
 */
export function getIABv3Code(label) {
  return LABEL_TO_IAB_V3[label] || '24'
}

/**
 * Get category label from IAB v2.2 code
 * @param {string} code - IAB v2.2 code
 * @returns {string} Category label
 */
export function getIABLabel(code) {
  return IAB_V2_CATEGORIES[code] || 'Uncategorized'
}

/**
 * Get category label from IAB v3.0 code
 * @param {string} code - IAB v3.0 code
 * @returns {string} Category label
 */
export function getIABv3Label(code) {
  return IAB_V3_CATEGORIES[code] || 'Uncategorized'
}

/**
 * Convert IAB v2.2 code to v3.0
 * @param {string} v2Code - IAB v2.2 code
 * @returns {string} IAB v3.0 code
 */
export function convertV2toV3(v2Code) {
  // Strip "IAB" prefix and return number
  if (v2Code && v2Code.startsWith('IAB')) {
    return v2Code.replace('IAB', '')
  }
  return v2Code
}

/**
 * Convert IAB v3.0 code to v2.2
 * @param {string} v3Code - IAB v3.0 code
 * @returns {string} IAB v2.2 code
 */
export function convertV3toV2(v3Code) {
  if (v3Code && !v3Code.startsWith('IAB')) {
    return `IAB${v3Code}`
  }
  return v3Code
}

/**
 * Get all parent categories (Tier 1 only)
 * @returns {Object} Parent categories
 */
export function getParentCategories() {
  const categories = {}
  for (const [code, label] of Object.entries(IAB_V3_CATEGORIES)) {
    if (!code.includes('-')) {
      categories[code] = label
    }
  }
  return categories
}

/**
 * Check if category is brand-safe
 * @param {string} code - IAB code
 * @returns {boolean} True if category is generally brand-safe
 */
export function isBrandSafe(code) {
  const unsafeCategories = ['24', '25', '26', 'IAB24', 'IAB25', 'IAB26']
  return !unsafeCategories.includes(code)
}
