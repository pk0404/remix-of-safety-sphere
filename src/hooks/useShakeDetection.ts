import { useEffect, useCallback, useRef } from 'react';

interface UseShakeDetectionProps {
  onShake: () => void;
  threshold?: number;
  timeout?: number;
  enabled?: boolean;
}

export const useShakeDetection = ({
  onShake,
  threshold = 15,
  timeout = 1000,
  enabled = true
}: UseShakeDetectionProps) => {
  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastZ = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!enabled) return;

    const { accelerationIncludingGravity } = event;
    if (!accelerationIncludingGravity) return;

    const { x, y, z } = accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

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

          // Trigger after 3 shakes within timeout
          if (shakeCount.current >= 3) {
            onShake();
            shakeCount.current = 0;
          }
        }
      }
    }

    // Reset shake count if timeout exceeded
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

    if (typeof DeviceMotionEvent !== 'undefined') {
      // Request permission on iOS 13+
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion, enabled]);

  const requestPermission = async () => {
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
