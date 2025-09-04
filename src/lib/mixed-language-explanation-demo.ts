/**
 * Demo for Mixed Language Explanations (English Questions + Khmer Explanations)
 * This shows how the system handles your specific use case
 */

import { MixedLanguageValidator } from './mixed-language-validator'
import { KhmerLanguageValidator } from './khmer-language-support'

export class MixedLanguageExplanationDemo {
  
  /**
   * Demonstrates typical mixed-language explanations from your use case
   */
  static demonstrateTypicalExplanations() {
    console.log('🌐 MIXED LANGUAGE EXPLANATION DEMO')
    console.log('English Questions + Khmer Explanations + Mixed Content')
    console.log('=' .repeat(70))
    
    // These are examples of your typical quiz structure
    const typicalQuizExamples = [
      {
        question: "What is the capital of Cambodia?", // English question
        options: ["Phnom Penh", "Siem Reap", "Battambang", "Kampong Cham"],
        answer: "Phnom Penh",
        explanation: "រាជធានីកម្ពុជាគឺ ភ្នំពេញ (Phnom Penh) ដែលជាទីក្រុងធំបំផុត និងជាមជ្ឈមណ្ឌលសេដ្ឋកិច្ច" // Khmer explanation with English in parentheses
      },
      {
        question: "Which language family does Khmer belong to?",
        options: ["Sino-Tibetan", "Austroasiatic", "Tai-Kadai", "Austronesian"],
        answer: "Austroasiatic",
        explanation: "ភាសាខ្មែរជាភាសាក្នុងគ្រួសារ Austroasiatic family ដែលរួមមាន Vietnamese ផងដែរ។ ភាសានេះមានប្រវត្តិដ៏យូរលង់" // Mixed Khmer + English terms
      },
      {
        question: "What is the traditional New Year celebration called in Cambodia?",
        options: ["Pchum Ben", "Chaul Chnam Thmey", "Water Festival", "Royal Ploughing"],
        answer: "Chaul Chnam Thmey", 
        explanation: "ចូលឆ្នាំថ្មី (Chaul Chnam Thmey) គឺជាពិធីបុណ្យធំបំផុតរបស់ខ្មែរ។ It's celebrated in April (ខែមេសា) for 3 days" // Heavy mixing
      },
      {
        question: "How many consonants are in the Khmer alphabet?",
        options: ["32", "33", "34", "35"],
        answer: "33",
        explanation: "អក្សរខ្មែរមានព្យាយនជ្រុល ៣៣ តួ but in modern usage only 32 are commonly used. ព្យាយន ៓ (៣៣) ត្រូវបានលុបចេញ" // Numbers + Khmer + English
      }
    ]
    
    typicalQuizExamples.forEach((example, index) => {
      console.log(`\n--- Example ${index + 1}: ${example.question.substring(0, 40)}... ---`)
      
      // Test the explanation with our mixed language validator
      const validation = MixedLanguageValidator.validateMixedContent(example.explanation)
      const jsonTest = MixedLanguageValidator.testJSONCompatibility(example.explanation)
      
      console.log(`Question: ${example.question}`)
      console.log(`Answer: ${example.answer}`)
      console.log(`Explanation: ${example.explanation}`)
      console.log('\nValidation Results:')
      console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}`)
      console.log(`  Khmer: ${validation.languageBreakdown.khmerPercentage}%`)
      console.log(`  English: ${validation.languageBreakdown.englishPercentage}%`)
      console.log(`  JSON Safe: ${jsonTest.success ? '✅' : '❌'}`)
      
      if (!validation.isValid) {
        console.log(`  Issues: ${validation.issues.join(', ')}`)
      }
      
      if (validation.recommendations.length > 0) {
        console.log(`  Recommendations: ${validation.recommendations.join(', ')}`)
      }
      
      if (!jsonTest.success) {
        console.log(`  JSON Error: ${jsonTest.error}`)
      }
    })
    
    return typicalQuizExamples
  }
  
  /**
   * Tests problematic patterns that break JSON in mixed explanations
   */
  static demonstrateProblematicPatterns() {
    console.log('\n🚨 PROBLEMATIC PATTERNS IN MIXED EXPLANATIONS')
    console.log('=' .repeat(60))
    
    const problematicExamples = [
      {
        description: 'Unescaped quotes around Khmer text',
        explanation: 'The word "ភាសា" means language in Khmer',
        issue: 'Quotes around Khmer text break JSON parsing'
      },
      {
        description: 'Complex Khmer clusters in mixed content',
        explanation: 'ប្រវត្តិសាស្ត្រ (history) is a complex word with multiple clusters that can break JSON',
        issue: 'Complex consonant clusters in JSON strings'
      },
      {
        description: 'Mixed punctuation systems',
        explanation: 'ចម្លើយគឺ៖ A) ភ្នំពេញ។ The answer is: A) Phnom Penh.',
        issue: 'Mixed Khmer (៖ ។) and English punctuation'
      },
      {
        description: 'Khmer numerals vs Arabic numerals',
        explanation: 'មានចម្លើយ ៤ (4) choices ក្នុងសំណួរនេះ',
        issue: 'Mixed numeral systems can confuse parsing'
      },
      {
        description: 'Control characters or hidden Unicode',
        explanation: 'Normal text\u200Bwith hidden zero-width space ភាសាខ្មែរ',
        issue: 'Zero-width characters break JSON'
      }
    ]
    
    problematicExamples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.description}:`)
      console.log(`   Text: "${example.explanation}"`)
      console.log(`   Issue: ${example.issue}`)
      
      // Test with validators
      const mixedValidation = MixedLanguageValidator.validateMixedContent(example.explanation)
      const jsonTest = MixedLanguageValidator.testJSONCompatibility(example.explanation)
      const sanitized = MixedLanguageValidator.sanitizeMixedContent(example.explanation)
      
      console.log(`   Mixed Validation: ${mixedValidation.isValid ? '✅' : '❌'}`)
      console.log(`   JSON Test: ${jsonTest.success ? '✅' : '❌'}`)
      
      if (!mixedValidation.isValid) {
        console.log(`   Issues: ${mixedValidation.issues.join(', ')}`)
      }
      
      if (!jsonTest.success) {
        console.log(`   JSON Error: ${jsonTest.error}`)
      }
      
      console.log(`   Sanitized: "${sanitized}"`)
      
      // Test if sanitized version works
      const sanitizedTest = MixedLanguageValidator.testJSONCompatibility(sanitized)
      console.log(`   Sanitized JSON Test: ${sanitizedTest.success ? '✅' : '❌'}`)
    })
    
    return problematicExamples
  }
  
  /**
   * Shows how to fix mixed language explanations for safe JSON storage
   */
  static demonstrateFixes() {
    console.log('\n🔧 FIXES FOR MIXED LANGUAGE EXPLANATIONS')
    console.log('=' .repeat(55))
    
    const beforeAfterExamples = [
      {
        description: 'Fix quotes around Khmer text',
        before: 'The word "ភាសា" means language',
        after: 'The word ភាសា means language',
        fix: 'Remove quotes around Khmer text or use single quotes'
      },
      {
        description: 'Simplify complex Khmer clusters',
        before: 'ប្រវត្តិសាស្ត្រ is the Khmer word for history',
        after: 'ប្រវត្តិ is the Khmer word for history',
        fix: 'Use simpler Khmer words when possible'
      },
      {
        description: 'Consistent punctuation',
        before: 'ចម្លើយគឺ៖ A) ភ្នំពេញ។ The answer is: A) Phnom Penh.',
        after: 'ចម្លើយគឺ A) ភ្នំពេញ. The answer is: A) Phnom Penh.',
        fix: 'Use consistent punctuation system'
      },
      {
        description: 'Consistent numbers',
        before: 'មានចម្លើយ ៤ (4) choices',
        after: 'មានចម្លើយ 4 choices',
        fix: 'Use Arabic numerals consistently'
      }
    ]
    
    beforeAfterExamples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.description}:`)
      console.log(`   Before: "${example.before}"`)
      console.log(`   After:  "${example.after}"`)
      console.log(`   Fix:    ${example.fix}`)
      
      // Test both versions
      const beforeTest = MixedLanguageValidator.testJSONCompatibility(example.before)
      const afterTest = MixedLanguageValidator.testJSONCompatibility(example.after)
      
      console.log(`   Before JSON: ${beforeTest.success ? '✅' : '❌'}`)
      console.log(`   After JSON:  ${afterTest.success ? '✅' : '❌'}`)
      
      if (!beforeTest.success) {
        console.log(`   Before Error: ${beforeTest.error}`)
      }
    })
    
    return beforeAfterExamples
  }
  
  /**
   * Complete demonstration of mixed language handling
   */
  static runCompleteDemo() {
    console.log('\n🎯 COMPLETE MIXED LANGUAGE EXPLANATION DEMO')
    console.log('For English Questions + Khmer Explanations + Mixed Content')
    console.log('=' .repeat(75))
    
    const results = {
      typical: this.demonstrateTypicalExplanations(),
      problematic: this.demonstrateProblematicPatterns(),
      fixes: this.demonstrateFixes()
    }
    
    console.log('\n📊 SUMMARY FOR YOUR USE CASE:')
    console.log('1. English questions with Khmer explanations ARE supported')
    console.log('2. Mixed content (English + Khmer) needs careful validation')
    console.log('3. Avoid quotes around Khmer text in explanations')
    console.log('4. Use consistent punctuation and numbering')
    console.log('5. The system will automatically sanitize problematic content')
    
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('1. Test explanations with MixedLanguageValidator before saving')
    console.log('2. Use Arabic numerals (1,2,3) instead of Khmer numerals')
    console.log('3. Keep English and Khmer sections together, avoid frequent mixing')
    console.log('4. Use : instead of ៖ for consistency')
    console.log('5. Place English clarifications in parentheses: ភាសា (language)')
    
    return results
  }
}

export default MixedLanguageExplanationDemo
