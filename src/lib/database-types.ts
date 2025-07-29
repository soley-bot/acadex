// This file contains database schema utilities and validation functions
// to ensure TypeScript interfaces match the actual database schema

import { Course, CourseModule, CourseLesson, Quiz, User, Enrollment } from './supabase'

// Validation functions to ensure data matches database constraints
export function validateCourse(course: Partial<Course>): string[] {
  const errors: string[] = []
  
  console.log('🔍 [VALIDATION] Validating course data:', course)
  console.log('🔍 [VALIDATION] Title check - raw value:', JSON.stringify(course.title))
  console.log('🔍 [VALIDATION] Title check - type:', typeof course.title)
  console.log('🔍 [VALIDATION] Title check - trimmed:', course.title?.trim())
  console.log('🔍 [VALIDATION] Title check - is valid:', !!(course.title?.trim()))
  
  if (!course.title?.trim()) {
    console.error('❌ [VALIDATION] Title validation failed')
    errors.push('Title is required')
  }
  
  if (!course.description?.trim()) {
    console.error('❌ [VALIDATION] Description validation failed')
    errors.push('Description is required')
  }
  
  if (!course.instructor_id?.trim()) {
    console.error('❌ [VALIDATION] Instructor ID validation failed')
    errors.push('Instructor ID is required')
  }
  
  if (!course.instructor_name?.trim()) {
    console.error('❌ [VALIDATION] Instructor name validation failed')
    errors.push('Instructor name is required')
  }
  
  if (!course.category?.trim()) {
    console.error('❌ [VALIDATION] Category validation failed')
    errors.push('Category is required')
  }
  
  if (!course.duration?.trim()) {
    console.error('❌ [VALIDATION] Duration validation failed')
    errors.push('Duration is required')
  }
  
  if (course.level && !['beginner', 'intermediate', 'advanced'].includes(course.level)) {
    console.error('❌ [VALIDATION] Level validation failed:', course.level)
    errors.push('Level must be beginner, intermediate, or advanced')
  }
  
  if (course.status && !['draft', 'review', 'published', 'archived'].includes(course.status)) {
    console.error('❌ [VALIDATION] Status validation failed:', course.status)
    errors.push('Status must be draft, review, published, or archived')
  }
  
  if (course.price !== undefined && course.price < 0) {
    console.error('❌ [VALIDATION] Price validation failed:', course.price)
    errors.push('Price cannot be negative')
  }
  
  if (course.rating !== undefined && course.rating !== null && (course.rating < 0 || course.rating > 5)) {
    console.error('❌ [VALIDATION] Rating validation failed:', course.rating)
    errors.push('Rating must be between 0 and 5')
  }
  
  if (course.discount_percentage !== undefined && course.discount_percentage !== null && 
      (course.discount_percentage < 0 || course.discount_percentage > 100)) {
    errors.push('Discount percentage must be between 0 and 100')
  }
  
  console.log('🔍 [VALIDATION] Validation complete - errors:', errors)
  return errors
}

export function validateQuiz(quiz: Partial<Quiz>): string[] {
  const errors: string[] = []
  
  if (!quiz.title?.trim()) errors.push('Title is required')
  if (!quiz.description?.trim()) errors.push('Description is required')
  if (!quiz.category?.trim()) errors.push('Category is required')
  
  if (quiz.difficulty && !['beginner', 'intermediate', 'advanced'].includes(quiz.difficulty)) {
    errors.push('Difficulty must be beginner, intermediate, or advanced')
  }
  
  if (quiz.duration_minutes !== undefined && quiz.duration_minutes <= 0) {
    errors.push('Duration must be greater than 0')
  }
  
  if (quiz.passing_score !== undefined && 
      (quiz.passing_score < 0 || quiz.passing_score > 100)) {
    errors.push('Passing score must be between 0 and 100')
  }
  
  return errors
}

export function validateUser(user: Partial<User>): string[] {
  const errors: string[] = []
  
  if (!user.email?.trim()) errors.push('Email is required')
  if (!user.name?.trim()) errors.push('Name is required')
  
  if (user.role && !['student', 'instructor', 'admin'].includes(user.role)) {
    errors.push('Role must be student, instructor, or admin')
  }
  
  // Basic email validation
  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Invalid email format')
  }
  
  return errors
}

export function validateEnrollment(enrollment: Partial<Enrollment>): string[] {
  const errors: string[] = []
  
  if (!enrollment.user_id?.trim()) errors.push('User ID is required')
  if (!enrollment.course_id?.trim()) errors.push('Course ID is required')
  
  if (enrollment.progress !== undefined && 
      (enrollment.progress < 0 || enrollment.progress > 100)) {
    errors.push('Progress must be between 0 and 100')
  }
  
  return errors
}

// Helper functions for data transformation
export function prepareCourseForDatabase(course: Partial<Course>): Partial<Course> {
  // Only include fields that actually exist in the database
  const prepared: Partial<Course> = {}
  
  // Core required fields
  if (course.title) prepared.title = course.title
  if (course.description) prepared.description = course.description
  if (course.instructor_id) prepared.instructor_id = course.instructor_id
  if (course.instructor_name) prepared.instructor_name = course.instructor_name
  if (course.category) prepared.category = course.category
  if (course.duration) prepared.duration = course.duration
  
  // Optional fields that exist in database
  if (course.level) prepared.level = course.level
  if (course.price !== undefined) prepared.price = course.price
  if (course.image_url) prepared.image_url = course.image_url
  if (course.rating !== undefined) prepared.rating = course.rating || 0
  if (course.student_count !== undefined) prepared.student_count = course.student_count || 0
  if (course.is_published !== undefined) prepared.is_published = course.is_published || false
  
  console.log('🔧 [PREPARE] Original course data:', course)
  console.log('🔧 [PREPARE] Prepared database data:', prepared)
  
  return prepared
}

export function prepareQuizForDatabase(quiz: Partial<Quiz>): Partial<Quiz> {
  return {
    ...quiz,
    total_questions: quiz.total_questions || 0,
    is_published: quiz.is_published || false,
    passing_score: quiz.passing_score || 70,
    max_attempts: quiz.max_attempts || 0,
  }
}

// Database field mapping constants - match actual database schema
export const COURSE_FIELDS = [
  'id', 'title', 'description', 'instructor_id', 'instructor_name',
  'category', 'level', 'price', 'duration', 'image_url', 
  'rating', 'student_count', 'is_published', 
  'created_at', 'updated_at'
] as const

export const QUIZ_FIELDS = [
  'id', 'title', 'description', 'category', 'difficulty', 'duration_minutes',
  'total_questions', 'course_id', 'lesson_id', 'passing_score', 'max_attempts',
  'time_limit_minutes', 'is_published', 'created_at', 'updated_at'
] as const

export const USER_FIELDS = [
  'id', 'email', 'name', 'avatar_url', 'role', 'created_at', 'updated_at'
] as const
