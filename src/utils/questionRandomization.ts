/**
 * Question Randomization Utilities
 * Provides deterministic randomization for quiz questions to prevent predictable patterns
 */

/**
 * Seeded random number generator for deterministic randomization
 * Uses a simple LCG (Linear Congruential Generator) algorithm
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }
}

/**
 * Generate a deterministic seed from quiz attempt ID and question ID
 * This ensures randomization is consistent for the same attempt but different across attempts
 */
export function generateQuestionSeed(quizAttemptId: string, questionId: string): number {
  let hash = 0
  const str = `${quizAttemptId}-${questionId}`
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash)
}

/**
 * Fisher-Yates shuffle algorithm with seeded random
 */
export function shuffleArray<T>(array: T[], random: SeededRandom): T[] {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random.nextInt(0, i + 1)
    const temp = shuffled[i]
    const itemJ = shuffled[j]
    
    if (temp !== undefined && itemJ !== undefined) {
      shuffled[i] = itemJ
      shuffled[j] = temp
    }
  }
  
  return shuffled
}

/**
 * Randomize matching question options
 * Returns both shuffled left and right columns with mapping to original indices
 */
export interface RandomizedMatchingData {
  leftItems: Array<{
    content: string
    originalIndex: number
    displayIndex: number
  }>
  rightItems: Array<{
    content: string
    originalIndex: number
    displayIndex: number
  }>
  // Mapping from shuffled indices to original indices
  leftMapping: number[]
  rightMapping: number[]
}

export function randomizeMatchingQuestion(
  options: Array<{left: string; right: string}>,
  quizAttemptId: string,
  questionId: string
): RandomizedMatchingData {
  const seed = generateQuestionSeed(quizAttemptId, questionId)
  const random = new SeededRandom(seed)
  
  // Create arrays with original indices
  const leftItems = options.map((option, index) => ({
    content: option.left,
    originalIndex: index,
    displayIndex: index
  }))
  
  const rightItems = options.map((option, index) => ({
    content: option.right,
    originalIndex: index,
    displayIndex: index
  }))
  
  // Shuffle both arrays independently
  const shuffledLeft = shuffleArray(leftItems, random)
  const shuffledRight = shuffleArray(rightItems, random)
  
  // Update display indices
  shuffledLeft.forEach((item, index) => {
    item.displayIndex = index
  })
  shuffledRight.forEach((item, index) => {
    item.displayIndex = index
  })
  
  // Create mapping arrays
  const leftMapping = shuffledLeft.map(item => item.originalIndex)
  const rightMapping = shuffledRight.map(item => item.originalIndex)
  
  return {
    leftItems: shuffledLeft,
    rightItems: shuffledRight,
    leftMapping,
    rightMapping
  }
}

/**
 * Randomize ordering question options
 * Returns shuffled items with mapping to correct order
 */
export interface RandomizedOrderingData {
  items: Array<{
    content: string
    originalIndex: number
    correctPosition: number
    displayIndex: number
  }>
  // Mapping from shuffled display index to original index
  mapping: number[]
}

export function randomizeOrderingQuestion(
  options: string[],
  quizAttemptId: string,
  questionId: string
): RandomizedOrderingData {
  const seed = generateQuestionSeed(quizAttemptId, questionId)
  const random = new SeededRandom(seed)
  
  // Create items with position tracking
  const items = options.map((content, index) => ({
    content,
    originalIndex: index,
    correctPosition: index + 1, // 1-based positioning
    displayIndex: index
  }))
  
  // Shuffle the array
  const shuffledItems = shuffleArray(items, random)
  
  // Update display indices
  shuffledItems.forEach((item, index) => {
    item.displayIndex = index
  })
  
  // Create mapping array
  const mapping = shuffledItems.map(item => item.originalIndex)
  
  return {
    items: shuffledItems,
    mapping
  }
}

/**
 * Convert user answer from randomized indices back to original indices
 * For matching questions
 */
export function convertMatchingAnswerToOriginal(
  userAnswer: Record<string, number>,
  leftMapping: number[],
  rightMapping: number[]
): Record<string, number> {
  const originalAnswer: Record<string, number> = {}
  
  Object.entries(userAnswer).forEach(([leftDisplayIndex, rightDisplayIndex]) => {
    const originalLeftIndex = leftMapping[parseInt(leftDisplayIndex)]
    const originalRightIndex = rightMapping[rightDisplayIndex]
    
    if (originalLeftIndex !== undefined && originalRightIndex !== undefined) {
      originalAnswer[originalLeftIndex.toString()] = originalRightIndex
    }
  })
  
  return originalAnswer
}

/**
 * Convert user answer from randomized indices back to original indices
 * For ordering questions
 */
export function convertOrderingAnswerToOriginal(
  userAnswer: Record<string, number>,
  mapping: number[]
): Record<string, number> {
  const originalAnswer: Record<string, number> = {}
  
  Object.entries(userAnswer).forEach(([displayIndex, position]) => {
    const originalIndex = mapping[parseInt(displayIndex)]
    if (originalIndex !== undefined) {
      originalAnswer[originalIndex.toString()] = position
    }
  })
  
  return originalAnswer
}
