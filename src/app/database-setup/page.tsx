'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseSetup() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const checkTables = async () => {
    setLoading(true)
    setStatus('Checking database tables...\n')
    
    try {
      // Test each table individually with detailed error reporting
      const tests = [
        { name: 'users', test: () => supabase.from('users').select('id').limit(1) },
        { name: 'courses', test: () => supabase.from('courses').select('id').limit(1) },
        { name: 'quizzes', test: () => supabase.from('quizzes').select('id').limit(1) },
        { name: 'questions', test: () => supabase.from('questions').select('id').limit(1) },
        { name: 'quiz_questions', test: () => supabase.from('quiz_questions').select('id').limit(1) },
        { name: 'enrollments', test: () => supabase.from('enrollments').select('id').limit(1) },
        { name: 'quiz_attempts', test: () => supabase.from('quiz_attempts').select('id').limit(1) }
      ]
      
      let results = ['Database Table Status:\n']
      let allGood = true
      
      for (const { name, test } of tests) {
        try {
          const { data, error } = await test()
          if (error) {
            allGood = false
            if (error.code === '42P01') {
              results.push(`❌ ${name}: Table does not exist`)
            } else {
              results.push(`❌ ${name}: ${error.message} (Code: ${error.code})`)
            }
          } else {
            const count = data?.length || 0
            results.push(`✅ ${name}: OK (${count} records shown)`)
          }
        } catch (err) {
          allGood = false
          results.push(`❌ ${name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
      
      if (allGood) {
        results.push('\n🎉 All tables exist and are accessible!')
        results.push('You can now use the admin panel.')
      } else {
        results.push('\n⚠️  Some tables are missing or inaccessible.')
        results.push('Please follow the database setup instructions.')
      }
      
      setStatus(results.join('\n'))
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setLoading(true)
    setStatus('❌ Cannot create tables via JavaScript. Please use Supabase SQL Editor.\n\nInstructions:\n1. Go to Supabase Dashboard > SQL Editor\n2. Copy and paste the contents of /database/chunk-2-tables.sql\n3. Run the SQL script\n4. Then run chunk-5-data.sql for sample data')
    setLoading(false)
  }

  const seedData = async () => {
    setLoading(true)
    setStatus('Adding sample data...')
    
    try {
      // Insert sample users
      await supabase.from('users').upsert([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'admin01@acadex.com',
          name: 'Admin User',
          role: 'admin'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'instructor@acadex.com', 
          name: 'John Smith',
          role: 'instructor'
        }
      ])

      // Insert sample courses
      await supabase.from('courses').upsert([
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          title: 'English Grammar Fundamentals',
          description: 'Master the basics of English grammar with comprehensive lessons.',
          instructor_id: '550e8400-e29b-41d4-a716-446655440002',
          price: 49.99,
          duration_hours: 20,
          level: 'beginner',
          category: 'english'
        }
      ])

      // Insert sample quizzes
      await supabase.from('quizzes').upsert([
        {
          id: '770e8400-e29b-41d4-a716-446655440001',
          title: 'Grammar Basics Quiz',
          description: 'Test your understanding of basic English grammar rules.',
          course_id: '660e8400-e29b-41d4-a716-446655440001',
          difficulty: 'easy',
          time_limit: 15
        }
      ])

      // Insert sample questions
      await supabase.from('questions').upsert([
        {
          quiz_id: '770e8400-e29b-41d4-a716-446655440001',
          question_text: 'What is the past tense of "go"?',
          options: ['went', 'goed', 'gone', 'going'],
          correct_answer: 'went',
          explanation: 'The past tense of "go" is "went".'
        }
      ])

      setStatus('✅ Sample data added successfully!')
    } catch (err) {
      setStatus(`Error adding data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Setup</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkTables}
          disabled={loading}
          className="bg-secondary hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Check Tables
        </button>
        
        <button 
          onClick={createTables}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Create Tables
        </button>
        
        <button 
          onClick={seedData}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Add Sample Data
        </button>
      </div>

      {status && (
        <div className="mt-6 p-4 border rounded-lg">
          <pre className="whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  )
}
