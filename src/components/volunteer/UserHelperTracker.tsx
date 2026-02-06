import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Shield, MapPin, Clock, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useHelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import SlidingSidebar from '@/components/SlidingSidebar';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

interface UserHelperTrackerProps {
  onCancel?: () => void;
}

const UserHelperTracker = ({ onCancel }: UserHelperTrackerProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { location } = useGeolocation();
  const { activeSession, cancelSession } = useHelpSession();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [mapsReady, setMapsReady] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkMaps = () => {
      if (typeof google !== 'undefined' && google.maps) {
        setMapsReady(true);
      }
    };
    
    checkMaps();
    const interval = setInterval(checkMaps, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time helper location updates
  useEffect(() => {
    if (!activeSession) return;

    // Set initial helper location
    if (activeSession.volunteer_lat && activeSession.volunteer_lng) {
      setHelperLocation({
        lat: activeSession.volunteer_lat,
        lng: activeSession.volunteer_lng,
      });
    }

    // Subscribe to session updates for real-time location
    const channel = supabase
      .channel(`session-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'help_sessions',
          filter: `id=eq.${activeSession.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.volunteer_lat && updated.volunteer_lng) {
            setHelperLocation({
              lat: updated.volunteer_lat,
              lng: updated.volunteer_lng,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession]);

  // Calculate directions when helper location updates
  useEffect(() => {
    if (!helperLocation || !location || !mapsReady) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: helperLocation.lat, lng: helperLocation.lng },
          destination: { lat: location.latitude, lng: location.longitude },
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const duration = result.routes[0]?.legs[0]?.duration?.text;
            setEta(duration || 'Calculating...');
          }
        }
      );
    } catch (error) {
      console.error('Error calculating directions:', error);
    }
  }, [helperLocation, location, mapsReady]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleCancel = async () => {
    if (activeSession) {
      await cancelSession(activeSession.id);
      onCancel?.();
    }
  };

  if (!activeSession || !location) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mapsReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading maps...</p>
      </div>
    );
  }

  const center = { lat: location.latitude, lng: location.longitude };

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <SlidingSidebar />
      
      {/* Map - Takes most of the space */}
      <div className="flex-1 relative min-h-[300px] pt-14">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* User's location (You) */}
          <Marker
            position={center}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3,
            }}
          />

          {/* Helper's location */}
          {helperLocation && (
            <Marker
              position={helperLocation}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 8,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
                rotation: 0,
              }}
            />
          )}

          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#22c55e',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* Safety Centre Badge */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-md border border-border">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Safety Centre</span>
        </div>
      </div>

      {/* Bottom Card - Helper Info (Like Grab/Uber) */}
      <Card className="rounded-t-2xl rounded-b-none border-t shadow-lg">
        <CardContent className="pt-4 pb-6 space-y-4">
          {/* Status & ETA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {activeSession.otp_verified ? 'Helper is with you' : 'Helper is on the way'}
              </p>
              <p className="text-sm text-muted-foreground">
                {activeSession.otp_verified ? 'Assistance in progress' : 'Arriving to help you'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success">{eta}</p>
            </div>
          </div>

          {/* OTP Display - User sees the code to share with Helper */}
          {!activeSession.otp_verified && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Share this OTP with helper when they arrive</p>
              <div className="text-3xl font-mono font-bold tracking-[0.5em] text-center text-warning">
                {activeSession.otp_code}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                The helper will verify this code to confirm their arrival
              </p>
            </div>
          )}

          {activeSession.otp_verified && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Helper verified - Help in progress</span>
            </div>
          )}

          {/* Time Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Started {activeSession.started_at ? formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true }) : 'recently'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(`tel:100`, '_self')}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHelperTracker;
