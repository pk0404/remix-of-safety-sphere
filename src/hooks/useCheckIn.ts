/**
 * useCheckIn Hook
 * ================
 * Manages the "proof of life" attendance check-in system.
 * 
 * Features:
 * - Periodic check-in reminders
 * - Missed check-in detection
 * - Emergency escalation when check-ins are missed
 * - Integration with emergency contacts
 * 
 * Developer Notes:
 * - Check-in intervals are configurable in user settings
 * - Missed check-ins trigger AI analysis before escalation
 * - Multiple escalation levels: reminder -> warning -> alert -> emergency call
 */

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
  timeUntilNextCheckIn: number | null; // in seconds
}

// Escalation levels for missed check-ins
const ESCALATION_LEVELS = {
  REMINDER: 1,    // First missed - gentle reminder
  WARNING: 2,     // Second missed - urgent warning (grace period)
  ALERT: 3,       // Third missed - alert contacts via email
  EMERGENCY: 4,   // Fourth missed - trigger emergency call
} as const;

// Grace period in minutes after missed check-in
const GRACE_PERIOD_MINUTES = 2;

export const useCheckIn = (location?: Location | null): UseCheckInReturn => {
  const { user } = useAuth();
  const { contacts } = useEmergencyContacts();

  // State
  const [isActive, setIsActive] = useState(false);
  const [nextCheckInDue, setNextCheckInDue] = useState<Date | null>(null);
  const [missedCount, setMissedCount] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeUntilNextCheckIn, setTimeUntilNextCheckIn] = useState<number | null>(null);
  const [settings, setSettings] = useState<CheckInSettings>({
    enabled: false,
    intervalMinutes: 30,
    alertOnMiss: true,
  });

  // Refs for intervals
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch user's check-in history from database
   */
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

      // Type-safe mapping
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
   * Send emergency email to contacts via edge function
   */
  const sendEmergencyEmail = useCallback(async () => {
    if (!user || !location) return;

    try {
      console.log('[CheckIn] Sending emergency email...');
      
      const { data, error } = await supabase.functions.invoke('send-emergency-email', {
        body: {
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          missed_count: missedCount,
          last_check_in: lastCheckIn?.checked_in_at,
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
      toast.error('Failed to send emergency email');
    }
  }, [user, location, missedCount, lastCheckIn]);

  /**
   * Escalate missed check-in based on miss count
   */
  const handleMissedCheckIn = useCallback(async () => {
    const newMissedCount = missedCount + 1;
    setMissedCount(newMissedCount);

    console.log(`[CheckIn] Missed check-in #${newMissedCount}`);

    // Record missed check-in in database
    if (user) {
      await supabase.from('check_ins').insert({
        user_id: user.id,
        status: 'missed',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
      });

      // Record analytics
      await supabase.from('safety_analytics').insert({
        user_id: user.id,
        metric_type: 'check_in_missed',
        metadata: { miss_count: newMissedCount },
      });
    }

    // Escalation logic
    switch (newMissedCount) {
      case ESCALATION_LEVELS.REMINDER:
        toast.warning('⏰ Check-in reminder!', {
          description: `Please confirm you are safe. You have ${GRACE_PERIOD_MINUTES} minutes to check in.`,
          duration: 30000,
        });
        break;

      case ESCALATION_LEVELS.WARNING:
        toast.error('⚠️ Urgent: Check-in overdue!', {
          description: 'Grace period ending soon. Please check in immediately.',
          duration: 60000,
        });
        break;

      case ESCALATION_LEVELS.ALERT:
        toast.error('🚨 Alert: Notifying emergency contacts!', {
          description: 'Sending email with your location to emergency contacts',
          duration: 60000,
        });
        // Send emergency email to contacts
        await sendEmergencyEmail();
        break;

      case ESCALATION_LEVELS.EMERGENCY:
        toast.error('🆘 EMERGENCY: Initiating emergency protocol', {
          description: 'Contacting emergency services and contacts',
          duration: 120000,
        });
        triggerEmergencyCall();
        break;
    }
  }, [missedCount, user, location, sendEmergencyEmail]);

  /**
   * Trigger emergency call to primary contact
   */
  const triggerEmergencyCall = useCallback(() => {
    const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

    if (primaryContact?.phone) {
      // Update check-in status to 'alerted'
      if (lastCheckIn && user) {
        supabase
          .from('check_ins')
          .update({ status: 'alerted' })
          .eq('id', lastCheckIn.id);
      }

      // Initiate phone call
      window.location.href = `tel:${primaryContact.phone}`;
      
      toast.error('📞 Emergency call initiated', {
        description: `Calling ${primaryContact.name}`,
      });
    } else {
      toast.error('No emergency contact available', {
        description: 'Please add an emergency contact',
      });
    }
  }, [contacts, lastCheckIn, user]);

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
        // Set next check-in due
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

  /**
   * Start a check-in session with specified interval
   */
  const startCheckInSession = useCallback(async (intervalMinutes = 30) => {
    if (!user) {
      toast.error('Please sign in to use check-in feature');
      return;
    }

    setLoading(true);
    try {
      const nextDue = new Date(Date.now() + intervalMinutes * 60 * 1000);

      // Create initial check-in record
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
        description: `You'll be reminded every ${intervalMinutes} minutes`,
      });

      console.log('[CheckIn] Session started with interval:', intervalMinutes);
    } catch (error) {
      console.error('[CheckIn] Error starting session:', error);
      toast.error('Failed to start check-in session');
    } finally {
      setLoading(false);
    }
  }, [user, location]);

  /**
   * Perform a check-in (user confirms they are safe)
   */
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

      setMissedCount(0); // Reset missed count on successful check-in
      setNextCheckInDue(nextDue);
      setLastCheckIn(data as CheckIn);
      await fetchCheckInHistory();

      toast.success('✅ Check-in successful!', {
        description: `Next check-in in ${settings.intervalMinutes} minutes`,
      });

      console.log('[CheckIn] Check-in performed successfully');
    } catch (error) {
      console.error('[CheckIn] Error performing check-in:', error);
      toast.error('Failed to record check-in');
    } finally {
      setLoading(false);
    }
  }, [user, isActive, settings.intervalMinutes, location, fetchCheckInHistory]);

  /**
   * Stop the check-in session
   */
  const stopCheckInSession = useCallback(() => {
    setIsActive(false);
    setNextCheckInDue(null);
    setMissedCount(0);
    setTimeUntilNextCheckIn(null);

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    toast.info('Check-in session ended');
    console.log('[CheckIn] Session stopped');
  }, []);

  /**
   * Update check-in settings
   */
  const updateSettings = useCallback((newSettings: Partial<CheckInSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Cleanup on unmount
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
  };
};

export default useCheckIn;
