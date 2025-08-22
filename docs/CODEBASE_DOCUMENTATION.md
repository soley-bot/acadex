# 📚 Acadex Codebase Documentation
*Comprehensive guide to pages, components, and data flow*

---

## 🏗️ **Architecture Overview**

### **Tech Stack**
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Supabase Auth with role-based access
- **Icons**: Lucide React
- **State Management**: React Context + useState/useEffect

### **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── contexts/              # React Context providers
├── lib/                   # Utility functions and configurations
└── styles/                # Global CSS and styling
```

---

## 📄 **Page Structure & Routes**

### **🏠 Public Pages**
| Route | File | Purpose | Key Components |
|-------|------|---------|----------------|
| `/` | `src/app/page.tsx` | Landing page | Hero, Features, PopularCourses, QuizPreview |
| `/about` | `src/app/about/page.tsx` | About Acadex story | Typography components, Card system |
| `/courses` | `src/app/courses/page.tsx` | Course listing | EnhancedCourseCard, Pagination, Filters |
| `/quizzes` | `src/app/quizzes/page.tsx` | Quiz listing | Quiz cards, CategoryFilter |
| `/contact` | `src/app/contact/page.tsx` | Contact form | Contact form components |
| `/terms` | `src/app/terms/page.tsx` | Terms of service | Legal content |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy | Legal content |

### **🔐 Protected Student Pages**
| Route | File | Purpose | Key Components | Auth Required |
|-------|------|---------|----------------|---------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Student dashboard | Course progress, Enrollment stats | ✅ Student |
| `/profile` | `src/app/profile/page.tsx` | User profile management | Profile forms, Settings | ✅ Student |
| `/courses/[id]/study` | `src/app/courses/[id]/study/page.tsx` | Course study interface | Lesson viewer, Progress tracking | ✅ Student |
| `/quizzes/[id]/take` | `src/app/quizzes/[id]/take/page.tsx` | Quiz taking interface | Question display, Timer | ✅ Student |
| `/quizzes/[id]/results/[resultId]` | `src/app/quizzes/[id]/results/[resultId]/page.tsx` | Quiz results | Score display, Analytics | ✅ Student |

### **👨‍💼 Admin Pages**
| Route | File | Purpose | Key Components | Auth Required |
|-------|------|---------|----------------|---------------|
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard | Statistics, Overview cards | ✅ Admin |
| `/admin/courses` | `src/app/admin/courses/page.tsx` | Course management | CourseForm, Course listing | ✅ Admin |
| `/admin/courses/create` | `src/app/admin/courses/create/page.tsx` | Course creation | EnhancedAPICourseForm | ✅ Admin |
| `/admin/courses/[id]/edit` | `src/app/admin/courses/[id]/edit/page.tsx` | Course editing | EnhancedAPICourseForm | ✅ Admin |
| `/admin/quizzes` | `src/app/admin/quizzes/page.tsx` | Quiz management | QuizForm, Quiz listing | ✅ Admin |
| `/admin/quizzes/create` | `src/app/admin/quizzes/create/page.tsx` | Quiz creation | QuizForm | ✅ Admin |
| `/admin/quizzes/[id]/edit` | `src/app/admin/quizzes/[id]/edit/page.tsx` | Quiz editing | QuizForm | ✅ Admin |
| `/admin/users` | `src/app/admin/users/page.tsx` | User management | User tables, Role management | ✅ Admin |
| `/admin/enrollments` | `src/app/admin/enrollments/page.tsx` | Enrollment management | Enrollment stats, Management | ✅ Admin |

### **🔒 Authentication Pages**
| Route | File | Purpose | Key Components |
|-------|------|---------|----------------|
| `/auth/login` | `src/app/auth/login/page.tsx` | User login | EmailField, PasswordField |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | User registration | EmailField, PasswordField, PasswordStrengthMeter |
| `/auth/forgot-password` | `src/app/auth/forgot-password/page.tsx` | Password reset | Email form |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | Access denied | Error message, Redirect |

---

## 🧩 **Component Architecture**

### **📱 Layout Components**
#### `src/app/layout.tsx` - Root Layout
**Purpose**: Global app wrapper with providers
**Key Features**:
- Font configuration (Inter, Geist)
- SEO metadata
- AuthProvider wrapper
- ConditionalLayout integration

#### `src/components/ConditionalLayout.tsx`
**Purpose**: Smart layout wrapper that shows/hides Header/Footer based on route
**Logic**:
```tsx
const isAdminRoute = pathname.startsWith('/admin')
if (isAdminRoute) return <>{children}</> // No header/footer for admin
return <><Header /><main>{children}</main><Footer /></>
```

#### `src/app/admin/layout.tsx` - Admin Layout
**Purpose**: Admin-specific layout with sidebar
**Key Features**:
- AdminRoute protection
- AdminSidebar integration
- Mobile-responsive sidebar toggle

### **🎨 UI Components System**

#### **Card System** (`src/components/ui/card.tsx`)
**Unified Card Component** with variants:
- `base` - Default content cards
- `glass` - Hero sections, filters, overlays
- `elevated` - Important/featured content
- `interactive` - Clickable/hoverable cards
- `legacy` - For legacy code migration

#### **Layout System** (`src/components/ui/Layout.tsx`)
**Container Component**:
```tsx
<Container size="lg" padding="md" center={true}>
  {children}
</Container>
```

**Section Component**:
```tsx
<Section spacing="md" background="glass">
  {children}
</Section>
```

**Grid Component**:
```tsx
<Grid cols={3} gap="md" responsive={{sm: 1, md: 2, lg: 3}}>
  {children}
</Grid>
```

#### **Typography System** (`src/components/ui/Typography.tsx`)
**Standardized Text Components**:
- `DisplayLG`, `DisplayMD` - Large display text
- `H1`, `H2`, `H3`, `H4` - Semantic headings
- `BodyLG`, `BodyMD`, `BodySM` - Body text variants
- Consistent font hierarchy and responsive scaling

### **🔐 Authentication & Security**

#### `src/contexts/AuthContext.tsx`
**Purpose**: Global authentication state management
**Key Features**:
- User authentication state
- Role-based access control (student/admin)
- Security auditing integration
- Session management

#### `src/components/AdminRoute.tsx`
**Purpose**: Route protection for admin pages
**Logic**: Checks user role and redirects non-admin users

#### `src/components/security/ProtectedRoute.tsx`
**Purpose**: Generic route protection with configurable roles
**Features**:
- Customizable role requirements
- Fallback components
- Redirect logic

### **📚 Course Management Components**

#### `src/components/admin/EnhancedAPICourseForm.tsx`
**Purpose**: Comprehensive course creation/editing
**Key Features**:
- Course modules and lessons management
- Rich text content editing
- Image upload integration
- AI course generation integration
- Learning outcomes management

**Dependencies**:
- `useAuth()` - Authentication context
- `CategorySelector` - Course categorization
- `ImageUpload` - Course thumbnail upload
- `AICourseBuilder` - AI-powered course generation
- `LessonQuizManager` - Lesson-specific quiz management

#### `src/components/admin/CourseForm.tsx`
**Purpose**: Standard course creation form
**Key Features**:
- Basic course information
- Module/lesson structure
- Quiz integration
- File uploads

#### `src/components/cards/EnhancedCourseCard.tsx`
**Purpose**: Course display card for listings
**Features**:
- Course thumbnail and information
- Enrollment button
- Progress indicators
- Responsive design

### **📝 Quiz Management Components**

#### `src/components/admin/QuizForm.tsx`
**Purpose**: Interactive quiz builder
**Key Features**:
- Drag-and-drop question ordering
- Multiple question types (multiple choice, true/false, short answer)
- AI-powered quiz generation
- Rich media support (images, audio)
- Real-time validation

**Dependencies**:
- `AIQuizGenerator` - AI quiz creation
- `ImageUpload` - Question media upload
- `DragDropContext` - Question reordering
- `useAuth()` - User authentication

#### `src/components/admin/QuizViewModal.tsx`
**Purpose**: Quiz preview and viewing
**Features**:
- Read-only quiz display
- Question preview
- Statistics overview

### **🏠 Landing Page Components**

#### `src/components/Hero.tsx`
**Purpose**: Main landing page hero section
**Features**:
- Split-screen layout (60/40 ratio)
- Professional spacing system
- CTA buttons with proper contrast
- Responsive design

#### `src/components/Features.tsx`
**Purpose**: Platform features showcase
**Features**:
- Grid layout with feature cards
- Lucide React icons
- Professional spacing
- Hover effects

#### `src/components/PopularCourses.tsx`
**Purpose**: Course preview section
**Features**:
- Course card carousel
- Smart image mapping
- Loading states
- Enrollment integration

#### `src/components/QuizPreview.tsx`
**Purpose**: Quiz system preview
**Features**:
- Interactive quiz demonstration
- Statistics display
- Lucide React icons (Target, TrendingUp, Award, Clock)

### **🔧 Utility Components**

#### `src/components/ui/Icon.tsx`
**Purpose**: Centralized icon management
**Features**:
- Consistent icon sizing
- Type-safe icon names
- Color inheritance

#### `src/components/ui/ImageUpload.tsx`
**Purpose**: File upload interface
**Features**:
- Drag-and-drop support
- File validation
- Supabase Storage integration
- Preview functionality

#### `src/components/ui/Pagination.tsx`
**Purpose**: List pagination
**Features**:
- Page navigation
- Items per page selection
- Total count display

### **📊 Admin Components**

#### `src/components/admin/AdminSidebar.tsx`
**Purpose**: Admin navigation sidebar
**Features**:
- Role-based menu items
- Active state indicators
- Mobile responsive
- Statistics overview

#### `src/components/admin/CategoryManagement.tsx`
**Purpose**: Course category management
**Features**:
- Category CRUD operations
- Validation
- Real-time updates

#### `src/components/admin/EnhancedDeleteModal.tsx`
**Purpose**: Confirmation modal for deletions
**Features**:
- Item statistics display
- Confirmation workflow
- Safety measures

---

## 🔄 **Data Flow & State Management**

### **Authentication Flow**
```
1. User accesses protected route
2. Middleware checks authentication (middleware.ts)
3. AuthContext provides user state
4. ProtectedRoute/AdminRoute validates access
5. Component renders with user context
```

### **Course Management Flow**
```
1. Admin creates course (EnhancedAPICourseForm)
2. Form validates data (courseConstants.ts)
3. API call to /api/admin/courses/enhanced
4. Database update via Supabase
5. UI updates via state management
6. Student sees course in listing (courses/page.tsx)
```

### **Quiz Taking Flow**
```
1. Student selects quiz (quizzes/page.tsx)
2. Quiz loads (quizzes/[id]/take/page.tsx)
3. Questions render with validation
4. Answers submitted to API
5. Results calculated and stored
6. Results page displays (quizzes/[id]/results/[resultId]/page.tsx)
```

### **State Management Patterns**
- **Global State**: AuthContext for user authentication
- **Local State**: useState for component-specific data
- **Server State**: Direct Supabase queries with caching
- **Form State**: Controlled components with validation

---

## 🛠️ **Key Libraries & Dependencies**

### **Core Dependencies**
- `next` - Next.js framework
- `react` - React library
- `typescript` - Type safety
- `@supabase/supabase-js` - Database client
- `tailwindcss` - Styling framework

### **UI & Icons**
- `lucide-react` - Icon library
- `@hello-pangea/dnd` - Drag and drop functionality
- Custom UI components (cards, typography, layout)

### **Authentication & Security**
- Supabase Auth
- Custom security middleware
- Role-based access control

### **Image Management**
- Supabase Storage
- Smart image mapping system
- Upload validation and optimization

---

## 📦 **Component Dependencies Map**

### **High-Level Dependencies**
```
layout.tsx
├── AuthProvider (contexts/AuthContext.tsx)
├── ConditionalLayout (components/ConditionalLayout.tsx)
    ├── Header (components/Header.tsx)
    ├── Footer (components/Footer.tsx)
    └── Main Content (app pages)

admin/layout.tsx
├── AdminRoute (components/AdminRoute.tsx)
├── AdminSidebar (components/admin/AdminSidebar.tsx)
└── Admin Pages
```

### **Page Component Dependencies**
```
Home Page (/)
├── Hero (components/Hero.tsx)
├── Features (components/Features.tsx)
├── HonestSection (components/HonestSection.tsx)
├── PopularCourses (components/PopularCourses.tsx)
└── QuizPreview (components/QuizPreview.tsx)

Admin Courses (/admin/courses)
├── EnhancedAPICourseForm (components/admin/EnhancedAPICourseForm.tsx)
├── CourseViewModal (components/admin/CourseViewModal.tsx)
├── DeleteCourseModal (components/admin/DeleteCourseModal.tsx)
└── CategoryManagement (components/admin/CategoryManagement.tsx)

Admin Quizzes (/admin/quizzes)
├── QuizForm (components/admin/QuizForm.tsx)
├── AIQuizGenerator (components/admin/AIQuizGenerator.tsx)
└── QuizViewModal (components/admin/QuizViewModal.tsx)
```

### **Form Component Dependencies**
```
EnhancedAPICourseForm
├── useAuth() (contexts/AuthContext.tsx)
├── CategorySelector (components/admin/CategorySelector.tsx)
├── ImageUpload (components/ui/ImageUpload.tsx)
├── AICourseBuilder (components/admin/AICourseBuilder.tsx)
└── LessonQuizManager (components/admin/LessonQuizManager.tsx)

QuizForm
├── useAuth() (contexts/AuthContext.tsx)
├── AIQuizGenerator (components/admin/AIQuizGenerator.tsx)
├── ImageUpload (components/ui/ImageUpload.tsx)
└── DragDropContext (@hello-pangea/dnd)
```

---

## 🔍 **API Routes Structure**

### **Admin APIs**
- `/api/admin/courses` - Course CRUD operations
- `/api/admin/courses/enhanced` - Enhanced course management
- `/api/admin/courses/modules` - Module management
- `/api/admin/quizzes` - Quiz CRUD operations
- `/api/admin/users` - User management
- `/api/admin/generate-course` - AI course generation

### **Student APIs**
- `/api/courses` - Course listing and details
- `/api/quizzes` - Quiz taking and results
- `/api/enrollments` - Course enrollment
- `/api/profile` - User profile management

### **Authentication APIs**
- `/api/auth/login` - User login
- `/api/auth/signup` - User registration
- `/api/auth/logout` - User logout
- `/api/debug/user` - User debugging (development)

---

## 🎯 **Design System Standards**

### **Color System**
- **Primary**: Prussian Blue (#1D63FF) - Trust and professionalism
- **Secondary**: Yellow (#FFCE32) - Highlights and CTAs
- **Button Pattern**: `bg-primary hover:bg-secondary text-white hover:text-black`

### **Typography Hierarchy**
- **Font Family**: Inter (consistent across all components)
- **Heading Structure**: h1 → h2 → h3 → h4 with appropriate Tailwind classes
- **Text Contrast**: WCAG AA compliance (4.5:1 normal text, 3:1 large text)

### **Spacing System**
- **Base**: 4px/8px Material Design grid
- **Page Sections**: 64-96px hero sections, 24-32px grid gaps
- **Component Internal**: 4px, 8px, 12px, 16px increments

### **Component Standards**
- **Cards**: Unified Card component with variants
- **Icons**: Lucide React for consistency and performance
- **Forms**: Controlled components with proper validation
- **Layout**: Container/Section/Grid system for consistency

---

## 🚀 **Development Guidelines**

### **TypeScript Standards**
- Strict mode enabled
- No `any` types allowed
- Proper nullability handling
- Interface matching database schema exactly

### **Component Patterns**
- Functional components with hooks
- Props interface definition
- Proper error boundaries
- Loading state handling

### **Performance Optimizations**
- Lazy loading for heavy admin components (`LazyComponents.tsx`)
- Image optimization with Next.js Image component
- Code splitting by route
- Efficient database queries

### **Security Practices**
- Role-based access control
- Input validation and sanitization
- API route protection
- Security event logging

---

## 📈 **Future Roadmap**

### **Current State** ✅
- Complete design system implementation
- Professional spacing and typography
- Unified Card component system
- Role-based authentication
- Course and quiz management
- Mobile-responsive design

### **Next Phase Priorities**
1. **Dashboard Enhancement** - Improved student experience
2. **Authentication Pages** - Complete design system migration
3. **Course Study Interface** - Enhanced learning experience
4. **About & Contact Pages** - Brand consistency completion
5. **Performance Optimization** - Bundle size reduction
6. **Advanced Features** - AI integration expansion

---

## 🎨 **Review: Containers & Cards with Primary Backgrounds**

### **✅ Correct Implementations (Following Design Standards)**

#### **1. Buttons with Primary Backgrounds**
All button implementations correctly follow the standardized pattern:
```tsx
className="bg-primary hover:bg-secondary text-white hover:text-black"
```

**Examples:**
- `Header.tsx` - Signup button (line 169)
- `Hero.tsx` - Start learning button (line 45)
- `HonestSection.tsx` - Main CTA button (line 55)
- `NewsletterSignup.tsx` - Subscribe button (line 33)
- `QuizPreview.tsx` - Start quiz button (line 200)
- `PopularCourses.tsx` - Enroll button (line 255)

#### **2. Icon Container Backgrounds**
**Primary colored circular containers for icons** - ✅ **Correct Usage**:
```tsx
className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
```

**Examples:**
- `Header.tsx` - User avatar placeholders (lines 125, 241)
- `Hero.tsx` - Feature icons (lines 96, 169)
- `Features.tsx` - Feature highlight icons (line 72)
- `about/page.tsx` - Check mark icons (line 150)

#### **3. Progress Bars & Visual Elements**
**Primary color for progress indicators** - ✅ **Correct Usage**:
```tsx
className="bg-primary h-3 rounded-full"
```

**Examples:**
- `QuizPreview.tsx` - Progress bar (line 159)
- `lesson/LessonQuiz.tsx` - Quiz progress (line 273)

#### **4. Status/Badge Elements**
**Primary backgrounds for status indicators** - ✅ **Correct Usage**:
```tsx
className="bg-primary text-white px-6 py-3 rounded-full"
```

**Examples:**
- `Features.tsx` - Section badge (line 41)
- `QuizPreview.tsx` - Quiz status badge (line 71)
- `PopularCourses.tsx` - Course category badges (lines 128, 175)
- `quizzes/page.tsx` - Feature highlights (line 160)

### **⚠️ Cards/Containers Requiring Review**

#### **1. Gradient Background Cards** 
**Cards using primary in gradients** - 🔍 **Needs Review**:

**File: `HonestSection.tsx`**
```tsx
// Line 29 & 69 - Cards with primary gradient backgrounds
<Card variant="base" className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
```
**Status**: These cards use primary color in gradients (10% opacity) which is acceptable for subtle backgrounds.

**File: `admin/AIQuizGenerator.tsx`**
```tsx
// Line 96 - Card header with primary gradient
<CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5">
```
**Status**: Very subtle primary usage (5-10% opacity) for admin interfaces - acceptable.

#### **2. Admin Interface Cards**
**Admin cards with primary accents** - ✅ **Acceptable**:

**File: `admin/InlineAIQuizGenerator.tsx`**
```tsx
// Line 463 - Admin card with primary border and background
<Card variant="base" className="border-primary/20 bg-primary/5">
```
**Status**: Very subtle primary usage (5% background, 20% border) for admin tools - acceptable.

**File: `admin/users/page.tsx`**
```tsx
// Line 163 - Admin card with primary border
<Card variant="elevated" size="md" className="border-primary">
```
**Status**: Primary border only - follows design standards.

#### **3. Interactive Hover States**
**Cards with primary hover effects** - ✅ **Correct Usage**:

**File: `dashboard/page.tsx`**
```tsx
// Line 332 - Interactive card with primary gradient on hover
className="hover:border-primary bg-gradient-to-br from-primary/5 to-primary/10"
```
**Status**: Subtle primary gradients (5-10%) with primary border on hover - follows interaction patterns.

**File: `courses/[id]/study/page.tsx`**
```tsx
// Line 668 - Resource card with primary hover border
className="hover:border-primary hover:shadow-xl"
```
**Status**: Primary border on hover only - correct implementation.

### **🚫 Potential Issues Found**

#### **1. Text Contrast Issues**
**File: `profile/page.tsx`**
```tsx
// Lines 138, 198, 247 - Gradient text that may have contrast issues
className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 bg-clip-text text-transparent"
```
**Status**: ⚠️ **Potential Issue** - Very low opacity gradients for text may cause readability problems. Consider using solid colors for text.

### **📊 Summary Statistics**

**Total Primary Background Usage:**
- ✅ **Buttons**: 15+ implementations (all correct)
- ✅ **Icon Containers**: 8+ implementations (all correct) 
- ✅ **Progress Elements**: 3+ implementations (all correct)
- ✅ **Status Badges**: 10+ implementations (all correct)
- ⚠️ **Gradient Cards**: 5+ implementations (mostly acceptable)
- 🔍 **Text Elements**: 3 implementations (need review)

**Compliance Rate**: ~95% ✅

### **📋 Recommendations**

#### **1. Keep Current Patterns** ✅
- Button primary backgrounds with white text
- Icon container backgrounds 
- Progress indicators and status badges
- Subtle gradient backgrounds (5-10% opacity)

#### **2. Review Text Gradients** ⚠️
- Replace low-opacity gradient text with solid colors
- Ensure WCAG AA compliance (4.5:1 contrast ratio)

#### **3. Monitor Future Usage** 🔍
- Avoid solid primary backgrounds on large containers
- Keep primary usage to accent elements and interactive components
- Maintain white text on primary backgrounds

**Overall Assessment**: The codebase demonstrates excellent adherence to design standards with primary background usage properly limited to interactive elements, icons, and subtle accents rather than large container backgrounds.

---

*This documentation serves as a comprehensive guide to understanding the Acadex codebase structure, component relationships, and development patterns.*
