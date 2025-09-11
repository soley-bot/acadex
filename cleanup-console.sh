#!/bin/bash
# Console Cleanup Script - Remove development console.log statements

echo "🧹 Cleaning up development console.log statements..."

# Clean up QuizBuilder verbose logging
sed -i '' '/console\.log.*Fetching questions for quiz/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Fetched questions:/,+5d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*useEffect: Updating from quiz prop/,+5d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*state update:/,+5d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Sending quiz data/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Duration in state/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Full state\.quiz/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Quiz updated successfully/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Quiz created successfully/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Saving questions for quiz/d' src/components/admin/QuizBuilder.tsx
sed -i '' '/console\.log.*Questions saved successfully/d' src/components/admin/QuizBuilder.tsx

# Clean up API route verbose logging (keep essential error logs)
sed -i '' '/console\.log.*Raw Supabase response:/,+15d' src/app/api/admin/quizzes/[id]/route.ts
sed -i '' '/console\.log.*Quiz fetched successfully:/,+5d' src/app/api/admin/quizzes/[id]/route.ts

# Clean up edit page verbose logging
sed -i '' '/console\.log.*Fetching quiz with ID/d' src/app/admin/quizzes/[id]/edit/page.tsx
sed -i '' '/console\.log.*Using headers/d' src/app/admin/quizzes/[id]/edit/page.tsx
sed -i '' '/console\.log.*API Response status/d' src/app/admin/quizzes/[id]/edit/page.tsx
sed -i '' '/console\.log.*API Response headers/d' src/app/admin/quizzes/[id]/edit/page.tsx
sed -i '' '/console\.log.*Successfully fetched quiz:/,+5d' src/app/admin/quizzes/[id]/edit/page.tsx

echo "✅ Console cleanup completed!"
