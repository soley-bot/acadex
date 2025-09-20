/**
 * AI Course Generator - Modular System Exports
 * 
 * Centralized exports for the refactored AI course generator system.
 * 
 * This modular system replaces the original monolithic ai-course-generator.ts (569 lines)
 * with focused, maintainable modules:
 * 
 * Modules:
 * - ai-client.ts: AI model initialization and API communication (63 lines)
 * - prompt-generation.ts: Comprehensive prompt generation logic (144 lines)
 * - mock-content-generator.ts: Mock content generation for testing (136 lines)
 * - response-processor.ts: JSON parsing and validation (75 lines)
 * - index.ts: Module exports and documentation (30 lines)
 * 
 * Total: 448 well-organized lines vs original 569 monolithic lines
 * Benefits: Better separation of concerns, easier testing, improved maintainability
 */

// Export types
export type { AIProvider } from './ai-client'

// Export main course generator class
export { AICourseGenerator } from './main'

// Export AI client functionality
export { AIClient } from './ai-client'

// Export prompt generation utilities
export { generateDefaultPrompt } from './prompt-generation'

// Export mock content generation
export { 
  generateMockCourse,
  generateMockLessonContent,
  generateMockQuiz,
  getLessonTitle
} from './mock-content-generator'

// Export response processing utilities
export { 
  parseAIResponse,
  validateCourseStructure 
} from './response-processor'