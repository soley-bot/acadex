// Test the API route directly
const testAPI = async () => {
  try {
    console.log('🧪 Testing API route...')
    
    const testCourse = {
      title: 'API Test Course',
      description: 'Testing course creation via API',
      category: 'english',
      level: 'beginner',
      duration: '1 hour',
      price: 0,
      is_published: false,
      instructor_id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID format
      instructor_name: 'Test Instructor'
    }

    const response = await fetch('http://localhost:3000/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseData: testCourse,
        action: 'create'
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API route working!', result.data.id)
    } else {
      console.log('❌ API route failed:', result.error)
    }

  } catch (error) {
    console.log('❌ API test error:', error.message)
  }
}

testAPI()
