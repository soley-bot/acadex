#!/usr/bin/env node

/**
 * Check Admin Page Content Test
 * Examines what's actually being served on admin routes
 */

const http = require('http')

function checkAdminPage() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/admin',
      method: 'GET'
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log('🔍 Admin Page Analysis')
        console.log('======================')
        console.log(`Status Code: ${res.statusCode}`)
        console.log(`Content-Type: ${res.headers['content-type']}`)
        
        // Check for key content indicators
        const indicators = {
          'Login Form': data.includes('password') && data.includes('email'),
          'Admin Dashboard': data.includes('Admin Dashboard') || data.includes('admin dashboard'),
          'Loading Spinner': data.includes('animate-spin') || data.includes('loading'),
          'Redirect Script': data.includes('window.location') || data.includes('router.push'),
          'AdminRoute Component': data.includes('AdminRoute'),
          'Auth Context': data.includes('useAuth'),
          'Login Redirect': data.includes('/auth/login')
        }
        
        console.log('\n📊 Content Analysis:')
        Object.entries(indicators).forEach(([key, found]) => {
          console.log(`   ${found ? '✅' : '❌'} ${key}: ${found}`)
        })
        
        // Look for specific auth-related text
        if (data.includes('redirecting') || data.includes('Redirecting')) {
          console.log('\n🔄 Page shows redirecting message - good!')
        }
        
        if (data.includes('Loading') || data.includes('loading')) {
          console.log('\n⏳ Page shows loading state - auth check in progress')
        }
        
        // Check for unauthorized access
        if (data.includes('unauthorized') || data.includes('Unauthorized')) {
          console.log('\n🚫 Unauthorized access detected')
        }
        
        console.log('\n📋 Analysis:')
        if (indicators['Loading Spinner'] || indicators['Redirect Script']) {
          console.log('✅ Client-side protection appears to be working')
          console.log('   → AdminRoute component is handling auth redirection')
        } else if (indicators['Login Form']) {
          console.log('✅ Showing login form - user not authenticated')
        } else if (indicators['Admin Dashboard']) {
          console.log('⚠️  Admin content visible - check if user is authenticated')
        } else {
          console.log('ℹ️  Generic page content - need manual verification')
        }
        
        resolve()
      })
    })

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`)
      resolve()
    })

    req.end()
  })
}

checkAdminPage().then(() => {
  console.log('\n🎯 Manual Testing Required:')
  console.log('============================')
  console.log('1. Open browser to http://localhost:3000/admin')
  console.log('2. Check if you\'re redirected to login')
  console.log('3. Log in with arika.krisnadevi@gmail.com')
  console.log('4. Verify you get admin access')
  console.log('5. Try with different email and verify denial')
})
