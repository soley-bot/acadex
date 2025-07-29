// Database connection and course operations test
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables manually
let supabaseUrl, supabaseAnonKey
try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const envLines = envContent.split('\n')
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1]
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1]
    }
  }
} catch (error) {
  console.error('❌ Could not read .env.local file')
  process.exit(1)
}

console.log('🔗 Testing Database Connection...')
console.log('URL (first 30 chars):', supabaseUrl?.substring(0, 30) + '...')
console.log('Key (first 30 chars):', supabaseAnonKey?.substring(0, 30) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  try {
    console.log('\n1. Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('courses')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return
    }
    console.log('✅ Database connection successful')

    console.log('\n2. Testing course table structure...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1)
    
    if (coursesError) {
      console.error('❌ Course query failed:', coursesError.message)
      return
    }
    console.log('✅ Course table accessible')
    console.log('Sample course fields:', courses[0] ? Object.keys(courses[0]) : 'No courses found')

    console.log('\n3. Testing course creation with minimal data...')
    
    // First, let's check if there are any users to get a real UUID
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1)
    
    let testInstructorId = '550e8400-e29b-41d4-a716-446655440001' // Default UUID
    let testInstructorName = 'Test Instructor'
    
    if (!usersError && users && users.length > 0) {
      testInstructorId = users[0].id
      testInstructorName = users[0].name || 'Test Instructor'
      console.log('✅ Found existing user:', testInstructorName)
    } else {
      console.log('⚠️ No users found, using default UUID')
    }

    const testCourse = {
      title: 'Database Test Course',
      description: 'Test course for debugging',
      instructor_id: testInstructorId,
      instructor_name: testInstructorName,
      category: 'english',
      level: 'beginner',
      price: 0,
      duration: '1 hour',
      is_published: false
    }

    const { data: createData, error: createError } = await supabase
      .from('courses')
      .insert(testCourse)
      .select()
      .single()

    if (createError) {
      console.error('❌ Course creation failed:', createError.message)
      console.error('Error details:', createError)
      
      // Check if it's an RLS issue
      if (createError.message.includes('RLS') || createError.message.includes('policy')) {
        console.log('\n🛡️ This appears to be a Row Level Security (RLS) issue')
        console.log('Solutions:')
        console.log('1. Disable RLS temporarily for testing')
        console.log('2. Create proper RLS policies for course creation')
        console.log('3. Use service role key instead of anon key for admin operations')
      }
    } else {
      console.log('✅ Course creation successful!')
      console.log('Created course ID:', createData.id)
      
      // Clean up test course
      await supabase.from('courses').delete().eq('id', createData.id)
      console.log('✅ Test course cleaned up')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testDatabase()
