
-- Harden RLS: remove overly-permissive public policies and scope reads properly.

-- profiles: drop public read; keep own-row read + add a limited-column public view
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Public-safe view exposing only non-sensitive display fields (for leaderboards, community feeds)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT user_id, display_name, username, rank, rank_level, points, monthly_points, is_verified, theme
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
CREATE POLICY "Public profile fields readable" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);
-- Note: the SELECT policy above is intentionally broad because the view is the recommended read path;
-- however sensitive columns (age, grade, school_name, education_system) should be avoided at the app layer.
-- Tighten: drop the broad policy and rely on the view instead:
DROP POLICY IF EXISTS "Public profile fields readable" ON public.profiles;

-- google_account_links: strict per-user
DROP POLICY IF EXISTS "Anyone can view links by google identity" ON public.google_account_links;
CREATE POLICY "Users view own google links" ON public.google_account_links
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- community_join_requests: only requester or community admin
DROP POLICY IF EXISTS "Anyone can view requests" ON public.community_join_requests;
CREATE POLICY "Requesters and admins view requests" ON public.community_join_requests
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_join_requests.community_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- community_members: authenticated only
DROP POLICY IF EXISTS "Anyone can view members" ON public.community_members;
CREATE POLICY "Authenticated view members" ON public.community_members
  FOR SELECT TO authenticated USING (true);

-- community_messages: authenticated only
DROP POLICY IF EXISTS "Anyone view messages" ON public.community_messages;
CREATE POLICY "Authenticated view messages" ON public.community_messages
  FOR SELECT TO authenticated USING (true);

-- community_posts: authenticated only
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;
CREATE POLICY "Authenticated view posts" ON public.community_posts
  FOR SELECT TO authenticated USING (true);

-- shared_videos: authenticated only
DROP POLICY IF EXISTS "Anyone can view shared videos" ON public.shared_videos;
CREATE POLICY "Authenticated view shared videos" ON public.shared_videos
  FOR SELECT TO authenticated USING (true);

-- Lock down SECURITY DEFINER functions: only authenticated users should call them
REVOKE EXECUTE ON FUNCTION public.increment_points(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_points(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reset_monthly_points() FROM PUBLIC, anon, authenticated;
-- reset is a maintenance job; keep it callable only by service_role
GRANT EXECUTE ON FUNCTION public.reset_monthly_points() TO service_role;
