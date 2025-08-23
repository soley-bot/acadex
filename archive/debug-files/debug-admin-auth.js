#!/usr/bin/env node

/**
 * Debug Admin Authentication Issues
 * Tests the auth flow to identify 401 errors
 */

const https = require('https')
const http = require('http')

// Test configuration
const BASE_URL = 'http://localhost:3000'
const TEST_ENDPOINTS = [
  '/api/admin/enrollments',
  '/api/admin/content-review'
]

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add cookie headers if available
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          endpoint,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        })
      })
    })

    req.on('error', (err) => {
      reject({ endpoint, error: err.message })
    })

    req.end()
  })
}

async function runTests() {
  console.log('🔍 Testing Admin API Authentication...\n')

  for (const endpoint of TEST_ENDPOINTS) {
    try {
      console.log(`Testing: ${endpoint}`)
      const result = await testEndpoint(endpoint)
      
      console.log(`  Status: ${result.status} ${result.statusMessage}`)
      if (result.status === 401) {
        console.log(`  ❌ UNAUTHORIZED - This is the issue!`)
        console.log(`  Response:`, result.data)
      } else if (result.status === 200) {
        console.log(`  ✅ SUCCESS`)
      } else {
        console.log(`  ⚠️  Unexpected status`)
        console.log(`  Response:`, result.data)
      }
      console.log('')
    } catch (error) {
      console.log(`  💥 ERROR:`, error)
      console.log('')
    }
  }

  console.log('💡 DIAGNOSIS:')
  console.log('The 401 errors suggest the API routes are requiring authentication')
  console.log('but the browser session cookies are not being properly read.')
  console.log('')
  console.log('NEXT STEPS:')
  console.log('1. Check if admin middleware bypass is working')
  console.log('2. Verify cookie authentication in API routes')
  console.log('3. Test with proper admin login session')
}

runTests().catch(console.error)
