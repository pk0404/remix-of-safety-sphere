import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MapPin, Navigation, Mountain, RefreshCw } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface LocationDisplayProps {
  location: Location | null;
  loading: boolean;
  onRefresh: () => void;
}

const LocationDisplay = ({ location, loading, onRefresh }: LocationDisplayProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && location) {
      gsap.fromTo(cardRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [location]);

  return (
    <div ref={cardRef} className="w-full p-5 bg-card rounded-2xl border border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Current Location</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`p-2 rounded-full bg-muted hover:bg-accent transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      ) : location ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Navigation className="w-4 h-4 text-primary" />
            <div>
              <span className="text-muted-foreground">Latitude: </span>
              <span className="font-mono text-foreground">{location.latitude.toFixed(6)}°</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Navigation className="w-4 h-4 text-primary rotate-90" />
            <div>
              <span className="text-muted-foreground">Longitude: </span>
              <span className="font-mono text-foreground">{location.longitude.toFixed(6)}°</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mountain className="w-4 h-4 text-primary" />
            <div>
              <span className="text-muted-foreground">Altitude: </span>
              <span className="font-mono text-foreground">
                {location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
              </span>
            </div>
          </div>
          <a
            href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
          >
            <MapPin className="w-3 h-3" />
            View on Google Maps
          </a>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Location unavailable</p>
          <p className="text-xs">Please enable location services</p>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
