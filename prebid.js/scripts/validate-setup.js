#!/usr/bin/env node

/**
 * Validate Mixpeek API Setup
 * 
 * This script checks if your Mixpeek credentials are configured correctly
 * and can connect to the API.
 */

const https = require('https')

const config = {
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  namespace: process.env.MIXPEEK_NAMESPACE,
  endpoint: process.env.MIXPEEK_API_ENDPOINT || 'https://api.mixpeek.com'
}

console.log('\n🔍 Mixpeek API Setup Validation\n')
console.log('================================\n')

// Check environment variables
console.log('📋 Configuration Check:')
console.log(`   API Key: ${config.apiKey ? '✅ Set' : '❌ Missing'}`)
console.log(`   Collection ID: ${config.collectionId ? '✅ Set' : '⚠️  Not set (will create)'}`)
console.log(`   Namespace: ${config.namespace ? '✅ ' + config.namespace : '⚠️  Not set (using default)'}`)
console.log(`   Endpoint: ${config.endpoint}\n`)

if (!config.apiKey) {
  console.error('❌ Error: MIXPEEK_API_KEY is not set\n')
  console.log('To fix this:')
  console.log('  1. Get an API key from https://mixpeek.com/start')
  console.log('  2. Set the environment variable:')
  console.log('     export MIXPEEK_API_KEY="sk_your_api_key"\n')
  process.exit(1)
}

// Test API connection
console.log('🌐 Testing API Connection...\n')

const healthCheckUrl = new URL('/v1/health', config.endpoint)

const options = {
  hostname: healthCheckUrl.hostname,
  port: healthCheckUrl.port || 443,
  path: healthCheckUrl.pathname,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${config.apiKey}`
  }
}

const req = https.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API Connection: Success')
      
      try {
        const response = JSON.parse(data)
        console.log('   Status:', response.status || 'healthy')
      } catch (e) {
        console.log('   Response received')
      }
    } else if (res.statusCode === 401) {
      console.error('❌ API Connection: Unauthorized')
      console.error('   Your API key is invalid or expired')
      console.error('   Status:', res.statusCode)
      process.exit(1)
    } else {
      console.error('❌ API Connection: Failed')
      console.error('   Status:', res.statusCode)
      console.error('   Response:', data)
      process.exit(1)
    }

    // Test feature extractors endpoint
    console.log('\n🧩 Testing Feature Extractors Endpoint...\n')

    const extractorsUrl = new URL('/v1/collections/features/extractors', config.endpoint)
    const extractorsOptions = {
      hostname: extractorsUrl.hostname,
      port: extractorsUrl.port || 443,
      path: extractorsUrl.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    }

    const extractorsReq = https.request(extractorsOptions, (extractorsRes) => {
      let extractorsData = ''

      extractorsRes.on('data', (chunk) => {
        extractorsData += chunk
      })

      extractorsRes.on('end', () => {
        if (extractorsRes.statusCode === 200) {
          console.log('✅ Feature Extractors: Available')
          
          try {
            const extractors = JSON.parse(extractorsData)
            if (Array.isArray(extractors)) {
              console.log(`   Found ${extractors.length} extractors`)
              
              const extractorNames = extractors
                .map(e => e.feature_extractor_id || e.id || e.name)
                .filter(Boolean)
                .slice(0, 5)
              
              if (extractorNames.length > 0) {
                console.log('   Available:', extractorNames.join(', '))
              }
            }
          } catch (e) {
            console.log('   Endpoint accessible')
          }
        } else {
          console.warn('⚠️  Feature Extractors: Endpoint returned', extractorsRes.statusCode)
        }

        // Final summary
        console.log('\n================================\n')
        console.log('✅ Setup validation complete!\n')
        console.log('You can now run live API tests:')
        console.log('  npm run test:live\n')
        
        if (!config.collectionId) {
          console.log('💡 Tip: Create a collection to speed up tests:')
          console.log('  npm run create-collection\n')
        }

        process.exit(0)
      })
    })

    extractorsReq.on('error', (e) => {
      console.error('❌ Feature Extractors Test Failed:', e.message)
      process.exit(1)
    })

    extractorsReq.end()
  })
})

req.on('error', (e) => {
  console.error('❌ API Connection Failed:', e.message)
  console.error('\nPossible causes:')
  console.error('  - No internet connection')
  console.error('  - Firewall blocking HTTPS')
  console.error('  - Invalid endpoint URL')
  process.exit(1)
})

req.end()

