-- Helper: membership check (definer to avoid RLS recursion on community_members)
CREATE OR REPLACE FUNCTION public.is_community_member(_community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = _community_id
      AND cm.user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.is_community_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_community_member(uuid) TO authenticated, service_role;

-- communities: authenticated only
DROP POLICY IF EXISTS "Anyone can view communities" ON public.communities;
DROP POLICY IF EXISTS "Authenticated view communities" ON public.communities;
CREATE POLICY "Authenticated users can view communities"
  ON public.communities FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.communities FROM anon;

-- community_members: own row or same-community members
DROP POLICY IF EXISTS "Anyone can view members" ON public.community_members;
DROP POLICY IF EXISTS "Authenticated view members" ON public.community_members;
CREATE POLICY "Members can view rosters of their communities"
  ON public.community_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_community_member(community_id));
REVOKE SELECT ON public.community_members FROM anon;

-- community_messages: members only + allow authors to edit their own
DROP POLICY IF EXISTS "Anyone view messages" ON public.community_messages;
DROP POLICY IF EXISTS "Authenticated view messages" ON public.community_messages;
CREATE POLICY "Members can view community messages"
  ON public.community_messages FOR SELECT TO authenticated
  USING (public.is_community_member(community_id));
CREATE POLICY "Authors can update their own messages"
  ON public.community_messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
REVOKE SELECT ON public.community_messages FROM anon;

-- community_posts: members only
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated view posts" ON public.community_posts;
CREATE POLICY "Members can view community posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (public.is_community_member(community_id));
REVOKE SELECT ON public.community_posts FROM anon;

-- shared_videos: own videos, global videos, or videos in a community you belong to
DROP POLICY IF EXISTS "Anyone can view shared videos" ON public.shared_videos;
DROP POLICY IF EXISTS "Authenticated view shared videos" ON public.shared_videos;
CREATE POLICY "Members can view shared videos"
  ON public.shared_videos FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR community_id IS NULL
    OR public.is_community_member(community_id)
  );
REVOKE SELECT ON public.shared_videos FROM anon;

-- SECURITY DEFINER hardening
CREATE OR REPLACE FUNCTION public.increment_points(amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF amount < 1 OR amount > 50 THEN
    RAISE EXCEPTION 'Invalid points amount: must be between 1 and 50';
  END IF;

  UPDATE public.profiles
  SET
    points = points + amount,
    monthly_points = monthly_points + amount,
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reset_monthly_points() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_monthly_points() TO service_role;