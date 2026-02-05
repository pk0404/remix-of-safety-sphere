import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface HelpSession {
  id: string;
  support_request_id: string;
  volunteer_id: string;
  requester_id: string;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  otp_code: string;
  otp_verified: boolean;
  started_at: string;
  completed_at: string | null;
  volunteer_lat: number | null;
  volunteer_lng: number | null;
  requester_lat: number | null;
  requester_lng: number | null;
  distance_km: number | null;
  response_time_seconds: number | null;
  rating: number | null;
  feedback: string | null;
  points_earned: number;
}

// Generate a 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Calculate points based on distance and response time
const calculatePoints = (distanceKm: number | null, responseTimeSec: number | null): number => {
  let points = 50; // Base points
  
  if (distanceKm) {
    // Bonus for longer distance travel
    if (distanceKm > 5) points += 30;
    else if (distanceKm > 2) points += 20;
    else if (distanceKm > 1) points += 10;
  }
  
  if (responseTimeSec) {
    // Bonus for quick response
    if (responseTimeSec < 300) points += 50; // Under 5 mins
    else if (responseTimeSec < 600) points += 30; // Under 10 mins
    else if (responseTimeSec < 900) points += 15; // Under 15 mins
  }
  
  return points;
};

export const useHelpSession = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<HelpSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [volunteerProfile, setVolunteerProfile] = useState<{ id: string } | null>(null);

  // First fetch volunteer profile if user exists
  const fetchVolunteerProfile = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setVolunteerProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
      return null;
    }
  }, [user]);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;

    try {
      // Get volunteer ID first
      const volunteer = volunteerProfile || await fetchVolunteerProfile();
      
      // Build the query based on whether user is a volunteer
      let query = supabase
        .from('help_sessions')
        .select('*')
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);

      // If user is a volunteer, check both requester and volunteer sessions
      if (volunteer?.id) {
        query = query.or(`requester_id.eq.${user.id},volunteer_id.eq.${volunteer.id}`);
      } else {
        // If not a volunteer, only check requester sessions
        query = query.eq('requester_id', user.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      setActiveSession(data as HelpSession | null);
    } catch (error) {
      console.error('Error fetching help session:', error);
    }
  }, [user, volunteerProfile, fetchVolunteerProfile]);

  // Create a new help session when volunteer accepts
  // Note: OTP is generated here and stored - user will see it, helper must verify it
  const createSession = async (
    supportRequestId: string,
    volunteerId: string,
    requesterId: string,
    volunteerLat?: number,
    volunteerLng?: number,
    requesterLat?: number,
    requesterLng?: number
  ) => {
    setLoading(true);
    try {
      // Generate OTP for the user to show the helper
      const otp = generateOTP();
      
      const { data, error } = await supabase
        .from('help_sessions')
        .insert({
          support_request_id: supportRequestId,
          volunteer_id: volunteerId,
          requester_id: requesterId,
          otp_code: otp,
          status: 'accepted',
          volunteer_lat: volunteerLat,
          volunteer_lng: volunteerLng,
          requester_lat: requesterLat,
          requester_lng: requesterLng,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data as HelpSession);
      
      // Toast for helper - they don't see OTP, they need to ask user
      toast.success('Help session started!', {
        description: 'Navigate to the user and ask them for their OTP to verify arrival.',
        duration: 10000,
      });

      return data as HelpSession;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP to start the session
  const verifyOTP = async (sessionId: string, enteredOtp: string) => {
    if (!activeSession) return false;

    if (enteredOtp !== activeSession.otp_code) {
      toast.error('Invalid OTP');
      return false;
    }

    try {
      const { error } = await supabase
        .from('help_sessions')
        .update({
          otp_verified: true,
          status: 'in_progress',
        })
        .eq('id', sessionId);

      if (error) throw error;

      setActiveSession(prev => prev ? { ...prev, otp_verified: true, status: 'in_progress' } : null);
      toast.success('OTP verified! Help is on the way!');
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
      return false;
    }
  };

  // Complete the session
  const completeSession = async (sessionId: string, rating?: number, feedback?: string) => {
    setLoading(true);
    try {
      const session = activeSession;
      if (!session) throw new Error('No active session');

      const completedAt = new Date().toISOString();
      const responseTimeSec = session.started_at 
        ? Math.floor((new Date(completedAt).getTime() - new Date(session.started_at).getTime()) / 1000)
        : null;
      
      const pointsEarned = calculatePoints(session.distance_km, responseTimeSec);

      // Update help session
      const { error: sessionError } = await supabase
        .from('help_sessions')
        .update({
          status: 'completed',
          completed_at: completedAt,
          response_time_seconds: responseTimeSec,
          rating,
          feedback,
          points_earned: pointsEarned,
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Award points to volunteer
      await supabase
        .from('volunteer_rewards')
        .insert({
          volunteer_id: session.volunteer_id,
          points: pointsEarned,
          reason: 'Completed help session',
          help_session_id: sessionId,
        });

      // Update volunteer's total points - using direct query
      const { data: volunteerData } = await supabase
        .from('volunteers')
        .select('reward_points, total_responses')
        .eq('id', session.volunteer_id)
        .single();

      if (volunteerData) {
        await supabase
          .from('volunteers')
          .update({
            reward_points: (volunteerData.reward_points || 0) + pointsEarned,
            total_responses: (volunteerData.total_responses || 0) + 1,
          })
          .eq('id', session.volunteer_id);
      }

      // Update support request status
      await supabase
        .from('support_requests')
        .update({ status: 'resolved', resolved_at: completedAt })
        .eq('id', session.support_request_id);

      setActiveSession(null);
      toast.success(`Session completed! +${pointsEarned} points earned!`);
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel the session
  const cancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('help_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      setActiveSession(null);
      toast.info('Session cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      return false;
    }
  };

  // Update volunteer location during session
  const updateVolunteerLocation = async (sessionId: string, lat: number, lng: number) => {
    try {
      await supabase
        .from('help_sessions')
        .update({ volunteer_lat: lat, volunteer_lng: lng })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('help-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_sessions',
        },
        (payload) => {
          fetchActiveSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchActiveSession]);

  useEffect(() => {
    fetchVolunteerProfile();
  }, [fetchVolunteerProfile]);

  useEffect(() => {
    if (volunteerProfile !== undefined) {
      fetchActiveSession();
    }
  }, [volunteerProfile, fetchActiveSession]);

  return {
    activeSession,
    loading,
    createSession,
    verifyOTP,
    completeSession,
    cancelSession,
    updateVolunteerLocation,
    refetch: fetchActiveSession,
  };
};
