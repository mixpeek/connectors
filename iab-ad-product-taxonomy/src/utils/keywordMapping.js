/**
 * Mixpeek IAB Ad Product Taxonomy Connector - Keyword Mapping
 *
 * Deterministic keyword-to-category mapping for IAB Ad Product Taxonomy 2.0.
 * This provides fast, predictable mappings without API calls.
 */

import { IAB_AD_PRODUCT_TAXONOMY, getCategoryById, getCategoryPath } from '../data/taxonomy.js';

// Keyword to category ID mapping
// Organized by tier 1 category for maintainability
const KEYWORD_MAPPINGS = {
  // Alcohol (1002)
  'alcohol': 1002, 'alcoholic': 1002, 'liquor': 1002, 'booze': 1002,
  'bar': 1003, 'pub': 1003, 'nightclub': 1003, 'lounge': 1003,
  'beer': 1004, 'lager': 1004, 'ale': 1004, 'ipa': 1004, 'stout': 1004, 'craft beer': 1004,
  'hard seltzer': 1005, 'seltzer': 1005, 'alcopop': 1005, 'hard soda': 1005,
  'spirits': 1006, 'whiskey': 1006, 'whisky': 1006, 'vodka': 1006, 'rum': 1006,
  'gin': 1006, 'tequila': 1006, 'brandy': 1006, 'bourbon': 1006, 'scotch': 1006,
  'wine': 1007, 'champagne': 1007, 'prosecco': 1007, 'red wine': 1007, 'white wine': 1007,

  // Business and Industrial (1010)
  'business': 1010, 'b2b': 1010, 'enterprise': 1010, 'corporate': 1010,
  'advertising': 1011, 'marketing': 1011, 'agency': 1011, 'campaign': 1011,
  'consulting': 1013, 'consultant': 1013, 'advisory': 1013,
  'hr': 1014, 'human resources': 1014, 'recruiting': 1014, 'hiring': 1014,
  'office supplies': 1015, 'stationery': 1015,
  'printing': 1016, 'publishing': 1016,
  'construction': 1020, 'contractor': 1020, 'builder': 1020,
  'energy': 1025, 'utility': 1025, 'power': 1025,
  'oil': 1026, 'gas': 1026, 'petroleum': 1026,
  'renewable': 1027, 'wind power': 1027, 'clean energy': 1027,
  'manufacturing': 1030, 'factory': 1030, 'production': 1030,
  'industrial': 1035, 'machinery': 1035, 'equipment': 1035,
  'logistics': 1040, 'shipping': 1040, 'freight': 1040, 'supply chain': 1040,
  'agriculture': 1045, 'farming': 1045, 'farm': 1045,

  // Cannabis (1050)
  'cannabis': 1050, 'marijuana': 1050, 'weed': 1050,
  'cbd': 1051, 'cannabidiol': 1051, 'hemp': 1051,
  'thc': 1052, 'edibles': 1052,
  'bong': 1053, 'vaporizer': 1053, 'grinder': 1053,

  // Clothing and Accessories (1055)
  'clothing': 1055, 'apparel': 1055, 'fashion': 1055, 'clothes': 1055,
  'womens': 1056, 'women': 1056, 'ladies': 1056, 'dress': 1056, 'blouse': 1056,
  'mens': 1057, 'men': 1057, 'suit': 1057, 'tie': 1057,
  'kids': 1058, 'children': 1058, 'baby clothes': 1058,
  'shoes': 1060, 'footwear': 1060, 'sneakers': 1060, 'boots': 1060, 'sandals': 1060,
  'jewelry': 1065, 'jewellery': 1065, 'necklace': 1065, 'bracelet': 1065, 'ring': 1065, 'earrings': 1065,
  'watch': 1070, 'watches': 1070, 'timepiece': 1070,
  'handbag': 1075, 'purse': 1075, 'bag': 1075, 'wallet': 1075,
  'sunglasses': 1080, 'eyeglasses': 1080, 'glasses': 1080,

  // Computer Software (1090)
  'software': 1090, 'app': 1090, 'application': 1090, 'program': 1090,
  'business software': 1091, 'enterprise software': 1091, 'saas': 1091, 'crm': 1091, 'erp': 1091,
  'consumer software': 1092, 'desktop app': 1092,
  'mobile app': 1093, 'ios app': 1093, 'android app': 1093,
  'video game': 1095, 'game': 1095, 'gaming': 1095, 'playstation': 1095, 'xbox': 1095, 'nintendo': 1095,
  'antivirus': 1100, 'security software': 1100, 'vpn': 1100, 'firewall': 1100,
  'cloud': 1105, 'cloud computing': 1105, 'aws': 1105, 'azure': 1105, 'gcp': 1105,

  // Consumer Electronics (1115)
  'electronics': 1115, 'gadget': 1115, 'tech': 1115,
  'computer': 1116, 'laptop': 1116, 'pc': 1116, 'desktop': 1116, 'macbook': 1116,
  'tablet': 1117, 'ipad': 1117,
  'smartphone': 1118, 'phone': 1118, 'iphone': 1118, 'android': 1118, 'mobile': 1118,
  'wearable': 1120, 'wearables': 1120,
  'smartwatch': 1121, 'apple watch': 1121, 'galaxy watch': 1121,
  'fitness tracker': 1122, 'fitbit': 1122,
  'audio': 1125, 'sound': 1125,
  'headphones': 1126, 'earbuds': 1126, 'airpods': 1126, 'earphones': 1126,
  'speaker': 1127, 'speakers': 1127, 'bluetooth speaker': 1127,
  'tv': 1130, 'television': 1130, 'monitor': 1130, 'display': 1130,
  'camera': 1135, 'photography': 1135, 'dslr': 1135, 'mirrorless': 1135,
  'gaming console': 1140, 'ps5': 1140, 'xbox series': 1140,
  'smart home': 1145, 'alexa': 1145, 'google home': 1145, 'nest': 1145,

  // Consumer Packaged Goods (1150)
  'cpg': 1150, 'fmcg': 1150,
  'food': 1151, 'beverage': 1151, 'drinks': 1151,
  'snack': 1152, 'snacks': 1152, 'chips': 1152, 'candy': 1152, 'chocolate': 1152,
  'soda': 1153, 'soft drink': 1153, 'cola': 1153, 'juice': 1153,
  'cereal': 1154, 'breakfast': 1154, 'oatmeal': 1154,
  'dairy': 1155, 'milk': 1155, 'cheese': 1155, 'yogurt': 1155,
  'personal care': 1160, 'toiletries': 1160, 'hygiene': 1160,
  'skincare': 1161, 'skin care': 1161, 'moisturizer': 1161, 'lotion': 1161,
  'shampoo': 1162, 'conditioner': 1162, 'hair care': 1162,
  'toothpaste': 1163, 'mouthwash': 1163, 'oral care': 1163,
  'deodorant': 1164, 'antiperspirant': 1164,
  'cleaning': 1171, 'cleaner': 1171, 'soap': 1171, 'detergent': 1171,
  'laundry': 1172, 'fabric softener': 1172,
  'makeup': 1176, 'cosmetics': 1176, 'lipstick': 1176, 'foundation': 1176, 'mascara': 1176,
  'perfume': 1177, 'cologne': 1177, 'fragrance': 1177,
  'baby': 1180, 'infant': 1180,
  'diaper': 1181, 'diapers': 1181, 'nappies': 1181,
  'baby food': 1182, 'formula': 1182,
  'pet food': 1185, 'dog food': 1185, 'cat food': 1185,
  'hfss': 1190, 'high fat': 1190, 'high sugar': 1190, 'high salt': 1190,

  // Dating (1210)
  'dating': 1210, 'date': 1210, 'singles': 1210,
  'dating app': 1211, 'tinder': 1211, 'bumble': 1211, 'hinge': 1211,
  'matchmaking': 1212, 'matchmaker': 1212,

  // Dieting and Weight Loss (1220)
  'diet': 1220, 'weight loss': 1220, 'lose weight': 1220, 'slimming': 1220,
  'diet program': 1221, 'weight watchers': 1221, 'keto': 1221, 'paleo': 1221,
  'diet pills': 1222, 'fat burner': 1222, 'appetite suppressant': 1222,

  // Durable Goods (1225)
  'durable goods': 1225, 'appliance': 1225, 'appliances': 1225,
  'kitchen appliance': 1227, 'refrigerator': 1227, 'oven': 1227, 'microwave': 1227, 'dishwasher': 1227,
  'washer': 1228, 'dryer': 1228, 'washing machine': 1228,
  'furniture': 1230, 'sofa': 1230, 'couch': 1230, 'chair': 1230, 'table': 1230,
  'bed': 1232, 'mattress': 1232, 'bedroom': 1232,
  'patio': 1233, 'outdoor furniture': 1233,
  'home improvement': 1240, 'renovation': 1240, 'remodel': 1240,
  'tools': 1241, 'power tools': 1241, 'drill': 1241, 'saw': 1241,
  'bedding': 1250, 'sheets': 1250, 'pillows': 1250, 'blanket': 1250,

  // Education and Careers (1260)
  'education': 1260, 'learning': 1260, 'school': 1260,
  'college': 1261, 'university': 1261, 'degree': 1261,
  'online course': 1262, 'e-learning': 1262, 'coursera': 1262, 'udemy': 1262,
  'vocational': 1263, 'trade school': 1263, 'certification': 1263,
  'job': 1265, 'career': 1265, 'employment': 1265, 'hiring': 1265, 'job search': 1265,
  'professional development': 1270, 'training': 1270,
  'k-12': 1275, 'elementary': 1275, 'high school': 1275,
  'test prep': 1280, 'sat': 1280, 'gre': 1280, 'gmat': 1280,
  'language learning': 1285, 'duolingo': 1285, 'babel': 1285,

  // Events and Performances (1290)
  'event': 1290, 'events': 1290, 'performance': 1290,
  'concert': 1291, 'concerts': 1291, 'live music': 1291,
  'sports event': 1292, 'game': 1292, 'match': 1292,
  'festival': 1293, 'festivals': 1293,
  'conference': 1295, 'summit': 1295, 'expo': 1295,
  'ticket': 1300, 'tickets': 1300, 'ticketmaster': 1300, 'stubhub': 1300,

  // Family and Parenting (1310)
  'family': 1310, 'parenting': 1310, 'parent': 1310,
  'parenting tips': 1311, 'parenting advice': 1311,
  'childcare': 1312, 'daycare': 1312, 'nanny': 1312,
  'pregnancy': 1315, 'pregnant': 1315, 'maternity': 1315,
  'toys': 1321, 'toy': 1321, 'lego': 1321, 'dolls': 1321,
  'games': 1322, 'board games': 1322,

  // Finance and Insurance (1340)
  'finance': 1340, 'financial': 1340, 'money': 1340,
  'bank': 1341, 'banking': 1341,
  'checking': 1342, 'checking account': 1342,
  'savings': 1343, 'savings account': 1343,
  'credit card': 1345, 'credit cards': 1345, 'visa': 1345, 'mastercard': 1345, 'amex': 1345,
  'loan': 1350, 'loans': 1350, 'lending': 1350,
  'personal loan': 1351,
  'mortgage': 1352, 'home loan': 1352,
  'auto loan': 1353, 'car loan': 1353,
  'insurance': 1355,
  'car insurance': 1356, 'auto insurance': 1356,
  'home insurance': 1357, 'homeowners insurance': 1357,
  'life insurance': 1358,
  'health insurance': 1359, 'medical insurance': 1359,
  'investment': 1365, 'investing': 1365, 'invest': 1365,
  'stock': 1366, 'stocks': 1366, 'stock market': 1366, 'trading': 1366,
  'bond': 1367, 'bonds': 1367,
  'mutual fund': 1368, 'etf': 1368, 'index fund': 1368,
  'retirement': 1370, '401k': 1370, 'ira': 1370, 'pension': 1370,
  'tax': 1375, 'taxes': 1375, 'tax prep': 1375, 'turbotax': 1375,
  'financial planning': 1380, 'financial advisor': 1380, 'wealth management': 1380,
  'fintech': 1385, 'paypal': 1385, 'venmo': 1385, 'stripe': 1385,

  // Fitness Activities (1390)
  'fitness': 1390, 'workout': 1390, 'exercise': 1390,
  'gym': 1391, 'fitness center': 1391, 'health club': 1391,
  'fitness class': 1392, 'aerobics': 1392, 'spin': 1392, 'crossfit': 1392,
  'personal trainer': 1393, 'pt': 1393,
  'yoga': 1395, 'pilates': 1395,
  'fitness app': 1400, 'peloton': 1400, 'strava': 1400,

  // Food and Beverage Services (1410)
  'restaurant': 1411, 'dining': 1411, 'eatery': 1411,
  'fast food': 1412, 'mcdonalds': 1412, 'burger king': 1412, 'wendys': 1412,
  'casual dining': 1413, 'applebees': 1413, 'chilis': 1413,
  'fine dining': 1414, 'upscale': 1414, 'gourmet': 1414,
  'food delivery': 1420, 'doordash': 1420, 'ubereats': 1420, 'grubhub': 1420,
  'meal kit': 1425, 'hello fresh': 1425, 'blue apron': 1425,
  'coffee': 1430, 'tea': 1430, 'starbucks': 1430, 'dunkin': 1430,
  'grocery': 1435, 'supermarket': 1435, 'groceries': 1435,

  // Gambling (1440)
  'gambling': 1440, 'gamble': 1440, 'betting': 1440, 'wager': 1440,
  'casino': 1441, 'casinos': 1441, 'slots': 1441, 'blackjack': 1441, 'poker': 1441,
  'lottery': 1442, 'lotto': 1442, 'powerball': 1442,
  'sports betting': 1443, 'sportsbook': 1443, 'draftkings': 1443, 'fanduel': 1443,
  'online casino': 1445, 'online gambling': 1445,
  'fantasy sports': 1450, 'fantasy football': 1450,

  // Health and Medical Services (1480)
  'health': 1480, 'healthcare': 1480, 'medical': 1480,
  'doctor': 1481, 'physician': 1481, 'clinic': 1483,
  'hospital': 1482, 'hospitals': 1482,
  'dentist': 1485, 'dental': 1485, 'orthodontist': 1485,
  'eye doctor': 1490, 'optometrist': 1490, 'ophthalmologist': 1490, 'vision': 1490,
  'mental health': 1495, 'therapy': 1495, 'therapist': 1495, 'counseling': 1495, 'psychiatrist': 1495,
  'telemedicine': 1500, 'telehealth': 1500, 'virtual doctor': 1500,
  'medical device': 1505, 'medical equipment': 1505,
  'senior care': 1510, 'elderly care': 1510, 'nursing home': 1510,
  'alternative medicine': 1515, 'holistic': 1515, 'acupuncture': 1515, 'chiropractor': 1515,

  // Home and Garden Services (1520)
  'home services': 1520, 'home service': 1520,
  'home security': 1521, 'security system': 1521, 'alarm': 1521,
  'cleaning service': 1522, 'maid service': 1522, 'house cleaning': 1522,
  'landscaping': 1525, 'lawn care': 1525, 'gardening': 1525,
  'hvac': 1530, 'air conditioning': 1530, 'heating': 1530,
  'plumber': 1535, 'plumbing': 1535,
  'pest control': 1540, 'exterminator': 1540,
  'moving': 1545, 'movers': 1545, 'relocation': 1545,

  // Legal Services (1550)
  'lawyer': 1550, 'attorney': 1550, 'legal': 1550, 'law firm': 1550,
  'personal injury': 1551, 'injury lawyer': 1551,
  'divorce': 1552, 'family law': 1552, 'custody': 1552,
  'criminal defense': 1553, 'dui': 1553,
  'business lawyer': 1555, 'corporate law': 1555,

  // Media (1560)
  'media': 1560, 'entertainment': 1560,
  'streaming': 1561, 'stream': 1561,
  'netflix': 1562, 'hulu': 1562, 'disney+': 1562, 'hbo max': 1562, 'video streaming': 1562,
  'spotify': 1563, 'apple music': 1563, 'music streaming': 1563,
  'news': 1565, 'journalism': 1565, 'newspaper': 1565,
  'podcast': 1570, 'podcasts': 1570,
  'book': 1575, 'books': 1575, 'ebook': 1575, 'kindle': 1575,
  'movie': 1580, 'movies': 1580, 'film': 1580, 'cinema': 1580,
  'tv show': 1585, 'series': 1585, 'television show': 1585,
  'music': 1590, 'album': 1590, 'artist': 1590,
  'radio': 1595, 'radio station': 1595,
  'social media': 1600, 'facebook': 1600, 'instagram': 1600, 'twitter': 1600, 'tiktok': 1600,

  // Non-Fiat Currency (1620)
  'crypto': 1621, 'cryptocurrency': 1621, 'bitcoin': 1621, 'ethereum': 1621, 'blockchain': 1621,
  'nft': 1622, 'nfts': 1622, 'digital art': 1622,

  // Pet Ownership (1660)
  'pet': 1660, 'pets': 1660,
  'pet supplies': 1661, 'pet store': 1661,
  'pet grooming': 1662, 'dog walker': 1662, 'pet sitter': 1662,
  'vet': 1665, 'veterinarian': 1665, 'animal hospital': 1665,
  'pet insurance': 1670,

  // Pharmaceuticals (1680)
  'pharmaceutical': 1680, 'pharma': 1680, 'drug': 1680, 'medication': 1680,
  'prescription': 1681, 'rx': 1681,
  'otc': 1682, 'over the counter': 1682, 'aspirin': 1682, 'ibuprofen': 1682,
  'vitamin': 1685, 'vitamins': 1685, 'supplement': 1685, 'supplements': 1685,
  'pharmacy': 1690, 'drugstore': 1690, 'cvs': 1690, 'walgreens': 1690,

  // Real Estate (1720)
  'real estate': 1720, 'property': 1720,
  'residential': 1721, 'home': 1721, 'house': 1721,
  'home for sale': 1722, 'buy house': 1722, 'zillow': 1722, 'redfin': 1722,
  'apartment': 1723, 'rent': 1723, 'rental': 1723, 'lease': 1723,
  'commercial real estate': 1725, 'office space': 1725,
  'realtor': 1730, 'real estate agent': 1730,
  'property management': 1735,

  // Retail (1750)
  'retail': 1750, 'store': 1750, 'shop': 1750,
  'ecommerce': 1751, 'e-commerce': 1751, 'online shopping': 1751, 'amazon': 1751,
  'department store': 1752, 'macys': 1752, 'nordstrom': 1752,

  // Sporting Goods (1770)
  'sporting goods': 1770, 'sports equipment': 1770,
  'fitness equipment': 1771, 'treadmill': 1771, 'weights': 1771, 'dumbbells': 1771,
  'outdoor': 1772, 'outdoor gear': 1772,
  'camping': 1773, 'hiking': 1773, 'tent': 1773, 'backpack': 1773,
  'fishing': 1774, 'fishing gear': 1774, 'rod': 1774, 'reel': 1774,
  'hunting': 1775, 'hunting gear': 1775,
  'team sports': 1780, 'soccer ball': 1780, 'basketball': 1780, 'football': 1780,
  'water sports': 1785, 'surfing': 1785, 'kayak': 1785, 'paddleboard': 1785,
  'winter sports': 1790, 'ski': 1790, 'skiing': 1790, 'snowboard': 1790,
  'golf': 1795, 'golf clubs': 1795, 'golf balls': 1795,

  // Tobacco (1800)
  'tobacco': 1800,
  'cigarette': 1801, 'cigarettes': 1801,
  'cigar': 1802, 'cigars': 1802,
  'vape': 1803, 'vaping': 1803, 'e-cigarette': 1803, 'juul': 1803,

  // Travel and Tourism (1810)
  'travel': 1810, 'vacation': 1810, 'trip': 1810, 'tourism': 1810,
  'airline': 1811, 'flight': 1811, 'flights': 1811, 'airfare': 1811,
  'hotel': 1812, 'hotels': 1812, 'accommodation': 1812, 'marriott': 1812, 'hilton': 1812,
  'vacation rental': 1813, 'airbnb': 1813, 'vrbo': 1813,
  'car rental': 1815, 'rental car': 1815, 'hertz': 1815, 'enterprise': 1815,
  'cruise': 1820, 'cruises': 1820, 'carnival': 1820, 'royal caribbean': 1820,
  'travel package': 1825, 'tour': 1825, 'tours': 1825,
  'expedia': 1830, 'booking.com': 1830, 'kayak': 1830, 'travel booking': 1830,
  'luggage': 1835, 'suitcase': 1835, 'travel bag': 1835,
  'theme park': 1840, 'disney': 1840, 'universal': 1840,
  'business travel': 1845,
  'adventure travel': 1850, 'safari': 1850,

  // Vehicles (1860)
  'vehicle': 1860, 'vehicles': 1860,
  'car': 1861, 'cars': 1861, 'automobile': 1861, 'auto': 1861,
  'new car': 1862,
  'used car': 1863, 'pre-owned': 1863,
  'dealership': 1864, 'car dealer': 1864,
  'auto parts': 1870, 'car parts': 1870, 'autozone': 1870,
  'auto repair': 1876, 'mechanic': 1876, 'car repair': 1876,
  'car wash': 1877,
  'motorcycle': 1880, 'motorbike': 1880, 'harley': 1880,
  'boat': 1885, 'boats': 1885, 'yacht': 1885,
  'rv': 1890, 'camper': 1890, 'motorhome': 1890,
  'bicycle': 1895, 'bike': 1895, 'cycling': 1895,
  'electric car': 1900, 'ev': 1900, 'tesla': 1900, 'electric vehicle': 1900,
  'truck': 1905, 'suv': 1905, 'pickup': 1905,
  'commercial vehicle': 1910, 'fleet': 1910,

  // Weapons and Ammunition (1920)
  'weapon': 1920, 'weapons': 1920,
  'gun': 1921, 'firearm': 1921, 'firearms': 1921, 'rifle': 1921, 'pistol': 1921,
  'ammunition': 1922, 'ammo': 1922, 'bullets': 1922,
  'knife': 1923, 'knives': 1923, 'blade': 1923
};

/**
 * Map a single keyword to IAB Ad Product category
 * @param {string} keyword - Keyword to map
 * @returns {Object|null} Category info with ID, name, and confidence
 */
export function mapKeywordToCategory(keyword) {
  if (!keyword || typeof keyword !== 'string') return null;

  const normalized = keyword.toLowerCase().trim();
  const categoryId = KEYWORD_MAPPINGS[normalized];

  if (!categoryId) return null;

  const category = getCategoryById(categoryId);
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    tier: category.tier,
    parent: category.parent,
    confidence: 0.95 // High confidence for exact keyword match
  };
}

/**
 * Map multiple keywords to IAB Ad Product categories
 * @param {string[]} keywords - Keywords to map
 * @returns {Object[]} Array of category matches with scores
 */
export function mapKeywordsToCategories(keywords) {
  if (!keywords || !Array.isArray(keywords)) return [];

  const categoryScores = new Map();

  for (const keyword of keywords) {
    const match = mapKeywordToCategory(keyword);
    if (match) {
      const existing = categoryScores.get(match.id);
      if (existing) {
        existing.matchCount++;
        existing.keywords.push(keyword);
      } else {
        categoryScores.set(match.id, {
          ...match,
          matchCount: 1,
          keywords: [keyword]
        });
      }
    }
  }

  // Convert to array and sort by match count
  const results = Array.from(categoryScores.values())
    .map(cat => ({
      ...cat,
      confidence: Math.min(0.95 + (cat.matchCount - 1) * 0.01, 0.99)
    }))
    .sort((a, b) => b.matchCount - a.matchCount);

  return results;
}

/**
 * Find best category match from text
 * @param {string} text - Text to analyze
 * @returns {Object|null} Best matching category
 */
export function findBestMatch(text) {
  if (!text || typeof text !== 'string') return null;

  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Try exact keyword matches first
  for (const word of words) {
    const match = mapKeywordToCategory(word);
    if (match) return match;
  }

  // Try two-word combinations
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    const match = mapKeywordToCategory(phrase);
    if (match) return match;
  }

  return null;
}

/**
 * Get all keywords for a category
 * @param {number} categoryId - Category ID
 * @returns {string[]} Keywords that map to this category
 */
export function getKeywordsForCategory(categoryId) {
  const numId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  return Object.entries(KEYWORD_MAPPINGS)
    .filter(([_, id]) => id === numId)
    .map(([keyword]) => keyword);
}

/**
 * Get all mapped keywords
 * @returns {string[]} All available keywords
 */
export function getAllKeywords() {
  return Object.keys(KEYWORD_MAPPINGS);
}

export { KEYWORD_MAPPINGS };
export default {
  KEYWORD_MAPPINGS,
  mapKeywordToCategory,
  mapKeywordsToCategories,
  findBestMatch,
  getKeywordsForCategory,
  getAllKeywords
};
