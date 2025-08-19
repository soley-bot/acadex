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
- **Button Styling**: MUST follow standardized `bg-primary hover:bg-secondary text-black hover:text-white` pattern
- **Color Usage**: Always use semantic color classes, never hardcoded hex values
- **Accessibility**: Ensure proper text contrast (black text on primary yellow, white text on secondary blue)

## Design System & Color Standards

### Color Palette
- **Primary**: Yellow (#FFCE32) - Main brand color for primary actions
- **Secondary**: Prussian Blue (#1D63FF) - Accent color for hover states and secondary actions
- **Success**: Green for completed states and confirmations
- **Warning**: Yellow for draft states and cautions  
- **Error/Destructive**: Red (#ef4444) for errors and deletions
- **Neutral**: Gray scale for text and backgrounds
- **Typography**: Inter font family with consistent hierarchy

### Button Standardization Rules
**CRITICAL**: All buttons must follow this standardized pattern:

#### Primary Buttons (Default)
```tsx
// ✅ CORRECT: Primary background with black text, hover to secondary with white text
className="bg-primary hover:bg-secondary text-black hover:text-white"

// ❌ INCORRECT: Any other color combination for primary buttons
className="bg-primary text-white" // Wrong - primary needs black text
className="bg-blue-600 hover:bg-blue-700" // Wrong - use semantic colors
```

#### Outline Buttons
```tsx
// ✅ CORRECT: Primary border, hover to primary background with black text
className="border-2 border-primary text-primary hover:bg-primary hover:text-black"
```

#### Button Component Usage
- Use `/src/components/ui/button.tsx` with `variant="default"` for primary actions
- Custom buttons must follow: `bg-primary hover:bg-secondary text-black hover:text-white`
- Icons should use `color="current"` to inherit text color
- CSS classes must follow same pattern in `/src/app/globals.css`

### Design System Implementation
- **CSS Variables**: Use HSL values in `/src/app/globals.css`
  - `--primary: 47 100% 59%` (Yellow)
  - `--secondary: 220 91% 56%` (Prussian Blue)
- **Semantic Classes**: Always use `bg-primary`, `text-primary`, etc. instead of hardcoded colors
- **Accessibility**: Primary yellow background REQUIRES black text for proper contrast
- **Consistency**: All interactive elements follow primary→secondary hover pattern

### Color Usage Guidelines
1. **Primary Yellow**: Always pair with black text for readability
2. **Secondary Blue**: Always pair with white text for contrast  
3. **Hover States**: Transition from primary/black to secondary/white
4. **Gradients**: Use light versions (`primary/5 via white to secondary/5`) for backgrounds
5. **Icons**: Use `color="current"` to inherit parent text color

## Current Project State
✅ **Build Status**: Successfully compiling without TypeScript errors
✅ **Database**: Complete schema with enhanced course structure
✅ **Authentication**: Role-based system working (student/instructor/admin)
✅ **Course Management**: Full CRUD operations with type safety
✅ **Student Interface**: Course study page with progress tracking
✅ **Admin Panel**: Comprehensive management interface
✅ **Type Safety**: All major components properly typed
✅ **Design System**: Standardized Primary Yellow (#FFCE32) and Secondary Prussian Blue (#1D63FF) theme
✅ **Button Standards**: All buttons follow primary→secondary hover pattern with proper text contrast

## Development Notes
- Always run `npm run build` before committing changes
- Database schema changes require interface updates in `/src/lib/supabase.ts`
- New components must include proper TypeScript interfaces
- Form components require safety checks for array operations
- Admin features need proper role validation
- **Button Components**: All new buttons must follow `bg-primary hover:bg-secondary text-black hover:text-white`
- **Color Consistency**: Use semantic classes (`bg-primary`, `text-secondary`) never hardcoded colors
- **Accessibility**: Primary yellow backgrounds MUST use black text for readability
