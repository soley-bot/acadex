/**
 * AUTHENTICATION DEBUG SCRIPT
 * Test your current admin authentication flow
 * 
 * Run this in your browser console while logged in as admin:
 * 1. Go to /admin page and make sure you're logged in
 * 2. Open browser dev tools
 * 3. Go to Console tab
 * 4. Paste and run this script
 */

// Test 1: Check if you're logged in and get user info
async function testAuthState() {
  console.log('🔍 Testing Authentication State...')
  
  try {
    const response = await fetch('/api/debug/auth-state', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Auth State Response:', {
      status: response.status,
      data: data
    })
    
    if (response.status === 404) {
      console.log('❌ Debug API was removed - this is expected after cleanup')
      return null
    }
    
    return data
  } catch (error) {
    console.error('Auth state check failed:', error)
    return null
  }
}

// Test 2: Check cookies and local storage
function testAuthStorage() {
  console.log('🔍 Testing Auth Storage...')
  
  // Check cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})
  
  console.log('Cookies:', Object.keys(cookies).filter(key => 
    key.includes('supabase') || key.includes('auth') || key.includes('session')
  ))
  
  // Check localStorage
  const authKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
      authKeys.push(key)
    }
  }
  
  console.log('LocalStorage Auth Keys:', authKeys)
  
  return { cookies, authKeys }
}

// Test 3: Try to access enrollments API directly
async function testEnrollmentsAPI() {
  console.log('🔍 Testing Enrollments API...')
  
  try {
    const response = await fetch('/api/admin/enrollments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Enrollments API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return { status: response.status, data }
  } catch (error) {
    console.error('Enrollments API test failed:', error)
    return { status: 'ERROR', error: error.message }
  }
}

// Test 4: Try to access content-review API directly
async function testContentReviewAPI() {
  console.log('🔍 Testing Content Review API...')
  
  try {
    const response = await fetch('/api/admin/content-review', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Content Review API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return { status: response.status, data }
  } catch (error) {
    console.error('Content Review API test failed:', error)
    return { status: 'ERROR', error: error.message }
  }
}

// Test 5: Check network tab for additional clues
function checkNetworkRequests() {
  console.log('🔍 To check network requests:')
  console.log('1. Open Network tab in DevTools')
  console.log('2. Try to access the admin pages that show 401')
  console.log('3. Look for failed requests (red status codes)')
  console.log('4. Check the request headers - especially Authorization and Cookie headers')
  console.log('5. Check the response for detailed error messages')
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Admin Authentication Diagnostics...')
  console.log('================================================')
  
  // Test auth storage
  const storage = testAuthStorage()
  
  // Test auth state
  const authState = await testAuthState()
  
  // Test APIs
  const enrollments = await testEnrollmentsAPI()
  const contentReview = await testContentReviewAPI()
  
  console.log('================================================')
  console.log('📊 DIAGNOSTIC SUMMARY:')
  console.log('================================================')
  
  console.log('Auth Storage:', storage.authKeys.length > 0 ? '✅ Found' : '❌ Missing')
  console.log('Auth State:', authState ? '✅ Working' : '❓ Unknown')
  console.log('Enrollments API:', enrollments.status === 200 ? '✅ Working' : `❌ ${enrollments.status}`)
  console.log('Content Review API:', contentReview.status === 200 ? '✅ Working' : `❌ ${contentReview.status}`)
  
  if (enrollments.status === 401 || contentReview.status === 401) {
    console.log('')
    console.log('🔧 LIKELY ISSUES:')
    console.log('1. User role not set to "admin" in database')
    console.log('2. RLS policies blocking service_role access')
    console.log('3. Missing environment variables')
    console.log('4. Auth session expired or corrupted')
    console.log('')
    console.log('💡 NEXT STEPS:')
    console.log('1. Run the SQL diagnostic queries in Supabase')
    console.log('2. Check your environment variables')
    console.log('3. Try logging out and back in')
    console.log('4. Verify your email is set as admin in the database')
  }
  
  checkNetworkRequests()
}

// Auto-run the tests
runAllTests();
