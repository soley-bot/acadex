// Quiz validation utilities shared between public and admin APIs

export const validateQuizTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Quiz title is required'
  }
  if (title.length > 200) {
    return 'Quiz title must be less than 200 characters'
  }
  return null
}

export const validateQuizDescription = (description?: string): string | null => {
  if (description && description.length > 2000) {
    return 'Quiz description must be less than 2000 characters'
  }
  return null
}

export const validateQuizDuration = (duration_minutes?: number): string | null => {
  if (duration_minutes !== undefined) {
    if (duration_minutes < 1 || duration_minutes > 600) {
      return 'Duration must be between 1 and 600 minutes'
    }
  }
  return null
}

export const validateQuizTimeLimit = (time_limit_minutes?: number, duration_minutes?: number): string | null => {
  if (time_limit_minutes !== undefined) {
    if (time_limit_minutes < 1 || time_limit_minutes > 600) {
      return 'Time limit must be between 1 and 600 minutes'
    }
    if (duration_minutes && time_limit_minutes < duration_minutes) {
      return 'Time limit should not be shorter than expected duration'
    }
  }
  return null
}

export const validatePassingScore = (passing_score?: number): string | null => {
  if (passing_score !== undefined) {
    if (passing_score < 0 || passing_score > 100) {
      return 'Passing score must be between 0 and 100'
    }
  }
  return null
}

export const validateMaxAttempts = (max_attempts?: number): string | null => {
  if (max_attempts !== undefined) {
    if (max_attempts < 1 || max_attempts > 10) {
      return 'Max attempts must be between 1 and 10'
    }
  }
  return null
}

export const validateQuestionText = (question: string): string | null => {
  if (!question || question.trim().length === 0) {
    return 'Question text is required'
  }
  if (question.length > 1000) {
    return 'Question text must be less than 1000 characters'
  }
  return null
}

export const validateQuestionPoints = (points?: number): string | null => {
  if (points !== undefined) {
    if (points < 0 || points > 100) {
      return 'Question points must be between 0 and 100'
    }
  }
  return null
}

export const validateQuestionOptions = (question_type: string, options?: any): string | null => {
  if (question_type === 'multiple_choice' || question_type === 'single_choice') {
    if (!options || !Array.isArray(options) || options.length < 2) {
      return 'Multiple choice questions must have at least 2 options'
    }
    if (options.length > 10) {
      return 'Multiple choice questions cannot have more than 10 options'
    }
    // Check for empty options
    for (let i = 0; i < options.length; i++) {
      if (!options[i] || options[i].toString().trim().length === 0) {
        return `Option ${i + 1} cannot be empty`
      }
    }
  }
  return null
}

// Comprehensive quiz validation
export const validateQuizData = (quizData: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate required fields
  const titleError = validateQuizTitle(quizData.title)
  if (titleError) errors.push(titleError)

  const descriptionError = validateQuizDescription(quizData.description)
  if (descriptionError) errors.push(descriptionError)

  const durationError = validateQuizDuration(quizData.duration_minutes)
  if (durationError) errors.push(durationError)

  const timeLimitError = validateQuizTimeLimit(quizData.time_limit_minutes, quizData.duration_minutes)
  if (timeLimitError) errors.push(timeLimitError)

  const passingScoreError = validatePassingScore(quizData.passing_score)
  if (passingScoreError) errors.push(passingScoreError)

  const maxAttemptsError = validateMaxAttempts(quizData.max_attempts)
  if (maxAttemptsError) errors.push(maxAttemptsError)

  // Validate category
  if (!quizData.category || quizData.category.trim().length === 0) {
    errors.push('Category is required')
  }

  // Validate difficulty
  const validDifficulties = ['beginner', 'intermediate', 'advanced']
  if (!quizData.difficulty || !validDifficulties.includes(quizData.difficulty)) {
    errors.push('Difficulty must be one of: beginner, intermediate, advanced')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Input sanitization utilities
export const sanitizeString = (input: string | null | undefined, maxLength = 1000): string => {
  if (!input) return ''
  return input.toString().trim().slice(0, maxLength)
}

export const sanitizeNumber = (input: number | null | undefined, min: number, max: number): number | null => {
  if (input === null || input === undefined) return null
  const num = Number(input)
  if (isNaN(num)) return null
  return Math.min(Math.max(num, min), max)
}