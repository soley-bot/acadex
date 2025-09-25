// Quiz Builder Save Debugging Script
// Run this in browser console when having save issues

console.log('🔧 Quiz Builder Save Debugger Started');

// 1. Check if quiz builder state exists
const checkQuizBuilderState = () => {
  console.log('📊 Checking Quiz Builder State:');
  
  // Look for quiz builder elements
  const saveButton = document.querySelector('[data-testid="save-quiz"], button:contains("Save")');
  const quizModal = document.querySelector('[role="dialog"], .quiz-builder');
  
  console.log('Save Button Found:', !!saveButton);
  console.log('Quiz Modal Found:', !!quizModal);
  
  return { saveButton, quizModal };
};

// 2. Monitor network requests
const monitorNetworkRequests = () => {
  console.log('🌐 Monitoring Network Requests...');
  
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    
    if (url.includes('/api/admin/quiz')) {
      console.log('📡 Quiz API Request:', {
        url,
        method: options?.method || 'GET',
        body: options?.body ? JSON.parse(options.body) : null
      });
    }
    
    const response = await originalFetch(...args);
    
    if (url.includes('/api/admin/quiz')) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      console.log('📥 Quiz API Response:', {
        url,
        status: response.status,
        data
      });
    }
    
    return response;
  };
};

// 3. Check authentication
const checkAuthentication = async () => {
  console.log('🔐 Checking Authentication...');
  
  try {
    const response = await fetch('/api/admin/auth-diagnostic', {
      method: 'GET',
      credentials: 'include'
    });
    const authData = await response.json();
    
    console.log('Auth Status:', {
      authenticated: response.ok,
      user: authData.user?.email || 'Not found',
      role: authData.user?.role || 'Unknown'
    });
    
    return authData;
  } catch (error) {
    console.error('❌ Auth Check Failed:', error);
    return null;
  }
};

// 4. Test save functionality
const testSaveFunction = () => {
  console.log('💾 Testing Save Function...');
  
  // Try to find and trigger save
  const { saveButton } = checkQuizBuilderState();
  
  if (saveButton) {
    console.log('🎯 Save button found, clicking...');
    saveButton.click();
  } else {
    console.log('⚠️ Save button not found. Try:');
    console.log('1. Make sure quiz builder modal is open');
    console.log('2. Navigate to the preview step');
    console.log('3. Ensure you have a quiz title and questions');
  }
};

// 5. Check for common issues
const diagnoseCommonIssues = () => {
  console.log('🔍 Diagnosing Common Issues...');
  
  // Check localStorage for saved data
  const quizData = localStorage.getItem('quiz-builder-draft');
  console.log('Draft Data in Storage:', !!quizData);
  
  // Check for React dev tools
  const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log('React DevTools Available:', !!reactDevTools);
  
  // Check for console errors
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => {
    errors.push(args);
    originalError(...args);
  };
  
  setTimeout(() => {
    console.log('Recent Errors:', errors.length, errors);
  }, 1000);
};

// 6. Performance analysis
const analyzePerformance = () => {
  console.log('⚡ Analyzing Performance...');
  
  const startTime = Date.now();
  let requestCount = 0;
  let totalPayloadSize = 0;
  
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    
    if (url.includes('/api/admin/quiz')) {
      requestCount++;
      const payloadSize = options?.body ? new Blob([options.body]).size : 0;
      totalPayloadSize += payloadSize;
      
      console.log(`📊 Request #${requestCount}: ${url} (${payloadSize} bytes)`);
    }
    
    return originalFetch(...args);
  };
  
  // Report after 10 seconds
  setTimeout(() => {
    const duration = Date.now() - startTime;
    console.log('📈 Performance Report:');
    console.log(`Requests: ${requestCount}`);
    console.log(`Total Payload: ${(totalPayloadSize / 1024).toFixed(2)} KB`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Avg per request: ${requestCount ? (duration / requestCount).toFixed(0) : 0}ms`);
  }, 10000);
};

// 7. Main debugging function
const debugQuizSave = async () => {
  console.log('🚀 Starting Complete Quiz Save Debug...');
  
  // Step 1: Check authentication
  await checkAuthentication();
  
  // Step 2: Monitor network
  monitorNetworkRequests();
  
  // Step 3: Check for issues
  diagnoseCommonIssues();
  
  // Step 4: Start performance monitoring
  analyzePerformance();
  
  // Step 5: Check current state
  checkQuizBuilderState();
  
  console.log('✅ Debug setup complete. Now try saving your quiz.');
  console.log('💡 Use testSaveFunction() to simulate a save click.');
  
  // Make functions available globally
  window.testSaveFunction = testSaveFunction;
  window.checkQuizBuilderState = checkQuizBuilderState;
  window.checkAuthentication = checkAuthentication;
};

// Auto-run the debugger
debugQuizSave();

// Export functions for manual testing
window.QuizSaveDebugger = {
  debugQuizSave,
  testSaveFunction,
  checkQuizBuilderState,
  checkAuthentication,
  diagnoseCommonIssues,
  analyzePerformance
};

console.log('📋 Available debugging functions:');
console.log('- QuizSaveDebugger.testSaveFunction()');
console.log('- QuizSaveDebugger.checkAuthentication()');
console.log('- QuizSaveDebugger.checkQuizBuilderState()');