/**
 * AI Course Generator - Main Class Module
 * 
 * Main course generation class using the modular system.
 * Extracted from ai-course-generator.ts for better organization and maintainability.
 */

import type { CourseGenerationRequest, GeneratedCourse } from '@/types/consolidated-api'
import { AIClient } from './ai-client'
import { generateDefaultPrompt } from './prompt-generation'
import { generateMockCourse } from './mock-content-generator'
import { parseAIResponse } from './response-processor'

export class AICourseGenerator {
  private aiClient: AIClient
  
  constructor() {
    this.aiClient = new AIClient()
  }

  /**
   * Generate a complete course using AI
   */
  async generateCourse(
    request: CourseGenerationRequest,
    customPrompt?: string
  ): Promise<{ course: GeneratedCourse; error?: string }> {
    try {
      // Real Gemini API mode - generate course content
      const MOCK_MODE = false // Set to false when you have API billing set up

      if (MOCK_MODE) {
        // Return a mock course for testing
        const mockCourse = generateMockCourse(request)
        
        // Simulate API delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 3000))
        return { course: mockCourse }
      }

      // Using real Gemini API for course generation
      const prompt = customPrompt || generateDefaultPrompt(request)
      const content = await this.aiClient.generateContent(prompt)
      const parsedCourse = parseAIResponse(content)

      return { course: parsedCourse }
    } catch (error: any) {
      console.error('❌ Error generating course:', error)
      return { 
        course: {} as GeneratedCourse, 
        error: error.message || 'Failed to generate course' 
      }
    }
  }

  /**
   * Test the AI service connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Real Gemini API mode
      const MOCK_MODE = false // Set to false when you have API billing set up

      if (MOCK_MODE) {
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true }
      }
      
      return await this.aiClient.testConnection()
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Google Gemini API' 
      }
    }
  }
}