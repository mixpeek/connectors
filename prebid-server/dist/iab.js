/**
 * IAB Content Taxonomy v3.0 Categories
 *
 * Reference: https://iabtechlab.com/standards/content-taxonomy/
 */

export const IAB_CATEGORIES = {
  // Tier 1 Categories
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

  // Entertainment subcategories
  'IAB1-1': 'Books & Literature',
  'IAB1-2': 'Celebrity Fan/Gossip',
  'IAB1-3': 'Fine Art',
  'IAB1-4': 'Humor',
  'IAB1-5': 'Movies',
  'IAB1-6': 'Music',
  'IAB1-7': 'Television',

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
 * Get IAB category code for a label
 * @param {string} label - Category label
 * @returns {string} IAB code
 */
export function getIABCode(label) {
  const mapping = {
    'Technology': 'IAB19',
    'Business': 'IAB3',
    'Sports': 'IAB17',
    'Entertainment': 'IAB1',
    'Health': 'IAB7',
    'News': 'IAB12',
    'Science': 'IAB15',
    'Automotive': 'IAB2',
    'Travel': 'IAB20',
    'Food': 'IAB8',
    'General': 'IAB24'
  }
  return mapping[label] || 'IAB24'
}

/**
 * Get IAB category label from code
 * @param {string} code - IAB code
 * @returns {string} Category label
 */
export function getIABLabel(code) {
  return IAB_CATEGORIES[code] || 'Uncategorized'
}
