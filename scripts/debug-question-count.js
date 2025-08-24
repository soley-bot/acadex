/**
 * Debug Script: Question Count Mismatch
 * 
 * This script helps identify why quiz question counts are incorrect
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugQuestionCounts() {
  console.log('🔍 Debugging Question Count Issues...\n')

  try {
    // Get all quizzes with their stored question counts
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, total_questions')
      .order('created_at', { ascending: false })

    if (quizError) {
      console.error('Error fetching quizzes:', quizError)
      return
    }

    console.log(`Found ${quizzes.length} quizzes\n`)

    for (const quiz of quizzes) {
      // Count actual questions for this quiz
      const { count: actualCount, error: countError } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      if (countError) {
        console.error(`Error counting questions for quiz ${quiz.id}:`, countError)
        continue
      }

      const storedCount = quiz.total_questions
      const actualCountValue = actualCount || 0

      console.log(`📊 Quiz: "${quiz.title}"`)
      console.log(`   ID: ${quiz.id}`)
      console.log(`   Stored Count: ${storedCount}`)
      console.log(`   Actual Count: ${actualCountValue}`)

      if (storedCount !== actualCountValue) {
        console.log(`   🚨 MISMATCH! Difference: ${Math.abs(storedCount - actualCountValue)}`)
        
        // Show the actual questions
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('id, question, question_type, order_index')
          .eq('quiz_id', quiz.id)
          .order('order_index')

        if (!questionsError && questions) {
          console.log(`   📝 Actual Questions:`)
          questions.forEach((q, index) => {
            console.log(`      ${index + 1}. [${q.question_type}] ${q.question.substring(0, 50)}...`)
          })
        }
      } else {
        console.log(`   ✅ Count is correct`)
      }
      console.log('')
    }

    // Check for orphaned questions (questions without valid quiz references)
    console.log('\n🔍 Checking for orphaned questions...')
    
    const { data: allQuestions, error: allQuestionsError } = await supabase
      .from('quiz_questions')
      .select(`
        id, 
        quiz_id, 
        question,
        quizzes!inner(id, title)
      `)

    if (allQuestionsError) {
      console.error('Error checking orphaned questions:', allQuestionsError)
      return
    }

    const { data: orphanedQuestions, error: orphanedError } = await supabase
      .from('quiz_questions')
      .select('id, quiz_id, question')
      .not('quiz_id', 'in', `(${quizzes.map(q => `'${q.id}'`).join(',')})`)

    if (!orphanedError && orphanedQuestions && orphanedQuestions.length > 0) {
      console.log(`🚨 Found ${orphanedQuestions.length} orphaned questions:`)
      orphanedQuestions.forEach(q => {
        console.log(`   - Question ID: ${q.id}`)
        console.log(`     Quiz ID: ${q.quiz_id}`)
        console.log(`     Question: ${q.question.substring(0, 50)}...`)
      })
    } else {
      console.log('✅ No orphaned questions found')
    }

  } catch (error) {
    console.error('Debug script error:', error)
  }
}

// Run the debug function
debugQuestionCounts().then(() => {
  console.log('\n🏁 Debug complete')
  process.exit(0)
}).catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})
