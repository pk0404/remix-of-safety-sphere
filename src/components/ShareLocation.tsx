import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Share2, MapPin, Copy, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface ShareLocationProps {
  location: Location | null;
  contacts: Contact[];
}

const ShareLocation = ({ location, contacts }: ShareLocationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const getLocationMessage = () => {
    if (!location) return '';
    
    const now = new Date();
    return `📍 MY CURRENT LOCATION\n\nTime: ${now.toLocaleString()}\n\nCoordinates:\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}${location.altitude ? `\nAltitude: ${location.altitude.toFixed(1)}m` : ''}\n\n🗺️ Google Maps:\nhttps://maps.google.com/?q=${location.latitude},${location.longitude}\n\n⚠️ Please check on me if I don't respond.`;
  };

  const shareViaSystem = async () => {
    if (!location) {
      toast({
        title: "Location Unavailable",
        description: "Please enable location services.",
        variant: "destructive",
      });
      return;
    }

    const message = getLocationMessage();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Location',
          text: message,
        });
        toast({
          title: "Location Shared",
          description: "Your location has been shared successfully.",
        });
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
    toast({
      title: "Copied to Clipboard",
      description: "Location details copied. You can paste it anywhere.",
    });
  };

  const shareToContacts = () => {
    if (!location) {
      toast({
        title: "Location Unavailable",
        description: "Please enable location services.",
        variant: "destructive",
      });
      return;
    }

    if (contacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "Please add emergency contacts first.",
        variant: "destructive",
      });
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
          toast({
            title: "📍 Location Sent",
            description: `Location shared with ${contacts.length} contact${contacts.length > 1 ? 's' : ''}.`,
          });
        }
      }, index * 500);
    });

    setShowDialog(false);
  };

  const openInMaps = () => {
    if (!location) return;
    window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank');
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-warning" />
        <h2 className="text-lg font-semibold text-foreground">Share Location</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
        {location ? (
          <>
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
              <MapPin className="w-5 h-5 text-success" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Location Active</p>
                <p className="text-xs text-muted-foreground truncate">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaSystem}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <Button
              onClick={() => setShowDialog(true)}
              className="w-full gradient-warning text-primary-foreground"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send to All Contacts ({contacts.length})
            </Button>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Location unavailable</p>
            <p className="text-xs">Please enable location services</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Location with Contacts</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Your Location</span>
              </div>
              {location && (
                <p className="text-xs text-muted-foreground font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Will be sent to:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-foreground">{contact.name}</span>
                    <span className="text-muted-foreground">({contact.phone})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={shareToContacts}
                disabled={isSharing}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                {isSharing ? 'Sending...' : 'Send Location'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareLocation;
