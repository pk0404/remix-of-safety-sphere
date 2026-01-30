import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JourneyLocation {
  id: string;
  journey_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
}

interface Journey {
  id: string;
  user_id: string;
  destination_name: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  start_latitude: number | null;
  start_longitude: number | null;
  expected_arrival: string | null;
  status: string | null;
  created_at: string;
  completed_at: string | null;
}

export const useJourneyTracking = () => {
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<Journey[]>([]);
  const [locationHistory, setLocationHistory] = useState<JourneyLocation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch active journey
  const fetchActiveJourney = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveJourney(data);
      return data;
    } catch (error) {
      console.error('Error fetching active journey:', error);
      return null;
    }
  }, [user]);

  // Fetch journey history
  const fetchJourneyHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setJourneyHistory(data || []);
    } catch (error) {
      console.error('Error fetching journey history:', error);
    }
  }, [user]);

  // Fetch location history for a journey
  const fetchLocationHistory = useCallback(async (journeyId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('journey_locations')
        .select('*')
        .eq('journey_id', journeyId)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      setLocationHistory(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching location history:', error);
      return [];
    }
  }, [user]);

  // Record current location during journey
  const recordLocation = useCallback(async (
    journeyId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('journey_locations')
        .insert({
          journey_id: journeyId,
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording location:', error);
    }
  }, [user]);

  // Start a new journey
  const startJourney = async (
    destination: string,
    destinationLat: number | null,
    destinationLng: number | null,
    startLat: number,
    startLng: number,
    estimatedMinutes: number
  ) => {
    if (!user) return null;

    setLoading(true);
    try {
      const expectedArrival = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('journeys')
        .insert({
          user_id: user.id,
          destination_name: destination,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
          start_latitude: startLat,
          start_longitude: startLng,
          expected_arrival: expectedArrival,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Record starting location
      await recordLocation(data.id, startLat, startLng);
      
      setActiveJourney(data);
      return data;
    } catch (error) {
      console.error('Error starting journey:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // End journey
  const endJourney = async (journeyId: string, arrived: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('journeys')
        .update({
          status: arrived ? 'completed' : 'cancelled',
          completed_at: new Date().toISOString(),
        })
        .eq('id', journeyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setActiveJourney(null);
      await fetchJourneyHistory();
      return true;
    } catch (error) {
      console.error('Error ending journey:', error);
      return false;
    }
  };

  // Set up location tracking interval
  useEffect(() => {
    if (!activeJourney) return;

    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          recordLocation(
            activeJourney.id,
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        (error) => console.error('Location tracking error:', error),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeJourney, recordLocation]);

  useEffect(() => {
    fetchActiveJourney();
    fetchJourneyHistory();
  }, [fetchActiveJourney, fetchJourneyHistory]);

  return {
    activeJourney,
    journeyHistory,
    locationHistory,
    loading,
    startJourney,
    endJourney,
    recordLocation,
    fetchLocationHistory,
    refetch: fetchActiveJourney,
  };
};
