import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award,
  Loader2,
  Settings,
  MessageSquare,
  Star,
} from 'lucide-react';
import { useHelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import SlidingSidebar from '@/components/SlidingSidebar';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

interface HelperNavigationViewProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const HelperNavigationView = ({ onComplete, onCancel }: HelperNavigationViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { location } = useGeolocation();
  const {
    activeSession,
    verifyOTP,
    completeSession,
    cancelSession,
    updateVolunteerLocation,
  } = useHelpSession();

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [nextInstruction, setNextInstruction] = useState<string>('');
  const [distanceRemaining, setDistanceRemaining] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [completing, setCompleting] = useState(false);
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

  // Update helper location periodically
  useEffect(() => {
    if (!activeSession || !location) return;

    const interval = setInterval(() => {
      updateVolunteerLocation(activeSession.id, location.latitude, location.longitude);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession, location, updateVolunteerLocation]);

  // Calculate directions
  useEffect(() => {
    if (!activeSession || !location || !mapsReady) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      const destination = {
        lat: activeSession.requester_lat!,
        lng: activeSession.requester_lng!,
      };

      directionsService.route(
        {
          origin: { lat: location.latitude, lng: location.longitude },
          destination,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setDistanceRemaining(leg.distance?.text || '');
              setEta(leg.duration?.text || '');
              const step = leg.steps[0];
              if (step?.instructions) {
                setNextInstruction(step.instructions.replace(/<[^>]*>/g, ''));
              }
            }
          }
        }
      );
    } catch (error) {
      console.error('Error calculating directions:', error);
    }
  }, [activeSession, location, mapsReady]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleVerifyOTP = async () => {
    if (!activeSession) return;
    setVerifying(true);
    await verifyOTP(activeSession.id, otpInput);
    setVerifying(false);
    setOtpInput('');
  };

  const handleComplete = async () => {
    if (!activeSession) return;
    setCompleting(true);
    await completeSession(activeSession.id, rating, feedback);
    setCompleting(false);
    setShowCompleteDialog(false);
    onComplete?.();
  };

  const handleCancel = async () => {
    if (!activeSession) return;
    await cancelSession(activeSession.id);
    onCancel?.();
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

  const requesterLocation = {
    lat: activeSession.requester_lat!,
    lng: activeSession.requester_lng!,
  };

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  return (
    <>
      <SlidingSidebar />
      <div className="flex flex-col h-full min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <div className="bg-card border-b border-border p-3 flex items-center gap-3 z-10 pt-16">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <XCircle className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{nextInstruction || 'Proceed to destination'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Speed/Distance Indicator */}
        <div className="absolute top-32 left-4 z-10 flex flex-col gap-2">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border">
            <p className="text-2xl font-bold text-foreground">{distanceRemaining || 'Calculating...'}</p>
            <p className="text-xs text-muted-foreground">{eta || 'ETA loading...'}</p>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={16}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Helper's location (You - Blue arrow) */}
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 8,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
                rotation: 0,
              }}
            />

            {/* Requester's location (Destination) */}
            <Marker
              position={requesterLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 3,
              }}
            />

            {/* Route */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#3b82f6',
                    strokeWeight: 6,
                    strokeOpacity: 0.9,
                  },
                }}
              />
            )}
          </GoogleMap>

          {/* Quick Actions (Side buttons) */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Panel */}
        <Card className="rounded-t-2xl rounded-b-none border-t shadow-lg">
          <CardContent className="pt-4 pb-6 space-y-4">
            {/* ETA & Distance */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ETA</p>
                <p className="text-2xl font-bold text-foreground">{eta || '--'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-xl font-semibold">{distanceRemaining || '--'}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                Walking
              </Badge>
            </div>

            {/* OTP Verification Section - Helper must ask User for OTP */}
            {!activeSession.otp_verified ? (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-warning" />
                  <span className="font-medium">Arrived? Ask User for their OTP</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The user has a 4-digit code. Ask them for it and enter below to verify your arrival.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 4-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="text-center text-xl font-mono tracking-widest"
                  />
                  <Button 
                    onClick={handleVerifyOTP} 
                    disabled={otpInput.length !== 4 || verifying}
                    className="px-6"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">OTP Verified - Help in progress</span>
                  </div>
                  <Button onClick={() => setShowCompleteDialog(true)} size="sm">
                    <Award className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            )}

            {/* Time Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Started {activeSession.started_at ? formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true }) : 'recently'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Session Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Help Session</DialogTitle>
            <DialogDescription>
              Great job helping someone in need! You'll earn reward points.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rate the interaction</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      star <= rating 
                        ? 'bg-warning text-warning-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Star className="w-5 h-5" fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Feedback (Optional)</label>
              <Textarea
                placeholder="Any notes about the session..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleComplete} disabled={completing}>
              {completing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Complete & Earn Points
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelperNavigationView;
