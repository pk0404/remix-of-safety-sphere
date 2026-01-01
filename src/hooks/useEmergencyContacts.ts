import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
}

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          is_primary: contact.is_primary
        })
        .select()
        .single();

      if (error) throw error;
      setContacts(prev => [...prev, data]);
      toast.success('Contact added');
      return data;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
      return null;
    }
  };

  const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success('Contact updated');
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact removed');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to remove contact');
    }
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};
