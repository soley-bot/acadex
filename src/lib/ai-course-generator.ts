import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIProvider = 'gemini' | 'claude'

export interface CourseGenerationRequest {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  topics: string[]
  learning_objectives: string[]
  module_count: number
  lessons_per_module: number
  course_format: 'text' | 'mixed' | 'interactive'
  custom_prompt?: string
  // Enhanced generation options
  subject_area?: string
  content_depth?: 'basic' | 'detailed' | 'comprehensive'
  content_style?: 'academic' | 'practical' | 'conversational'
  include_examples?: boolean
  include_exercises?: boolean
  rich_text_format?: boolean
  content_length?: 'short' | 'medium' | 'long'
  language_focus?: 'general' | 'business' | 'academic' | 'conversational'
  ai_provider?: AIProvider  // Choose which AI to use
  // Quiz generation options
  include_lesson_quizzes?: boolean
  quiz_questions_per_lesson?: number
  quiz_difficulty?: 'easy' | 'medium' | 'hard'
}

export interface GeneratedModule {
  title: string
  description: string
  order_index: number
  lessons: GeneratedLesson[]
}

export interface GeneratedLesson {
  title: string
  content: string
  order_index: number
  duration_minutes: number
  lesson_type: string
  learning_objectives: string[]
  is_published: boolean
  quiz?: GeneratedQuiz  // Optional quiz for the lesson
}

export interface GeneratedQuiz {
  title: string
  description: string
  duration_minutes: number
  passing_score: number
  questions: GeneratedQuizQuestion[]
}

export interface GeneratedQuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  order_index: number
}

export interface GeneratedCourseData {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: number
  is_published: boolean
  learning_objectives: string[]
  prerequisites: string[]
  what_you_will_learn: string[]
  course_includes: string[]
  target_audience: string[]
}

export interface GeneratedCourse {
  course: GeneratedCourseData
  modules: GeneratedModule[]
}

export class AICourseGenerator {
  private genAI: GoogleGenerativeAI
  private model: any
  
  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY environment variable is not set')
      throw new Error('Google API key is required. Please set GOOGLE_API_KEY in your .env.local file.')
    }
    
    const apiKey = process.env.GOOGLE_API_KEY
    console.log('🔑 Initializing Gemini AI with API key...')
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    console.log('✅ Gemini AI initialized successfully with 2.0 Flash Experimental (newest model with best reasoning)')
  }

  generateDefaultPrompt(request: CourseGenerationRequest): string {
    const subjectArea = request.subject_area || 'General Education'
    const contentDepth = request.content_depth || 'detailed'
    const contentStyle = request.content_style || 'practical'
    const includeExamples = request.include_examples !== false
    const includeExercises = request.include_exercises !== false
    const richTextFormat = request.rich_text_format || false
    const contentLength = request.content_length || 'medium'
    
    // Content length guidelines
    const lengthGuidelines = {
      short: '200-400 words per lesson',
      medium: '400-800 words per lesson', 
      long: '800-1500 words per lesson'
    }
    
    // Content depth guidelines
    const depthGuidelines = {
      basic: 'Cover fundamental concepts with simple explanations and basic examples',
      detailed: 'Provide thorough explanations with multiple examples, practical applications, and clear step-by-step guidance',
      comprehensive: 'Include extensive detail with advanced concepts, multiple perspectives, case studies, and comprehensive practice materials'
    }
    
    // Style guidelines
    const styleGuidelines = {
      academic: 'Use formal language, theoretical frameworks, and scholarly references',
      practical: 'Focus on real-world applications, hands-on examples, and actionable insights',
      conversational: 'Use friendly, accessible language with personal examples and engaging storytelling'
    }

    return `You are an expert curriculum designer creating a comprehensive ${subjectArea.toLowerCase()} course.

COURSE SPECIFICATIONS:
- Title: ${request.title}
- Description: ${request.description}
- Subject Area: ${subjectArea}
- Level: ${request.level}
- Duration: ${request.duration}
- Topics: ${request.topics.join(', ')}
- Learning Objectives: ${request.learning_objectives.join(', ')}
- Number of Modules: ${request.module_count}
- Lessons per Module: ${request.lessons_per_module}
- Format: ${request.course_format}

CONTENT REQUIREMENTS:
Content Depth: ${depthGuidelines[contentDepth]}
Content Style: ${styleGuidelines[contentStyle]}
Content Length: Each lesson should be ${lengthGuidelines[contentLength]}

LESSON STRUCTURE REQUIREMENTS:
${includeExamples ? '✓ Include practical examples and real-world scenarios' : ''}
${includeExercises ? '✓ Include practice exercises and activities' : ''}
✓ Clear learning outcomes for each lesson
✓ Progressive difficulty within each module
✓ Engaging and practical content for ${request.level} learners
${richTextFormat ? '✓ Use rich text formatting with headers, bullet points, and structured content' : '✓ Use clean, readable text format'}
${request.include_lesson_quizzes ? `✓ Include ${request.quiz_questions_per_lesson || 3} quiz questions per lesson to test understanding` : ''}

QUIZ REQUIREMENTS (if enabled):
${request.include_lesson_quizzes ? `
- Generate ${request.quiz_questions_per_lesson || 3} multiple choice questions per lesson
- Questions should test key concepts from the lesson content
- Provide 4 answer options (A, B, C, D) for each question
- Include clear explanations for correct answers
- Set appropriate difficulty level: ${request.quiz_difficulty || 'medium'}
- Quiz duration: ${Math.max(2, (request.quiz_questions_per_lesson || 3) * 2)} minutes
- Passing score: 70%` : 'No quizzes required for this course'}

CONTENT DEVELOPMENT GUIDELINES:
1. Create engaging, ${contentStyle} content appropriate for ${request.level} level
2. Ensure content is substantial and educational - students should learn effectively from each lesson
3. Include relevant vocabulary and key concepts integrated naturally
4. Provide clear explanations with step-by-step guidance
5. Use examples that are relevant to the ${subjectArea.toLowerCase()} field
6. Structure content logically with clear progression
7. Include practical applications and real-world connections
${richTextFormat ? '8. Format content with proper headers, lists, and emphasis for better readability' : ''}

RESPONSE FORMAT:
Respond with a valid JSON object in this exact structure:

{
  "course": {
    "title": "Course Title",
    "description": "Detailed course description (2-3 sentences) that clearly explains what students will learn and achieve",
    "level": "${request.level}",
    "duration": "${request.duration}",
    "price": 0,
    "is_published": false,
    "learning_objectives": ["objective1", "objective2", "objective3"],
    "prerequisites": ["prerequisite1", "prerequisite2"],
    "what_you_will_learn": ["skill1", "skill2", "skill3"],
    "course_includes": ["feature1", "feature2", "feature3"],
    "target_audience": ["audience1", "audience2"]
  },
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description explaining what this module covers",
      "order_index": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "${richTextFormat ? 'Comprehensive lesson content with proper markdown formatting including ## headers, **bold text**, *italic text*, bullet points, numbered lists, and structured sections. ' : ''}Detailed lesson content with explanations, examples, ${includeExercises ? 'exercises, ' : ''}and practical applications. Make this ${contentLength} length and ${contentStyle} in style. ${depthGuidelines[contentDepth]}",
          "order_index": 0,
          "duration_minutes": ${contentLength === 'short' ? '20' : contentLength === 'medium' ? '35' : '50'},
          "lesson_type": "${request.course_format}",
          "learning_objectives": ["objective1", "objective2"],
          "is_published": true${request.include_lesson_quizzes ? `,
          "quiz": {
            "title": "Lesson Title - Knowledge Check",
            "description": "Test your understanding of the key concepts covered in this lesson",
            "duration_minutes": ${Math.max(2, (request.quiz_questions_per_lesson || 3) * 2)},
            "passing_score": 70,
            "questions": [
              {
                "question": "Question text based on lesson content",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,
                "explanation": "Clear explanation of why this answer is correct",
                "order_index": 0
              }
            ]
          }` : ''}
        }
      ]
    }
  ]
}

Generate exactly ${request.module_count} modules with ${request.lessons_per_module} lessons each.
Ensure all content is educational, engaging, and appropriate for ${request.level} ${subjectArea.toLowerCase()} learners.
Make lesson content ${contentDepth} and ${contentStyle} - students should be able to learn effectively from each lesson.
${request.include_lesson_quizzes ? `\nIMPORTANT QUIZ INSTRUCTIONS:
- Generate exactly ${request.quiz_questions_per_lesson || 3} questions per lesson quiz
- Questions must directly relate to the lesson content and test key concepts
- All questions should be multiple choice with 4 options
- Provide clear, educational explanations for correct answers
- Make questions challenging but fair for ${request.level} level students` : ''}

IMPORTANT: Respond only with the JSON object. No additional text or explanations.`
  }

  async generateCourse(
    request: CourseGenerationRequest,
    customPrompt?: string
  ): Promise<{ course: GeneratedCourse; error?: string }> {
    try {
      // Real Gemini API mode - generate course content
      const MOCK_MODE = false // Set to false when you have API billing set up

      if (MOCK_MODE) {
        // Return a mock course for testing
        const mockCourse: GeneratedCourse = {
          course: {
            title: request.title,
            description: request.description,
            level: request.level,
            duration: request.duration,
            price: 0,
            is_published: false,
            learning_objectives: [
              "Master essential English conversation skills",
              "Build confidence in speaking English",
              "Understand grammar in practical contexts"
            ],
            prerequisites: ["Basic English alphabet knowledge"],
            what_you_will_learn: [
              "Daily conversation phrases and expressions",
              "Essential grammar rules with examples",
              "Pronunciation and speaking confidence"
            ],
            course_includes: ["Interactive lessons", "Practice exercises", "Progress tracking", "Certificate of completion"],
            target_audience: ["English language beginners", "Students wanting conversation skills", "Self-learners"]
          },
          modules: Array.from({ length: request.module_count }, (_, moduleIndex) => ({
            title: `Module ${moduleIndex + 1}: ${request.topics[moduleIndex] || 'English Fundamentals'}`,
            description: `This module covers essential aspects of ${request.topics[moduleIndex] || 'English learning'} with practical exercises and real-world applications.`,
            order_index: moduleIndex,
            lessons: Array.from({ length: request.lessons_per_module }, (_, lessonIndex) => ({
              title: `Lesson ${lessonIndex + 1}: ${getLessonTitle(moduleIndex, lessonIndex, request.topics)}`,
              content: generateMockLessonContent(moduleIndex, lessonIndex, request.level, request.topics),
              order_index: lessonIndex,
              duration_minutes: 25 + (lessonIndex * 5), // 25-40 minutes per lesson
              lesson_type: "interactive",
              learning_objectives: [
                `Learn key concepts for ${request.topics[moduleIndex] || 'English skills'}`,
                "Practice with real-world examples",
                "Build confidence through exercises"
              ],
              is_published: true,
              quiz: request.include_lesson_quizzes ? generateMockQuiz(moduleIndex, lessonIndex, request.topics, request.quiz_questions_per_lesson || 3) : undefined
            }))
          }))
        }
        
        // Simulate API delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 3000))
        return { course: mockCourse }
      }

      // Using real Gemini API for course generation
      console.log('🤖 Generating course with Gemini API...')
      const prompt = customPrompt || this.generateDefaultPrompt(request)
      
      console.log('📝 Sending prompt to Gemini API, length:', prompt.length)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      console.log('✅ Received response from Gemini API, length:', content?.length || 0)

      if (!content) {
        console.error('❌ No content generated from Gemini API')
        return { course: {} as GeneratedCourse, error: "No content generated from Gemini API" }
      }

      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.trim()
      console.log('🧹 Cleaning response content...')
      
      let parsedCourse: GeneratedCourse

      try {
        parsedCourse = JSON.parse(cleanedContent)
        console.log('✅ Successfully parsed JSON response')
      } catch (parseError) {
        console.log('⚠️ Initial JSON parse failed, trying to extract JSON from response...')
        // Try to extract JSON if there's extra text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            parsedCourse = JSON.parse(jsonMatch[0])
            console.log('✅ Successfully extracted and parsed JSON from response')
          } catch (extractError) {
            console.error('❌ Failed to parse extracted JSON:', extractError)
            throw new Error('Invalid JSON response from Gemini API - extracted content not valid')
          }
        } else {
          console.error('❌ No JSON found in response:', cleanedContent.substring(0, 200) + '...')
          throw new Error('Invalid JSON response from Gemini API - no JSON structure found')
        }
      }
      
      // Validate generated course structure
      console.log('🔍 Validating course structure...')
      const validatedCourse = this.validateCourseStructure(parsedCourse)
      console.log('✅ Course structure validation successful')
      
      return { course: validatedCourse }
    } catch (error: any) {
      console.error('❌ AI Course Generation Error:', error)
      return { 
        course: {} as GeneratedCourse,
        error: `Failed to generate course: ${error.message}` 
      }
    }
  }

  private validateCourseStructure(course: GeneratedCourse): GeneratedCourse {
    // Validate course object
    if (!course.course?.title || !course.course?.description) {
      throw new Error('Invalid course structure: missing title or description')
    }

    // Validate modules
    if (!course.modules || course.modules.length === 0) {
      throw new Error('Invalid course structure: no modules found')
    }

    // Validate each module has lessons
    course.modules.forEach((module, moduleIndex) => {
      if (!module.title) {
        throw new Error(`Invalid module ${moduleIndex}: missing title`)
      }
      
      if (!module.lessons || module.lessons.length === 0) {
        throw new Error(`Invalid module ${moduleIndex}: no lessons found`)
      }

      // Validate lesson structure
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title || !lesson.content) {
          throw new Error(`Invalid lesson ${lessonIndex} in module ${moduleIndex}: missing title or content`)
        }
        
        // Ensure content is substantial
        if (lesson.content.length < 100) {
          throw new Error(`Invalid lesson ${lessonIndex} in module ${moduleIndex}: content too short`)
        }
      })
    })

    return course
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Real Gemini API mode
      const MOCK_MODE = false // Set to false when you have API billing set up

      if (MOCK_MODE) {
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true }
      }
      
      const result = await this.model.generateContent("Hello! Please respond with just 'API connection successful' to test the connection.")
      const response = await result.response
      const content = response.text()

      if (content && content.includes('API connection successful')) {
        return { success: true }
      } else {
        return { success: false, error: "No valid response from API" }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Google Gemini API' 
      }
    }
  }
}

// Helper functions for mock content generation
function getLessonTitle(moduleIndex: number, lessonIndex: number, topics: string[]): string {
  const topic = topics[moduleIndex] || 'English Fundamentals'
  const lessonTitles = [
    `Introduction to ${topic}`,
    `Key Concepts in ${topic}`,
    `Practical Applications of ${topic}`,
    `Advanced ${topic} Techniques`,
    `Mastering ${topic}`
  ]
  return lessonTitles[lessonIndex] || `${topic} - Lesson ${lessonIndex + 1}`
}

function generateMockLessonContent(moduleIndex: number, lessonIndex: number, level: string, topics: string[]): string {
  const topic = topics[moduleIndex] || 'English communication'
  
  return `# ${getLessonTitle(moduleIndex, lessonIndex, topics)}

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand key concepts related to ${topic}
- Apply ${level}-level ${topic} skills in real situations
- Practice essential vocabulary and expressions

## Introduction
Welcome to this comprehensive lesson on ${topic}! This lesson is designed specifically for ${level} learners who want to improve their English skills through practical, engaging content.

## Key Vocabulary
Here are the essential words and phrases you'll learn in this lesson:

**Core Terms:**
- **Expression**: A common way of saying something
- **Context**: The situation where language is used  
- **Practice**: Repeated use to improve skills
- **Application**: Using what you've learned in real life

## Main Content

### Understanding ${topic}
${topic} is an essential skill for English learners at the ${level} level. Let's explore the key concepts:

1. **Foundation Concepts**: Start with basic understanding
2. **Practical Examples**: See how it works in real life
3. **Interactive Practice**: Try it yourself with guided exercises

### Real-World Examples
Here are some practical examples of ${topic} in everyday situations:

**Example 1: Daily Conversation**
- Situation: Meeting a new colleague
- Application: Using appropriate greetings and introductions
- Practice: Role-play different scenarios

**Example 2: Professional Context**
- Situation: Participating in a team meeting
- Application: Expressing opinions clearly and politely
- Practice: Discussion exercises with feedback

### Practice Exercises

**Exercise 1: Vocabulary Building**
Match the following terms with their definitions:
1. Context → The situation where language is used
2. Expression → A common way of saying something
3. Application → Using knowledge in real situations

**Exercise 2: Practical Application**
Try creating your own examples using the vocabulary and concepts from this lesson. Consider different situations where you might use ${topic} skills.

## Cultural Notes
Understanding cultural context is crucial for effective ${topic}. Here are some important considerations:
- Different cultures may have varying expectations
- Politeness levels can change based on the situation
- Practice helps build natural, confident communication

## Summary
In this lesson, you've learned:
✓ Key vocabulary related to ${topic}
✓ Practical applications in real-world contexts
✓ Cultural considerations for effective communication
✓ Hands-on practice exercises to build confidence

## Next Steps
1. Review the vocabulary list and practice pronunciation
2. Try the exercises with a study partner or tutor
3. Apply these concepts in your daily English conversations
4. Prepare for the next lesson by thinking about related topics

**Remember**: Consistent practice is the key to mastering ${topic}. Don't be afraid to make mistakes – they're part of the learning process!

---

*This lesson content is generated for demonstration purposes. In a real course, content would be tailored specifically to your learning needs and goals.*`
}

function generateMockQuiz(moduleIndex: number, lessonIndex: number, topics: string[], questionCount: number = 3): GeneratedQuiz {
  const topic = topics[moduleIndex] || 'English Fundamentals'
  const lessonTitle = getLessonTitle(moduleIndex, lessonIndex, topics)
  
  const questionPool = [
    {
      question: `What is the main focus of ${lessonTitle}?`,
      options: [
        `Understanding ${topic} in everyday situations`,
        'Memorizing grammar rules',
        'Perfect pronunciation only',
        'Academic writing skills'
      ],
      correct_answer: 0,
      explanation: `The lesson focuses on practical application of ${topic} in real-world contexts to build confidence and fluency.`
    },
    {
      question: `Which approach is most effective for learning ${topic}?`,
      options: [
        'Reading textbooks only',
        'Combining theory with practical exercises',
        'Listening to audio only',
        'Memorizing vocabulary lists'
      ],
      correct_answer: 1,
      explanation: 'Combining theoretical knowledge with hands-on practice helps reinforce learning and builds practical skills.'
    },
    {
      question: `What is the best way to practice ${topic} skills?`,
      options: [
        'Avoiding mistakes at all costs',
        'Practicing only in formal settings',
        'Regular practice with real-world applications',
        'Studying grammar rules extensively'
      ],
      correct_answer: 2,
      explanation: 'Regular practice in real-world contexts helps build confidence and natural language use.'
    },
    {
      question: `When learning ${topic}, what should you focus on?`,
      options: [
        'Perfect grammar from day one',
        'Building vocabulary and confidence gradually',
        'Advanced concepts immediately',
        'Formal academic language only'
      ],
      correct_answer: 1,
      explanation: 'Gradual building of vocabulary and confidence creates a solid foundation for language learning.'
    },
    {
      question: `What role does cultural context play in ${topic}?`,
      options: [
        'It is not important',
        'Only relevant for advanced learners',
        'Essential for effective communication',
        'Only matters in formal situations'
      ],
      correct_answer: 2,
      explanation: 'Understanding cultural context is crucial for effective communication and helps avoid misunderstandings.'
    }
  ]

  // Select random questions from the pool
  const selectedQuestions = questionPool
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount)
    .map((q, index) => ({
      ...q,
      order_index: index
    }))

  return {
    title: `${lessonTitle} - Knowledge Check`,
    description: `Test your understanding of the key concepts covered in ${lessonTitle}`,
    duration_minutes: Math.max(2, questionCount * 2), // 2 minutes per question minimum
    passing_score: 70,
    questions: selectedQuestions
  }
}
