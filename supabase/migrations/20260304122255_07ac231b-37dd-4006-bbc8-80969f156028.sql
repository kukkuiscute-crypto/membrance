
-- Add monthly points and verified to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_points integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_points_reset_at timestamp with time zone DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Unique constraint on username (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles (username) WHERE username IS NOT NULL;

-- AI chats table
CREATE TABLE public.ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assistant text NOT NULL DEFAULT 'amber',
  title text NOT NULL DEFAULT 'New Chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chats" ON public.ai_chats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create chats" ON public.ai_chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chats" ON public.ai_chats FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own chats" ON public.ai_chats FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Study connections table
CREATE TABLE public.study_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connected_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);
ALTER TABLE public.study_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connections" ON public.study_connections FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users send requests" ON public.study_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update connections" ON public.study_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users delete connections" ON public.study_connections FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Community messages for real-time chat
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  username text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view messages" ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Auth users send messages" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.community_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Saved videos table
CREATE TABLE public.saved_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  youtube_url text NOT NULL,
  youtube_id text,
  title text NOT NULL,
  channel text,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view saved videos" ON public.saved_videos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users save videos" ON public.saved_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete saved videos" ON public.saved_videos FOR DELETE TO authenticated USING (auth.uid() = user_id);
