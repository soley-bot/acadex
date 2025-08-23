// Debug course creation API
const testCourseCreation = async () => {
  console.log('🧪 Testing course creation API directly...')
  
  try {
    // Test course data
    const testCourse = {
      title: 'Debug Test Course',
      description: 'This is a test course to debug the creation issue',
      instructor_name: 'Test Instructor',
      price: 0,
      category: 'Programming',
      level: 'beginner',
      duration: '1 hour',
      image_url: '',
      is_published: false,
      learning_objectives: ['Test objective'],
    }
    
    console.log('📝 Test course data:', testCourse)
    
    // Get auth token
    const authToken = localStorage.getItem('sb-qeoeimktkpdlbblvwhri-auth-token')
    console.log('🔑 Auth token exists:', !!authToken)
    
    if (!authToken) {
      console.error('❌ No auth token found - please log in')
      return
    }
    
    // Test course creation API
    console.log('🚀 Calling course creation API...')
    const startTime = Date.now()
    
    const response = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(authToken).access_token}`
      },
      body: JSON.stringify({
        action: 'create',
        courseData: testCourse
      })
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`⏱️ API call took ${duration}ms`)
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', [...response.headers.entries()])
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API call failed:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('✅ API call successful:', result)
    
    if (result.success) {
      console.log('🎉 Course created successfully:', result.data)
      // Clean up test course
      if (result.data?.id) {
        console.log('🧹 Cleaning up test course...')
        await fetch(`/api/admin/courses`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(authToken).access_token}`
          },
          body: JSON.stringify({ id: result.data.id })
        })
        console.log('🧹 Test course cleaned up')
      }
    } else {
      console.error('❌ Course creation failed:', result.error)
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Auto-run test in browser console
if (typeof window !== 'undefined') {
  console.log('🎯 Course creation debug test loaded. Run testCourseCreation() to test.')
  window.testCourseCreation = testCourseCreation
}

export { testCourseCreation }
