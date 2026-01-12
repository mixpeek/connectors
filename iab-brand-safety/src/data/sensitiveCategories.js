/**
 * Mixpeek IAB Brand Safety Connector - Sensitive Categories
 *
 * IAB Ad Product Taxonomy categories flagged as sensitive for brand safety.
 * Based on GARM Brand Safety Floor + Suitability Framework.
 */

// GARM Risk Levels
export const RISK_LEVELS = {
  FLOOR: 'floor',           // Brand Safety Floor - never run ads
  HIGH: 'high',             // High risk - most brands avoid
  MEDIUM: 'medium',         // Medium risk - context-dependent
  LOW: 'low',               // Low risk - generally acceptable
  SAFE: 'safe'              // Safe - no brand safety concerns
};

// Sensitive Category Definitions
// Maps IAB Ad Product Taxonomy IDs to risk levels and metadata
export const SENSITIVE_CATEGORIES = {
  // ==========================================
  // GARM FLOOR - Never acceptable
  // ==========================================

  // Adult & Explicit Content (1008)
  1008: {
    id: 1008,
    name: 'Adult Products and Services',
    risk: RISK_LEVELS.FLOOR,
    garmCategory: 'adult_explicit',
    description: 'Adult entertainment, explicit content, adult services',
    subcategories: [1009] // Adult Entertainment
  },
  1009: {
    id: 1009,
    name: 'Adult Entertainment',
    risk: RISK_LEVELS.FLOOR,
    garmCategory: 'adult_explicit',
    parent: 1008
  },

  // Illegal Activities
  // Note: No specific IAB category, detected via content analysis

  // ==========================================
  // HIGH RISK - Most brands avoid
  // ==========================================

  // Alcohol (1002)
  1002: {
    id: 1002,
    name: 'Alcohol',
    risk: RISK_LEVELS.HIGH,
    garmCategory: 'alcohol',
    description: 'Alcoholic beverages and related products',
    restrictions: ['age_gated', 'regional'],
    subcategories: [1003, 1004, 1005, 1006, 1007]
  },
  1003: { id: 1003, name: 'Bars and Restaurants', risk: RISK_LEVELS.MEDIUM, parent: 1002 },
  1004: { id: 1004, name: 'Beer', risk: RISK_LEVELS.HIGH, parent: 1002 },
  1005: { id: 1005, name: 'Hard Seltzers', risk: RISK_LEVELS.HIGH, parent: 1002 },
  1006: { id: 1006, name: 'Spirits', risk: RISK_LEVELS.HIGH, parent: 1002 },
  1007: { id: 1007, name: 'Wine', risk: RISK_LEVELS.HIGH, parent: 1002 },

  // Cannabis (1050)
  1050: {
    id: 1050,
    name: 'Cannabis',
    risk: RISK_LEVELS.HIGH,
    garmCategory: 'drugs',
    description: 'Cannabis products and accessories',
    restrictions: ['legal_status', 'age_gated', 'regional'],
    subcategories: [1051, 1052, 1053]
  },
  1051: { id: 1051, name: 'CBD Products', risk: RISK_LEVELS.MEDIUM, parent: 1050 },
  1052: { id: 1052, name: 'THC Products', risk: RISK_LEVELS.HIGH, parent: 1050 },
  1053: { id: 1053, name: 'Cannabis Accessories', risk: RISK_LEVELS.HIGH, parent: 1050 },

  // Gambling (1440)
  1440: {
    id: 1440,
    name: 'Gambling',
    risk: RISK_LEVELS.HIGH,
    garmCategory: 'gambling',
    description: 'Gambling, betting, and lottery products',
    restrictions: ['age_gated', 'regional', 'licensed'],
    subcategories: [1441, 1442, 1443, 1444, 1445]
  },
  1441: { id: 1441, name: 'Casinos', risk: RISK_LEVELS.HIGH, parent: 1440 },
  1442: { id: 1442, name: 'Lotteries', risk: RISK_LEVELS.MEDIUM, parent: 1440 },
  1443: { id: 1443, name: 'Online Gambling', risk: RISK_LEVELS.HIGH, parent: 1440 },
  1444: { id: 1444, name: 'Poker', risk: RISK_LEVELS.HIGH, parent: 1440 },
  1445: { id: 1445, name: 'Sports Betting', risk: RISK_LEVELS.HIGH, parent: 1440 },

  // Tobacco (1800)
  1800: {
    id: 1800,
    name: 'Tobacco',
    risk: RISK_LEVELS.HIGH,
    garmCategory: 'tobacco',
    description: 'Tobacco products and e-cigarettes',
    restrictions: ['age_gated', 'advertising_banned'],
    subcategories: [1801, 1802, 1803]
  },
  1801: { id: 1801, name: 'Cigarettes', risk: RISK_LEVELS.FLOOR, parent: 1800 },
  1802: { id: 1802, name: 'E-Cigarettes and Vaping', risk: RISK_LEVELS.HIGH, parent: 1800 },
  1803: { id: 1803, name: 'Smokeless Tobacco', risk: RISK_LEVELS.HIGH, parent: 1800 },

  // Weapons (1920)
  1920: {
    id: 1920,
    name: 'Weapons',
    risk: RISK_LEVELS.HIGH,
    garmCategory: 'arms_ammunition',
    description: 'Firearms, ammunition, and weapons',
    restrictions: ['age_gated', 'regional', 'licensed'],
    subcategories: [1921, 1922, 1923]
  },
  1921: { id: 1921, name: 'Firearms', risk: RISK_LEVELS.HIGH, parent: 1920 },
  1922: { id: 1922, name: 'Ammunition', risk: RISK_LEVELS.HIGH, parent: 1920 },
  1923: { id: 1923, name: 'Hunting Equipment', risk: RISK_LEVELS.MEDIUM, parent: 1920 },

  // ==========================================
  // MEDIUM RISK - Context-dependent
  // ==========================================

  // Dating (1210)
  1210: {
    id: 1210,
    name: 'Dating',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'dating',
    description: 'Dating services and apps',
    restrictions: ['age_gated'],
    subcategories: [1211, 1212]
  },
  1211: { id: 1211, name: 'Dating Apps', risk: RISK_LEVELS.MEDIUM, parent: 1210 },
  1212: { id: 1212, name: 'Matchmaking Services', risk: RISK_LEVELS.LOW, parent: 1210 },

  // Dieting and Weight Loss (1220)
  1220: {
    id: 1220,
    name: 'Dieting and Weight Loss',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'health_sensitive',
    description: 'Weight loss products and programs',
    restrictions: ['claims_verification'],
    subcategories: [1221, 1222]
  },
  1221: { id: 1221, name: 'Diet Programs', risk: RISK_LEVELS.LOW, parent: 1220 },
  1222: { id: 1222, name: 'Weight Loss Supplements', risk: RISK_LEVELS.MEDIUM, parent: 1220 },

  // Pharmaceuticals (1680)
  1680: {
    id: 1680,
    name: 'Pharmaceuticals',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'health_pharma',
    description: 'Prescription and OTC medications',
    restrictions: ['regional', 'claims_verification'],
    subcategories: [1681, 1682, 1683, 1684]
  },
  1681: { id: 1681, name: 'Prescription Medications', risk: RISK_LEVELS.MEDIUM, parent: 1680 },
  1682: { id: 1682, name: 'OTC Medications', risk: RISK_LEVELS.LOW, parent: 1680 },
  1683: { id: 1683, name: 'Vitamins and Supplements', risk: RISK_LEVELS.LOW, parent: 1680 },
  1684: { id: 1684, name: 'Medical Devices', risk: RISK_LEVELS.LOW, parent: 1680 },

  // Politics (1700)
  1700: {
    id: 1700,
    name: 'Politics',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'debated_social',
    description: 'Political content and campaigns',
    restrictions: ['disclosure_required', 'regional'],
    subcategories: [1701, 1702]
  },
  1701: { id: 1701, name: 'Political Campaigns', risk: RISK_LEVELS.MEDIUM, parent: 1700 },
  1702: { id: 1702, name: 'Political Organizations', risk: RISK_LEVELS.MEDIUM, parent: 1700 },

  // Religion (1710)
  1710: {
    id: 1710,
    name: 'Religion',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'religion',
    description: 'Religious products and services',
    subcategories: [1711, 1712]
  },
  1711: { id: 1711, name: 'Religious Organizations', risk: RISK_LEVELS.MEDIUM, parent: 1710 },
  1712: { id: 1712, name: 'Religious Products', risk: RISK_LEVELS.LOW, parent: 1710 },

  // HFSS Foods (1190)
  1190: {
    id: 1190,
    name: 'HFSS Foods',
    risk: RISK_LEVELS.MEDIUM,
    garmCategory: 'health_sensitive',
    description: 'High fat, sugar, salt foods - restricted for child audiences',
    restrictions: ['child_audiences', 'regional']
  }
};

// Quick lookup by risk level
export const CATEGORIES_BY_RISK = {
  [RISK_LEVELS.FLOOR]: Object.values(SENSITIVE_CATEGORIES)
    .filter(c => c.risk === RISK_LEVELS.FLOOR)
    .map(c => c.id),
  [RISK_LEVELS.HIGH]: Object.values(SENSITIVE_CATEGORIES)
    .filter(c => c.risk === RISK_LEVELS.HIGH)
    .map(c => c.id),
  [RISK_LEVELS.MEDIUM]: Object.values(SENSITIVE_CATEGORIES)
    .filter(c => c.risk === RISK_LEVELS.MEDIUM)
    .map(c => c.id)
};

// GARM category mapping
export const GARM_CATEGORIES = {
  adult_explicit: {
    name: 'Adult & Explicit Sexual Content',
    floor: true,
    categories: [1008, 1009]
  },
  arms_ammunition: {
    name: 'Arms & Ammunition',
    floor: false,
    categories: [1920, 1921, 1922, 1923]
  },
  alcohol: {
    name: 'Alcohol',
    floor: false,
    categories: [1002, 1003, 1004, 1005, 1006, 1007]
  },
  drugs: {
    name: 'Drugs/Controlled Substances',
    floor: false,
    categories: [1050, 1051, 1052, 1053]
  },
  gambling: {
    name: 'Gambling',
    floor: false,
    categories: [1440, 1441, 1442, 1443, 1444, 1445]
  },
  tobacco: {
    name: 'Tobacco',
    floor: false,
    categories: [1800, 1801, 1802, 1803]
  },
  dating: {
    name: 'Dating',
    floor: false,
    categories: [1210, 1211, 1212]
  },
  religion: {
    name: 'Religion',
    floor: false,
    categories: [1710, 1711, 1712]
  },
  debated_social: {
    name: 'Debated Sensitive Social Issues',
    floor: false,
    categories: [1700, 1701, 1702]
  },
  health_sensitive: {
    name: 'Health-Sensitive Topics',
    floor: false,
    categories: [1220, 1221, 1222, 1190]
  },
  health_pharma: {
    name: 'Pharmaceuticals',
    floor: false,
    categories: [1680, 1681, 1682, 1683, 1684]
  }
};

/**
 * Get risk level for a category ID
 * @param {number} categoryId - IAB Ad Product category ID
 * @returns {string} Risk level
 */
export function getRiskLevel(categoryId) {
  const category = SENSITIVE_CATEGORIES[categoryId];
  return category?.risk || RISK_LEVELS.SAFE;
}

/**
 * Check if category is sensitive
 * @param {number} categoryId - IAB Ad Product category ID
 * @returns {boolean}
 */
export function isSensitiveCategory(categoryId) {
  return categoryId in SENSITIVE_CATEGORIES;
}

/**
 * Get GARM category for a product category
 * @param {number} categoryId - IAB Ad Product category ID
 * @returns {string|null} GARM category name
 */
export function getGARMCategory(categoryId) {
  const category = SENSITIVE_CATEGORIES[categoryId];
  return category?.garmCategory || null;
}

/**
 * Get all category IDs at or above a risk level
 * @param {string} minRisk - Minimum risk level
 * @returns {number[]} Category IDs
 */
export function getCategoriesAtRisk(minRisk) {
  const riskOrder = [RISK_LEVELS.SAFE, RISK_LEVELS.LOW, RISK_LEVELS.MEDIUM, RISK_LEVELS.HIGH, RISK_LEVELS.FLOOR];
  const minIndex = riskOrder.indexOf(minRisk);

  return Object.values(SENSITIVE_CATEGORIES)
    .filter(c => riskOrder.indexOf(c.risk) >= minIndex)
    .map(c => c.id);
}

export default {
  RISK_LEVELS,
  SENSITIVE_CATEGORIES,
  CATEGORIES_BY_RISK,
  GARM_CATEGORIES,
  getRiskLevel,
  isSensitiveCategory,
  getGARMCategory,
  getCategoriesAtRisk
};
