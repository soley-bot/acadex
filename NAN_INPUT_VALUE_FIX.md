# NaN Input Value Fix

## Issue Description
React was throwing a warning: "Received NaN for the `value` attribute. If this is expected, cast the value to a string."

This occurred in number input fields when using `parseInt(e.target.value)` without handling the case where the input is empty, which causes `parseInt("")` to return `NaN`.

## Root Cause
When users clear a number input field, `e.target.value` becomes an empty string. Calling `parseInt("")` returns `NaN`, which then gets stored in the component state and passed back to the input's `value` attribute.

## Solution Applied
Added fallback values using the logical OR operator (`||`) to provide sensible defaults when `parseInt()` returns `NaN`.

### Files Fixed

#### 1. AIQuizGenerator.tsx
```typescript
// Before
onChange={(e) => setFormData(prev => ({ ...prev, question_count: parseInt(e.target.value) }))}

// After  
onChange={(e) => setFormData(prev => ({ 
  ...prev, 
  question_count: parseInt(e.target.value) || 10 
}))}
```

Fixed fields:
- `question_count` → fallback: 10
- `duration_minutes` → fallback: 20  
- `passing_score` → fallback: 70

#### 2. AIQuizGeneratorNew.tsx
```typescript
// Before
onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}

// After
onChange={(e) => setFormData(prev => ({ 
  ...prev, 
  duration_minutes: parseInt(e.target.value) || 20 
}))}
```

Fixed fields:
- `question_count` → fallback: 10
- `duration_minutes` → fallback: 20
- `passing_score` → fallback: 70

#### 3. BulkQuizGenerator.tsx
```typescript
// Before
onChange={(e) => setFormData(prev => ({ ...prev, quiz_count: parseInt(e.target.value) }))}

// After
onChange={(e) => setFormData(prev => ({ 
  ...prev, 
  quiz_count: parseInt(e.target.value) || 5 
}))}
```

Fixed fields:
- `quiz_count` → fallback: 5
- `questions_per_quiz` → fallback: 10
- `duration_minutes` → fallback: 20
- `passing_score` → fallback: 70

## Fallback Values
The fallback values chosen match the initial state values defined in each component:

- **Question Count**: 10 (reasonable default for quiz length)
- **Duration**: 20 minutes (standard quiz duration)
- **Passing Score**: 70% (common passing threshold)
- **Quiz Count**: 5 (reasonable number for bulk generation)

## Benefits
1. **No more NaN warnings** in React console
2. **Better UX** - inputs always show valid values even when cleared
3. **Consistent behavior** across all quiz generation components
4. **Maintains functionality** - users can still enter any valid number

## Testing
- ✅ Build completes successfully
- ✅ No React warnings in console
- ✅ Number inputs work properly when cleared and refilled
- ✅ Default values are sensible and match component initialization

## Technical Note
This approach is preferred over casting to string (`String(NaN)`) because:
1. It prevents invalid state from being stored
2. It provides immediately usable fallback values
3. It maintains the expected data types in the component state
4. It improves user experience by showing sensible defaults
