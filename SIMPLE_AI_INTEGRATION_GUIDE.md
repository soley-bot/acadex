/* 
INTEGRATION GUIDE: Adding SimpleAIGenerator to your existing QuizForm.tsx

Your current QuizForm already has AI generation with AIQuizGenerator.
Here's how to add the SimpleAIGenerator alongside it or replace it.

OPTION 1: Add alongside existing AI (Recommended)
=================================================
*/

// 1. Import the new component (add to your existing imports)
import { SimpleAIGenerator } from '@/components/admin/SimpleAIGenerator'
import { FrontendQuizData } from '@/lib/simple-ai-quiz-generator'

// 2. Add this handler function to your QuizForm component
const handleSimpleAIGenerated = (aiQuiz: FrontendQuizData) => {
  console.log('Populating form with Simple AI data:', aiQuiz)
  
  // Map AI data to your existing form state
  // (These should match your existing useState variables)
  setTitle(aiQuiz.title)
  setDescription(aiQuiz.description)
  setCategory(aiQuiz.category)
  
  // Map difficulty
  if (aiQuiz.difficulty === 'beginner') setDifficulty('beginner')
  else if (aiQuiz.difficulty === 'intermediate') setDifficulty('intermediate') 
  else if (aiQuiz.difficulty === 'advanced') setDifficulty('advanced')
  
  setDuration(aiQuiz.duration_minutes)
  
  // Map questions to your format
  const mappedQuestions = aiQuiz.questions.map((q, index) => ({
    id: `ai_generated_${Date.now()}_${index}`,
    question: q.question,
    question_type: q.question_type,
    options: q.question_type === 'multiple_choice' ? q.options : [],
    correct_answer: q.correct_answer,
    explanation: q.explanation || '',
    order_index: index,
    // Add any other fields your questions need
  }))
  
  setQuestions(mappedQuestions)
  
  // Optional: Show success state
  setShowAISuccess(true)
  setTimeout(() => setShowAISuccess(false), 3000) // Hide after 3 seconds
}

// 3. Add the component to your JSX (find where you have your AI generation section)
// You can add this next to your existing AIQuizGenerator or replace it

// Example placement in your form:
<div className="space-y-4">
  <h3 className="text-lg font-semibold">AI Generation Options</h3>
  
  {/* Your existing AI generator */}
  <div className="p-4 border rounded-lg">
    <h4 className="font-medium mb-2">Advanced AI Generator</h4>
    <AIQuizGenerator 
      onQuizGenerated={handleQuizGenerated}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  </div>
  
  {/* New simple AI generator */}
  <div className="p-4 border rounded-lg bg-blue-50">
    <h4 className="font-medium mb-2">Simple AI Generator (New)</h4>
    <p className="text-sm text-gray-600 mb-3">
      Quick and reliable AI generation that populates the form directly
    </p>
    <SimpleAIGenerator onQuizGenerated={handleSimpleAIGenerated} />
  </div>
  
  {/* Success message */}
  {showAISuccess && (
    <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-800">
      ✅ Quiz form populated with AI content! You can now edit and save.
    </div>
  )}
</div>

/*
OPTION 2: Replace existing AI completely
=========================================
*/

// If you want to replace your existing AIQuizGenerator completely:

// 1. Comment out or remove your existing AIQuizGenerator import and usage
// 2. Replace it with SimpleAIGenerator using the code above
// 3. The handleSimpleAIGenerated function maps to your exact same form state

/*
INTEGRATION NOTES:
==================

1. FORM STATE COMPATIBILITY:
   - The SimpleAIGenerator outputs data that should map directly to your form fields
   - Check that your field names match (title, description, category, etc.)
   - The questions format should be compatible with your existing question structure

2. EXISTING SAVE LOGIC:
   - No changes needed! Your existing save logic will work with AI-generated data
   - The AI just populates the form fields, then user saves normally

3. VALIDATION:
   - Your existing form validation will work on AI-generated content
   - Users can edit AI content before saving

4. TESTING:
   - Test the integration on the demo page first: http://localhost:3000/quiz-form-demo
   - Then test in your actual admin form: /admin/quizzes/create

5. FALLBACK:
   - Keep your existing AI system as backup if needed
   - Users can choose which AI generator to use

EXACT INTEGRATION STEPS:
========================

1. Open your QuizForm.tsx file
2. Add the import at the top
3. Add the handleSimpleAIGenerated function
4. Add the SimpleAIGenerator component in your AI section
5. Test with a simple topic like "Basic Math"
6. Verify the form fields populate correctly
7. Test saving the generated quiz

This should give you a reliable AI generation system that works with your existing form!
*/
