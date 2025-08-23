import { logger } from './logger'
import { BaseAIService, AIServiceFactory } from './ai-services'

// Content Review and Validation Pipeline
export interface ContentReviewResult {
  isValid: boolean
  issues: ValidationIssue[]
  correctedContent?: string
  recommendations?: string[]
  confidence: number // 0-100
}

export interface ValidationIssue {
  type: 'json_syntax' | 'content_quality' | 'structure' | 'data_integrity' | 'language'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  location?: string
  suggestedFix?: string
}

export class ContentReviewService {
  private aiService: BaseAIService

  constructor(aiService?: BaseAIService) {
    this.aiService = aiService || AIServiceFactory.getDefaultService()
    logger.info('Content Review Service initialized')
  }

  // Main content review pipeline
  async reviewQuizContent(content: string, request: any): Promise<ContentReviewResult> {
    logger.info('Starting content review pipeline', {
      contentLength: content.length,
      language: request.quizLanguage || 'english'
    })

    const result: ContentReviewResult = {
      isValid: false,
      issues: [],
      recommendations: [],
      confidence: 0
    }

    try {
      // Step 1: Basic JSON Structure Validation
      const jsonValidation = this.validateJSONStructure(content)
      result.issues.push(...jsonValidation.issues)

      // Step 2: Content Quality Review
      const qualityReview = await this.reviewContentQuality(content, request)
      result.issues.push(...qualityReview.issues)

      // Step 3: Educational Standards Check
      const educationalReview = this.validateEducationalStandards(content, request)
      result.issues.push(...educationalReview.issues)

      // Step 4: Language and Cultural Appropriateness
      const languageReview = this.validateLanguageQuality(content, request)
      result.issues.push(...languageReview.issues)

      // Determine if content is valid
      const criticalIssues = result.issues.filter(i => i.severity === 'critical')
      const highIssues = result.issues.filter(i => i.severity === 'high')

      result.isValid = criticalIssues.length === 0 && highIssues.length <= 1
      result.confidence = this.calculateConfidenceScore(result.issues)

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result.issues, request)

      // If fixable, attempt auto-correction
      if (!result.isValid && this.isFixable(result.issues)) {
        const corrected = await this.attemptAutoCorrection(content, result.issues, request)
        if (corrected) {
          result.correctedContent = corrected
        }
      }

      logger.info('Content review completed', {
        isValid: result.isValid,
        issuesCount: result.issues.length,
        confidence: result.confidence,
        hasCorrectedContent: !!result.correctedContent
      })

      return result

    } catch (error: any) {
      logger.error('Content review failed', { error: error.message })
      result.issues.push({
        type: 'structure',
        severity: 'critical',
        message: `Content review system error: ${error.message}`
      })
      return result
    }
  }

  // Validate JSON structure and syntax
  private validateJSONStructure(content: string): { issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = []

    try {
      // Clean the content first
      let cleanContent = content.trim()
      cleanContent = cleanContent.replace(/```json|```/g, '').trim()

      // Check for basic structure
      if (!cleanContent.startsWith('{') || !cleanContent.endsWith('}')) {
        issues.push({
          type: 'json_syntax',
          severity: 'critical',
          message: 'Content must be a valid JSON object starting with { and ending with }',
          suggestedFix: 'Ensure the AI response contains only a JSON object'
        })
        return { issues }
      }

      // Check for common JSON syntax issues
      if (cleanContent.includes('\\"\\') || cleanContent.includes('\\\\\\')) {
        issues.push({
          type: 'json_syntax',
          severity: 'high',
          message: 'Double-escaped characters detected (\\\\, \\")',
          suggestedFix: 'Use single quotes or avoid escaping in content'
        })
      }

      // Check for unterminated strings
      if (this.hasUnterminatedStrings(cleanContent)) {
        issues.push({
          type: 'json_syntax',
          severity: 'critical',
          message: 'Unterminated string literals detected',
          suggestedFix: 'Ensure all quoted strings are properly closed'
        })
      }

      // Try to parse JSON
      const parsed = JSON.parse(cleanContent)

      // Validate required fields
      const requiredFields = ['title', 'description', 'category', 'difficulty', 'duration_minutes', 'questions']
      for (const field of requiredFields) {
        if (!parsed[field]) {
          issues.push({
            type: 'structure',
            severity: 'critical',
            message: `Required field '${field}' is missing`,
            location: `root.${field}`
          })
        }
      }

      // Validate questions array
      if (parsed.questions && Array.isArray(parsed.questions)) {
        if (parsed.questions.length === 0) {
          issues.push({
            type: 'structure',
            severity: 'critical',
            message: 'Questions array is empty'
          })
        }

        // Validate each question
        parsed.questions.forEach((question: any, index: number) => {
          const questionIssues = this.validateQuestionStructure(question, index)
          issues.push(...questionIssues)
        })
      }

    } catch (parseError: any) {
      issues.push({
        type: 'json_syntax',
        severity: 'critical',
        message: `JSON parsing failed: ${parseError.message}`,
        location: this.extractErrorLocation(parseError.message),
        suggestedFix: 'Fix JSON syntax errors before proceeding'
      })
    }

    return { issues }
  }

  // Validate individual question structure
  private validateQuestionStructure(question: any, index: number): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const location = `questions[${index}]`

    const requiredFields = ['question', 'question_type', 'explanation']
    for (const field of requiredFields) {
      if (!question[field] || (typeof question[field] === 'string' && question[field].trim() === '')) {
        issues.push({
          type: 'structure',
          severity: 'high',
          message: `Question ${index + 1} missing required field: ${field}`,
          location: `${location}.${field}`
        })
      }
    }

    // Validate question type specific requirements
    if (question.question_type === 'multiple_choice') {
      if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
        issues.push({
          type: 'structure',
          severity: 'high',
          message: `Question ${index + 1} multiple_choice must have exactly 4 options`,
          location: `${location}.options`
        })
      }

      if (typeof question.correct_answer !== 'number' || question.correct_answer < 0 || question.correct_answer > 3) {
        issues.push({
          type: 'structure',
          severity: 'high',
          message: `Question ${index + 1} correct_answer must be a number 0-3`,
          location: `${location}.correct_answer`
        })
      }
    }

    // Check for content length limits
    if (question.question && question.question.length > 2000) {
      issues.push({
        type: 'data_integrity',
        severity: 'medium',
        message: `Question ${index + 1} text exceeds 2000 character limit`,
        location: `${location}.question`
      })
    }

    return issues
  }

  // AI-powered content quality review
  private async reviewContentQuality(content: string, request: any): Promise<{ issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = []

    try {
      const reviewPrompt = `Review this educational quiz content for quality and appropriateness.

QUIZ CONTENT TO REVIEW:
${content.substring(0, 2000)}...

REVIEW CRITERIA:
1. Educational value and accuracy
2. Appropriate difficulty level for "${request.difficulty}"
3. Clear and unambiguous questions
4. Correct and helpful explanations
5. Cultural sensitivity and inclusivity
6. Language quality (${request.quizLanguage || 'english'})

Respond with a JSON object containing your assessment:
{
  "overallQuality": "excellent|good|fair|poor",
  "issues": [
    {
      "type": "content_quality",
      "severity": "low|medium|high|critical",
      "message": "Description of the issue",
      "questionIndex": 0
    }
  ],
  "strengths": ["List of positive aspects"],
  "recommendations": ["Specific improvement suggestions"]
}`

      const response = await this.aiService.generateContent({
        prompt: reviewPrompt,
        systemPrompt: 'You are an expert educational content reviewer. Provide constructive feedback on quiz quality.',
        maxTokens: 1000,
        temperature: 0.3
      })

      if (response.success && response.content) {
        try {
          const review = JSON.parse(response.content.replace(/```json|```/g, '').trim())
          if (review.issues && Array.isArray(review.issues)) {
            issues.push(...review.issues)
          }
        } catch (parseError) {
          logger.warn('Failed to parse content quality review', { error: parseError })
        }
      }

    } catch (error: any) {
      logger.error('Content quality review failed', { error: error.message })
    }

    return { issues }
  }

  // Validate educational standards
  private validateEducationalStandards(content: string, request: any): { issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = []

    try {
      const parsed = JSON.parse(content.replace(/```json|```/g, '').trim())

      // Check question count matches request
      if (parsed.questions && parsed.questions.length !== request.questionCount) {
        issues.push({
          type: 'data_integrity',
          severity: 'high',
          message: `Expected ${request.questionCount} questions, got ${parsed.questions.length}`,
          suggestedFix: 'Adjust question count to match request'
        })
      }

      // Check difficulty consistency
      if (parsed.difficulty !== request.difficulty) {
        issues.push({
          type: 'data_integrity',
          severity: 'medium',
          message: `Difficulty mismatch: expected "${request.difficulty}", got "${parsed.difficulty}"`,
          suggestedFix: 'Ensure difficulty field matches request exactly'
        })
      }

      // Validate explanations quality
      if (parsed.questions) {
        const questionsWithoutExplanations = parsed.questions.filter((q: any, i: number) => 
          !q.explanation || q.explanation.trim().length < 10
        )

        if (questionsWithoutExplanations.length > 0) {
          issues.push({
            type: 'content_quality',
            severity: 'medium',
            message: `${questionsWithoutExplanations.length} questions have insufficient explanations`,
            suggestedFix: 'Provide detailed explanations for all questions'
          })
        }
      }

    } catch (parseError) {
      // Already handled in JSON validation
    }

    return { issues }
  }

  // Validate language quality and appropriateness
  private validateLanguageQuality(content: string, request: any): { issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = []

    // Check for language consistency
    if (request.quizLanguage && request.quizLanguage !== 'english') {
      // Basic checks for non-English content
      if (content.includes('"True"') || content.includes('"False"')) {
        issues.push({
          type: 'language',
          severity: 'medium',
          message: `Content contains English terms ("True"/"False") when ${request.quizLanguage} was requested`,
          suggestedFix: `Translate all content to ${request.quizLanguage}`
        })
      }
    }

    // Check for problematic characters that cause JSON issues
    const problematicChars = /[^\x20-\x7E\u00A0-\uFFFF]/g
    if (problematicChars.test(content)) {
      issues.push({
        type: 'language',
        severity: 'low',
        message: 'Content contains potentially problematic Unicode characters',
        suggestedFix: 'Use standard Unicode characters for the target language'
      })
    }

    return { issues }
  }

  // Calculate confidence score based on issues
  private calculateConfidenceScore(issues: ValidationIssue[]): number {
    let score = 100

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 25; break
        case 'high': score -= 15; break
        case 'medium': score -= 8; break
        case 'low': score -= 3; break
      }
    }

    return Math.max(0, score)
  }

  // Generate recommendations based on issues
  private generateRecommendations(issues: ValidationIssue[], request: any): string[] {
    const recommendations: string[] = []

    const criticalIssues = issues.filter(i => i.severity === 'critical')
    const jsonIssues = issues.filter(i => i.type === 'json_syntax')
    const languageIssues = issues.filter(i => i.type === 'language')

    if (criticalIssues.length > 0) {
      recommendations.push('Address critical issues before using this content')
    }

    if (jsonIssues.length > 0) {
      recommendations.push('Improve JSON generation instructions to prevent syntax errors')
    }

    if (languageIssues.length > 0 && request.quizLanguage !== 'english') {
      recommendations.push(`Ensure all content is properly translated to ${request.quizLanguage}`)
    }

    recommendations.push('Consider using stricter AI prompts to prevent common issues')

    return recommendations
  }

  // Check if issues are auto-fixable
  private isFixable(issues: ValidationIssue[]): boolean {
    const unfixableTypes = ['content_quality', 'language']
    return !issues.some(issue => 
      issue.severity === 'critical' && unfixableTypes.includes(issue.type)
    )
  }

  // Attempt automatic correction
  private async attemptAutoCorrection(
    content: string, 
    issues: ValidationIssue[], 
    request: any
  ): Promise<string | null> {
    try {
      const correctionPrompt = `Fix the following quiz JSON content based on the identified issues:

ORIGINAL CONTENT:
${content}

ISSUES TO FIX:
${issues.map(issue => `- ${issue.severity.toUpperCase()}: ${issue.message}`).join('\n')}

REQUIREMENTS:
1. Return ONLY valid JSON - no explanations or markdown
2. Maintain educational quality and accuracy
3. Ensure exactly ${request.questionCount} questions
4. Use "${request.difficulty}" as difficulty level
5. Fix all JSON syntax errors
6. Preserve the educational intent of the original content

Return the corrected JSON only:`

      const response = await this.aiService.generateContent({
        prompt: correctionPrompt,
        systemPrompt: 'You are a JSON correction specialist. Fix only the technical issues while preserving educational content.',
        maxTokens: 4096,
        temperature: 0.1
      })

      if (response.success && response.content) {
        const corrected = response.content.replace(/```json|```/g, '').trim()
        
        // Validate the correction
        try {
          JSON.parse(corrected)
          logger.info('Auto-correction successful')
          return corrected
        } catch (parseError) {
          logger.warn('Auto-correction produced invalid JSON', { error: parseError })
        }
      }

    } catch (error: any) {
      logger.error('Auto-correction failed', { error: error.message })
    }

    return null
  }

  // Helper methods
  private hasUnterminatedStrings(content: string): boolean {
    let inString = false
    let escaped = false

    for (let i = 0; i < content.length; i++) {
      const char = content[i]

      if (escaped) {
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        continue
      }

      if (char === '"') {
        inString = !inString
      }
    }

    return inString
  }

  private extractErrorLocation(errorMessage: string): string | undefined {
    const positionMatch = errorMessage.match(/position (\d+)/)
    return positionMatch ? `character ${positionMatch[1]}` : undefined
  }
}

// Export singleton instance
export const contentReviewService = new ContentReviewService()
