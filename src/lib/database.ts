// This file is now deprecated - use individual API modules from ./api/
// Keeping for backward compatibility

// Re-export everything from the new modular API
export * from './api'

// Legacy function exports for backward compatibility
import { quizAPI, userAPI } from './api'

export const getUserQuizAttempts = quizAPI.getUserQuizAttempts.bind(quizAPI)
export const getQuizQuestions = quizAPI.getQuizWithQuestions.bind(quizAPI)
export const submitQuizAttempt = quizAPI.createQuizAttempt.bind(quizAPI)
export const getQuizResults = quizAPI.getUserQuizAttempts.bind(quizAPI) // This might need a different method
export const updateUserProfile = userAPI.updateProfile.bind(userAPI)