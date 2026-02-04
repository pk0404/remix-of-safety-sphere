import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
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
  Phone,
  Award,
  Loader2,
  ArrowLeft,
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

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
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
    if (!activeSession || !location) return;

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
              // Strip HTML tags from instructions
              setNextInstruction(step.instructions.replace(/<[^>]*>/g, ''));
            }
          }
        }
      }
    );
  }, [activeSession, location]);

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
    return null;
  }

  const requesterLocation = {
    lat: activeSession.requester_lat!,
    lng: activeSession.requester_lng!,
  };

  return (
    <>
      <div className="flex flex-col h-full min-h-screen bg-background">
        {/* Top Navigation Bar (like Waze/Google Maps) */}
        <div className="bg-card border-b border-border p-3 flex items-center gap-3 z-10">
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
        <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border">
            <p className="text-2xl font-bold text-foreground">{distanceRemaining}</p>
            <p className="text-xs text-muted-foreground">{eta}</p>
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
                fillColor: 'hsl(217, 91%, 60%)',
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
                fillColor: 'hsl(0, 84%, 60%)',
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
                    strokeColor: 'hsl(217, 91%, 60%)',
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
                <p className="text-2xl font-bold text-foreground">{eta}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-xl font-semibold">{distanceRemaining}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                Walking
              </Badge>
            </div>

            {/* OTP Verification Section */}
            {!activeSession.otp_verified ? (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-warning" />
                  <span className="font-medium">Arrived? Enter OTP to verify</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 4-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
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
              <span>Started {formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true })}</span>
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
