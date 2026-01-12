/**
 * Jest Test Setup for ESM
 */
import { jest, beforeEach, beforeAll, afterAll } from '@jest/globals';

// Make jest available globally for mocking
globalThis.jest = jest;

// Mock fetch globally
global.fetch = jest.fn();

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  };
}

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  if (global.fetch.mockReset) {
    global.fetch.mockReset();
  }
});

// Console spy to reduce noise during tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless DEBUG=true
  if (process.env.DEBUG !== 'true') {
    console.log = jest.fn();
    console.debug = jest.fn();
    console.info = jest.fn();
  }
});

afterAll(() => {
  // Restore console
  Object.assign(console, originalConsole);
});

// Helper to create mock fetch response
global.createMockResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
};

// Helper to create mock error response
global.createMockErrorResponse = (message, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message)
  });
};

// Sample OpenRTB bid request for tests
global.sampleBidRequest = {
  id: 'test-request-123',
  imp: [
    {
      id: 'imp-1',
      banner: {
        w: 300,
        h: 250
      },
      bidfloor: 0.5
    }
  ],
  site: {
    id: 'site-123',
    name: 'Test Publisher',
    domain: 'example.com',
    page: 'https://example.com/article/tech-news',
    keywords: 'technology,news,gadgets',
    cat: ['IAB19'],
    publisher: {
      id: 'pub-123',
      name: 'Example Publisher'
    },
    content: {
      title: 'Latest Technology News and Reviews',
      keywords: 'smartphones,laptops,ai'
    }
  },
  device: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ip: '192.168.1.1'
  },
  user: {
    id: 'user-abc'
  }
};

// Sample video bid request
global.sampleVideoBidRequest = {
  id: 'video-request-456',
  imp: [
    {
      id: 'video-imp-1',
      video: {
        mimes: ['video/mp4'],
        minduration: 5,
        maxduration: 30,
        protocols: [2, 3],
        w: 640,
        h: 480,
        linearity: 1,
        placement: 1
      }
    }
  ],
  site: {
    id: 'video-site-123',
    name: 'Video Publisher',
    domain: 'videos.example.com',
    page: 'https://videos.example.com/watch/12345',
    content: {
      title: 'Amazing Documentary About Technology',
      series: 'Tech Today',
      season: '2',
      episode: '5',
      len: 1800,
      livestream: 0
    }
  }
};

// Sample app bid request
global.sampleAppBidRequest = {
  id: 'app-request-789',
  imp: [
    {
      id: 'app-imp-1',
      banner: {
        w: 320,
        h: 50
      }
    }
  ],
  app: {
    id: 'app-123',
    name: 'Cool News App',
    bundle: 'com.example.newsapp',
    storeurl: 'https://play.google.com/store/apps/details?id=com.example.newsapp',
    domain: 'example.com',
    cat: ['IAB12'],
    publisher: {
      id: 'app-pub-123',
      name: 'App Publisher'
    },
    content: {
      title: 'Breaking News Feed',
      keywords: 'news,breaking,politics'
    }
  },
  device: {
    ua: 'Mozilla/5.0 (Linux; Android 10)',
    ifa: 'test-device-id'
  }
};

// Sample API response
global.sampleApiResponse = {
  id: 'doc-123',
  document_id: 'doc-123',
  keywords: ['technology', 'news', 'gadgets', 'smartphones', 'ai'],
  sentiment: {
    sentiment: 'positive',
    score: 0.7
  },
  categories: {
    category: 'IAB19',
    categoryName: 'Technology & Computing',
    confidence: 0.85
  },
  embeddings: {
    id: 'emb-123',
    vector: [0.1, 0.2, 0.3]
  }
};
