/**
 * IncidentMap Component
 * ======================
 * Interactive map showing incident reports and safety hotspots.
 * 
 * Features:
 * - Visual representation of incident locations
 * - Hotspot highlighting for dangerous areas
 * - Report new incidents
 * - AI-powered area analysis
 * - Filter by incident type
 * 
 * Developer Notes:
 * - Uses CSS-based map visualization (no external map library required)
 * - Incidents are represented as colored dots
 * - Hotspots are calculated using density clustering
 */

import { useState, useMemo } from 'react';
import {
  Map,
  AlertTriangle,
  Plus,
  Filter,
  Info,
  RefreshCw,
  Navigation,
  XCircle,
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
  DialogTrigger,
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
import {
  useIncidentMap,
  INCIDENT_TYPES,
  IncidentType,
  Severity,
} from '@/hooks/useIncidentMap';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
}

interface IncidentMapProps {
  location: Location | null;
}

/**
 * Convert lat/lng to relative position on the map (percentage)
 */
const coordToPosition = (
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number
): { x: number; y: number } => {
  const scale = zoom * 10;
  const x = 50 + (lng - centerLng) * scale;
  const y = 50 - (lat - centerLat) * scale;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
};

const IncidentMap = ({ location }: IncidentMapProps) => {
  const { user } = useAuth();
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

  // Report form state
  const [reportType, setReportType] = useState<IncidentType>('suspicious');
  const [reportSeverity, setReportSeverity] = useState<Severity>('medium');
  const [reportDescription, setReportDescription] = useState('');

  // Map center (user location or default)
  const mapCenter = useMemo(() => ({
    lat: location?.latitude || 0,
    lng: location?.longitude || 0,
  }), [location]);

  const zoom = 5; // Zoom level

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (selectedType === 'all') return incidents;
    return incidents.filter((inc) => inc.incident_type === selectedType);
  }, [incidents, selectedType]);

  // Handle report submission
  const handleReport = async () => {
    if (!location) {
      toast.error('Location required', {
        description: 'Please enable location to report incidents',
      });
      return;
    }

    await reportIncident(
      reportType,
      location.latitude,
      location.longitude,
      reportDescription,
      reportSeverity
    );

    setShowReportDialog(false);
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

  // Refresh incidents
  const handleRefresh = () => {
    if (location) {
      fetchNearbyIncidents(location.latitude, location.longitude, 10);
    }
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="w-5 h-5 text-primary" />
            Safety Map
          </CardTitle>
          <div className="flex items-center gap-2">
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

      <CardContent className="space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
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
        </div>

        {/* Map Visualization */}
        <div className="relative w-full h-64 bg-muted/30 rounded-xl border border-border overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-border" />
            ))}
          </div>

          {/* User location marker */}
          {location && (
            <div
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '50%', top: '50%' }}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Navigation className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-40" />
              </div>
            </div>
          )}

          {/* Hotspot circles */}
          {hotspots.map((hotspot) => {
            const pos = coordToPosition(
              hotspot.center.lat,
              hotspot.center.lng,
              mapCenter.lat,
              mapCenter.lng,
              zoom
            );
            return (
              <div
                key={hotspot.id}
                className={cn(
                  'absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-30',
                  hotspot.severity === 'critical' && 'bg-destructive',
                  hotspot.severity === 'high' && 'bg-destructive',
                  hotspot.severity === 'medium' && 'bg-warning',
                  hotspot.severity === 'low' && 'bg-yellow-500'
                )}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${Math.min(hotspot.incidentCount * 10, 60)}px`,
                  height: `${Math.min(hotspot.incidentCount * 10, 60)}px`,
                }}
              />
            );
          })}

          {/* Incident markers */}
          {filteredIncidents.slice(0, 50).map((incident) => {
            const pos = coordToPosition(
              incident.latitude,
              incident.longitude,
              mapCenter.lat,
              mapCenter.lng,
              zoom
            );
            const typeInfo = INCIDENT_TYPES[incident.incident_type];
            return (
              <div
                key={incident.id}
                className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-transform shadow-md"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  backgroundColor: typeInfo?.color || '#6b7280',
                }}
                title={`${typeInfo?.label || incident.incident_type}: ${incident.description || 'No description'}`}
              />
            );
          })}

          {/* No location message */}
          {!location && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
              <p className="text-muted-foreground text-sm">
                Enable location to view nearby incidents
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
            <Badge
              key={key}
              variant="outline"
              className="gap-1 text-xs"
              style={{ borderColor: value.color, color: value.color }}
            >
              {value.icon} {value.label}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Report Incident */}
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2" disabled={!user}>
                <Plus className="w-4 h-4" />
                Report Incident
              </Button>
            </DialogTrigger>
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

                {location && (
                  <p className="text-xs text-muted-foreground">
                    📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
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

          {/* Area Analysis */}
          <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleAnalyzeArea}
                disabled={!location || analysisLoading}
              >
                <Info className="w-4 h-4" />
                {analysisLoading ? 'Analyzing...' : 'Analyze Area'}
              </Button>
            </DialogTrigger>
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
        </div>

        {/* Recent Incidents List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Recent Nearby Incidents</h4>
          {filteredIncidents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No incidents reported in this area
            </p>
          ) : (
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {filteredIncidents.slice(0, 10).map((incident) => {
                  const typeInfo = INCIDENT_TYPES[incident.incident_type];
                  const date = new Date(incident.reported_at);
                  return (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: typeInfo?.color }}
                        />
                        <div>
                          <p className="text-sm font-medium">{typeInfo?.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          incident.severity === 'critical' || incident.severity === 'high'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentMap;
