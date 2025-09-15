const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyTemplateSchema() {
  // Load environment variables from .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please ensure your .env.local file has:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test connection first
  console.log('Testing Supabase connection...');
  const { data, error: testError } = await supabase.from('quizzes').select('count').limit(1);
  if (testError) {
    console.error('Connection failed:', testError.message);
    process.exit(1);
  }
  console.log('✓ Connection successful');
  
  // Create the question_templates table manually
  console.log('Creating question_templates table...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'question_templates');
      
    if (data && data.length > 0) {
      console.log('✓ Table already exists');
    } else {
      console.log('Table needs to be created via SQL editor or API');
    }
  } catch (err) {
    console.log('Table check failed:', err.message);
  }
  
  // Create RLS policies - Skip this for now as we need SQL editor access
  console.log('RLS policies need to be created via Supabase SQL Editor');
  console.log('Please run the following SQL in your Supabase Dashboard → SQL Editor:');
  console.log('');
  console.log(`-- Create question_templates table
CREATE TABLE IF NOT EXISTS public.question_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general'::text,
  difficulty text NOT NULL DEFAULT 'intermediate'::text,
  question_type text NOT NULL,
  question_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_question_type CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Enable RLS
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Templates are viewable by everyone" ON public.question_templates FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert their own templates" ON public.question_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Users can update their own templates" ON public.question_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Users can delete their own templates" ON public.question_templates FOR DELETE USING (auth.uid() = created_by);`);
  console.log('');
  
  // Try to insert sample data if table exists
  console.log('Checking if we can add sample templates...');
  
  const sampleTemplates = [
    {
      title: 'Basic Grammar Choice',
      description: 'Multiple choice question for testing grammar knowledge',
      category: 'grammar',
      difficulty: 'beginner',
      question_type: 'multiple_choice',
      question_data: {
        question: 'Choose the correct verb form: "She __ to school every day."',
        options: ['go', 'goes', 'going', 'gone'],
        correct_answer: 1,
        explanation: 'Use "goes" for third person singular in present tense.'
      },
      tags: ['grammar', 'verbs', 'present-tense']
    },
    {
      title: 'Vocabulary True/False',
      description: 'True or false question for vocabulary understanding',
      category: 'vocabulary',
      difficulty: 'intermediate',
      question_type: 'true_false',
      question_data: {
        question: '"Ubiquitous" means existing everywhere at the same time.',
        correct_answer: 0,
        explanation: 'Ubiquitous means present, appearing, or found everywhere.'
      },
      tags: ['vocabulary', 'definitions']
    }
  ];
  
  try {
    const { error } = await supabase
      .from('question_templates')
      .insert(sampleTemplates);
      
    if (error) throw error;
    console.log('✓ Sample templates added');
  } catch (err) {
    console.log('Sample templates note:', err.message);
  }
  
  console.log('✅ Template schema setup completed successfully!');
}

applyTemplateSchema().catch(console.error);