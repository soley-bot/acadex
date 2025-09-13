/**
 * IELTS Quality Matrix Helper Functions
 * Utilities to determine when to apply IELTS quality validation
 */

export interface QualityMatrixSuggestion {
  shouldApply: boolean
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Suggests whether to apply IELTS Quality Matrix based on quiz parameters
 */
export function suggestIELTSQuality(params: {
  subject?: string
  topic?: string
  category?: string
  language?: string
}): QualityMatrixSuggestion {
  const { subject = '', topic = '', category = '', language = '' } = params
  
  // Combine all text for analysis
  const allText = `${subject} ${topic} ${category} ${language}`.toLowerCase()
  
  // High confidence indicators
  const highConfidenceKeywords = [
    'ielts',
    'english language',
    'english proficiency',
    'academic english',
    'english test',
    'language assessment'
  ]
  
  const hasHighConfidence = highConfidenceKeywords.some(keyword => 
    allText.includes(keyword)
  )
  
  if (hasHighConfidence) {
    return {
      shouldApply: true,
      confidence: 'high',
      reason: 'Content appears to be IELTS or English proficiency related'
    }
  }
  
  // Medium confidence indicators
  const mediumConfidenceKeywords = [
    'english',
    'esl',
    'efl', 
    'language learning',
    'writing skills',
    'reading comprehension',
    'listening skills',
    'speaking practice'
  ]
  
  const hasMediumConfidence = mediumConfidenceKeywords.some(keyword =>
    allText.includes(keyword)
  )
  
  if (hasMediumConfidence) {
    return {
      shouldApply: true,
      confidence: 'medium', 
      reason: 'Content appears to be English language learning related'
    }
  }
  
  // Check for English language setting
  if (language?.toLowerCase() === 'english' && 
      (subject?.toLowerCase().includes('language') || 
       topic?.toLowerCase().includes('grammar') ||
       topic?.toLowerCase().includes('vocabulary'))) {
    return {
      shouldApply: true,
      confidence: 'medium',
      reason: 'English language content with language-focused topics'
    }
  }
  
  // Low confidence - general English content
  if (allText.includes('english') || language?.toLowerCase() === 'english') {
    return {
      shouldApply: false, // Don't suggest by default for general English
      confidence: 'low',
      reason: 'General English content - IELTS quality may not be necessary'
    }
  }
  
  // Default: don't apply
  return {
    shouldApply: false,
    confidence: 'high',
    reason: 'Content does not appear to be IELTS or English proficiency related'
  }
}

/**
 * Get user-friendly description of what IELTS Quality Matrix does
 */
export function getIELTSQualityDescription(): string {
  return `The IELTS Quality Matrix applies examiner-level standards to ensure questions meet professional English language assessment criteria. It checks for:

• Clarity & Accuracy: Grammar and clear explanations
• IELTS Relevance: Academic vocabulary and test-appropriate language  
• Examiner Standards: Authentic question formats and difficulty alignment
• Vocabulary Quality: Sophisticated academic language
• Grammar Structures: Complex sentences that impress examiners
• Educational Value: Explanations that teach the "why" behind answers

Use this for IELTS preparation, English proficiency tests, and academic English content.`
}

/**
 * Subject categories that typically benefit from IELTS quality checking
 */
export const IELTS_RELEVANT_SUBJECTS = [
  'IELTS',
  'English Language',
  'English Proficiency', 
  'Academic English',
  'English Test Preparation',
  'ESL',
  'EFL',
  'Language Assessment',
  'English Grammar',
  'English Vocabulary',
  'English Reading',
  'English Writing',
  'English Listening',
  'English Speaking'
]

/**
 * Get list of subjects that typically use IELTS quality validation
 */
export function getIELTSRelevantSubjects(): string[] {
  return IELTS_RELEVANT_SUBJECTS
}

/**
 * Check if subject is in the pre-defined IELTS-relevant list
 */
export function isIELTSRelevantSubject(subject: string): boolean {
  return IELTS_RELEVANT_SUBJECTS.some(relevant => 
    subject.toLowerCase().includes(relevant.toLowerCase()) ||
    relevant.toLowerCase().includes(subject.toLowerCase())
  )
}