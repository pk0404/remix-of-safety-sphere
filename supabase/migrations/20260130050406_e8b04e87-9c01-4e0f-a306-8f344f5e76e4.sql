-- Fix the security definer view issue by recreating with security_invoker
DROP VIEW IF EXISTS public.volunteer_stats;

CREATE OR REPLACE VIEW public.volunteer_stats
WITH (security_invoker=on) AS
SELECT 
  COUNT(*) as total_volunteers,
  COUNT(*) FILTER (WHERE is_available = true) as available_volunteers,
  AVG(rating) as average_rating,
  SUM(total_responses) as total_responses,
  SUM(reward_points) as total_points_awarded
FROM public.volunteers;