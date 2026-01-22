/**
 * Google Maps Provider Component
 * ===============================
 * Provides Google Maps context to the application.
 * Loads the Google Maps JavaScript API with required libraries.
 * Fetches API key from edge function for security.
 */

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { LoadScript, Libraries } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const libraries: Libraries = ['places', 'visualization', 'geometry'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  apiKey: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false, apiKey: null });

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: ReactNode;
}

const LoadingComponent = () => (
  <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading maps...</p>
    </div>
  </div>
);

const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        
        if (error) {
          console.error('Error fetching maps key:', error);
          setError(true);
        } else if (data?.key) {
          setApiKey(data.key);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch maps key:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  if (loading) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, apiKey: null }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  if (error || !apiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, apiKey: null }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={<LoadingComponent />}
    >
      <GoogleMapsContext.Provider value={{ isLoaded: true, apiKey }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

export default GoogleMapsProvider;
