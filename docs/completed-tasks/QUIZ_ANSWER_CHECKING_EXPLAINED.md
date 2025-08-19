# How Quiz Answer Checking Works

This guide explains how the quiz system stores and checks correct answers for each question type.

## 🎯 Overview

The quiz system uses **two database columns** to store correct answers:
- `correct_answer` (INTEGER) - for simple numeric answers
- `correct_answer_text` (TEXT) - for complex text/array answers

## 📋 Answer Storage & Checking by Question Type

### 1. **Multiple Choice** (`multiple_choice`)
**How it works**: Student selects ONE option from multiple choices

**Storage**:
```typescript
// Options: ["Apple", "Banana", "Cherry", "Date"]
correct_answer: 1        // Index of correct option (0-based)
correct_answer_text: null
```

**User Answer**: `1` (selected "Banana")

**Checking Logic**:
```typescript
isCorrect = userAnswer === question.correct_answer
// isCorrect = 1 === 1 → true ✅
```

### 2. **Single Choice** (`single_choice`)
**How it works**: Same as multiple choice but explicitly one selection

**Storage**: Same as multiple choice
**Checking**: Same as multiple choice

### 3. **True/False** (`true_false`)
**How it works**: Student picks True or False

**Storage**:
```typescript
// Options: ["True", "False"] (auto-generated)
correct_answer: 0        // 0 = True, 1 = False
correct_answer_text: null
```

**User Answer**: `0` (selected "True")

**Checking Logic**:
```typescript
isCorrect = userAnswer === question.correct_answer
// isCorrect = 0 === 0 → true ✅
```

### 4. **Fill in the Blank** (`fill_blank`)
**How it works**: Student types text answer

**Storage**:
```typescript
correct_answer: 0                    // Not used
correct_answer_text: "Paris"        // Correct text answer
```

**User Answer**: `"paris"` (user typed this)

**Checking Logic**:
```typescript
isCorrect = userAnswer.toLowerCase().trim() === 
           question.correct_answer_text.toLowerCase().trim()
// isCorrect = "paris" === "paris" → true ✅
```

### 5. **Essay** (`essay`)
**How it works**: Student writes long text answer

**Storage**:
```typescript
correct_answer: 0                           // Not used
correct_answer_text: "Sample essay answer"  // Reference answer
```

**User Answer**: `"My essay about..."` (any text)

**Checking Logic**:
```typescript
// Currently: Any non-empty answer is considered correct
isCorrect = userAnswer.trim().length > 0
// Future: Could use AI grading or manual review
```

### 6. **Matching** (`matching`)
**How it works**: Student matches left items to right items

**Example Question**: Match verbs to actions
- Left: ["go", "eat", "drink"]  
- Right: ["drinks", "goes", "eat"]
- Correct matches: go→goes (0→1), eat→eat (1→2), drink→drinks (2→0)

**Storage**:
```typescript
correct_answer: 0                    // Not used
correct_answer_text: "[1,2,0]"      // JSON array of correct matches
```

**User Answer**: `[1,2,0]` (array of selected right-side indices)

**Checking Logic**:
```typescript
const correctAnswer = JSON.parse(question.correct_answer_text) // [1,2,0]
isCorrect = userAnswer.length === correctAnswer.length && 
           userAnswer.every((val, index) => val === correctAnswer[index])
// isCorrect = [1,2,0] matches [1,2,0] → true ✅
```

### 7. **Ordering** (`ordering`)
**How it works**: Student arranges items in correct order

**Example Question**: Put letters in alphabetical order
- Items: ["C", "A", "B"]
- Correct order: ["A", "B", "C"] = indices [1, 2, 0]

**Storage**:
```typescript
correct_answer: 0                    // Not used  
correct_answer_text: "[1,2,0]"      // JSON array of correct order
```

**User Answer**: `[1,2,0]` (array representing final order)

**Checking Logic**:
```typescript
const correctAnswer = JSON.parse(question.correct_answer_text) // [1,2,0]
isCorrect = userAnswer.length === correctAnswer.length && 
           userAnswer.every((val, index) => val === correctAnswer[index])
// isCorrect = [1,2,0] matches [1,2,0] → true ✅
```

## 🔄 Complete Flow Example

### Creating a Quiz (Admin):
1. **Admin creates question**: "What's 2+2?"
2. **Selects type**: Multiple Choice
3. **Adds options**: ["3", "4", "5", "6"]
4. **Sets correct answer**: Index 1 ("4")
5. **System stores**: `correct_answer = 1`

### Taking the Quiz (Student):
1. **Student sees**: "What's 2+2?" with radio buttons
2. **Student selects**: "4" (index 1)
3. **System stores**: `userAnswer = 1`

### Grading (Automatic):
1. **System compares**: `userAnswer (1) === correct_answer (1)`
2. **Result**: Correct! ✅
3. **Score increases**: +1 point

## 🛠 Database Structure

```sql
-- Quiz Questions Table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN (
    'multiple_choice', 'single_choice', 'true_false',
    'fill_blank', 'essay', 'matching', 'ordering'
  )),
  options JSONB,              -- ["Option A", "Option B"] or [{"left":"go","right":"goes"}]
  correct_answer INTEGER,     -- For simple numeric answers (0, 1, 2...)
  correct_answer_text TEXT,   -- For complex answers ("text" or "[1,2,0]")
  explanation TEXT
);
```

## 🧪 Testing Examples

You can test this by:
1. **Creating different question types** in admin panel
2. **Taking the quiz** as a student  
3. **Checking results** to see scoring

The system automatically handles all the complexity behind the scenes!
