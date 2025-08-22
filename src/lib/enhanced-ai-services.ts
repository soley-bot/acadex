import { logger } from './logger'
import { BaseAIService, AIServiceFactory } from './ai-services'
import { getRecommendedModel, getModelConfig, MODEL_RECOMMENDATIONS } from './ai-model-config'

// Enhanced quiz generation with multi-subject support and prompt control
export interface EnhancedQuizGenerationRequest {
  // Basic quiz parameters
  topic: string
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  
  // Multi-subject support
  subject: string // Math, Science, History, Programming, etc.
  category?: string // Optional custom category
  
  // Language and localization support
  quizLanguage?: string // Primary language for quiz content
  explanationLanguage?: string // Language for explanations (can be different)
  includeTranslations?: boolean // Include translations in secondary language
  
  // Enhanced prompt control
  customSystemPrompt?: string
  customInstructions?: string
  teachingStyle?: 'academic' | 'practical' | 'conversational' | 'professional'
  focusAreas?: string[] // e.g., ["problem-solving", "conceptual understanding"]
  
  // Question type control
  questionTypes?: ('multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering')[]
  questionDistribution?: Record<string, number> // e.g., {"multiple_choice": 7, "true_false": 3}
  
  // Content customization
  includeExamples?: boolean
  includeDiagrams?: boolean
  complexityLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert'
  realWorldApplications?: boolean
  
  // Assessment focus
  assessmentType?: 'knowledge_recall' | 'application' | 'analysis' | 'synthesis'
  bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
}

export interface SubjectTemplate {
  systemPromptTemplate: string
  promptTemplate: string
  defaultCategory: string
  commonFocusAreas: string[]
  recommendedQuestionTypes: string[]
}

// Pre-built subject templates
export const SUBJECT_TEMPLATES: Record<string, SubjectTemplate> = {
  mathematics: {
    systemPromptTemplate: `You are an expert Mathematics instructor creating educational assessments. 
Focus on mathematical reasoning, problem-solving, and conceptual understanding.
Ensure calculations are accurate and explanations show clear mathematical steps.`,
    promptTemplate: `Generate {difficulty} level Mathematics questions about "{topic}"`,
    defaultCategory: 'Mathematics',
    commonFocusAreas: ['problem-solving', 'mathematical reasoning', 'formula application'],
    recommendedQuestionTypes: ['multiple_choice', 'fill_blank', 'essay']
  },
  
  science: {
    systemPromptTemplate: `You are an expert Science educator creating educational assessments.
Focus on scientific concepts, experimental design, and real-world applications.
Include accurate scientific facts and encourage critical thinking.`,
    promptTemplate: `Generate {difficulty} level Science questions about "{topic}"`,
    defaultCategory: 'Science',
    commonFocusAreas: ['conceptual understanding', 'scientific method', 'real-world applications'],
    recommendedQuestionTypes: ['multiple_choice', 'true_false', 'matching', 'essay']
  },
  
  history: {
    systemPromptTemplate: `You are an expert History educator creating educational assessments.
Focus on historical analysis, cause-and-effect relationships, and critical evaluation of sources.
Encourage understanding of historical context and significance.`,
    promptTemplate: `Generate {difficulty} level History questions about "{topic}"`,
    defaultCategory: 'History',
    commonFocusAreas: ['historical analysis', 'chronological thinking', 'source evaluation'],
    recommendedQuestionTypes: ['multiple_choice', 'essay', 'ordering']
  },
  
  programming: {
    systemPromptTemplate: `You are an expert Programming instructor creating coding assessments.
Focus on code comprehension, debugging skills, and programming concepts.
Include practical examples and best practices.`,
    promptTemplate: `Generate {difficulty} level Programming questions about "{topic}"`,
    defaultCategory: 'Programming',
    commonFocusAreas: ['code comprehension', 'debugging', 'best practices', 'problem solving'],
    recommendedQuestionTypes: ['multiple_choice', 'fill_blank', 'essay']
  },
  
  english: {
    systemPromptTemplate: `You are an expert English language instructor creating educational quizzes.
Focus on language comprehension, grammar application, and communication skills.
Ensure questions test practical language usage and understanding.`,
    promptTemplate: `Generate {difficulty} level English questions about "{topic}"`,
    defaultCategory: 'English Language',
    commonFocusAreas: ['grammar application', 'reading comprehension', 'vocabulary usage'],
    recommendedQuestionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'essay']
  },
  
  custom: {
    systemPromptTemplate: `You are an expert educator creating educational assessments.
Focus on clear, educational questions that test understanding and application.
Ensure questions are appropriate for the specified difficulty level.`,
    promptTemplate: `Generate {difficulty} level questions about "{topic}"`,
    defaultCategory: 'General',
    commonFocusAreas: ['comprehension', 'application', 'analysis'],
    recommendedQuestionTypes: ['multiple_choice', 'true_false', 'essay']
  },

  // Additional subject templates showcasing all question types
  literature: {
    systemPromptTemplate: `You are an expert Literature instructor creating assessments.
Focus on literary analysis, comprehension, and critical thinking about texts.
Include questions about themes, characters, literary devices, and interpretations.`,
    promptTemplate: `Generate {difficulty} level Literature questions about "{topic}"`,
    defaultCategory: 'Literature',
    commonFocusAreas: ['literary analysis', 'character development', 'themes', 'literary devices'],
    recommendedQuestionTypes: ['multiple_choice', 'essay', 'matching', 'fill_blank']
  },

  geography: {
    systemPromptTemplate: `You are an expert Geography instructor creating educational assessments.
Focus on spatial thinking, location knowledge, and understanding of physical and human geography.
Include questions about maps, regions, climate, and cultural geography.`,
    promptTemplate: `Generate {difficulty} level Geography questions about "{topic}"`,
    defaultCategory: 'Geography',
    commonFocusAreas: ['spatial awareness', 'location knowledge', 'physical geography', 'human geography'],
    recommendedQuestionTypes: ['multiple_choice', 'matching', 'ordering', 'fill_blank']
  },

  biology: {
    systemPromptTemplate: `You are an expert Biology instructor creating scientific assessments.
Focus on biological processes, organism structure and function, and scientific methodology.
Include questions about classification, evolution, genetics, and ecology.`,
    promptTemplate: `Generate {difficulty} level Biology questions about "{topic}"`,
    defaultCategory: 'Biology',
    commonFocusAreas: ['biological processes', 'scientific method', 'classification', 'genetics'],
    recommendedQuestionTypes: ['multiple_choice', 'matching', 'fill_blank', 'essay']
  }
}

export class EnhancedQuizGenerationService {
  private aiService: BaseAIService
  private modelId: string

  constructor(aiService?: BaseAIService, customModel?: string) {
    this.aiService = aiService || AIServiceFactory.getDefaultService()
    // Use the best model for quiz generation (2025)
    this.modelId = customModel || MODEL_RECOMMENDATIONS.BEST_OVERALL
    
    logger.info('Enhanced Quiz Generation Service initialized', {
      model: this.modelId,
      provider: 'gemini'
    })
  }

  // Suggest category based on subject and topic
  private suggestCategoryFromSubject(subject: string, topic: string): string {
    const subjectKey = subject.toLowerCase()
    const template = SUBJECT_TEMPLATES[subjectKey]
    
    if (template) {
      return template.defaultCategory
    }
    
    // If custom subject, try to infer from topic
    const topicLower = topic.toLowerCase()
    if (topicLower.includes('math') || topicLower.includes('algebra') || topicLower.includes('calculus')) {
      return 'Mathematics'
    }
    if (topicLower.includes('science') || topicLower.includes('physics') || topicLower.includes('chemistry')) {
      return 'Science'
    }
    if (topicLower.includes('history') || topicLower.includes('war') || topicLower.includes('ancient')) {
      return 'History'
    }
    if (topicLower.includes('language') || topicLower.includes('grammar') || topicLower.includes('vocabulary')) {
      return 'Language'
    }
    
    // Default fallback
    return subject.charAt(0).toUpperCase() + subject.slice(1)
  }

  private buildSystemPrompt(request: EnhancedQuizGenerationRequest): string {
    // Use custom system prompt if provided
    if (request.customSystemPrompt) {
      return request.customSystemPrompt
    }

    // Get subject template
    const subjectKey = request.subject.toLowerCase()
    const template = SUBJECT_TEMPLATES[subjectKey] || SUBJECT_TEMPLATES.custom
    
    let systemPrompt = template!.systemPromptTemplate

    // Add teaching style modifications
    if (request.teachingStyle) {
      const styleAddons = {
        academic: '\nUse formal academic language and rigorous standards.',
        practical: '\nFocus on practical applications and real-world examples.',
        conversational: '\nUse friendly, conversational tone while maintaining educational value.',
        professional: '\nMaintain professional standards suitable for workplace learning.'
      }
      systemPrompt += styleAddons[request.teachingStyle] || ''
    }

    // Add focus areas
    if (request.focusAreas && request.focusAreas.length > 0) {
      systemPrompt += `\n\nSpecial focus areas: ${request.focusAreas.join(', ')}.`
    }

    // Add assessment type guidance
    if (request.assessmentType) {
      const assessmentGuidance = {
        knowledge_recall: 'Focus on testing factual recall and basic understanding.',
        application: 'Focus on applying concepts to new situations and problems.',
        analysis: 'Focus on breaking down concepts and analyzing relationships.',
        synthesis: 'Focus on combining ideas and creating new understanding.'
      }
      systemPrompt += `\n\n${assessmentGuidance[request.assessmentType]}`
    }

    // Add language specifications
    if (request.quizLanguage && request.quizLanguage !== 'english') {
      const languageName = request.quizLanguage.charAt(0).toUpperCase() + request.quizLanguage.slice(1)
      systemPrompt += `\n\nCRITICAL: Generate ALL quiz content in ${languageName} language:
- Questions must be in ${languageName}
- Answer options must be in ${languageName}  
- Explanations must be in ${languageName}
- Use proper ${languageName} grammar and vocabulary
- Ensure questions are culturally appropriate for ${languageName} speakers
- If generating in Khmer, use proper Khmer script (ខ្មែរ)
- Always maintain the JSON structure regardless of language`
    }
    
    if (request.explanationLanguage && request.explanationLanguage !== request.quizLanguage) {
      systemPrompt += `\n\nExplanations should be provided in ${request.explanationLanguage}, while questions remain in ${request.quizLanguage || 'the primary language'}.`
    }
    
    if (request.includeTranslations) {
      systemPrompt += `\n\nInclude translations or clarifications in English (in parentheses) for key terms and concepts.`
    }

    // Add custom instructions
    if (request.customInstructions) {
      systemPrompt += `\n\nAdditional instructions: ${request.customInstructions}`
    }

    return systemPrompt
  }

  private buildPrompt(request: EnhancedQuizGenerationRequest): string {
    const subjectKey = request.subject.toLowerCase()
    const template = SUBJECT_TEMPLATES[subjectKey] || SUBJECT_TEMPLATES.custom
    
    // Start with base prompt
    let prompt = template!.promptTemplate
      .replace('{difficulty}', request.difficulty)
      .replace('{topic}', request.topic)

    prompt += ` with exactly ${request.questionCount} questions.`

    // Add question type requirements
    const questionTypes = request.questionTypes || template!.recommendedQuestionTypes
    if (request.questionDistribution) {
      const distribution = Object.entries(request.questionDistribution)
        .map(([type, count]) => `${count} ${type} questions`)
        .join(', ')
      prompt += `\n\nQuestion distribution: ${distribution}.`
    } else {
      prompt += `\n\nMix of question types: ${questionTypes.join(', ')}.`
    }

    // Add content requirements
    const requirements: string[] = [
      'Questions should be clear and educational',
      'Include detailed explanations for correct answers'
    ]

    if (request.includeExamples) {
      requirements.push('Include relevant examples in questions or explanations')
    }

    if (request.realWorldApplications) {
      requirements.push('Connect concepts to real-world applications where possible')
    }

    prompt += `\n\nRequirements:\n${requirements.map(req => `- ${req}`).join('\n')}`

    // Add complexity guidance
    if (request.complexityLevel) {
      const complexityGuidance = {
        basic: 'Keep concepts straightforward and foundational',
        intermediate: 'Include moderate complexity with some nuanced concepts',
        advanced: 'Include sophisticated concepts requiring deeper understanding',
        expert: 'Include expert-level concepts and complex reasoning'
      }
      prompt += `\n\nComplexity: ${complexityGuidance[request.complexityLevel]}.`
    }

    // Add JSON format specification
    const category = request.category || template!.defaultCategory
    const languageNote = request.quizLanguage && request.quizLanguage !== 'english' 
      ? `\n\nIMPORTANT: All text content (questions, options, explanations) should be in ${request.quizLanguage}, but the JSON structure and field names must remain in English.`
      : ''
    
    prompt += `${languageNote}

Return ONLY valid JSON in this exact format (no additional text, comments, or markdown):
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${category}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.questionCount * 2)},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation with reasoning"
    },
    {
      "question": "True or False: Statement here",
      "question_type": "true_false",
      "options": ["True", "False"],
      "correct_answer": 0,
      "explanation": "Explanation of why this is true/false"
    },
    {
      "question": "Fill in the blank: The capital of France is ____.",
      "question_type": "fill_blank",
      "options": [],
      "correct_answer_text": "Paris",
      "explanation": "Paris is the capital and largest city of France"
    },
    {
      "question": "Essay question: Explain the concept...",
      "question_type": "essay",
      "options": [],
      "correct_answer_text": "Sample answer or key points",
      "explanation": "Grading rubric or key concepts to cover"
    },
    {
      "question": "Match the items:",
      "question_type": "matching",
      "options": {
        "left": ["Item 1", "Item 2", "Item 3"],
        "right": ["Match A", "Match B", "Match C"]
      },
      "correct_answer_json": {"Item 1": "Match A", "Item 2": "Match B", "Item 3": "Match C"},
      "explanation": "Explanation of the correct matches"
    },
    {
      "question": "Put these events in chronological order:",
      "question_type": "ordering",
      "options": ["Event C", "Event A", "Event B"],
      "correct_answer_json": ["Event A", "Event B", "Event C"],
      "explanation": "Explanation of the correct order"
    }
  ]
}

QUESTION TYPE GUIDELINES:
- multiple_choice: 4 options (A,B,C,D), correct_answer is index (0,1,2,3) - ONLY ONE CORRECT ANSWER
- true_false: 2 options ["True", "False"], correct_answer is index (0 or 1)
- fill_blank: No options array, use correct_answer_text for the answer
- essay: No options, use correct_answer_text for sample answer/key points
- matching: options has "left" and "right" arrays, correct_answer_json maps left to right items
- ordering: options is shuffled array, correct_answer_json is correct order

Always include detailed explanations that help students learn from their answers.

CRITICAL REMINDERS:
1. Return ONLY the JSON object - no additional text, explanations, or markdown
2. Ensure all JSON syntax is correct (proper quotes, commas, brackets)
3. MANDATORY: "difficulty" field must be EXACTLY "${request.difficulty}" (one of: beginner, intermediate, advanced)
4. Use the exact difficulty value provided - do not translate or modify it
3. If generating in a non-English language, translate content but keep JSON field names in English
4. Test the JSON structure before returning to ensure it's valid
5. Include exactly ${request.questionCount} questions as requested`

    return prompt
  }

  async generateQuiz(request: EnhancedQuizGenerationRequest): Promise<{
    success: boolean
    quiz?: any
    error?: string
    promptUsed?: string
    systemPromptUsed?: string
  }> {
    try {
      const systemPrompt = this.buildSystemPrompt(request)
      const prompt = this.buildPrompt(request)

      logger.info('Generating enhanced quiz', {
        subject: request.subject,
        topic: request.topic,
        questionCount: request.questionCount,
        customPrompt: !!request.customSystemPrompt,
        teachingStyle: request.teachingStyle
      })

      const response = await this.aiService.generateContent({
        prompt,
        systemPrompt,
        maxTokens: 4096, // Increased for better quality
        temperature: 0.7
      })

      // Override model if using Gemini service
      if (this.aiService.constructor.name === 'GeminiAIService') {
        // Force use of the latest model
        (this.aiService as any).config.model = this.modelId
      }

      if (!response.success) {
        return { success: false, error: response.error }
      }

      // Clean and parse JSON response
      const cleanedContent = response.content!.replace(/```json|```/g, '').trim()
      
      // Additional logging for debugging
      logger.info('AI response received', {
        contentLength: response.content?.length || 0,
        cleanedLength: cleanedContent.length,
        startsWithBrace: cleanedContent.startsWith('{'),
        endsWithBrace: cleanedContent.endsWith('}'),
        language: request.quizLanguage || 'english'
      })
      
      // Check if response is empty or invalid
      if (!cleanedContent || cleanedContent.length < 10) {
        logger.error('Empty or too short AI response', { 
          content: cleanedContent,
          originalLength: response.content?.length 
        })
        return {
          success: false,
          error: 'AI returned empty response. Please try again with a different topic or language.',
          promptUsed: prompt,
          systemPromptUsed: systemPrompt
        }
      }
      
      try {
        const quiz = JSON.parse(cleanedContent)
        
        // Enhance quiz with improved category if not provided
        if (!quiz.category || quiz.category === 'General') {
          quiz.category = request.category || this.suggestCategoryFromSubject(request.subject, request.topic)
        }
        
        // Validate the generated quiz
        if (!quiz.questions || quiz.questions.length === 0) {
          throw new Error('Generated quiz has no questions')
        }

        logger.info('Enhanced quiz generated successfully', {
          subject: request.subject,
          topic: request.topic,
          questionsCount: quiz.questions.length,
          category: quiz.category,
          suggestedCategory: !request.category
        })

        return {
          success: true,
          quiz,
          promptUsed: prompt,
          systemPromptUsed: systemPrompt
        }
      } catch (parseError: any) {
        logger.error('Failed to parse enhanced quiz JSON', {
          error: parseError.message,
          cleanedContent: cleanedContent.substring(0, 200) + '...',
          language: request.quizLanguage || 'english',
          contentType: typeof cleanedContent,
          isEmptyObject: cleanedContent === '{}' || cleanedContent === '{}'
        })
        
        // Special handling for empty object response
        if (cleanedContent === '{}' || cleanedContent.trim() === '{}') {
          return {
            success: false,
            error: `AI returned empty object for ${request.quizLanguage || 'english'} language. This may be due to language complexity. Try with a simpler topic or different language.`,
            promptUsed: prompt,
            systemPromptUsed: systemPrompt
          }
        }
        
        return {
          success: false,
          error: `Failed to parse AI response: ${parseError.message}. The AI may have generated invalid JSON for this language.`,
          promptUsed: prompt,
          systemPromptUsed: systemPrompt
        }
      }
    } catch (error: any) {
      logger.error('Enhanced quiz generation failed:', error)
      return {
        success: false,
        error: error.message || 'Quiz generation failed'
      }
    }
  }

  // Utility method to get available subjects
  getAvailableSubjects(): string[] {
    return Object.keys(SUBJECT_TEMPLATES).filter(key => key !== 'custom')
  }

  // Utility method to get subject template info
  getSubjectTemplate(subject: string): SubjectTemplate | null {
    const subjectKey = subject.toLowerCase()
    return SUBJECT_TEMPLATES[subjectKey] || null
  }

  // Preview what prompts would be generated
  previewPrompts(request: EnhancedQuizGenerationRequest): {
    systemPrompt: string
    prompt: string
  } {
    return {
      systemPrompt: this.buildSystemPrompt(request),
      prompt: this.buildPrompt(request)
    }
  }
}

// Export default instance
export const enhancedQuizService = new EnhancedQuizGenerationService()
