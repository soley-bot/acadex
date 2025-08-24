#!/usr/bin/env node

/**
 * Quiz Data Integrity Checker - Node.js Version
 * Identifies quiz questions with missing or invalid correct answers
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Color coding for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkQuizDataIntegrity() {
  log('\n🔍 CHECKING QUIZ DATA INTEGRITY...', 'bold')
  
  try {
    // 1. Identify questions with missing correct answers
    log('\n1️⃣ Checking for questions with missing correct answers...', 'blue')
    
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        question,
        question_type,
        correct_answer,
        correct_answer_text,
        correct_answer_json,
        order_index,
        quizzes (title)
      `)
      .order('order_index')
    
    if (questionsError) {
      log(`❌ Error fetching questions: ${questionsError.message}`, 'red')
      return
    }
    
    log(`📊 Found ${questions.length} total questions`, 'cyan')
    
    const issuesFound = []
    
    questions.forEach(q => {
      const issues = []
      
      switch (q.question_type) {
        case 'multiple_choice':
        case 'single_choice':
        case 'true_false':
          if (q.correct_answer === null || q.correct_answer === undefined) {
            issues.push('Missing correct_answer index')
          }
          break
          
        case 'fill_blank':
        case 'essay':
          if (!q.correct_answer_text || q.correct_answer_text.trim() === '') {
            issues.push('Missing correct_answer_text')
          }
          break
          
        case 'matching':
        case 'ordering':
          if (!q.correct_answer_json || 
              (Array.isArray(q.correct_answer_json) && q.correct_answer_json.length === 0) ||
              (typeof q.correct_answer_json === 'object' && Object.keys(q.correct_answer_json).length === 0)) {
            issues.push('Missing or empty correct_answer_json')
          }
          break
      }
      
      if (issues.length > 0) {
        issuesFound.push({
          id: q.id,
          question: q.question.substring(0, 60) + '...',
          question_type: q.question_type,
          quiz_title: q.quizzes?.title || 'Unknown Quiz',
          issues,
          currentData: {
            correct_answer: q.correct_answer,
            correct_answer_text: q.correct_answer_text,
            correct_answer_json: q.correct_answer_json
          }
        })
      }
    })
    
    if (issuesFound.length === 0) {
      log('✅ No data integrity issues found!', 'green')
    } else {
      log(`\n⚠️  Found ${issuesFound.length} questions with issues:`, 'yellow')
      
      issuesFound.forEach((issue, index) => {
        log(`\n${index + 1}. Question ID: ${issue.id}`, 'red')
        log(`   Quiz: "${issue.quiz_title}"`, 'yellow')
        log(`   Question: ${issue.question}`, 'white')
        log(`   Type: ${issue.question_type}`, 'blue')
        log(`   Issues: ${issue.issues.join(', ')}`, 'red')
        log(`   Current correct_answer: ${JSON.stringify(issue.currentData.correct_answer)}`, 'gray')
        log(`   Current correct_answer_text: ${JSON.stringify(issue.currentData.correct_answer_text)}`, 'gray')
        log(`   Current correct_answer_json: ${JSON.stringify(issue.currentData.correct_answer_json)}`, 'gray')
      })
    }
    
    // 2. Check quiz attempts that might be affected
    if (issuesFound.length > 0) {
      log('\n2️⃣ Checking affected quiz attempts...', 'blue')
      
      const questionIds = issuesFound.map(issue => issue.id)
      
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          completed_at,
          quizzes (title)
        `)
        .in('quiz_id', [...new Set(issuesFound.map(q => {
          // We need to get quiz_id from questions, let's do this differently
          return null
        }).filter(Boolean))])
      
      // Alternative approach - get all attempts and filter
      const { data: allAttempts, error: allAttemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          completed_at,
          quizzes (title)
        `)
        .order('completed_at', { ascending: false })
        .limit(10)
      
      if (allAttemptsError) {
        log(`⚠️ Could not fetch quiz attempts: ${allAttemptsError.message}`, 'yellow')
      } else {
        log(`📈 Recent quiz attempts (last 10):`, 'cyan')
        allAttempts.forEach((attempt, index) => {
          log(`   ${index + 1}. Quiz: "${attempt.quizzes?.title}" - Score: ${attempt.score}% - ${new Date(attempt.completed_at).toLocaleDateString()}`, 'white')
        })
      }
    }
    
    // 3. Provide fix recommendations
    if (issuesFound.length > 0) {
      log('\n3️⃣ RECOMMENDED FIXES:', 'bold')
      
      const matchingIssues = issuesFound.filter(issue => issue.question_type === 'matching')
      const orderingIssues = issuesFound.filter(issue => issue.question_type === 'ordering')
      const textIssues = issuesFound.filter(issue => ['fill_blank', 'essay'].includes(issue.question_type))
      const choiceIssues = issuesFound.filter(issue => ['multiple_choice', 'single_choice', 'true_false'].includes(issue.question_type))
      
      if (matchingIssues.length > 0) {
        log(`\n🔗 Matching Questions (${matchingIssues.length}):`, 'yellow')
        log('   → Go to /admin/quizzes and edit each matching question', 'yellow')
        log('   → Set up the correct matching pairs in the admin interface', 'yellow')
        matchingIssues.forEach(issue => {
          log(`   → Question ID ${issue.id}: "${issue.question}"`, 'white')
        })
      }
      
      if (orderingIssues.length > 0) {
        log(`\n📝 Ordering Questions (${orderingIssues.length}):`, 'yellow')
        log('   → Go to /admin/quizzes and edit each ordering question', 'yellow')
        log('   → Set the correct sequence of items', 'yellow')
        orderingIssues.forEach(issue => {
          log(`   → Question ID ${issue.id}: "${issue.question}"`, 'white')
        })
      }
      
      if (textIssues.length > 0) {
        log(`\n📝 Text Questions (${textIssues.length}):`, 'yellow')
        log('   → Go to /admin/quizzes and edit each text question', 'yellow')
        log('   → Provide the correct answer text', 'yellow')
        textIssues.forEach(issue => {
          log(`   → Question ID ${issue.id}: "${issue.question}"`, 'white')
        })
      }
      
      if (choiceIssues.length > 0) {
        log(`\n✅ Choice Questions (${choiceIssues.length}):`, 'yellow')
        log('   → Go to /admin/quizzes and edit each choice question', 'yellow')
        log('   → Select the correct answer option', 'yellow')
        choiceIssues.forEach(issue => {
          log(`   → Question ID ${issue.id}: "${issue.question}"`, 'white')
        })
      }
      
      log('\n🎯 NEXT STEPS:', 'bold')
      log('1. Go to http://localhost:3000/admin/quizzes', 'green')
      log('2. Click "Edit" on quizzes with issues', 'green')
      log('3. Fix the questions listed above', 'green')
      log('4. Re-run this script to verify fixes', 'green')
    }
    
    return issuesFound
    
  } catch (error) {
    log(`❌ Error checking quiz data integrity: ${error.message}`, 'red')
    console.error(error)
  }
}

async function main() {
  log('🚀 QUIZ DATA INTEGRITY CHECKER', 'bold')
  log('===============================', 'bold')
  
  const issues = await checkQuizDataIntegrity()
  
  if (issues && issues.length === 0) {
    log('\n🎉 All quiz data is properly configured!', 'green')
    log('✅ No issues found - quiz system is ready to use', 'green')
  } else if (issues) {
    log('\n⚠️  Issues found - please fix them via the admin panel', 'yellow')
    log(`   Total issues: ${issues.length}`, 'yellow')
  }
  
  log('\n✨ Check complete!', 'bold')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { checkQuizDataIntegrity }
