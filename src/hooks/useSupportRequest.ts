import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
}

export const useSupportRequest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const createSupportRequest = async (
    location: Location,
    options: {
      request_type?: string;
      description?: string;
      urgency?: 'low' | 'normal' | 'high' | 'critical';
      requester_name?: string;
      address?: string;
    } = {}
  ) => {
    if (!user) {
      toast.error('Please sign in to request support');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .insert({
          requester_id: user.id,
          requester_name: options.requester_name,
          latitude: location.latitude,
          longitude: location.longitude,
          address: options.address,
          request_type: options.request_type || 'general',
          description: options.description,
          urgency: options.urgency || 'normal',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setActiveRequest(data);
      toast.success('Support request sent!', {
        description: 'Nearby volunteers are being notified',
      });

      // Trigger AI-powered volunteer notification via edge function
      try {
        await supabase.functions.invoke('notify-volunteers', {
          body: { support_request_id: data.id },
        });
      } catch (notifyError) {
        console.log('Volunteer notification will be handled by the system');
      }

      return data;
    } catch (error: any) {
      console.error('Error creating support request:', error);
      toast.error('Failed to send request: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      setActiveRequest(null);
      toast.success('Request cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const resolveRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('support_requests')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      setActiveRequest(null);
      toast.success('Request marked as resolved');
    } catch (error) {
      console.error('Error resolving request:', error);
    }
  };

  const fetchMyActiveRequest = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('requester_id', user.id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setActiveRequest(data);
      return data;
    } catch (error) {
      console.error('Error fetching active request:', error);
      return null;
    }
  };

  return {
    loading,
    activeRequest,
    createSupportRequest,
    cancelRequest,
    resolveRequest,
    fetchMyActiveRequest,
  };
};
