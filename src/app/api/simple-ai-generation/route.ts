import { NextRequest, NextResponse } from 'next/server'
import { SimpleAIQuizGenerator } from '@/lib/simple-ai-quiz-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.topic || !body.topic.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Topic is required'
      }, { status: 400 })
    }

    // Create a new instance of the generator (only works on server side)
    const generator = new SimpleAIQuizGenerator()
    
    const result = await generator.generateQuiz({
      topic: body.topic.trim(),
      subject: body.subject || 'General Knowledge',
      questionCount: body.questionCount || 5,
      difficulty: body.difficulty || 'intermediate',
      questionTypes: body.questionTypes || ['multiple_choice', 'true_false'],
      language: body.language || 'english',
      explanationLanguage: body.explanationLanguage || 'english',
      customPrompt: body.customPrompt // Pass the custom prompt if provided
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Simple AI generation API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
