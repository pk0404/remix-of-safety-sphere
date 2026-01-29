-- Add reward points to volunteers table
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'bronze';

-- Create help_sessions table for Zomato-style tracking with OTP
CREATE TABLE IF NOT EXISTS public.help_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_request_id UUID NOT NULL REFERENCES public.support_requests(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_progress', 'completed', 'cancelled')),
  otp_code TEXT NOT NULL,
  otp_verified BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  volunteer_lat DOUBLE PRECISION,
  volunteer_lng DOUBLE PRECISION,
  requester_lat DOUBLE PRECISION,
  requester_lng DOUBLE PRECISION,
  distance_km NUMERIC,
  response_time_seconds INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.help_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for help_sessions
CREATE POLICY "Volunteers can view their sessions" ON public.help_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.volunteers
      WHERE volunteers.id = help_sessions.volunteer_id
      AND volunteers.user_id = auth.uid()
    )
  );

CREATE POLICY "Requesters can view their sessions" ON public.help_sessions
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "System can create sessions" ON public.help_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update sessions" ON public.help_sessions
  FOR UPDATE USING (
    requester_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.volunteers
      WHERE volunteers.id = help_sessions.volunteer_id
      AND volunteers.user_id = auth.uid()
    )
  );

-- Create volunteer_rewards table for reward history
CREATE TABLE IF NOT EXISTS public.volunteer_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  help_session_id UUID REFERENCES public.help_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.volunteer_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their rewards" ON public.volunteer_rewards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.volunteers
      WHERE volunteers.id = volunteer_rewards.volunteer_id
      AND volunteers.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert rewards" ON public.volunteer_rewards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Make incident_reports viewable by all authenticated users (public hotspot map)
DROP POLICY IF EXISTS "Authenticated users can view incident reports" ON public.incident_reports;
CREATE POLICY "All authenticated users can view incidents" ON public.incident_reports
  FOR SELECT TO authenticated USING (true);

-- Enable realtime for help_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_sessions;