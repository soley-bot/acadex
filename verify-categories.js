const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFixedCategories() {
  console.log('🔍 Verifying Fixed Categories...\n');

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Categories in database:');
  categories?.forEach(cat => {
    const indicator = cat.name === 'IELTS Preparation' ? '🎯' : '  ';
    console.log(`${indicator} ${cat.name} (${cat.type}) - ${cat.color}`);
  });

  // Check for IELTS specifically
  const ieltsCategory = categories?.find(c => c.name === 'IELTS Preparation');
  if (ieltsCategory) {
    console.log('\n🎉 SUCCESS: "IELTS Preparation" category is now available!');
    console.log(`   - ID: ${ieltsCategory.id}`);
    console.log(`   - Type: ${ieltsCategory.type}`);
    console.log(`   - Color: ${ieltsCategory.color}`);
  } else {
    console.log('\n❌ ISSUE: "IELTS Preparation" category not found');
  }

  console.log(`\n📊 Total categories: ${categories?.length || 0}`);
}

verifyFixedCategories().finally(() => process.exit(0));
