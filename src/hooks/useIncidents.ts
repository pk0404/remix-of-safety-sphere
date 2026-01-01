import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type IncidentType = 'sos' | 'medical' | 'fire' | 'assault' | 'accident' | 'natural_disaster' | 'other';

interface CreateIncidentParams {
  type: IncidentType;
  message?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  address?: string;
}

export const useIncidents = () => {
  const [loading, setLoading] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<string | null>(null);
  const { user } = useAuth();

  const createIncident = useCallback(async (params: CreateIncidentParams) => {
    if (!user) {
      toast.error('Please sign in to create an incident');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          user_id: user.id,
          incident_type: params.type,
          message: params.message,
          latitude: params.latitude,
          longitude: params.longitude,
          altitude: params.altitude,
          address: params.address,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentIncident(data.id);
      return data;
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const resolveIncident = useCallback(async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;
      setCurrentIncident(null);
      toast.success('Incident resolved');
    } catch (error) {
      console.error('Error resolving incident:', error);
      toast.error('Failed to resolve incident');
    }
  }, []);

  const cancelIncident = useCallback(async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'cancelled',
          resolved_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;
      setCurrentIncident(null);
    } catch (error) {
      console.error('Error cancelling incident:', error);
    }
  }, []);

  return {
    loading,
    currentIncident,
    createIncident,
    resolveIncident,
    cancelIncident
  };
};
