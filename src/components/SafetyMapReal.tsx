/**
 * SafetyMapReal Component
 * ========================
 * Real-time Google Maps-based safety map with:
 * - Heat map visualization of incident hotspots
 * - Real incident markers with clustering
 * - Nearby safety locations (police, hospitals)
 * - Click-to-report incident functionality
 * - AI-powered area analysis
 * - Real-time updates
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  HeatmapLayer,
  Circle,
} from '@react-google-maps/api';
import {
  Map,
  AlertTriangle,
  Plus,
  Filter,
  Info,
  RefreshCw,
  Navigation,
  Shield,
  Hospital,
  Building2,
  Flame,
  X,
  MapPin,
  Target,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  useIncidentMap,
  INCIDENT_TYPES,
  IncidentType,
  Severity,
  IncidentReport,
} from '@/hooks/useIncidentMap';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  latitude: number;
  longitude: number;
  altitude?: number | null;
}

interface SafetyMapRealProps {
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
  distance?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const placeTypeConfig = {
  police: { icon: Shield, color: '#3b82f6', label: 'Police Station' },
  hospital: { icon: Hospital, color: '#ef4444', label: 'Hospital' },
  fire_station: { icon: Flame, color: '#f97316', label: 'Fire Station' },
  safe_zone: { icon: Building2, color: '#22c55e', label: 'Safe Zone' },
};

const SafetyMapReal = ({ location }: SafetyMapRealProps) => {
  const { user } = useAuth();
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const {
    incidents,
    hotspots,
    loading,
    reportIncident,
    fetchNearbyIncidents,
    getAreaAnalysis,
  } = useIncidentMap();

  // State
  const [selectedType, setSelectedType] = useState<IncidentType | 'all'>('all');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [areaAnalysis, setAreaAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [selectedSafePlace, setSelectedSafePlace] = useState<SafePlace | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [safePlacesLoading, setSafePlacesLoading] = useState(false);

  // Layer visibility
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSafePlaces, setShowSafePlaces] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // Report form state
  const [reportType, setReportType] = useState<IncidentType>('suspicious');
  const [reportSeverity, setReportSeverity] = useState<Severity>('medium');
  const [reportDescription, setReportDescription] = useState('');

  // Map center
  const center = useMemo(() => {
    if (location) {
      return { lat: location.latitude, lng: location.longitude };
    }
    return defaultCenter;
  }, [location]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (selectedType === 'all') return incidents;
    return incidents.filter((inc) => inc.incident_type === selectedType);
  }, [incidents, selectedType]);

  // Generate heat map data
  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    return filteredIncidents.map((incident) => ({
      location: new google.maps.LatLng(incident.latitude, incident.longitude),
      weight: incident.severity === 'critical' ? 10 : 
              incident.severity === 'high' ? 7 : 
              incident.severity === 'medium' ? 4 : 2,
    }));
  }, [filteredIncidents, isLoaded]);

  // Fetch nearby safety locations
  const fetchSafePlaces = useCallback(async () => {
    if (!location) return;
    
    setSafePlacesLoading(true);
    try {
      // Fetch from safe_locations table
      const { data: dbPlaces, error } = await supabase
        .from('safe_locations')
        .select('*');

      if (error) throw error;

      const places: SafePlace[] = (dbPlaces || []).map((place) => ({
        id: place.id,
        name: place.name,
        type: place.location_type as SafePlace['type'],
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address || undefined,
        phone: place.phone || undefined,
      }));

      // Add fallback places if none found
      if (places.length === 0 && location) {
        const fallbackPlaces: SafePlace[] = [
          {
            id: 'fallback-police',
            name: 'Local Police Station',
            type: 'police',
            latitude: location.latitude + 0.003,
            longitude: location.longitude + 0.002,
            phone: '100',
          },
          {
            id: 'fallback-hospital',
            name: 'City Hospital',
            type: 'hospital',
            latitude: location.latitude + 0.005,
            longitude: location.longitude - 0.004,
            phone: '108',
          },
          {
            id: 'fallback-fire',
            name: 'Fire Station',
            type: 'fire_station',
            latitude: location.latitude - 0.004,
            longitude: location.longitude + 0.006,
            phone: '101',
          },
          {
            id: 'fallback-safezone',
            name: 'Women Safety Center',
            type: 'safe_zone',
            latitude: location.latitude + 0.002,
            longitude: location.longitude + 0.001,
            phone: '1091',
          },
        ];
        setSafePlaces(fallbackPlaces);
      } else {
        setSafePlaces(places);
      }
    } catch (error) {
      console.error('Error fetching safe places:', error);
    } finally {
      setSafePlacesLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location && safePlaces.length === 0) {
      fetchSafePlaces();
    }
  }, [location, safePlaces.length, fetchSafePlaces]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle map click for reporting
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && user) {
      setClickedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setShowReportDialog(true);
    }
  }, [user]);

  // Handle report submission
  const handleReport = async () => {
    const reportLat = clickedLocation?.lat || location?.latitude;
    const reportLng = clickedLocation?.lng || location?.longitude;

    if (!reportLat || !reportLng) {
      toast.error('Location required', {
        description: 'Please enable location or click on the map',
      });
      return;
    }

    await reportIncident(
      reportType,
      reportLat,
      reportLng,
      reportDescription,
      reportSeverity
    );

    setShowReportDialog(false);
    setClickedLocation(null);
    setReportDescription('');
  };

  // Handle area analysis
  const handleAnalyzeArea = async () => {
    if (!location) {
      toast.error('Location required');
      return;
    }

    setAnalysisLoading(true);
    const analysis = await getAreaAnalysis(location.latitude, location.longitude);
    setAreaAnalysis(analysis);
    setShowAnalysis(true);
    setAnalysisLoading(false);
  };

  // Refresh all data
  const handleRefresh = () => {
    if (location) {
      fetchNearbyIncidents(location.latitude, location.longitude, 10);
      fetchSafePlaces();
    }
  };

  // Center on user location
  const centerOnUser = () => {
    if (mapRef.current && location) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
      mapRef.current.setZoom(15);
    }
  };

  // Get directions to safe place
  const getDirections = (place: SafePlace) => {
    if (location) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${place.latitude},${place.longitude}&travelmode=walking`,
        '_blank'
      );
    }
  };

  // If Google Maps not loaded
  if (!isLoaded) {
    return (
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="w-5 h-5 text-primary" />
            Safety Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground font-medium">Loading Safety Map...</p>
            <p className="text-muted-foreground text-sm text-center">
              The interactive map with incident hotspots and nearby safety locations will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="w-5 h-5 text-primary" />
            Real-Time Safety Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={centerOnUser}
              disabled={!location}
              className="h-8 w-8"
              title="Center on me"
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        {/* Control Bar */}
        <div className="px-4 pt-2 flex items-center gap-3 flex-wrap">
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as IncidentType | 'all')}
          >
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.icon} {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {filteredIncidents.length} incidents
          </Badge>

          <Badge variant="secondary" className="gap-1">
            {hotspots.length} hotspots
          </Badge>

          <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
            <Shield className="w-3 h-3" />
            {safePlaces.length} safe places
          </Badge>
        </div>

        {/* Layer Controls */}
        <div className="px-4 flex items-center gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} id="heatmap" />
            <Label htmlFor="heatmap" className="cursor-pointer">Heatmap</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showIncidents} onCheckedChange={setShowIncidents} id="incidents" />
            <Label htmlFor="incidents" className="cursor-pointer">Incidents</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showSafePlaces} onCheckedChange={setShowSafePlaces} id="safePlaces" />
            <Label htmlFor="safePlaces" className="cursor-pointer">Safe Places</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showHotspots} onCheckedChange={setShowHotspots} id="hotspots" />
            <Label htmlFor="hotspots" className="cursor-pointer">Hotspots</Label>
          </div>
        </div>

        {/* Google Map */}
        <div className="relative h-[400px] md:h-[500px]">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              styles: darkMapStyles,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Heat Map Layer */}
            {showHeatmap && heatmapData.length > 0 && (
              <HeatmapLayer
                data={heatmapData}
                options={{
                  radius: 40,
                  opacity: 0.7,
                  gradient: [
                    'rgba(0, 255, 0, 0)',
                    'rgba(255, 255, 0, 0.6)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(255, 0, 0, 1)',
                  ],
                }}
              />
            )}

            {/* Hotspot Circles */}
            {showHotspots && hotspots.map((hotspot) => (
              <Circle
                key={hotspot.id}
                center={hotspot.center}
                radius={hotspot.radius}
                options={{
                  fillColor: hotspot.severity === 'critical' ? '#dc2626' :
                             hotspot.severity === 'high' ? '#ef4444' :
                             hotspot.severity === 'medium' ? '#f97316' : '#eab308',
                  fillOpacity: 0.25,
                  strokeColor: hotspot.severity === 'critical' ? '#dc2626' :
                               hotspot.severity === 'high' ? '#ef4444' :
                               hotspot.severity === 'medium' ? '#f97316' : '#eab308',
                  strokeOpacity: 0.6,
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* User Location Marker */}
            {location && (
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
                title="Your Location"
                zIndex={1000}
              />
            )}

            {/* Incident Markers */}
            {showIncidents && filteredIncidents.map((incident) => {
              const typeInfo = INCIDENT_TYPES[incident.incident_type];
              return (
                <Marker
                  key={incident.id}
                  position={{ lat: incident.latitude, lng: incident.longitude }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: typeInfo?.color || '#6b7280',
                    fillOpacity: 0.9,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                  onClick={() => setSelectedIncident(incident)}
                  title={typeInfo?.label}
                />
              );
            })}

            {/* Safe Place Markers */}
            {showSafePlaces && safePlaces.map((place) => {
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
                  onClick={() => setSelectedSafePlace(place)}
                  title={place.name}
                />
              );
            })}

            {/* Clicked location for reporting */}
            {clickedLocation && (
              <Marker
                position={clickedLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#dc2626',
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Incident Info Window */}
            {selectedIncident && (
              <InfoWindow
                position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }}
                onCloseClick={() => setSelectedIncident(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: INCIDENT_TYPES[selectedIncident.incident_type]?.color }}
                    />
                    <span className="font-semibold">
                      {INCIDENT_TYPES[selectedIncident.incident_type]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Severity: <span className="font-medium">{selectedIncident.severity}</span>
                  </p>
                  {selectedIncident.description && (
                    <p className="text-sm text-gray-600 mb-1">{selectedIncident.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(selectedIncident.reported_at).toLocaleDateString()}
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* Safe Place Info Window */}
            {selectedSafePlace && (
              <InfoWindow
                position={{ lat: selectedSafePlace.latitude, lng: selectedSafePlace.longitude }}
                onCloseClick={() => setSelectedSafePlace(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const config = placeTypeConfig[selectedSafePlace.type];
                      const Icon = config.icon;
                      return <Icon className="w-4 h-4" style={{ color: config.color }} />;
                    })()}
                    <span className="font-semibold">{selectedSafePlace.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {placeTypeConfig[selectedSafePlace.type].label}
                  </p>
                  {selectedSafePlace.address && (
                    <p className="text-xs text-gray-500 mb-2">{selectedSafePlace.address}</p>
                  )}
                  <div className="flex gap-2">
                    {selectedSafePlace.phone && (
                      <a
                        href={`tel:${selectedSafePlace.phone}`}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        📞 Call
                      </a>
                    )}
                    <button
                      onClick={() => getDirections(selectedSafePlace)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      🧭 Directions
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Click to Report Hint */}
          {user && (
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-muted-foreground">
              💡 Click on map to report an incident
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="gap-1 text-xs cursor-pointer"
                style={{ borderColor: value.color, color: value.color }}
                onClick={() => setSelectedType(key as IncidentType)}
              >
                {value.icon} {value.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex gap-3 flex-wrap">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              setClickedLocation(null);
              setShowReportDialog(true);
            }}
            disabled={!user}
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleAnalyzeArea}
            disabled={!location || analysisLoading}
          >
            <Info className="w-4 h-4" />
            {analysisLoading ? 'Analyzing...' : 'Analyze Area'}
          </Button>
        </div>

        {/* Report Incident Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report an Incident</DialogTitle>
              <DialogDescription>
                Help keep the community safe by reporting incidents
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Incident Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as IncidentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.icon} {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={reportSeverity}
                  onValueChange={(value) => setReportSeverity(value as Severity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe what happened..."
                  rows={3}
                />
              </div>

              {clickedLocation ? (
                <p className="text-xs text-muted-foreground">
                  📍 Selected: {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                </p>
              ) : location ? (
                <p className="text-xs text-muted-foreground">
                  📍 Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-destructive">
                  ⚠️ No location available
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleReport} disabled={loading}>
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Area Analysis Dialog */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Area Safety Analysis</DialogTitle>
              <DialogDescription>
                AI-powered analysis of your current location
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-64">
              <div className="whitespace-pre-wrap text-sm p-4 bg-muted/30 rounded-lg">
                {areaAnalysis || 'Analyzing...'}
              </div>
            </ScrollArea>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SafetyMapReal;
