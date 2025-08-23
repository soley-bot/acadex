// Test script for the admin quiz API
// This tests the authenticated API endpoint we just created

async function testQuizAPI() {
  try {
    console.log('Testing Quiz API...')
    
    // Get token from localStorage (you'll need to be logged in)
    const token = localStorage.getItem('supabase.auth.token')
    if (!token) {
      console.error('No auth token found. Please log in first.')
      return
    }
    
    let parsedToken
    try {
      parsedToken = JSON.parse(token)
    } catch (e) {
      console.error('Could not parse auth token')
      return
    }
    
    const accessToken = parsedToken.access_token
    if (!accessToken) {
      console.error('No access token found in stored data')
      return
    }
    
    console.log('Using token:', accessToken.substring(0, 20) + '...')
    
    // Test the quiz API
    const response = await fetch('/api/admin/quizzes?limit=5', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success! Quiz API Response:', data)
      console.log(`Found ${data.quizzes?.length || 0} quizzes`)
    } else {
      const errorData = await response.text()
      console.error('Quiz API Error:', response.status, errorData)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Also test the auth-api helper
async function testQuizAPIHelper() {
  try {
    console.log('Testing Quiz API Helper...')
    
    // Import the auth-api helper
    const { quizAPI } = await import('/src/lib/auth-api.js')
    
    const response = await quizAPI.getQuizzes({ limit: 5 })
    console.log('Auth API Helper Response:', response)
    
  } catch (error) {
    console.error('Helper test failed:', error)
  }
}

console.log('Quiz API Test Script Loaded!')
console.log('Run testQuizAPI() to test direct API call')
console.log('Run testQuizAPIHelper() to test auth-api helper')

// Make functions available in global scope
window.testQuizAPI = testQuizAPI
window.testQuizAPIHelper = testQuizAPIHelper
