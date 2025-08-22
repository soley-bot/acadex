// QuizForm Phase 1 Test Suite
// Comprehensive tests for foundation components: validation, monitoring, and type safety

import { validateQuestion, validateQuizForm, Question, QuestionType } from '../lib/quizValidation'
import { quizFormMonitor } from '../lib/quizFormMonitoring'
import { FEATURE_FLAGS } from '../lib/featureFlags'

describe('QuizForm Phase 1: Foundation & Type Safety', () => {
  
  describe('Question Validation', () => {
    
    describe('Multiple Choice Questions', () => {
      it('should validate valid multiple choice questions', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correct_answer: [0],
          order_index: 0,
          points: 1
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
      
      it('should require at least 2 options', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris'],
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'INSUFFICIENT_OPTIONS')).toBe(true)
      })
      
      it('should reject empty options', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris', '', 'Berlin', 'Madrid'],
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'EMPTY_OPTIONS')).toBe(true)
      })
      
      it('should warn about duplicate options', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris', 'London', 'Paris', 'Madrid'],
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.warnings.some(w => w.field === 'options')).toBe(true)
      })
    })
    
    describe('Single Choice Questions', () => {
      it('should validate valid single choice questions', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'single_choice',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correct_answer: 0,
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should require single correct answer index', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'single_choice',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correct_answer: [0, 1], // Multiple answers not allowed
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
      })
    })
    
    describe('True/False Questions', () => {
      it('should validate valid true/false questions', () => {
        const question: Question = {
          question: 'Paris is the capital of France.',
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answer: 0,
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should enforce True/False options exactly', () => {
        const question: Question = {
          question: 'Paris is the capital of France.',
          question_type: 'true_false',
          options: ['Yes', 'No'], // Wrong options
          correct_answer: 0,
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'INVALID_TRUEFALSE_OPTIONS')).toBe(true)
      })
    })
    
    describe('Fill-in-the-Blank Questions', () => {
      it('should validate valid fill-blank questions', () => {
        const question: Question = {
          question: 'The capital of France is _____.',
          question_type: 'fill_blank',
          options: [],
          correct_answer: 'Paris',
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should require text answer', () => {
        const question: Question = {
          question: 'The capital of France is _____.',
          question_type: 'fill_blank',
          options: [],
          correct_answer: '', // Empty answer
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'BLANK_ANSWER_REQUIRED')).toBe(true)
      })
      
      it('should warn when no blank placeholder in question', () => {
        const question: Question = {
          question: 'What is the capital of France?', // No blanks
          question_type: 'fill_blank',
          options: [],
          correct_answer: 'Paris',
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.warnings.some(w => w.field === 'question')).toBe(true)
      })
    })
    
    describe('Essay Questions', () => {
      it('should validate valid essay questions', () => {
        const question: Question = {
          question: 'Describe the historical significance of Paris as France\'s capital.',
          question_type: 'essay',
          options: [],
          correct_answer: 'Sample rubric: Look for mentions of political, cultural, and economic factors...',
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should warn when no rubric provided', () => {
        const question: Question = {
          question: 'Describe the historical significance of Paris.',
          question_type: 'essay',
          options: [],
          correct_answer: '',
          explanation: '',
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.warnings.some(w => w.field === 'explanation')).toBe(true)
      })
    })
    
    describe('Matching Questions', () => {
      it('should validate valid matching questions', () => {
        const question: Question = {
          question: 'Match each country with its capital:',
          question_type: 'matching',
          options: [
            { left: 'France', right: 'Paris' },
            { left: 'Italy', right: 'Rome' }
          ],
          correct_answer: { France: 'Paris', Italy: 'Rome' },
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should require valid pair structure', () => {
        const question: Question = {
          question: 'Match each country with its capital:',
          question_type: 'matching',
          options: [
            { left: 'France', right: '' }, // Missing right value
            { left: '', right: 'Rome' } // Missing left value
          ],
          correct_answer: {},
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'INVALID_PAIRS')).toBe(true)
      })
    })
    
    describe('Ordering Questions', () => {
      it('should validate valid ordering questions', () => {
        const question: Question = {
          question: 'Put these events in chronological order:',
          question_type: 'ordering',
          options: ['World War I', 'World War II', 'Cold War', 'Space Race'],
          correct_answer: [0, 1, 2, 3],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(true)
      })
      
      it('should require at least 2 items', () => {
        const question: Question = {
          question: 'Put these events in chronological order:',
          question_type: 'ordering',
          options: ['World War I'], // Only one item
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'INSUFFICIENT_ITEMS')).toBe(true)
      })
    })
    
    describe('General Question Validation', () => {
      it('should require question text', () => {
        const question: Question = {
          question: '', // Empty question
          question_type: 'multiple_choice',
          options: ['A', 'B', 'C', 'D'],
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'QUESTION_REQUIRED')).toBe(true)
      })
      
      it('should warn about short questions', () => {
        const question: Question = {
          question: 'Short?', // Very short question
          question_type: 'multiple_choice',
          options: ['A', 'B', 'C', 'D'],
          correct_answer: [0],
          order_index: 0
        }
        
        const result = validateQuestion(question)
        expect(result.warnings.some(w => w.field === 'question')).toBe(true)
      })
      
      it('should validate points range', () => {
        const question: Question = {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correct_answer: [0],
          order_index: 0,
          points: 15 // Too many points
        }
        
        const result = validateQuestion(question)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.code === 'POINTS_RANGE')).toBe(true)
      })
    })
  })
  
  describe('Quiz Form Validation', () => {
    it('should validate complete quiz forms', () => {
      const questions: Question[] = [
        {
          question: 'What is the capital of France?',
          question_type: 'multiple_choice',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correct_answer: [0],
          order_index: 0
        },
        {
          question: 'Paris is the largest city in France.',
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answer: 0,
          order_index: 1
        }
      ]
      
      const result = validateQuizForm(questions)
      expect(result.isValid).toBe(true)
    })
    
    it('should require at least one question', () => {
      const questions: Question[] = []
      
      const result = validateQuizForm(questions)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.code === 'NO_QUESTIONS')).toBe(true)
    })
    
    it('should warn about very long quizzes', () => {
      const questions: Question[] = Array.from({ length: 60 }, (_, i) => ({
        question: `Question ${i + 1}?`,
        question_type: 'multiple_choice' as QuestionType,
        options: ['A', 'B', 'C', 'D'],
        correct_answer: [0],
        order_index: i
      }))
      
      const result = validateQuizForm(questions)
      expect(result.warnings.some(w => w.field === 'questions')).toBe(true)
    })
  })
  
  describe('Performance Monitoring', () => {
    beforeEach(() => {
      quizFormMonitor.clearStoredData()
    })
    
    it('should track user interactions', () => {
      const interaction = {
        action: 'question_edit',
        questionIndex: 0,
        questionType: 'multiple_choice',
        duration: 1500,
        feature: 'question_form'
      }
      
      quizFormMonitor.trackInteraction(interaction)
      const summary = quizFormMonitor.getPerformanceSummary()
      expect(summary.totalInteractions).toBe(1)
    })
    
    it('should track performance timing', () => {
      quizFormMonitor.startTiming('test_operation')
      
      // Simulate some work
      setTimeout(() => {
        const duration = quizFormMonitor.endTiming('test_operation')
        expect(duration).toBeGreaterThan(0)
      }, 10)
    })
    
    it('should track errors with context', () => {
      const error = new Error('Test error')
      const context = {
        component: 'QuizForm',
        action: 'save_question',
        questionIndex: 0,
        timestamp: Date.now()
      }
      
      expect(() => {
        quizFormMonitor.trackError(error, context)
      }).not.toThrow()
    })
    
    it('should provide health check status', () => {
      const health = quizFormMonitor.healthCheck()
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('issues')
      expect(health).toHaveProperty('metrics')
    })
  })
  
  describe('Feature Flags', () => {
    it('should have Phase 1 features enabled by default', () => {
      expect(FEATURE_FLAGS.ENHANCED_QUIZ_VALIDATION).toBe(true)
      expect(FEATURE_FLAGS.NEW_QUESTION_TYPES).toBe(true)
    })
    
    it('should have future phase features disabled by default', () => {
      expect(FEATURE_FLAGS.ENHANCED_QUESTION_CARDS).toBe(false)
      expect(FEATURE_FLAGS.PROGRESSIVE_DISCLOSURE).toBe(false)
      expect(FEATURE_FLAGS.BULK_OPERATIONS).toBe(false)
    })
  })
  
  describe('Type Safety', () => {
    it('should support all 7 question types', () => {
      const questionTypes: QuestionType[] = [
        'multiple_choice',
        'single_choice',
        'true_false',
        'fill_blank',
        'essay',
        'matching',
        'ordering'
      ]
      
      questionTypes.forEach(type => {
        const question: Question = {
          question: 'Test question',
          question_type: type,
          options: [],
          correct_answer: '',
          order_index: 0
        }
        
        // Should compile without errors
        expect(question.question_type).toBe(type)
      })
    })
  })
})

// Integration tests for the complete Phase 1 foundation
describe('Phase 1 Integration Tests', () => {
  it('should handle complete question lifecycle with all new features', () => {
    // Create a question of each type
    const questions: Question[] = [
      {
        question: 'What is React?',
        question_type: 'multiple_choice',
        options: ['Library', 'Framework', 'Language', 'Tool'],
        correct_answer: [0],
        order_index: 0,
        points: 2,
        difficulty_level: 'medium'
      },
      {
        question: 'React is a JavaScript library.',
        question_type: 'true_false',
        options: ['True', 'False'],
        correct_answer: 0,
        order_index: 1,
        points: 1,
        difficulty_level: 'easy'
      },
      {
        question: 'React was created by _____.',
        question_type: 'fill_blank',
        options: [],
        correct_answer: 'Facebook',
        order_index: 2,
        points: 1,
        difficulty_level: 'easy'
      }
    ]
    
    // Validate all questions
    const formValidation = validateQuizForm(questions)
    expect(formValidation.isValid).toBe(true)
    
    // Track performance
    quizFormMonitor.startTiming('question_validation')
    questions.forEach(q => validateQuestion(q))
    const duration = quizFormMonitor.endTiming('question_validation')
    
    expect(duration).toBeGreaterThan(0)
    
    // Check health
    const health = quizFormMonitor.healthCheck()
    expect(health.status).toBe('healthy')
  })
})
