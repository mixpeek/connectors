/**
 * Jest Test Setup for @mixpeek/contentful (ESM)
 */
import { jest, beforeEach, beforeAll, afterAll } from '@jest/globals';

globalThis.jest = jest;
global.fetch = jest.fn();

if (typeof performance === 'undefined') {
  global.performance = { now: () => Date.now() };
}

beforeEach(() => {
  jest.clearAllMocks();
  if (global.fetch.mockReset) global.fetch.mockReset();
});

const originalConsole = { ...console };

beforeAll(() => {
  if (process.env.DEBUG !== 'true') {
    console.log = jest.fn();
    console.debug = jest.fn();
    console.info = jest.fn();
  }
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

global.createMockResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
};

global.createMockErrorResponse = (message, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message)
  });
};

global.sampleApiResponse = {
  id: 'doc-123',
  document_id: 'doc-123',
  status: 'ok',
  enrichments: {
    keywords: ['test', 'sample'],
    categories: ['general']
  }
};
