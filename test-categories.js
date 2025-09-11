// Quick test to verify categories table exists
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCategoriesTable() {
  console.log('🔍 Testing categories table...')
  
  try {
    // Test if table exists and is accessible
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Categories table error:', error)
      return
    }
    
    console.log('✅ Categories table exists and is accessible')
    console.log('📊 Sample data:', data)
    
    // Test creating a sample category
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert([{
        name: 'Test Category',
        description: 'A test category',
        color: '#6366f1',
        icon: 'folder',
        type: 'general',
        is_active: true
      }])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Category creation error:', createError)
      return
    }
    
    console.log('✅ Category creation successful:', newCategory)
    
    // Clean up - delete the test category
    await supabase
      .from('categories')
      .delete()
      .eq('id', newCategory.id)
    
    console.log('✅ Test cleanup completed')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testCategoriesTable()
