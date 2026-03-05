
-- Add join_mode to communities (open or request)
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS join_mode text NOT NULL DEFAULT 'open';

-- Create join requests table
CREATE TABLE IF NOT EXISTS public.community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view requests" ON public.community_join_requests FOR SELECT USING (true);
CREATE POLICY "Users can send join requests" ON public.community_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requests" ON public.community_join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_join_requests.community_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can delete own requests" ON public.community_join_requests FOR DELETE USING (auth.uid() = user_id);

-- Create function to reset monthly points (run via cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_points = 0, monthly_points_reset_at = now()
  WHERE monthly_points_reset_at IS NULL
     OR monthly_points_reset_at < date_trunc('month', now());
END;
$$;

-- Enable realtime for community_join_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_join_requests;
