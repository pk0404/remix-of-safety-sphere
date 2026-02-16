import { useRef, useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
}

interface TrackingTarget {
  id: string;
  label: string;
  location: Location;
  type: 'user' | 'helper' | 'destination';
}

interface LiveTrackingMapProps {
  myLocation: Location | null;
  targets?: TrackingTarget[];
  pathHistory?: Location[];
  title?: string;
  height?: string;
  showDistance?: boolean;
}

const calculateDistance = (a: Location, b: Location): number => {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const LiveTrackingMap = ({ myLocation, targets = [], pathHistory = [], title = 'Live Tracking', height = '350px', showDistance = true }: LiveTrackingMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TrackingTarget | null>(null);

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

  const center = myLocation
    ? { lat: myLocation.latitude, lng: myLocation.longitude }
    : { lat: 0, lng: 0 };

  useEffect(() => {
    if (mapRef.current && myLocation && targets.length > 0 && mapsReady) {
      try {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: myLocation.latitude, lng: myLocation.longitude });
        targets.forEach(t => bounds.extend({ lat: t.location.latitude, lng: t.location.longitude }));
        mapRef.current.fitBounds(bounds, 60);
      } catch {}
    }
  }, [myLocation, targets, mapsReady]);

  if (!myLocation) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="py-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Enable location to see the map</p>
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

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'helper':
        return { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#22c55e', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 };
      case 'destination':
        return { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 8, fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 };
      default:
        return { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#f97316', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 };
    }
  };

  const polylinePath = pathHistory.map(p => ({ lat: p.latitude, lng: p.longitude }));

  return (
    <Card className="border-border shadow-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Navigation className="w-5 h-5 text-primary" />
          {title}
          {showDistance && targets.length > 0 && myLocation && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {calculateDistance(myLocation, targets[0].location).toFixed(1)} km away
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height }}
          center={center}
          zoom={14}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
          }}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {/* My location */}
          <Marker
            position={center}
            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 }}
          />

          {/* Path history */}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              options={{ strokeColor: '#3b82f6', strokeWeight: 3, strokeOpacity: 0.6 }}
            />
          )}

          {/* Targets */}
          {targets.map((target) => (
            <Marker
              key={target.id}
              position={{ lat: target.location.latitude, lng: target.location.longitude }}
              icon={getMarkerIcon(target.type)}
              onClick={() => setSelectedTarget(target)}
            />
          ))}

          {selectedTarget && (
            <InfoWindow
              position={{ lat: selectedTarget.location.latitude, lng: selectedTarget.location.longitude }}
              onCloseClick={() => setSelectedTarget(null)}
            >
              <div className="p-2">
                <p className="font-semibold text-sm">{selectedTarget.label}</p>
                {myLocation && (
                  <p className="text-xs text-gray-500">
                    {calculateDistance(myLocation, selectedTarget.location).toFixed(2)} km away
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
};

export default LiveTrackingMap;
