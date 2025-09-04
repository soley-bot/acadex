import { logger } from './logger'
import { AIServiceFactory, BaseAIService } from './ai-services'

// Simplified quiz generation interface
export interface SimpleQuizRequest {
  topic: string
  subject: string
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questionTypes?: QuestionType[]
  language?: string
  explanationLanguage?: string
}

// Enhanced question types matching QuizForm exactly
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

// Frontend-compatible quiz format that matches our form structure
export interface FrontendQuizData {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  image_url: string
  is_published: boolean
  passing_score: number
  max_attempts: number
  questions: FrontendQuestion[]
}

export interface FrontendQuestion {
  id: string // Temporary ID for frontend
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}> // Support matching pairs
  correct_answer: number | string | number[] | string[] // Support all answer types
  correct_answer_text: string | null
  explanation: string
  points: number
  order_index: number
  // Additional question features from your form
  difficulty_level?: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
  tags?: string[]
}

export interface SimpleQuizResponse {
  success: boolean
  quiz?: FrontendQuizData
  error?: string
  debugInfo?: {
    prompt: string
    rawResponse: string
  }
}

export class SimpleAIQuizGenerator {
  private aiService: BaseAIService

  constructor() {
    // Initialize AI service without checking environment variables in constructor
    // The check will happen during the actual API call in generateContent
    this.aiService = AIServiceFactory.getDefaultService()
  }

  async generateQuiz(request: SimpleQuizRequest): Promise<SimpleQuizResponse> {
    try {
      logger.info('Simple AI quiz generation started', {
        topic: request.topic,
        subject: request.subject,
        questionCount: request.questionCount
      })

      // Build simple, clear prompt
      const prompt = this.buildSimplePrompt(request)
      
      logger.info('Sending request to AI service', { promptLength: prompt.length })

      // Make AI request with retry logic
      let attempts = 0
      const maxAttempts = 2
      let response: any = null

      while (attempts < maxAttempts && (!response || !response.success || !response.content)) {
        attempts++
        logger.info(`AI generation attempt ${attempts}/${maxAttempts}`)
        
        response = await this.aiService.generateContent({
          prompt,
          systemPrompt: this.buildSimpleSystemPrompt(request),
          maxTokens: 3000,
          temperature: attempts > 1 ? 0.5 : 0.7 // Lower temperature on retry
        })

        if (response.success && response.content) {
          break // Success, exit loop
        }

        if (attempts < maxAttempts) {
          logger.warn(`Attempt ${attempts} failed, retrying...`, { 
            success: response?.success, 
            hasContent: !!response?.content,
            error: response?.error 
          })
          // Brief delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!response || !response.success || !response.content) {
        logger.error('AI service failed to generate content after all attempts', {
          attempts,
          lastResponse: {
            success: response?.success,
            error: response?.error,
            hasContent: !!response?.content
          }
        })
        
        return {
          success: false,
          error: response?.error || 'AI service failed to generate content after multiple attempts. Please try again.'
        }
      }

      logger.info('AI response received', { 
        contentLength: response.content.length,
        contentPreview: response.content.substring(0, 100) + '...'
      })

      // Parse and validate response
      const quiz = this.parseAIResponse(response.content, request)
      
      if (!quiz) {
        return {
          success: false,
          error: 'Failed to parse AI response into valid quiz format',
          debugInfo: {
            prompt,
            rawResponse: response.content
          }
        }
      }

      // Convert to frontend-compatible format
      const frontendQuiz = this.convertToFrontendFormat(quiz, request)

      logger.info('Quiz generation successful', {
        questionsGenerated: frontendQuiz.questions.length,
        title: frontendQuiz.title
      })

      return {
        success: true,
        quiz: frontendQuiz,
        debugInfo: {
          prompt,
          rawResponse: response.content
        }
      }

    } catch (error: any) {
      logger.error('Simple quiz generation failed', { 
        error: error.message,
        stack: error.stack
      })

      return {
        success: false,
        error: `Quiz generation failed: ${error.message}`
      }
    }
  }

  private buildSimpleSystemPrompt(request: SimpleQuizRequest): string {
    return `You are a helpful educational content creator. Create a quiz about "${request.topic}" for students learning ${request.subject}.

Your task is to generate educational quiz questions that help students learn and practice their knowledge.

Instructions:
- Create ${request.questionCount} questions at ${request.difficulty} level
- Make questions clear and educational
- Include helpful explanations for each answer
- Use appropriate question types from: ${request.questionTypes?.join(', ') || 'multiple_choice, true_false'}
- Return only valid JSON format
- Questions should be appropriate for educational purposes

Remember to format answers correctly:
- Multiple choice: correct_answer as number index (0-3)
- True/False: correct_answer as 0 (True) or 1 (False)  
- Fill in blank: correct_answer as 0, correct_answer_text as the answer
- Essay: correct_answer as 0, correct_answer_text as sample answer`
  }

  private buildSimplePrompt(request: SimpleQuizRequest): string {
    const questionTypes = request.questionTypes || ['multiple_choice', 'true_false', 'fill_blank']
    
    // Helper function to get explanation in the correct language
    const getLocalizedExplanation = (englishExplanation: string): string => {
      if (request.explanationLanguage === 'khmer') {
        // Map of common explanations to Khmer
        const explanationMap: { [key: string]: string } = {
          "Photosynthesis is the process where plants use sunlight": "រស្មីសំយោគគឺជាដំណើរការដែលរុក្ខជាតិប្រើប្រាស់ពន្លឺព្រះអាទិត្យ ទឹក និងកាបូនឌីអុកស៊ីតដើម្បីផលិតគ្លុយកូសនិងអុកស៊ីសែន។",
          "Yes, the sun is classified as a star": "បាទ ព្រះអាទិត្យត្រូវបានចាត់ទុកជាផ្កាយមួយ ជាពិសេសផ្កាយពណ៌លឿងដែលផ្តល់ពន្លឺនិងកំដៅដល់ប្រព័ន្ធព្រះអាទិត្យរបស់យើង។",
          "Paris has been the capital and largest city": "ទីក្រុងប៉ារីសបានក្លាយជារាជធានីនិងទីក្រុងធំបំផុតនៃប្រទេសបារាំងចាប់តាំងពីសតវត្សទី១២។",
          "A comprehensive answer should cover": "ចម្លើយដ៏ពេញលេញគួរតែបញ្ចូលអំពីស្ថិរភាពរបស់ប្រព័ន្ធអេកូឡូស៊ី ភាពស្មុគស្មាញនៃបណ្តាញអាហារ និងអត្ថប្រយោជន៍នៃការសម្រប់ខ្លួន។",
          "Mars is red due to iron oxide": "ភពអង្គារមានពណ៌ក្រហមដោយសារអាយុធអុកស៊ីត ភពព្រហស្បតិគឺជាភពធំបំផុតនៃប្រព័ន្ធព្រះអាទិត្យ ហើយភពសៅរ៍ល្បីដោយប្រព័ន្ធចិញ្រួនរបស់វា។"
        }
        
        // Find best match or return generic Khmer explanation
        for (const [englishKey, khmerTranslation] of Object.entries(explanationMap)) {
          if (englishExplanation.includes(englishKey.substring(0, 20))) {
            return khmerTranslation
          }
        }
        return "នេះជាការពន្យល់លម្អិតអំពីចម្លើយត្រឹមត្រូវសម្រាប់សំណួរនេះ។" // Generic Khmer explanation
      }
      return englishExplanation
    }
    
    // Build examples for different question types
    const examples = {
      multiple_choice: `{
      "question": "What is the process by which plants make food?",
      "question_type": "multiple_choice", 
      "options": ["Photosynthesis", "Respiration", "Transpiration", "Germination"],
      "correct_answer": 0,
      "explanation": "${getLocalizedExplanation("Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.")}"
    }`,
      true_false: `{
      "question": "The sun is a star.",
      "question_type": "true_false",
      "options": ["True", "False"], 
      "correct_answer": 0,
      "explanation": "${getLocalizedExplanation("Yes, the sun is classified as a star - specifically a yellow dwarf star that provides light and heat to our solar system.")}"
    }`,
      fill_blank: `{
      "question": "The capital of France is ____.",
      "question_type": "fill_blank",
      "options": [],
      "correct_answer": 0,
      "correct_answer_text": "Paris",
      "explanation": "${getLocalizedExplanation("Paris has been the capital and largest city of France since the 12th century.")}"
    }`,
      essay: `{
      "question": "Explain the importance of biodiversity in ecosystems.",
      "question_type": "essay",
      "options": [],
      "correct_answer": 0,
      "correct_answer_text": "Biodiversity ensures ecosystem stability, provides resources, supports food webs, and increases resilience to environmental changes.",
      "explanation": "${getLocalizedExplanation("A comprehensive answer should cover ecosystem stability, food web complexity, resource availability, and adaptation benefits.")}"
    }`,
      matching: `{
      "question": "Match each planet with its characteristic:",
      "question_type": "matching", 
      "options": [
        {"left": "Mars", "right": "Red planet"},
        {"left": "Jupiter", "right": "Largest planet"},
        {"left": "Saturn", "right": "Has rings"}
      ],
      "correct_answer": [0, 1, 2],
      "explanation": "${getLocalizedExplanation("Mars is red due to iron oxide, Jupiter is the solar system's largest planet, and Saturn is famous for its ring system.")}"
    }`,
      ordering: `{
      "question": "Put these events in chronological order:",
      "question_type": "ordering",
      "options": ["World War I", "Industrial Revolution", "Renaissance", "World War II"],
      "correct_answer": [2, 1, 0, 3],
      "explanation": "${getLocalizedExplanation("The correct order is: Renaissance (14th-17th century), Industrial Revolution (18th-19th century), World War I (1914-1918), World War II (1939-1945).")}"
    }`
    }
    
    const selectedExamples = questionTypes
      .filter(type => examples[type as keyof typeof examples])
      .map(type => examples[type as keyof typeof examples])
      .join(',\n    ')
    
    return `Create a ${request.difficulty} level quiz about "${request.topic}" in the subject of ${request.subject}.

Generate exactly ${request.questionCount} questions using ONLY these question types: ${questionTypes.join(', ')}.

STRICT REQUIREMENTS:
- ONLY use these question types: ${questionTypes.join(', ')}
- Do NOT generate any other question types
- Every question must be one of: ${questionTypes.join(' OR ')}
- If you see any question that is not ${questionTypes.join(' or ')}, do not include it

LANGUAGE REQUIREMENTS:
- Generate questions in ${request.language}
- Generate ALL explanations in ${request.explanationLanguage}
- If explanation language is "khmer", write explanations in Khmer script (ភាសាខ្មែរ)
- If explanation language is different from question language, translate explanations accordingly

QUESTION TYPE FORMATS (ONLY USE THESE):
${selectedExamples}

Return ONLY this JSON structure:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${request.subject}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(request.questionCount * 2, 15)},
  "questions": [
    // Your ${request.questionCount} questions here following the formats above
  ]
}

CRITICAL REQUIREMENTS:
- Exactly ${request.questionCount} questions
- Use correct answer formats for each question type
- For multiple_choice: correct_answer is index (0-3), 4 options
- For true_false: correct_answer is 0 or 1, 2 options ["True", "False"] 
- For fill_blank: correct_answer is 0, correct_answer_text has the answer
- For essay: correct_answer is 0, correct_answer_text has sample answer
- For matching: correct_answer is array of pair indices, options are [{"left":"...", "right":"..."}]
- For ordering: correct_answer is array of correct order indices
- ALL questions must have detailed explanations
- ALL explanations MUST be written in ${request.explanationLanguage}
- If explanations are in Khmer, use proper Khmer script and grammar
- Content should be educational and accurate
- Return ONLY valid JSON, no markdown, no additional text, no code blocks
- Ensure all strings are properly quoted and escaped
- Ensure no trailing commas in arrays or objects
- Each question must be separated by commas in the questions array`
  }

  private parseAIResponse(content: string, request: SimpleQuizRequest): any {
    try {
      // Clean the response
      let cleanContent = content.trim()
      
      // Log the raw content for debugging
      logger.info('Raw AI response', { 
        contentLength: content.length,
        contentPreview: content.substring(0, 200) + '...'
      })
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\s*|\s*```/g, '')
      
      // Remove any text before the first { and after the last }
      const firstBrace = cleanContent.indexOf('{')
      const lastBrace = cleanContent.lastIndexOf('}')
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        logger.error('No valid JSON structure found in response', {
          firstBrace,
          lastBrace,
          contentPreview: cleanContent.substring(0, 500)
        })
        return null
      }
      
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
      
      // Log cleaned content for debugging
      logger.info('Cleaned JSON content', {
        contentLength: cleanContent.length,
        contentPreview: cleanContent.substring(0, 200) + '...'
      })
      
      // Try to fix common JSON issues before parsing
      cleanContent = this.fixCommonJSONIssues(cleanContent)
      
      // Parse JSON
      const quiz = JSON.parse(cleanContent)
      
      // Basic validation
      if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
        logger.error('Invalid quiz structure', { quiz: quiz })
        return null
      }
      
      if (quiz.questions.length !== request.questionCount) {
        logger.warn('Question count mismatch', {
          expected: request.questionCount,
          actual: quiz.questions.length
        })
      }
      
      // Validate each question
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i]
        
        if (!q.question || !q.question_type) {
          logger.error(`Question ${i + 1} missing required fields`)
          return null
        }
        
        // Validate that only requested question types are used
        if (!request.questionTypes?.includes(q.question_type)) {
          logger.error(`Question ${i + 1} has invalid question type: ${q.question_type}. Only allowed: ${request.questionTypes?.join(', ')}`)
          return null
        }
        
        // Validate question type specific requirements
        if (q.question_type === 'multiple_choice') {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            logger.error(`Question ${i + 1} multiple choice needs options`)
            return null
          }
          if (typeof q.correct_answer !== 'number' || 
              q.correct_answer < 0 || 
              q.correct_answer >= q.options.length) {
            logger.error(`Question ${i + 1} has invalid correct_answer`)
            return null
          }
        }
        
        if (q.question_type === 'true_false') {
          if (!Array.isArray(q.options) || q.options.length !== 2) {
            // Fix true/false options if needed
            q.options = ['True', 'False']
          }
          if (typeof q.correct_answer !== 'number' || 
              (q.correct_answer !== 0 && q.correct_answer !== 1)) {
            logger.error(`Question ${i + 1} true/false has invalid correct_answer`)
            return null
          }
        }
        
        if (q.question_type === 'fill_blank') {
          if (!q.correct_answer_text || typeof q.correct_answer_text !== 'string') {
            logger.error(`Question ${i + 1} fill_blank needs correct_answer_text`)
            return null
          }
          q.options = [] // Fill blank has no options
          q.correct_answer = 0 // Standard for fill_blank
        }
        
        if (q.question_type === 'essay') {
          if (!q.correct_answer_text || typeof q.correct_answer_text !== 'string') {
            logger.error(`Question ${i + 1} essay needs correct_answer_text as sample answer`)
            return null
          }
          q.options = [] // Essay has no options
          q.correct_answer = 0 // Standard for essay
        }
        
        if (q.question_type === 'matching') {
          if (!Array.isArray(q.options) || !q.options.every((opt: any) => opt.left && opt.right)) {
            logger.error(`Question ${i + 1} matching needs options with left/right pairs`)
            return null
          }
          if (!Array.isArray(q.correct_answer)) {
            logger.error(`Question ${i + 1} matching needs correct_answer as array`)
            return null
          }
        }
        
        if (q.question_type === 'ordering') {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            logger.error(`Question ${i + 1} ordering needs array of items to order`)
            return null
          }
          if (!Array.isArray(q.correct_answer)) {
            logger.error(`Question ${i + 1} ordering needs correct_answer as array of indices`)
            return null
          }
        }
      }
      
      // Ensure required fields
      quiz.difficulty = quiz.difficulty || request.difficulty
      quiz.category = quiz.category || request.subject
      quiz.duration_minutes = quiz.duration_minutes || (request.questionCount * 2)
      
      return quiz
      
    } catch (error: any) {
      logger.error('Failed to parse AI response into valid quiz format', { 
        error: error.message,
        contentPreview: content.substring(0, 500),
        contentLength: content.length,
        parsePosition: error.message.includes('position') ? error.message.match(/position (\d+)/)?.[1] : null
      })
      
      // If it's a JSON parsing error, try to show the problematic section
      if (error.message.includes('position')) {
        const position = parseInt(error.message.match(/position (\d+)/)?.[1] || '0')
        const start = Math.max(0, position - 100)
        const end = Math.min(content.length, position + 100)
        logger.error('JSON error context', {
          problemSection: content.substring(start, end),
          errorPosition: position
        })
      }
      
      return null
    }
  }

  private fixCommonJSONIssues(jsonString: string): string {
    try {
      // Fix trailing commas in arrays and objects
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1')
      
      // Fix missing commas between array elements/objects
      jsonString = jsonString.replace(/}(\s*){/g, '},$1{')
      jsonString = jsonString.replace(/](\s*)\[/g, '],$1[')
      
      // Fix missing commas after quoted strings
      jsonString = jsonString.replace(/"(\s*)\n(\s*)"([^"]*?)"/g, '"$1,\n$2"$3"')
      
      // Fix missing quotes around property names (basic fix)
      jsonString = jsonString.replace(/(\n\s*)(\w+)(\s*:\s*)/g, '$1"$2"$3')
      
      return jsonString
    } catch (error) {
      logger.warn('Error fixing JSON issues', { error })
      return jsonString
    }
  }

  // Convert AI response to frontend-compatible format
  private convertToFrontendFormat(aiQuiz: any, request: SimpleQuizRequest): FrontendQuizData {
    return {
      title: aiQuiz.title || `Quiz: ${request.topic}`,
      description: aiQuiz.description || `Test your knowledge of ${request.topic}`,
      category: aiQuiz.category || request.subject,
      difficulty: request.difficulty,
      duration_minutes: aiQuiz.duration_minutes || Math.max(request.questionCount * 2, 15),
      image_url: '', // Empty for manual selection
      is_published: false, // Default to unpublished for manual review
      passing_score: 70, // Default passing score
      max_attempts: 0, // 0 = unlimited attempts
      questions: aiQuiz.questions.map((q: any, index: number) => {
        // Handle different answer formats based on question type
        let correctAnswer: number | string | number[] | string[]
        let correctAnswerText: string | null = null
        
        switch (q.question_type) {
          case 'multiple_choice':
          case 'true_false':
            correctAnswer = typeof q.correct_answer === 'number' ? q.correct_answer : 0
            break
          case 'fill_blank':
          case 'essay':
            correctAnswer = 0
            correctAnswerText = q.correct_answer_text || q.correct_answer || ''
            break
          case 'matching':
          case 'ordering':
            correctAnswer = Array.isArray(q.correct_answer) ? q.correct_answer : [0]
            break
          default:
            correctAnswer = 0
        }
        
        return {
          id: `temp_${Date.now()}_${index}`, // Temporary ID for frontend
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer: correctAnswer,
          correct_answer_text: correctAnswerText,
          explanation: q.explanation || '',
          points: q.points || 1, // Default points per question
          order_index: index,
          // Additional features matching your form
          difficulty_level: q.difficulty_level || 'medium',
          time_limit_seconds: q.time_limit_seconds || null,
          tags: q.tags || []
        }
      })
    }
  }

  // Test the AI connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testRequest: SimpleQuizRequest = {
        topic: 'Basic Math',
        subject: 'Mathematics',
        questionCount: 2,
        difficulty: 'beginner'
      }
      
      const result = await this.generateQuiz(testRequest)
      
      return {
        success: result.success,
        error: result.error
      }
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Note: For client-side usage, use the API endpoint /api/simple-ai-generation
// The SimpleAIQuizGenerator class should only be instantiated on the server side
