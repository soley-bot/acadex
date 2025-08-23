import { logger } from './logger'
import { BaseAIService, AIServiceFactory } from './ai-services'
import { getRecommendedModel, getModelConfig, MODEL_RECOMMENDATIONS } from './ai-model-config'
import { contentReviewService, ContentReviewResult } from './content-review-system'
import { supabase } from './supabase'

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

// Subject templates removed - now using flexible subject system
// All subjects are supported through free-text input with unified prompt generation

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
    // Simply use the subject as category, with some cleanup
    const cleanSubject = subject.trim()
    
    // Capitalize first letter and return
    return cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1).toLowerCase()
  }

  private buildSystemPrompt(request: EnhancedQuizGenerationRequest): string {
    // Use custom system prompt if provided
    if (request.customSystemPrompt) {
      return request.customSystemPrompt
    }

    // Use flexible base template that works for any subject
    let systemPrompt = `You are an expert educator creating educational assessments for ${request.subject}.
Focus on clear, educational questions that test understanding and application.
Ensure questions are appropriate for the specified difficulty level and culturally relevant.
Create content that helps students learn and reinforces key concepts.`

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
    // Simple, flexible prompt that works for any subject
    let prompt = `Generate ${request.difficulty} level ${request.subject} questions about "${request.topic}" with exactly ${request.questionCount} questions.`

    // Add question type requirements
    const questionTypes = request.questionTypes || ['multiple_choice', 'true_false']
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

    // Add JSON format specification with enhanced safety for non-English content
    const category = request.category || request.subject
    const languageNote = request.quizLanguage && request.quizLanguage !== 'english' 
      ? `\n\nIMPORTANT: All text content (questions, options, explanations) should be in ${request.quizLanguage}, but the JSON structure and field names must remain in English.`
      : ''
    
    // Add database-specific character constraints
    const characterRules = this.buildCharacterConstraints(request.quizLanguage)
    
    prompt += `${languageNote}${characterRules}

CRITICAL JSON REQUIREMENTS:
1. Return ONLY valid JSON - no additional text, comments, or markdown
2. Use double quotes for all strings - never single quotes
3. Do not escape quotes unless actually needed within string content
4. Ensure all braces and brackets are properly closed
5. No trailing commas in arrays or objects

SIMPLE JSON STRUCTURE REQUIRED:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${category}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.questionCount * 2)},
  "questions": [
    ${this.buildQuestionExamples(request)}
  ]
}

VALIDATION CHECKLIST:
1. Valid JSON syntax (proper quotes, commas, brackets)
2. "difficulty" field must be EXACTLY "${request.difficulty}"
3. Include exactly ${request.questionCount} questions
4. All questions have proper question_type field
5. All multiple_choice questions have correct_answer as number (0-3)
6. All explanations are educational and help students learn

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
5. If generating in a non-English language, translate content but keep JSON field names in English
6. Test the JSON structure before returning to ensure it's valid
7. Include exactly ${request.questionCount} questions as requested`

    return prompt
  }

  // Build database-specific character constraints for AI generation
  private buildCharacterConstraints(language?: string): string {
    let rules = `

DATABASE CHARACTER CONSTRAINTS:
- Title: Max 255 characters, no special JSON characters (unescaped quotes, backslashes)
- Description: Max 5000 characters recommended for performance
- Questions: Max 2000 characters each for readability
- Options: Max 500 characters each option
- Explanations: Max 1500 characters for detailed but concise explanations

PROHIBITED CHARACTERS IN JSON:
- Unescaped double quotes (") - use single quotes for contractions or abbreviations
- Unescaped backslashes (\\) - avoid file paths or technical notation
- Line breaks within strings - use spaces or periods instead
- Tab characters - use regular spaces
- Control characters (ASCII 0-31) - use standard punctuation

CONTENT GUIDELINES:
- Use proper punctuation: periods, commas, colons, semicolons
- Use em dashes (—) instead of double hyphens (--)
- Use single quotes for contractions: "don't", "can't", "won't"
- Use standard quotation marks for quoted text: 'He said, "Hello"'
- Avoid complex mathematical symbols - spell out or use Unicode equivalents
- Use standard apostrophes (') not curly quotes (')
`

    // Language-specific character handling
    if (language) {
      switch (language.toLowerCase()) {
        case 'indonesian':
        case 'bahasa':
          rules += `
INDONESIAN LANGUAGE SPECIFIC:
- Use standard Indonesian punctuation
- Avoid complex diacritical marks that might cause encoding issues
- Use standard Indonesian medical/scientific terminology
- Keep sentences clear and educational
- Use "dan" instead of "&" symbol
- Spell out numbers when appropriate: "lima" instead of "5" in explanations
`
          break
        
        case 'spanish':
        case 'español':
          rules += `
SPANISH LANGUAGE SPECIFIC:
- Use standard Spanish punctuation including ¿ and ¡
- Acceptable accented characters: á, é, í, ó, ú, ñ
- Use "y" instead of "&" symbol
- Maintain proper Spanish grammar rules
`
          break
        
        case 'french':
        case 'français':
          rules += `
FRENCH LANGUAGE SPECIFIC:
- Acceptable accented characters: à, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ, ç
- Use proper French punctuation spacing
- Use "et" instead of "&" symbol
- Maintain proper French grammar rules
`
          break
        
        case 'arabic':
        case 'العربية':
          rules += `
ARABIC LANGUAGE SPECIFIC:
- Use proper Arabic script (right-to-left)
- Ensure proper Arabic punctuation
- Avoid mixing Arabic and Latin characters in same sentence
- Use Arabic numerals where appropriate
`
          break

        default:
          rules += `
GENERAL NON-ENGLISH GUIDELINES:
- Use Unicode characters appropriately for the language
- Maintain consistent character encoding
- Avoid mixing scripts unless educationally necessary
- Use proper punctuation for the target language
`
      }
    }

    return rules
  }

  // Build specific question examples based on requested types
  private buildQuestionExamples(request: EnhancedQuizGenerationRequest): string {
    const questionTypes = request.questionTypes || ['multiple_choice', 'true_false']
    const examples: string[] = []

    // Only show examples for the question types actually being requested
    if (questionTypes.includes('multiple_choice')) {
      examples.push(`    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation with reasoning"
    }`)
    }

    if (questionTypes.includes('true_false')) {
      examples.push(`    {
      "question": "True or False: Statement here",
      "question_type": "true_false",
      "options": ["True", "False"],
      "correct_answer": 0,
      "explanation": "Explanation of why this is true/false"
    }`)
    }

    if (questionTypes.includes('fill_blank')) {
      examples.push(`    {
      "question": "Fill in the blank: The capital of France is ____.",
      "question_type": "fill_blank",
      "options": [],
      "correct_answer_text": "Paris",
      "explanation": "Paris is the capital and largest city of France"
    }`)
    }

    if (questionTypes.includes('essay')) {
      examples.push(`    {
      "question": "Essay question: Explain the concept...",
      "question_type": "essay",
      "options": [],
      "correct_answer_text": "Sample answer or key points",
      "explanation": "Grading rubric or key concepts to cover"
    }`)
    }

    // Default to multiple choice if no specific types requested
    if (examples.length === 0) {
      examples.push(`    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation with reasoning"
    }`)
    }

    // Show only first 2 examples to keep prompt concise
    return examples.slice(0, 2).join(',\n') + '\n    // ... additional questions following same pattern'
  }

  async generateQuiz(request: EnhancedQuizGenerationRequest): Promise<{
    success: boolean
    quiz?: any
    error?: string
    promptUsed?: string
    systemPromptUsed?: string
    reviewResult?: ContentReviewResult
  }> {
    try {
      const systemPrompt = this.buildSystemPrompt(request)
      const prompt = this.buildPrompt(request)

      logger.info('Generating enhanced quiz with content review', {
        subject: request.subject,
        topic: request.topic,
        questionCount: request.questionCount,
        language: request.quizLanguage || 'english'
      })

      // First attempt at generation
      let attempts = 0
      const maxAttempts = 3
      let bestResult: any = null
      let lastError = ''

      while (attempts < maxAttempts) {
        attempts++
        
        logger.info(`Quiz generation attempt ${attempts}/${maxAttempts}`)

        const response = await this.aiService.generateContent({
          prompt: attempts > 1 ? this.buildStrictPrompt(request, lastError) : prompt,
          systemPrompt: attempts > 1 ? this.buildStrictSystemPrompt(request) : systemPrompt,
          maxTokens: 4096,
          temperature: attempts > 1 ? 0.3 : 0.7 // Lower temperature for retry attempts
        })

        if (!response.success) {
          lastError = response.error || 'AI service failed'
          logger.warn(`Attempt ${attempts} failed: ${lastError}`)
          continue
        }

        // Clean the response
        let cleanedContent = response.content!.replace(/```json|```/g, '').trim()
        
        if (!cleanedContent || cleanedContent.length < 50) {
          lastError = 'AI returned empty or too short response'
          logger.warn(`Attempt ${attempts} failed: ${lastError}`)
          continue
        }

        // Content Review Pipeline
        logger.info('Starting content review pipeline')
        const reviewResult = await contentReviewService.reviewQuizContent(cleanedContent, request)

        if (reviewResult.isValid || reviewResult.confidence >= 70) {
          // Use corrected content if available, otherwise use original
          const finalContent = reviewResult.correctedContent || cleanedContent

          try {
            const quiz = JSON.parse(finalContent)
            
            // Enhance quiz with improved category if needed
            if (!quiz.category || quiz.category === 'General') {
              quiz.category = request.category || this.suggestCategoryFromSubject(request.subject, request.topic)
            }

            logger.info('Quiz generation successful', {
              attempts,
              confidence: reviewResult.confidence,
              issuesFound: reviewResult.issues.length,
              questionsCount: quiz.questions?.length || 0
            })

            // Store content review result in database
            await this.storeContentReview(request, reviewResult, quiz)

            return {
              success: true,
              quiz,
              promptUsed: prompt,
              systemPromptUsed: systemPrompt,
              reviewResult
            }

          } catch (parseError: any) {
            lastError = `JSON parsing failed: ${parseError.message}`
            logger.warn(`Attempt ${attempts} JSON parse failed: ${lastError}`)
            continue
          }
        } else {
          // Content review failed
          lastError = `Content review failed (confidence: ${reviewResult.confidence}%). Issues: ${reviewResult.issues.map(i => i.message).join(', ')}`
          logger.warn(`Attempt ${attempts} content review failed`, {
            confidence: reviewResult.confidence,
            issues: reviewResult.issues.length,
            criticalIssues: reviewResult.issues.filter(i => i.severity === 'critical').length
          })
          
          // Store failed review for analytics (only on last attempt to avoid spam)
          if (attempts === maxAttempts) {
            await this.storeContentReview(request, reviewResult, cleanedContent)
          }
          
          bestResult = { reviewResult, content: cleanedContent }
        }
      }

      // All attempts failed
      logger.error('All quiz generation attempts failed', {
        attempts: maxAttempts,
        lastError,
        bestConfidence: bestResult?.reviewResult?.confidence || 0
      })

      return {
        success: false,
        error: `Failed to generate valid quiz after ${maxAttempts} attempts. Last error: ${lastError}. ${bestResult ? `Best confidence: ${bestResult.reviewResult.confidence}%` : ''}`,
        promptUsed: prompt,
        systemPromptUsed: systemPrompt,
        reviewResult: bestResult?.reviewResult
      }

    } catch (error: any) {
      logger.error('Enhanced quiz generation failed:', error)
      return {
        success: false,
        error: error.message || 'Quiz generation failed'
      }
    }
  }

  // Store content review result in database
  private async storeContentReview(
    request: EnhancedQuizGenerationRequest,
    result: ContentReviewResult,
    generatedContent: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_reviews')
        .insert({
          content_type: 'quiz',
          title: `Quiz: ${request.subject} (${request.questionCount} questions)`,
          subject: request.subject,
          difficulty: request.difficulty,
          raw_ai_response: JSON.stringify(generatedContent),
          review_status: result.isValid ? 'approved' : 'pending',
          ai_confidence_score: result.confidence / 100, // Convert to decimal (0.00 to 1.00)
          validation_issues: result.issues,
          corrected_content: result.correctedContent ? JSON.stringify(result.correctedContent) : null,
          auto_corrected: !!result.correctedContent,
          ai_model: 'gemini-2.0-flash-exp',
          language: request.quizLanguage || 'english',
          estimated_review_time: Math.max(5, Math.ceil(request.questionCount * 0.5 + (result.issues?.length || 0) * 2))
        })

      if (error) {
        logger.error('Failed to store content review:', error)
      } else {
        logger.info('Content review stored successfully', {
          subject: request.subject,
          status: result.isValid ? 'approved' : 'pending',
          confidence: result.confidence
        })
      }
    } catch (error: any) {
      logger.error('Error storing content review:', error)
    }
  }

  // Build strict system prompt for retry attempts
  private buildStrictSystemPrompt(request: EnhancedQuizGenerationRequest): string {
    return `You are an expert educator creating educational assessments for ${request.subject}.

CRITICAL JSON GENERATION RULES:
1. Return ONLY valid JSON - no explanations, comments, or markdown
2. Use only double quotes (") for strings - never single quotes
3. Do not escape quotes unless absolutely necessary within content
4. Ensure all braces { } and brackets [ ] are properly matched
5. No trailing commas in arrays or objects
6. Test your JSON structure before responding

CONTENT QUALITY REQUIREMENTS:
- Educational and accurate content
- Clear, unambiguous questions
- Detailed explanations that help students learn
- Appropriate for ${request.difficulty} difficulty level
- Culturally appropriate and inclusive

${request.quizLanguage && request.quizLanguage !== 'english' ? 
  `LANGUAGE REQUIREMENT: All content must be in ${request.quizLanguage}` : ''}

Focus on creating valid JSON that will parse correctly while maintaining educational value.`
  }

  // Build strict prompt for retry attempts
  private buildStrictPrompt(request: EnhancedQuizGenerationRequest, previousError: string): string {
    const category = request.category || request.subject
    
    return `PREVIOUS ATTEMPT FAILED: ${previousError}

Create a ${request.difficulty} level ${request.subject} quiz about "${request.topic}" with exactly ${request.questionCount} questions.

MANDATORY JSON STRUCTURE - NO DEVIATIONS ALLOWED:
{
  "title": "Quiz: ${request.topic}",
  "description": "Brief description here",
  "category": "${category}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.questionCount * 2)},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation here"
    }
  ]
}

ABSOLUTE REQUIREMENTS:
1. Return ONLY the JSON object above
2. Exactly ${request.questionCount} questions in the array
3. All questions must follow the structure shown
4. "difficulty" must be exactly "${request.difficulty}"
5. No markdown, no explanations, no additional text
6. Validate JSON syntax before responding

${request.questionTypes ? 
  `Question types to include: ${request.questionTypes.join(', ')}` : 
  'Use multiple_choice and true_false question types'}

CONTENT RULES:
- Keep questions under 500 characters
- Keep explanations under 300 characters  
- Use simple punctuation only
- Avoid special characters that break JSON
- Ensure educational accuracy

Return the JSON now:`
  }

  // Return common subject suggestions (but allow any subject)
  getAvailableSubjects(): string[] {
    return [
      'Science',
      'Mathematics', 
      'History',
      'English Language',
      'Programming',
      'Literature',
      'Art',
      'Geography',
      'Economics',
      'Psychology'
    ]
  }

  // Old JSON cleaning methods removed - now using Content Review System for validation and correction

  // Legacy method - now returns null since we use flexible subjects
  getSubjectTemplate(subject: string): SubjectTemplate | null {
    return null
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
