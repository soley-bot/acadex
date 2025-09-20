/**
 * AI Course Generator - AI Client Module
 * 
 * Handles initialization of AI models and API communication.
 * Extracted from ai-course-generator.ts for better organization and maintainability.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIProvider = 'gemini' | 'claude'

/**
 * AI Client for course generation using Google Gemini AI
 */
export class AIClient {
  private genAI: GoogleGenerativeAI
  private model: any
  
  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('❌ GOOGLE_AI_API_KEY environment variable is not set')
      throw new Error('Google AI API key is required. Please set GOOGLE_AI_API_KEY in your .env.local file.')
    }
    
    const apiKey = process.env.GOOGLE_AI_API_KEY
    console.log('🔑 Initializing Gemini AI with API key...')
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    console.log('✅ Gemini AI initialized successfully with 2.5 Pro (latest stable model with enhanced reasoning)')
  }

  /**
   * Generate content using the AI model
   */
  async generateContent(prompt: string): Promise<string> {
    console.log('🤖 Generating content with Gemini API...')
    console.log('📝 Sending prompt to Gemini API, length:', prompt.length)
    
    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    console.log('✅ Received response from Gemini API, length:', content?.length || 0)
    
    if (!content) {
      console.error('❌ No content generated from Gemini API')
      throw new Error("No content generated from Gemini API")
    }
    
    return content
  }

  /**
   * Test the connection to the AI service
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.model.generateContent("Hello! Please respond with just 'API connection successful' to test the connection.")
      const response = await result.response
      const content = response.text()

      if (content && content.includes('API connection successful')) {
        return { success: true }
      } else {
        return { success: false, error: "No valid response from API" }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Google Gemini API' 
      }
    }
  }
}