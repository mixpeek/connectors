/**
 * @mixpeek/openrtb - CommonJS entry point
 *
 * For ESM, use: import { OpenRTBEnricher } from '@mixpeek/openrtb'
 * For CommonJS, use: const { OpenRTBEnricher } = require('@mixpeek/openrtb')
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
  async createEnricher(config) {
    const mod = await getModule();
    return new mod.OpenRTBEnricher(config);
  },

  // Get the full module (for advanced usage)
  getModule,

  // Version info
  version: '1.0.0'
};
