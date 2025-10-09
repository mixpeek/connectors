/**
 * Mixpeek Configuration
 * 
 * This file allows you to configure the Mixpeek API endpoint
 * and other settings without modifying code.
 */

module.exports = {
  // API Endpoint - Choose one:
  // - Production: https://api.mixpeek.com
  // - Development: https://server-xb24.onrender.com
  // - Custom: Your own endpoint
  
  endpoint: process.env.MIXPEEK_API_ENDPOINT || 'https://server-xb24.onrender.com',
  
  // Alternative: Use predefined endpoints
  // endpoint: 'production',  // Uses https://api.mixpeek.com
  // endpoint: 'development', // Uses https://server-xb24.onrender.com
  // endpoint: 'local',       // Uses http://localhost:8000
  
  // Your API credentials (use environment variables in production!)
  apiKey: process.env.MIXPEEK_API_KEY || '',
  collectionId: process.env.MIXPEEK_COLLECTION_ID || '',
  namespace: process.env.MIXPEEK_NAMESPACE || '',
  
  // Performance settings
  timeout: 5000, // ms - increased for development server
  cacheTTL: 300, // seconds
  retryAttempts: 2,
  
  // Feature extractors
  featureExtractors: ['taxonomy'],
  
  // Health check mode
  // - 'lazy': Check on first request (recommended, no page load impact)
  // - 'eager': Check on initialization (validates early, adds ~200-500ms)
  // - false: Skip health check (max performance)
  healthCheck: 'lazy',
  
  // Debug mode
  debug: true
}

