import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative, isPluginAvailable } from '@/lib/capacitor';

interface UseNativeHapticsReturn {
  impact: (style?: ImpactStyle) => Promise<void>;
  notification: (type?: NotificationType) => Promise<void>;
  vibrate: (duration?: number) => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}

export const useNativeHaptics = (): UseNativeHapticsReturn => {
  const impact = useCallback(async (style: ImpactStyle = ImpactStyle.Heavy) => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.impact({ style });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(style === ImpactStyle.Heavy ? 100 : style === ImpactStyle.Medium ? 50 : 25);
    }
  }, []);

  const notification = useCallback(async (type: NotificationType = NotificationType.Error) => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.notification({ type });
    } else if ('vibrate' in navigator) {
      // Pattern for notification
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const vibrate = useCallback(async (duration: number = 300) => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.vibrate({ duration });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  const selectionStart = useCallback(async () => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.selectionStart();
    }
  }, []);

  const selectionChanged = useCallback(async () => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.selectionChanged();
    }
  }, []);

  const selectionEnd = useCallback(async () => {
    if (isNative && isPluginAvailable('Haptics')) {
      await Haptics.selectionEnd();
    }
  }, []);

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd
  };
};
