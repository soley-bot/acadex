/**
 * AI Course Generator - Response Processor Module
 * 
 * Handles parsing and validation of AI-generated responses.
 * Extracted from ai-course-generator.ts for better organization and maintainability.
 */

import type { GeneratedCourse } from '@/types/consolidated-api'

/**
 * Parse and validate AI-generated course content
 */
export function parseAIResponse(content: string): GeneratedCourse {
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

  // Validate the course structure
  if (!parsedCourse.course || !parsedCourse.modules) {
    console.error('❌ Invalid course structure in response')
    throw new Error('Invalid course structure - missing required course or modules properties')
  }

  console.log('✅ Successfully validated course structure')
  console.log(`📚 Generated course: "${parsedCourse.course.title}" with ${parsedCourse.modules.length} modules`)
  
  // Log module and lesson structure
  parsedCourse.modules.forEach((module, moduleIndex) => {
    console.log(`📖 Module ${moduleIndex + 1}: "${module.title}" with ${module.lessons.length} lessons`)
    module.lessons.forEach((lesson, lessonIndex) => {
      const hasQuiz = lesson.quiz ? ' (with quiz)' : ''
      console.log(`   📝 Lesson ${lessonIndex + 1}: "${lesson.title}"${hasQuiz}`)
    })
  })

  return parsedCourse
}

/**
 * Validate a generated course structure
 */
export function validateCourseStructure(course: GeneratedCourse): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate course metadata
  if (!course.course) {
    errors.push('Missing course metadata')
  } else {
    if (!course.course.title) errors.push('Course title is required')
    if (!course.course.description) errors.push('Course description is required')
    if (!course.course.level) errors.push('Course level is required')
  }

  // Validate modules
  if (!course.modules || course.modules.length === 0) {
    errors.push('At least one module is required')
  } else {
    course.modules.forEach((module, moduleIndex) => {
      if (!module.title) errors.push(`Module ${moduleIndex + 1}: Title is required`)
      if (!module.lessons || module.lessons.length === 0) {
        errors.push(`Module ${moduleIndex + 1}: At least one lesson is required`)
      } else {
        module.lessons.forEach((lesson, lessonIndex) => {
          if (!lesson.title) errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Title is required`)
          if (!lesson.content) errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Content is required`)
        })
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}