# Acadex Database Setup Guide

## 🚀 Quick Setup (Recommended)

### 1. New Installation
If you're setting up the database for the first time:

```sql
-- In Supabase SQL Editor, run this single file:
-- Copy the entire contents of database-schema-v2.sql and paste it
```

**File to use**: `database-schema-v2.sql`

### 2. Admin User Setup
After the main schema is set up:

```sql
-- Run this to create your admin user:
-- Copy contents of create-admin-user.sql
```

### 3. Sample Data (Optional)
Add some test data:

```sql
-- Copy contents of english-learning-seed.sql
```

## 📁 File Structure (After Cleanup)

```
database/
├── database-schema-v2.sql         # 🎯 MAIN SCHEMA (Use this!)
├── create-admin-user.sql          # Admin setup
├── english-learning-seed.sql      # Sample data
├── storage-setup.sql              # File upload setup
├── SETUP_GUIDE.md                 # This file
├── CLEANUP_PLAN.md                # Cleanup instructions
└── DEBUGGING.md                   # Troubleshooting
```

## ✅ What's Included in V2 Schema

### Quiz System Enhancements
- ✅ **Three-field answer system**: Supports all question types properly
  - `correct_answer` (integer) - for multiple choice, true/false
  - `correct_answer_text` (text) - for fill-in-blank, essay
  - `correct_answer_json` (jsonb) - for matching, ordering
- ✅ **Enhanced question types**: Multiple choice, true/false, fill-blank, essay, matching, ordering
- ✅ **Media support**: Image, audio, video attachments
- ✅ **Advanced features**: Time limits, feedback, hints, rubrics

### Course System
- ✅ **Complete course management**: Modules, lessons, resources
- ✅ **Progress tracking**: Enrollment progress, lesson completion
- ✅ **Certification system**: Certificate generation capability

### Performance & Security
- ✅ **Optimized indexes**: For fast queries and analytics
- ✅ **Row Level Security**: Proper access controls
- ✅ **Storage integration**: File upload support

## 🔧 Upgrading from Old Schema

### If you have existing data:

1. **Backup first!** Export your data
2. **Check what's already applied**:
   ```sql
   -- Check if you have the enhanced quiz system
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'quiz_questions' 
   AND column_name IN ('correct_answer_text', 'correct_answer_json');
   ```
3. **Apply missing parts only** or recreate with backup data

### Migration from Legacy Fix Files

If you were using the old fix files, this schema includes all of them:
- ✅ All `fix-*.sql` improvements
- ✅ All `add-*.sql` enhancements  
- ✅ Performance optimizations
- ✅ Security fixes

## 🛠️ Troubleshooting

### Common Issues:

**"Table already exists"**
- Either you have a partial setup, or this is an upgrade
- Check what tables exist and apply missing parts only

**"Permission denied"**
- Make sure you're running as a Supabase admin
- Check if RLS policies are blocking operations

**"Function doesn't exist"**
- The schema includes all required functions
- Make sure the entire schema file was executed

**Quiz creation errors**
- The new schema fixes all the previous `correct_answer.trim()` errors
- Supports all question types properly

### Get Help:
- Check `DEBUGGING.md` for specific error solutions
- Verify setup with the test queries at the end of the schema file

## 🎯 Next Steps After Setup

1. **Create admin user** (`create-admin-user.sql`)
2. **Add sample data** (`english-learning-seed.sql`) 
3. **Test quiz creation** in the admin panel
4. **Upload test images** to verify storage
5. **Create a test course** to verify everything works

## 📋 Cleanup Checklist

After setting up V2, you can safely remove these old files:
- All `fix-*.sql` files
- All `add-*.sql` files  
- `temp-*.sql` files
- `verify-*.sql` files
- Old schema files (`schema.sql`, `complete-setup.sql`)

Keep for reference:
- `DEBUGGING.md`
- `enhanced-quiz-system-migration.sql` (recent migration)
- `performance-indexes.sql` (reference)

---

**Database Version**: V2.0  
**Compatible with**: Updated quiz creation system  
**Last updated**: Current working version  
**Status**: ✅ Production ready
