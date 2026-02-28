
-- Add new columns to profiles for ranking, theme, and username
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS rank text NOT NULL DEFAULT 'Bronze',
  ADD COLUMN IF NOT EXISTS rank_level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS username_changed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'midnight-dark';

-- Add unique constraint on username
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
