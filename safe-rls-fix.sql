-- SAFER RLS FIX - CHECKS FOR TABLE/COLUMN EXISTENCE FIRST
-- Run this in Supabase SQL Editor to fix RLS errors safely

-- =============================================
-- 1. CHECK EXISTING TABLES AND COLUMNS
-- =============================================
DO $$ 
BEGIN
    RAISE NOTICE 'Checking existing tables...';
    
    -- List all tables in public schema
    FOR rec IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        RAISE NOTICE 'Found table: %', rec.table_name;
    END LOOP;
END $$;

-- =============================================
-- 2. DISABLE RLS ON EXISTING TABLES ONLY
-- =============================================
DO $$ 
BEGIN
    -- Only disable RLS on tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on users table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on courses table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
        ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on course_modules table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
        ALTER TABLE public.course_lessons DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on course_lessons table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_resources') THEN
        ALTER TABLE public.course_resources DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on course_resources table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quizzes') THEN
        ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on quizzes table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on quiz_questions table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_attempts') THEN
        ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on quiz_attempts table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrollments') THEN
        ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on enrollments table';
    END IF;
END $$;

-- =============================================
-- 3. DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =============================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE 'Dropping existing policies...';
    -- Drop all existing policies
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- =============================================
-- 4. CREATE RLS POLICIES FOR EXISTING TABLES
-- =============================================

-- USERS TABLE POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE POLICY "users_select_own" ON public.users
            FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "users_insert_own" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);

        CREATE POLICY "users_update_own" ON public.users
            FOR UPDATE USING (auth.uid() = id);
            
        -- Admin can see all users
        CREATE POLICY "users_select_admin" ON public.users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for users table';
    END IF;
END $$;

-- COURSES TABLE POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        CREATE POLICY "courses_select_all" ON public.courses
            FOR SELECT USING (true);

        CREATE POLICY "courses_insert_admin" ON public.courses
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "courses_update_admin" ON public.courses
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "courses_delete_admin" ON public.courses
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for courses table';
    END IF;
END $$;

-- COURSE MODULES POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
        CREATE POLICY "course_modules_select_all" ON public.course_modules
            FOR SELECT USING (true);

        CREATE POLICY "course_modules_insert_admin" ON public.course_modules
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "course_modules_update_admin" ON public.course_modules
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "course_modules_delete_admin" ON public.course_modules
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for course_modules table';
    END IF;
END $$;

-- COURSE LESSONS POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
        CREATE POLICY "course_lessons_select_all" ON public.course_lessons
            FOR SELECT USING (true);

        CREATE POLICY "course_lessons_insert_admin" ON public.course_lessons
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "course_lessons_update_admin" ON public.course_lessons
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "course_lessons_delete_admin" ON public.course_lessons
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for course_lessons table';
    END IF;
END $$;

-- QUIZZES TABLE POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quizzes') THEN
        CREATE POLICY "quizzes_select_all" ON public.quizzes
            FOR SELECT USING (true);

        CREATE POLICY "quizzes_insert_admin" ON public.quizzes
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "quizzes_update_admin" ON public.quizzes
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "quizzes_delete_admin" ON public.quizzes
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for quizzes table';
    END IF;
END $$;

-- QUIZ QUESTIONS POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        CREATE POLICY "quiz_questions_select_all" ON public.quiz_questions
            FOR SELECT USING (true);

        CREATE POLICY "quiz_questions_insert_admin" ON public.quiz_questions
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "quiz_questions_update_admin" ON public.quiz_questions
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );

        CREATE POLICY "quiz_questions_delete_admin" ON public.quiz_questions
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for quiz_questions table';
    END IF;
END $$;

-- QUIZ ATTEMPTS POLICIES (if exists and check column name)
DO $$ 
DECLARE
    user_column_name text;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_attempts') THEN
        -- Check if it's user_id or student_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_attempts' AND column_name = 'user_id') THEN
            user_column_name := 'user_id';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_attempts' AND column_name = 'student_id') THEN
            user_column_name := 'student_id';
        ELSE
            RAISE NOTICE 'No user column found in quiz_attempts table';
            RETURN;
        END IF;
        
        EXECUTE format('CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
            FOR SELECT USING (auth.uid() = %I)', user_column_name);

        EXECUTE format('CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
            FOR INSERT WITH CHECK (auth.uid() = %I)', user_column_name);

        EXECUTE format('CREATE POLICY "quiz_attempts_update_own" ON public.quiz_attempts
            FOR UPDATE USING (auth.uid() = %I)', user_column_name);

        CREATE POLICY "quiz_attempts_select_admin" ON public.quiz_attempts
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for quiz_attempts table using column: %', user_column_name;
    END IF;
END $$;

-- ENROLLMENTS POLICIES (if exists and check column name)
DO $$ 
DECLARE
    user_column_name text;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrollments') THEN
        -- Check if it's user_id or student_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'user_id') THEN
            user_column_name := 'user_id';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'student_id') THEN
            user_column_name := 'student_id';
        ELSE
            RAISE NOTICE 'No user column found in enrollments table';
            RETURN;
        END IF;
        
        EXECUTE format('CREATE POLICY "enrollments_select_own" ON public.enrollments
            FOR SELECT USING (auth.uid() = %I)', user_column_name);

        EXECUTE format('CREATE POLICY "enrollments_insert_own" ON public.enrollments
            FOR INSERT WITH CHECK (auth.uid() = %I)', user_column_name);

        EXECUTE format('CREATE POLICY "enrollments_update_own" ON public.enrollments
            FOR UPDATE USING (auth.uid() = %I)', user_column_name);

        CREATE POLICY "enrollments_select_admin" ON public.enrollments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'instructor')
                )
            );
            
        RAISE NOTICE 'Created policies for enrollments table using column: %', user_column_name;
    END IF;
END $$;

-- =============================================
-- 5. RE-ENABLE RLS ON EXISTING TABLES
-- =============================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on users table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on courses table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
        ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on course_modules table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
        ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on course_lessons table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quizzes') THEN
        ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on quizzes table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on quiz_questions table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_attempts') THEN
        ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on quiz_attempts table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrollments') THEN
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on enrollments table';
    END IF;
END $$;

-- =============================================
-- 6. GRANT NECESSARY PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- 7. CREATE TRIGGER FOR USER CREATION (if users table exists)
-- =============================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $func$
        BEGIN
          INSERT INTO public.users (id, email, name, role)
          VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
            CASE 
              WHEN new.email = 'admin01@acadex.com' THEN 'admin'
              ELSE 'student'
            END
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            updated_at = now();
          RETURN new;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          
        RAISE NOTICE 'Created user trigger successfully';
    END IF;
END $$;

-- =============================================
-- 8. VERIFICATION QUERIES
-- =============================================
RAISE NOTICE 'RLS FIX COMPLETED - CHECKING RESULTS:';

-- Show created policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

RAISE NOTICE 'RLS policies have been successfully updated!';
