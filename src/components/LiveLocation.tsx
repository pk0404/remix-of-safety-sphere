import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  MapPin,
  Navigation,
  Mountain,
  RefreshCw,
  Share2,
  Copy,
  MessageSquare,
  ExternalLink,
  Clock,
  Radio,
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface LiveLocationProps {
  location: Location | null;
  loading: boolean;
  onRefresh: () => void;
  contacts: Contact[];
}

const LiveLocation = ({ location, loading, onRefresh, contacts }: LiveLocationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (location) {
      setLastUpdate(new Date());
    }
  }, [location]);

  const getLocationMessage = () => {
    if (!location) return '';

    const now = new Date();
    return `📍 MY LIVE LOCATION\n\nTime: ${now.toLocaleString()}\n\nCoordinates:\nLatitude: ${location.latitude.toFixed(
      6
    )}\nLongitude: ${location.longitude.toFixed(6)}${
      location.altitude ? `\nAltitude: ${location.altitude.toFixed(1)}m` : ''
    }\n\n🗺️ Google Maps:\nhttps://maps.google.com/?q=${location.latitude},${
      location.longitude
    }\n\n⚠️ Please check on me if I don't respond.\n\n🔴 This is a real-time location from SafeGuard app.`;
  };

  const shareViaSystem = async () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    const message = getLocationMessage();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Live Location',
          text: message,
        });
        toast.success('Location shared!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (!location) return;

    const message = getLocationMessage();
    navigator.clipboard.writeText(message);
    toast.success('Location copied to clipboard');
  };

  const shareToContacts = () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    if (contacts.length === 0) {
      toast.error('No emergency contacts added');
      return;
    }

    setIsSharing(true);
    const message = getLocationMessage();

    contacts.forEach((contact, index) => {
      setTimeout(() => {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
        window.open(smsUrl, '_blank');

        if (index === contacts.length - 1) {
          setIsSharing(false);
          toast.success(`Location sent to ${contacts.length} contacts`);
        }
      }, index * 500);
    });

    setShowShareDialog(false);
  };

  const openInMaps = () => {
    if (!location) return;
    window.open(
      `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
      '_blank'
    );
  };

  return (
    <Card ref={containerRef} className="border-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="w-5 h-5 text-primary" />
              {location && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
              )}
            </div>
            Live Location
          </CardTitle>
          <div className="flex items-center gap-2">
            {location && (
              <Badge variant="outline" className="text-xs gap-1">
                <Radio className="w-3 h-3 text-success animate-pulse" />
                Live
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
        ) : location ? (
          <>
            {/* Coordinates Display */}
            <div className="p-4 bg-muted/50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Latitude</span>
                    <span className="font-mono text-sm text-foreground">
                      {location.latitude.toFixed(6)}°
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary rotate-90 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Longitude</span>
                    <span className="font-mono text-sm text-foreground">
                      {location.longitude.toFixed(6)}°
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-xs text-muted-foreground">Altitude: </span>
                  <span className="font-mono text-sm text-foreground">
                    {location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={openInMaps} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Maps
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={shareViaSystem} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="w-full gradient-warning text-primary-foreground"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send ({contacts.length})
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Location Unavailable</p>
            <p className="text-xs">Please enable location services</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-warning" />
              Share with Emergency Contacts
            </DialogTitle>
            <DialogDescription>
              Send your live location to all your emergency contacts via SMS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {location && (
              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Your Location</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Will be sent to:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="text-sm text-warning">No emergency contacts added</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground">{contact.name}</span>
                      <span className="text-muted-foreground">({contact.phone})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={shareToContacts}
              disabled={isSharing || contacts.length === 0}
              className="gradient-primary text-primary-foreground"
            >
              {isSharing ? 'Sending...' : 'Send Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LiveLocation;
