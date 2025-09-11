const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuizQuestions() {
  console.log('🔍 Checking available quizzes in database...');
  
  // First, let's see what quizzes actually exist
  const { data: allQuizzes, error: allQuizzesError } = await supabase
    .from('quizzes')
    .select('id, title, total_questions')
    .limit(10);
    
  if (allQuizzesError) {
    console.error('❌ Error fetching all quizzes:', allQuizzesError);
    return;
  }
  
  console.log('📋 Available quizzes:');
  allQuizzes.forEach((quiz, index) => {
    console.log(`${index + 1}. ${quiz.title} (ID: ${quiz.id}) - ${quiz.total_questions} questions`);
  });
  
  if (allQuizzes.length > 0) {
    const firstQuiz = allQuizzes[0];
    console.log(`\n🔍 Checking questions for first quiz: ${firstQuiz.title}`);
    
    // Check quiz_questions for the first available quiz
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question, question_type, options')
      .eq('quiz_id', firstQuiz.id);
      
    if (questionsError) {
      console.error('❌ Questions fetch error:', questionsError);
      return;
    }
    
    console.log(`📝 Found ${questions?.length || 0} questions for this quiz`);
    if (questions && questions.length > 0) {
      console.log('First question:', {
        id: questions[0].id,
        question: questions[0].question?.substring(0, 100),
        type: questions[0].question_type,
        optionsCount: questions[0].options ? questions[0].options.length : 0
      });
    }
  } else {
    console.log('❌ No quizzes found in database!');
  }
}

checkQuizQuestions().catch(console.error);
