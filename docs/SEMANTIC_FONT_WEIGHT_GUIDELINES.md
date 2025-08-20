# Semantic Font Weight Guidelines for Acadex

## Executive Summary

This document establishes semantic guidelines for font weights and styles based on accessibility best practices, user experience research, and HTML semantic standards. These guidelines ensure consistent, meaningful typography that supports both visual users and assistive technologies.

## Core Principles

### 1. Semantic Meaning Over Visual Appearance
- **Bold** should indicate importance, not just visual emphasis
- **Italic** should indicate stress emphasis or semantic meaning
- **Light** should be used sparingly for subtle hierarchy
- Visual styling should follow semantic intent, not the reverse

### 2. HTML Semantic Standards
- Use `<strong>` for content of **strong importance** (warnings, critical info)
- Use `<em>` for **stress emphasis** that changes spoken meaning
- Use `<b>` for **visual attention** without semantic importance
- Use `<i>` for **alternate voice/mood** (foreign words, technical terms)

### 3. Accessibility Requirements
- Font weights must maintain WCAG contrast ratios
- Screen readers interpret `<strong>` and `<em>` semantically
- Don't rely solely on font weight to convey meaning
- Avoid excessive bold/italic text for long content

## Font Weight Semantic System

### Primary Weight Hierarchy

#### **Display/Heading Weights**
```typescript
// Semantic hierarchy for titles and headings
'display-xl': 'font-black',    // Maximum impact (900)
'display-lg': 'font-bold',     // High impact (700)
'h1/h2': 'font-bold',          // Primary headings (700)
'h3-h6': 'font-semibold',      // Secondary headings (600)
```

#### **Body Content Weights**
```typescript
// Default content weights
'body-*': 'font-normal',       // Standard reading (400)
'lead': 'font-medium',         // Introduction text (500)
'caption': 'font-medium',      // Supporting info (500)
'overline': 'font-semibold',   // Labels/categories (600)
```

#### **Interactive Elements**
```typescript
// UI component weights
'button-text': 'font-bold',    // Clear action hierarchy (700)
'link': 'font-medium',         // Sufficient emphasis (500)
'form-label': 'font-medium',   // Form field labels (500)
```

#### **Semantic Emphasis**
```typescript
// Content-based emphasis
'strong-importance': 'font-bold',     // <strong> - critical info
'stress-emphasis': 'font-medium',     // <em> - spoken emphasis
'visual-attention': 'font-semibold',  // <b> - visual prominence
'subtle-emphasis': 'font-medium',     // Secondary importance
```

### Light Weight Usage

#### **Appropriate Light Weight Usage**
- **Muted text**: Secondary information that should be de-emphasized
- **Large display text**: When font size compensates for reduced weight
- **Subtle hierarchy**: Creating visual layers without strong contrast

#### **Avoid Light Weights For**
- Body text under 18px (accessibility concerns)
- Important information (contradicts semantic meaning)
- Interactive elements (reduces usability)
- High-contrast backgrounds (readability issues)

```typescript
// Recommended light weight usage
'muted-text': 'font-light text-gray-500',      // Secondary info
'large-display': 'font-light text-4xl+',       // Large sizes only
'subtle-label': 'font-light text-xs uppercase', // Minimal emphasis
```

## Current Codebase Analysis

### Identified Patterns

#### **Inconsistent Usage** ❌
```typescript
// Mixed semantic meaning
className="font-bold bg-primary/10"     // Visual styling
className="font-medium"                 // Unclear purpose
className="font-black text-white"       // Maximum weight for non-critical content
```

#### **Correct Semantic Usage** ✅
```typescript
// Clear semantic intent
className="form-label"                  // Semantic form labels
<strong>Warning!</strong>               // Critical importance
className="button-text-lg"              // Clear action hierarchy
```

### Font Weight Distribution
- **font-black**: 1 usage (display elements) ✅
- **font-bold**: 12 usages (mix of semantic and visual) ⚠️
- **font-semibold**: 5 usages (heading hierarchy) ✅
- **font-medium**: 15 usages (mostly appropriate) ✅
- **font-normal**: 3 usages (body content) ✅
- **font-light**: 0 usages (opportunity for subtle hierarchy)

## Implementation Strategy

### Phase 1: Semantic CSS Classes

Create semantic utility classes that combine weight with meaning:

```css
/* Semantic emphasis classes */
.emphasis-critical {
  @apply font-bold text-destructive;
}

.emphasis-important {
  @apply font-semibold;
}

.emphasis-subtle {
  @apply font-medium text-muted-foreground;
}

.emphasis-muted {
  @apply font-light text-muted-foreground;
}

/* Content-specific classes */
.stat-value {
  @apply font-bold text-primary;
}

.stat-label {
  @apply font-medium text-muted-foreground uppercase tracking-wide;
}

.badge-text {
  @apply font-semibold text-xs uppercase tracking-wider;
}

.status-success {
  @apply font-medium text-success;
}

.status-warning {
  @apply font-medium text-warning;
}

.status-error {
  @apply font-medium text-destructive;
}
```

### Phase 2: Typography Component Updates

Enhance Typography component with semantic emphasis:

```typescript
// Add semantic emphasis variants
const emphasisVariants = {
  'critical': 'font-bold text-destructive',
  'important': 'font-semibold text-foreground',
  'subtle': 'font-medium text-muted-foreground',
  'muted': 'font-light text-muted-foreground',
}

// Usage examples
<Typography variant="body-md" emphasis="critical">
  Warning: This action cannot be undone.
</Typography>

<Typography variant="body-md" emphasis="subtle">
  Optional supplementary information.
</Typography>
```

### Phase 3: Component-Specific Guidelines

#### **Statistics/Metrics Components**
```typescript
// Current inconsistent approach
<Typography variant="body-md" className="font-bold bg-primary/10">70%</Typography>

// Proposed semantic approach
<Typography variant="stat-value" className="bg-primary/10">70%</Typography>
```

#### **Form Components**
```typescript
// Current mixed approach
<BodyMD className="text-success font-medium">Message sent!</BodyMD>

// Proposed semantic approach
<Typography variant="status-success">Message sent!</Typography>
```

#### **Status/Badge Components**
```typescript
// Current direct styling
<Typography variant="caption" className="font-medium uppercase tracking-wide">

// Proposed semantic approach
<Typography variant="badge-text">CATEGORY</Typography>
```

## Migration Plan

### Step 1: Audit Current Usage
- [x] Identify all font weight usage patterns
- [x] Categorize by semantic intent vs visual styling
- [ ] Map to new semantic classes

### Step 2: Create Semantic Classes
- [ ] Add semantic utility classes to `globals.css`
- [ ] Update Typography component with emphasis variants
- [ ] Create component-specific semantic classes

### Step 3: Systematic Replacement
1. **Statistics/metrics components** (highest priority)
2. **Form status messages** (accessibility critical)
3. **Button text hierarchy** (already partially complete)
4. **Badge/label components** (consistency improvement)

### Step 4: Validation
- [ ] Build validation (TypeScript compilation)
- [ ] Visual regression testing
- [ ] Accessibility testing with screen readers
- [ ] Performance impact assessment

## Accessibility Benefits

### Screen Reader Support
- Semantic `<strong>` and `<em>` are announced properly
- Consistent weight hierarchy aids navigation
- Font weight doesn't interfere with text scaling

### Visual Accessibility
- Clear hierarchy supports scanning and comprehension
- Appropriate contrast maintained across all weights
- Reduced cognitive load through consistent patterns

### Responsive Design
- Font weights adapt appropriately to different screen sizes
- Light weights avoided at small sizes for readability
- Weight hierarchy scales with font size changes

## Best Practices Summary

### Do ✅
- Use `<strong>` for critical importance with `font-bold`
- Use `<em>` for stress emphasis with `font-medium` 
- Apply semantic classes that combine weight with meaning
- Maintain weight hierarchy: normal → medium → semibold → bold → black
- Test with screen readers and accessibility tools

### Don't ❌
- Use `font-bold` purely for visual styling without semantic meaning
- Apply `font-light` to small text (under 18px)
- Mix semantic and visual weight approaches in same component
- Rely solely on font weight to convey critical information
- Use maximum weights (`font-black`) for non-critical content

### Gray Areas (Use Judgment) ⚠️
- `font-medium` for button text (acceptable for secondary actions)
- `font-semibold` for statistics (balance between emphasis and readability)
- Light weights for large display text (case-by-case basis)

## Next Steps

1. **Implement semantic CSS classes** in `globals.css`
2. **Update Typography component** with emphasis variants
3. **Create migration checklist** for systematic replacement
4. **Establish code review guidelines** for font weight usage
5. **Document component-specific patterns** as they emerge

This semantic approach ensures our typography system supports both visual design goals and accessibility requirements while maintaining consistency across the entire application.
