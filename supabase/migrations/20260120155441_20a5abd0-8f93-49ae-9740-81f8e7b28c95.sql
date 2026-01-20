-- Create table for attendance/check-in records
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'missed', 'alerted')),
  next_check_in_due TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for incident reports (for the map feature)
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('theft', 'assault', 'harassment', 'suspicious', 'accident', 'other')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_verified BOOLEAN DEFAULT false,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for safety analytics
CREATE TABLE public.safety_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('sos_triggered', 'journey_completed', 'check_in_missed', 'location_shared', 'evidence_recorded')),
  metric_value INTEGER DEFAULT 1,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for offline sync queue
CREATE TABLE public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for check_ins
CREATE POLICY "Users can view own check-ins" ON public.check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON public.check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for incident_reports (anyone can view, only authenticated can create)
CREATE POLICY "Anyone can view incident reports" ON public.incident_reports
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create incident reports" ON public.incident_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for safety_analytics
CREATE POLICY "Users can view own analytics" ON public.safety_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analytics" ON public.safety_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for offline_sync_queue
CREATE POLICY "Users can view own sync queue" ON public.offline_sync_queue
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sync items" ON public.offline_sync_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync items" ON public.offline_sync_queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Add check-in interval setting to user_settings
ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS check_in_interval INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS check_in_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS missed_check_in_alert BOOLEAN DEFAULT true;