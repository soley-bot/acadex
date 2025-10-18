# 🗄️ Acadex Database Documentation

## 📂 Active Files

### 🎯 Core Schema
- **database-schema-v3-current.sql** - 🌟 Main production schema (40+ tables)
- **fresh-db-schema.sql** - Alternative clean schema

### 👤 Setup Scripts
- **create-admin-user.sql** - Creates first admin user
- **storage-setup.sql** - Configures Supabase storage buckets

### ⚡ Performance & Optimization
- **performance-indexes-week1.sql** - Initial indexes (✅ in main schema)
- **supabase-indexes-fixed.sql** - Index corrections (✅ in main schema)
- **optimize-quiz-triggers.sql** - Trigger optimizations (✅ in main schema)
- **quiz-builder-optimization.sql** - Builder optimizations (✅ in main schema)
- **safe-quiz-optimization.sql** - Safe improvements (✅ in main schema)

### 🔧 Maintenance Tools
- **fix-quiz-question-counts.sql** - Repair incorrect question counts
- **add-quiz-constraints.sql** - Add data validation
- **fix-rls-performance.sql** - Fix Row Level Security speed

### 🧪 Verification Scripts
- **schema-check.sql** - Verify schema structure
- **simple-verification.sql** - Health check
- **performance-verification.sql** - Performance test

### 📊 Sample Data
- **sample-quiz-data.sql** - Demo quiz questions

---

## 🚀 Quick Start

### Fresh Database Setup
```sql
-- Step 1: Run core schema
\i database/database-schema-v3-current.sql

-- Step 2: Create admin user (edit email first!)
\i database/create-admin-user.sql

-- Step 3: Setup storage
\i database/storage-setup.sql

-- Step 4: (Optional) Add sample data
\i database/sample-quiz-data.sql
```

---

## 🛠️ Database Connection Options

### ✅ Current Setup (Recommended)
**Using:** Supabase Client + Direct SQL

**Pros:**
- ✅ Connection pooling handled
- ✅ Built-in security (RLS)
- ✅ Auto-scaling
- ✅ Real-time subscriptions
- ✅ No extra setup

**Verdict:** Perfect for Acadex. Keep it!

### 🔄 Alternative: Prisma ORM
**Add only if you need:**
- Complex joins
- Strict TypeScript types
- Automated migrations
- ORM preference

**Install:**
```bash
npm install prisma @prisma/client
npx prisma init
npx prisma generate
```

### ⚡ Alternative: Drizzle ORM
**Best for:**
- Lightweight solution
- SQL-like syntax
- Edge runtime

**Install:**
```bash
npm install drizzle-orm drizzle-kit postgres
```

**💡 Recommendation:** Stick with current Supabase setup!

---

## 📋 Cleanup Recommendations

### Create Archive Folder
```bash
mkdir database/archive
```

### Move Applied Optimizations
These are already in main schema:
```bash
mv database/performance-indexes-week1.sql database/archive/
mv database/quiz-builder-optimization.sql database/archive/
mv database/safe-quiz-optimization.sql database/archive/
```

### Keep Active
- ✅ database-schema-v3-current.sql
- ✅ create-admin-user.sql
- ✅ storage-setup.sql
- ✅ fix-quiz-question-counts.sql
- ✅ schema-check.sql

## Database Features

Your current database supports:
- ✅ 45+ tables with full LMS functionality
- ✅ Reading quiz support with passage fields
- ✅ Advanced question types (multiple choice, essay, matching, etc.)
- ✅ Gamification system (badges, leaderboards, stats)
- ✅ E-commerce capabilities (courses, payments, certificates)
- ✅ AI-powered content review system
- ✅ Learning paths and structured progression
- ✅ Comprehensive analytics and reporting
- ✅ Group collaboration features
- ✅ Adaptive quiz settings
- ✅ Performance-optimized indexes

## Version History
- **v3 (Current)**: Complete feature set matching production database
- **v2**: Basic LMS with quiz system (deprecated)
- **v1**: Initial schema (deprecated)