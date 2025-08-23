#!/usr/bin/env node

/**
 * Live Application Security Test
 * Tests the actual running application security
 */

const http = require('http')

console.log('🚀 Live Application Security Test')
console.log('==================================\n')

// Test function to make HTTP requests
function testRequest(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'SecurityTest/1.0'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        const isRedirect = res.statusCode >= 300 && res.statusCode < 400
        const redirectTo = res.headers.location || 'none'
        
        console.log(`📍 ${description}`)
        console.log(`   Path: ${path}`)
        console.log(`   Status: ${res.statusCode}`)
        
        if (isRedirect) {
          console.log(`   ✅ Redirected to: ${redirectTo}`)
          console.log(`   🔒 Admin protection working!`)
        } else if (res.statusCode === 200) {
          // Check if page contains admin content or login form
          const hasAdminContent = data.includes('Admin Dashboard') || data.includes('admin')
          const hasLoginForm = data.includes('login') || data.includes('sign in')
          
          if (hasLoginForm) {
            console.log(`   ✅ Shows login form - protection working!`)
          } else if (hasAdminContent) {
            console.log(`   ⚠️  Shows admin content - check authentication!`)
          } else {
            console.log(`   ✅ Public content shown`)
          }
        }
        console.log('')
        
        resolve({
          status: res.statusCode,
          redirect: redirectTo,
          hasAdmin: data.includes('Admin Dashboard'),
          hasLogin: data.includes('login')
        })
      })
    })

    req.on('error', (err) => {
      console.log(`❌ Error testing ${path}: ${err.message}\n`)
      resolve(null)
    })

    req.setTimeout(5000, () => {
      console.log(`⏰ Timeout testing ${path}\n`)
      req.destroy()
      resolve(null)
    })

    req.end()
  })
}

// Run tests
async function runSecurityTests() {
  console.log('🧪 Testing application routes without authentication...\n')
  
  const tests = [
    { path: '/', description: 'Home page (should be public)' },
    { path: '/admin', description: 'Admin panel (should redirect to login)' },
    { path: '/admin/courses', description: 'Admin courses (should redirect to login)' },
    { path: '/admin/users', description: 'Admin users (should redirect to login)' },
    { path: '/dashboard', description: 'Student dashboard (should redirect to login)' },
    { path: '/auth/login', description: 'Login page (should be accessible)' },
    { path: '/courses', description: 'Public courses (should be accessible)' }
  ]
  
  for (const test of tests) {
    await testRequest(test.path, test.description)
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('🔒 SECURITY TEST SUMMARY:')
  console.log('=========================')
  console.log('✅ Admin routes should redirect to login when not authenticated')
  console.log('✅ Public routes should be accessible')
  console.log('✅ Protected routes should require authentication')
  console.log('\n🎯 Next Step: Test with actual login credentials in browser!')
  console.log('   → Visit http://localhost:3000/admin')
  console.log('   → Try logging in with arika.krisnadevi@gmail.com')
  console.log('   → Should get admin access')
  console.log('   → Try with any other email')
  console.log('   → Should be denied admin access')
}

runSecurityTests().catch(console.error)
