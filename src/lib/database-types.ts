// This file contains database schema utilities and validation functions
// to ensure TypeScript interfaces match the actual database schema

import { Course, CourseModule, CourseLesson, Quiz, User, Enrollment } from './supabase'

// Validation functions to ensure data matches database constraints
import { logger } from './logger'

export function validateCourseData(course: any): { isValid: boolean; errors: string[] } {
  logger.debug('Validating course data', { title: course.title, hasDescription: !!course.description })
  
  const errors: string[] = []

  if (!course.title?.trim()) {
    logger.validation('title', false, course.title)
    errors.push('Title is required')
  }

  if (!course.description?.trim()) {
    logger.validation('description', false, course.description)
    errors.push('Description is required')
  }

  if (!course.instructor_id?.trim()) {
    logger.validation('instructor_id', false, course.instructor_id)
    errors.push('Instructor ID is required')
  }

  if (!course.instructor_name?.trim()) {
    logger.validation('instructor_name', false, course.instructor_name)
    errors.push('Instructor name is required')
  }

  if (!course.category?.trim()) {
    logger.validation('category', false, course.category)
    errors.push('Category is required')
  }

  if (!course.duration || course.duration === '') {
    logger.validation('duration', false, course.duration)
    errors.push('Duration is required')
  }

  if (!course.level || !['beginner', 'intermediate', 'advanced'].includes(course.level)) {
    logger.validation('level', false, course.level)
    errors.push('Valid level is required (beginner, intermediate, advanced)')
  }

  if (!course.status || !['draft', 'published', 'archived'].includes(course.status)) {
    logger.validation('status', false, course.status)
    errors.push('Valid status is required (draft, published, archived)')
  }

  if (course.price !== null && (isNaN(Number(course.price)) || Number(course.price) < 0)) {
    logger.validation('price', false, course.price)
    errors.push('Price must be a valid positive number or null')
  }

  if (course.rating !== null && (isNaN(Number(course.rating)) || Number(course.rating) < 0 || Number(course.rating) > 5)) {
    logger.validation('rating', false, course.rating)
    errors.push('Rating must be between 0 and 5 or null')
  }

  const isValid = errors.length === 0

  logger.debug('Validation complete', { isValid, errorCount: errors.length, errors })

  return { isValid, errors }
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
export function prepareCourseForDatabase(course: any): any {
  logger.debug('Preparing course for database', { title: course.title, hasModules: !!course.modules })
  
  const prepared = {
    title: course.title,
    description: course.description,
    instructor_id: course.instructor_id,
    instructor_name: course.instructor_name,
    category: course.category,
    level: course.level,
    price: course.price === '' || course.price === null ? null : Number(course.price),
    duration: course.duration || null,
    image_url: course.image_url || null,
    learning_objectives: course.learning_objectives || [],
    is_published: course.is_published || false,
    student_count: course.student_count || 0,
    status: course.status || (course.is_published ? 'published' : 'draft'),
    rating: course.rating === '' || course.rating === null ? null : Number(course.rating),
    updated_at: new Date().toISOString()
  }

  logger.debug('Database preparation complete', { title: prepared.title, status: prepared.status })
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
  'thumbnail_url', 'video_preview_url', 'tags', 'prerequisites', 'learning_objectives',
  'status', 'published_at', 'archived_at', 'original_price', 'discount_percentage',
  'is_free', 'rating', 'student_count', 'is_published', 'created_at', 'updated_at'
] as const

export const QUIZ_FIELDS = [
  'id', 'title', 'description', 'category', 'difficulty', 'duration_minutes',
  'total_questions', 'course_id', 'lesson_id', 'passing_score', 'max_attempts',
  'time_limit_minutes', 'image_url', 'attempts_count', 'average_score',
  'is_published', 'created_at', 'updated_at'
] as const

export const USER_FIELDS = [
  'id', 'email', 'name', 'avatar_url', 'role', 'created_at', 'updated_at'
] as const
