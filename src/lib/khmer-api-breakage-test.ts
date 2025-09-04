/**
 * REAL-WORLD TEST: How Khmer text breaks our actual API routes
 * 
 * This simulates the exact flow from ChatGPT → API → Database
 * and shows where it fails with Khmer content.
 */

import { KhmerJSONBreakageDemo } from './khmer-json-breakage-demo'
import { KhmerLanguageValidator } from './khmer-language-support'

export class KhmerAPIBreakageTest {
  
  /**
   * Simulates our /api/admin/generate-quiz route with Khmer content
   */
  static simulateQuizGenerationAPI() {
    console.log('🔥 SIMULATING REAL API QUIZ GENERATION WITH KHMER')
    console.log('=' .repeat(60))
    
    // This is what ChatGPT returns to our API
    const chatGPTRawResponse = `{
      "title": "តេស្តភាសាខ្មែរ",
      "description": "ការសាកល្បងជំនាញភាសាខ្មែរសម្រាប់សិស្ស",
      "questions": [
        {
          "question": "អក្សរខ្មែរមានព្យាយនជ្រុលប៉ុន្មាន?",
          "type": "multiple_choice",
          "options": [
            "៣២ព្យាយន",
            "៣៣ព្យាយន", 
            "៣៤ព្យាយន",
            "៣៥ព្យាយន"
          ],
          "correct_answer": "៣៣ព្យាយន",
          "explanation": "ភាសាខ្មែរមានព្យាយនជ្រុលសរុបចំនួន ៣៣"
        },
        {
          "question": "ក្រុមព្យាយនណាដែលមានការលាក់ស្រៈ?",
          "type": "multiple_choice",
          "options": [
            "ក ខ គ ឃ",
            "ង ច ឆ ជ", 
            "ញ ដ ឋ ត",
            "ថ ន ប ផ"
          ],
          "correct_answer": "ក ខ គ ឃ",
          "explanation": "ក្រុមកក្កសម្រាប់ការលាក់ស្រៈក្នុងការសរសេរ"
        }
      ]
    }`
    
    console.log('1. ChatGPT Raw Response:')
    console.log('   Length:', chatGPTRawResponse.length, 'characters')
    console.log('   Contains Khmer:', /[\u1780-\u17FF]/.test(chatGPTRawResponse))
    
    // Step 1: Our API tries to parse the ChatGPT response
    console.log('\n2. API Parsing Step:')
    try {
      const parsedQuiz = JSON.parse(chatGPTRawResponse)
      console.log('   ✅ JSON.parse succeeded')
      console.log('   Title:', parsedQuiz.title)
      console.log('   Questions:', parsedQuiz.questions.length)
      
      // Step 2: Our API prepares data for database
      console.log('\n3. Database Preparation:')
      const dbData = {
        title: parsedQuiz.title,
        description: parsedQuiz.description,
        questions: JSON.stringify(parsedQuiz.questions), // Critical point of failure
        category: 'language-learning',
        difficulty: 'intermediate',
        created_at: new Date().toISOString()
      }
      
      console.log('   ✅ Database object created')
      console.log('   Questions JSON length:', dbData.questions.length)
      
      // Step 3: Simulate database insertion (this is where it often fails)
      console.log('\n4. Database Insertion Simulation:')
      
      // Check if our questions JSON is too long for typical database text fields
      if (dbData.questions.length > 65535) {
        console.log('   ❌ Questions JSON exceeds TEXT field limit (65,535 chars)')
      } else {
        console.log('   ✅ Questions JSON fits in TEXT field')
      }
      
      // Step 4: Simulate retrieving from database and parsing back
      console.log('\n5. Database Retrieval Simulation:')
      try {
        const retrievedQuestions = JSON.parse(dbData.questions)
        console.log('   ✅ Questions parsed successfully from database')
        console.log('   First question text:', retrievedQuestions[0]?.question)
        
        return {
          success: true,
          originalQuiz: parsedQuiz,
          dbData,
          retrievedQuestions
        }
        
      } catch (parseError) {
        console.log('   ❌ Failed to parse questions from database:', parseError)
        return {
          success: false,
          error: 'Database retrieval parsing failed',
          details: parseError
        }
      }
      
    } catch (initialError) {
      console.log('   ❌ Initial JSON parsing failed:', initialError)
      return {
        success: false,
        error: 'Initial parsing failed',
        details: initialError
      }
    }
  }
  
  /**
   * Tests our current enhanced-ai-services.ts with problematic Khmer
   */
  static testCurrentAIServiceWithKhmer() {
    console.log('\n🧪 TESTING CURRENT AI SERVICE WITH PROBLEMATIC KHMER')
    console.log('=' .repeat(65))
    
    // These are known problematic Khmer texts that break JSON
    const problematicTexts = [
      'ប្រវត្តិសាស្ត្រខ្មែរ',           // Multiple complex clusters
      'ស្រុកស្រែ និង ស្រាបៀរ',         // Complex combinations
      'ព្រះរាជាណាចក្រកម្ពុជា',        // Royal terminology 
      'អ្នកនាង "សុភាព" (ស្រី)',        // Quotes and parentheses
      'សំណួរទី ១២៖ ចម្លើយគឺ?',        // Numbers and punctuation
    ]
    
    problematicTexts.forEach((text, index) => {
      console.log(`\n${index + 1}. Testing: "${text}"`)
      
      // Test basic JSON operations
      try {
        const testObj = { title: text, content: `Test content with ${text}` }
        const jsonString = JSON.stringify(testObj)
        const parsed = JSON.parse(jsonString)
        
        console.log('   ✅ Basic JSON: Success')
        console.log('   Length after JSON:', jsonString.length)
        
        // Test our validator
        const validation = KhmerLanguageValidator.validateKhmerText(text)
        console.log(`   Khmer Validation: ${validation.isValid ? '✅' : '❌'}`)
        if (!validation.isValid) {
          console.log('   Issues:', validation.issues)
        }
        
      } catch (error) {
        console.log('   ❌ JSON Failed:', error instanceof Error ? error.message : String(error))
      }
    })
  }
  
  /**
   * Shows the exact database schema issues with Khmer
   */
  static analyzeDatabaseSchemaIssues() {
    console.log('\n💾 DATABASE SCHEMA ANALYSIS FOR KHMER')
    console.log('=' .repeat(50))
    
    // Typical Khmer quiz that might be generated
    const typicalKhmerQuiz = {
      title: "ការសាកល្បងភាសាខ្មែរ",
      description: "តេស្តសម្រាប់ការវាយតម្លៃជំនាញភាសាខ្មែរ",
      questions: [
        {
          question: "អក្សរខ្មែរមានព្យាយនជ្រុលប៉ុន្មាន?",
          options: ["៣២", "៣៣", "៣៤", "៣៥"],
          answer: "៣៣",
          explanation: "ភាសាខ្មែរមានព្យាយនជ្រុលសរុប ៣៣ ដូចដែលបានកំណត់ក្នុងវេយ្យាករណ៍"
        },
        {
          question: "ស្រៈខ្មែរមានប៉ុន្មានប្រភេទ?",
          options: ["២៣ប្រភេទ", "២៤ប្រភេទ", "២៥ប្រភេទ", "២៦ប្រភេទ"],
          answer: "២៤ប្រភេទ",
          explanation: "ស្រៈខ្មែរមានទាំងអស់ ២៤ ប្រភេទ ដែលបែងចែកជាស្រៈឯករាជ្យ និងស្រៈអាស្រ័យ"
        },
        {
          question: "តួអក្សរណាជាតួចុងក្រោយក្នុងអក្សរខ្មែរ?",
          options: ["អ", "ឱ", "ៀ", "ៅ"],
          answer: "ៅ",
          explanation: "អក្សរ ៅ ជាអក្សរចុងក្រោយក្នុងលំដាប់អក្សរខ្មែរ"
        }
      ]
    }
    
    // Convert to what would be stored in database
    const questionsJSON = JSON.stringify(typicalKhmerQuiz.questions)
    
    console.log('Quiz Analysis:')
    console.log(`Title length: ${typicalKhmerQuiz.title.length} chars`)
    console.log(`Description length: ${typicalKhmerQuiz.description.length} chars`)
    console.log(`Questions JSON length: ${questionsJSON.length} chars`)
    console.log(`Total size: ${questionsJSON.length + typicalKhmerQuiz.title.length + typicalKhmerQuiz.description.length} chars`)
    
    // Database field constraints
    const constraints = {
      'VARCHAR(255)': 255,
      'TEXT (MySQL)': 65535,
      'MEDIUMTEXT': 16777215,
      'LONGTEXT': 4294967295
    }
    
    console.log('\nDatabase Field Compatibility:')
    Object.entries(constraints).forEach(([fieldType, limit]) => {
      const fits = questionsJSON.length <= limit
      console.log(`${fieldType}: ${fits ? '✅' : '❌'} (${questionsJSON.length}/${limit})`)
    })
    
    // Character encoding issues
    console.log('\nCharacter Encoding Analysis:')
    console.log(`UTF-8 bytes: ${Buffer.from(questionsJSON, 'utf8').length}`)
    console.log(`Unicode code points: ${Array.from(questionsJSON).length}`)
    console.log(`JavaScript string length: ${questionsJSON.length}`)
    
    return {
      quiz: typicalKhmerQuiz,
      questionsJSON,
      size: questionsJSON.length,
      constraints
    }
  }
  
  /**
   * Complete test of the entire pipeline
   */
  static runCompleteAPITest() {
    console.log('\n🎯 COMPLETE KHMER API PIPELINE TEST')
    console.log('=' .repeat(50))
    
    console.log('Testing the complete flow:')
    console.log('ChatGPT → API → JSON Parse → Database → Retrieval → Frontend')
    
    const results = {
      apiSimulation: this.simulateQuizGenerationAPI(),
      aiServiceTest: this.testCurrentAIServiceWithKhmer(),
      databaseAnalysis: this.analyzeDatabaseSchemaIssues()
    }
    
    console.log('\n📊 RESULTS SUMMARY:')
    console.log(`API Simulation: ${results.apiSimulation.success ? '✅' : '❌'}`)
    if (!results.apiSimulation.success) {
      console.log(`  Error: ${results.apiSimulation.error}`)
    }
    
    console.log('\n🔧 FIXES NEEDED:')
    console.log('1. Add Khmer text validation before JSON operations')
    console.log('2. Implement Unicode normalization (NFC)')
    console.log('3. Increase database field sizes for Khmer content')
    console.log('4. Add proper error handling for JSON parsing failures')
    console.log('5. Escape special Khmer characters in JSON')
    
    return results
  }
}

export default KhmerAPIBreakageTest
