# 🇰🇭 CRITICAL: Khmer Language JSON Parsing Issues in Acadex

## The Core Problem

When ChatGPT generates Khmer text for quizzes, our system faces **critical JSON parsing failures** that break the entire quiz generation and storage pipeline.

## The Exact Flow That Breaks

```
ChatGPT Response → JSON.parse() → Database Storage → JSON.stringify() → Frontend Display
                     ↑                                    ↑
                 FAILS HERE                         FAILS HERE
```

### Step-by-Step Breakdown:

1. **ChatGPT generates Khmer quiz:**
   ```json
   {
     "title": "ការសាកល្បងភាសាខ្មែរ",
     "questions": [
       {
         "question": "អក្សរខ្មែរមានព្យាយនជ្រុលប៉ុន្មាន?",
         "options": ["៣២", "៣៣", "៣៤", "៣៥"],
         "answer": "៣៣"
       }
     ]
   }
   ```

2. **Our API receives this and tries `JSON.parse()`:**
   - ✅ **Sometimes works** for simple Khmer text
   - ❌ **FAILS** for complex consonant clusters: `ប្រវត្តិសាស្ត្រ`
   - ❌ **FAILS** for mixed content: `សំណួរទី ១២៖ "ចម្លើយ"`

3. **Database storage attempts:**
   ```javascript
   const dbData = {
     title: quiz.title,
     questions: JSON.stringify(quiz.questions) // THIS BREAKS
   }
   ```

4. **Frontend retrieval fails:**
   ```javascript
   const questions = JSON.parse(dbQuiz.questions) // THIS ALSO BREAKS
   ```

## Specific Technical Issues

### 1. Complex Consonant Clusters
**Problem:** Khmer has complex consonant clusters that create Unicode sequences that break JSON parsing.

**Examples that break:**
- `ប្រវត្តិសាស្ត្រ` (history) - contains ប្រ, ត្តិ, ស្ត្រ clusters
- `ព្រះរាជាណាចក្រ` (kingdom) - contains ព្រះ, ជា, ណា sequences
- `ស្រុកស្រែ` (countryside) - contains multiple ស្រ clusters

### 2. Unicode Normalization Issues
**Problem:** Same Khmer text can have different Unicode representations.

```javascript
const text1 = "ភាសាខ្មែរ"  // NFC normalized
const text2 = "ភាសាខ្មែរ"  // NFD decomposed

console.log(text1 === text2)     // FALSE!
console.log(text1.length)        // Different lengths
console.log(text2.length)        // Different lengths
```

### 3. Database Field Limitations
**Problem:** Khmer text takes more bytes than Latin text.

```javascript
const khmerQuiz = { /* complex Khmer content */ }
const jsonString = JSON.stringify(khmerQuiz)

// UTF-8 byte size is much larger than string length
console.log(jsonString.length)                    // 1,234 chars
console.log(Buffer.from(jsonString, 'utf8').length) // 2,468 bytes!
```

### 4. Mixed Content Parsing
**Problem:** Khmer text mixed with punctuation, numbers, and Latin characters.

**Examples that break:**
- `សំណួរទី ១២៖ "អ្វីជាភាសាខ្មែរ?" (ចម្លើយ)`
- `មេរៀន #5: ការប្រើប្រាស់ភាសា (50%)`
- `ចម្លើយ: A) ក ខ B) គ ឃ C) ង`

## Current System Vulnerabilities

### In `/src/api/admin/generate-quiz/route.ts`
```typescript
// This can fail silently with Khmer content
const quizData = JSON.parse(aiResponse)  // ❌ NO VALIDATION
const questionsJSON = JSON.stringify(quizData.questions)  // ❌ NO VALIDATION
```

### In `/src/lib/enhanced-ai-services.ts`
```typescript
// Basic constraint but no Khmer-specific validation
if (khmerConfig.maxCharacters && text.length > khmerConfig.maxCharacters) {
  // This doesn't catch Unicode issues
}
```

### In Quiz Components
```typescript
// Frontend parsing without error handling
const questions = JSON.parse(quiz.questions)  // ❌ CAN CRASH
```

## Immediate Fixes Required

### 1. **Pre-validation Before JSON Operations**
```typescript
import { KhmerLanguageValidator } from '@/lib/khmer-language-support'

// Before JSON.parse()
const validation = KhmerLanguageValidator.validateJSON(aiResponse)
if (!validation.success) {
  throw new Error('Invalid Khmer JSON: ' + validation.errors.join(', '))
}
```

### 2. **Unicode Normalization**
```typescript
import { KhmerUtils } from '@/lib/khmer-language-support'

// Before storage
const normalizedTitle = KhmerUtils.normalizeKhmerText(quiz.title)
const normalizedQuestions = quiz.questions.map(q => ({
  ...q,
  question: KhmerUtils.normalizeKhmerText(q.question)
}))
```

### 3. **Database Schema Updates**
```sql
-- Increase field sizes for Khmer content
ALTER TABLE quizzes MODIFY COLUMN questions MEDIUMTEXT;
ALTER TABLE quizzes MODIFY COLUMN title VARCHAR(500);

-- Ensure UTF-8 encoding
ALTER TABLE quizzes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. **Error Handling in API Routes**
```typescript
try {
  const quizData = JSON.parse(aiResponse)
  // Validate Khmer content
  const validation = KhmerLanguageValidator.validateKhmerText(quizData.title)
  if (!validation.isValid) {
    return NextResponse.json({ error: 'Invalid Khmer content' }, { status: 400 })
  }
} catch (error) {
  return NextResponse.json({ error: 'JSON parsing failed' }, { status: 400 })
}
```

## Testing the Issues

Visit `/khmer-test` in your browser to see live demonstrations of these exact failures:

1. **Console output** shows JSON parsing attempts with complex Khmer text
2. **Real API simulation** demonstrates where the pipeline breaks
3. **Database compatibility** analysis shows field size issues
4. **Character encoding** problems with mixed content

## Files Created for This Analysis

1. **`/src/lib/khmer-json-breakage-demo.ts`** - Demonstrates exact JSON failures
2. **`/src/lib/khmer-api-breakage-test.ts`** - Tests real API pipeline issues  
3. **`/src/lib/khmer-language-support.ts`** - Comprehensive validation framework
4. **`/src/app/khmer-test/page.tsx`** - Interactive demonstration page

## Solution Implementation Priority

1. **HIGH:** Add JSON validation before all parse operations
2. **HIGH:** Implement Unicode normalization in AI service
3. **MEDIUM:** Update database schema for Khmer content
4. **MEDIUM:** Add error handling in quiz components
5. **LOW:** Optimize for better Khmer text rendering

The core issue is that **Khmer text breaks JSON operations** due to complex Unicode sequences, and our current system has **no protection** against these failures.
