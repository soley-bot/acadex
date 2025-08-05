import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from './logger'

export interface QuizGenerationRequest {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topic: string
  question_count: number
  question_types: ('multiple_choice' | 'true_false' | 'fill_blank')[]
  duration_minutes: number
  passing_score: number
  include_explanations: boolean
  content_focus: string
  learning_objectives: string[]
  custom_prompt?: string
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: string[] // For multiple choice
  correct_answer: string | number
  explanation: string
  order_index: number
  points: number
}

export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  passing_score: number
  questions: GeneratedQuizQuestion[]
}

export class AIQuizGenerator {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'Google AI API key not configured. Please set GOOGLE_AI_API_KEY environment variable.' 
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent('Test connection')
      return { success: true }
    } catch (error: any) {
      logger.error('AI connection test failed:', error)
      return { 
        success: false, 
        error: `Connection failed: ${error.message}` 
      }
    }
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
    // Use real AI generation since API is configured
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'Google AI API not configured. Please check your GOOGLE_AI_API_KEY environment variable.' 
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = this.buildQuizPrompt(request)
      
      logger.info('Generating quiz with AI...', { title: request.title, questionCount: request.question_count })
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      logger.info('AI response received', { textLength: text.length })

      // Parse the JSON response
      const cleanedText = text.replace(/```json|```/g, '').trim()
      
      try {
        const generatedQuiz = JSON.parse(cleanedText)
        logger.info('Quiz parsed successfully', { questionsCount: generatedQuiz.questions?.length })
        return { success: true, quiz: generatedQuiz }
      } catch (parseError: any) {
        logger.error('JSON parsing failed', { error: parseError.message, rawText: cleanedText.substring(0, 500) })
        return { 
          success: false, 
          error: `Failed to parse AI response: ${parseError.message}` 
        }
      }

    } catch (error: any) {
      logger.error('AI quiz generation failed:', error)
      return { 
        success: false, 
        error: `Generation failed: ${error.message}` 
      }
    }
  }

  private async generateMockQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz: GeneratedQuiz }> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const questions: GeneratedQuizQuestion[] = []
    const questionTypesDistribution = this.distributeQuestionTypes(request.question_types, request.question_count)

    let questionIndex = 0

    // Generate multiple choice questions
    for (let i = 0; i < (questionTypesDistribution.multiple_choice || 0); i++) {
      questions.push(this.generateMockMultipleChoice(request, questionIndex++))
    }

    // Generate true/false questions
    for (let i = 0; i < (questionTypesDistribution.true_false || 0); i++) {
      questions.push(this.generateMockTrueFalse(request, questionIndex++))
    }

    // Generate fill-in-the-blank questions
    for (let i = 0; i < (questionTypesDistribution.fill_blank || 0); i++) {
      questions.push(this.generateMockFillBlank(request, questionIndex++))
    }

    // Shuffle questions for variety
    questions.sort(() => Math.random() - 0.5)
    questions.forEach((q, index) => q.order_index = index)

    const quiz: GeneratedQuiz = {
      title: request.title,
      description: request.description || `Test your knowledge of ${request.topic}`,
      category: request.category,
      difficulty: request.difficulty,
      duration_minutes: request.duration_minutes,
      passing_score: request.passing_score,
      questions
    }

    return { success: true, quiz }
  }

  private distributeQuestionTypes(types: string[], totalQuestions: number): Record<string, number> {
    const distribution: Record<string, number> = {
      multiple_choice: 0,
      true_false: 0,
      fill_blank: 0
    }

    // Even distribution with preference for multiple choice
    const questionsPerType = Math.floor(totalQuestions / types.length)
    const remainder = totalQuestions % types.length

    types.forEach(type => {
      distribution[type] = questionsPerType
    })

    // Distribute remainder, preferring multiple choice
    let remainingQuestions = remainder
    if (remainingQuestions > 0 && types.includes('multiple_choice')) {
      distribution.multiple_choice = (distribution.multiple_choice || 0) + remainingQuestions
      remainingQuestions = 0
    }

    return distribution
  }

  private generateMockMultipleChoice(request: QuizGenerationRequest, index: number): GeneratedQuizQuestion {
    const topics = this.getTopicVariations(request.topic, request.difficulty)
    const topic = topics[index % topics.length]

    const questions = [
      {
        question: `What is the most important aspect of ${topic}?`,
        options: [
          `Understanding the fundamentals of ${topic}`,
          'Memorizing all the rules',
          'Avoiding practice exercises',
          'Focusing only on theory'
        ],
        correct_answer: 0,
        explanation: `Understanding the fundamentals provides a solid foundation for mastering ${topic}.`
      },
      {
        question: `Which approach is most effective for learning ${topic}?`,
        options: [
          'Reading textbooks only',
          'Combining theory with practice',
          'Memorizing examples without understanding',
          'Avoiding challenging exercises'
        ],
        correct_answer: 1,
        explanation: 'Combining theoretical knowledge with practical exercises helps reinforce learning and builds real understanding.'
      },
      {
        question: `What is a common mistake when studying ${topic}?`,
        options: [
          'Practicing regularly',
          'Seeking help when confused',
          'Rushing through without understanding',
          'Taking notes while learning'
        ],
        correct_answer: 2,
        explanation: 'Rushing through material without proper understanding leads to gaps in knowledge and poor retention.'
      },
      {
        question: `How can you improve your understanding of ${topic}?`,
        options: [
          'Avoiding difficult examples',
          'Regular practice and review',
          'Studying only before tests',
          'Memorizing without application'
        ],
        correct_answer: 1,
        explanation: 'Regular practice and review help solidify understanding and improve long-term retention of concepts.'
      }
    ]

    const selectedQuestion = questions[index % questions.length] || questions[0]

    if (!selectedQuestion) {
      throw new Error('No questions available for generation')
    }

    return {
      question: selectedQuestion.question,
      question_type: 'multiple_choice',
      options: selectedQuestion.options,
      correct_answer: selectedQuestion.correct_answer,
      explanation: request.include_explanations ? selectedQuestion.explanation : '',
      order_index: index,
      points: 1
    }
  }

  private generateMockTrueFalse(request: QuizGenerationRequest, index: number): GeneratedQuizQuestion {
    const topics = this.getTopicVariations(request.topic, request.difficulty)
    const topic = topics[index % topics.length]

    const statements = [
      {
        statement: `${topic} requires consistent practice to master.`,
        correct: true,
        explanation: `Yes, consistent practice is essential for mastering ${topic} and building fluency.`
      },
      {
        statement: `Understanding ${topic} is only important for advanced learners.`,
        correct: false,
        explanation: `False. Understanding ${topic} is important for learners at all levels, as it builds foundational skills.`
      },
      {
        statement: `Making mistakes while learning ${topic} should be avoided at all costs.`,
        correct: false,
        explanation: `False. Mistakes are a natural part of the learning process and help identify areas for improvement.`
      },
      {
        statement: `${topic} can be effectively learned through real-world practice.`,
        correct: true,
        explanation: `True. Real-world practice helps apply theoretical knowledge and builds practical skills.`
      }
    ]

    const selectedStatement = statements[index % statements.length] || statements[0]

    if (!selectedStatement) {
      throw new Error('No statements available for generation')
    }

    return {
      question: `True or False: ${selectedStatement.statement}`,
      question_type: 'true_false',
      options: ['True', 'False'],
      correct_answer: selectedStatement.correct ? 0 : 1,
      explanation: request.include_explanations ? selectedStatement.explanation : '',
      order_index: index,
      points: 1
    }
  }

  private generateMockFillBlank(request: QuizGenerationRequest, index: number): GeneratedQuizQuestion {
    const topics = this.getTopicVariations(request.topic, request.difficulty)
    const topic = topics[index % topics.length]

    const sentences = [
      {
        sentence: `The key to mastering ${topic} is _______ practice.`,
        answer: 'consistent',
        explanation: `Consistent practice is essential for developing proficiency in ${topic}.`
      },
      {
        sentence: `When learning ${topic}, it's important to _______ both theory and practice.`,
        answer: 'combine',
        explanation: `Combining theory with practice provides a comprehensive understanding of ${topic}.`
      },
      {
        sentence: `Students often improve their ${topic} skills through _______ application.`,
        answer: 'real-world',
        explanation: `Real-world application helps students see the practical value of ${topic} concepts.`
      },
      {
        sentence: `Effective ${topic} learning requires _______ and patience.`,
        answer: 'dedication',
        explanation: `Dedication and patience are crucial for successfully mastering ${topic}.`
      }
    ]

    const selectedSentence = sentences[index % sentences.length] || sentences[0]

    if (!selectedSentence) {
      throw new Error('No sentences available for generation')
    }

    return {
      question: `Fill in the blank: ${selectedSentence.sentence}`,
      question_type: 'fill_blank',
      correct_answer: selectedSentence.answer,
      explanation: request.include_explanations ? selectedSentence.explanation : '',
      order_index: index,
      points: 1
    }
  }

  private getTopicVariations(baseTopic: string, difficulty: string): string[] {
    const variations = [baseTopic]
    
    // Add some context-aware variations
    if (baseTopic.toLowerCase().includes('grammar')) {
      variations.push('English grammar', 'grammar rules', 'grammatical structures')
    } else if (baseTopic.toLowerCase().includes('vocabulary')) {
      variations.push('word usage', 'vocabulary building', 'English vocabulary')
    } else if (baseTopic.toLowerCase().includes('speaking')) {
      variations.push('oral communication', 'spoken English', 'conversation skills')
    } else if (baseTopic.toLowerCase().includes('writing')) {
      variations.push('written communication', 'composition', 'writing skills')
    } else {
      variations.push(`${baseTopic} concepts`, `${baseTopic} principles`, `${baseTopic} skills`)
    }

    return variations
  }

  private buildQuizPrompt(request: QuizGenerationRequest): string {
    // Use custom prompt if provided, otherwise use default prompt
    if (request.custom_prompt && request.custom_prompt.trim()) {
      return this.buildCustomPrompt(request)
    }
    
    return this.buildDefaultPrompt(request)
  }

  private buildCustomPrompt(request: QuizGenerationRequest): string {
    const questionTypesDesc = request.question_types.map(type => {
      switch (type) {
        case 'multiple_choice': return 'Multiple Choice (4 options)'
        case 'true_false': return 'True/False'
        case 'fill_blank': return 'Fill in the Blank'
        default: return type
      }
    }).join(', ')

    return `${request.custom_prompt}

QUIZ SPECIFICATIONS:
- Title: ${request.title}
- Topic: ${request.topic}
- Category: ${request.category}
- Difficulty: ${request.difficulty}
- Number of questions: ${request.question_count}
- Question types: ${questionTypesDesc}
- Duration: ${request.duration_minutes} minutes
- Passing score: ${request.passing_score}%

REQUIRED JSON FORMAT:
Return a valid JSON object with this exact structure:

{
  "title": "${request.title}",
  "description": "${request.description || `Test your knowledge of ${request.topic}`}",
  "category": "${request.category}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${request.duration_minutes},
  "passing_score": ${request.passing_score},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice|true_false|fill_blank",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple_choice and true_false
      "correct_answer": 0, // Index for multiple_choice/true_false, or string for fill_blank
      "explanation": "Detailed explanation of why this is correct",
      "order_index": 0,
      "points": 1
    }
  ]
}

Ensure the JSON is valid and properly formatted.`
  }

  private buildDefaultPrompt(request: QuizGenerationRequest): string {
    const questionTypesDesc = request.question_types.map(type => {
      switch (type) {
        case 'multiple_choice': return 'Multiple Choice (4 options)'
        case 'true_false': return 'True/False'
        case 'fill_blank': return 'Fill in the Blank'
        default: return type
      }
    }).join(', ')

    return `Generate an educational quiz with the following specifications:

QUIZ DETAILS:
- Title: ${request.title}
- Topic: ${request.topic}
- Category: ${request.category}
- Difficulty: ${request.difficulty}
- Number of questions: ${request.question_count}
- Question types: ${questionTypesDesc}
- Duration: ${request.duration_minutes} minutes
- Passing score: ${request.passing_score}%
${request.content_focus ? `- Content focus: ${request.content_focus}` : ''}

LEARNING OBJECTIVES:
${request.learning_objectives.length > 0 
  ? request.learning_objectives.map(obj => `- ${obj}`).join('\n')
  : '- Test understanding of key concepts\n- Evaluate practical application skills\n- Assess knowledge retention'
}

QUESTION REQUIREMENTS:
- Create exactly ${request.question_count} questions
- Distribute question types as evenly as possible: ${questionTypesDesc}
- Focus on PRACTICAL grammar usage rather than theoretical concepts
- Test real-world application of ${request.topic} in everyday situations
- Include common mistakes and corrections students typically need
- Each question should help students use ${request.topic} correctly in communication
- Questions should be appropriate for ${request.difficulty} level learners
- All questions must be clear, unambiguous, and immediately applicable

GRAMMAR FOCUS GUIDELINES:
- Create questions that test correct usage in context
- Include examples from daily conversations, writing, and common situations
- Focus on practical application rather than rule memorization
- Test ability to identify and correct common errors
- Provide scenarios where students must choose the correct grammar form

QUESTION TYPE SPECIFICATIONS:
1. Multiple Choice: Provide exactly 4 options (A, B, C, D) with one correct answer
2. True/False: Provide clear statements that can be definitively true or false
3. Fill in the Blank: Create sentences with meaningful blanks that test key vocabulary or concepts

${request.include_explanations ? 'EXPLANATIONS: Include detailed explanations for each correct answer that help students understand the concept.' : 'EXPLANATIONS: Provide brief explanations for correct answers.'}

RESPONSE FORMAT:
Return a valid JSON object with this exact structure:

{
  "title": "${request.title}",
  "description": "${request.description || `Test your knowledge of ${request.topic}`}",
  "category": "${request.category}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${request.duration_minutes},
  "passing_score": ${request.passing_score},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice|true_false|fill_blank",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple_choice and true_false
      "correct_answer": 0, // Index for multiple_choice/true_false, or string for fill_blank
      "explanation": "Detailed explanation of why this is correct",
      "order_index": 0,
      "points": 1
    }
  ]
}

Ensure the JSON is valid and properly formatted. Focus on creating educational, meaningful questions that help students learn and retain knowledge about ${request.topic}.`
  }
}
