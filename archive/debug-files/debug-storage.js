// Debug script to test Supabase Storage configuration
const { createClient } = require('@supabase/supabase-js')

// Load environment variables manually
const fs = require('fs')
const path = require('path')

let supabaseUrl, supabaseKey

try {
  const envPath = path.join(__dirname, '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const lines = envContent.split('\n')
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim()
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim()
    }
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error.message)
  process.exit(1)
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

console.log('📡 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
console.log('🔑 Supabase Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorageBuckets() {
  console.log('\n🔍 Testing Supabase Storage Configuration...\n')
  
  const buckets = ['course-images', 'quiz-images', 'user-avatars', 'lesson-resources']
  
  for (const bucket of buckets) {
    console.log(`📦 Testing bucket: ${bucket}`)
    
    try {
      // Test bucket existence and list files
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1 })
      
      if (listError) {
        console.log(`❌ Bucket "${bucket}" error:`, listError.message)
      } else {
        console.log(`✅ Bucket "${bucket}" is accessible (${files?.length || 0} files found)`)
      }
      
    } catch (error) {
      console.log(`💥 Unexpected error testing bucket "${bucket}":`, error.message)
    }
    
    console.log('')
  }
  
  console.log('🏁 Storage test completed')
}

// Test image upload
async function testImageUpload() {
  console.log('\n🧪 Testing image upload simulation...')
  
  // Create a fake image file for testing
  const fakeImageData = Buffer.from('fake-image-data')
  
  try {
    const { data, error } = await supabase.storage
      .from('course-images')
      .upload('test/debug-test.txt', fakeImageData, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.log('❌ Test upload failed:', error.message)
    } else {
      console.log('✅ Test upload successful:', data.path)
      
      // Clean up test file
      await supabase.storage
        .from('course-images')
        .remove(['test/debug-test.txt'])
      console.log('🧹 Cleaned up test file')
    }
  } catch (error) {
    console.log('💥 Test upload error:', error.message)
  }
}

async function main() {
  await testStorageBuckets()
  await testImageUpload()
}

main().catch(console.error)
