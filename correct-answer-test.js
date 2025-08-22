/**
 * Test script to verify correct answer persistence fix
 * Run this with: node correct-answer-test.js
 */

// Simulate the save/load operations to test our fix

// Mock question data as it would be saved to database
const savedQuestionsInDatabase = [
  {
    id: 1,
    question: "What is the capital of France?",
    question_type: "multiple_choice",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct_answer: 0, // This should be ignored for multiple_choice
    correct_answer_text: JSON.stringify([2]), // This should be used
    explanation: "Paris is the capital of France"
  },
  {
    id: 2,
    question: "Select all prime numbers:",
    question_type: "multiple_choice",
    options: ["2", "3", "4", "5"],
    correct_answer: 0, // This should be ignored
    correct_answer_text: JSON.stringify([0, 1, 3]), // Multiple correct answers
    explanation: "2, 3, and 5 are prime numbers"
  },
  {
    id: 3,
    question: "The sky is blue.",
    question_type: "true_false",
    options: ["True", "False"],
    correct_answer: 0, // This should be used
    correct_answer_text: null,
    explanation: "The sky appears blue due to light scattering"
  },
  {
    id: 4,
    question: "Complete: The quick ___ fox",
    question_type: "fill_blank",
    options: [],
    correct_answer: 0, // This should be ignored
    correct_answer_text: "brown", // This should be used
    explanation: "It's a common phrase"
  },
  {
    id: 5,
    question: "Match the capitals:",
    question_type: "matching",
    options: [
      {left: "France", right: "Paris"},
      {left: "Germany", right: "Berlin"}
    ],
    correct_answer: 0, // This should be ignored
    correct_answer_text: JSON.stringify([{left: "France", right: "Paris"}, {left: "Germany", right: "Berlin"}]),
    explanation: "Standard country-capital pairs"
  }
];

// Our fixed loading logic
function loadQuestionCorrectAnswer(q) {
  // Handle correct_answer loading based on question type
  let correct_answer;
  if (['fill_blank', 'essay'].includes(q.question_type)) {
    // Text-based answers stored in correct_answer_text
    correct_answer = q.correct_answer_text || '';
  } else if (['multiple_choice', 'matching', 'ordering'].includes(q.question_type)) {
    // Array-based answers stored as JSON in correct_answer_text
    try {
      correct_answer = q.correct_answer_text ? JSON.parse(q.correct_answer_text) : [];
    } catch (err) {
      console.warn('Failed to parse correct_answer_text as JSON:', q.correct_answer_text);
      correct_answer = [];
    }
  } else {
    // Single numeric answers (single_choice, true_false) stored in correct_answer
    correct_answer = q.correct_answer || 0;
  }
  
  return correct_answer;
}

// Test our fix
console.log("Testing correct answer persistence fix...\n");

savedQuestionsInDatabase.forEach((dbQuestion, index) => {
  console.log(`Question ${index + 1}: ${dbQuestion.question}`);
  console.log(`Type: ${dbQuestion.question_type}`);
  console.log(`Stored correct_answer: ${dbQuestion.correct_answer}`);
  console.log(`Stored correct_answer_text: ${dbQuestion.correct_answer_text}`);
  
  const loadedCorrectAnswer = loadQuestionCorrectAnswer(dbQuestion);
  console.log(`Loaded correct_answer: ${JSON.stringify(loadedCorrectAnswer)}`);
  console.log(`Type of loaded answer: ${typeof loadedCorrectAnswer} ${Array.isArray(loadedCorrectAnswer) ? '(array)' : ''}`);
  console.log("---");
});

console.log("✅ Test completed! Verify that:");
console.log("1. Multiple choice questions load arrays from correct_answer_text");
console.log("2. Single choice/true_false load numbers from correct_answer");
console.log("3. Fill blank loads strings from correct_answer_text");
console.log("4. Matching/ordering load arrays from correct_answer_text");
