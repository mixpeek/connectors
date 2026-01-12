/**
 * @mixpeek/iab-ad-product-taxonomy - CommonJS entry point
 *
 * For ESM, use: import { createMapper } from '@mixpeek/iab-ad-product-taxonomy'
 * For CommonJS, use: const { createMapper } = require('@mixpeek/iab-ad-product-taxonomy')
 */

'use strict';

// Dynamic import wrapper for CommonJS compatibility
let modulePromise = null;

function getModule() {
  if (!modulePromise) {
    modulePromise = import('./index.js');
  }
  return modulePromise;
}

// Export a promise-based API for CommonJS
module.exports = {
  // Async factory function
  async createMapper(config) {
    const mod = await getModule();
    return mod.createMapper(config);
  },

  // Quick mapping function
  async mapProduct(product, options) {
    const mod = await getModule();
    return mod.mapProduct(product, options);
  },

  // Get the full module (for advanced usage)
  getModule,

  // Version info
  version: '1.0.0'
};
