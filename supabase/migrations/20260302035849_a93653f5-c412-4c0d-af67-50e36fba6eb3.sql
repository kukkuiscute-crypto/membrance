
-- Add school/institute fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS education_system text;
