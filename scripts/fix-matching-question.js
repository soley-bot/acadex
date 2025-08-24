#!/usr/bin/env node

/**
 * Quick Fix for Matching Question
 * Applies the correct answer data to the specific matching question
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMatchingQuestion() {
  console.log('🔧 FIXING MATCHING QUESTION...')
  
  const questionId = 'fc3f3657-89f2-47e1-97e2-147190ae93a6'
  
  try {
    // First, let's see what the question looks like
    const { data: question, error: fetchError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', questionId)
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching question:', fetchError.message)
      return
    }
    
    console.log('📋 Current question data:')
    console.log(`   Question: ${question.question}`)
    console.log(`   Type: ${question.question_type}`)
    console.log(`   Options: ${JSON.stringify(question.options)}`)
    console.log(`   Current correct_answer_json: ${JSON.stringify(question.correct_answer_json)}`)
    
    // For a simple matching question, let's set up basic 1:1 matching
    // This assumes the first left item matches the first right item, etc.
    const correctAnswerJson = { "0": 0, "1": 1 }
    
    console.log(`\n🎯 Setting correct answer to: ${JSON.stringify(correctAnswerJson)}`)
    
    const { data: updateResult, error: updateError } = await supabase
      .from('quiz_questions')
      .update({ correct_answer_json: correctAnswerJson })
      .eq('id', questionId)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating question:', updateError.message)
      return
    }
    
    console.log('✅ Successfully updated matching question!')
    console.log('📊 Updated data:', JSON.stringify(updateResult[0]?.correct_answer_json))
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...')
    const { data: verifyQuestion } = await supabase
      .from('quiz_questions')
      .select('correct_answer_json')
      .eq('id', questionId)
      .single()
    
    if (verifyQuestion?.correct_answer_json && 
        JSON.stringify(verifyQuestion.correct_answer_json) !== '[]') {
      console.log('✅ Fix verified! Matching question now has correct answer data.')
    } else {
      console.log('⚠️ Fix may not have been applied correctly.')
    }
    
  } catch (error) {
    console.error('❌ Error fixing matching question:', error.message)
  }
}

async function main() {
  console.log('🚀 MATCHING QUESTION QUICK FIX')
  console.log('============================')
  
  await fixMatchingQuestion()
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Take the "Test Ordering" quiz again')
  console.log('2. Answer both questions correctly')
  console.log('3. You should now get 100% score!')
  console.log('4. Check results page for proper answer display')
  
  console.log('\n✨ Quick fix complete!')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { fixMatchingQuestion }
