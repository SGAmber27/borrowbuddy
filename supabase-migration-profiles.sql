-- Borrow Buddy Supabase Migration: Phase 2 Step 1
-- Create profiles table + RLS policies
-- Run this in Supabase Dashboard > SQL Editor

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS 'uuid-ossp';

-- 1. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstName TEXT NOT NULL,
  lastName TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- Users can view own profile on profiles
CREATE POLICY "Users_view_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert own profile on profiles
CREATE POLICY "Users_insert_own_profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile on profiles
CREATE POLICY "Users_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles on profiles (add after admin role setup)
CREATE POLICY "Admins_view_all_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 5. AUTO-CREATE PROFILE (optional trigger for new users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, firstName, role)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1),  -- firstName from email
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RELOAD (reset RLS cache)
NOTIFY pgrst, 'reload schema';

-- ✅ Run this script then test: signup → check profiles table populated
-- Next: Update js/profile.js saveProfile(), test auth flow
