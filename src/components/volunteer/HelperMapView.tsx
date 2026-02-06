import { useRef, useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Navigation, AlertTriangle, Loader2 } from 'lucide-react';
import { SupportRequest } from '@/hooks/useVolunteers';
import { formatDistanceToNow } from 'date-fns';

interface Location {
  latitude: number;
  longitude: number;
}

interface HelperMapViewProps {
  location: Location | null;
  activeRequests: SupportRequest[];
  onNavigate: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const HelperMapView = ({ location, activeRequests, onNavigate }: HelperMapViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
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

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 0, lng: 0 };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'normal': return '#eab308';
      default: return '#22c55e';
    }
  };

  useEffect(() => {
    if (mapRef.current && location && activeRequests.length > 0 && mapsReady) {
      try {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: location.latitude, lng: location.longitude });
        activeRequests.forEach(req => {
          bounds.extend({ lat: req.latitude, lng: req.longitude });
        });
        mapRef.current.fitBounds(bounds, 50);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [location, activeRequests, mapsReady]);

  if (!location) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="py-8 text-center">
          <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Enable location to see nearby requests</p>
        </CardContent>
      </Card>
    );
  }

  if (!mapsReady) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  return (
    <Card className="border-border shadow-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="w-5 h-5 text-primary" />
          Nearby Requests
          {activeRequests.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {activeRequests.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Helper's location */}
          <Marker
            position={center}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3,
            }}
          />

          {/* Request markers */}
          {activeRequests.map((request) => (
            <Marker
              key={request.id}
              position={{ lat: request.latitude, lng: request.longitude }}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 8,
                fillColor: getUrgencyColor(request.urgency),
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
              onClick={() => setSelectedRequest(request)}
            />
          ))}

          {/* Info Window */}
          {selectedRequest && (
            <InfoWindow
              position={{ lat: selectedRequest.latitude, lng: selectedRequest.longitude }}
              onCloseClick={() => setSelectedRequest(null)}
            >
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle 
                    className="w-4 h-4" 
                    style={{ color: getUrgencyColor(selectedRequest.urgency) }}
                  />
                  <span className="font-semibold text-sm">
                    {selectedRequest.request_type}
                  </span>
                </div>
                {selectedRequest.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    {selectedRequest.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  {formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate(selectedRequest.latitude, selectedRequest.longitude)}
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Get Directions
                </Button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
};

export default HelperMapView;
