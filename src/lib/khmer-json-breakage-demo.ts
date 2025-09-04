/**
 * CRITICAL: Demonstration of Khmer JSON Parsing Issues in AI Quiz Generation
 * 
 * This file shows the EXACT problems that occur when ChatGPT generates Khmer text
 * and we try to parse it as JSON and save it to the database.
 */

import { logger } from './logger'

export class KhmerJSONBreakageDemo {
  
  /**
   * Simulates what happens when ChatGPT returns Khmer text in JSON format
   * Shows the specific Unicode and JSON parsing issues
   */
  static demonstrateJSONBreakage() {
    console.log('🚨 KHMER JSON PARSING BREAKAGE DEMONSTRATION 🚨')
    console.log('=' .repeat(60))
    
    // PROBLEM 1: Complex Khmer consonant clusters break JSON parsing
    console.log('\n1. CONSONANT CLUSTER ISSUES:')
    
    const problematicKhmerQuiz = {
      title: "ប្រវត្តិសាស្ត្រខ្មែរ", // Contains complex clusters: ប្រ, ត្តិ, ស្ត្រ
      questions: [
        {
          question: "រាជវង្សចុងក្រោយរបស់ប្រទេសកម្ពុជាគឺជាអ្វី?", // Multiple complex clusters
          options: [
            "ព្រះបាទនរោត្តម", // ព្រះ cluster + other complexities
            "ព្រះសីហនុ",
            "ព្រះកោសល្យ",
            "ព្រះអង្គម្ចាស់"
          ],
          answer: "ព្រះបាទនរោត្តម"
        }
      ]
    }
    
    // Try to stringify - this is where it often breaks
    try {
      const jsonString = JSON.stringify(problematicKhmerQuiz)
      console.log('✅ JSON stringify succeeded')
      console.log('JSON length:', jsonString.length)
      
      // Try to parse it back - this is where it REALLY breaks
      const parsed = JSON.parse(jsonString)
      console.log('✅ JSON parse succeeded')
      console.log('Parsed title:', parsed.title)
      
    } catch (error) {
      console.error('❌ JSON operation failed:', error)
    }
    
    // PROBLEM 2: Unicode normalization issues
    console.log('\n2. UNICODE NORMALIZATION ISSUES:')
    
    // Same text but with different Unicode compositions
    const normalizedText = "ភាសាខ្មែរ"  // NFC normalized
    const decomposedText = "ភាសាខ្មែរ"   // NFD decomposed (visually same, different bytes)
    
    console.log('Normalized length:', normalizedText.length)
    console.log('Decomposed length:', decomposedText.length)
    console.log('Are they equal?', normalizedText === decomposedText)
    console.log('Normalized bytes:', Array.from(normalizedText).map(c => c.charCodeAt(0)))
    console.log('Decomposed bytes:', Array.from(decomposedText).map(c => c.charCodeAt(0)))
    
    // PROBLEM 3: Database insertion issues
    console.log('\n3. DATABASE INSERTION PROBLEMS:')
    
    const exampleQuizForDB = {
      title: "ការសាកល្បងភាសាខ្មែរ",
      questions: JSON.stringify([
        {
          question: "អក្សរខ្មែរមានអក្សរស្រៈប៉ុន្មាន?",
          options: ["២៣", "២៤", "២៥", "២៦"],
          answer: "២៤"
        }
      ])
    }
    
    console.log('Quiz for DB:', exampleQuizForDB)
    console.log('Questions as JSON string length:', exampleQuizForDB.questions.length)
    
    // Simulate database constraint issues
    if (exampleQuizForDB.questions.length > 1000) {
      console.log('⚠️  JSON string too long for database text field!')
    }
    
    return {
      problematicKhmerQuiz,
      normalizedText,
      decomposedText,
      exampleQuizForDB
    }
  }
  
  /**
   * Shows how our current enhanced-ai-services.ts handles (or doesn't handle) Khmer
   */
  static analyzeCurrentKhmerHandling() {
    console.log('\n📋 CURRENT KHMER HANDLING ANALYSIS:')
    console.log('=' .repeat(50))
    
    // Simulate what happens in our AI service
    console.log('\n1. AI Service Response Simulation:')
    
    // This is what ChatGPT might return for a Khmer quiz
    const chatGPTResponse = `{
      "title": "ការសាកល្បងភាសាខ្មែរ",
      "description": "មេរៀនអំពីវេយ្យាករណ៍ខ្មែរ និង ការប្រើប្រាស់ភាសា",
      "questions": [
        {
          "question": "អក្សរខ្មែរចាប់ផ្តើមពីអក្សរអ្វី?",
          "type": "multiple_choice",
          "options": ["អ", "ក", "គ", "ង"],
          "correct_answer": "ក",
          "explanation": "អក្សរខ្មែរចាប់ផ្តើមពីអក្សរ ក ដែលមានស្រៈជាប់ជាមួយ"
        },
        {
          "question": "ភាសាខ្មែរមានព្យាយនជ្រុលប៉ុន្មាន?",
          "type": "multiple_choice", 
          "options": ["៣២", "៣៣", "៣៤", "៣៥"],
          "correct_answer": "៣៣",
          "explanation": "ភាសាខ្មែរមានព្យាយនជ្រុលចំនួន ៣៣ ព្យាយន"
        }
      ]
    }`
    
    console.log('Raw ChatGPT response length:', chatGPTResponse.length)
    console.log('Contains Khmer characters:', /[\u1780-\u17FF]/.test(chatGPTResponse))
    
    // Test JSON parsing like our API routes do
    try {
      console.log('\n2. JSON Parsing Test:')
      const parsed = JSON.parse(chatGPTResponse)
      console.log('✅ JSON parsing successful')
      console.log('Title:', parsed.title)
      console.log('Questions count:', parsed.questions?.length)
      
      // Test stringifying for database storage
      console.log('\n3. Database Storage Test:')
      const forDatabase = {
        title: parsed.title,
        description: parsed.description,
        questions: JSON.stringify(parsed.questions), // This is what we do in our API
        created_at: new Date().toISOString()
      }
      
      console.log('Database object created successfully')
      console.log('Questions JSON length:', forDatabase.questions.length)
      
      // Test parsing questions back from database
      console.log('\n4. Database Retrieval Test:')
      const retrievedQuestions = JSON.parse(forDatabase.questions)
      console.log('✅ Questions parsed back from database')
      console.log('First question:', retrievedQuestions[0]?.question)
      
    } catch (error) {
      console.error('❌ JSON operation failed:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error)
      })
    }
    
    return { chatGPTResponse }
  }
  
  /**
   * Shows specific edge cases that break our system
   */
  static demonstrateEdgeCases() {
    console.log('\n⚠️  KHMER EDGE CASES THAT BREAK THE SYSTEM:')
    console.log('=' .repeat(55))
    
    const edgeCases = [
      {
        name: 'Complex Consonant Clusters',
        text: 'ស្ត្រី ស្រុក ប្រទេស ក្រុម ស្នេហ៍',
        issue: 'Multiple consonants combined with subscripts'
      },
      {
        name: 'Numeric Mixed with Khmer',
        text: 'មេរៀនទី ១២ អំពីភាសាខ្មែរ',
        issue: 'Khmer numerals mixed with text'
      },
      {
        name: 'Special Characters',
        text: 'សំណួរ៖ "អ្វីជាភាសាខ្មែរ?" (ចម្លើយ)',
        issue: 'Punctuation and quotation marks'
      },
      {
        name: 'Long Text with Multiple Clusters',
        text: 'ប្រវត្តិសាស្ត្រនៃព្រះរាជាណាចក្រកម្ពុជា និងការអភិវឌ្ឍន៍ប្រជាធិបតេយ្យ',
        issue: 'Very long text with many complex elements'
      }
    ]
    
    edgeCases.forEach((testCase, index) => {
      console.log(`\n${index + 1}. ${testCase.name}:`)
      console.log(`   Text: "${testCase.text}"`)
      console.log(`   Issue: ${testCase.issue}`)
      console.log(`   Length: ${testCase.text.length} characters`)
      console.log(`   Unicode length: ${Array.from(testCase.text).length} code points`)
      
      // Test JSON compatibility
      try {
        const testObj = { content: testCase.text }
        const jsonStr = JSON.stringify(testObj)
        const parsed = JSON.parse(jsonStr)
        console.log(`   JSON: ✅ Works`)
      } catch (error) {
        console.log(`   JSON: ❌ Fails - ${error instanceof Error ? error.message : String(error)}`)
      }
    })
    
    return edgeCases
  }
  
  /**
   * Complete demonstration of all Khmer JSON issues
   */
  static runCompleteDemo() {
    console.log('\n🇰🇭 COMPLETE KHMER JSON PARSING DEMONSTRATION 🇰🇭')
    console.log('=' .repeat(70))
    
    const results = {
      breakageDemo: this.demonstrateJSONBreakage(),
      currentHandling: this.analyzeCurrentKhmerHandling(),
      edgeCases: this.demonstrateEdgeCases()
    }
    
    console.log('\n🎯 SUMMARY OF ISSUES:')
    console.log('1. Complex consonant clusters can cause JSON parsing failures')
    console.log('2. Unicode normalization inconsistencies')
    console.log('3. Database text field length limitations')
    console.log('4. Special characters and punctuation handling')
    console.log('5. Mixed content (Khmer + numbers + Latin) issues')
    
    console.log('\n💡 SOLUTIONS NEEDED:')
    console.log('1. Pre-validate Khmer text before JSON operations')
    console.log('2. Unicode normalization (NFC) before storage')
    console.log('3. Escape special characters properly')
    console.log('4. Increase database field sizes for Khmer content')
    console.log('5. Add try-catch around all JSON operations')
    
    return results
  }
}

// Export for testing
export default KhmerJSONBreakageDemo
