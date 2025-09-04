/**
 * Khmer Language Support Testing and Validation System
 * Comprehensive testing framework for Khmer AI quiz generation
 */

import { logger } from './logger'
import { EnhancedQuizGenerationService, EnhancedQuizGenerationRequest } from './enhanced-ai-services'

export interface ValidationResult {
  isValid: boolean
  issues: string[]
  normalizedText: string
}

export interface KhmerTestCase {
  topic: string
  expectedContent: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
}

export interface TestResult {
  testCase: KhmerTestCase
  success: boolean
  issues?: string[]
  error?: string
  generatedQuiz?: any
}

export interface TestResults {
  results: TestResult[]
  overallSuccess: boolean
  statistics: {
    totalTests: number
    successCount: number
    failureCount: number
    jsonParseSuccessRate: number
    unicodeValidationRate: number
  }
}

/**
 * Khmer Language Validator
 * Handles validation and sanitization of Khmer text for AI generation
 */
export class KhmerLanguageValidator {
  
  /**
   * Validate Khmer Unicode text for JSON compatibility and proper encoding
   */
  static validateKhmerText(text: string): ValidationResult {
    const issues: string[] = []
    
    // Check for proper Unicode range (Khmer script U+1780-U+17FF)
    const khmerRange = /[\u1780-\u17FF]/g
    const hasKhmerChars = khmerRange.test(text)
    
    if (!hasKhmerChars && text.length > 0) {
      // Allow English/numbers but flag if expecting Khmer
      const hasOnlyAllowedChars = /^[a-zA-Z0-9\s.,!?()]+$/.test(text)
      if (!hasOnlyAllowedChars) {
        issues.push('Text contains characters outside expected Khmer or basic Latin ranges')
      }
    }
    
    // Check for JSON-breaking characters
    const jsonBreakers = /[\\\"]/g
    if (jsonBreakers.test(text)) {
      issues.push('Text contains unescaped quotes or backslashes that may break JSON parsing')
    }
    
    // Check for problematic Khmer punctuation
    const problematicChars = /[៖ៗ៘៙៚៛]/g
    if (problematicChars.test(text)) {
      issues.push('Text contains Khmer punctuation that may interfere with JSON structure')
    }
    
    // Validate consonant cluster complexity (more than 2 subscript consonants)
    const veryComplexClusters = /[\u1780-\u17B3][\u17D2][\u1780-\u17B3][\u17D2][\u1780-\u17B3]/g
    if (veryComplexClusters.test(text)) {
      issues.push('Text contains very complex consonant clusters that may cause rendering issues')
    }
    
    // Check for control characters
    const controlChars = /[\x00-\x1F\x7F]/g
    if (controlChars.test(text)) {
      issues.push('Text contains control characters that may break JSON parsing')
    }
    
    // Check for zero-width characters
    const zeroWidthChars = /[\u200B-\u200D\uFEFF]/g
    if (zeroWidthChars.test(text)) {
      issues.push('Text contains zero-width characters that may cause parsing issues')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      normalizedText: text.normalize('NFC')
    }
  }
  
  /**
   * Sanitize Khmer text for safe AI generation and JSON compatibility
   */
  static sanitizeForAI(text: string): string {
    return text
      .normalize('NFC')                    // Unicode normalization
      .replace(/[៖ៗ៘៙៚៛]/g, ' ')          // Remove problematic punctuation
      .replace(/\\/g, '/')                 // Replace backslashes
      .replace(/[""]/g, '"')               // Normalize quotes
      .replace(/['']/g, "'")               // Normalize apostrophes
      .replace(/[\x00-\x1F\x7F]/g, ' ')    // Remove control characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .trim()
  }
  
  /**
   * Validate JSON structure while preserving Khmer content
   */
  static validateJSON(jsonString: string): { success: boolean; errors?: string[]; parsed?: any } {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Additional validation for quiz structure
      const errors: string[] = []
      
      if (!parsed.title || typeof parsed.title !== 'string') {
        errors.push('Quiz title is missing or invalid')
      }
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        errors.push('Quiz questions array is missing or invalid')
      }
      
      if (parsed.questions) {
        parsed.questions.forEach((q: any, index: number) => {
          if (!q.question || typeof q.question !== 'string') {
            errors.push(`Question ${index + 1}: question text is missing or invalid`)
          }
          
          if (!q.question_type || typeof q.question_type !== 'string') {
            errors.push(`Question ${index + 1}: question_type is missing or invalid`)
          }
          
          // Validate Khmer content in each question
          if (q.question) {
            const validation = this.validateKhmerText(q.question)
            if (!validation.isValid) {
              errors.push(`Question ${index + 1}: ${validation.issues.join(', ')}`)
            }
          }
        })
      }
      
      return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        parsed
      }
      
    } catch (error) {
      return {
        success: false,
        errors: [`JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`]
      }
    }
  }
}

/**
 * Comprehensive Khmer Quiz Testing System
 */
export class KhmerQuizTester {
  private aiService: EnhancedQuizGenerationService
  
  constructor() {
    this.aiService = new EnhancedQuizGenerationService()
  }
  
  /**
   * Run comprehensive Khmer language tests
   */
  async testKhmerGeneration(): Promise<TestResults> {
    const testCases: KhmerTestCase[] = [
      {
        topic: 'វិទ្យាសាស្ត្រ',  // Science
        expectedContent: ['រូបវិទ្យា', 'គីមីវិទ្យា', 'ជីវវិទ្យា'],
        difficulty: 'beginner',
        category: 'Science'
      },
      {
        topic: 'ប្រវត្តិសាស្ត្រ',  // History  
        expectedContent: ['អង្គរ', 'រាជវង្ស', 'សម័យ'],
        difficulty: 'intermediate',
        category: 'History'
      },
      {
        topic: 'គណិតវិទ្យា',  // Mathematics
        expectedContent: ['បូក', 'ដក', 'គុណ', 'ចែក'],
        difficulty: 'beginner',
        category: 'Mathematics'
      },
      {
        topic: 'ភាសាខ្មែរ',  // Khmer Language
        expectedContent: ['អក្សរ', 'ពាក្យ', 'ប្រយោគ'],
        difficulty: 'intermediate',
        category: 'Language'
      },
      {
        topic: 'ភូមិសាស្ត្រ',  // Geography
        expectedContent: ['ផែនទី', 'ទន្លេ', 'ភ្នំ'],
        difficulty: 'beginner',
        category: 'Geography'
      }
    ]
    
    const results: TestResult[] = []
    let jsonParseSuccesses = 0
    let unicodeValidationSuccesses = 0
    
    logger.info('Starting comprehensive Khmer quiz generation tests', { 
      totalTestCases: testCases.length 
    })
    
    for (const testCase of testCases) {
      try {
        logger.info('Testing Khmer quiz generation', { topic: testCase.topic })
        
        // Generate quiz in Khmer
        const quiz = await this.generateKhmerQuiz(testCase)
        
        // Validate JSON structure
        const jsonTest = KhmerLanguageValidator.validateJSON(JSON.stringify(quiz))
        if (jsonTest.success) {
          jsonParseSuccesses++
        }
        
        // Validate Khmer content in title and questions
        const titleValidation = KhmerLanguageValidator.validateKhmerText(quiz.title || '')
        const questionValidations = (quiz.questions || []).map((q: any, index: number) => ({
          index,
          validation: KhmerLanguageValidator.validateKhmerText(q.question || '')
        }))
        
        const allKhmerValid = titleValidation.isValid && 
          questionValidations.every((qv: { index: number; validation: { isValid: boolean } }) => qv.validation.isValid)
        
        if (allKhmerValid) {
          unicodeValidationSuccesses++
        }
        
        // Validate educational appropriateness
        const contentTest = this.validateEducationalContent(quiz, testCase)
        
        // Collect all issues
        const allIssues = [
          ...(jsonTest.errors || []),
          ...titleValidation.issues,
          ...questionValidations.flatMap((qv: { index: number; validation: { issues: string[] } }) => qv.validation.issues.map(issue => 
            `Question ${qv.index + 1}: ${issue}`
          )),
          ...(contentTest.issues || [])
        ]
        
        const overallSuccess = jsonTest.success && allKhmerValid && contentTest.appropriate
        
        results.push({
          testCase,
          success: overallSuccess,
          issues: allIssues.length > 0 ? allIssues : undefined,
          generatedQuiz: quiz
        })
        
        logger.info('Khmer test completed', { 
          topic: testCase.topic, 
          success: overallSuccess,
          issueCount: allIssues.length
        })
        
      } catch (error) {
        logger.error('Khmer test failed with error', { 
          topic: testCase.topic, 
          error: error instanceof Error ? error.message : String(error)
        })
        
        results.push({
          testCase,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    const statistics = {
      totalTests: testCases.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      jsonParseSuccessRate: (jsonParseSuccesses / testCases.length) * 100,
      unicodeValidationRate: (unicodeValidationSuccesses / testCases.length) * 100
    }
    
    logger.info('Khmer testing completed', statistics)
    
    return { 
      results, 
      overallSuccess: results.every(r => r.success),
      statistics
    }
  }
  
  /**
   * Generate a Khmer quiz using the AI service
   */
  private async generateKhmerQuiz(testCase: KhmerTestCase): Promise<any> {
    const request: EnhancedQuizGenerationRequest = {
      topic: testCase.topic,
      questionCount: 5,
      difficulty: testCase.difficulty,
      subject: testCase.category,
      quizLanguage: 'khmer',
      questionTypes: ['multiple_choice', 'true_false'],
      teachingStyle: 'academic',
      includeExamples: true,
      realWorldApplications: true
    }
    
    const result = await this.aiService.generateQuiz(request)
    
    if (!result.success || !result.quiz) {
      throw new Error(result.error || 'Failed to generate quiz')
    }
    
    return result.quiz
  }
  
  /**
   * Validate educational content quality and cultural appropriateness
   */
  private validateEducationalContent(quiz: any, testCase: KhmerTestCase): { 
    appropriate: boolean; 
    issues?: string[] 
  } {
    const issues: string[] = []
    
    // Check if quiz contains expected content themes
    const quizText = JSON.stringify(quiz).toLowerCase()
    const foundExpectedContent = testCase.expectedContent.some(content => 
      quizText.includes(content.toLowerCase())
    )
    
    if (!foundExpectedContent) {
      issues.push(`Quiz does not contain expected content themes: ${testCase.expectedContent.join(', ')}`)
    }
    
    // Check question count
    if (!quiz.questions || quiz.questions.length !== 5) {
      issues.push('Quiz does not contain the requested number of questions (5)')
    }
    
    // Check for cultural appropriateness (basic checks)
    const culturallyInappropriate = ['western', 'english', 'american', 'european']
    const hasInappropriateContent = culturallyInappropriate.some(term => 
      quizText.includes(term)
    )
    
    if (hasInappropriateContent) {
      issues.push('Quiz may contain culturally inappropriate content for Khmer context')
    }
    
    return {
      appropriate: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    }
  }
  
  /**
   * Quick test for basic Khmer functionality
   */
  async quickKhmerTest(): Promise<{ success: boolean; message: string }> {
    try {
      const simpleTest = await this.generateKhmerQuiz({
        topic: 'គណិតវិទ្យា',
        expectedContent: ['បូក'],
        difficulty: 'beginner',
        category: 'Mathematics'
      })
      
      const validation = KhmerLanguageValidator.validateJSON(JSON.stringify(simpleTest))
      
      if (validation.success) {
        return {
          success: true,
          message: 'Khmer quiz generation is working properly'
        }
      } else {
        return {
          success: false,
          message: `Khmer quiz generation has issues: ${validation.errors?.join(', ')}`
        }
      }
      
    } catch (error) {
      return {
        success: false,
        message: `Khmer quiz generation failed: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }
}

/**
 * Utility functions for Khmer language support
 */
export class KhmerUtils {
  
  /**
   * Check if text contains Khmer characters
   */
  static containsKhmer(text: string): boolean {
    return /[\u1780-\u17FF]/.test(text)
  }
  
  /**
   * Get Khmer character count (accounting for complex clusters)
   */
  static getKhmerCharacterCount(text: string): number {
    // This is a simplified count - in reality, Khmer character counting is complex
    return text.replace(/[^\u1780-\u17FF]/g, '').length
  }
  
  /**
   * Detect if text is primarily in Khmer script
   */
  static isPrimarilyKhmer(text: string): boolean {
    const khmerChars = (text.match(/[\u1780-\u17FF]/g) || []).length
    const totalChars = text.replace(/\s/g, '').length
    
    return totalChars > 0 && (khmerChars / totalChars) > 0.7
  }
  
  /**
   * Format Khmer text for display (basic formatting)
   */
  static formatForDisplay(text: string): string {
    return text
      .normalize('NFC')
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
  }
}

const KhmerLanguageSupport = {
  KhmerLanguageValidator,
  KhmerQuizTester,
  KhmerUtils
}

export default KhmerLanguageSupport
