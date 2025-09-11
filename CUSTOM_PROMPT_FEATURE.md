# Custom Prompt Override Feature - AI Quiz Generation

## Overview
Added a new **Custom Prompt** field to the AI Configuration step in the Quiz Builder that allows users to override the automatic prompt generation with their own custom instructions.

## How It Works

### User Interface
- **Location**: AI Configuration step in Quiz Builder, positioned between "Quiz Topic" and "Subject Category"
- **Field Type**: Multi-line textarea (4 rows, resizable)
- **Placeholder**: "Override the automatic prompt with your custom instructions for AI generation..."
- **Optional**: Field is completely optional - leave empty to use standard configuration

### Backend Implementation

#### Flow:
1. **User Input**: User can enter custom instructions in the textarea
2. **API Request**: Custom prompt is sent to `/api/simple-ai-generation` along with other parameters
3. **Prompt Selection**: `SimpleAIQuizGenerator` checks if custom prompt exists
   - **If custom prompt provided**: Uses custom prompt directly, ignoring all other settings
   - **If empty**: Uses standard prompt generation based on topic, difficulty, etc.
4. **AI Generation**: Proceeds normally with selected prompt

#### Code Changes:

**Frontend (`EnhancedAIStep.tsx`):**
```tsx
// Added state for custom prompt
const [customPrompt, setCustomPrompt] = useState(aiConfig.customPrompt || '')

// Added UI field with helper text
<textarea
  value={customPrompt}
  onChange={(e) => setCustomPrompt(e.target.value)}
  placeholder="Override the automatic prompt with your custom instructions..."
  rows={4}
/>

// Updated API call to include custom prompt
body: JSON.stringify({
  // ... other fields
  customPrompt: customPrompt.trim() || undefined
})
```

**Backend (`simple-ai-quiz-generator.ts`):**
```typescript
// Updated interface
export interface SimpleQuizRequest {
  // ... existing fields
  customPrompt?: string // Optional custom prompt override
}

// Modified prompt building logic
private buildSimplePrompt(request: SimpleQuizRequest): string {
  if (request.customPrompt && request.customPrompt.trim()) {
    logger.info('Using custom prompt override instead of generated prompt')
    return request.customPrompt.trim()
  }
  // ... standard prompt generation
}
```

## Use Cases

### 1. Specific Question Formats
```
Generate 5 multiple choice questions about English Grammar focusing specifically on:
- Present Perfect vs Past Simple
- Include common mistakes non-native speakers make
- Add detailed explanations in simple English
```

### 2. Custom Difficulty Levels
```
Create beginner-level questions about Business Writing, but make them scenario-based:
- Use real workplace situations
- Focus on email etiquette and formal language
- Each question should test practical application
```

### 3. Specialized Topics
```
Generate questions about IELTS Writing Task 1 preparation:
- Include different chart types (bar, line, pie)  
- Focus on vocabulary for describing trends
- Add band score criteria in explanations
```

### 4. Language-Specific Requests
```
Create questions in English but with Khmer explanations:
- Topic: Basic English conversation
- Include phonetic pronunciations where helpful
- Cultural context for Cambodian learners
```

## Technical Benefits

### 1. **Flexibility**
- Users can specify exact requirements beyond standard categories
- Supports specialized educational needs and custom curricula

### 2. **Override Power**
- Complete control over AI generation when needed
- Bypasses all automatic settings when custom prompt is used

### 3. **Compatibility**
- Seamlessly integrates with existing AI generation pipeline
- No breaking changes to current functionality
- Standard prompts still work exactly as before

### 4. **Logging**
- Custom prompt usage is logged for monitoring and debugging
- Helps track which users prefer manual vs automatic generation

## Usage Guidelines

### When to Use Custom Prompts:
- ✅ Specialized topics not covered by standard categories
- ✅ Specific question formats or structures needed
- ✅ Custom difficulty levels or learning objectives
- ✅ Integration with specific curricula or teaching methods

### When to Use Standard Configuration:
- ✅ General topics well-covered by existing categories
- ✅ Standard difficulty levels (beginner/intermediate/advanced)
- ✅ Quick quiz generation without specific requirements
- ✅ New users learning the system

## Future Enhancements

### Potential Features:
1. **Prompt Templates**: Pre-built templates for common use cases
2. **Prompt History**: Save and reuse successful custom prompts
3. **Prompt Validation**: Basic checks for prompt quality and completeness
4. **AI Suggestions**: Auto-complete or suggest improvements to custom prompts

### Analytics Opportunities:
- Track usage patterns (custom vs standard prompts)
- Identify common custom prompt patterns for template creation
- Monitor success rates of custom vs generated prompts

## Conclusion
The Custom Prompt Override feature provides advanced users with complete control over AI quiz generation while maintaining the simplicity of the standard configuration for typical use cases. This balances power-user needs with ease of use for general educators.
