#!/usr/bin/env node

/**
 * Comprehensive Quiz Data Cleanup & Validation Script
 * 
 * This script:
 * 1. Identifies quiz questions with missing or invalid correct answers
 * 2. Fixes data consistency issues
 * 3. Validates all existing quiz data
 * 4. Provides detailed reporting
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

async function analyzeQuizData() {
  log('\n🔍 ANALYZING QUIZ DATA...', 'bold')
  
  try {
    // Fetch all quiz questions
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        quiz_id,
        question,
        question_type,
        options,
        correct_answer,
        correct_answer_text,
        correct_answer_json,
        quizzes (title)
      `)
      .order('quiz_id, order_index')
    
    if (error) {
      log(`❌ Error fetching questions: ${error.message}`, 'red')
      return
    }
    
    log(`📊 Found ${questions.length} total questions`, 'blue')
    
    const issues = []
    const summary = {
      total: questions.length,
      byType: {},
      withIssues: 0,
      issueTypes: {
        missingCorrectAnswer: 0,
        invalidCorrectAnswer: 0,
        emptyCorrectAnswerJson: 0,
        missingCorrectAnswerText: 0
      }
    }
    
    // Analyze each question
    questions.forEach((question, index) => {
      const { question_type, correct_answer, correct_answer_text, correct_answer_json } = question
      
      // Count by type
      summary.byType[question_type] = (summary.byType[question_type] || 0) + 1
      
      const questionIssues = []
      
      // Validate based on question type
      switch (question_type) {
        case 'multiple_choice':
        case 'single_choice':
        case 'true_false':
          if (correct_answer === null || correct_answer === undefined) {
            questionIssues.push('Missing correct_answer (numeric)')
            summary.issueTypes.missingCorrectAnswer++
          }
          break
          
        case 'fill_blank':
        case 'essay':
          if (!correct_answer_text || correct_answer_text.trim() === '') {
            questionIssues.push('Missing correct_answer_text')
            summary.issueTypes.missingCorrectAnswerText++
          }
          break
          
        case 'matching':
        case 'ordering':
          if (!correct_answer_json || 
              (Array.isArray(correct_answer_json) && correct_answer_json.length === 0) ||
              (typeof correct_answer_json === 'object' && Object.keys(correct_answer_json).length === 0)) {
            questionIssues.push('Missing or empty correct_answer_json')
            summary.issueTypes.emptyCorrectAnswerJson++
          }
          break
      }
      
      if (questionIssues.length > 0) {
        summary.withIssues++
        issues.push({
          questionId: question.id,
          quizTitle: question.quizzes?.title || 'Unknown Quiz',
          questionType: question_type,
          questionText: question.question.substring(0, 50) + '...',
          issues: questionIssues,
          currentData: {
            correct_answer,
            correct_answer_text,
            correct_answer_json
          }
        })
      }
    })
    
    // Report summary
    log('\n📋 ANALYSIS SUMMARY:', 'bold')
    log(`Total Questions: ${summary.total}`, 'blue')
    log(`Questions with Issues: ${summary.withIssues}`, summary.withIssues > 0 ? 'red' : 'green')
    log(`Success Rate: ${((summary.total - summary.withIssues) / summary.total * 100).toFixed(1)}%`, 
        summary.withIssues === 0 ? 'green' : 'yellow')
    
    log('\n📊 BY QUESTION TYPE:', 'bold')
    Object.entries(summary.byType).forEach(([type, count]) => {
      log(`  ${type}: ${count}`, 'cyan')
    })
    
    log('\n⚠️  ISSUE BREAKDOWN:', 'bold')
    Object.entries(summary.issueTypes).forEach(([type, count]) => {
      if (count > 0) {
        log(`  ${type}: ${count}`, 'red')
      }
    })
    
    if (issues.length > 0) {
      log('\n🔍 DETAILED ISSUES:', 'bold')
      issues.forEach((issue, index) => {
        log(`\n${index + 1}. Quiz: "${issue.quizTitle}"`, 'yellow')
        log(`   Question: ${issue.questionText}`, 'white')
        log(`   Type: ${issue.questionType}`, 'blue')
        log(`   Issues: ${issue.issues.join(', ')}`, 'red')
        log(`   Current Data:`, 'gray')
        log(`     correct_answer: ${JSON.stringify(issue.currentData.correct_answer)}`, 'gray')
        log(`     correct_answer_text: ${JSON.stringify(issue.currentData.correct_answer_text)}`, 'gray')
        log(`     correct_answer_json: ${JSON.stringify(issue.currentData.correct_answer_json)}`, 'gray')
      })
    }
    
    return { issues, summary }
    
  } catch (error) {
    log(`❌ Analysis failed: ${error.message}`, 'red')
    console.error(error)
  }
}

async function fixSpecificIssues(issues) {
  if (issues.length === 0) {
    log('\n✅ No issues to fix!', 'green')
    return
  }
  
  log('\n🔧 FIXING IDENTIFIED ISSUES...', 'bold')
  
  const fixes = []
  
  for (const issue of issues) {
    const { questionId, questionType, currentData } = issue
    
    let updateData = {}
    let fixDescription = ''
    
    switch (questionType) {
      case 'matching':
        // For matching questions with empty correct_answer_json, set a default structure
        if (issue.issues.includes('Missing or empty correct_answer_json')) {
          // This needs manual intervention - we can't guess the correct matches
          log(`⚠️  Skipping ${questionId} - matching questions need manual correct answer setup`, 'yellow')
          continue
        }
        break
        
      case 'ordering':
        // For ordering questions with empty correct_answer_json, we can try to set a default order
        if (issue.issues.includes('Missing or empty correct_answer_json')) {
          // Fetch the question to get options
          const { data: questionData } = await supabase
            .from('quiz_questions')
            .select('options')
            .eq('id', questionId)
            .single()
          
          if (questionData && Array.isArray(questionData.options)) {
            // Set the correct answer as the current order of options
            updateData.correct_answer_json = questionData.options
            fixDescription = 'Set correct_answer_json to current option order (needs manual verification)'
          }
        }
        break
        
      case 'fill_blank':
      case 'essay':
        if (issue.issues.includes('Missing correct_answer_text')) {
          // These need manual intervention
          log(`⚠️  Skipping ${questionId} - ${questionType} questions need manual correct answer setup`, 'yellow')
          continue
        }
        break
    }
    
    if (Object.keys(updateData).length > 0) {
      try {
        const { error } = await supabase
          .from('quiz_questions')
          .update(updateData)
          .eq('id', questionId)
        
        if (error) {
          log(`❌ Failed to fix ${questionId}: ${error.message}`, 'red')
        } else {
          log(`✅ Fixed ${questionId}: ${fixDescription}`, 'green')
          fixes.push({ questionId, fixDescription })
        }
      } catch (error) {
        log(`❌ Error fixing ${questionId}: ${error.message}`, 'red')
      }
    }
  }
  
  log(`\n🎯 FIXES APPLIED: ${fixes.length}`, 'bold')
  fixes.forEach(fix => {
    log(`  ✅ ${fix.questionId}: ${fix.fixDescription}`, 'green')
  })
}

async function main() {
  log('🚀 QUIZ DATA CLEANUP & VALIDATION TOOL', 'bold')
  log('=====================================', 'bold')
  
  const { issues, summary } = await analyzeQuizData()
  
  if (issues && issues.length > 0) {
    log('\n❓ Would you like to attempt automatic fixes for some issues?', 'yellow')
    log('   Note: Matching questions and text-based questions will need manual fixing via admin panel', 'gray')
    
    // For this demo, we'll just report what needs to be fixed
    await fixSpecificIssues(issues)
    
    log('\n📝 MANUAL ACTIONS REQUIRED:', 'bold')
    log('1. Go to /admin/quizzes to edit questions with issues', 'yellow')
    log('2. For matching questions: Set up the correct matching pairs', 'yellow')
    log('3. For fill-blank/essay questions: Set the correct answer text', 'yellow')
    log('4. Re-run this script to verify all issues are resolved', 'yellow')
  }
  
  log('\n✨ CLEANUP COMPLETE!', 'bold')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { analyzeQuizData, fixSpecificIssues }
