#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function applySchema() {
  try {
    console.log('🚀 Creating content review tables directly...')
    
    // Create the main table using direct SQL
    console.log('⏳ Creating content_reviews table...')
    const { error: tableError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS content_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content_type VARCHAR(50) NOT NULL,
          content_id UUID,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          generated_by_ai BOOLEAN DEFAULT true,
          ai_model VARCHAR(100),
          generation_prompt TEXT,
          raw_ai_response TEXT,
          review_status VARCHAR(20) DEFAULT 'pending',
          priority VARCHAR(10) DEFAULT 'medium',
          ai_confidence_score DECIMAL(3,2) DEFAULT 0.00,
          quality_score DECIMAL(3,2),
          validation_issues JSONB DEFAULT '[]'::jsonb,
          reviewer_notes TEXT,
          auto_corrected BOOLEAN DEFAULT false,
          corrected_content TEXT,
          language VARCHAR(20) DEFAULT 'english',
          subject VARCHAR(100),
          difficulty VARCHAR(20),
          estimated_review_time INTEGER DEFAULT 10,
          actual_review_time INTEGER,
          created_by UUID,
          reviewed_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          approved_at TIMESTAMP WITH TIME ZONE
        );
      `
    })
    
    if (tableError) {
      console.log('ℹ️  Table creation response:', tableError.message)
    } else {
      console.log('✅ content_reviews table created successfully')
    }
    
    // For now, let's just test if we can insert a sample record
    console.log('🔍 Testing table functionality...')
    const { data: insertTest, error: insertError } = await supabase
      .from('content_reviews')
      .insert({
        content_type: 'quiz',
        title: 'Test Quiz - English Grammar',
        subject: 'English Grammar',
        difficulty: 'intermediate',
        ai_confidence_score: 0.85,
        validation_issues: []
      })
      .select()
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError.message)
    } else {
      console.log('✅ Test insert successful - table is working!')
      
      // Clean up test record
      if (insertTest && insertTest[0]) {
        await supabase
          .from('content_reviews')
          .delete()
          .eq('id', insertTest[0].id)
        console.log('🧹 Test record cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Schema application failed:', error)
    process.exit(1)
  }
}

applySchema()
