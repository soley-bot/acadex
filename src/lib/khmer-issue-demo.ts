/**
 * Khmer Language Issue Demonstration
 * This file demonstrates the specific issues with Khmer language in AI quiz generation
 */

import { KhmerLanguageValidator, KhmerQuizTester, KhmerUtils } from './khmer-language-support'
import { logger } from './logger'

export interface KhmerIssueExample {
  description: string
  problematicText: string
  issues: string[]
  fixedText: string
  explanation: string
}

/**
 * Demonstration of common Khmer language issues in AI generation
 */
export class KhmerIssueDemo {
  
  /**
   * Demonstrate common Khmer language problems
   */
  static demonstrateCommonIssues(): KhmerIssueExample[] {
    return [
      {
        description: "Complex Consonant Clusters Breaking JSON",
        problematicText: 'ក្រុងភ្នំពេញ\\u17D2\\u1780\\u17C6',
        issues: [
          "Contains Unicode escape sequences that may be incorrectly generated",
          "Complex consonant clusters that some fonts can't render",
          "Backslashes that break JSON parsing"
        ],
        fixedText: 'ក្រុងភ្នំពេញ',
        explanation: "Simplified the complex cluster and removed problematic Unicode escapes"
      },
      
      {
        description: "Problematic Khmer Punctuation in JSON",
        problematicText: 'សំណួរ៖ តើអ្នកដឹងអំពីរឿងនេះទេ៖',
        issues: [
          "Contains Khmer colon (៖) that may interfere with JSON structure",
          "Special punctuation that AI models sometimes misinterpret"
        ],
        fixedText: 'សំណួរ: តើអ្នកដឹងអំពីរឿងនេះទេ?',
        explanation: "Replaced Khmer punctuation with safe alternatives"
      },
      
      {
        description: "Quote-like Characters Breaking JSON Strings",
        problematicText: 'គាត់បាននិយាយថា "នេះជាចម្លើយ"',
        issues: [
          "Contains quotes that may break JSON string parsing",
          "Ambiguous quote characters in AI generation"
        ],
        fixedText: 'គាត់បាននិយាយថា នេះជាចម្លើយ',
        explanation: "Removed problematic quotes and restructured sentence"
      },
      
      {
        description: "Complex Script Rendering Issues",
        problematicText: 'ព្រះរាជាណាចក្រកម្ពុជា',
        issues: [
          "Very long consonant cluster that may not render correctly",
          "Complex script that some systems can't handle",
          "May cause text overflow in UI components"
        ],
        fixedText: 'កម្ពុជា',
        explanation: "Simplified to more manageable Khmer text while maintaining meaning"
      },
      
      {
        description: "Unicode Normalization Problems",
        problematicText: 'ភាសាខ្មែរ', // This might have different Unicode normalization
        issues: [
          "May have inconsistent Unicode normalization (NFC vs NFD)",
          "Different byte sequences for same visual text",
          "Comparison and search problems"
        ],
        fixedText: 'ភាសាខ្មែរ'.normalize('NFC'),
        explanation: "Applied proper Unicode NFC normalization"
      }
    ]
  }
  
  /**
   * Test AI generation with problematic Khmer text
   */
  static async testProblematicGeneration(): Promise<{
    originalAttempt: any
    issues: string[]
    fixedAttempt: any
    improvements: string[]
  }> {
    
    const tester = new KhmerQuizTester()
    
    try {
      // Simulate problematic AI generation (this would normally come from AI)
      const problematicQuiz = {
        title: 'សំណួរ៖ គណិតវិទ្យា\\u17D2',
        description: 'គាត់បាននិយាយថា "នេះជាតេស្ត"',
        category: 'Mathematics',
        difficulty: 'beginner',
        questions: [
          {
            question: 'តើ ២ + ២ = ៖',
            question_type: 'multiple_choice',
            options: ['៣', '៤', '៥', '៦'],
            correct_answer: 1,
            explanation: 'ចម្លើយត្រឹមត្រូវគឺ "៤"'
          }
        ]
      }
      
      // Test the problematic version
      const originalValidation = KhmerLanguageValidator.validateJSON(JSON.stringify(problematicQuiz))
      const titleValidation = KhmerLanguageValidator.validateKhmerText(problematicQuiz.title)
      
      // Apply fixes
      const fixedQuiz = {
        ...problematicQuiz,
        title: KhmerLanguageValidator.sanitizeForAI(problematicQuiz.title),
        description: KhmerLanguageValidator.sanitizeForAI(problematicQuiz.description),
        questions: problematicQuiz.questions.map(q => ({
          ...q,
          question: KhmerLanguageValidator.sanitizeForAI(q.question),
          explanation: KhmerLanguageValidator.sanitizeForAI(q.explanation)
        }))
      }
      
      const fixedValidation = KhmerLanguageValidator.validateJSON(JSON.stringify(fixedQuiz))
      
      return {
        originalAttempt: problematicQuiz,
        issues: [
          ...(originalValidation.errors || []),
          ...titleValidation.issues
        ],
        fixedAttempt: fixedQuiz,
        improvements: [
          'Applied Unicode sanitization',
          'Normalized problematic punctuation',
          'Fixed JSON string compatibility',
          'Ensured proper character encoding'
        ]
      }
      
    } catch (error) {
      logger.error('Error in Khmer issue demonstration', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
  
  /**
   * Run comprehensive Khmer issue analysis
   */
  static async analyzeKhmerIssues(): Promise<{
    commonIssues: KhmerIssueExample[]
    testResults: any
    recommendations: string[]
  }> {
    
    logger.info('Starting comprehensive Khmer issue analysis')
    
    const commonIssues = this.demonstrateCommonIssues()
    const testResults = await this.testProblematicGeneration()
    
    const recommendations = [
      'Implement comprehensive Unicode validation before AI generation',
      'Use KhmerLanguageValidator.sanitizeForAI() for all Khmer text',
      'Apply NFC normalization to all generated Khmer content',
      'Test JSON parsing with Khmer content before saving to database',
      'Implement fallback mechanisms for complex consonant clusters',
      'Add Khmer font loading and rendering verification',
      'Create Khmer-specific prompts that avoid problematic character combinations',
      'Implement real-time Khmer text validation in admin interface',
      'Add cultural appropriateness checks for Khmer educational content',
      'Partner with Khmer language experts for content validation'
    ]
    
    logger.info('Khmer issue analysis completed', {
      issueCount: commonIssues.length,
      hasTestResults: !!testResults,
      recommendationCount: recommendations.length
    })
    
    return {
      commonIssues,
      testResults,
      recommendations
    }
  }
  
  /**
   * Quick demonstration of current system capabilities
   */
  static async demonstrateCurrentCapabilities(): Promise<{
    basicFunctionality: boolean
    validationWorks: boolean
    sanitizationWorks: boolean
    aiGenerationWorks: boolean
    issues: string[]
  }> {
    
    const issues: string[] = []
    
    // Test basic Khmer detection
    const basicTest = KhmerUtils.containsKhmer('ភាសាខ្មែរ')
    
    // Test validation
    const validationTest = KhmerLanguageValidator.validateKhmerText('សំណួរ: តើនេះធម្មតាទេ?')
    
    // Test sanitization
    const sanitizationTest = KhmerLanguageValidator.sanitizeForAI('សំណួរ៖ គាត់និយាយ "ហេតុអ្វី\\u1780"')
    
    // Test AI generation (quick test)
    const tester = new KhmerQuizTester()
    let aiGenerationWorks = false
    
    try {
      const quickResult = await tester.quickKhmerTest()
      aiGenerationWorks = quickResult.success
      if (!quickResult.success) {
        issues.push(`AI Generation: ${quickResult.message}`)
      }
    } catch (error) {
      issues.push(`AI Generation Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Collect any validation issues
    if (!validationTest.isValid) {
      issues.push(`Validation Issues: ${validationTest.issues.join(', ')}`)
    }
    
    return {
      basicFunctionality: basicTest,
      validationWorks: validationTest.isValid,
      sanitizationWorks: sanitizationTest !== 'សំណួរ៖ គាត់និយាយ "ហេតុអ្វី\\u1780"',
      aiGenerationWorks,
      issues
    }
  }
}

/**
 * Performance benchmarks for Khmer language processing
 */
export class KhmerPerformanceBenchmark {
  
  /**
   * Benchmark Khmer text processing performance
   */
  static async benchmarkKhmerProcessing(): Promise<{
    validationTime: number
    sanitizationTime: number
    jsonParsingTime: number
    averageProcessingTime: number
  }> {
    
    const sampleKhmerTexts = [
      'ភាសាខ្មែរជាភាសាមេរបស់ប្រទេសកម្ពុជា',
      'សំណួរ: តើអ្នកចូលចិត្តរៀនភាសាខ្មែរទេ?',
      'គណិតវិទ្យាជាមុខវិជ្ជាមួយដ៏សំខាន់',
      'ប្រវត្តិសាស្ត្រកម្ពុជាមានការអភិវឌ្ឍយូរលង់',
      'វិទ្យាសាស្ត្រនិងបច្ចេកវិទ្យាកំពុងរីកចម្រើន'
    ]
    
    // Benchmark validation
    const validationStart = performance.now()
    for (const text of sampleKhmerTexts) {
      KhmerLanguageValidator.validateKhmerText(text)
    }
    const validationTime = performance.now() - validationStart
    
    // Benchmark sanitization
    const sanitizationStart = performance.now()
    for (const text of sampleKhmerTexts) {
      KhmerLanguageValidator.sanitizeForAI(text)
    }
    const sanitizationTime = performance.now() - sanitizationStart
    
    // Benchmark JSON parsing
    const jsonParsingStart = performance.now()
    for (const text of sampleKhmerTexts) {
      const testQuiz = { title: text, questions: [{ question: text }] }
      KhmerLanguageValidator.validateJSON(JSON.stringify(testQuiz))
    }
    const jsonParsingTime = performance.now() - jsonParsingStart
    
    const averageProcessingTime = (validationTime + sanitizationTime + jsonParsingTime) / 3
    
    logger.info('Khmer processing benchmark completed', {
      validationTime: `${validationTime.toFixed(2)}ms`,
      sanitizationTime: `${sanitizationTime.toFixed(2)}ms`,
      jsonParsingTime: `${jsonParsingTime.toFixed(2)}ms`,
      averageProcessingTime: `${averageProcessingTime.toFixed(2)}ms`
    })
    
    return {
      validationTime,
      sanitizationTime,
      jsonParsingTime,
      averageProcessingTime
    }
  }
}

const KhmerIssueAnalysis = {
  KhmerIssueDemo,
  KhmerPerformanceBenchmark
}

export default KhmerIssueAnalysis
