# 🌐 Mixed Language Explanations: English Questions + Khmer Explanations

## Your Specific Use Case

You generate **English questions** with **Khmer explanations** that often contain **mixed content** (both Khmer and English). This is now **fully supported** with enhanced validation and safety measures.

## How It Works Now

### ✅ **Supported Pattern:**
```json
{
  "question": "What is the capital of Cambodia?",
  "options": ["Phnom Penh", "Siem Reap", "Battambang", "Kampong Cham"],
  "answer": "Phnom Penh",
  "explanation": "រាជធានីកម្ពុជាគឺ ភ្នំពេញ (Phnom Penh) ដែលជាទីក្រុងធំបំផុត និងជាមជ្ឈមណ្ឌលសេដ្ឋកិច្ច"
}
```

### 🔧 **Enhanced AI Service Configuration:**

When you generate quizzes, use these parameters:

```typescript
const quizRequest = {
  topic: "Cambodian History",
  subject: "History", 
  difficulty: "intermediate",
  questionCount: 5,
  quizLanguage: "english",           // English questions
  explanationLanguage: "khmer",      // Khmer explanations  
  includeTranslations: true          // Allow mixed content
}
```

## Automatic Handling

### 1. **Mixed Content Validation**
The system now automatically:
- ✅ Validates mixed English-Khmer explanations
- ✅ Sanitizes problematic characters
- ✅ Tests JSON compatibility before storage
- ✅ Provides recommendations for better content

### 2. **JSON Safety Checks**
Before storing explanations, the system:
- ✅ Removes unescaped quotes around Khmer text
- ✅ Normalizes Unicode sequences  
- ✅ Escapes special characters
- ✅ Tests round-trip JSON parsing

### 3. **Enhanced AI Prompting**
The AI now knows to:
- ✅ Keep English and Khmer sections together
- ✅ Use Arabic numerals (1,2,3) instead of Khmer numerals
- ✅ Avoid quotes around Khmer text
- ✅ Use consistent punctuation

## Common Issues & Fixes

### ❌ **Problematic Patterns:**

```javascript
// 1. Quotes around Khmer text
"The word \"ភាសា\" means language"
// Fix: Remove quotes
"The word ភាសា means language"

// 2. Mixed punctuation  
"ចម្លើយគឺ៖ A) ភ្នំពេញ។ The answer is: A) Phnom Penh."
// Fix: Use consistent punctuation
"ចម្លើយគឺ A) ភ្នំពេញ. The answer is: A) Phnom Penh."

// 3. Mixed numerals
"មានចម្លើយ ៤ (4) choices"  
// Fix: Use Arabic numerals consistently
"មានចម្លើយ 4 choices"

// 4. Complex Khmer clusters in mixed content
"ប្រវត្តិសាស្ត្រ (history) is complex"
// Fix: Use simpler Khmer words when possible
"ប្រវត្តិ (history) is simpler"
```

## Database Updates Required

Run this SQL in your Supabase to enable mixed language validation:

```sql
-- Function to validate mixed-language text
CREATE OR REPLACE FUNCTION validate_mixed_language_text(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Allow NULL/empty text
    IF input_text IS NULL OR input_text = '' THEN
        RETURN true;
    END IF;
    
    -- Basic length check (mixed content can be longer)
    IF char_length(input_text) > 8000 THEN
        RETURN false;
    END IF;
    
    -- Check for JSON-breaking characters
    IF input_text ~ '[\x00-\x1F\x7F]' THEN
        RETURN false; -- Control characters
    END IF;
    
    -- Check for unescaped quotes that break JSON
    IF input_text ~ '(?<!\\)"' THEN
        RETURN false; -- Unescaped double quotes
    END IF;
    
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_mixed_language_text(text) TO authenticated;
```

## Testing Your Mixed Content

Visit `/khmer-test` to test your specific patterns:

1. **Run the demo** to see mixed-language validation in action
2. **Check console output** for detailed analysis
3. **Test your own explanations** with the validation system

## API Integration

In your quiz generation API, mixed language validation now happens automatically:

```typescript
// This is now handled automatically in enhanced-ai-services.ts
const validation = MixedLanguageValidator.validateMixedContent(explanation)
if (!validation.isValid) {
  // Automatically sanitize the content
  explanation = MixedLanguageValidator.sanitizeMixedContent(explanation)
}
```

## Best Practices for Your Use Case

### 1. **Structure Your Explanations:**
```
English context + Khmer explanation + English clarification (optional)

Example: "This concept គឺជាមូលដ្ឋាន means foundation in English"
```

### 2. **Use Consistent Elements:**
- Arabic numerals: 1, 2, 3 (not ១, ២, ៣)
- Standard punctuation: : . , (not ៖ ។ ៌)
- Parentheses for English clarifications: ភាសា (language)

### 3. **Avoid These Patterns:**
- "Khmer text in quotes"
- Frequent language switching mid-sentence  
- Complex Khmer consonant clusters in mixed content
- Special symbols or control characters

## Validation Results

The system provides detailed feedback:
```typescript
{
  isValid: true,
  languageBreakdown: {
    khmerPercentage: 60,
    englishPercentage: 35,
    numbersPercentage: 3,
    punctuationPercentage: 2
  },
  recommendations: [
    "Good balance of Khmer and English content",
    "Consider using more consistent punctuation"
  ]
}
```

## Files Created for Your Use Case

1. **`mixed-language-validator.ts`** - Validates English+Khmer content
2. **`mixed-language-explanation-demo.ts`** - Tests your specific patterns
3. **Updated `enhanced-ai-services.ts`** - Handles mixed language generation
4. **Updated `khmer-essential.sql`** - Database functions for mixed content

Your **English questions + Khmer explanations** workflow is now **fully supported** with automatic validation and safety measures! 🎉
