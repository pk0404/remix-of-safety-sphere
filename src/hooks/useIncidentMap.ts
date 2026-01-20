/**
 * useIncidentMap Hook
 * ====================
 * Manages incident report data for the safety map visualization.
 * 
 * Features:
 * - Fetch incident reports in a given area
 * - Report new incidents
 * - Calculate hotspot areas
 * - AI analysis of incident patterns
 * 
 * Developer Notes:
 * - Incidents are public data (anyone can view)
 * - Only authenticated users can report
 * - Hotspots are calculated using density analysis
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Incident types with colors and icons
export const INCIDENT_TYPES = {
  theft: { label: 'Theft', color: '#ef4444', icon: '💰' },
  assault: { label: 'Assault', color: '#dc2626', icon: '⚠️' },
  harassment: { label: 'Harassment', color: '#f97316', icon: '🚨' },
  suspicious: { label: 'Suspicious Activity', color: '#eab308', icon: '👁️' },
  accident: { label: 'Accident', color: '#3b82f6', icon: '🚗' },
  other: { label: 'Other', color: '#6b7280', icon: '📍' },
} as const;

export type IncidentType = keyof typeof INCIDENT_TYPES;
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  incident_type: IncidentType;
  latitude: number;
  longitude: number;
  description: string | null;
  severity: Severity;
  is_verified: boolean;
  reported_at: string;
  user_id: string | null;
}

export interface Hotspot {
  id: string;
  center: { lat: number; lng: number };
  radius: number; // in meters
  incidentCount: number;
  severity: Severity;
  primaryType: IncidentType;
}

interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseIncidentMapReturn {
  incidents: IncidentReport[];
  hotspots: Hotspot[];
  loading: boolean;
  reportIncident: (
    type: IncidentType,
    latitude: number,
    longitude: number,
    description?: string,
    severity?: Severity
  ) => Promise<void>;
  fetchIncidentsInArea: (bounds: BoundingBox) => Promise<void>;
  fetchNearbyIncidents: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
  getAreaAnalysis: (lat: number, lng: number) => Promise<string>;
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
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

/**
 * Calculate hotspots from incident data using density clustering
 */
const calculateHotspots = (incidents: IncidentReport[]): Hotspot[] => {
  if (incidents.length < 3) return [];

  const CLUSTER_RADIUS = 0.5; // 500 meters
  const MIN_INCIDENTS = 2;
  const hotspots: Hotspot[] = [];
  const processed = new Set<string>();

  incidents.forEach((incident) => {
    if (processed.has(incident.id)) return;

    // Find all incidents within cluster radius
    const cluster = incidents.filter((other) => {
      const dist = calculateDistance(
        incident.latitude,
        incident.longitude,
        other.latitude,
        other.longitude
      );
      return dist <= CLUSTER_RADIUS;
    });

    if (cluster.length >= MIN_INCIDENTS) {
      // Mark all as processed
      cluster.forEach((inc) => processed.add(inc.id));

      // Calculate center
      const centerLat = cluster.reduce((sum, inc) => sum + inc.latitude, 0) / cluster.length;
      const centerLng = cluster.reduce((sum, inc) => sum + inc.longitude, 0) / cluster.length;

      // Determine primary incident type
      const typeCounts: Record<string, number> = {};
      cluster.forEach((inc) => {
        typeCounts[inc.incident_type] = (typeCounts[inc.incident_type] || 0) + 1;
      });
      const primaryType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0] as IncidentType;

      // Calculate severity based on incident count and types
      let severity: Severity = 'low';
      if (cluster.length >= 5) severity = 'high';
      else if (cluster.length >= 3) severity = 'medium';
      if (cluster.some((inc) => inc.severity === 'critical')) severity = 'critical';

      hotspots.push({
        id: `hotspot-${centerLat.toFixed(4)}-${centerLng.toFixed(4)}`,
        center: { lat: centerLat, lng: centerLng },
        radius: CLUSTER_RADIUS * 1000, // Convert to meters
        incidentCount: cluster.length,
        severity,
        primaryType,
      });
    }
  });

  return hotspots;
};

export const useIncidentMap = (): UseIncidentMapReturn => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all incidents (for demo, limited to recent 100)
   */
  const fetchAllIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .gte('reported_at', thirtyDaysAgo.toISOString())
        .order('reported_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const typedIncidents: IncidentReport[] = (data || []).map((item) => ({
        id: item.id,
        incident_type: item.incident_type as IncidentType,
        latitude: item.latitude,
        longitude: item.longitude,
        description: item.description,
        severity: item.severity as Severity,
        is_verified: item.is_verified || false,
        reported_at: item.reported_at,
        user_id: item.user_id,
      }));

      setIncidents(typedIncidents);
      setHotspots(calculateHotspots(typedIncidents));

      console.log(`[IncidentMap] Fetched ${typedIncidents.length} incidents`);
    } catch (error) {
      console.error('[IncidentMap] Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllIncidents();
  }, [fetchAllIncidents]);

  /**
   * Fetch incidents within a bounding box
   */
  const fetchIncidentsInArea = useCallback(async (bounds: BoundingBox): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .order('reported_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      const typedIncidents: IncidentReport[] = (data || []).map((item) => ({
        id: item.id,
        incident_type: item.incident_type as IncidentType,
        latitude: item.latitude,
        longitude: item.longitude,
        description: item.description,
        severity: item.severity as Severity,
        is_verified: item.is_verified || false,
        reported_at: item.reported_at,
        user_id: item.user_id,
      }));

      setIncidents(typedIncidents);
      setHotspots(calculateHotspots(typedIncidents));
    } catch (error) {
      console.error('[IncidentMap] Error fetching area incidents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch incidents near a location
   */
  const fetchNearbyIncidents = useCallback(
    async (lat: number, lng: number, radiusKm = 5): Promise<void> => {
      // Calculate approximate bounding box
      const latDelta = radiusKm / 111; // 1 degree ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

      await fetchIncidentsInArea({
        north: lat + latDelta,
        south: lat - latDelta,
        east: lng + lngDelta,
        west: lng - lngDelta,
      });
    },
    [fetchIncidentsInArea]
  );

  /**
   * Report a new incident
   */
  const reportIncident = useCallback(
    async (
      type: IncidentType,
      latitude: number,
      longitude: number,
      description?: string,
      severity: Severity = 'medium'
    ): Promise<void> => {
      if (!user) {
        toast.error('Please sign in to report incidents');
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.from('incident_reports').insert({
          user_id: user.id,
          incident_type: type,
          latitude,
          longitude,
          description: description || null,
          severity,
          is_verified: false,
        });

        if (error) throw error;

        toast.success('Incident reported', {
          description: 'Thank you for helping keep the community safe',
        });

        await fetchAllIncidents(); // Refresh data
        console.log('[IncidentMap] Incident reported successfully');
      } catch (error) {
        console.error('[IncidentMap] Error reporting incident:', error);
        toast.error('Failed to report incident');
      } finally {
        setLoading(false);
      }
    },
    [user, fetchAllIncidents]
  );

  /**
   * Get AI analysis of an area
   */
  const getAreaAnalysis = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        // Find nearby incidents
        const nearbyIncidents = incidents.filter((inc) => {
          const dist = calculateDistance(lat, lng, inc.latitude, inc.longitude);
          return dist <= 2; // 2km radius
        });

        if (nearbyIncidents.length === 0) {
          return 'No recent incidents reported in this area. This appears to be a relatively safe zone.';
        }

        // Generate analysis
        const typeCounts: Record<string, number> = {};
        nearbyIncidents.forEach((inc) => {
          typeCounts[inc.incident_type] = (typeCounts[inc.incident_type] || 0) + 1;
        });

        const mostCommon = Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])[0];

        const recentCount = nearbyIncidents.filter((inc) => {
          const incDate = new Date(inc.reported_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return incDate >= weekAgo;
        }).length;

        let riskLevel = 'Low';
        if (nearbyIncidents.length > 10 || recentCount > 5) riskLevel = 'High';
        else if (nearbyIncidents.length > 5 || recentCount > 2) riskLevel = 'Medium';

        return `Risk Level: ${riskLevel}\n` +
          `Total incidents (last 30 days): ${nearbyIncidents.length}\n` +
          `Recent incidents (last 7 days): ${recentCount}\n` +
          `Most common: ${INCIDENT_TYPES[mostCommon[0] as IncidentType]?.label || mostCommon[0]} (${mostCommon[1]} reports)\n\n` +
          `Recommendation: ${riskLevel === 'High' 
            ? 'Exercise extreme caution. Avoid this area if possible, especially at night.' 
            : riskLevel === 'Medium' 
              ? 'Stay alert and be aware of your surroundings. Travel with others when possible.'
              : 'Generally safe, but always remain vigilant.'}`;
      } catch (error) {
        console.error('[IncidentMap] Error analyzing area:', error);
        return 'Unable to analyze this area at the moment.';
      }
    },
    [incidents]
  );

  return {
    incidents,
    hotspots,
    loading,
    reportIncident,
    fetchIncidentsInArea,
    fetchNearbyIncidents,
    getAreaAnalysis,
  };
};

export default useIncidentMap;
