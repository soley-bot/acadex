/**
 * AI Course Generator - Prompt Generation Module
 * 
 * Handles the generation of prompts for AI course creation.
 * Extracted from ai-course-generator.ts for better organization and maintainability.
 */

import type { CourseGenerationRequest } from '@/types/consolidated-api'

/**
 * Generate a comprehensive prompt for AI course generation
 */
export function generateDefaultPrompt(request: CourseGenerationRequest): string {
  const subjectArea = request.subject_area || 'General Education'
  const contentDepth = request.content_depth || 'detailed'
  const contentStyle = request.content_style || 'practical'
  const includeExamples = request.include_examples !== false
  const includeExercises = request.include_exercises !== false
  const richTextFormat = request.rich_text_format || false
  const contentLength = request.content_length || 'medium'
  const contentLanguage = request.language || 'English'
  
  // Content length guidelines
  const lengthGuidelines = {
    short: '200-400 words per lesson',
    medium: '400-800 words per lesson', 
    long: '800-1500 words per lesson'
  }
  
  // Content depth guidelines
  const depthGuidelines: Record<string, string> = {
    basic: 'High-level concepts and basic understanding',
    overview: 'High-level concepts and basic understanding',
    detailed: 'Comprehensive explanations with examples and context',
    comprehensive: 'Comprehensive explanations with examples and context',
    advanced: 'Deep technical knowledge with complex applications and theory'
  }
  
  // Content style guidelines
  const styleGuidelines: Record<string, string> = {
    academic: 'Formal, research-based, theoretical approach',
    practical: 'Hands-on, application-focused, real-world examples',
    conversational: 'Informal, engaging, easy-to-follow explanations'
  }

  return `You are an expert educational content creator specializing in ${subjectArea}. Create a comprehensive course structure with detailed modules, lessons, and content.

COURSE DETAILS:
- Title: ${request.title}
- Description: ${request.description}
- Subject Area: ${subjectArea}
- Level: ${request.level}
- Duration: ${request.duration}
- Number of Modules: ${request.module_count}
- Lessons per Module: ${request.lessons_per_module}
- Format: ${request.course_format}
- Content Language: ${contentLanguage}

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
✓ Use rich HTML formatting with proper headers (<h3>, <h4>), bullet points (<ul>, <li>), paragraphs (<p>), emphasis (<strong>, <em>), and code blocks (<pre>, <code>) for better readability
${request.include_lesson_quizzes ? `✓ Include ${request.quiz_questions_per_lesson || 3} quiz questions per lesson to test understanding` : ''}

CULTURAL AND LINGUISTIC ADAPTATION:
- Adapt examples and cultural references to be appropriate for ${contentLanguage} language context
- Use terminology and concepts that are familiar in the ${contentLanguage} educational context
- Ensure all technical terms are properly translated or explained in ${contentLanguage}
- Maintain educational standards appropriate for the language and cultural context

QUIZ REQUIREMENTS (if enabled):
${request.include_lesson_quizzes ? `
- Generate ${request.quiz_questions_per_lesson || 3} multiple choice questions per lesson in ${contentLanguage}
- Questions should test key concepts from the lesson content
- Provide 4 answer options (A, B, C, D) for each question in ${contentLanguage}
- Include clear explanations for correct answers in ${contentLanguage}
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
8. Format ALL lesson content with proper HTML markup:
   - Use <h3> for main section headers
   - Use <h4> for subsection headers
   - Use <p> for paragraphs
   - Use <ul> and <li> for bullet points
   - Use <ol> and <li> for numbered lists
   - Use <strong> for important terms
   - Use <em> for emphasis
   - Use <code> for inline code or technical terms
   - Use <pre><code> for code blocks
   - Use <blockquote> for quotes or important notes

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
      "description": "Module description",
      "order_index": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Formatted HTML lesson content with rich text markup",
          "order_index": 0,
          "duration_minutes": 30,
          "lesson_type": "interactive",
          "learning_objectives": ["objective1", "objective2"],
          "is_published": true,
          "quiz": ${request.include_lesson_quizzes ? `{
            "title": "Lesson Quiz",
            "description": "Test your understanding",
            "questions": [
              {
                "question": "Question text",
                "question_type": "multiple_choice",
                "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
                "correct_answer": 0,
                "explanation": "Explanation of correct answer",
                "difficulty_level": "medium",
                "points": 1
              }
            ],
            "time_limit_minutes": ${Math.max(2, (request.quiz_questions_per_lesson || 3) * 2)},
            "passing_score": 70,
            "difficulty": "${request.quiz_difficulty || 'medium'}"
          }` : 'null'}
        }
      ]
    }
  ]
}

Important Notes:
- Ensure ALL JSON is properly formatted and escaped
- Do not include any text before or after the JSON object
- All lesson content must include proper HTML formatting
- Include real, educational content that provides value to students
- Make sure quiz questions are directly related to lesson content
- Ensure the course provides a complete learning experience

Generate a complete, educational course with ${request.module_count} modules, each containing ${request.lessons_per_module} lessons, focusing on ${subjectArea} at ${request.level} level.`
}