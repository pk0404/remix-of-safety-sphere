import { useState, useEffect, useCallback } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { isNative, isPluginAvailable } from '@/lib/capacitor';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface UseNativeGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  requestPermission: () => Promise<boolean>;
}

const useNativeGeolocation = (): UseNativeGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNative && isPluginAvailable('Geolocation')) {
      try {
        const permission = await Geolocation.requestPermissions();
        return permission.location === 'granted';
      } catch (e) {
        console.error('Permission request failed:', e);
        return false;
      }
    }
    return true; // Web doesn't need explicit permission request here
  }, []);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isNative && isPluginAvailable('Geolocation')) {
        // Use Capacitor Geolocation for native
        const position: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude
        });
      } else {
        // Fallback to web API
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude
            });
          },
          (err) => {
            setError(err.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Watch position for real-time updates
  useEffect(() => {
    getLocation();

    const startWatching = async () => {
      if (isNative && isPluginAvailable('Geolocation')) {
        try {
          const id = await Geolocation.watchPosition(
            { enableHighAccuracy: true },
            (position, err) => {
              if (err) {
                console.error('Watch position error:', err);
                return;
              }
              if (position) {
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude
                });
              }
            }
          );
          setWatchId(id);
        } catch (e) {
          console.error('Failed to start watching position:', e);
        }
      } else if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude
            });
          },
          (err) => console.error('Watch position error:', err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
        setWatchId(String(id));
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        if (isNative && isPluginAvailable('Geolocation')) {
          Geolocation.clearWatch({ id: watchId });
        } else {
          navigator.geolocation.clearWatch(Number(watchId));
        }
      }
    };
  }, [getLocation]);

  return { location, loading, error, refresh: getLocation, requestPermission };
};

export default useNativeGeolocation;
