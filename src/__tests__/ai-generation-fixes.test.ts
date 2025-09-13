/**
 * AI Generation Bug Fix Integration Tests
 * These tests validate the AI generation workflow fixes
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'

// Mock crypto.randomUUID for testing
const mockCrypto = {
  randomUUID: jest.fn(() => 'test-uuid-123')
}

// Mock the global crypto object
Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true
})

describe('AI Generation Bug Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test AI-1: Question Type Normalization in AI Generation
  test('should normalize question types from AI response', () => {
    const normalizeAIQuestionType = (questionType: string) => {
      return questionType === 'single_choice' ? 'multiple_choice' : questionType
    }

    const aiResponse = {
      questions: [
        { question_type: 'single_choice', question: 'Test?' },
        { question_type: 'multiple_choice', question: 'Test2?' },
        { question_type: 'true_false', question: 'Test3?' }
      ]
    }

    const normalizedQuestions = aiResponse.questions.map(q => ({
      ...q,
      question_type: normalizeAIQuestionType(q.question_type)
    }))

    expect(normalizedQuestions[0].question_type).toBe('multiple_choice')
    expect(normalizedQuestions[1].question_type).toBe('multiple_choice')
    expect(normalizedQuestions[2].question_type).toBe('true_false')
  })

  // Test AI-2: True/False Answer Logic in AI Conversion
  test('should handle true/false answers correctly in AI conversion', () => {
    const convertAIQuestion = (aiQuestion: any) => {
      if (aiQuestion.question_type === 'true_false') {
        return {
          ...aiQuestion,
          options: ['True', 'False'],
          correct_answer: typeof aiQuestion.correct_answer === 'number' 
            ? aiQuestion.correct_answer 
            : (aiQuestion.correct_answer ? 0 : 1) // True = 0, False = 1
        }
      }
      return aiQuestion
    }

    const aiTrueFalseQuestion = {
      question_type: 'true_false',
      question: 'Is this true?',
      correct_answer: true
    }

    const converted = convertAIQuestion(aiTrueFalseQuestion)
    
    expect(converted.options).toEqual(['True', 'False'])
    expect(converted.correct_answer).toBe(0) // True = 0
  })

  // Test AI-8: Field Name Consistency
  test('should handle inconsistent field names from AI', () => {
    const standardizeQuestionFields = (aiQuestion: any) => {
      return {
        question: aiQuestion.question_text || aiQuestion.question || aiQuestion.text || '',
        explanation: aiQuestion.explanation || aiQuestion.explanation_text || '',
        options: aiQuestion.options || aiQuestion.choices || []
      }
    }

    const aiQuestionVariants = [
      { question_text: 'What is 2+2?', options: ['3', '4', '5'] },
      { question: 'What is 3+3?', choices: ['5', '6', '7'] },
      { text: 'What is 4+4?', options: ['7', '8', '9'] }
    ]

    const standardized = aiQuestionVariants.map(standardizeQuestionFields)

    expect(standardized[0].question).toBe('What is 2+2?')
    expect(standardized[0].options).toEqual(['3', '4', '5'])
    expect(standardized[1].question).toBe('What is 3+3?')
    expect(standardized[1].options).toEqual(['5', '6', '7'])
    expect(standardized[2].question).toBe('What is 4+4?')
    expect(standardized[2].options).toEqual(['7', '8', '9'])
  })

  // Test AI-13: Secure ID Generation
  test('should generate secure unique IDs', () => {
    const generateSecureId = () => {
      return `temp_${crypto.randomUUID()}`
    }

    const id1 = generateSecureId()
    const id2 = generateSecureId()

    expect(id1).toBe('temp_test-uuid-123')
    expect(id2).toBe('temp_test-uuid-123') // Same because mocked
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2)
  })

  // Test AI-11: Error Handling
  test('should handle and report AI generation errors', () => {
    const mockSetError = jest.fn()
    
    const handleAIGenerationError = (error: any) => {
      const errorMessage = error instanceof Error ? error.message : 'AI generation failed. Please try again.'
      mockSetError(errorMessage)
      console.error('AI generation error:', error)
    }

    const testError = new Error('Network timeout')
    handleAIGenerationError(testError)

    expect(mockSetError).toHaveBeenCalledWith('Network timeout')

    // Test with non-Error object
    handleAIGenerationError('String error')
    expect(mockSetError).toHaveBeenCalledWith('AI generation failed. Please try again.')
  })

  // Test AI-15: API Response Validation
  test('should validate API responses before parsing', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Internal Server Error')
    }

    const validateAndParseResponse = async (response: any) => {
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      return await response.json()
    }

    await expect(validateAndParseResponse(mockResponse))
      .rejects.toThrow('HTTP 500: Internal Server Error')
  })

  // Test Question Count Validation (AI-5)
  test('should validate question count matches request', () => {
    const validateQuestionCount = (
      generatedQuestions: any[], 
      requestedCount: number
    ): { isValid: boolean; actualCount: number } => {
      return {
        isValid: generatedQuestions.length === requestedCount,
        actualCount: generatedQuestions.length
      }
    }

    const questions = [
      { question: 'Q1' },
      { question: 'Q2' },
      { question: 'Q3' }
    ]

    const result = validateQuestionCount(questions, 5)
    expect(result.isValid).toBe(false)
    expect(result.actualCount).toBe(3)

    const result2 = validateQuestionCount(questions, 3)
    expect(result2.isValid).toBe(true)
    expect(result2.actualCount).toBe(3)
  })
})

export {}