'use client'

import { useState } from 'react'
import { SimpleAIGenerator } from '@/components/admin/SimpleAIGenerator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FrontendQuizData } from '@/lib/simple-ai-quiz-generator'
import { Brain, CheckCircle, Settings, Zap } from 'lucide-react'

export default function PublicAITestPage() {
  const [quizData, setQuizData] = useState<FrontendQuizData | null>(null)

  const handleAIGenerated = (generatedQuiz: FrontendQuizData) => {
    console.log('AI generated quiz:', generatedQuiz)
    setQuizData(generatedQuiz)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Quiz Generator</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Generate educational quizzes on any topic with multiple question types, language support, and detailed explanations.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Fast Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Generate quizzes in seconds with simple prompts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Customizable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Edit and customize all generated content
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Ready to Save</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Generated content is ready for your quiz forms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Generator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Try the AI Generator</CardTitle>
            <CardDescription>
              Click the button below to generate a sample quiz. Try topics like &ldquo;Photosynthesis&rdquo;, &ldquo;World War II&rdquo;, or &ldquo;JavaScript Basics&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleAIGenerator onQuizGenerated={handleAIGenerated} />
          </CardContent>
        </Card>

        {/* Generated Quiz Display */}
        {quizData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ Quiz Generated Successfully!</CardTitle>
              <CardDescription>
                Here&rsquo;s what the AI generated. In your admin form, this data would populate the form fields automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <strong>Title:</strong> {quizData.title}
                </div>
                <div>
                  <strong>Category:</strong> {quizData.category}
                </div>
                <div>
                  <strong>Difficulty:</strong> {quizData.difficulty}
                </div>
                <div>
                  <strong>Duration:</strong> {quizData.duration_minutes} minutes
                </div>
                <div className="md:col-span-2">
                  <strong>Description:</strong> {quizData.description}
                </div>
              </div>

              {/* Questions Preview */}
              <div>
                <h4 className="font-semibold mb-4">Generated Questions ({quizData.questions.length}):</h4>
                <div className="space-y-4">
                  {quizData.questions.slice(0, 3).map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <p className="font-medium">
                            Q{index + 1}: {question.question}
                          </p>
                          
                          {question.question_type === 'multiple_choice' && (
                            <div className="space-y-1 ml-4">
                              {question.options.map((option, optionIndex) => (
                                <div 
                                  key={optionIndex}
                                  className={`text-sm p-2 rounded ${
                                    question.correct_answer === optionIndex 
                                      ? 'bg-green-100 text-green-800 font-medium' 
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}. {typeof option === 'string' ? option : `${option.left} → ${option.right}`}
                                  {question.correct_answer === optionIndex && ' ✓'}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.question_type === 'true_false' && (
                            <div className="space-y-1 ml-4">
                              {question.options.map((option, optionIndex) => (
                                <div 
                                  key={optionIndex}
                                  className={`text-sm p-2 rounded ${
                                    question.correct_answer === optionIndex 
                                      ? 'bg-green-100 text-green-800 font-medium' 
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  {typeof option === 'string' ? option : `${option.left} → ${option.right}`}
                                  {question.correct_answer === optionIndex && ' ✓'}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.explanation && (
                            <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded ml-4">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {quizData.questions.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {quizData.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>

              {/* JSON Data Preview */}
              <details className="border rounded-lg">
                <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50">
                  View Raw Data (JSON) - This is what gets passed to your form
                </summary>
                <div className="p-4 border-t bg-gray-50">
                  <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto bg-white p-3 rounded border">
                    {JSON.stringify(quizData, null, 2)}
                  </pre>
                </div>
              </details>

              {/* Integration Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 mb-2">Integration Notes:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This data structure matches your existing quiz form fields</li>
                  <li>• Questions have temporary IDs that get replaced when saved to database</li>
                  <li>• All fields are pre-populated and ready for manual editing</li>
                  <li>• You can add this SimpleAIGenerator component to any quiz form</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How to Integrate */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Integrate This Into Your Quiz Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Add the Component</h4>
              <p className="text-sm text-muted-foreground">
                Import and add &lt;SimpleAIGenerator&gt; to your existing QuizForm or QuizBuilder components
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 2: Handle Generated Data</h4>
              <p className="text-sm text-muted-foreground">
                When AI generates a quiz, use the callback to populate your form fields
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 3: Edit and Save</h4>
              <p className="text-sm text-muted-foreground">
                Users can edit the generated content and save using your existing save logic
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Example Integration Code:</h5>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`// In your QuizForm component:
import { SimpleAIGenerator } from '@/components/admin/SimpleAIGenerator'

const handleAIGenerated = (aiQuiz) => {
  // Populate your form state
  setQuizTitle(aiQuiz.title)
  setQuizDescription(aiQuiz.description)
  setQuizCategory(aiQuiz.category)
  setQuestions(aiQuiz.questions)
  // ... populate other fields
}

// Add to your form JSX:
<SimpleAIGenerator onQuizGenerated={handleAIGenerated} />`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
