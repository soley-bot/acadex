# Typography & Mobile-First Design Migration Guide

## Overview
This guide helps migrate from inconsistent typography patterns to our new unified Typography system with mobile-first responsive design.

## 🎯 Goals
- **Consistent typography** across all pages
- **Mobile-first responsive** design 
- **Improved accessibility** and readability
- **Reduced CSS maintenance** burden

---

## 📋 Migration Checklist

### Before You Start
- [ ] Import Typography and Layout components
- [ ] Identify old typography patterns in the file
- [ ] Plan the component structure (headings, sections, etc.)

### During Migration
- [ ] Replace heading tags with Typography components
- [ ] Update container structures to use responsive layout
- [ ] Test on multiple screen sizes (320px, 768px, 1024px+)
- [ ] Verify color contrast and readability

### After Migration
- [ ] Check for TypeScript errors
- [ ] Test mobile responsiveness
- [ ] Validate accessibility
- [ ] Update any related tests

---

## 🔄 Common Migration Patterns

### 1. Import Statements
**Before:**
```tsx
import Link from 'next/link'
import { useState } from 'react'
```

**After:**
```tsx
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
```

### 2. Page Headings

**Before:**
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-gray-900">
  Page Title
</h1>
```

**After:**
```tsx
<Typography variant="display-lg" as="h1" className="mb-8">
  Page Title
</Typography>
```

### 3. Section Headings

**Before:**
```tsx
<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">
  Section Title
</h2>
```

**After:**
```tsx
<Typography variant="h2" as="h2" className="mb-6">
  Section Title
</Typography>
```

### 4. Body Text

**Before:**
```tsx
<p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
  Lead paragraph text
</p>

<p className="text-lg text-gray-700 mb-4">
  Regular body text
</p>

<p className="text-sm text-gray-500">
  Small caption text
</p>
```

**After:**
```tsx
<Typography variant="lead">
  Lead paragraph text
</Typography>

<Typography variant="body-md" className="mb-4">
  Regular body text
</Typography>

<Typography variant="caption">
  Small caption text
</Typography>
```

### 5. Gradient Text

**Before:**
```tsx
<h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
  Gradient Title
</h1>
```

**After:**
```tsx
<Typography variant="display-lg" color="gradient" as="h1">
  Gradient Title
</Typography>
```

### 6. Container & Layout Updates

**Before:**
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Content */}
  </div>
</div>
```

**After:**
```tsx
<Container size="lg" className="py-12">
  <Grid cols={3}>
    {/* Content */}
  </Grid>
</Container>
```

**Or using Section for better spacing:**
```tsx
<Section spacing="md" background="gradient">
  <Container size="lg">
    <Grid cols={3}>
      {/* Content */}
    </Grid>
  </Container>
</Section>
```

---

## 🎨 Typography Variant Reference

### Display Headings (Hero sections)
- `display-xl` - Extra large hero text
- `display-lg` - Large hero text  
- `display-md` - Medium hero text
- `display-sm` - Small hero text

### Standard Headings
- `h1` - Main page title
- `h2` - Major section heading
- `h3` - Subsection heading
- `h4` - Minor heading
- `h5` - Small heading
- `h6` - Smallest heading

### Body Text
- `lead` - Introduction/lead paragraph
- `body-lg` - Large body text
- `body-md` - Standard body text (default)
- `body-sm` - Small body text

### Special Text
- `caption` - Image captions, small labels
- `overline` - Uppercase labels
- `link` - Styled links
- `button-text` - Button text

### Status Text
- `success` - Success messages
- `warning` - Warning messages
- `error` - Error messages
- `info` - Info messages

---

## 🎨 Color Variants

### Text Colors
- `primary` - Main text color (gray-900)
- `secondary` - Secondary text (gray-700)
- `muted` - Muted text (gray-600)
- `subtle` - Very subtle text (gray-500)
- `white` - White text
- `gradient` - Red to orange gradient

### Status Colors
- `success` - Green text
- `warning` - Yellow text
- `error` - Red text
- `info` - Blue text

---

## 📱 Layout Component Reference

### Container
```tsx
<Container 
  size="sm|md|lg|xl|full"  // max-width
  padding="none|sm|md|lg"   // responsive padding
  center={true}             // center horizontally
>
  {children}
</Container>
```

### Section
```tsx
<Section 
  spacing="sm|md|lg"                           // vertical padding
  background="transparent|white|glass|gradient|muted|dark"  // background style
>
  {children}
</Section>
```

### Grid
```tsx
<Grid 
  cols={1|2|3|4|6|12}       // number of columns
  gap="sm|md|lg"            // grid gap
  responsive={{             // custom breakpoints
    sm: 1,
    md: 2, 
    lg: 3,
    xl: 4
  }}
>
  {children}
</Grid>
```

---

## 📱 Mobile-First Responsive Strategy

### Breakpoint System
```
xs:  320px  - Small mobile
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Small desktop
xl:  1280px - Desktop
2xl: 1536px - Large desktop
```

### Mobile-First Approach
1. **Start with mobile** (320px width)
2. **Use fluid typography** (clamp values)
3. **Progressive enhancement** for larger screens
4. **Touch-friendly** interactive elements (44px minimum)

### Responsive Patterns
```tsx
// Responsive columns
<Grid responsive={{ sm: 1, md: 2, lg: 3 }}>

// Responsive padding  
<Container padding="lg">  // Uses clamp() for fluid scaling

// Responsive spacing
<Section spacing="md">   // Uses clamp() for fluid vertical rhythm
```

---

## 🔧 Migration Priority Order

### High Priority (Update First)
1. **Home page** (`/`)
2. **Dashboard** (`/dashboard`) ✅ Done
3. **Quiz pages** (`/quizzes/*`) 🔄 In Progress
4. **Course pages** (`/courses/*`)
5. **Profile page** (`/profile`) ✅ Done

### Medium Priority 
6. **Auth pages** (`/auth/*`)
7. **Admin pages** (`/admin/*`)
8. **About/Contact** (`/about`, `/contact`)

### Low Priority
9. **Error pages** (`404`, etc.)
10. **Utility pages** (setup, preview, etc.)

---

## 🚀 Quick Migration Commands

### Run Analysis Script
```bash
node scripts/migrate-typography.js
```

### Check for Old Patterns
```bash
# Find old typography patterns
grep -r "text-[0-9]xl.*font-bold" src/app/ --include="*.tsx"

# Find old container patterns  
grep -r "max-w-.*mx-auto.*px-" src/app/ --include="*.tsx"
```

### TypeScript Check
```bash
npm run build  # Check for any TypeScript errors
```

---

## ✅ Validation Checklist

### After Each Page Migration:

#### Typography
- [ ] All headings use Typography component
- [ ] Consistent color usage (no random text-gray-*)
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Lead paragraphs use `variant="lead"`

#### Layout  
- [ ] Uses Container for max-width control
- [ ] Uses Grid for responsive columns
- [ ] Uses Section for consistent spacing
- [ ] No hardcoded px values for spacing

#### Mobile Responsiveness
- [ ] Text scales properly on mobile (320px)
- [ ] Interactive elements are touch-friendly
- [ ] Content doesn't overflow horizontally
- [ ] Proper spacing on all screen sizes

#### Accessibility
- [ ] Proper heading hierarchy maintained
- [ ] Color contrast meets WCAG standards
- [ ] Text is readable without zooming

---

## 🛠️ Troubleshooting

### Common Issues

**TypeScript errors about variants:**
```tsx
// ❌ Wrong
<Typography variant="h1" as="p">  

// ✅ Correct  
<Typography variant="h1" as="h1">
```

**Missing imports:**
```tsx
// Add at top of file
import { Typography } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
```

**Layout not responsive:**
```tsx
// ❌ Old way
<div className="max-w-6xl mx-auto px-4">

// ✅ New way
<Container size="lg">
```

---

## 📚 Additional Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile-First Design Principles](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)

---

*Last updated: August 2, 2025*
