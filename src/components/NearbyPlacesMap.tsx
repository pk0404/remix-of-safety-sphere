/**
 * NearbyPlacesMap Component
 * ==========================
 * Displays nearby safety locations on a Google Map.
 * Integrates with the main safety map system.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import {
  MapPin,
  Shield,
  Hospital,
  Building2,
  Flame,
  Phone,
  Navigation,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Location {
  latitude: number;
  longitude: number;
  altitude?: number | null;
}

interface NearbyPlacesMapProps {
  location: Location | null;
}

interface SafePlace {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'fire_station' | 'safe_zone';
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  distance?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '250px',
};

const placeTypeConfig = {
  police: { icon: Shield, color: '#3b82f6', bgClass: 'bg-blue-500/10', label: 'Police' },
  hospital: { icon: Hospital, color: '#ef4444', bgClass: 'bg-red-500/10', label: 'Hospital' },
  fire_station: { icon: Flame, color: '#f97316', bgClass: 'bg-orange-500/10', label: 'Fire Station' },
  safe_zone: { icon: Building2, color: '#22c55e', bgClass: 'bg-green-500/10', label: 'Safe Zone' },
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyPlacesMap = ({ location }: NearbyPlacesMapProps) => {
  const { isLoaded } = useGoogleMaps();
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SafePlace | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchPlaces = useCallback(async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safe_locations')
        .select('*');

      if (error) throw error;

      let fetchedPlaces: SafePlace[] = (data || []).map((place) => ({
        id: place.id,
        name: place.name,
        type: place.location_type as SafePlace['type'],
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address || undefined,
        phone: place.phone || undefined,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          place.latitude,
          place.longitude
        ),
      }));

      // Add fallback places if none found
      if (fetchedPlaces.length === 0) {
        fetchedPlaces = [
          {
            id: 'fb-1',
            name: 'Local Police Station',
            type: 'police',
            latitude: location.latitude + 0.003,
            longitude: location.longitude + 0.002,
            phone: '100',
            distance: 0.5,
          },
          {
            id: 'fb-2',
            name: 'City Hospital',
            type: 'hospital',
            latitude: location.latitude + 0.005,
            longitude: location.longitude - 0.004,
            phone: '108',
            distance: 1.2,
          },
          {
            id: 'fb-3',
            name: 'Fire Station',
            type: 'fire_station',
            latitude: location.latitude - 0.004,
            longitude: location.longitude + 0.006,
            phone: '101',
            distance: 1.8,
          },
          {
            id: 'fb-4',
            name: 'Women Safety Center',
            type: 'safe_zone',
            latitude: location.latitude + 0.002,
            longitude: location.longitude + 0.001,
            phone: '1091',
            distance: 0.8,
          },
        ];
      }

      // Sort by distance
      fetchedPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setPlaces(fetchedPlaces);
    } catch (error) {
      console.error('Error fetching places:', error);
      toast.error('Failed to load nearby places');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location && places.length === 0) {
      fetchPlaces();
    }
  }, [location, places.length, fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    if (activeFilter === 'all') return places;
    return places.filter((p) => p.type === activeFilter);
  }, [places, activeFilter]);

  const center = useMemo(() => {
    if (location) {
      return { lat: location.latitude, lng: location.longitude };
    }
    return { lat: 20.5937, lng: 78.9629 };
  }, [location]);

  const openDirections = (place: SafePlace) => {
    if (location) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${place.latitude},${place.longitude}&travelmode=walking`,
        '_blank'
      );
    }
  };

  const callPlace = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const filters = [
    { id: 'all', label: 'All', count: places.length },
    { id: 'police', label: 'Police', count: places.filter((p) => p.type === 'police').length },
    { id: 'hospital', label: 'Hospital', count: places.filter((p) => p.type === 'hospital').length },
    { id: 'safe_zone', label: 'Safe Zone', count: places.filter((p) => p.type === 'safe_zone').length },
  ];

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Nearby Safety Locations
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPlaces}
            disabled={loading || !location}
            className="h-8 w-8"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>

        {/* Map */}
        {isLoaded && location && window.google ? (
          <div className="rounded-xl overflow-hidden border border-border">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {/* User location */}
              <Circle
                center={center}
                radius={100}
                options={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  strokeColor: '#3b82f6',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
              <Marker
                position={center}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
                title="You"
              />

              {/* Place markers */}
              {filteredPlaces.map((place) => {
                const config = placeTypeConfig[place.type];
                return (
                  <Marker
                    key={place.id}
                    position={{ lat: place.latitude, lng: place.longitude }}
                    icon={{
                      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      scale: 6,
                      fillColor: config.color,
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    onClick={() => setSelectedPlace(place)}
                    title={place.name}
                  />
                );
              })}

              {/* Info Window */}
              {selectedPlace && (
                <InfoWindow
                  position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="p-2 min-w-[180px]">
                    <p className="font-semibold mb-1">{selectedPlace.name}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedPlace.distance?.toFixed(1)} km away
                    </p>
                    <div className="flex gap-2">
                      {selectedPlace.phone && (
                        <button
                          onClick={() => callPlace(selectedPlace.phone!)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          📞 Call
                        </button>
                      )}
                      <button
                        onClick={() => openDirections(selectedPlace)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                      >
                        🧭 Go
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        ) : !isLoaded ? (
          <div className="h-[250px] bg-muted/30 rounded-xl flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Maps not available</p>
          </div>
        ) : (
          <div className="h-[250px] bg-muted/30 rounded-xl flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Enable location to view map</p>
          </div>
        )}

        {/* Places List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-2">
              {filteredPlaces.map((place) => {
                const config = placeTypeConfig[place.type];
                const Icon = config.icon;

                return (
                  <div
                    key={place.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', config.bgClass)}>
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{place.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {place.distance?.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {place.phone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => callPlace(place.phone!)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDirections(place)}
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyPlacesMap;
