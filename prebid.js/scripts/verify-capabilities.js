#!/usr/bin/env node

/**
 * Verify Actual Mixpeek Capabilities
 * 
 * This script tests the Mixpeek API to discover what's actually available
 * instead of making assumptions.
 */

const https = require('https')

const config = {
  apiKey: process.env.MIXPEEK_API_KEY,
  collectionId: process.env.MIXPEEK_COLLECTION_ID,
  endpoint: process.env.MIXPEEK_API_ENDPOINT || 'https://server-xb24.onrender.com'
}

console.log('\n🔍 Mixpeek Capability Verification\n')
console.log('==================================\n')

if (!config.apiKey) {
  console.error('❌ Error: MIXPEEK_API_KEY not set')
  process.exit(1)
}

// Helper to make API requests
function apiRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, config.endpoint)
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const req = https.request(requestOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, data: json, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers })
        }
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function main() {
  try {
    // 1. List all feature extractors
    console.log('📦 Step 1: Listing Feature Extractors\n')
    const extractorsResponse = await apiRequest('/v1/collections/features/extractors')
    
    if (extractorsResponse.status === 200 && Array.isArray(extractorsResponse.data)) {
      console.log(`✅ Found ${extractorsResponse.data.length} feature extractors:\n`)
      
      extractorsResponse.data.forEach((extractor, index) => {
        const id = extractor.feature_extractor_id || extractor.id || extractor.name
        const name = extractor.name || extractor.feature_extractor_id
        const description = extractor.description || ''
        
        console.log(`${index + 1}. ${id}`)
        if (name !== id) console.log(`   Name: ${name}`)
        if (description) console.log(`   Description: ${description}`)
        console.log()
      })
      
      // 2. Check for specific extractors we care about
      console.log('\n🎯 Step 2: Checking for Key Extractors\n')
      
      const extractorIds = extractorsResponse.data.map(e => 
        (e.feature_extractor_id || e.id || e.name || '').toLowerCase()
      )
      
      const keyExtractors = {
        taxonomy: extractorIds.some(id => id.includes('taxonomy')),
        'brand-safety': extractorIds.some(id => id.includes('brand') || id.includes('safety')),
        keywords: extractorIds.some(id => id.includes('keyword')),
        sentiment: extractorIds.some(id => id.includes('sentiment')),
        clustering: extractorIds.some(id => id.includes('cluster')),
        embedding: extractorIds.some(id => id.includes('embed'))
      }
      
      Object.entries(keyExtractors).forEach(([name, exists]) => {
        console.log(`${exists ? '✅' : '❌'} ${name}`)
      })
      
      // 3. Get details for taxonomy extractor if it exists
      if (keyExtractors.taxonomy) {
        console.log('\n📋 Step 3: Taxonomy Extractor Details\n')
        
        const taxonomyId = extractorsResponse.data.find(e => 
          (e.feature_extractor_id || e.id || e.name || '').toLowerCase().includes('taxonomy')
        )
        
        if (taxonomyId) {
          const id = taxonomyId.feature_extractor_id || taxonomyId.id || taxonomyId.name
          try {
            const taxonomyDetails = await apiRequest(`/v1/collections/features/extractors/${id}`)
            console.log('Taxonomy Extractor Configuration:')
            console.log(JSON.stringify(taxonomyDetails.data, null, 2))
          } catch (e) {
            console.log('⚠️  Could not fetch taxonomy details:', e.message)
          }
        }
      }
      
      // 4. Test document creation with taxonomy if collection exists
      if (config.collectionId && keyExtractors.taxonomy) {
        console.log('\n🧪 Step 4: Testing Document Creation\n')
        
        const testDoc = {
          object_id: `test_${Date.now()}`,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          },
          features: [{
            feature_extractor_id: 'taxonomy',
            payload: {
              text: 'This is an article about mobile phones, smartphones, and the latest technology in consumer electronics. We review the newest devices and their features.'
            }
          }]
        }
        
        console.log('Creating test document with taxonomy extraction...')
        
        try {
          const docResponse = await apiRequest(
            `/v1/collections/${config.collectionId}/documents`,
            {
              method: 'POST',
              body: testDoc
            }
          )
          
          if (docResponse.status === 200 || docResponse.status === 201) {
            console.log('✅ Document created successfully')
            console.log('Document ID:', docResponse.data.document_id)
            
            if (docResponse.data.enrichments) {
              console.log('\n📊 Enrichments:')
              console.log(JSON.stringify(docResponse.data.enrichments, null, 2))
              
              if (docResponse.data.enrichments.taxonomies) {
                console.log('\n🏷️  Taxonomy Results:')
                docResponse.data.enrichments.taxonomies.forEach(tax => {
                  console.log(`  - ${tax.label} (score: ${tax.score})`)
                  if (tax.node_id) console.log(`    Node ID: ${tax.node_id}`)
                  if (tax.path) console.log(`    Path: ${tax.path.join(' > ')}`)
                })
              }
            } else {
              console.log('⚠️  No enrichments in response (may need to wait for processing)')
            }
          } else {
            console.log('❌ Document creation failed:', docResponse.status)
            console.log(docResponse.data)
          }
        } catch (e) {
          console.log('❌ Error creating test document:', e.message)
        }
      } else if (!config.collectionId) {
        console.log('\n⏭️  Skipping document test - MIXPEEK_COLLECTION_ID not set')
      }
      
    } else {
      console.log('❌ Failed to list feature extractors')
      console.log('Status:', extractorsResponse.status)
      console.log('Response:', extractorsResponse.data)
    }
    
    // Summary
    console.log('\n==================================')
    console.log('✅ Verification Complete\n')
    console.log('Next Steps:')
    console.log('1. Review the feature extractors available')
    console.log('2. Check taxonomy output format')
    console.log('3. Update gap analysis based on actual capabilities')
    console.log('4. Build only what\'s truly needed\n')
    
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message)
    process.exit(1)
  }
}

main()

