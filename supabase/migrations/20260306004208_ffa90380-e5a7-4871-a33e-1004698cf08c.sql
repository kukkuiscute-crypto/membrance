
-- Calendar events table for planner
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'one_time',
  event_date DATE,
  day_of_week INTEGER,
  start_time TIME,
  end_time TIME,
  is_day_off BOOLEAN DEFAULT false,
  repeat_mode TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own events" ON public.calendar_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update events" ON public.calendar_events FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete events" ON public.calendar_events FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Daily routine tasks table
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '10:00',
  completed BOOLEAN DEFAULT false,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tasks" ON public.daily_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create tasks" ON public.daily_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update tasks" ON public.daily_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete tasks" ON public.daily_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow community creators to delete communities
CREATE POLICY "Creators can delete communities" ON public.communities FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Allow admins to update members (for kicking)
CREATE POLICY "Admins can update members" ON public.community_members FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
);

-- Allow admins to delete members (kick)
CREATE POLICY "Admins can delete members" ON public.community_members FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
);

-- Drop the old delete policy that only allowed self-leave
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
