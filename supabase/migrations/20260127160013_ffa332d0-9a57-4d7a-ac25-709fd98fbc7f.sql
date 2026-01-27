-- =====================================================
-- VOLUNTEER ECOSYSTEM DATABASE SCHEMA
-- =====================================================

-- Volunteer registration table
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  last_location_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_available BOOLEAN DEFAULT true,
  notification_radius_km INTEGER DEFAULT 5,
  total_responses INTEGER DEFAULT 0,
  average_response_time_seconds INTEGER,
  rating DECIMAL(3,2) DEFAULT 5.00,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Support requests from women
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  request_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Volunteer notifications/alerts
CREATE TABLE public.volunteer_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  support_request_id UUID NOT NULL REFERENCES public.support_requests(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  distance_km DECIMAL(5,2)
);

-- Volunteer location history for tracking
CREATE TABLE public.volunteer_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin analytics data
CREATE TABLE public.volunteer_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for volunteers
CREATE POLICY "Users can view their own volunteer profile" 
ON public.volunteers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own volunteer profile" 
ON public.volunteers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own volunteer profile" 
ON public.volunteers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all active volunteers"
ON public.volunteers FOR SELECT
USING (auth.uid() IS NOT NULL AND is_available = true);

-- RLS Policies for support_requests
CREATE POLICY "Users can create support requests" 
ON public.support_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own support requests" 
ON public.support_requests FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Users can update their own support requests" 
ON public.support_requests FOR UPDATE 
USING (auth.uid() = requester_id);

CREATE POLICY "Volunteers can view pending support requests"
ON public.support_requests FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND status IN ('pending', 'active')
  AND EXISTS (
    SELECT 1 FROM public.volunteers 
    WHERE volunteers.user_id = auth.uid() 
    AND volunteers.is_available = true
  )
);

-- RLS Policies for volunteer_alerts
CREATE POLICY "Volunteers can view their own alerts" 
ON public.volunteer_alerts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers 
    WHERE volunteers.id = volunteer_alerts.volunteer_id 
    AND volunteers.user_id = auth.uid()
  )
);

CREATE POLICY "Volunteers can update their own alerts" 
ON public.volunteer_alerts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers 
    WHERE volunteers.id = volunteer_alerts.volunteer_id 
    AND volunteers.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert alerts"
ON public.volunteer_alerts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for volunteer_locations
CREATE POLICY "Volunteers can manage their own location" 
ON public.volunteer_locations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers 
    WHERE volunteers.id = volunteer_locations.volunteer_id 
    AND volunteers.user_id = auth.uid()
  )
);

-- RLS for analytics - viewable by authenticated users
CREATE POLICY "Authenticated users can view analytics"
ON public.volunteer_analytics FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert analytics"
ON public.volunteer_analytics FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add updated_at trigger for volunteers
CREATE TRIGGER update_volunteers_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for support requests and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteers;