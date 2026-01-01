import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  shake_to_sos: boolean;
  countdown_sound: boolean;
  countdown_duration: number;
  voice_activation: boolean;
  trigger_words: string[];
  auto_record_on_sos: boolean;
  silent_mode: boolean;
}

const defaultSettings: UserSettings = {
  shake_to_sos: true,
  countdown_sound: true,
  countdown_duration: 3,
  voice_activation: false,
  trigger_words: ['help me', 'emergency'],
  auto_record_on_sos: true,
  silent_mode: false
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings({
          shake_to_sos: data.shake_to_sos ?? true,
          countdown_sound: data.countdown_sound ?? true,
          countdown_duration: data.countdown_duration ?? 3,
          voice_activation: data.voice_activation ?? false,
          trigger_words: data.trigger_words ?? ['help me', 'emergency'],
          auto_record_on_sos: data.auto_record_on_sos ?? true,
          silent_mode: data.silent_mode ?? false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings
  };
};
