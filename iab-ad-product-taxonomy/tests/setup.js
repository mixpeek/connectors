/**
 * Jest Test Setup
 */

// Note: Timeout configured in jest.config.js via testTimeout

// Global test utilities
global.testUtils = {
  // Sample products for testing
  sampleProducts: {
    electronics: {
      title: 'Apple Watch Series 9',
      description: 'GPS smartwatch with heart rate monitor and fitness tracking',
      category: 'Electronics',
      brand: 'Apple'
    },
    clothing: {
      title: 'Nike Air Max Running Shoes',
      description: 'Lightweight running shoes with air cushioning',
      category: 'Footwear',
      brand: 'Nike'
    },
    food: {
      title: 'Organic Almond Butter',
      description: 'All-natural organic almond butter, no added sugar',
      category: 'Food & Grocery',
      brand: 'Whole Foods'
    },
    travel: {
      title: 'Marriott Bonvoy Hotel Stay',
      description: 'Luxury hotel accommodation with breakfast included',
      category: 'Travel',
      brand: 'Marriott'
    },
    automotive: {
      title: 'Tesla Model 3',
      description: 'All-electric sedan with autopilot capability',
      category: 'Vehicles',
      brand: 'Tesla'
    },
    finance: {
      title: 'Chase Sapphire Credit Card',
      description: 'Travel rewards credit card with 2x points on dining',
      category: 'Finance',
      brand: 'Chase'
    },
    health: {
      title: 'One A Day Vitamins',
      description: 'Complete multivitamin for adults',
      category: 'Health',
      brand: 'Bayer'
    },
    gaming: {
      title: 'PlayStation 5 Console',
      description: 'Next-gen gaming console with 4K graphics',
      category: 'Gaming',
      brand: 'Sony'
    }
  },

  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Random string generator
  randomString: (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Clean up after all tests
afterAll(() => {
  // Add any global cleanup here
});
