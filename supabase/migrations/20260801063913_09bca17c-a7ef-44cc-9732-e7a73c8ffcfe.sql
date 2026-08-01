ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS public.chat_moderation (
  user_id uuid PRIMARY KEY,
  warnings integer NOT NULL DEFAULT 0,
  banned_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.chat_moderation TO authenticated;
GRANT ALL ON public.chat_moderation TO service_role;
ALTER TABLE public.chat_moderation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own moderation" ON public.chat_moderation FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own moderation" ON public.chat_moderation FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own moderation" ON public.chat_moderation FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);