import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fixQuestionTypeConstraint() {
  console.log('🔧 Fixing question_type constraint...')

  try {
    // Drop the old constraint
    console.log('📝 Dropping old constraint...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;'
    })
    
    if (dropError) {
      console.error('❌ Error dropping constraint:', dropError)
      // Continue anyway - constraint might not exist
    } else {
      console.log('✅ Old constraint dropped successfully')
    }

    // Add new constraint with all supported question types
    console.log('📝 Adding new constraint with enhanced question types...')
    const { error: addError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE quiz_questions 
        ADD CONSTRAINT quiz_questions_question_type_check 
        CHECK (question_type IN (
          'multiple_choice', 
          'single_choice', 
          'true_false', 
          'fill_blank', 
          'essay', 
          'matching', 
          'ordering'
        ));
      `
    })
    
    if (addError) {
      console.error('❌ Error adding new constraint:', addError)
      return false
    }
    
    console.log('✅ New constraint added successfully!')

    // Verify the constraint
    console.log('🔍 Verifying constraint...')
    const { data: constraints, error: verifyError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          conname,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'quiz_questions'::regclass 
          AND conname = 'quiz_questions_question_type_check';
      `
    })

    if (verifyError) {
      console.error('❌ Error verifying constraint:', verifyError)
      return false
    }

    if (constraints && constraints.length > 0) {
      console.log('✅ Constraint verification successful!')
      console.log('📋 Constraint definition:', constraints[0]?.definition)
    }

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

// Alternative approach using direct SQL execution
async function fixConstraintWithDirectSQL() {
  console.log('🔧 Fixing question_type constraint with direct SQL...')

  try {
    // First check if the constraint exists
    const { data: existingConstraints } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .ilike('constraint_name', '%question_type_check%')

    console.log('📋 Existing constraints:', existingConstraints)

    // Use raw SQL query to fix the constraint
    const { error } = await supabase.rpc('exec', { 
      sql: `
        -- Drop old constraint if it exists
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'quiz_questions_question_type_check'
          ) THEN
            ALTER TABLE quiz_questions DROP CONSTRAINT quiz_questions_question_type_check;
          END IF;
        END $$;

        -- Add new constraint
        ALTER TABLE quiz_questions 
        ADD CONSTRAINT quiz_questions_question_type_check 
        CHECK (question_type IN (
          'multiple_choice', 
          'single_choice', 
          'true_false', 
          'fill_blank', 
          'essay', 
          'matching', 
          'ordering'
        ));
      `
    })

    if (error) {
      console.error('❌ Error executing SQL:', error)
      return false
    }

    console.log('✅ Constraint fixed successfully!')
    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

// Run the migration
async function main() {
  console.log('🚀 Starting question type constraint migration...')
  
  const success = await fixConstraintWithDirectSQL()
  
  if (success) {
    console.log('🎉 Migration completed successfully!')
    console.log('✨ You can now create quizzes with all question types:')
    console.log('   • multiple_choice')
    console.log('   • single_choice') 
    console.log('   • true_false')
    console.log('   • fill_blank')
    console.log('   • essay')
    console.log('   • matching')
    console.log('   • ordering')
  } else {
    console.log('💔 Migration failed. Please run the SQL manually in Supabase Dashboard.')
    console.log('📋 Manual SQL to run:')
    console.log(`
      -- Drop old constraint
      ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
      
      -- Add new constraint
      ALTER TABLE quiz_questions 
      ADD CONSTRAINT quiz_questions_question_type_check 
      CHECK (question_type IN (
        'multiple_choice', 'single_choice', 'true_false', 
        'fill_blank', 'essay', 'matching', 'ordering'
      ));
    `)
  }
  
  process.exit(success ? 0 : 1)
}

main().catch(console.error)
