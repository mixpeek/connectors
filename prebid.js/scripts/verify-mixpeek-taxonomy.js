#!/usr/bin/env node

/**
 * Mixpeek Taxonomy Verification Script
 * 
 * This script helps you discover what Mixpeek's taxonomy extractor actually returns
 * so you can properly populate the IAB mapping table.
 * 
 * Usage:
 *   MIXPEEK_API_KEY=your_key COLLECTION_ID=your_collection node scripts/verify-mixpeek-taxonomy.js
 */

const https = require('https')
const http = require('http')

// Configuration
const API_KEY = process.env.MIXPEEK_API_KEY
const COLLECTION_ID = process.env.COLLECTION_ID
const ENDPOINT = process.env.MIXPEEK_ENDPOINT || 'https://server-xb24.onrender.com'

// Test content samples
const TEST_SAMPLES = [
  {
    id: 'tech_ai',
    text: 'Article about artificial intelligence and machine learning in modern technology'
  },
  {
    id: 'sports_football',
    text: 'Breaking news about the NFL football game and championship playoffs'
  },
  {
    id: 'business_finance',
    text: 'Stock market analysis and investment strategies for financial planning'
  },
  {
    id: 'health_fitness',
    text: 'Fitness tips and nutrition advice for healthy living and wellness'
  },
  {
    id: 'entertainment_movies',
    text: 'New Hollywood blockbuster movie release and cinema reviews'
  }
]

function makeRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (postData) {
      req.write(JSON.stringify(postData))
    }
    
    req.end()
  })
}

async function listFeatureExtractors() {
  console.log('\n📋 Step 1: Listing available feature extractors...\n')
  
  try {
    const url = `${ENDPOINT}/v1/collections/features/extractors`
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      console.log('✅ Available extractors:')
      if (Array.isArray(response.data)) {
        response.data.forEach(extractor => {
          console.log(`  - ${extractor.id || extractor.name || extractor}`)
        })
      } else {
        console.log(JSON.stringify(response.data, null, 2))
      }
    } else {
      console.log(`❌ Error: Status ${response.status}`)
      console.log(response.data)
    }
  } catch (error) {
    console.error('❌ Failed to list extractors:', error.message)
  }
}

async function getTaxonomyExtractorDetails() {
  console.log('\n📋 Step 2: Getting taxonomy extractor details...\n')
  
  try {
    const url = `${ENDPOINT}/v1/collections/features/extractors/taxonomy`
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      console.log('✅ Taxonomy extractor configuration:')
      console.log(JSON.stringify(response.data, null, 2))
    } else {
      console.log(`❌ Error: Status ${response.status}`)
      console.log(response.data)
    }
  } catch (error) {
    console.error('❌ Failed to get taxonomy details:', error.message)
  }
}

async function testTaxonomyWithSample(sample) {
  console.log(`\n🧪 Testing with sample: ${sample.id}`)
  console.log(`   Content: "${sample.text.substring(0, 50)}..."\n`)
  
  try {
    const url = `${ENDPOINT}/v1/collections/${COLLECTION_ID}/documents`
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }, {
      object_id: `test_${sample.id}_${Date.now()}`,
      features: [{
        feature_extractor_id: 'taxonomy',
        payload: {
          text: sample.text
        }
      }]
    })
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Success! Taxonomy response:')
      
      if (response.data.enrichments && response.data.enrichments.taxonomies) {
        const taxonomies = response.data.enrichments.taxonomies
        
        taxonomies.forEach((tax, idx) => {
          console.log(`\n   Taxonomy ${idx + 1}:`)
          console.log(`     label:    "${tax.label}"`)
          console.log(`     node_id:  "${tax.node_id}"`)
          console.log(`     path:     ${JSON.stringify(tax.path)}`)
          console.log(`     score:    ${tax.score}`)
          
          // Check if it's already IAB
          const iabMatch = (tax.label || '').match(/IAB\d+(-\d+)?/) || 
                          (tax.node_id || '').match(/IAB\d+(-\d+)?/)
          
          if (iabMatch) {
            console.log(`     ✅ Already contains IAB code: ${iabMatch[0]}`)
          } else {
            console.log(`     ⚠️  Needs mapping - add to MIXPEEK_NODE_TO_IAB:`)
            console.log(`        '${tax.node_id}': 'IAB_CODE_HERE',`)
          }
        })
      } else {
        console.log('   No taxonomies in response')
        console.log(JSON.stringify(response.data, null, 2))
      }
    } else {
      console.log(`❌ Error: Status ${response.status}`)
      console.log(JSON.stringify(response.data, null, 2))
    }
  } catch (error) {
    console.error(`❌ Failed to test sample ${sample.id}:`, error.message)
  }
}

async function generateMappingTemplate(results) {
  console.log('\n' + '='.repeat(80))
  console.log('📝 MAPPING TEMPLATE')
  console.log('='.repeat(80))
  console.log('\nAdd these mappings to src/utils/iabMapping.js:')
  console.log('\nexport const MIXPEEK_NODE_TO_IAB = {')
  
  results.forEach(result => {
    console.log(`  // ${result.sample.id}`)
    console.log(`  '${result.node_id}': 'IAB??-??',  // ${result.label}`)
  })
  
  console.log('}')
}

async function main() {
  console.log('=' .repeat(80))
  console.log('🔍 MIXPEEK TAXONOMY VERIFICATION')
  console.log('='.repeat(80))
  
  // Validate configuration
  if (!API_KEY) {
    console.error('\n❌ Error: MIXPEEK_API_KEY environment variable is required')
    console.log('\nUsage:')
    console.log('  MIXPEEK_API_KEY=your_key COLLECTION_ID=your_collection node scripts/verify-mixpeek-taxonomy.js')
    process.exit(1)
  }
  
  if (!COLLECTION_ID) {
    console.error('\n❌ Error: COLLECTION_ID environment variable is required')
    console.log('\nUsage:')
    console.log('  MIXPEEK_API_KEY=your_key COLLECTION_ID=your_collection node scripts/verify-mixpeek-taxonomy.js')
    process.exit(1)
  }
  
  console.log(`\nEndpoint:      ${ENDPOINT}`)
  console.log(`Collection ID: ${COLLECTION_ID}`)
  console.log(`API Key:       ${API_KEY.substring(0, 10)}...`)
  
  // Step 1: List available extractors
  await listFeatureExtractors()
  
  // Step 2: Get taxonomy extractor details
  await getTaxonomyExtractorDetails()
  
  // Step 3: Test with sample content
  console.log('\n' + '='.repeat(80))
  console.log('📋 Step 3: Testing taxonomy with sample content...')
  console.log('='.repeat(80))
  
  const results = []
  
  for (const sample of TEST_SAMPLES) {
    await testTaxonomyWithSample(sample)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('✅ VERIFICATION COMPLETE')
  console.log('='.repeat(80))
  console.log('\nNext steps:')
  console.log('1. Review the node_id values returned above')
  console.log('2. Update src/utils/iabMapping.js MIXPEEK_NODE_TO_IAB with actual mappings')
  console.log('3. Map each Mixpeek node_id to the appropriate IAB code')
  console.log('4. Reference: https://iabtechlab.com/standards/content-taxonomy/')
  console.log('\nIf taxonomies already contain IAB codes (✅), no mapping needed!')
  console.log('Just ensure the extraction logic works correctly.\n')
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

