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

## Design System
- **Primary**: Blue (#3b82f6) for actions and highlights
- **Success**: Green for completed states and confirmations
- **Warning**: Yellow for draft states and cautions
- **Error**: Red (#ef4444) for errors and deletions
- **Neutral**: Gray scale for text and backgrounds
- **Typography**: Inter font family with consistent hierarchy

## Current Project State
✅ **Build Status**: Successfully compiling without TypeScript errors
✅ **Database**: Complete schema with enhanced course structure
✅ **Authentication**: Role-based system working (student/instructor/admin)
✅ **Course Management**: Full CRUD operations with type safety
✅ **Student Interface**: Course study page with progress tracking
✅ **Admin Panel**: Comprehensive management interface
✅ **Type Safety**: All major components properly typed

## Development Notes
- Always run `npm run build` before committing changes
- Database schema changes require interface updates in `/src/lib/supabase.ts`
- New components must include proper TypeScript interfaces
- Form components require safety checks for array operations
- Admin features need proper role validation
