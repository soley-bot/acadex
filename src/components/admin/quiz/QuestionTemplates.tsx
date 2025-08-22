import React from 'react'
import type { QuestionType } from '@/lib/supabase'

// Template interface for reusable question patterns
export interface QuestionTemplate {
  id: string
  name: string
  description: string
  category: 'general' | 'english' | 'grammar' | 'vocabulary' | 'reading' | 'listening'
  questionType: QuestionType
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // in seconds
  template: {
    question: string
    options?: string[] | any[]
    correct_answer?: any
    explanation?: string
    points?: number
    tags?: string[]
  }
  placeholders?: string[] // Variables that can be customized
  examples?: Array<{
    title: string
    question: string
    options?: string[] | any[]
    correct_answer?: any
  }>
}

// Comprehensive template library for English learning
export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Multiple Choice Templates
  {
    id: 'mc-vocabulary-synonym',
    name: 'Vocabulary - Synonym',
    description: 'Test vocabulary knowledge by asking for synonyms',
    category: 'vocabulary',
    questionType: 'multiple_choice',
    difficulty: 'medium',
    estimatedTime: 30,
    template: {
      question: 'Which word is closest in meaning to "{target_word}"?',
      options: ['{correct_synonym}', '{distractor_1}', '{distractor_2}', '{distractor_3}'],
      correct_answer: 0,
      explanation: '"{target_word}" means {definition}. "{correct_synonym}" is the best synonym.',
      points: 2,
      tags: ['vocabulary', 'synonyms']
    },
    placeholders: ['target_word', 'correct_synonym', 'distractor_1', 'distractor_2', 'distractor_3', 'definition'],
    examples: [
      {
        title: 'Happy/Joyful',
        question: 'Which word is closest in meaning to "happy"?',
        options: ['Joyful', 'Angry', 'Tired', 'Confused'],
        correct_answer: 0
      }
    ]
  },
  
  {
    id: 'mc-grammar-tense',
    name: 'Grammar - Verb Tense',
    description: 'Test understanding of verb tenses in context',
    category: 'grammar',
    questionType: 'multiple_choice',
    difficulty: 'medium',
    estimatedTime: 45,
    template: {
      question: 'Choose the correct form of the verb to complete the sentence:\n\n"{sentence_start} _____ {sentence_end}"',
      options: ['{correct_form}', '{wrong_tense_1}', '{wrong_tense_2}', '{wrong_form}'],
      correct_answer: 0,
      explanation: 'The sentence requires {tense_name} because {explanation_reason}.',
      points: 3,
      tags: ['grammar', 'verb-tenses']
    },
    placeholders: ['sentence_start', 'sentence_end', 'correct_form', 'wrong_tense_1', 'wrong_tense_2', 'wrong_form', 'tense_name', 'explanation_reason'],
    examples: [
      {
        title: 'Past Perfect',
        question: 'Choose the correct form of the verb to complete the sentence:\n\n"By the time she arrived, we _____ dinner."',
        options: ['had finished', 'finish', 'finished', 'finishing'],
        correct_answer: 0
      }
    ]
  },

  // Single Choice Templates
  {
    id: 'sc-reading-comprehension',
    name: 'Reading - Main Idea',
    description: 'Test reading comprehension with main idea questions',
    category: 'reading',
    questionType: 'single_choice',
    difficulty: 'hard',
    estimatedTime: 90,
    template: {
      question: 'Read the passage and choose the main idea:\n\n"{passage}"\n\nWhat is the main idea of this passage?',
      options: ['{main_idea}', '{detail_1}', '{detail_2}', '{opposite_idea}'],
      correct_answer: 0,
      explanation: 'The main idea is "{main_idea}" because {reasoning}.',
      points: 4,
      tags: ['reading', 'comprehension', 'main-idea']
    },
    placeholders: ['passage', 'main_idea', 'detail_1', 'detail_2', 'opposite_idea', 'reasoning']
  },

  // True/False Templates
  {
    id: 'tf-grammar-rule',
    name: 'Grammar - Rule Check',
    description: 'Test knowledge of grammar rules with true/false questions',
    category: 'grammar',
    questionType: 'true_false',
    difficulty: 'easy',
    estimatedTime: 20,
    template: {
      question: 'True or False: {grammar_statement}',
      options: ['True', 'False'],
      correct_answer: '{correct_index}',
      explanation: 'This statement is {correct_answer_text} because {explanation_detail}.',
      points: 1,
      tags: ['grammar', 'rules']
    },
    placeholders: ['grammar_statement', 'correct_index', 'correct_answer_text', 'explanation_detail'],
    examples: [
      {
        title: 'Adjective Order',
        question: 'True or False: In English, adjectives of size come before adjectives of color (e.g., "big red car").',
        options: ['True', 'False'],
        correct_answer: 0
      }
    ]
  },

  // Fill in the Blank Templates
  {
    id: 'fb-vocabulary-context',
    name: 'Vocabulary - Context Clues',
    description: 'Test vocabulary using context clues in sentences',
    category: 'vocabulary',
    questionType: 'fill_blank',
    difficulty: 'medium',
    estimatedTime: 40,
    template: {
      question: 'Fill in the blank with the most appropriate word:\n\n"{sentence_with_blank}"',
      correct_answer: '{correct_word}',
      explanation: 'The word "{correct_word}" fits best because {context_explanation}.',
      points: 2,
      tags: ['vocabulary', 'context']
    },
    placeholders: ['sentence_with_blank', 'correct_word', 'context_explanation'],
    examples: [
      {
        title: 'Weather Context',
        question: 'Fill in the blank with the most appropriate word:\n\n"The weather was so _______ that we decided to stay indoors all day."',
        correct_answer: 'terrible'
      }
    ]
  },

  // Essay Templates
  {
    id: 'essay-opinion',
    name: 'Essay - Opinion',
    description: 'Open-ended opinion essay questions',
    category: 'general',
    questionType: 'essay',
    difficulty: 'hard',
    estimatedTime: 600, // 10 minutes
    template: {
      question: 'Write a short essay (150-200 words) expressing your opinion on the following topic:\n\n"{essay_topic}"\n\nSupport your opinion with examples and reasons.',
      explanation: 'This is an opinion essay. Students should present a clear viewpoint with supporting evidence.',
      points: 10,
      tags: ['writing', 'opinion', 'essay']
    },
    placeholders: ['essay_topic'],
    examples: [
      {
        title: 'Technology in Education',
        question: 'Write a short essay (150-200 words) expressing your opinion on the following topic:\n\n"Should smartphones be allowed in classrooms?"\n\nSupport your opinion with examples and reasons.'
      }
    ]
  },

  // Matching Templates
  {
    id: 'match-vocabulary-definition',
    name: 'Matching - Word to Definition',
    description: 'Match vocabulary words with their definitions',
    category: 'vocabulary',
    questionType: 'matching',
    difficulty: 'medium',
    estimatedTime: 60,
    template: {
      question: 'Match each word with its correct definition:',
      options: [
        { left: '{word_1}', right: '{definition_1}' },
        { left: '{word_2}', right: '{definition_2}' },
        { left: '{word_3}', right: '{definition_3}' },
        { left: '{word_4}', right: '{definition_4}' }
      ],
      correct_answer: [0, 1, 2, 3],
      explanation: 'Each word should be matched with its corresponding definition.',
      points: 4,
      tags: ['vocabulary', 'definitions']
    },
    placeholders: ['word_1', 'definition_1', 'word_2', 'definition_2', 'word_3', 'definition_3', 'word_4', 'definition_4']
  },

  // Ordering Templates
  {
    id: 'order-sentence-structure',
    name: 'Ordering - Sentence Structure',
    description: 'Arrange words to form grammatically correct sentences',
    category: 'grammar',
    questionType: 'ordering',
    difficulty: 'medium',
    estimatedTime: 45,
    template: {
      question: 'Arrange the following words to form a grammatically correct sentence:',
      options: ['{word_1}', '{word_2}', '{word_3}', '{word_4}', '{word_5}'],
      correct_answer: ['{order_1}', '{order_2}', '{order_3}', '{order_4}', '{order_5}'],
      explanation: 'The correct sentence structure follows {grammar_pattern}.',
      points: 3,
      tags: ['grammar', 'sentence-structure']
    },
    placeholders: ['word_1', 'word_2', 'word_3', 'word_4', 'word_5', 'order_1', 'order_2', 'order_3', 'order_4', 'order_5', 'grammar_pattern'],
    examples: [
      {
        title: 'Simple Present',
        question: 'Arrange the following words to form a grammatically correct sentence:',
        options: ['plays', 'guitar', 'she', 'the', 'beautifully'],
        correct_answer: [2, 0, 3, 1, 4] // she plays the guitar beautifully
      }
    ]
  }
]

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  general: { label: 'General', color: 'gray', description: 'General purpose templates' },
  english: { label: 'English', color: 'blue', description: 'English language learning' },
  grammar: { label: 'Grammar', color: 'green', description: 'Grammar and syntax' },
  vocabulary: { label: 'Vocabulary', color: 'purple', description: 'Word knowledge and usage' },
  reading: { label: 'Reading', color: 'orange', description: 'Reading comprehension' },
  listening: { label: 'Listening', color: 'red', description: 'Listening comprehension' }
} as const

// Helper functions for template management
export function getTemplatesByCategory(category: string): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter(template => template.category === category)
}

export function getTemplatesByType(questionType: QuestionType): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter(template => template.questionType === questionType)
}

export function getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function searchTemplates(query: string): QuestionTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return QUESTION_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Template application function
export function applyTemplate(template: QuestionTemplate, variables: Record<string, any>) {
  const appliedTemplate = { ...template.template }
  
  // Replace placeholders in question
  if (template.placeholders && appliedTemplate.question) {
    let questionText = appliedTemplate.question
    template.placeholders.forEach(placeholder => {
      const value = variables[placeholder] || `{${placeholder}}`
      questionText = questionText.replace(new RegExp(`{${placeholder}}`, 'g'), value)
    })
    appliedTemplate.question = questionText
  }
  
  // Replace placeholders in options
  if (template.placeholders && appliedTemplate.options) {
    appliedTemplate.options = appliedTemplate.options.map(option => {
      if (typeof option === 'string') {
        let optionText = option
        template.placeholders!.forEach(placeholder => {
          const value = variables[placeholder] || `{${placeholder}}`
          optionText = optionText.replace(new RegExp(`{${placeholder}}`, 'g'), value)
        })
        return optionText
      }
      return option
    })
  }
  
  // Replace placeholders in explanation
  if (template.placeholders && appliedTemplate.explanation) {
    let explanationText = appliedTemplate.explanation
    template.placeholders.forEach(placeholder => {
      const value = variables[placeholder] || `{${placeholder}}`
      explanationText = explanationText.replace(new RegExp(`{${placeholder}}`, 'g'), value)
    })
    appliedTemplate.explanation = explanationText
  }
  
  return appliedTemplate
}
