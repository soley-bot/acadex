import type { SimpleQuizRequest, QuestionType } from '../simple-ai-quiz-generator'
import { logger } from '../logger'

/**
 * Handles prompt building for AI quiz generation
 * Manages system prompts, question type examples, and localization
 */
export class PromptBuilder {
  /**
   * Build the system prompt that instructs the AI on how to generate quizzes
   */
  buildSystemPrompt(request: SimpleQuizRequest): string {
    return `You are a helpful educational content creator. Create a quiz about "${request.topic}" for students learning ${request.subject}.

Your task is to generate educational quiz questions that help students learn and practice their knowledge.

Instructions:
- Create ${request.questionCount} questions at ${request.difficulty} level
- Make questions clear and educational
- Include helpful explanations for each answer
- Use appropriate question types from: ${request.questionTypes?.join(', ') || 'multiple_choice, true_false'}
- Return only valid JSON format
- Questions should be appropriate for educational purposes

Remember to format answers correctly:
- Multiple choice: correct_answer as number index (0-3)
- True/False: correct_answer as 0 (True) or 1 (False)  
- Fill in blank: correct_answer as 0, correct_answer_text as the answer
- Essay: correct_answer as 0, correct_answer_text as sample answer`
  }

  /**
   * Build the main content generation prompt
   */
  buildContentPrompt(request: SimpleQuizRequest): string {
    // If custom prompt is provided, use it instead of the generated one
    if (request.customPrompt && request.customPrompt.trim()) {
      logger.info('Using custom prompt override instead of generated prompt')
      return request.customPrompt.trim()
    }

    const questionTypes = request.questionTypes || ['multiple_choice', 'true_false', 'fill_blank']
    const selectedExamples = this.buildQuestionTypeExamples(questionTypes, request)

    return `Create a ${request.difficulty} level quiz about "${request.topic}" in the subject of ${request.subject}.

Generate exactly ${request.questionCount} questions using ONLY these question types: ${questionTypes.join(', ')}.

STRICT REQUIREMENTS:
- ONLY use these question types: ${questionTypes.join(', ')}
- Do NOT generate any other question types
- Every question must be one of: ${questionTypes.join(' OR ')}
- If you see any question that is not ${questionTypes.join(' or ')}, do not include it

LANGUAGE REQUIREMENTS:
- Generate questions in ${request.language}
- Generate ALL explanations in ${request.explanationLanguage}
- If explanation language is "khmer", write explanations in Khmer script (ភាសាខ្មែរ)
- If explanation language is different from question language, translate explanations accordingly

QUESTION TYPE FORMATS (ONLY USE THESE):
${selectedExamples}

Return ONLY this JSON structure:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${request.subject}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(request.questionCount * 2, 15)},
  "questions": [
    // Your ${request.questionCount} questions here following the formats above
  ]
}

CRITICAL REQUIREMENTS:
- Exactly ${request.questionCount} questions
- Use correct answer formats for each question type
- For multiple_choice: correct_answer is index (0-3), 4 options
- For true_false: correct_answer is 0 or 1, 2 options ["True", "False"] 
- For fill_blank: correct_answer is 0, correct_answer_text has the answer
- For essay: correct_answer is 0, correct_answer_text has sample answer
- For matching: correct_answer is array of pair indices, options are [{"left":"...", "right":"..."}]
- For ordering: correct_answer is array of correct order indices
- ALL questions must have detailed explanations
- ALL explanations MUST be written in ${request.explanationLanguage}
- If explanations are in Khmer, use proper Khmer script and grammar
- Content should be educational and accurate
- Return ONLY valid JSON, no markdown, no additional text, no code blocks
- Ensure all strings are properly quoted and escaped
- Ensure no trailing commas in arrays or objects
- Each question must be separated by commas in the questions array`
  }

  /**
   * Build question type examples for the prompt
   */
  private buildQuestionTypeExamples(questionTypes: QuestionType[], request: SimpleQuizRequest): string {
    const examples = this.getQuestionTypeExamples(request)
    
    return questionTypes
      .filter(type => examples[type as keyof typeof examples])
      .map(type => examples[type as keyof typeof examples])
      .join(',\n    ')
  }

  /**
   * Get localized question type examples
   */
  private getQuestionTypeExamples(request: SimpleQuizRequest) {
    // Helper function to get explanation in the correct language
    const getLocalizedExplanation = (englishExplanation: string): string => {
      if (request.explanationLanguage === 'khmer') {
        return this.translateToKhmer(englishExplanation)
      }
      return englishExplanation
    }
    
    return {
      multiple_choice: `{
      "question": "What is the process by which plants make food?",
      "question_type": "multiple_choice", 
      "options": ["Photosynthesis", "Respiration", "Transpiration", "Germination"],
      "correct_answer": 0,
      "explanation": "${getLocalizedExplanation("Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.")}"
    }`,
      
      true_false: `{
      "question": "The sun is a star.",
      "question_type": "true_false",
      "options": ["True", "False"], 
      "correct_answer": 0,
      "explanation": "${getLocalizedExplanation("Yes, the sun is classified as a star - specifically a yellow dwarf star that provides light and heat to our solar system.")}"
    }`,
      
      fill_blank: `{
      "question": "The capital of France is ____.",
      "question_type": "fill_blank",
      "options": [],
      "correct_answer": 0,
      "correct_answer_text": "Paris",
      "explanation": "${getLocalizedExplanation("Paris has been the capital and largest city of France since the 12th century.")}"
    }`,
      
      essay: `{
      "question": "Explain the importance of biodiversity in ecosystems.",
      "question_type": "essay",
      "options": [],
      "correct_answer": 0,
      "correct_answer_text": "Biodiversity ensures ecosystem stability, provides resources, supports food webs, and increases resilience to environmental changes.",
      "explanation": "${getLocalizedExplanation("A comprehensive answer should cover ecosystem stability, food web complexity, resource availability, and adaptation benefits.")}"
    }`,
      
      matching: `{
      "question": "Match each planet with its characteristic:",
      "question_type": "matching", 
      "options": [
        {"left": "Mars", "right": "Red planet"},
        {"left": "Jupiter", "right": "Largest planet"},
        {"left": "Saturn", "right": "Has rings"}
      ],
      "correct_answer": [0, 1, 2],
      "explanation": "${getLocalizedExplanation("Mars is red due to iron oxide, Jupiter is the solar system's largest planet, and Saturn is famous for its ring system.")}"
    }`,
      
      ordering: `{
      "question": "Put these events in chronological order:",
      "question_type": "ordering",
      "options": ["World War I", "Industrial Revolution", "Renaissance", "World War II"],
      "correct_answer": [2, 1, 0, 3],
      "explanation": "${getLocalizedExplanation("The correct order is: Renaissance (14th-17th century), Industrial Revolution (18th-19th century), World War I (1914-1918), World War II (1939-1945).")}"
    }`
    }
  }

  /**
   * Translate common explanations to Khmer
   */
  private translateToKhmer(englishExplanation: string): string {
    // Map of common explanations to Khmer
    const explanationMap: { [key: string]: string } = {
      "Photosynthesis is the process where plants use sunlight": "រស្មីសំយោគគឺជាដំណើរការដែលរុក្ខជាតិប្រើប្រាស់ពន្លឺព្រះអាទិត្យ ទឹក និងកាបូនឌីអុកស៊ីតដើម្បីផលិតគ្លុយកូសនិងអុកស៊ីសែន។",
      "Yes, the sun is classified as a star": "បាទ ព្រះអាទិត្យត្រូវបានចាត់ទុកជាផ្កាយមួយ ជាពិសេសផ្កាយពណ៌លឿងដែលផ្តល់ពន្លឺនិងកំដៅដល់ប្រព័ន្ធព្រះអាទិត្យរបស់យើង។",
      "Paris has been the capital and largest city": "ទីក្រុងប៉ារីសបានក្លាយជារាជធានីនិងទីក្រុងធំបំផុតនៃប្រទេសបារាំងចាប់តាំងពីសតវត្សទី១២។",
      "A comprehensive answer should cover": "ចម្លើយដ៏ពេញលេញគួរតែបញ្ចូលអំពីស្ថិរភាពរបស់ប្រព័ន្ធអេកូឡូស៊ី ភាពស្មុគស្មាញនៃបណ្តាញអាហារ និងអត្ថប្រយោជន៍នៃការសម្រប់ខ្លួន។",
      "Mars is red due to iron oxide": "ភពអង្គារមានពណ៌ក្រហមដោយសារអាយុធអុកស៊ីត ភពព្រហស្បតិគឺជាភពធំបំផុតនៃប្រព័ន្ធព្រះអាទិត្យ ហើយភពសៅរ៍ល្បីដោយប្រព័ន្ធចិញ្រួនរបស់វា។",
      "The correct order is: Renaissance": "លំដាប់ត្រឹមត្រូវគឺ៖ របបប្រជាមតិ (សតវត្សទី១៤-១៧) បដិវត្តន៍ឧស្សាហកម្ម (សតវត្សទី១៨-១៩) សង្គ្រាមលោកលើកទី១ (១៩១ោ-១៩១៨) សង្គ្រាមលោកលើកទី២ (១៩៣៩-១៩ោៅ)។"
    }
        
    // Find best match or return generic Khmer explanation
    for (const [englishKey, khmerTranslation] of Object.entries(explanationMap)) {
      if (englishExplanation.includes(englishKey.substring(0, 20))) {
        return khmerTranslation
      }
    }
    
    // Generic Khmer explanation
    return "នេះជាការពន្យល់លម្អិតអំពីចម្លើយត្រឹមត្រូវសម្រាប់សំណួរនេះ។"
  }
}