// =====================================================
// CLIENT-SIDE ADMIN ACCESS DIAGNOSTIC
// =====================================================
// Copy and paste this into your browser console on the admin page
// to check your authentication status
// =====================================================

console.log('🔍 Starting Admin Access Diagnostic...\n');

// 1. Check if we're on the right page
console.log('📍 Current URL:', window.location.href);

// 2. Check local storage for auth tokens
console.log('\n🔑 Authentication Status:');
const authKeys = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || key.includes('auth')
);
console.log('Auth-related localStorage keys:', authKeys);

// 3. Check for auth cookies
console.log('\n🍪 Cookies:');
console.log('All cookies:', document.cookie);

// 4. Check network requests
console.log('\n🌐 Making test request to admin API...');

// Get access token from localStorage
const getAccessToken = () => {
  try {
    const authData = localStorage.getItem('sb-qeoeimktkpdlbblvwhri-auth-token');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.access_token;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
  return null;
};

const token = getAccessToken();
console.log('Access token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');

const headers = {
  'Content-Type': 'application/json',
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

fetch('/api/admin/courses?page=1&limit=1', {
  method: 'GET',
  headers: headers,
  credentials: 'include' // Include cookies
})
.then(response => {
  console.log('API Response Status:', response.status);
  console.log('API Response Headers:', [...response.headers.entries()]);
  return response.json();
})
.then(data => {
  console.log('API Response Data:', data);
  
  if (data.error) {
    console.log('\n❌ Error Details:', data.error);
    
    if (data.error.includes('Authentication') || data.error.includes('log in')) {
      console.log('\n🚨 DIAGNOSIS: Not authenticated');
      console.log('💡 SOLUTION: Try logging out and logging back in');
    } else if (data.error.includes('Admin') || data.error.includes('privileges')) {
      console.log('\n🚨 DIAGNOSIS: Not admin user');
      console.log('💡 SOLUTION: Your user needs admin role in database');
    } else {
      console.log('\n🚨 DIAGNOSIS: Other authentication issue');
      console.log('💡 SOLUTION: Check database and RLS policies');
    }
  } else {
    console.log('\n✅ API call successful! Admin access working.');
  }
})
.catch(error => {
  console.log('\n❌ Network Error:', error);
  console.log('💡 This might be a client-side issue or server error');
});

// 5. Check if Supabase client is available
setTimeout(() => {
  console.log('\n🔧 Checking Supabase client...');
  
  // Try to access the Supabase client
  if (window.supabase || window.__supabase) {
    console.log('✅ Supabase client found');
  } else {
    console.log('❌ Supabase client not found in window object');
  }
  
  // Check for React app context
  const reactRoot = document.getElementById('__next') || document.getElementById('root');
  if (reactRoot) {
    console.log('✅ React app root found');
  } else {
    console.log('❌ React app root not found');
  }
  
  console.log('\n📋 DIAGNOSTIC COMPLETE');
  console.log('Next steps:');
  console.log('1. Run the database diagnostic script in Supabase SQL Editor');
  console.log('2. Check if your user has admin role in the users table');
  console.log('3. Verify you are logged in with the correct account');
  console.log('4. Try logging out and back in if authentication seems stale');
}, 2000);

// Export functions for manual testing
window.adminDiagnostic = {
  testAPI: () => {
    const getAccessToken = () => {
      try {
        const authData = localStorage.getItem('sb-qeoeimktkpdlbblvwhri-auth-token');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.access_token;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
      return null;
    };

    const token = getAccessToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/courses?page=1&limit=1', {
      headers: headers,
      credentials: 'include'
    }).then(r => r.json()).then(console.log);
  },
  
  checkAuth: () => {
    console.log('Auth localStorage keys:', 
      Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
    );
  },
  
  clearAuth: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared auth data - refresh page and log in again');
  }
};

console.log('\n🛠️ Additional tools available:');
console.log('adminDiagnostic.testAPI() - Test API call');
console.log('adminDiagnostic.checkAuth() - Check auth status');
console.log('adminDiagnostic.clearAuth() - Clear auth and force re-login');
