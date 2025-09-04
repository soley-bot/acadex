/**
 * Enhanced validation for mixed-language content (English + Khmer)
 * Specifically designed for quiz explanations that contain both languages
 */

import { logger } from './logger'

export interface MixedLanguageValidationResult {
  isValid: boolean
  issues: string[]
  normalizedText: string
  languageBreakdown: {
    khmerPercentage: number
    englishPercentage: number
    numbersPercentage: number
    punctuationPercentage: number
  }
  recommendations: string[]
}

export class MixedLanguageValidator {
  
  /**
   * Validates mixed English-Khmer text commonly found in quiz explanations
   */
  static validateMixedContent(text: string): MixedLanguageValidationResult {
    const issues: string[] = []
    const recommendations: string[] = []
    
    if (!text || text.trim() === '') {
      return {
        isValid: true,
        issues: [],
        normalizedText: '',
        languageBreakdown: {
          khmerPercentage: 0,
          englishPercentage: 0,
          numbersPercentage: 0,
          punctuationPercentage: 0
        },
        recommendations: []
      }
    }
    
    // Normalize Unicode to prevent inconsistencies
    const normalizedText = text.normalize('NFC')
    
    // Character type analysis
    const analysis = this.analyzeCharacterTypes(normalizedText)
    
    // JSON safety checks
    this.validateJSONSafety(normalizedText, issues)
    
    // Mixed content validation
    this.validateMixedLanguageStructure(normalizedText, analysis, issues, recommendations)
    
    // Specific problematic patterns for mixed content
    this.validateMixedContentPatterns(normalizedText, issues, recommendations)
    
    return {
      isValid: issues.length === 0,
      issues,
      normalizedText,
      languageBreakdown: analysis.percentages,
      recommendations
    }
  }
  
  /**
   * Analyzes character types in the text
   */
  private static analyzeCharacterTypes(text: string) {
    const totalChars = text.length
    let khmerChars = 0
    let englishChars = 0
    let numberChars = 0
    let punctuationChars = 0
    let otherChars = 0
    
    for (const char of text) {
      const code = char.charCodeAt(0)
      
      if (code >= 0x1780 && code <= 0x17FF) {
        // Khmer Unicode range
        khmerChars++
      } else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) {
        // English letters
        englishChars++
      } else if (code >= 0x30 && code <= 0x39) {
        // Numbers
        numberChars++
      } else if ([0x20, 0x21, 0x22, 0x28, 0x29, 0x2C, 0x2E, 0x3A, 0x3B, 0x3F].includes(code)) {
        // Common punctuation
        punctuationChars++
      } else {
        otherChars++
      }
    }
    
    return {
      counts: { khmerChars, englishChars, numberChars, punctuationChars, otherChars },
      percentages: {
        khmerPercentage: Math.round((khmerChars / totalChars) * 100),
        englishPercentage: Math.round((englishChars / totalChars) * 100),
        numbersPercentage: Math.round((numberChars / totalChars) * 100),
        punctuationPercentage: Math.round((punctuationChars / totalChars) * 100)
      }
    }
  }
  
  /**
   * Validates JSON safety for mixed content
   */
  private static validateJSONSafety(text: string, issues: string[]) {
    // Check for unescaped quotes that break JSON
    const unescapedQuotes = /(?<!\\)"/g
    if (unescapedQuotes.test(text)) {
      issues.push('Contains unescaped double quotes that will break JSON parsing')
    }
    
    // Check for unescaped backslashes
    const unescapedBackslashes = /\\(?!["\\/bfnrt])/g
    if (unescapedBackslashes.test(text)) {
      issues.push('Contains unescaped backslashes that may break JSON parsing')
    }
    
    // Check for control characters
    const controlChars = /[\x00-\x1F\x7F]/g
    if (controlChars.test(text)) {
      issues.push('Contains control characters that will break JSON parsing')
    }
    
    // Check for problematic Unicode sequences
    const problematicUnicode = /[\uFEFF\u200B-\u200D]/g
    if (problematicUnicode.test(text)) {
      issues.push('Contains zero-width or BOM characters that may cause parsing issues')
    }
  }
  
  /**
   * Validates the structure of mixed language content
   */
  private static validateMixedLanguageStructure(
    text: string, 
    analysis: any, 
    issues: string[], 
    recommendations: string[]
  ) {
    const { khmerPercentage, englishPercentage } = analysis.percentages
    
    // Check if it's actually mixed content
    if (khmerPercentage > 0 && englishPercentage > 0) {
      // Good mixed content
      if (khmerPercentage < 10) {
        recommendations.push('Consider adding more Khmer content for better language balance')
      }
      if (englishPercentage < 10) {
        recommendations.push('Consider adding more English content for clarity')
      }
    } else if (khmerPercentage === 0 && englishPercentage > 80) {
      recommendations.push('This appears to be English-only content - consider adding Khmer explanations')
    } else if (englishPercentage === 0 && khmerPercentage > 80) {
      recommendations.push('This appears to be Khmer-only content - consider adding English clarifications')
    }
    
    // Check for reasonable length
    if (text.length > 2000) {
      issues.push('Text is very long and may cause database or display issues')
    }
    
    if (text.length < 10 && (khmerPercentage > 0 || englishPercentage > 0)) {
      recommendations.push('Explanation seems very short - consider providing more detail')
    }
  }
  
  /**
   * Validates specific patterns that cause issues in mixed content
   */
  private static validateMixedContentPatterns(text: string, issues: string[], recommendations: string[]) {
    // Check for problematic quote patterns in mixed content
    const problematicQuotes = /"[^"]*[\u1780-\u17FF][^"]*"/g
    if (problematicQuotes.test(text)) {
      issues.push('Khmer text inside quotes may cause JSON parsing issues')
      recommendations.push('Use single quotes or escape double quotes around Khmer text')
    }
    
    // Check for complex punctuation mixing
    const mixedPunctuation = /[\u1780-\u17FF][.!?]+[a-zA-Z]|[a-zA-Z][៖។]+[\u1780-\u17FF]/g
    if (mixedPunctuation.test(text)) {
      recommendations.push('Consider using consistent punctuation within each language section')
    }
    
    // Check for number format consistency
    const mixedNumbers = /\d+[\u1780-\u17FF]|[\u1780-\u17FF]\d+/g
    if (mixedNumbers.test(text)) {
      recommendations.push('Consider using consistent number format (Arabic numerals or Khmer numerals)')
    }
    
    // Check for very complex Khmer clusters in mixed content
    const complexClusters = /[\u1780-\u17B3][\u17D2]{2,}/g
    if (complexClusters.test(text)) {
      issues.push('Contains very complex Khmer consonant clusters that may render poorly in mixed content')
    }
  }
  
  /**
   * Sanitizes mixed content for safe JSON storage
   */
  static sanitizeMixedContent(text: string): string {
    if (!text) return text
    
    let sanitized = text.normalize('NFC')
    
    // Escape quotes
    sanitized = sanitized.replace(/"/g, '\\"')
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
    
    // Remove zero-width characters
    sanitized = sanitized.replace(/[\uFEFF\u200B-\u200D]/g, '')
    
    // Normalize spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
    
    return sanitized
  }
  
  /**
   * Tests if mixed content will safely parse as JSON
   */
  static testJSONCompatibility(text: string): { success: boolean; error?: string } {
    try {
      const testObject = { explanation: text }
      const jsonString = JSON.stringify(testObject)
      const parsed = JSON.parse(jsonString)
      
      if (parsed.explanation !== text) {
        return { success: false, error: 'Text was modified during JSON round-trip' }
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'JSON parsing failed' 
      }
    }
  }
  
  /**
   * Creates a validation report for mixed language content
   */
  static createValidationReport(text: string): {
    validation: MixedLanguageValidationResult
    jsonTest: { success: boolean; error?: string }
    sanitizedText: string
    summary: string
  } {
    const validation = this.validateMixedContent(text)
    const jsonTest = this.testJSONCompatibility(text)
    const sanitizedText = this.sanitizeMixedContent(text)
    
    const { khmerPercentage, englishPercentage } = validation.languageBreakdown
    
    let summary = `Mixed content analysis: ${khmerPercentage}% Khmer, ${englishPercentage}% English. `
    
    if (validation.isValid && jsonTest.success) {
      summary += 'Content is safe for quiz explanations.'
    } else {
      summary += `Issues found: ${validation.issues.length} validation, JSON test ${jsonTest.success ? 'passed' : 'failed'}.`
    }
    
    return {
      validation,
      jsonTest,
      sanitizedText,
      summary
    }
  }
}

export default MixedLanguageValidator
