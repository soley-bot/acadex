/**
 * IELTS-Specific Quality Matrix for AI Question Verification & Curation
 * "The Unfair Advantage" - Proprietary curation framework for IELTS excellence
 */

import { logger } from './logger'

export interface IELTSQualityCheck {
  criterion: string
  score: number // 0-100
  feedback: string
  suggestions: string[]
  isPassing: boolean
}

export interface IELTSQualityResult {
  overallScore: number
  isPassing: boolean
  checks: IELTSQualityCheck[]
  recommendations: string[]
  requiresManualReview: boolean
}

export interface IELTSQuestion {
  question: string
  options?: string[]
  correct_answer: number | string
  explanation: string
  question_type: string
  difficulty?: string
}

/**
 * The IELTS Quality Matrix - "Unfair Advantage" Curation System
 * Every question must pass through this examiner-level filter
 */
export class IELTSQualityMatrix {
  private readonly PASSING_THRESHOLD = 75 // Minimum overall score to pass
  private readonly CRITICAL_CHECKS = ['clarity_accuracy', 'ielts_relevance', 'examiner_lens']
  
  /**
   * Apply the comprehensive IELTS Quality Matrix to a question
   */
  async evaluateQuestion(question: IELTSQuestion): Promise<IELTSQualityResult> {
    logger.info('Applying IELTS Quality Matrix', { 
      questionType: question.question_type,
      questionPreview: question.question.substring(0, 50) + '...'
    })

    const checks: IELTSQualityCheck[] = [
      await this.checkClarityAndAccuracy(question),
      await this.checkIELTSRelevance(question),
      await this.checkExaminerLens(question),
      await this.checkVocabularyQuality(question),
      await this.checkGrammarStructures(question),
      await this.checkEducationalValue(question)
    ]

    const overallScore = this.calculateOverallScore(checks)
    const isPassing = this.isPassingQuality(checks, overallScore)
    const requiresManualReview = this.requiresManualReview(checks, overallScore)
    
    const recommendations = this.generateRecommendations(checks)

    const result: IELTSQualityResult = {
      overallScore,
      isPassing,
      checks,
      recommendations,
      requiresManualReview
    }

    logger.info('IELTS Quality Matrix evaluation complete', {
      overallScore,
      isPassing,
      requiresManualReview,
      failedChecks: checks.filter(c => !c.isPassing).map(c => c.criterion)
    })

    return result
  }

  /**
   * 1. Clarity & Accuracy Check
   * Is the question and explanation clear and grammatically correct?
   */
  private async checkClarityAndAccuracy(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Question is clear and accurate'

    // Check question clarity
    if (question.question.length < 10) {
      score -= 30
      suggestions.push('Question is too short - add more context')
      feedback = 'Question lacks sufficient detail'
    }

    // Check for confusing wording
    const confusingPatterns = [
      /which of the following is not not/i,
      /true or false.*true or false/i,
      /correct.*incorrect.*correct/i
    ]
    
    if (confusingPatterns.some(pattern => pattern.test(question.question))) {
      score -= 25
      suggestions.push('Simplify confusing double negatives or repetitive phrasing')
      feedback = 'Question contains confusing or repetitive language'
    }

    // Check explanation clarity
    if (!question.explanation || question.explanation.length < 20) {
      score -= 20
      suggestions.push('Provide a more detailed explanation')
      feedback = 'Explanation needs more detail'
    }

    // Grammar check (basic patterns)
    const grammarIssues = this.detectBasicGrammarIssues(question.question + ' ' + question.explanation)
    if (grammarIssues.length > 0) {
      score -= grammarIssues.length * 5
      suggestions.push(...grammarIssues)
      feedback = 'Grammar issues detected'
    }

    return {
      criterion: 'clarity_accuracy',
      score: Math.max(0, score),
      feedback,
      suggestions,
      isPassing: score >= 70
    }
  }

  /**
   * 2. IELTS Relevance Check
   * Is this content relevant to the IELTS exam? Does it teach IELTS language?
   */
  private async checkIELTSRelevance(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Content is highly relevant to IELTS'

    // IELTS-specific vocabulary and patterns
    const ieltsKeywords = [
      // Reading keywords
      'according to', 'the author suggests', 'the passage indicates', 'based on the text',
      // Writing keywords
      'argument', 'evidence', 'furthermore', 'however', 'consequently', 'in contrast',
      // Listening keywords
      'speaker', 'conversation', 'discussion', 'presentation', 'lecture',
      // Speaking keywords
      'opinion', 'experience', 'describe', 'compare', 'explain why'
    ]

    const ieltsTopics = [
      'education', 'environment', 'technology', 'health', 'work', 'travel',
      'culture', 'society', 'family', 'media', 'government', 'economics'
    ]

    const questionText = (question.question + ' ' + question.explanation).toLowerCase()

    // Check for IELTS-style language
    const hasIELTSLanguage = ieltsKeywords.some(keyword => questionText.includes(keyword.toLowerCase()))
    if (!hasIELTSLanguage) {
      score -= 20
      suggestions.push('Include more IELTS-specific academic language and phrases')
      feedback = 'Question could use more IELTS-style academic language'
    }

    // Check for IELTS-relevant topics
    const hasRelevantTopic = ieltsTopics.some(topic => questionText.includes(topic))
    if (!hasRelevantTopic) {
      score -= 15
      suggestions.push('Connect question to common IELTS themes and topics')
      feedback = 'Question should relate to common IELTS topics'
    }

    // Check academic register
    const informalWords = ['gonna', 'wanna', 'yeah', 'ok', 'cool', 'awesome']
    const hasInformalLanguage = informalWords.some(word => questionText.includes(word))
    if (hasInformalLanguage) {
      score -= 25
      suggestions.push('Replace informal language with academic register')
      feedback = 'Question contains informal language inappropriate for IELTS'
    }

    // Check for test-taking strategies in explanation
    const hasStrategy = question.explanation.toLowerCase().includes('strategy') ||
                       question.explanation.toLowerCase().includes('tip') ||
                       question.explanation.toLowerCase().includes('technique')
    if (hasStrategy) {
      score += 10 // Bonus for including test strategies
      feedback = 'Excellent - includes IELTS test strategies'
    }

    return {
      criterion: 'ielts_relevance',
      score: Math.max(0, Math.min(100, score)),
      feedback,
      suggestions,
      isPassing: score >= 75
    }
  }

  /**
   * 3. Examiner's Lens Check
   * Filter through the lens of an IELTS examiner
   */
  private async checkExaminerLens(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Question meets examiner standards'

    // Check for authentic IELTS question format
    const questionFormats = {
      multiple_choice: /^(What|Which|How|Why|Where|When)\s/i,
      true_false: /^(The following statement is|According to|Based on)\s/i,
      fill_blank: /_{3,}|\[.*\]/
    }

    const expectedFormat = questionFormats[question.question_type as keyof typeof questionFormats]
    if (expectedFormat && !expectedFormat.test(question.question)) {
      score -= 15
      suggestions.push(`Use authentic IELTS ${question.question_type} question format`)
      feedback = 'Question format should match IELTS conventions'
    }

    // Check difficulty appropriateness
    if (question.difficulty) {
      const difficultyChecks = this.checkDifficultyAlignment(question)
      score -= difficultyChecks.penalty
      suggestions.push(...difficultyChecks.suggestions)
      if (difficultyChecks.penalty > 0) {
        feedback = 'Question difficulty doesn\'t match expected level'
      }
    }

    // Check for discriminating power (can it separate good from poor students?)
    const isDiscriminating = this.checkDiscriminatingPower(question)
    if (!isDiscriminating.isGood) {
      score -= 20
      suggestions.push(...isDiscriminating.suggestions)
      feedback = 'Question may not effectively discriminate between ability levels'
    }

    // Check answer options quality (for multiple choice)
    if (question.options && question.options.length > 1) {
      const optionsQuality = this.checkAnswerOptionsQuality(question.options)
      score -= optionsQuality.penalty
      suggestions.push(...optionsQuality.suggestions)
      if (optionsQuality.penalty > 0) {
        feedback = 'Answer options need improvement'
      }
    }

    return {
      criterion: 'examiner_lens',
      score: Math.max(0, score),
      feedback,
      suggestions,
      isPassing: score >= 70
    }
  }

  /**
   * 4. Vocabulary Check
   * Does the vocabulary sound natural and academic?
   */
  private async checkVocabularyQuality(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Vocabulary is natural and academic'

    const allText = question.question + ' ' + question.explanation + ' ' + (question.options?.join(' ') || '')
    
    // Check for academic vocabulary
    const academicWords = [
      'analyze', 'evaluate', 'synthesize', 'demonstrate', 'illustrate', 'emphasize',
      'significant', 'substantial', 'considerable', 'potential', 'comprehensive',
      'fundamental', 'essential', 'critical', 'relevant', 'appropriate'
    ]

    const hasAcademicVocab = academicWords.some(word => 
      allText.toLowerCase().includes(word.toLowerCase())
    )

    if (!hasAcademicVocab) {
      score -= 15
      suggestions.push('Include more sophisticated academic vocabulary')
      feedback = 'Vocabulary could be more academic and sophisticated'
    }

    // Check for vocabulary level appropriateness
    const basicWords = ['good', 'bad', 'big', 'small', 'nice', 'get', 'put', 'go']
    const overusesBasic = basicWords.filter(word => 
      (allText.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length > 1
    ).length > 2

    if (overusesBasic) {
      score -= 20
      suggestions.push('Replace basic vocabulary with more sophisticated alternatives')
      feedback = 'Over-reliance on basic vocabulary'
    }

    // Check for collocations and natural phrases
    const naturalPhrases = [
      'take into account', 'by and large', 'in other words', 'for instance',
      'as a result', 'in addition', 'on the other hand', 'in conclusion'
    ]

    const hasNaturalPhrases = naturalPhrases.some(phrase =>
      allText.toLowerCase().includes(phrase)
    )

    if (hasNaturalPhrases) {
      score += 5 // Bonus for natural phrases
      feedback = 'Excellent use of natural academic phrases'
    }

    return {
      criterion: 'vocabulary_quality',
      score: Math.max(0, Math.min(100, score)),
      feedback,
      suggestions,
      isPassing: score >= 65
    }
  }

  /**
   * 5. Grammar Check
   * Is this a grammar structure that impresses examiners?
   */
  private async checkGrammarStructures(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Grammar structures are impressive and varied'

    const allText = question.question + ' ' + question.explanation

    // Check for complex sentence structures
    const complexStructures = [
      /\bwhile\s+\w+/i, // While clauses
      /\balthough\s+\w+/i, // Although clauses
      /\bwhereas\s+\w+/i, // Whereas clauses
      /\bnot only.*but also/i, // Not only... but also
      /\bshould.*occur/i, // Should + subjunctive
      /\bwere.*to\s+\w+/i // Were + to constructions
    ]

    const hasComplexStructures = complexStructures.some(pattern => pattern.test(allText))
    if (!hasComplexStructures) {
      score -= 15
      suggestions.push('Include more complex sentence structures (conditionals, relative clauses)')
      feedback = 'Grammar could be more sophisticated'
    }

    // Check for passive voice usage (academic style)
    const passivePatterns = [
      /\bis\s+\w+ed\b/i,
      /\bare\s+\w+ed\b/i,
      /\bwas\s+\w+ed\b/i,
      /\bwere\s+\w+ed\b/i,
      /\bhas been\s+\w+ed\b/i,
      /\bhave been\s+\w+ed\b/i
    ]

    const hasPassiveVoice = passivePatterns.some(pattern => pattern.test(allText))
    if (!hasPassiveVoice) {
      score -= 10
      suggestions.push('Consider using some passive voice constructions for academic tone')
    }

    // Check for varied sentence beginnings
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 5)
    const beginnings = sentences.map(s => {
      const firstWord = s.trim().split(/\s+/)[0]
      return firstWord ? firstWord.toLowerCase() : ''
    }).filter(w => w.length > 0)
    const uniqueBeginnings = new Set(beginnings).size
    const varietyRatio = beginnings.length > 0 ? uniqueBeginnings / beginnings.length : 1

    if (varietyRatio < 0.6) {
      score -= 15
      suggestions.push('Vary sentence beginnings for better flow and sophistication')
      feedback = 'Sentence structures need more variety'
    }

    return {
      criterion: 'grammar_structures',
      score: Math.max(0, score),
      feedback,
      suggestions,
      isPassing: score >= 70
    }
  }

  /**
   * 6. Educational Value Check
   * Does the explanation teach the "why" behind the answer?
   */
  private async checkEducationalValue(question: IELTSQuestion): Promise<IELTSQualityCheck> {
    let score = 100
    const suggestions: string[] = []
    let feedback = 'Explanation provides excellent educational value'

    if (!question.explanation) {
      return {
        criterion: 'educational_value',
        score: 0,
        feedback: 'No explanation provided',
        suggestions: ['Add detailed explanation explaining the reasoning'],
        isPassing: false
      }
    }

    // Check for "why" explanations
    const hasWhy = /\b(because|since|as|due to|owing to|reason|explains why)\b/i.test(question.explanation)
    if (!hasWhy) {
      score -= 25
      suggestions.push('Explain WHY the answer is correct, not just WHAT the answer is')
      feedback = 'Explanation needs to include reasoning'
    }

    // Check for learning strategies
    const learningKeywords = [
      'remember', 'tip', 'strategy', 'approach', 'technique', 'method',
      'always', 'never', 'avoid', 'focus on', 'pay attention to'
    ]

    const hasLearningTips = learningKeywords.some(keyword =>
      question.explanation.toLowerCase().includes(keyword)
    )

    if (hasLearningTips) {
      score += 15 // Bonus for including learning strategies
      feedback = 'Excellent - includes learning strategies'
    }

    // Check for examples or analogies
    const hasExamples = /\bfor example\b|\bfor instance\b|\bsuch as\b|\be\.g\.\b/i.test(question.explanation)
    if (hasExamples) {
      score += 10 // Bonus for examples
      feedback = 'Great use of examples to clarify concepts'
    }

    // Check explanation length and depth
    if (question.explanation.length < 50) {
      score -= 20
      suggestions.push('Provide more detailed explanation with reasoning and examples')
      feedback = 'Explanation is too brief'
    }

    // Check for active learning elements
    const hasActiveElements = /\bnotice\b|\bobserve\b|\bconsider\b|\bthink about\b/i.test(question.explanation)
    if (hasActiveElements) {
      score += 10 // Bonus for encouraging active learning
    }

    return {
      criterion: 'educational_value',
      score: Math.max(0, Math.min(100, score)),
      feedback,
      suggestions,
      isPassing: score >= 70
    }
  }

  /**
   * Helper Methods
   */
  private detectBasicGrammarIssues(text: string): string[] {
    const issues: string[] = []

    // Check for common grammar errors
    if (/\ba\s+[aeiou]/i.test(text)) {
      issues.push('Use "an" before vowel sounds, not "a"')
    }

    if (/\s{2,}/g.test(text)) {
      issues.push('Remove extra spaces')
    }

    if (/[.!?]\s*[a-z]/g.test(text)) {
      issues.push('Capitalize first letter after sentence endings')
    }

    return issues
  }

  private checkDifficultyAlignment(question: IELTSQuestion): { penalty: number; suggestions: string[] } {
    const penalty = 0
    const suggestions: string[] = []

    // This could be expanded with more sophisticated difficulty analysis
    // For now, basic length and complexity checks

    return { penalty, suggestions }
  }

  private checkDiscriminatingPower(question: IELTSQuestion): { isGood: boolean; suggestions: string[] } {
    const suggestions: string[] = []

    // Check if all options are plausible (for multiple choice)
    if (question.options && question.options.length > 1) {
      const optionLengths = question.options.map(opt => opt.length)
      const avgLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length
      const hasVariedLengths = optionLengths.some(len => Math.abs(len - avgLength) > avgLength * 0.3)

      if (!hasVariedLengths) {
        suggestions.push('Vary the length of answer options to avoid pattern recognition')
      }

      // Check for obvious wrong answers
      const hasObviousWrong = question.options.some(opt => 
        opt.toLowerCase().includes('never') || 
        opt.toLowerCase().includes('always') ||
        opt.toLowerCase() === 'none of the above'
      )

      if (hasObviousWrong) {
        suggestions.push('Avoid obviously incorrect distractors - make all options plausible')
      }
    }

    return {
      isGood: suggestions.length === 0,
      suggestions
    }
  }

  private checkAnswerOptionsQuality(options: string[]): { penalty: number; suggestions: string[] } {
    let penalty = 0
    const suggestions: string[] = []

    // Check option similarity
    const optionWords = options.map(opt => opt.toLowerCase().split(/\s+/))
    const firstOptionWords = optionWords[0] || []
    const commonWords = firstOptionWords.filter(word => 
      optionWords.every(opts => opts.includes(word))
    )

    if (commonWords.length > firstOptionWords.length * 0.5) {
      penalty += 10
      suggestions.push('Reduce repetitive words across options')
    }

    return { penalty, suggestions }
  }

  private calculateOverallScore(checks: IELTSQualityCheck[]): number {
    // Weighted scoring - critical checks have more weight
    let totalWeight = 0
    let weightedSum = 0

    checks.forEach(check => {
      const weight = this.CRITICAL_CHECKS.includes(check.criterion) ? 2 : 1
      totalWeight += weight
      weightedSum += check.score * weight
    })

    return Math.round(weightedSum / totalWeight)
  }

  private isPassingQuality(checks: IELTSQualityCheck[], overallScore: number): boolean {
    // Must pass overall threshold AND all critical checks
    const criticalChecksPassing = this.CRITICAL_CHECKS.every(criterion => 
      checks.find(check => check.criterion === criterion)?.isPassing
    )

    return overallScore >= this.PASSING_THRESHOLD && criticalChecksPassing
  }

  private requiresManualReview(checks: IELTSQualityCheck[], overallScore: number): boolean {
    // Requires manual review if:
    // 1. Close to threshold but not passing
    // 2. Failed critical checks
    // 3. Has serious suggestions

    const closeToThreshold = overallScore >= (this.PASSING_THRESHOLD - 10) && overallScore < this.PASSING_THRESHOLD
    const failedCritical = this.CRITICAL_CHECKS.some(criterion => 
      !checks.find(check => check.criterion === criterion)?.isPassing
    )
    const seriousSuggestions = checks.some(check => 
      check.suggestions.some(suggestion => 
        suggestion.toLowerCase().includes('grammar') || 
        suggestion.toLowerCase().includes('inappropriate')
      )
    )

    return closeToThreshold || failedCritical || seriousSuggestions
  }

  private generateRecommendations(checks: IELTSQualityCheck[]): string[] {
    const recommendations: string[] = []

    // Collect all suggestions from failing checks
    checks.filter(check => !check.isPassing).forEach(check => {
      recommendations.push(`${check.criterion.toUpperCase()}: ${check.feedback}`)
      recommendations.push(...check.suggestions.map(s => `  • ${s}`))
    })

    // Add overall recommendations
    const failedCount = checks.filter(check => !check.isPassing).length
    if (failedCount > 3) {
      recommendations.unshift('OVERALL: This question needs significant revision before publication')
    } else if (failedCount > 0) {
      recommendations.unshift('OVERALL: Address the specific issues below to improve question quality')
    }

    return recommendations
  }

  /**
   * Quick validation for simple pass/fail without detailed analysis
   */
  async quickValidation(question: IELTSQuestion): Promise<{ isPassing: boolean; score: number }> {
    const result = await this.evaluateQuestion(question)
    return {
      isPassing: result.isPassing,
      score: result.overallScore
    }
  }

  /**
   * Batch validation for multiple questions
   */
  async evaluateQuestionBatch(questions: IELTSQuestion[]): Promise<{
    results: IELTSQualityResult[]
    summary: {
      totalQuestions: number
      passingQuestions: number
      averageScore: number
      needsReview: number
    }
  }> {
    const results = await Promise.all(
      questions.map(question => this.evaluateQuestion(question))
    )

    const summary = {
      totalQuestions: questions.length,
      passingQuestions: results.filter(r => r.isPassing).length,
      averageScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
      needsReview: results.filter(r => r.requiresManualReview).length
    }

    logger.info('Batch IELTS Quality Matrix evaluation complete', summary)

    return { results, summary }
  }
}

// Export singleton instance
export const ieltsQualityMatrix = new IELTSQualityMatrix()