/**
 * Mixpeek IAB Brand Safety Connector
 *
 * Brand safety and suitability classification based on GARM framework.
 */

export {
  createClassifier,
  isBrandSafe,
  isProductBrandSafe,
  BrandSafetyClassifier,
  RISK_LEVELS,
  GARM_CATEGORIES
} from './modules/brandSafetyClassifier.js';

export {
  SENSITIVE_CATEGORIES,
  CATEGORIES_BY_RISK,
  getRiskLevel,
  isSensitiveCategory,
  getGARMCategory,
  getCategoriesAtRisk
} from './data/sensitiveCategories.js';

// Default export
import { createClassifier } from './modules/brandSafetyClassifier.js';
export default { createClassifier };
