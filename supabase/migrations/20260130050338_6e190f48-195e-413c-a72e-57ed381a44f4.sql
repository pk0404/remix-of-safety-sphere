-- Add journey location history tracking
CREATE TABLE IF NOT EXISTS public.journey_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journey_locations
ALTER TABLE public.journey_locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for journey_locations
CREATE POLICY "Users can view own journey locations" ON public.journey_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey locations" ON public.journey_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_journey_locations_journey_id ON public.journey_locations(journey_id);
CREATE INDEX idx_journey_locations_recorded_at ON public.journey_locations(recorded_at);

-- Enable realtime for journey_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.journey_locations;

-- Add additional columns to journeys for better tracking
ALTER TABLE public.journeys 
ADD COLUMN IF NOT EXISTS start_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS start_longitude DOUBLE PRECISION;

-- Create volunteer_admin view for admin dashboard (using security invoker)
CREATE OR REPLACE VIEW public.volunteer_stats AS
SELECT 
  COUNT(*) as total_volunteers,
  COUNT(*) FILTER (WHERE is_available = true) as available_volunteers,
  AVG(rating) as average_rating,
  SUM(total_responses) as total_responses,
  SUM(reward_points) as total_points_awarded
FROM public.volunteers;