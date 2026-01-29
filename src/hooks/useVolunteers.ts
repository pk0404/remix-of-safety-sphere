import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Volunteer {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  location_lat?: number;
  location_lng?: number;
  last_location_update?: string;
  is_available: boolean;
  notification_radius_km: number;
  total_responses: number;
  average_response_time_seconds?: number;
  rating: number;
  verified: boolean;
  created_at: string;
  reward_points: number;
  badges: string[];
  level: string;
}

export interface SupportRequest {
  id: string;
  requester_id: string;
  requester_name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  request_type: string;
  description?: string;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface VolunteerAlert {
  id: string;
  support_request_id: string;
  volunteer_id: string;
  status: string;
  sent_at: string;
  viewed_at?: string | null;
  responded_at?: string | null;
  response?: string | null;
  distance_km?: number | null;
  support_request?: SupportRequest;
}

export const useVolunteers = () => {
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<VolunteerAlert[]>([]);
  const [activeRequests, setActiveRequests] = useState<SupportRequest[]>([]);

  const fetchVolunteerProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVolunteer(data as Volunteer);
        setIsVolunteer(true);
      } else {
        setVolunteer(null);
        setIsVolunteer(false);
      }
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const registerAsVolunteer = async (data: {
    full_name: string;
    phone: string;
    email?: string;
    notification_radius_km?: number;
    location_lat?: number;
    location_lng?: number;
  }) => {
    if (!user) {
      toast.error('Please sign in to register as a volunteer');
      return false;
    }

    try {
      const { error } = await supabase
        .from('volunteers')
        .insert({
          user_id: user.id,
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || user.email,
          notification_radius_km: data.notification_radius_km || 5,
          location_lat: data.location_lat,
          location_lng: data.location_lng,
          is_available: true,
        });

      if (error) throw error;

      toast.success('Registered as volunteer successfully!');
      await fetchVolunteerProfile();
      return true;
    } catch (error: any) {
      console.error('Error registering volunteer:', error);
      toast.error('Failed to register: ' + error.message);
      return false;
    }
  };

  const updateVolunteerLocation = async (lat: number, lng: number) => {
    if (!volunteer) return;

    try {
      await supabase
        .from('volunteers')
        .update({
          location_lat: lat,
          location_lng: lng,
          last_location_update: new Date().toISOString(),
        })
        .eq('id', volunteer.id);

      // Also add to location history
      await supabase
        .from('volunteer_locations')
        .insert({
          volunteer_id: volunteer.id,
          latitude: lat,
          longitude: lng,
        });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const toggleAvailability = async (isAvailable: boolean) => {
    if (!volunteer) return;

    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ is_available: isAvailable })
        .eq('id', volunteer.id);

      if (error) throw error;

      setVolunteer(prev => prev ? { ...prev, is_available: isAvailable } : null);
      toast.success(isAvailable ? 'You are now available' : 'You are now offline');
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const fetchAlerts = useCallback(async () => {
    if (!volunteer) return;

    try {
      const { data, error } = await supabase
        .from('volunteer_alerts')
        .select('*, support_requests(*)')
        .eq('volunteer_id', volunteer.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedAlerts = (data || []).map(alert => ({
        ...alert,
        support_request: alert.support_requests as SupportRequest,
      }));

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [volunteer]);

  const respondToAlert = async (alertId: string, response: 'accepted' | 'declined') => {
    if (!volunteer) return;

    try {
      const { error } = await supabase
        .from('volunteer_alerts')
        .update({
          status: response,
          responded_at: new Date().toISOString(),
          response,
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(response === 'accepted' ? 'You accepted the request' : 'Request declined');
      await fetchAlerts();
    } catch (error) {
      console.error('Error responding to alert:', error);
    }
  };

  const fetchActiveRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActiveRequests(data as SupportRequest[]);
    } catch (error) {
      console.error('Error fetching active requests:', error);
    }
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!volunteer) return;

    const alertsChannel = supabase
      .channel('volunteer-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'volunteer_alerts',
          filter: `volunteer_id=eq.${volunteer.id}`,
        },
        (payload) => {
          toast.info('🚨 New support request nearby!', {
            description: 'Someone needs help in your area',
            duration: 10000,
          });
          fetchAlerts();
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('support-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_requests',
        },
        () => {
          fetchActiveRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [volunteer, fetchAlerts, fetchActiveRequests]);

  useEffect(() => {
    fetchVolunteerProfile();
  }, [fetchVolunteerProfile]);

  useEffect(() => {
    if (volunteer) {
      fetchAlerts();
      fetchActiveRequests();
    }
  }, [volunteer, fetchAlerts, fetchActiveRequests]);

  return {
    volunteer,
    isVolunteer,
    loading,
    alerts,
    activeRequests,
    registerAsVolunteer,
    updateVolunteerLocation,
    toggleAvailability,
    respondToAlert,
    refreshData: () => {
      fetchAlerts();
      fetchActiveRequests();
    },
  };
};
