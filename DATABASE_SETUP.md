# 🚀 Acadex Database Setup Guide

## 🚨 YOUR DATABASE IS EMPTY - SIMPLE ONE-STEP SOLUTION

### ⚡ Quick Setup (Recommended - Takes 30 seconds)

1. **Go to Supabase Dashboard**: [supabase.com](https://supabase.com) → Your Acadex Project
2. **Open SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Copy Complete Script**: Copy ALL contents from `/database/complete-setup.sql`
4. **Paste & Run**: Paste into SQL editor and click "**Run**"
5. **Wait for Success**: Look for "Database setup complete!" message

**✅ That's it! Your database now has all tables + English learning data.**

---

## 📊 What You'll Get

### 🎓 **6 Expert English Instructors**
- Sarah Johnson (Grammar Specialist)
- David Smith (Vocabulary & Test Prep)
- Maria Garcia (Pronunciation & Speaking)
- James Wilson (Speaking & Business English)
- Emma Thompson (Business English & Literature)
- Robert Brown (Writing & Advanced English)

### 📚 **12 English Courses** (All Levels)

**🟢 Beginner (4 courses):**
- English Basics: Start Your Journey ($49)
- Essential Vocabulary for Daily Life ($39)
- Basic English Pronunciation ($59)
- Simple Conversations in English ($69)

**🟡 Intermediate (4 courses):**
- English Grammar Mastery ($89)
- Business English Essentials ($129)
- Academic Writing Skills ($99)
- Intermediate Listening & Speaking ($109)

**🔴 Advanced (4 courses):**
- Advanced English Composition ($149)
- English Literature & Analysis ($159)
- Advanced Business Communication ($199)
- IELTS/TOEFL Preparation ($179)

### 🧠 **12 Interactive Quizzes**
- **Grammar**: Beginner, Intermediate, Advanced
- **Vocabulary**: Essential words, Advanced terms
- **Pronunciation**: Sound patterns & rules
- **Speaking**: Conversation practice
- **Business English**: Professional vocabulary
- **Writing**: Academic skills
- **Literature**: Classic works analysis
- **Test Preparation**: IELTS/TOEFL practice

### 📝 **50+ Quiz Questions**
Each quiz includes multiple questions with:
- 4 multiple choice options
- Detailed explanations
- Progressive difficulty
- Real-world examples

---

## 🔧 Alternative: Manual Step-by-Step

If you prefer to do it manually:

### Step 1: Create Tables
```sql
-- Copy and run: /database/schema.sql
```

### Step 2: Add Data
```sql
-- Copy and run: /database/english-learning-seed.sql
```

---

## ✅ Verify Setup

After running the script, check these tables in **Table Editor**:

- **users**: 6 instructor records
- **courses**: 12 English courses  
- **quizzes**: 12 interactive quizzes
- **quiz_questions**: 50+ questions with explanations

---

## 🔴 Troubleshooting

**❌ "Table doesn't exist" error?**
→ Run `/database/complete-setup.sql` (creates tables first)

**❌ "Permission denied" error?**
→ Check your Supabase project permissions

**❌ No data showing in app?**
→ Verify `.env.local` has correct Supabase credentials

---

## 🎯 Next Steps

1. ✅ **Seed database** (using instructions above)
2. 🚀 **Test your app**: `npm run dev`
3. 🌐 **Visit**: http://localhost:3000
4. 📱 **Check pages**: Home → Courses → Quizzes
5. 🎉 **See live English learning data!**

---

## 📱 App Features Now Working

✅ **Home Page**: Shows popular English courses from database
✅ **Courses Page**: All 12 courses with filtering by level/category  
✅ **Quizzes Page**: All quizzes with English-specific categories
✅ **Quiz Preview**: Random sample questions from database

Your Acadex English learning platform is now fully functional with realistic data! 🎉
