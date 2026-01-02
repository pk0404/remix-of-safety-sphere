import { useEffect, useCallback, useRef } from 'react';
import { Motion } from '@capacitor/motion';
import { isNative, isPluginAvailable } from '@/lib/capacitor';

interface UseNativeShakeDetectionProps {
  onShake: () => void;
  threshold?: number;
  timeout?: number;
  enabled?: boolean;
}

export const useNativeShakeDetection = ({
  onShake,
  threshold = 15,
  timeout = 1000,
  enabled = true
}: UseNativeShakeDetectionProps) => {
  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastZ = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);

  const handleAcceleration = useCallback((x: number, y: number, z: number) => {
    if (!enabled) return;

    const currentTime = Date.now();

    if (lastX.current !== null && lastY.current !== null && lastZ.current !== null) {
      const deltaX = Math.abs(x - lastX.current);
      const deltaY = Math.abs(y - lastY.current);
      const deltaZ = Math.abs(z - lastZ.current);

      const acceleration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

      if (acceleration > threshold) {
        if (currentTime - lastShakeTime.current > 500) {
          shakeCount.current++;
          lastShakeTime.current = currentTime;

          if (shakeCount.current >= 3) {
            onShake();
            shakeCount.current = 0;
          }
        }
      }
    }

    if (currentTime - lastTime.current > timeout) {
      shakeCount.current = 0;
    }

    lastX.current = x;
    lastY.current = y;
    lastZ.current = z;
    lastTime.current = currentTime;
  }, [onShake, threshold, timeout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    let listenerHandle: any = null;

    const startListening = async () => {
      if (isNative && isPluginAvailable('Motion')) {
        // Use Capacitor Motion for native
        try {
          listenerHandle = await Motion.addListener('accel', (event) => {
            handleAcceleration(
              event.acceleration.x,
              event.acceleration.y,
              event.acceleration.z
            );
          });
        } catch (e) {
          console.error('Failed to start motion listener:', e);
        }
      } else if (typeof DeviceMotionEvent !== 'undefined') {
        // Web fallback
        const handleMotion = (event: DeviceMotionEvent) => {
          const acc = event.accelerationIncludingGravity;
          if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
            handleAcceleration(acc.x, acc.y, acc.z);
          }
        };

        // Request permission on iOS 13+
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          (DeviceMotionEvent as any).requestPermission()
            .then((permission: string) => {
              if (permission === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('devicemotion', handleMotion);
        }

        return () => {
          window.removeEventListener('devicemotion', handleMotion);
        };
      }
    };

    startListening();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [handleAcceleration, enabled]);

  const requestPermission = async (): Promise<boolean> => {
    if (isNative) {
      return true; // Native doesn't need explicit permission for motion
    }
    
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  };

  return { requestPermission };
};
