import { logger } from '../logger'

/**
 * Utilities for fixing and parsing JSON responses from AI services
 * Handles common JSON formatting issues and truncation problems
 */
export class JSONUtils {
  /**
   * Fix common JSON issues in AI-generated responses
   */
  static fixCommonJSONIssues(jsonString: string): string {
    try {
      let fixed = jsonString
      
      // Fix trailing commas in arrays and objects
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1')
      
      // Fix missing commas between array elements/objects
      fixed = fixed.replace(/}(\s*){/g, '},$1{')
      fixed = fixed.replace(/](\s*)\[/g, '],$1[')
      
      // Fix missing commas after quoted strings followed by quotes
      fixed = fixed.replace(/"(\s*)\n(\s*)"([^"]*?)"/g, '"$1,\n$2"$3"')
      
      // Fix missing quotes around property names (basic fix)
      fixed = fixed.replace(/(\n\s*)(\w+)(\s*:\s*)/g, '$1"$2"$3')
      
      // Fix incomplete string values at end (often from truncation)
      // Look for strings that start with quote but don't end properly
      const incompleteStringMatch = fixed.match(/"[^"]*$/m)
      if (incompleteStringMatch) {
        const lastIncomplete = fixed.lastIndexOf(incompleteStringMatch[0])
        // Only fix if it's near the end (likely truncated)
        if (lastIncomplete > fixed.length - 200) {
          fixed = fixed.substring(0, lastIncomplete) + '""'
          logger.warn('Fixed incomplete string at end of JSON', {
            removedText: incompleteStringMatch[0]
          })
        }
      }
      
      // Fix incomplete objects or arrays at the end
      const openBraces = (fixed.match(/\{/g) || []).length
      const closeBraces = (fixed.match(/\}/g) || []).length
      const openBrackets = (fixed.match(/\[/g) || []).length
      const closeBrackets = (fixed.match(/\]/g) || []).length
      
      // Add missing closing braces
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces
        logger.warn('Adding missing closing braces', { missing })
        fixed += '}'.repeat(missing)
      }
      
      // Add missing closing brackets
      if (openBrackets > closeBrackets) {
        const missing = openBrackets - closeBrackets
        logger.warn('Adding missing closing brackets', { missing })
        fixed += ']'.repeat(missing)
      }
      
      return fixed
    } catch (error) {
      logger.warn('Error fixing JSON issues', { error })
      return jsonString
    }
  }

  /**
   * Extract JSON content from AI response, removing markdown and extra text
   */
  static extractJSONContent(content: string): string | null {
    try {
      // Clean the response
      let cleanContent = content.trim()
      
      // Log the raw content for debugging
      logger.info('Raw AI response', { 
        contentLength: content.length,
        contentPreview: content.substring(0, 200) + '...'
      })
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\s*|\s*```/g, '')
      
      // Remove any text before the first { and after the last }
      const firstBrace = cleanContent.indexOf('{')
      let lastBrace = cleanContent.lastIndexOf('}')
      
      if (firstBrace === -1) {
        logger.error('No valid JSON structure found in response - no opening brace', {
          contentPreview: cleanContent.substring(0, 500)
        })
        return null
      }
      
      // Handle truncated JSON responses (common when hitting MAX_TOKENS)
      if (lastBrace === -1 || lastBrace <= firstBrace) {
        logger.warn('Response appears to be truncated (no closing brace found)', {
          contentLength: cleanContent.length,
          firstBrace,
          lastBrace
        })
        
        // Try to repair truncated JSON
        const repairedContent = this.repairTruncatedJSON(cleanContent, firstBrace)
        if (repairedContent) {
          cleanContent = repairedContent
          lastBrace = cleanContent.lastIndexOf('}')
        }
        
        // If still no closing brace, can't parse
        if (lastBrace === -1 || lastBrace <= firstBrace) {
          logger.error('Cannot repair truncated JSON response', {
            contentPreview: cleanContent.substring(0, 500) + '...'
          })
          return null
        }
      }
      
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
      
      // Log cleaned content for debugging
      logger.info('Cleaned JSON content', {
        contentLength: cleanContent.length,
        contentPreview: cleanContent.substring(0, 200) + '...'
      })
      
      return cleanContent
    } catch (error: any) {
      logger.error('Error extracting JSON content', { error: error.message })
      return null
    }
  }

  /**
   * Attempt to repair truncated JSON by finding the last complete structure
   */
  private static repairTruncatedJSON(content: string, firstBrace: number): string | null {
    try {
      // Try to find where the JSON structure is likely incomplete
      // Look for incomplete questions array or objects
      const questionsIndex = content.indexOf('"questions"')
      if (questionsIndex === -1) {
        return null
      }

      // Try to find the end of the last complete question
      let searchFrom = questionsIndex
      let lastCompleteObjectEnd = -1
      
      // Look for complete question objects (ending with }")
      const questionEndPattern = /}\s*,?\s*(?=\{|$)/g
      let match
      while ((match = questionEndPattern.exec(content.substring(searchFrom))) !== null) {
        lastCompleteObjectEnd = searchFrom + match.index + match[0].indexOf('}') + 1
      }
      
      if (lastCompleteObjectEnd > -1) {
        // Try to construct valid JSON by closing the questions array and main object
        const beforeQuestions = content.substring(0, questionsIndex)
        const questionsContent = content.substring(questionsIndex, lastCompleteObjectEnd + 1)
        
        // Find if we need to close the questions array
        if (questionsContent.includes('[')) {
          const repairedContent = beforeQuestions + questionsContent.replace(/,\s*$/, '') + ']}'
          logger.info('Attempted to repair truncated JSON', {
            repairLength: repairedContent.length,
            lastCompleteObjectEnd
          })
          return repairedContent
        }
      }
      
      return null
    } catch (error) {
      logger.warn('Error repairing truncated JSON', { error })
      return null
    }
  }

  /**
   * Safe JSON parsing with detailed error logging
   */
  static safeParse(jsonString: string): any | null {
    try {
      return JSON.parse(jsonString)
    } catch (error: any) {
      logger.error('Failed to parse JSON', { 
        error: error.message,
        contentPreview: jsonString.substring(0, 500),
        contentLength: jsonString.length,
        parsePosition: error.message.includes('position') ? error.message.match(/position (\d+)/)?.[1] : null
      })
      
      // If it's a JSON parsing error, try to show the problematic section
      if (error.message.includes('position')) {
        const position = parseInt(error.message.match(/position (\d+)/)?.[1] || '0')
        const start = Math.max(0, position - 100)
        const end = Math.min(jsonString.length, position + 100)
        logger.error('JSON error context', {
          problemSection: jsonString.substring(start, end),
          errorPosition: position
        })
      }
      
      return null
    }
  }
}