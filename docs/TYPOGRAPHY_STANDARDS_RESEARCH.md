# Acadex Typography Standards - Research-Based Recommendations

## 🎯 **Core Typography Roles** 
*Based on Material Design 3 + Bootstrap + Accessibility Best Practices*

### **1. TITLE** 
**Purpose**: Page/section main titles, hero headings  
**HTML**: `<h1>` (one per page) or dedicated title components  
**Font**: Inter Bold (700), 48-72px desktop, 32-48px mobile  
**Usage**: Landing page titles, course titles, main headings  
**Class**: `.title-xl`, `.title-lg`, `.title-md`  

### **2. SUBTITLE**
**Purpose**: Supporting text under main titles  
**HTML**: `<p>` with subtitle class, never heading tags  
**Font**: Inter Medium (500), 18-24px desktop, 16-20px mobile  
**Usage**: Hero descriptions, course descriptions  
**Class**: `.subtitle-lg`, `.subtitle-md`  

### **3. HEADING**
**Purpose**: Section headers, content organization  
**HTML**: `<h2>`, `<h3>`, `<h4>` in logical order  
**Font**: Inter Semibold (600), 24-36px desktop, 20-28px mobile  
**Usage**: Section headers, content categories  
**Class**: `.heading-xl`, `.heading-lg`, `.heading-md`, `.heading-sm`  

### **4. SUBHEADING**
**Purpose**: Subsection headers, content grouping  
**HTML**: `<h3>`, `<h4>`, `<h5>` following heading hierarchy  
**Font**: Inter Medium (500), 18-24px desktop, 16-20px mobile  
**Usage**: Card titles, form sections, quiz categories  
**Class**: `.subheading-lg`, `.subheading-md`, `.subheading-sm`  

### **5. SECTION HEADER**
**Purpose**: Distinct section breaks, department headers  
**HTML**: `<h2>` or `<h3>` with section styling  
**Font**: Inter Semibold (600), 20-28px desktop, 18-24px mobile  
**Usage**: Course modules, admin sections, feature blocks  
**Class**: `.section-header-lg`, `.section-header-md`  

### **6. BODY**
**Purpose**: Main content, descriptions, paragraphs  
**HTML**: `<p>`, `<div>` for content blocks  
**Font**: Inter Regular (400), 16-18px desktop, 14-16px mobile  
**Usage**: Course descriptions, article content, explanations  
**Class**: `.body-lg`, `.body-md`, `.body-sm`  

### **7. QUOTE**
**Purpose**: Testimonials, featured content, emphasis  
**HTML**: `<blockquote>` with `<cite>` for attribution  
**Font**: Inter Medium (500), 18-22px desktop, 16-20px mobile  
**Usage**: Student testimonials, featured reviews, callouts  
**Class**: `.quote-lg`, `.quote-md`  

### **8. CAPTION**
**Purpose**: Image captions, metadata, supplementary info  
**HTML**: `<figcaption>`, `<small>`, or caption classes  
**Font**: Inter Regular (400), 12-14px desktop/mobile  
**Usage**: Image descriptions, form helpers, timestamps  
**Class**: `.caption-lg`, `.caption-md`, `.caption-sm`  

---

## 🎨 **Font Weight Hierarchy**

```css
/* Semantic Weight System */
font-light: 300     /* Reserved for display text only */
font-normal: 400    /* Body text, descriptions, content */
font-medium: 500    /* Subtitles, subheadings, labels, buttons */
font-semibold: 600  /* Headings, section headers, emphasis */
font-bold: 700      /* Titles, primary headings, CTAs */
font-black: 900     /* Hero titles, brand emphasis only */
```

## 📐 **Responsive Font Scaling**

```css
/* Mobile-first responsive approach */
.title-xl    { font-size: clamp(2rem, 8vw, 4.5rem); }     /* 32-72px */
.title-lg    { font-size: clamp(1.75rem, 6vw, 3rem); }    /* 28-48px */
.heading-lg  { font-size: clamp(1.5rem, 4vw, 2.25rem); }  /* 24-36px */
.heading-md  { font-size: clamp(1.25rem, 3vw, 1.75rem); } /* 20-28px */
.body-lg     { font-size: clamp(1rem, 2vw, 1.125rem); }   /* 16-18px */
.body-md     { font-size: clamp(0.875rem, 2vw, 1rem); }   /* 14-16px */
.caption-md  { font-size: clamp(0.75rem, 1.5vw, 0.875rem); } /* 12-14px */
```

## 🔤 **Implementation Classes**

### **Title System**
```css
.title-xl { @apply text-4xl md:text-6xl font-bold tracking-tight; }
.title-lg { @apply text-3xl md:text-5xl font-bold tracking-tight; }
.title-md { @apply text-2xl md:text-4xl font-bold tracking-tight; }

.subtitle-lg { @apply text-lg md:text-xl font-medium text-gray-600; }
.subtitle-md { @apply text-base md:text-lg font-medium text-gray-600; }
```

### **Heading System**
```css
.heading-xl { @apply text-2xl md:text-3xl font-semibold tracking-tight; }
.heading-lg { @apply text-xl md:text-2xl font-semibold tracking-tight; }
.heading-md { @apply text-lg md:text-xl font-semibold; }
.heading-sm { @apply text-base md:text-lg font-semibold; }

.subheading-lg { @apply text-lg font-medium; }
.subheading-md { @apply text-base font-medium; }
.subheading-sm { @apply text-sm font-medium; }
```

### **Section & Content System**
```css
.section-header-lg { @apply text-xl md:text-2xl font-semibold border-b-2 border-primary pb-2; }
.section-header-md { @apply text-lg md:text-xl font-semibold border-b border-gray-200 pb-1; }

.body-lg { @apply text-lg leading-relaxed font-normal; }
.body-md { @apply text-base leading-relaxed font-normal; }
.body-sm { @apply text-sm leading-relaxed font-normal; }
```

### **Quote & Caption System**
```css
.quote-lg { @apply text-lg md:text-xl font-medium italic border-l-4 border-primary pl-4; }
.quote-md { @apply text-base md:text-lg font-medium italic border-l-2 border-gray-300 pl-3; }

.caption-lg { @apply text-sm font-normal text-gray-600; }
.caption-md { @apply text-xs font-normal text-gray-500; }
.caption-sm { @apply text-xs font-normal text-gray-400; }
```

## 🎯 **Semantic Usage Examples**

### **Landing Page Structure**
```html
<h1 class="title-xl">Acadex - English Learning Platform</h1>
<p class="subtitle-lg">Master English with expert-led courses and interactive quizzes</p>

<h2 class="section-header-lg">Featured Courses</h2>
<h3 class="heading-md">Business English Essentials</h3>
<p class="body-md">Develop professional English skills...</p>

<blockquote class="quote-lg">
  "Acadex transformed my English skills completely!"
  <cite class="caption-md">- Sarah Johnson, Student</cite>
</blockquote>
```

### **Course Page Structure**
```html
<h1 class="title-lg">Advanced Grammar Mastery</h1>
<p class="subtitle-md">Complete your English grammar journey</p>

<h2 class="section-header-md">Course Modules</h2>
<h3 class="subheading-lg">Module 1: Complex Tenses</h3>
<p class="body-md">Learn advanced tense structures...</p>

<figure>
  <img src="grammar-chart.jpg" alt="Grammar structure">
  <figcaption class="caption-md">Advanced tense relationships diagram</figcaption>
</figure>
```

## ✅ **Accessibility Compliance**

### **Semantic HTML Requirements**
- ✅ One `<h1>` per page for main content
- ✅ Logical heading hierarchy (h1 → h2 → h3, no skipping)
- ✅ Maximum 3 heading levels per page
- ✅ Proper `<blockquote>` and `<cite>` structure
- ✅ `<figcaption>` for image descriptions
- ✅ Color contrast ratios meet WCAG AA standards

### **Screen Reader Optimization**
- ✅ Descriptive heading text (not just "Click here")
- ✅ Proper landmark structure (`<main>`, `<section>`, `<article>`)
- ✅ Alternative text for decorative typography images
- ✅ Skip links for navigation between sections

## 🚀 **Migration Plan**

### **Phase 1: Core Implementation**
1. Add new typography classes to `globals.css`
2. Update `Typography.tsx` component with new variants
3. Create semantic wrapper components

### **Phase 2: Component Updates**
1. Hero sections → `title-xl` + `subtitle-lg`
2. Course cards → `heading-md` + `body-md`
3. Form sections → `subheading-lg` + `body-sm`
4. Testimonials → `quote-lg` structure

### **Phase 3: Content Audit**
1. Ensure proper heading hierarchy on all pages
2. Replace visual headings with semantic headings
3. Add proper citation structure to quotes
4. Validate accessibility with screen readers

---

**Key Benefits:**
- ✅ **Semantic clarity** for developers and users
- ✅ **Accessibility compliance** with WCAG standards  
- ✅ **Consistent visual hierarchy** across platform
- ✅ **Responsive scaling** for all devices
- ✅ **Future-proof** design system foundation
