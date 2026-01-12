/**
 * Unit Tests - Brand Safety Classifier
 */

import {
  createClassifier,
  isBrandSafe,
  RISK_LEVELS,
  GARM_CATEGORIES,
  getRiskLevel,
  isSensitiveCategory,
  SENSITIVE_CATEGORIES
} from '../../src/index.js';

describe('Brand Safety Classifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = createClassifier();
  });

  describe('createClassifier', () => {
    it('should create classifier with default config', () => {
      expect(classifier).toBeDefined();
      expect(classifier.classifyContent).toBeDefined();
      expect(classifier.classifyProduct).toBeDefined();
    });

    it('should accept custom blocked keywords', () => {
      const custom = createClassifier({
        blockedKeywords: ['badword']
      });

      const result = custom.classifyContent({
        text: 'Content with badword here'
      });

      expect(result.flaggedKeywords).toContain('badword');
    });

    it('should accept custom blocked categories', () => {
      const custom = createClassifier({
        blockedCategories: [1115]  // Consumer Electronics (normally safe)
      });

      expect(custom.isCategoryBlocked(1115)).toBe(true);
    });

    it('should block floor categories by default', () => {
      expect(classifier.isCategoryBlocked(1008)).toBe(true);  // Adult
      expect(classifier.isCategoryBlocked(1009)).toBe(true);  // Adult Entertainment
    });
  });

  describe('classifyContent', () => {
    it('should classify safe content', () => {
      const result = classifier.classifyContent({
        text: 'Article about technology innovation',
        categories: [1115]  // Consumer Electronics
      });

      expect(result.safe).toBe(true);
      expect(result.risk).toBe(RISK_LEVELS.SAFE);
      expect(result.blocked).toBe(false);
    });

    it('should detect sensitive categories', () => {
      const result = classifier.classifyContent({
        text: 'Beer tasting event',
        categories: [1002]  // Alcohol (tier 1 with garmCategory)
      });

      expect(result.sensitiveCategories.length).toBeGreaterThan(0);
      expect(result.garmCategories).toContain('alcohol');
      expect(result.risk).toBe(RISK_LEVELS.HIGH);
    });

    it('should block floor-level categories', () => {
      const result = classifier.classifyContent({
        categories: [1008]  // Adult Products
      });

      expect(result.blocked).toBe(true);
      expect(result.safe).toBe(false);
      expect(result.risk).toBe(RISK_LEVELS.FLOOR);
    });

    it('should detect blocked keywords', () => {
      const result = classifier.classifyContent({
        text: 'This content contains violence and terrorism'
      });

      expect(result.flaggedKeywords.length).toBeGreaterThan(0);
      expect(result.flaggedKeywords).toContain('violence');
      expect(result.flaggedKeywords).toContain('terrorism');
    });

    it('should handle empty content', () => {
      const result = classifier.classifyContent({});

      expect(result.safe).toBe(true);
      expect(result.risk).toBe(RISK_LEVELS.SAFE);
    });
  });

  describe('classifyProduct', () => {
    it('should classify safe product', async () => {
      const result = await classifier.classifyProduct({
        title: 'Laptop Computer',
        categoryId: 1116  // Computers and Laptops
      });

      expect(result.safe).toBe(true);
      expect(result.risk).toBe(RISK_LEVELS.SAFE);
    });

    it('should classify alcohol product as high-risk', async () => {
      const result = await classifier.classifyProduct({
        title: 'Craft Beer Selection',
        categoryId: 1002  // Alcohol tier 1
      });

      // High risk but not blocked by default (only floor is blocked)
      expect(result.safe).toBe(true);
      expect(result.risk).toBe(RISK_LEVELS.HIGH);
      expect(result.isSensitive).toBe(true);
      expect(result.garmCategory).toBe('alcohol');
    });

    it('should block gambling in strict mode', async () => {
      const strictClassifier = createClassifier({ strictMode: true });
      const result = await strictClassifier.classifyProduct({
        title: 'Sports Betting App',
        categoryId: 1440  // Gambling tier 1
      });

      expect(result.safe).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.garmCategory).toBe('gambling');
    });

    it('should handle product without category', async () => {
      const result = await classifier.classifyProduct({
        title: 'Generic Product',
        description: 'A regular product'
      });

      expect(result.safe).toBe(true);
      expect(result.categoryId).toBeUndefined();
    });
  });

  describe('strict mode', () => {
    it('should block all high-risk categories in strict mode', () => {
      const strict = createClassifier({ strictMode: true });

      // Alcohol should be blocked in strict mode
      expect(strict.isCategoryBlocked(1004)).toBe(true);  // Beer
      expect(strict.isCategoryBlocked(1440)).toBe(true);  // Gambling
      expect(strict.isCategoryBlocked(1800)).toBe(true);  // Tobacco
    });
  });

  describe('getStats', () => {
    it('should track classification statistics', () => {
      classifier.classifyContent({ categories: [1115] });  // Safe
      classifier.classifyContent({ categories: [1004] });  // Alcohol
      classifier.classifyContent({ categories: [1008] });  // Floor

      const stats = classifier.getStats();

      expect(stats.requests).toBe(3);
      expect(stats.blocked).toBeGreaterThan(0);
      expect(stats.allowed).toBeGreaterThan(0);
    });

    it('should reset stats', () => {
      classifier.classifyContent({ categories: [1115] });
      classifier.resetStats();

      const stats = classifier.getStats();
      expect(stats.requests).toBe(0);
    });
  });

  describe('getGARMReport', () => {
    it('should return GARM category coverage', () => {
      const report = classifier.getGARMReport();

      expect(report.alcohol).toBeDefined();
      expect(report.gambling).toBeDefined();
      expect(report.tobacco).toBeDefined();
      expect(report.adult_explicit).toBeDefined();

      // Adult should be 100% blocked (floor)
      expect(report.adult_explicit.floor).toBe(true);
    });
  });
});

describe('Sensitive Categories Data', () => {
  describe('getRiskLevel', () => {
    it('should return correct risk for known categories', () => {
      expect(getRiskLevel(1008)).toBe(RISK_LEVELS.FLOOR);  // Adult
      expect(getRiskLevel(1004)).toBe(RISK_LEVELS.HIGH);   // Beer
      expect(getRiskLevel(1210)).toBe(RISK_LEVELS.MEDIUM); // Dating
    });

    it('should return safe for unknown categories', () => {
      expect(getRiskLevel(99999)).toBe(RISK_LEVELS.SAFE);
    });
  });

  describe('isSensitiveCategory', () => {
    it('should identify sensitive categories', () => {
      expect(isSensitiveCategory(1002)).toBe(true);   // Alcohol
      expect(isSensitiveCategory(1440)).toBe(true);   // Gambling
      expect(isSensitiveCategory(1115)).toBe(false);  // Consumer Electronics
    });
  });

  describe('GARM_CATEGORIES', () => {
    it('should have all required GARM categories', () => {
      const required = [
        'adult_explicit', 'arms_ammunition', 'alcohol',
        'drugs', 'gambling', 'tobacco'
      ];

      for (const cat of required) {
        expect(GARM_CATEGORIES[cat]).toBeDefined();
      }
    });
  });
});

describe('Quick Functions', () => {
  describe('isBrandSafe', () => {
    it('should return true for safe content', () => {
      expect(isBrandSafe({ categories: [1115] })).toBe(true);
    });

    it('should return false for blocked content', () => {
      expect(isBrandSafe({ categories: [1008] })).toBe(false);
    });
  });
});
