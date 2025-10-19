import { GoogleGenerativeAI } from '@google/generative-ai'
import { QuestionImport } from './validation'
import { logger } from '@/lib/logger'
import type { AIEnhancement, AIEnhancementOptions, EnhancedQuestion } from './ai-enhancer'

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

/**
 * Batch enhance questions using Google Gemini
 */
export async function enhanceQuestionsWithGemini(
  questions: Array<QuestionImport & { rowIndex: number }>,
  options: AIEnhancementOptions
): Promise<EnhancedQuestion[]> {
  try {
    logger.info('[Gemini Enhancer] Starting enhancement', {
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
      logger.info('[Gemini Enhancer] No questions need enhancement')
      return questions.map(q => ({ ...q, aiEnhancement: undefined }))
    }

    // Build prompt for Gemini
    const prompt = buildGeminiPrompt(questionsNeedingHelp, options)

    logger.info('[Gemini Enhancer] Calling Gemini API', {
      questionsToEnhance: questionsNeedingHelp.length
    })

    // Call Gemini API (2025 models)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',  // Current generation (Gemini 1.5 retired)
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8000,
      }
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    logger.info('[Gemini Enhancer] Received response', {
      length: responseText.length
    })

    // Parse JSON response
    const enhancements = parseGeminiResponse(responseText, questionsNeedingHelp.length)

    // Merge enhancements with original questions
    const enhanced = questions.map(q => {
      const enhancement = enhancements.find(e => e.rowIndex === q.rowIndex)
      return {
        ...q,
        aiEnhancement: enhancement?.enhancement
      }
    })

    logger.info('[Gemini Enhancer] Enhancement complete', {
      enhanced: enhancements.length
    })

    return enhanced

  } catch (error: any) {
    logger.error('[Gemini Enhancer] Error', {
      error: error.message,
      stack: error.stack
    })

    // Return original questions without enhancements on error
    return questions.map(q => ({ ...q, aiEnhancement: undefined }))
  }
}

/**
 * Build prompt for Gemini to enhance questions
 */
function buildGeminiPrompt(
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
${questions.map((q, idx) => formatQuestionForGemini(q, idx)).join('\n\n---\n\n')}

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

8. Return ONLY the JSON array, no other text, no markdown code blocks

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
 * Format a question for the Gemini prompt
 */
function formatQuestionForGemini(q: QuestionImport & { rowIndex: number }, index: number): string {
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
 * Parse Gemini response into structured enhancements
 */
function parseGeminiResponse(
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

    // Sometimes Gemini adds extra text before/after JSON
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    // Validate and transform
    const enhancements = parsed.map((item: any) => ({
      rowIndex: item.rowIndex,
      enhancement: {
        explanation: item.explanation || undefined,
        tags: item.tags || undefined,
        difficulty: item.difficulty || undefined,
        warnings: item.warnings || [],
        confidence: item.confidence || 0.8
      }
    }))

    logger.info('[Gemini Enhancer] Parsed enhancements', { count: enhancements.length })

    return enhancements

  } catch (error: any) {
    logger.error('[Gemini Enhancer] Failed to parse response', {
      error: error.message,
      response: response.substring(0, 500)
    })
    return []
  }
}
