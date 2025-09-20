/**
 * AI Course Generator - Mock Content Generator Module
 * 
 * Generates mock course content for testing and development purposes.
 * Extracted from ai-course-generator.ts for better organization and maintainability.
 */

import type { 
  CourseGenerationRequest,
  GeneratedCourse,
  GeneratedModule,
  GeneratedLesson,
  GeneratedQuiz,
  GeneratedQuizQuestion
} from '@/types/consolidated-api'

/**
 * Get a lesson title for a specific module and lesson index
 */
export function getLessonTitle(moduleIndex: number, lessonIndex: number, topics: string[]): string {
  const topic = topics[moduleIndex] || 'English Fundamentals'
  const lessonTitles = [
    `Introduction to ${topic}`,
    `Key Concepts in ${topic}`,
    `Practical Applications of ${topic}`,
    `Advanced ${topic} Techniques`,
    `Mastering ${topic}`
  ]
  return lessonTitles[lessonIndex] || `${topic} - Lesson ${lessonIndex + 1}`
}

/**
 * Generate comprehensive mock lesson content with proper HTML formatting
 */
export function generateMockLessonContent(moduleIndex: number, lessonIndex: number, level: string, topics: string[]): string {
  const topic = topics[moduleIndex] || 'English communication'
  
  return `<h3>${getLessonTitle(moduleIndex, lessonIndex, topics)}</h3>

<p>Welcome to this comprehensive lesson on <strong>${topic}</strong>. This lesson is designed for <em>${level}</em> level learners and will help you understand the fundamental concepts and practical applications.</p>

<h4>Learning Objectives</h4>
<ul>
  <li>Understand key concepts in ${topic}</li>
  <li>Apply knowledge through practical examples</li>
  <li>Build confidence in ${topic} skills</li>
  <li>Master essential techniques for real-world use</li>
</ul>

<h4>Key Concepts</h4>
<p>In this section, we'll explore the core principles of <strong>${topic}</strong> that form the foundation of effective communication and learning.</p>

<ol>
  <li><strong>Fundamental Principles:</strong> Understanding the basic concepts that govern ${topic}</li>
  <li><strong>Practical Application:</strong> How to apply these concepts in real-world scenarios</li>
  <li><strong>Common Challenges:</strong> Identifying and overcoming typical difficulties</li>
  <li><strong>Best Practices:</strong> Proven techniques for success</li>
</ol>

<h4>Practical Examples</h4>
<p>Let's look at some practical examples to illustrate these concepts:</p>

<blockquote>
  <p><strong>Example 1:</strong> In everyday conversation, ${topic} plays a crucial role in effective communication. Consider how you might use these skills when...</p>
</blockquote>

<p>Here's a step-by-step approach to mastering ${topic}:</p>

<pre><code>Step 1: Observe and listen carefully
Step 2: Practice regularly with focus
Step 3: Apply knowledge in real situations
Step 4: Reflect on your progress
Step 5: Seek feedback and improve</code></pre>

<h4>Practice Activities</h4>
<p>To reinforce your learning, try these interactive exercises:</p>

<ul>
  <li><strong>Activity 1:</strong> Practice ${topic} in a controlled environment</li>
  <li><strong>Activity 2:</strong> Apply your skills in real-world scenarios</li>
  <li><strong>Activity 3:</strong> Reflect on your experience and identify areas for improvement</li>
</ul>

<h4>Key Vocabulary</h4>
<p>Important terms to remember:</p>

<ul>
  <li><code>Term 1</code>: Essential concept in ${topic}</li>
  <li><code>Term 2</code>: Advanced technique for improvement</li>
  <li><code>Term 3</code>: Common challenge to overcome</li>
</ul>

<h4>Summary</h4>
<p>In this lesson, you've learned about the fundamental aspects of <strong>${topic}</strong>. Remember to practice regularly and apply these concepts in your daily learning. The key to success is consistent practice and continuous improvement.</p>

<p><em>Next lesson:</em> We'll build on these concepts and explore more advanced techniques in ${topic}.</p>`
}

/**
 * Generate a mock quiz for testing purposes
 */
export function generateMockQuiz(moduleIndex: number, lessonIndex: number, topics: string[], questionCount: number = 3): GeneratedQuiz {
  const topic = topics[moduleIndex] || 'English Fundamentals'
  
  const questions: GeneratedQuizQuestion[] = []
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      question: `What is the most important aspect of ${topic} that we covered in this lesson?`,
      question_type: 'multiple_choice',
      options: [
        `A) Understanding the basic concepts of ${topic}`,
        `B) Memorizing all vocabulary related to ${topic}`,
        `C) Avoiding practice until you feel confident`,
        `D) Focusing only on advanced techniques`
      ],
      correct_answer: 0, // A is correct
      explanation: `The correct answer is A. Understanding the basic concepts of ${topic} is fundamental to building strong skills and confidence in this area.`,
      difficulty_level: 'medium',
      points: 1,
      order_index: i
    })
  }
  
  return {
    title: `${topic} - Lesson ${lessonIndex + 1} Quiz`,
    description: `Test your understanding of the key concepts covered in this lesson on ${topic}.`,
    category: topic,
    difficulty: 'intermediate',
    duration_minutes: Math.max(2, questionCount * 2),
    passing_score: 70,
    questions: questions
  }
}

/**
 * Generate a complete mock course for testing
 */
export function generateMockCourse(request: CourseGenerationRequest): GeneratedCourse {
  return {
    course: {
      title: request.title,
      description: request.description,
      level: request.level,
      duration: request.duration,
      category: request.subject_area || 'General',
      price: 0,
      is_published: false,
      learning_objectives: [
        "Master essential English conversation skills",
        "Build confidence in speaking English", 
        "Understand grammar in practical contexts"
      ],
      prerequisites: ["Basic English alphabet knowledge"],
      what_you_will_learn: [
        "Daily conversation phrases and expressions",
        "Essential grammar rules with examples",
        "Pronunciation and speaking confidence"
      ],
      course_includes: ["Interactive lessons", "Practice exercises", "Progress tracking", "Certificate of completion"],
      target_audience: ["English language beginners", "Students wanting conversation skills", "Self-learners"]
    },
    modules: Array.from({ length: request.module_count }, (_, moduleIndex) => ({
      title: `Module ${moduleIndex + 1}: ${request.topics[moduleIndex] || 'English Fundamentals'}`,
      description: `This module covers essential aspects of ${request.topics[moduleIndex] || 'English learning'} with practical exercises and real-world applications.`,
      order_index: moduleIndex,
      lessons: Array.from({ length: request.lessons_per_module }, (_, lessonIndex) => ({
        title: `Lesson ${lessonIndex + 1}: ${getLessonTitle(moduleIndex, lessonIndex, request.topics)}`,
        content: generateMockLessonContent(moduleIndex, lessonIndex, request.level, request.topics),
        order_index: lessonIndex,
        duration_minutes: 25 + (lessonIndex * 5), // 25-40 minutes per lesson
        lesson_type: "interactive",
        learning_objectives: [
          `Learn key concepts for ${request.topics[moduleIndex] || 'English skills'}`,
          "Practice with real-world examples",
          "Build confidence through exercises"
        ],
        is_published: true,
        quiz: request.include_lesson_quizzes ? generateMockQuiz(moduleIndex, lessonIndex, request.topics, request.quiz_questions_per_lesson || 3) : undefined
      }))
    }))
  }
}