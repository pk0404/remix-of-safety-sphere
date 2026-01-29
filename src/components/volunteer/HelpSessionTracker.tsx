import { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  Star,
  Shield,
  Loader2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHelpSession, HelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';

interface HelpSessionTrackerProps {
  isVolunteer?: boolean;
}

const HelpSessionTracker = ({ isVolunteer = false }: HelpSessionTrackerProps) => {
  const { location } = useGeolocation();
  const {
    activeSession,
    loading,
    verifyOTP,
    completeSession,
    cancelSession,
    updateVolunteerLocation,
  } = useHelpSession();

  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [completing, setCompleting] = useState(false);

  // Update volunteer location periodically
  useEffect(() => {
    if (isVolunteer && activeSession && location) {
      const interval = setInterval(() => {
        updateVolunteerLocation(activeSession.id, location.latitude, location.longitude);
      }, 10000); // Every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isVolunteer, activeSession, location, updateVolunteerLocation]);

  if (!activeSession) {
    return null;
  }

  const handleVerifyOTP = async () => {
    setVerifying(true);
    await verifyOTP(activeSession.id, otpInput);
    setVerifying(false);
    setOtpInput('');
  };

  const handleComplete = async () => {
    setCompleting(true);
    await completeSession(activeSession.id, rating, feedback);
    setCompleting(false);
    setShowCompleteDialog(false);
  };

  const handleCancel = async () => {
    await cancelSession(activeSession.id);
  };

  const getStatusBadge = () => {
    switch (activeSession.status) {
      case 'accepted':
        return <Badge variant="secondary">Volunteer on the way</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-500">Help in progress</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{activeSession.status}</Badge>;
    }
  };

  const openDirections = () => {
    if (location && activeSession) {
      const destLat = isVolunteer ? activeSession.requester_lat : activeSession.volunteer_lat;
      const destLng = isVolunteer ? activeSession.requester_lng : activeSession.volunteer_lng;
      if (destLat && destLng) {
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${destLat},${destLng}&travelmode=walking`,
          '_blank'
        );
      }
    }
  };

  return (
    <>
      <Card className="border-primary/50 shadow-lg bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              {isVolunteer ? 'Active Help Session' : 'Help is on the way!'}
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Timeline */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeSession.status === 'accepted' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 h-1 bg-muted rounded">
              <div
                className={`h-full rounded transition-all ${
                  activeSession.otp_verified ? 'bg-green-500 w-full' : 'bg-yellow-500 w-1/2'
                }`}
              />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeSession.otp_verified ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {activeSession.otp_verified ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className="flex-1 h-1 bg-muted rounded">
              <div
                className={`h-full rounded transition-all ${
                  activeSession.status === 'completed' ? 'bg-green-500 w-full' : 'w-0'
                }`}
              />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeSession.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Started {formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true })}</span>
            </div>
            {activeSession.distance_km && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Distance: {activeSession.distance_km.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* OTP Section for Requester */}
          {!isVolunteer && !activeSession.otp_verified && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="font-medium text-yellow-700 mb-2">Your OTP Code</p>
              <div className="text-3xl font-mono font-bold tracking-widest text-center py-2">
                {activeSession.otp_code}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Share this code with the volunteer to verify their arrival
              </p>
            </div>
          )}

          {/* OTP Input for Volunteer */}
          {isVolunteer && !activeSession.otp_verified && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Enter OTP from requester to verify arrival</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 4-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={4}
                  className="text-center text-lg font-mono"
                />
                <Button onClick={handleVerifyOTP} disabled={otpInput.length !== 4 || verifying}>
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={openDirections}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>

            {activeSession.otp_verified && (
              <Button
                className="flex-1"
                onClick={() => setShowCompleteDialog(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <XCircle className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complete Session Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Help Session</DialogTitle>
            <DialogDescription>
              {isVolunteer 
                ? 'Great job helping someone in need!' 
                : 'Please rate your experience'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      star <= rating 
                        ? 'bg-yellow-500 text-white' 
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
                placeholder="Any comments about the experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleComplete}
              disabled={completing}
            >
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

export default HelpSessionTracker;
