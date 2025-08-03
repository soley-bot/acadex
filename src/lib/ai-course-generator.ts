import { GoogleGenerativeAI } from '@google/generative-ai'

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
      throw new Error('Google API key is required')
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
  }

  generateDefaultPrompt(request: CourseGenerationRequest): string {
    return `You are an expert English language curriculum designer creating a comprehensive course.

COURSE SPECIFICATIONS:
- Title: ${request.title}
- Description: ${request.description}
- Level: ${request.level}
- Duration: ${request.duration}
- Topics: ${request.topics.join(', ')}
- Learning Objectives: ${request.learning_objectives.join(', ')}
- Number of Modules: ${request.module_count}
- Lessons per Module: ${request.lessons_per_module}
- Format: ${request.course_format}

CONTENT REQUIREMENTS:
1. Create engaging, practical English learning content
2. Include real-world examples and scenarios
3. Progressive difficulty within each module
4. Interactive exercises and activities
5. Clear learning outcomes for each lesson
6. Proper grammar explanations with examples
7. Vocabulary building integrated naturally
8. Cultural context when appropriate

LESSON CONTENT GUIDELINES:
- Each lesson should be substantial (300-800 words)
- Include practical exercises
- Provide clear explanations
- Use examples relevant to ${request.level} learners
- Include vocabulary lists when appropriate
- Add practice activities or discussion points

RESPONSE FORMAT:
Respond with a valid JSON object in this exact structure:

{
  "course": {
    "title": "Course Title",
    "description": "Detailed course description (2-3 sentences)",
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
      "description": "Module description",
      "order_index": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Comprehensive lesson content with explanations, examples, exercises, and activities. Include vocabulary, grammar points, practice exercises, and real-world applications.",
          "order_index": 0,
          "duration_minutes": 30,
          "lesson_type": "text",
          "learning_objectives": ["objective1", "objective2"],
          "is_published": true
        }
      ]
    }
  ]
}

Generate exactly ${request.module_count} modules with ${request.lessons_per_module} lessons each.
Ensure all content is educational, engaging, and appropriate for ${request.level} English learners.
Make lesson content detailed and practical - students should be able to learn effectively from each lesson.

IMPORTANT: Respond only with the JSON object. No additional text or explanations.`
  }

  async generateCourse(
    request: CourseGenerationRequest,
    customPrompt?: string
  ): Promise<{ course: GeneratedCourse; error?: string }> {
    try {
      // Mock mode for testing when billing isn't set up
      const MOCK_MODE = true // Set to false when you have API billing set up
      
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
              is_published: true
            }))
          }))
        }
        
        // Simulate API delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 3000))
        return { course: mockCourse }
      }

      const prompt = customPrompt || this.generateDefaultPrompt(request)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      if (!content) {
        return { course: {} as GeneratedCourse, error: "No content generated" }
      }

      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.trim()
      let parsedCourse: GeneratedCourse

      try {
        parsedCourse = JSON.parse(cleanedContent)
      } catch (parseError) {
        // Try to extract JSON if there's extra text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedCourse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON response from AI')
        }
      }
      
      // Validate generated course structure
      const validatedCourse = this.validateCourseStructure(parsedCourse)
      
      return { course: validatedCourse }
    } catch (error: any) {
      console.error('AI Course Generation Error:', error)
      return { 
        course: {} as GeneratedCourse,
        error: error.message || 'Failed to generate course content' 
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
      // Mock mode - always return success for testing
      const MOCK_MODE = true // Set to false when you have API billing set up
      
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
