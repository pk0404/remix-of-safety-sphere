import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    getLocation();

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
        });
      },
      (err) => {
        console.error('Watch position error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [getLocation]);

  return { location, loading, error, refresh: getLocation };
};

export default useGeolocation;
