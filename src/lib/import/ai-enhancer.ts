import Anthropic from '@anthropic-ai/sdk'
import { QuestionImport } from './validation'
import { logger } from '@/lib/logger'
import { enhanceQuestionsWithGemini } from './ai-enhancer-gemini'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type AIProvider = 'claude' | 'gemini'

export interface AIEnhancement {
  explanation?: string
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  warnings?: string[]
  confidence: number // 0-1 score for reliability
}

export interface EnhancedQuestion extends QuestionImport {
  rowIndex: number
  aiEnhancement?: AIEnhancement
}

export interface AIEnhancementOptions {
  generateExplanations: boolean
  autoTag: boolean
  suggestDifficulty: boolean
  validateAnswers: boolean
  provider?: AIProvider // Add provider selection
}

/**
 * Batch enhance questions using selected AI provider
 */
export async function enhanceQuestions(
  questions: Array<QuestionImport & { rowIndex: number }>,
  options: AIEnhancementOptions
): Promise<EnhancedQuestion[]> {
  const provider = options.provider || 'claude'

  // Route to appropriate provider
  if (provider === 'gemini') {
    return enhanceQuestionsWithGemini(questions, options)
  }

  // Default to Claude
  return enhanceQuestionsWithClaude(questions, options)
}

/**
 * Batch enhance questions using Claude AI
 */
async function enhanceQuestionsWithClaude(
  questions: Array<QuestionImport & { rowIndex: number }>,
  options: AIEnhancementOptions
): Promise<EnhancedQuestion[]> {
  try {
    logger.info('[Claude Enhancer] Starting enhancement', {
      count: questions.length,
      options
    })

    // Filter questions that need enhancement
    const questionsNeedingHelp = questions.filter(q => {
      if (options.generateExplanations && !q.explanation) return true
      if (options.autoTag && !q.tags) return true
      if (options.suggestDifficulty && !q.difficulty) return true
      if (options.validateAnswers) return true
      return false
    })

    if (questionsNeedingHelp.length === 0) {
      logger.info('[AI Enhancer] No questions need enhancement')
      return questions.map(q => ({ ...q, aiEnhancement: undefined }))
    }

    // Build prompt for Claude
    const prompt = buildEnhancementPrompt(questionsNeedingHelp, options)

    logger.info('[Claude Enhancer] Calling Claude API', {
      questionsToEnhance: questionsNeedingHelp.length
    })

    // Try models in order of preference (2025 models)
    const modelsToTry = [
      'claude-sonnet-4-5-20250929',  // Latest Claude Sonnet 4.5
      'claude-sonnet-4-5',            // Alias for latest 4.5
      'claude-haiku-4-5',             // Cheaper alternative
      'claude-sonnet-3-7'             // Fallback to 3.7
    ]

    let message
    let lastError

    for (const modelName of modelsToTry) {
      try {
        logger.info('[Claude Enhancer] Trying model', { model: modelName })

        message = await anthropic.messages.create({
          model: modelName,
          max_tokens: 8000,
          temperature: 0.3,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })

        logger.info('[Claude Enhancer] Model worked', { model: modelName })
        break // Success! Exit loop
      } catch (error: any) {
        logger.warn('[Claude Enhancer] Model failed', { model: modelName, error: error.message })
        lastError = error
        continue // Try next model
      }
    }

    if (!message) {
      throw lastError || new Error('All Claude models failed')
    }

    // Parse response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    logger.info('[Claude Enhancer] Received response', {
      length: responseText.length
    })

    // Log first 500 chars of response for debugging
    logger.info('[Claude Enhancer] Response preview', {
      preview: responseText.substring(0, 500)
    })

    // Parse JSON response
    const enhancements = parseAIResponse(responseText, questionsNeedingHelp.length)

    // Merge enhancements with original questions
    logger.info('[Claude Enhancer] Merging enhancements with questions', {
      totalQuestions: questions.length,
      totalEnhancements: enhancements.length
    })

    const enhanced = questions.map(q => {
      const enhancement = enhancements.find(e => e.rowIndex === q.rowIndex)

      logger.info(`[Claude Enhancer] Merging question`, {
        questionRow: q.rowIndex,
        foundEnhancement: !!enhancement,
        enhancementRow: enhancement?.rowIndex
      })

      return {
        ...q,
        aiEnhancement: enhancement?.enhancement
      }
    })

    logger.info('[Claude Enhancer] Enhancement complete', {
      enhanced: enhancements.length,
      questionsWithAI: enhanced.filter(q => q.aiEnhancement).length
    })

    return enhanced

  } catch (error: any) {
    logger.error('[Claude Enhancer] Error', {
      error: error.message,
      stack: error.stack
    })

    // Return original questions without enhancements on error
    return questions.map(q => ({ ...q, aiEnhancement: undefined }))
  }
}

/**
 * Build prompt for Claude to enhance questions
 */
function buildEnhancementPrompt(
  questions: Array<QuestionImport & { rowIndex: number }>,
  options: AIEnhancementOptions
): string {
  const tasks: string[] = []

  if (options.generateExplanations) {
    tasks.push('- Generate clear, educational explanations for questions missing them')
  }
  if (options.autoTag) {
    tasks.push('- Suggest relevant tags (2-4 tags per question, e.g., "biology", "cells", "basic-concepts")')
  }
  if (options.suggestDifficulty) {
    tasks.push('- Suggest difficulty level: easy (basic recall), medium (understanding/application), or hard (analysis/synthesis)')
  }
  if (options.validateAnswers) {
    tasks.push('- Validate that the marked correct answer is actually correct; flag any issues or ambiguities')
  }

  return `You are an educational content expert helping to enhance quiz questions. Please analyze the following questions and provide enhancements.

TASKS:
${tasks.join('\n')}

QUESTIONS:
${questions.map((q, idx) => formatQuestionForAI(q, idx)).join('\n\n---\n\n')}

IMPORTANT INSTRUCTIONS:
1. Return your response as a JSON array with one object per question
2. Each object must have this structure:
{
  "rowIndex": <number>,
  "explanation": "<string or null>",
  "tags": ["tag1", "tag2"] or null,
  "difficulty": "easy|medium|hard" or null,
  "warnings": ["warning1", "warning2"] or [],
  "confidence": <0-1 number>
}

3. For explanations:
   - Keep them concise (1-3 sentences)
   - Explain WHY the answer is correct
   - Only provide if missing and needed

4. For tags:
   - Use lowercase, dash-separated format
   - Focus on: subject area, topic, concept type
   - Example: ["biology", "cell-structure", "organelles"]

5. For difficulty:
   - easy: Simple recall, definitions
   - medium: Understanding, application, multi-step
   - hard: Analysis, synthesis, complex reasoning

6. For warnings (answer validation):
   - Flag if correct answer seems wrong
   - Note ambiguous questions
   - Identify missing context
   - Flag trick questions or unfair wording

7. Confidence score:
   - 1.0 = Very confident in all suggestions
   - 0.5-0.9 = Moderately confident
   - <0.5 = Low confidence, human review recommended

8. Return ONLY the JSON array, no other text

Example response:
[
  {
    "rowIndex": 2,
    "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.",
    "tags": ["biology", "cell-biology", "organelles"],
    "difficulty": "easy",
    "warnings": [],
    "confidence": 0.95
  }
]`
}

/**
 * Format a question for the AI prompt
 */
function formatQuestionForAI(q: QuestionImport & { rowIndex: number }, index: number): string {
  let formatted = `QUESTION ${index + 1} (Row ${q.rowIndex}):
Question: ${q.question}
Type: ${q.type}
Current Difficulty: ${q.difficulty || 'NOT SET'}
Current Tags: ${q.tags || 'NOT SET'}
Current Explanation: ${q.explanation || 'NOT SET'}`

  if (q.type === 'multiple_choice') {
    formatted += `\nOptions:
  A) ${q.option_a || 'N/A'}
  B) ${q.option_b || 'N/A'}
  C) ${q.option_c || 'N/A'}
  D) ${q.option_d || 'N/A'}
Marked Correct Answer: ${['A', 'B', 'C', 'D'][q.correct_answer as number] || 'UNKNOWN'}`
  } else if (q.type === 'true_false') {
    formatted += `\nMarked Correct Answer: ${q.correct_answer_text}`
  } else if (q.type === 'fill_blank') {
    formatted += `\nCorrect Answer: ${q.correct_answer_text}`
  }

  return formatted
}

/**
 * Parse AI response into structured enhancements
 */
function parseAIResponse(
  response: string,
  expectedCount: number
): Array<{ rowIndex: number; enhancement: AIEnhancement }> {
  try {
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = response.trim()

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonStr)

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    // Validate and transform
    const enhancements = parsed.map((item: any) => {
      const enhancement = {
        explanation: item.explanation && item.explanation !== 'null' ? item.explanation : undefined,
        tags: item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : undefined,
        difficulty: item.difficulty && item.difficulty !== 'null' ? item.difficulty : undefined,
        warnings: Array.isArray(item.warnings) ? item.warnings : [],
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.8
      }

      logger.info('[AI Enhancer] Processing enhancement for row', {
        rowIndex: item.rowIndex,
        hasExplanation: !!enhancement.explanation,
        hasTags: !!enhancement.tags,
        hasDifficulty: !!enhancement.difficulty,
        warningCount: enhancement.warnings.length
      })

      return {
        rowIndex: item.rowIndex,
        enhancement
      }
    })

    logger.info('[AI Enhancer] Parsed enhancements', { count: enhancements.length })

    return enhancements

  } catch (error: any) {
    logger.error('[AI Enhancer] Failed to parse AI response', {
      error: error.message,
      response: response.substring(0, 500)
    })
    return []
  }
}

/**
 * Apply AI enhancements to a question
 */
export function applyEnhancement(
  question: QuestionImport,
  enhancement: AIEnhancement
): QuestionImport {
  return {
    ...question,
    explanation: enhancement.explanation || question.explanation,
    tags: enhancement.tags ? enhancement.tags.join(', ') : question.tags,
    difficulty: enhancement.difficulty || question.difficulty
  }
}
