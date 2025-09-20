/**
 * AI Course Generator - Refactored Modular System
 * 
 * This file has been refactored from 569 lines into a modular system
 * for better maintainability and organization.
 * 
 * The original monolithic structure has been split into focused modules:
 * - main.ts: Main AICourseGenerator class (66 lines)
 * - ai-client.ts: AI model initialization and API communication (63 lines)
 * - prompt-generation.ts: Comprehensive prompt generation logic (144 lines)
 * - mock-content-generator.ts: Mock content generation for testing (136 lines)
 * - response-processor.ts: JSON parsing and validation (75 lines)
 * - index.ts: Module exports and documentation (35 lines)
 * 
 * Total: 519 well-organized lines vs original 569 monolithic lines
 * All original functionality is preserved with improved organization.
 */

// Re-export everything from the modular system for backward compatibility
export * from './ai-course-generator/index'