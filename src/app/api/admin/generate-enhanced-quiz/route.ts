import { NextRequest, NextResponse } from 'next/server'
import { enhancedQuizService, EnhancedQuizGenerationRequest } from '@/lib/enhanced-ai-services'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract and validate required fields
    const {
      topic,
      questionCount,
      difficulty,
      subject,
      // Optional enhanced fields
      category,
      customSystemPrompt,
      customInstructions,
      teachingStyle,
      focusAreas,
      questionTypes,
      questionDistribution,
      includeExamples,
      includeDiagrams,
      complexityLevel,
      realWorldApplications,
      assessmentType,
      bloomsLevel,
      // Language options
      quizLanguage,
      explanationLanguage,
      includeTranslations
    } = body

    // Basic validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Topic is required and must be a non-empty string'
      }, { status: 400 })
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Subject is required (e.g., Mathematics, Science, History, Programming, English, etc.)'
      }, { status: 400 })
    }

    if (!questionCount || questionCount < 3 || questionCount > 25) {
      return NextResponse.json({
        success: false,
        error: 'Question count must be between 3 and 25'
      }, { status: 400 })
    }

    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json({
        success: false,
        error: 'Difficulty must be one of: beginner, intermediate, advanced'
      }, { status: 400 })
    }

    // Validate optional fields
    if (teachingStyle && !['academic', 'practical', 'conversational', 'professional'].includes(teachingStyle)) {
      return NextResponse.json({
        success: false,
        error: 'Teaching style must be one of: academic, practical, conversational, professional'
      }, { status: 400 })
    }

    if (complexityLevel && !['basic', 'intermediate', 'advanced', 'expert'].includes(complexityLevel)) {
      return NextResponse.json({
        success: false,
        error: 'Complexity level must be one of: basic, intermediate, advanced, expert'
      }, { status: 400 })
    }

    if (assessmentType && !['knowledge_recall', 'application', 'analysis', 'synthesis'].includes(assessmentType)) {
      return NextResponse.json({
        success: false,
        error: 'Assessment type must be one of: knowledge_recall, application, analysis, synthesis'
      }, { status: 400 })
    }

    // Build the enhanced request
    const enhancedRequest: EnhancedQuizGenerationRequest = {
      topic: topic.trim(),
      questionCount: parseInt(questionCount),
      difficulty,
      subject: subject.trim(),
      ...(category && { category }),
      ...(customSystemPrompt && { customSystemPrompt }),
      ...(customInstructions && { customInstructions }),
      ...(teachingStyle && { teachingStyle }),
      ...(focusAreas && Array.isArray(focusAreas) && { focusAreas }),
      ...(questionTypes && Array.isArray(questionTypes) && { questionTypes }),
      ...(questionDistribution && typeof questionDistribution === 'object' && { questionDistribution }),
      ...(typeof includeExamples === 'boolean' && { includeExamples }),
      ...(typeof includeDiagrams === 'boolean' && { includeDiagrams }),
      ...(complexityLevel && { complexityLevel }),
      ...(typeof realWorldApplications === 'boolean' && { realWorldApplications }),
      ...(assessmentType && { assessmentType }),
      ...(bloomsLevel && { bloomsLevel }),
      ...(quizLanguage && { quizLanguage }),
      ...(explanationLanguage && { explanationLanguage }),
      ...(typeof includeTranslations === 'boolean' && { includeTranslations })
    }

    logger.info('Enhanced quiz generation request received', {
      subject: enhancedRequest.subject,
      topic: enhancedRequest.topic,
      questionCount: enhancedRequest.questionCount,
      hasCustomPrompt: !!enhancedRequest.customSystemPrompt,
      teachingStyle: enhancedRequest.teachingStyle
    })

    // Generate the quiz
    const result = await enhancedQuizService.generateQuiz(enhancedRequest)

    if (!result.success) {
      logger.error('Enhanced quiz generation failed', { error: result.error })
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate quiz'
      }, { status: 500 })
    }

    logger.info('Enhanced quiz generated successfully', {
      subject: enhancedRequest.subject,
      topic: enhancedRequest.topic,
      questionsGenerated: result.quiz?.questions?.length || 0
    })

    // Return the quiz with optional debug info
    const response: any = {
      success: true,
      quiz: result.quiz
    }

    // Include prompt debugging info if requested
    if (body.includeDebugInfo) {
      response.debug = {
        promptUsed: result.promptUsed,
        systemPromptUsed: result.systemPromptUsed
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    logger.error('Enhanced quiz generation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred during quiz generation'
    }, { status: 500 })
  }
}

// GET endpoint to return available subjects and templates
export async function GET(request: NextRequest) {
  try {
    const subjects = enhancedQuizService.getAvailableSubjects()
    
    const subjectTemplates = subjects.reduce((acc, subject) => {
      const template = enhancedQuizService.getSubjectTemplate(subject)
      if (template) {
        acc[subject] = {
          defaultCategory: template.defaultCategory,
          commonFocusAreas: template.commonFocusAreas,
          recommendedQuestionTypes: template.recommendedQuestionTypes
        }
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      availableSubjects: subjects,
      subjectTemplates,
      supportedOptions: {
        teachingStyles: ['academic', 'practical', 'conversational', 'professional'],
        complexityLevels: ['basic', 'intermediate', 'advanced', 'expert'],
        assessmentTypes: ['knowledge_recall', 'application', 'analysis', 'synthesis'],
        questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'],
        bloomsLevels: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
      }
    })
  } catch (error: any) {
    logger.error('Error fetching quiz generation options:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quiz generation options'
    }, { status: 500 })
  }
}
