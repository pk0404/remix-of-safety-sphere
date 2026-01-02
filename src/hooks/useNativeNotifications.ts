import { useCallback, useEffect } from 'react';
import { LocalNotifications, ScheduleOptions, PendingResult, ActionPerformed } from '@capacitor/local-notifications';
import { isNative, isPluginAvailable } from '@/lib/capacitor';

interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  sound?: string;
  actionTypeId?: string;
  extra?: any;
}

interface UseNativeNotificationsReturn {
  requestPermission: () => Promise<boolean>;
  showNotification: (options: NotificationOptions) => Promise<void>;
  scheduleNotification: (options: NotificationOptions, at: Date) => Promise<void>;
  cancelAll: () => Promise<void>;
  getPending: () => Promise<PendingResult | null>;
}

export const useNativeNotifications = (
  onActionPerformed?: (action: ActionPerformed) => void
): UseNativeNotificationsReturn => {
  
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isNative && isPluginAvailable('LocalNotifications') && onActionPerformed) {
      LocalNotifications.addListener('localNotificationActionPerformed', onActionPerformed)
        .then((handle) => {
          cleanup = () => handle.remove();
        });
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [onActionPerformed]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNative && isPluginAvailable('LocalNotifications')) {
      try {
        const permission = await LocalNotifications.requestPermissions();
        return permission.display === 'granted';
      } catch (e) {
        console.error('Notification permission request failed:', e);
        return false;
      }
    }
    
    // Web fallback
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    const id = options.id || Math.floor(Math.random() * 100000);

    if (isNative && isPluginAvailable('LocalNotifications')) {
      const scheduleOptions: ScheduleOptions = {
        notifications: [{
          id,
          title: options.title,
          body: options.body,
          sound: options.sound,
          actionTypeId: options.actionTypeId,
          extra: options.extra
        }]
      };
      await LocalNotifications.schedule(scheduleOptions);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const scheduleNotification = useCallback(async (options: NotificationOptions, at: Date) => {
    const id = options.id || Math.floor(Math.random() * 100000);

    if (isNative && isPluginAvailable('LocalNotifications')) {
      const scheduleOptions: ScheduleOptions = {
        notifications: [{
          id,
          title: options.title,
          body: options.body,
          sound: options.sound,
          schedule: { at },
          actionTypeId: options.actionTypeId,
          extra: options.extra
        }]
      };
      await LocalNotifications.schedule(scheduleOptions);
    }
  }, []);

  const cancelAll = useCallback(async () => {
    if (isNative && isPluginAvailable('LocalNotifications')) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    }
  }, []);

  const getPending = useCallback(async (): Promise<PendingResult | null> => {
    if (isNative && isPluginAvailable('LocalNotifications')) {
      return await LocalNotifications.getPending();
    }
    return null;
  }, []);

  return {
    requestPermission,
    showNotification,
    scheduleNotification,
    cancelAll,
    getPending
  };
};
