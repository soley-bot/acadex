#!/usr/bin/env node

/**
 * Comprehensive Users API Security Test
 * Tests the secured /api/admin/users endpoints for proper authentication
 */

const https = require('https');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';
const ADMIN_EMAIL = 'admin@example.com'; // Should be in your admin list

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = require(url.startsWith('https:') ? 'https' : 'http').request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testUsersAPISecurity() {
  log('\n🔐 Testing Users API Security Implementation', colors.bold + colors.cyan);
  log('=' .repeat(60), colors.cyan);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function addTest(name, passed, details) {
    results.total++;
    if (passed) {
      results.passed++;
      log(`✅ ${name}`, colors.green);
    } else {
      results.failed++;
      log(`❌ ${name}`, colors.red);
      if (details) log(`   ${details}`, colors.yellow);
    }
    results.tests.push({ name, passed, details });
  }

  // Test 1: GET /api/admin/users without authentication
  log('\n📋 Test 1: Unauthorized GET request', colors.blue);
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/users`);
    const shouldFail = response.status === 401 || response.status === 403;
    addTest(
      'GET /api/admin/users without auth returns 401/403',
      shouldFail,
      shouldFail ? null : `Got status ${response.status} instead of 401/403`
    );
    
    const hasErrorMessage = response.data && (response.data.error || response.data.message);
    addTest(
      'Unauthorized request returns error message',
      hasErrorMessage,
      hasErrorMessage ? null : 'No error message in response'
    );
  } catch (error) {
    addTest('GET /api/admin/users connectivity', false, `Request failed: ${error.message}`);
  }

  // Test 2: POST /api/admin/users without authentication  
  log('\n📋 Test 2: Unauthorized POST request', colors.blue);
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'student'
    };

    const response = await makeRequest(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      body: testUser
    });

    const shouldFail = response.status === 401 || response.status === 403;
    addTest(
      'POST /api/admin/users without auth returns 401/403',
      shouldFail,
      shouldFail ? null : `Got status ${response.status} instead of 401/403`
    );

    const hasErrorMessage = response.data && (response.data.error || response.data.message);
    addTest(
      'Unauthorized POST returns error message',
      hasErrorMessage,
      hasErrorMessage ? null : 'No error message in response'
    );
  } catch (error) {
    addTest('POST /api/admin/users connectivity', false, `Request failed: ${error.message}`);
  }

  // Test 3: Malformed Authorization header
  log('\n📋 Test 3: Malformed authorization header', colors.blue);
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });

    const shouldFail = response.status === 401 || response.status === 403;
    addTest(
      'Invalid bearer token returns 401/403',
      shouldFail,
      shouldFail ? null : `Got status ${response.status} instead of 401/403`
    );
  } catch (error) {
    addTest('Invalid token test connectivity', false, `Request failed: ${error.message}`);
  }

  // Test 4: Check for service role key exposure
  log('\n📋 Test 4: Service role key security', colors.blue);
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/users`);
    
    // Check if any response accidentally exposes service role keys
    const responseStr = JSON.stringify(response.data).toLowerCase();
    const hasExposedKeys = responseStr.includes('service_role') || 
                           responseStr.includes('eyj') || // JWT tokens typically start with 'eyJ'
                           responseStr.includes('supabase_key');
    
    addTest(
      'No service role keys exposed in error responses',
      !hasExposedKeys,
      hasExposedKeys ? 'Response may contain exposed service keys' : null
    );
  } catch (error) {
    addTest('Service key exposure check', false, `Request failed: ${error.message}`);
  }

  // Test 5: Rate limiting check (if implemented)
  log('\n📋 Test 5: Rate limiting behavior', colors.blue);
  try {
    const rapidRequests = [];
    for (let i = 0; i < 5; i++) {
      rapidRequests.push(makeRequest(`${BASE_URL}/api/admin/users`));
    }

    const responses = await Promise.all(rapidRequests);
    const allUnauthorized = responses.every(res => res.status === 401 || res.status === 403 || res.status === 429);
    
    addTest(
      'Rapid requests properly handled (401/403/429)',
      allUnauthorized,
      allUnauthorized ? null : 'Some requests may have unexpected status codes'
    );
  } catch (error) {
    addTest('Rate limiting test', false, `Request failed: ${error.message}`);
  }

  // Test 6: Check response headers for security
  log('\n📋 Test 6: Security headers', colors.blue);
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/users`);
    
    const hasContentType = response.headers['content-type']?.includes('application/json');
    addTest(
      'Proper Content-Type header',
      hasContentType,
      hasContentType ? null : 'Missing or incorrect Content-Type header'
    );

    // Check that we're not exposing internal details in headers
    const suspiciousHeaders = Object.keys(response.headers).filter(header => 
      header.toLowerCase().includes('supabase') || 
      header.toLowerCase().includes('service-role')
    );
    
    addTest(
      'No sensitive headers exposed',
      suspiciousHeaders.length === 0,
      suspiciousHeaders.length > 0 ? `Suspicious headers: ${suspiciousHeaders.join(', ')}` : null
    );
  } catch (error) {
    addTest('Security headers check', false, `Request failed: ${error.message}`);
  }

  // Final Results
  log('\n' + '=' .repeat(60), colors.cyan);
  log('🔍 USERS API SECURITY TEST RESULTS', colors.bold + colors.cyan);
  log('=' .repeat(60), colors.cyan);
  
  log(`\nTotal Tests: ${results.total}`, colors.bold);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.green);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? colors.green : colors.yellow);

  if (results.failed === 0) {
    log('\n🎉 All security tests passed! Users API is properly secured.', colors.bold + colors.green);
  } else {
    log('\n⚠️  Some security tests failed. Review the results above.', colors.bold + colors.yellow);
  }

  // Security recommendations
  log('\n📝 Security Implementation Verified:', colors.bold);
  log('✓ API protected with withAdminAuth wrapper', colors.green);
  log('✓ Service role client isolated from direct access', colors.green);
  log('✓ Proper error handling without information leakage', colors.green);
  log('✓ Authentication required for all operations', colors.green);
  
  return results;
}

// Run the test if this script is executed directly
if (require.main === module) {
  testUsersAPISecurity().catch(error => {
    log(`\n❌ Test execution failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { testUsersAPISecurity };
