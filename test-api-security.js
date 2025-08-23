#!/usr/bin/env node

/**
 * Comprehensive API Security Test
 * Tests the newly secured admin API endpoints
 */

const http = require('http')

console.log('🔒 API Security Test - Categories Endpoint')
console.log('==========================================\n')

// Test function to make API requests
function testAPIRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SecurityTest/1.0',
        ...headers
      }
    }

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    const req = http.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          })
        }
      })
    })

    req.on('error', (err) => {
      console.log(`❌ Request error: ${err.message}`)
      resolve({ status: 0, error: err.message })
    })

    req.setTimeout(5000, () => {
      console.log(`⏰ Request timeout`)
      req.destroy()
      resolve({ status: 0, error: 'timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function runAPISecurityTests() {
  console.log('🧪 Testing API Authentication Requirements...\n')
  
  const tests = [
    {
      name: 'GET Categories (No Auth)',
      method: 'GET',
      path: '/api/admin/categories',
      expectStatus: 401,
      expectError: 'AUTH_REQUIRED'
    },
    {
      name: 'POST Categories (No Auth)',
      method: 'POST',
      path: '/api/admin/categories',
      data: { name: 'Test Category', type: 'course' },
      expectStatus: 401,
      expectError: 'AUTH_REQUIRED'
    },
    {
      name: 'PUT Categories (No Auth)',
      method: 'PUT',
      path: '/api/admin/categories',
      data: { id: '123', name: 'Updated Category' },
      expectStatus: 401,
      expectError: 'AUTH_REQUIRED'
    },
    {
      name: 'DELETE Categories (No Auth)',
      method: 'DELETE',
      path: '/api/admin/categories?id=123',
      expectStatus: 401,
      expectError: 'AUTH_REQUIRED'
    }
  ]
  
  let passedTests = 0
  
  for (const test of tests) {
    console.log(`📍 Testing: ${test.name}`)
    
    const result = await testAPIRequest(test.method, test.path, test.data)
    
    const statusMatch = result.status === test.expectStatus
    const hasAuthError = result.data && (
      result.data.code === test.expectError || 
      result.data.error?.includes('Authentication required') ||
      result.data.error?.includes('Admin access required')
    )
    
    if (statusMatch && (hasAuthError || test.expectStatus !== 401)) {
      console.log(`   ✅ PASS - Status: ${result.status}`)
      if (result.data && result.data.error) {
        console.log(`   🔒 Auth Error: ${result.data.error}`)
      }
      passedTests++
    } else {
      console.log(`   ❌ FAIL - Expected status ${test.expectStatus}, got ${result.status}`)
      if (result.data) {
        console.log(`   📄 Response: ${JSON.stringify(result.data)}`)
      }
    }
    console.log('')
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('📊 TEST RESULTS')
  console.log('================')
  console.log(`✅ Passed: ${passedTests}/${tests.length}`)
  console.log(`${passedTests === tests.length ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests failed'}`)
  
  console.log('\n🔒 SECURITY STATUS:')
  console.log('===================')
  
  if (passedTests === tests.length) {
    console.log('✅ Categories API is properly secured')
    console.log('✅ All endpoints require authentication')
    console.log('✅ Unauthorized requests are rejected')
    console.log('✅ Proper HTTP status codes returned')
  } else {
    console.log('❌ Security vulnerabilities detected!')
    console.log('❌ Some endpoints may be accessible without auth')
  }
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('==============')
  console.log('1. ✅ Categories API secured')
  console.log('2. 🔄 Apply same security to other admin APIs')
  console.log('3. 🧪 Test with valid admin credentials')
  console.log('4. 📊 Monitor audit logs for security events')
  
  console.log('\n🚀 To test with valid credentials:')
  console.log('   → Log into admin panel with arika.krisnadevi@gmail.com')
  console.log('   → Use browser dev tools to get auth cookies')
  console.log('   → Test API calls with proper authentication')
}

runAPISecurityTests().catch(console.error)
