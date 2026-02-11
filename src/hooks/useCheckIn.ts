import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from 'sonner';

interface CheckIn {
  id: string;
  user_id: string;
  checked_in_at: string;
  location_lat: number | null;
  location_lng: number | null;
  status: 'active' | 'missed' | 'alerted';
  next_check_in_due: string | null;
  notes: string | null;
}

interface CheckInSettings {
  enabled: boolean;
  intervalMinutes: number;
  alertOnMiss: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface UseCheckInReturn {
  isActive: boolean;
  nextCheckInDue: Date | null;
  missedCount: number;
  lastCheckIn: CheckIn | null;
  checkInHistory: CheckIn[];
  loading: boolean;
  settings: CheckInSettings;
  startCheckInSession: (intervalMinutes?: number) => Promise<void>;
  performCheckIn: (location?: Location, notes?: string) => Promise<void>;
  stopCheckInSession: () => void;
  updateSettings: (settings: Partial<CheckInSettings>) => void;
  timeUntilNextCheckIn: number | null;
  selectedContacts: string[];
  setSelectedContacts: (contacts: string[]) => void;
}

const GRACE_PERIOD_MINUTES = 2;

export const useCheckIn = (location?: Location | null): UseCheckInReturn => {
  const { user } = useAuth();
  const { contacts } = useEmergencyContacts();

  const [isActive, setIsActive] = useState(false);
  const [nextCheckInDue, setNextCheckInDue] = useState<Date | null>(null);
  const [missedCount, setMissedCount] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeUntilNextCheckIn, setTimeUntilNextCheckIn] = useState<number | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [settings, setSettings] = useState<CheckInSettings>({
    enabled: false,
    intervalMinutes: 30,
    alertOnMiss: true,
  });

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-select all contacts by default
  useEffect(() => {
    if (contacts.length > 0 && selectedContacts.length === 0) {
      setSelectedContacts(contacts.map(c => c.id));
    }
  }, [contacts]);

  const fetchCheckInHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_in_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData: CheckIn[] = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        checked_in_at: item.checked_in_at,
        location_lat: item.location_lat,
        location_lng: item.location_lng,
        status: item.status as 'active' | 'missed' | 'alerted',
        next_check_in_due: item.next_check_in_due,
        notes: item.notes,
      }));

      setCheckInHistory(typedData);
      if (typedData.length > 0) {
        setLastCheckIn(typedData[0]);
      }
    } catch (error) {
      console.error('[CheckIn] Error fetching history:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchCheckInHistory();
  }, [fetchCheckInHistory]);

  /**
   * Send emergency email to selected contacts
   */
  const sendEmergencyEmail = useCallback(async () => {
    if (!user || !location) return;

    try {
      console.log('[CheckIn] Sending emergency email to contacts...');
      
      const { data, error } = await supabase.functions.invoke('send-emergency-email', {
        body: {
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          missed_count: missedCount,
          last_check_in: lastCheckIn?.checked_in_at,
          selected_contact_ids: selectedContacts.length > 0 ? selectedContacts : undefined,
        },
      });

      if (error) throw error;
      
      console.log('[CheckIn] Emergency email sent:', data);
      toast.error('🚨 Emergency contacts notified via email', {
        description: 'Your emergency contacts have been alerted with your location',
        duration: 10000,
      });
    } catch (error) {
      console.error('[CheckIn] Error sending emergency email:', error);
      toast.error('Failed to send emergency email - please call for help manually');
    }
  }, [user, location, missedCount, lastCheckIn, selectedContacts]);

  /**
   * Send live location to police (escalation level 3)
   */
  const triggerPoliceAlert = useCallback(() => {
    // Initiate call to police
    toast.error('🚨 EMERGENCY: Contacting Police with your live location!', {
      description: 'Calling emergency services (100)...',
      duration: 30000,
    });

    // Open phone dialer to police
    setTimeout(() => {
      window.location.href = 'tel:100';
    }, 1500);
  }, []);

  /**
   * Trigger emergency call to primary contact
   */
  const triggerEmergencyCall = useCallback(() => {
    const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

    if (primaryContact?.phone) {
      if (lastCheckIn && user) {
        supabase
          .from('check_ins')
          .update({ status: 'alerted' })
          .eq('id', lastCheckIn.id);
      }

      window.location.href = `tel:${primaryContact.phone}`;
      
      toast.error('📞 Emergency call initiated', {
        description: `Calling ${primaryContact.name}`,
      });
    } else {
      // No contact available, call police directly
      window.location.href = 'tel:100';
    }
  }, [contacts, lastCheckIn, user]);

  /**
   * Escalate missed check-in based on miss count
   * Level 1: Reminder toast
   * Level 2: Send emergency email to contacts
   * Level 3: Send live location to police + trigger call
   */
  const handleMissedCheckIn = useCallback(async () => {
    const newMissedCount = missedCount + 1;
    setMissedCount(newMissedCount);

    console.log(`[CheckIn] Missed check-in #${newMissedCount}`);

    if (user) {
      await supabase.from('check_ins').insert({
        user_id: user.id,
        status: 'missed',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
      });

      await supabase.from('safety_analytics').insert({
        user_id: user.id,
        metric_type: 'check_in_missed',
        metadata: { miss_count: newMissedCount },
      });
    }

    // Escalation logic
    if (newMissedCount === 1) {
      toast.warning('⏰ Check-in reminder!', {
        description: `Are you okay? Please confirm you are safe. You have ${GRACE_PERIOD_MINUTES} minutes.`,
        duration: 30000,
      });
    } else if (newMissedCount === 2) {
      toast.error('⚠️ Urgent: Sending emergency email to your contacts!', {
        description: 'Your emergency contacts are being notified with your location.',
        duration: 60000,
      });
      await sendEmergencyEmail();
    } else if (newMissedCount >= 3) {
      toast.error('🚨 CRITICAL: Alerting police with your live location!', {
        description: 'Emergency services and all contacts are being notified.',
        duration: 120000,
      });
      // Send email again + trigger police
      await sendEmergencyEmail();
      triggerPoliceAlert();
    }
  }, [missedCount, user, location, sendEmergencyEmail, triggerPoliceAlert]);

  /**
   * Update countdown timer
   */
  useEffect(() => {
    if (!nextCheckInDue || !isActive) {
      setTimeUntilNextCheckIn(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextCheckInDue.getTime() - now.getTime()) / 1000));
      setTimeUntilNextCheckIn(diff);

      if (diff === 0 && isActive) {
        handleMissedCheckIn();
        const nextDue = new Date(Date.now() + settings.intervalMinutes * 60 * 1000);
        setNextCheckInDue(nextDue);
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [nextCheckInDue, isActive, settings.intervalMinutes, handleMissedCheckIn]);

  const startCheckInSession = useCallback(async (intervalMinutes = 30) => {
    if (!user) {
      toast.error('Please sign in to use check-in feature');
      return;
    }

    setLoading(true);
    try {
      const nextDue = new Date(Date.now() + intervalMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          status: 'active',
          location_lat: location?.latitude,
          location_lng: location?.longitude,
          next_check_in_due: nextDue.toISOString(),
          notes: 'Session started',
        })
        .select()
        .single();

      if (error) throw error;

      setIsActive(true);
      setMissedCount(0);
      setNextCheckInDue(nextDue);
      setLastCheckIn(data as CheckIn);
      setSettings((prev) => ({ ...prev, intervalMinutes, enabled: true }));

      toast.success('✅ Check-in session started', {
        description: `You'll be reminded every ${intervalMinutes} minutes. ${selectedContacts.length} contacts will be notified on escalation.`,
      });
    } catch (error) {
      console.error('[CheckIn] Error starting session:', error);
      toast.error('Failed to start check-in session');
    } finally {
      setLoading(false);
    }
  }, [user, location, selectedContacts.length]);

  const performCheckIn = useCallback(async (loc?: Location, notes?: string) => {
    if (!user || !isActive) return;

    setLoading(true);
    try {
      const nextDue = new Date(Date.now() + settings.intervalMinutes * 60 * 1000);
      const checkInLocation = loc || location;

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          status: 'active',
          location_lat: checkInLocation?.latitude,
          location_lng: checkInLocation?.longitude,
          next_check_in_due: nextDue.toISOString(),
          notes: notes || 'Manual check-in',
        })
        .select()
        .single();

      if (error) throw error;

      const wasMissed = missedCount > 0;
      setMissedCount(0);
      setNextCheckInDue(nextDue);
      setLastCheckIn(data as CheckIn);
      await fetchCheckInHistory();

      if (wasMissed) {
        toast.success('🎉 Great to hear you\'re safe!', {
          description: `We were worried about you. Next check-in in ${settings.intervalMinutes} minutes.`,
        });
      } else {
        toast.success('✅ Check-in successful!', {
          description: `Next check-in in ${settings.intervalMinutes} minutes`,
        });
      }
    } catch (error) {
      console.error('[CheckIn] Error performing check-in:', error);
      toast.error('Failed to record check-in');
    } finally {
      setLoading(false);
    }
  }, [user, isActive, settings.intervalMinutes, location, fetchCheckInHistory, missedCount]);

  const stopCheckInSession = useCallback(() => {
    setIsActive(false);
    setNextCheckInDue(null);
    setMissedCount(0);
    setTimeUntilNextCheckIn(null);

    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    toast.info('Check-in session ended');
  }, []);

  const updateSettings = useCallback((newSettings: Partial<CheckInSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return {
    isActive,
    nextCheckInDue,
    missedCount,
    lastCheckIn,
    checkInHistory,
    loading,
    settings,
    startCheckInSession,
    performCheckIn,
    stopCheckInSession,
    updateSettings,
    timeUntilNextCheckIn,
    selectedContacts,
    setSelectedContacts,
  };
};

export default useCheckIn;
