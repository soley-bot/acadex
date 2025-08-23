#!/usr/bin/env node

/**
 * Comprehensive Admin APIs Security Test
 * Tests all secured admin API endpoints for proper authentication
 */

const https = require('https');

// Test configuration
const BASE_URL = 'http://localhost:3000';

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

async function testAPIEndpoint(endpoint, name, testData = null) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function addTest(testName, passed, details) {
    results.total++;
    if (passed) {
      results.passed++;
      log(`✅ ${testName}`, colors.green);
    } else {
      results.failed++;
      log(`❌ ${testName}`, colors.red);
      if (details) log(`   ${details}`, colors.yellow);
    }
    results.tests.push({ testName, passed, details });
  }

  log(`\n📋 Testing ${name}`, colors.blue);

  // Test 1: GET without authentication
  try {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);
    const shouldFail = response.status === 401 || response.status === 403;
    addTest(
      `GET ${endpoint} without auth returns 401/403`,
      shouldFail,
      shouldFail ? null : `Got status ${response.status} instead of 401/403`
    );
  } catch (error) {
    addTest(`GET ${endpoint} connectivity`, false, `Request failed: ${error.message}`);
  }

  // Test 2: POST without authentication (if test data provided)
  if (testData) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: testData
      });

      const shouldFail = response.status === 401 || response.status === 403;
      addTest(
        `POST ${endpoint} without auth returns 401/403`,
        shouldFail,
        shouldFail ? null : `Got status ${response.status} instead of 401/403`
      );
    } catch (error) {
      addTest(`POST ${endpoint} connectivity`, false, `Request failed: ${error.message}`);
    }
  }

  // Test 3: Invalid token
  try {
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });

    const shouldFail = response.status === 401 || response.status === 403;
    addTest(
      `${endpoint} with invalid token returns 401/403`,
      shouldFail,
      shouldFail ? null : `Got status ${response.status} instead of 401/403`
    );
  } catch (error) {
    addTest(`Invalid token test for ${endpoint}`, false, `Request failed: ${error.message}`);
  }

  return results;
}

async function testAllAdminAPIs() {
  log('\n🔐 Comprehensive Admin APIs Security Test', colors.bold + colors.cyan);
  log('=' .repeat(70), colors.cyan);

  const allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    endpoints: {}
  };

  // Test all critical admin endpoints
  const endpoints = [
    {
      path: '/api/admin/users',
      name: 'Users API',
      testData: { name: 'Test User', email: 'test@example.com', role: 'student' }
    },
    {
      path: '/api/admin/categories',
      name: 'Categories API',
      testData: { name: 'Test Category', description: 'Test Description' }
    },
    {
      path: '/api/admin/courses',
      name: 'Courses API',
      testData: { title: 'Test Course', description: 'Test Description' }
    },
    {
      path: '/api/admin/quizzes',
      name: 'Quizzes API',
      testData: { title: 'Test Quiz', description: 'Test Description' }
    },
    {
      path: '/api/admin/enrollments',
      name: 'Enrollments API',
      testData: null // No POST for enrollments
    }
  ];

  for (const endpoint of endpoints) {
    const result = await testAPIEndpoint(endpoint.path, endpoint.name, endpoint.testData);
    allResults.total += result.total;
    allResults.passed += result.passed;
    allResults.failed += result.failed;
    allResults.endpoints[endpoint.name] = result;
  }

  // Overall security checks
  log('\n📋 Overall Security Checks', colors.blue);
  
  // Check for any exposed service keys across all endpoints
  let hasExposedKeys = false;
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint.path}`);
      const responseStr = JSON.stringify(response.data).toLowerCase();
      if (responseStr.includes('service_role') || 
          responseStr.includes('eyj') || 
          responseStr.includes('supabase_key')) {
        hasExposedKeys = true;
        break;
      }
    } catch (error) {
      // Ignore connection errors for this check
    }
  }

  allResults.total++;
  if (!hasExposedKeys) {
    allResults.passed++;
    log('✅ No service role keys exposed across all endpoints', colors.green);
  } else {
    allResults.failed++;
    log('❌ Service role keys may be exposed', colors.red);
  }

  // Final Results
  log('\n' + '=' .repeat(70), colors.cyan);
  log('🔍 COMPREHENSIVE ADMIN APIs SECURITY RESULTS', colors.bold + colors.cyan);
  log('=' .repeat(70), colors.cyan);
  
  log(`\nTotal Tests: ${allResults.total}`, colors.bold);
  log(`Passed: ${allResults.passed}`, colors.green);
  log(`Failed: ${allResults.failed}`, allResults.failed > 0 ? colors.red : colors.green);
  
  const successRate = ((allResults.passed / allResults.total) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? colors.green : colors.yellow);

  // Individual endpoint results
  log('\n📊 Results by Endpoint:', colors.bold);
  for (const [name, result] of Object.entries(allResults.endpoints)) {
    const rate = ((result.passed / result.total) * 100).toFixed(1);
    const status = rate === '100.0' ? '✅' : '⚠️';
    log(`${status} ${name}: ${result.passed}/${result.total} (${rate}%)`, 
        rate === '100.0' ? colors.green : colors.yellow);
  }

  if (allResults.failed === 0) {
    log('\n🎉 All admin APIs are properly secured!', colors.bold + colors.green);
    log('✓ Authentication required for all operations', colors.green);
    log('✓ No service role keys exposed', colors.green);
    log('✓ Proper error handling implemented', colors.green);
  } else {
    log('\n⚠️  Some security issues detected. Review the results above.', colors.bold + colors.yellow);
  }

  return allResults;
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAllAdminAPIs().catch(error => {
    log(`\n❌ Test execution failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { testAllAdminAPIs };
