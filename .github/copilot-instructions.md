<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Acadex - English Learning & Course Platform

## Project Overview
This is a comprehensive Next.js application for English learning, quiz practice, and online course management, built with TypeScript and Tailwind CSS. The platform includes student-facing features and a complete admin panel for course/quiz management.

## Architecture & Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Supabase Auth with role-based access
- **Components**: Modular React components with proper type safety

## Database Schema
- **Users**: Extended auth.users with roles (student/instructor/admin)
- **Courses**: Full course management with modules, lessons, resources
- **Quizzes**: Interactive quiz system with questions and attempts
- **Enrollments**: Student progress tracking and completion
- **Enhanced Tables**: course_modules, course_lessons, course_resources, lesson_progress

## Key Features
### Student Features
- Course enrollment and study interface with progress tracking
- Interactive quiz system with detailed results
- User dashboard with enrollment history
- Responsive course content viewer with video support

### Admin Features
- Comprehensive course management (EnhancedCourseForm)
- Quiz creation and management system
- User management and analytics
- Content moderation and publishing controls

### Technical Features
- Role-based authentication and authorization
- Real-time progress tracking
- Mobile-first responsive design
- Type-safe database operations

## TypeScript-First Development Standards

### Core Principles
1. **TypeScript Safety First**: Always consider type implications before writing code
2. **Database-UI Alignment**: Ensure type interfaces match database schema exactly
3. **Build-Driven Development**: Test compilation frequently, treat TS errors as blocking

### Required TypeScript Patterns

```typescript
// ✅ ALWAYS: Type assertions with spread operators
updated[index] = { ...updated[index], [field]: value } as ModuleType

// ✅ ALWAYS: Safety checks before array/object access
if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex]) return

// ✅ ALWAYS: Proper nullable type handling
duration: string | null  // matches nullable DB field
price: number           // matches numeric DB field  

// ✅ ALWAYS: Extended types for UI needs
type LessonWithProgress = CourseLesson & {
  progress?: LessonProgress
}

// ✅ ALWAYS: Proper interface definitions matching database
interface Course {
  id: string
  title: string
  duration: string | null
  is_published: boolean
  // ... all fields matching database exactly
}
```

### Development Workflow
1. **Design types first** - match database schema exactly
2. **Add safety checks** - prevent undefined/null access errors
3. **Use type assertions** - help TypeScript inference with complex operations
4. **Test build frequently** - run `npm run build` to catch issues early
5. **Fix TS errors immediately** - don't accumulate technical debt

## File Structure & Components

### Key Pages
- `/src/app/courses/[id]/study/page.tsx` - Course study interface with progress tracking
- `/src/app/admin/courses/page.tsx` - Admin course management dashboard
- `/src/app/admin/quizzes/page.tsx` - Quiz management interface

### Important Components
- `EnhancedCourseForm` - Comprehensive course creation/editing with modules & lessons
- `CourseViewModal`, `DeleteCourseModal` - Course management modals
- `QuizForm` - Interactive quiz builder
- `AdminRoute` - Role-based access control

### Database Integration
- `/src/lib/supabase.ts` - Type definitions and client setup
- `/src/lib/database.ts` - Database operation helpers
- All interfaces must match database schema exactly

## Code Standards
- **TypeScript**: Strict mode, no `any` types, proper nullability handling
- **Components**: Functional components with proper typing
- **State Management**: useState with proper type annotations
- **Error Handling**: Try-catch blocks with proper error typing
- **Database Operations**: Type-safe Supabase queries
- **Forms**: Controlled components with validation
- **Color & Typography**: MUST follow standardized color and typography standards together (see Design System Standards)
- **Button Styling**: MUST follow standardized `bg-primary hover:bg-secondary text-white hover:text-black` pattern
- **Text Hierarchy**: Always use proper heading hierarchy (h1→h2→h3) with appropriate Tailwind typography classes
- **Color Usage**: Always use semantic color classes, never hardcoded hex values
- **Accessibility**: Ensure proper text contrast ratios (WCAG AA: 4.5:1 normal text, 3:1 large text)
- **Card System**: MUST use unified Card component system with proper variants (see Card System Standards)
- **Image Management**: Use smart image mapping system with Supabase Storage for dynamic uploads
- **Component Imports**: Always use exact component names from `/src/components/ui/` (e.g., EmailField, PasswordField)
- **Phased Development**: All major changes must follow documented phased migration approach

## Design System & Color Standards

### Color Palette
The color scheme is designed to be professional, accessible, and visually pleasing.

- **Primary (#1D63FF)**: Prussian Blue - Main brand color for trust and professionalism, used for primary actions and navigation elements
- **Secondary (#FFCE32)**: Yellow - Accent color for highlights and call-to-action elements, provides vibrant contrast for interactive states
- **Background (#f8fafc)**: A very light, almost white-gray that provides a clean and neutral canvas for the content, preventing eye strain
- **Sidebar (#1e293b)**: A deep slate blue that creates a strong, stable foundation for the primary navigation. It contrasts well with the main content area
- **Sidebar Accent (#334155)**: A slightly lighter slate used for hover and active states within the sidebar, providing subtle visual feedback
- **Card (#ffffff)**: Pure white is used for all content cards, making them pop against the light background and creating a clear visual hierarchy
- **Text Primary (#1e293b)**: The same deep slate as the sidebar is used for headings and important text, ensuring high readability
- **Text Secondary (#64748b)**: A softer gray is used for subheadings, descriptions, and labels to create a clear typographic hierarchy without overwhelming the user
- **Success**: Green for completed states and confirmations
- **Warning**: Yellow for draft states and cautions  
- **Error/Destructive**: Red (#ef4444) for errors and deletions
- **Typography**: Inter font family with consistent hierarchy

### Typography Standards
**CRITICAL**: All text elements must follow standardized typography hierarchy and proper color pairing.

#### Font Family
- **Primary Font**: Inter - Modern, readable sans-serif for all text
- **Implementation**: Use `font-sans` class (configured in Tailwind as Inter)
- **Fallbacks**: System fonts as backup (ui-sans-serif, system-ui)

#### Typography Hierarchy
```tsx
// ✅ CORRECT: Standardized heading hierarchy
<h1 className="text-4xl font-bold text-gray-900">     // Page titles
<h2 className="text-3xl font-semibold text-gray-800"> // Section headers  
<h3 className="text-2xl font-medium text-gray-700">   // Subsection headers
<h4 className="text-xl font-medium text-gray-600">    // Card titles
<p className="text-base text-gray-600">               // Body text
<span className="text-sm text-gray-500">              // Secondary text
<small className="text-xs text-gray-400">             // Helper text
```

#### Color-Typography Pairing Rules
```tsx
// ✅ CORRECT: Proper color combinations for readability
<button className="bg-primary text-white">           // White text on blue
<button className="bg-secondary text-black">         // Black text on yellow
<div className="bg-white text-gray-900">             // Dark text on light bg
<div className="bg-gray-900 text-white">             // Light text on dark bg

// ❌ INCORRECT: Poor contrast combinations
<button className="bg-primary text-black">           // Poor contrast
<div className="bg-yellow-300 text-yellow-600">      // Insufficient contrast
```

#### Typography Implementation Standards
- **Headings**: Always use semantic HTML tags (h1, h2, h3) with appropriate Tailwind classes
- **Body Text**: Use `text-foreground` for main content, `text-muted-foreground` for secondary
- **Interactive Text**: Follow button color standards for links and clickable text
- **Error States**: Use `text-destructive` for error messages with sufficient contrast
- **Success States**: Use `text-success` for success messages
- **Responsive Typography**: Use responsive text classes (`text-sm md:text-base lg:text-lg`)

#### Text Contrast with Background Standards
**CRITICAL**: Always ensure proper text contrast ratios for accessibility and readability.

##### Semantic Color Combinations
```tsx
// ✅ CORRECT: Primary brand color backgrounds
<button className="bg-primary text-white">           // White text on blue background
<div className="bg-primary/10 text-primary">         // Primary text on light primary background

// ✅ CORRECT: Secondary color backgrounds  
<button className="bg-secondary text-black">         // Black text on yellow background
<div className="bg-secondary/10 text-secondary">     // Secondary text on light secondary background

// ✅ CORRECT: Semantic state backgrounds
<div className="bg-destructive text-destructive-foreground">  // White text on red background
<div className="bg-success text-success-foreground">          // White text on green background
<div className="bg-muted text-muted-foreground">              // Muted text on muted background

// ✅ CORRECT: Standard backgrounds
<div className="bg-background text-foreground">               // Dark text on light background
<div className="bg-card text-card-foreground">                // Appropriate card text colors
```

##### Contrast Requirements
- **Primary Blue Backgrounds**: MUST use white text (`text-white`) for WCAG AA compliance
- **Secondary Yellow Backgrounds**: MUST use black text (`text-black`) for optimal readability  
- **Light Backgrounds**: Use dark text (`text-foreground`, `text-gray-900`)
- **Dark Backgrounds**: Use light text (`text-white`, `text-gray-100`)
- **Colored Backgrounds**: Use corresponding foreground colors (`text-destructive-foreground`, `text-success-foreground`)

##### Common Mistakes to Avoid
```tsx
// ❌ INCORRECT: Poor contrast combinations
<button className="bg-secondary text-white">          // Poor contrast - yellow + white
<div className="bg-primary text-black">               // Poor contrast - blue + black  
<span className="bg-yellow-300 text-yellow-600">      // Insufficient contrast
<div className="text-secondary">                      // Yellow text without proper background
```

#### Typography Best Practices
- **Line Height**: Use `leading-relaxed` (1.625) for body text readability
- **Letter Spacing**: Use `tracking-tight` for headings, normal tracking for body
- **Font Weight**: Consistent weight hierarchy (bold → semibold → medium → normal)
- **Text Alignment**: Left-align for readability, center only for headers/CTAs
- **Accessibility**: Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)

### Button Standardization Rules
**CRITICAL**: All buttons must follow this standardized pattern:

#### Primary Buttons (Default)
```tsx
// ✅ CORRECT: Primary background with white text, hover to secondary with black text
className="bg-primary hover:bg-secondary text-white hover:text-black"

// ❌ INCORRECT: Any other color combination for primary buttons
className="bg-primary text-black" // Wrong - primary needs white text
className="bg-blue-600 hover:bg-blue-700" // Wrong - use semantic colors
```

#### Outline Buttons
```tsx
// ✅ CORRECT: Primary border, hover to primary background with white text
className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
```

#### Button Component Usage
- Use `/src/components/ui/button.tsx` with `variant="default"` for primary actions
- Custom buttons must follow: `bg-primary hover:bg-secondary text-white hover:text-black`
- Icons should use `color="current"` to inherit text color
- CSS classes must follow same pattern in `/src/app/globals.css`

### Design System Implementation
- **CSS Variables**: Use HSL values in `/src/app/globals.css`
  - `--primary: 220 91% 56%` (Prussian Blue)
  - `--secondary: 47 100% 59%` (Yellow)
- **Semantic Classes**: Always use `bg-primary`, `text-primary`, etc. instead of hardcoded colors
- **Accessibility**: Primary blue background REQUIRES white text for proper contrast
- **Consistency**: All interactive elements follow primary→secondary hover pattern

### Color Usage Guidelines
1. **Primary Blue**: Always pair with white text for readability
2. **Secondary Yellow**: Always pair with black text for contrast  
3. **Hover States**: Transition from primary/white to secondary/black
4. **Gradients**: Use light versions (`primary/5 via white to secondary/5`) for backgrounds
5. **Icons**: Use `color="current"` to inherit parent text color

## Card System Standards
**CRITICAL**: All card implementations must use the unified Card component system.

### Unified Card Component
Location: `/src/components/ui/card.tsx`

#### Card Variants
```tsx
// ✅ ALWAYS: Use proper variant for context
<Card variant="glass">      // Hero sections, filters, overlays
<Card variant="base">       // Default content cards
<Card variant="elevated">   // Important/featured content
<Card variant="interactive"> // Clickable/hoverable cards
<Card variant="legacy">     // ONLY for legacy code migration
```

### Required Card Structure
```tsx
// ✅ CORRECT: Full Card structure with proper semantic components
<Card variant="glass" className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>

// ❌ INCORRECT: Direct div with card styling
<div className="bg-white rounded-lg shadow-sm p-6">
  {/* Don't use direct divs with card styling */}
</div>
```

### Card Migration Standards
- **Legacy Cards**: Must be replaced with unified Card component
- **Variant Selection**: Choose appropriate variant based on visual hierarchy
- **Structure**: Always use CardHeader/CardContent/CardFooter for proper semantic structure
- **Import Consistency**: Import from `/src/components/ui/card` only
- **Build Validation**: Run `npm run build` after each card migration to verify TypeScript compliance

### Card Styling Guidelines
- **Glass Variant**: Use for hero sections, filters, and overlay content
- **Base Variant**: Default for most content cards
- **Elevated Variant**: Use for featured or important content that needs visual prominence
- **Interactive Variant**: Use for clickable cards with hover states
- **Custom Classes**: Extend with Tailwind classes, never override base card structure

## Phased Development Methodology
**CRITICAL**: All major changes and migrations must follow systematic phased approach.

### Phased Migration Standards
- **Phase Documentation**: Every migration must be broken into clear, manageable phases
- **Build Validation**: Run `npm run build` after each phase completion
- **Progress Tracking**: Document completed phases and validate outcomes
- **Rollback Safety**: Each phase should be independently testable and reversible
- **Component Isolation**: Focus phases on specific component types or page sections

### Migration Phase Structure
```
Phase X: [Component/Feature Name]
├── Analysis: Identify current implementation and requirements
├── Planning: Define migration strategy and acceptance criteria
├── Implementation: Execute changes with TypeScript safety
├── Validation: Build verification and functionality testing
└── Documentation: Update progress and note any issues resolved
```

### Example: Card System Migration Phases
```
Phase 5B: Admin Pages (courses, quizzes, users)
Phase 6A: Student Dashboard  
Phase 6B: Course Listing Page
Phase 6C: Quiz Listing Page
Phase 7A: Profile Page
Phase 7B: Authentication Pages (login, signup)
```

### Migration Best Practices
- **Scope Control**: Limit each phase to 1-3 related files maximum
- **Component Focus**: Group related components/pages in same phase
- **Dependency Order**: Migrate shared components before dependent pages
- **Bundle Monitoring**: Track bundle size changes during migration
- **Type Safety**: Maintain zero TypeScript errors throughout all phases
- **Testing Strategy**: Validate each phase before proceeding to next

### Phase Completion Criteria
✅ **Build Success**: `npm run build` completes without errors
✅ **TypeScript Compliance**: Zero TypeScript errors or warnings
✅ **Functionality**: All existing features work as expected
✅ **Design Consistency**: Follows established design system standards
✅ **Performance**: No significant bundle size regressions
✅ **Documentation**: Changes documented for future reference

## Authentication & API Standards
**CRITICAL**: All admin API calls must follow proper authentication patterns to avoid 401 errors.

### Admin API Authentication Pattern
**MANDATORY**: When making API calls from admin pages, always include Authorization headers:

```tsx
// ✅ CORRECT: Enhanced API authentication for admin routes
const fetchAdminData = async () => {
  try {
    // Get the current session to include Authorization header
    const { data: { session } } = await supabase.auth.getSession()
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // Add Authorization header if we have a session
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    const response = await fetch('/api/admin/endpoint', {
      method: 'GET',
      credentials: 'include', // Include cookies as fallback
      headers
    })
    
    // Handle response...
  } catch (error) {
    // Error handling...
  }
}

// ❌ INCORRECT: Missing Authorization header (causes 401 errors)
const response = await fetch('/api/admin/endpoint', {
  method: 'GET',
  credentials: 'include'
})
```

### API Route Authentication Standards
- **Admin Routes**: Use `withAdminAuth` wrapper for admin-only endpoints
- **Service Role**: Use `createServiceClient()` after admin authentication
- **Authorization Headers**: API routes properly handle `Bearer {token}` authentication
- **Cookie Fallback**: Browser requests fall back to cookie-based authentication
- **Error Handling**: Proper 401 responses for authentication failures

### Authentication Context Requirements
- **AdminRoute Component**: Protects admin pages with role verification
- **AuthContext**: Provides user session and role information
- **Session Management**: Automatic session refresh and validation
- **Role-Based Access**: Proper admin/instructor/student role enforcement

### Database Authentication
- **RLS Policies**: Row Level Security enabled on all sensitive tables
- **Service Role Policies**: Allow service_role full access for admin operations
- **Admin Policies**: Authenticated admin users can access admin-restricted data
- **is_admin() Function**: Database function for role verification with proper permissions

## Current Project State
✅ **Build Status**: Successfully compiling without TypeScript errors
✅ **Database**: Complete schema with enhanced course structure
✅ **Authentication**: Role-based system working (student/instructor/admin)
✅ **Course Management**: Full CRUD operations with type safety
✅ **Student Interface**: Course study page with progress tracking
✅ **Admin Panel**: Comprehensive management interface
✅ **Type Safety**: All major components properly typed
✅ **Design System**: Standardized Primary Prussian Blue (#1D63FF) and Secondary Yellow (#FFCE32) theme
✅ **Button Standards**: All buttons follow primary→secondary hover pattern with proper text contrast
✅ **Card System**: Unified Card component system implemented across entire application
✅ **Phased Migration**: Complete card system migration successfully executed in systematic phases
✅ **Professional Image System**: Smart image mapping with category-based defaults and Supabase Storage uploads
✅ **Admin Content Management**: Course and quiz forms with integrated image upload capabilities
✅ **Professional Spacing System**: Research-driven spacing standards based on Material Design 8dp/4dp grid
✅ **Courses & Quiz Pages**: Professional spacing implementation completed with 64-96px hero sections and 24-32px grid gaps
✅ **Hero Component**: Updated with professional spacing, typography, colors, and unified Card system
✅ **Features Component**: Updated with design system standards, proper button colors, and Card components
✅ **HonestSection Component**: Updated with professional Card system and typography hierarchy

## Design System Implementation Progress

### ✅ **Completed Components** (Professional Standards Applied):
- **Hero.tsx**: Professional spacing (`py-16 md:py-20 lg:py-24`), correct button colors (`bg-primary hover:bg-secondary text-white hover:text-black`), unified Card system, Typography hierarchy
- **Features.tsx**: Professional grid spacing (`gap-6 md:gap-8`), Card variants, Lucide React icons, proper color contrast
- **HonestSection.tsx**: Card system implementation, professional typography, correct button patterns
- **PopularCourses.tsx**: Complete Card system migration, professional course cards with Users/Star/BookOpen icons, loading states, pricing display
- **QuizPreview.tsx**: ✅ **COMPLETE** - Full design system implementation with Card variants, Lucide React icons (Target, TrendingUp, Award, Clock, CheckCircle, Play), professional spacing, interactive quiz features
- **Header.tsx**: ✅ **COMPLETE** - Lucide React icons migration (ChevronDown, Home, User, ArrowRight, Menu, X, Book, Lightbulb, Info, Mail, Rocket), proper navigation styling
- **Footer.tsx**: ✅ **COMPLETE** - Typography standardization, grid system update, proper semantic HTML structure with Heart icon
- **NewsletterSignup.tsx**: ✅ **COMPLETE** - Layout system update, proper button colors following design standards

### 🎯 **Landing Page System - COMPLETE**:
**All landing page components and supporting systems** now follow unified design system standards with:
- Professional spacing based on 4px/8dp Material Design grid
- Unified Card component system with appropriate variants  
- Lucide React icons for consistency and performance
- Proper typography hierarchy with semantic HTML
- Standardized button patterns with correct contrast ratios
- Complete navigation and footer systems
- Newsletter signup integration

### 📋 **Next Priority Pages**:
1. **Dashboard Page** (`/src/app/dashboard/page.tsx`) - High-impact student experience
2. **Authentication Pages** (`/src/app/auth/`) - Critical user onboarding
3. **Course Study Page** (`/src/app/courses/[id]/study/page.tsx`) - Core learning experience
4. **About & Contact Pages** - Brand consistency

## Image Management System
**CRITICAL**: Acadex now includes a comprehensive professional image management system.

### Smart Image Mapping
**Location**: `/src/lib/imageMapping.ts`
- **Category-Based Selection**: Automatic image assignment based on course categories
- **Title Keyword Detection**: Fallback analysis for edge cases
- **Professional Imagery**: Authentic educational content (not generic stock photos)
- **Type Safety**: Full TypeScript support with extensible design

### Supabase Storage Integration
**Location**: `/src/lib/imageUpload.ts`
- **Multi-Bucket System**: `course-images`, `quiz-images`, `user-avatars`, `lesson-resources`
- **File Validation**: Type checking, 5MB size limit, error handling
- **Folder Organization**: Structured storage (`courses/`, `quizzes/` subfolders)
- **Admin Workflows**: Seamless upload integration in course/quiz forms

### Image Categories
**Supported Course Types:**
- English Grammar & Language Fundamentals (`english-grammar.jpg`)
- Conversation & Speaking Practice (`conversation-practice.jpg`)
- Business English & Professional Communication (`business-english.jpg`)
- Test Preparation - IELTS, TOEFL (`ielts-preparation.jpg`)
- Academic Writing & Composition (`academic-writing.jpg`)
- Vocabulary Building & Word Learning (`vocabulary-building.jpg`)

### Professional Layout Patterns
**Hero Sections:** Split-screen layouts (60/40 ratio) with authentic learning environments
**Course Cards:** Context-appropriate thumbnails with smart fallback system
**Visual Hierarchy:** Professional white space utilization, subtle background patterns

## Layout & Responsiveness
The application employs a sophisticated, responsive layout that adapts seamlessly from large desktop monitors to small mobile screens.

### Desktop Layout (≥ 768px)
**Structure**: A classic two-column dashboard layout.
- **Left Column**: A fixed-width (w-64) Sidebar for primary navigation. It is always visible, providing constant access to all sections of the application.
- **Right Column**: The Main Content area, which is fluid and takes up the remaining screen width. This area contains a Header and the main view, which is scrollable.

### Mobile & Tablet Layout (< 768px)
To optimize for limited screen space, the layout transforms significantly:
- **Collapsible Sidebar**: The sidebar is hidden by default off-screen (-translate-x-full). It can be toggled into view by tapping a Menu Icon (hamburger) located in the header. When open, it slides in from the left and overlays the main content with a semi-transparent backdrop, focusing the user's attention on navigation.
- **Persistent Header**: A fixed Header remains at the top of the screen. It contains the menu icon and the current page title, providing context and consistent navigation control.
- **Stacked Content**: Multi-column grids (grid-cols-3, grid-cols-2) automatically stack into a single vertical column (grid-cols-1). This ensures content flows logically and is easily readable without horizontal scrolling. Flexbox layouts also wrap (flex-wrap) to prevent overflow. For example, the stat cards on the dashboard and the course/quiz cards all stack vertically.

## Professional Spacing System
**CRITICAL**: Acadex follows a systematic spacing approach based on professional website research.

### Spacing Token Hierarchy
**Base 4px System**: Following Material Design and industry standards
- **Component Internal**: 4px, 8px, 12px, 16px increments
- **Section Spacing**: 48px, 64px, 80px, 96px for major sections
- **Card Grids**: 24px-32px gaps between cards
- **Form Elements**: 24px spacing between field groups
- **Touch Targets**: Minimum 44px (11 × 4px) for interactive elements

### Required Spacing Classes
```tsx
// ✅ CORRECT: Professional page structure
py-16 md:py-20 lg:py-24    // Hero sections
py-12 md:py-16 lg:py-20    // Content sections
px-4 md:px-6 lg:px-8       // Container padding
gap-6 md:gap-8             // Card grids
space-y-6                  // Form spacing
p-6                        // Standard card padding
```

### Responsive Spacing Standards
- **Mobile First**: Start with smaller spacing, scale up
- **Progressive Enhancement**: Larger spacing on larger screens
- **Consistent Hierarchy**: Different spacing for different importance levels
- **4px/8px Increments**: Never use arbitrary spacing values

### Component-Specific Spacing
- **Hero Sections**: Generous vertical padding (64-96px)
- **Card Systems**: Consistent 24-32px grid gaps
- **Forms**: 24px between field groups, 12px between related fields
- **Navigation**: Adequate touch targets with proper spacing
- **Typography**: Consistent line height and paragraph spacing

## Development Notes
- Always run `npm run build` before committing changes
- **Development Server Restart**: After successful build validation, ALWAYS restart the development server to ensure changes are properly loaded: `pkill -f "npm run dev" && npm run dev`
- **TypeScript Error Prevention**: When facing TypeScript errors, ALWAYS run `npx tsc --noEmit` first to identify all type issues before making fixes
- Database schema changes require interface updates in `/src/lib/supabase.ts`
- New components must include proper TypeScript interfaces
- Form components require safety checks for array operations
- Admin features need proper role validation
- **Color & Typography Standards**: ALWAYS consider both color and typography together when making UI updates
- **Typography Hierarchy**: Use proper heading hierarchy (h1→h2→h3) with consistent Tailwind classes
- **Button Components**: All new buttons must follow `bg-primary hover:bg-secondary text-white hover:text-black`
- **Color Consistency**: Use semantic classes (`bg-primary`, `text-secondary`) never hardcoded colors
- **Text Contrast**: Ensure WCAG AA compliance (4.5:1 normal text, 3:1 large text)
- **Accessibility**: Primary blue backgrounds MUST use white text for readability
- **Card Migration**: Use unified Card component system for all new card implementations
- **Component Imports**: Import exact component names from `/src/components/ui/` (EmailField, PasswordField, not TextField)
- **Phased Development**: Break large changes into manageable phases with build validation
- **Bundle Optimization**: Monitor bundle size during migrations and optimizations
- **Image Management**: Use smart image mapping for category-based defaults, Supabase Storage for dynamic uploads
- **Professional Design**: Follow research-driven design patterns based on IKEA/Walmart professional standards
- **Spacing Standards**: ALWAYS use systematic spacing based on 4px/8px increments following professional website patterns
