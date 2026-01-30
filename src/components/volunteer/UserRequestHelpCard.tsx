import { useState, useEffect } from 'react';
import {
  Hand,
  Loader2,
  MapPin,
  AlertTriangle,
  Phone,
  X,
  CheckCircle2,
  Users,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportRequest } from '@/hooks/useSupportRequest';
import { useHelpSession } from '@/hooks/useHelpSession';
import { useAuth } from '@/contexts/AuthContext';
import useGeolocation from '@/hooks/useGeolocation';

const REQUEST_TYPES = [
  { value: 'escort', label: 'Need Escort', icon: Users },
  { value: 'feeling_unsafe', label: 'Feeling Unsafe', icon: AlertTriangle },
  { value: 'stranded', label: 'Stranded/Lost', icon: MapPin },
  { value: 'harassment', label: 'Harassment', icon: Hand },
  { value: 'medical', label: 'Medical Help', icon: Phone },
  { value: 'general', label: 'General Support', icon: CheckCircle2 },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Not urgent', color: 'bg-green-500' },
  { value: 'normal', label: 'Normal - Need help soon', color: 'bg-yellow-500' },
  { value: 'high', label: 'High - Urgent', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical - Emergency', color: 'bg-red-500' },
];

const UserRequestHelpCard = () => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { loading, activeRequest, createSupportRequest, cancelRequest, fetchMyActiveRequest } = useSupportRequest();
  const { activeSession, verifyOTP } = useHelpSession();

  const [showDialog, setShowDialog] = useState(false);
  const [requestType, setRequestType] = useState('general');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const [description, setDescription] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyActiveRequest();
    }
  }, [user, fetchMyActiveRequest]);

  const handleSubmit = async () => {
    if (!location) return;

    const request = await createSupportRequest(
      { latitude: location.latitude, longitude: location.longitude },
      {
        request_type: requestType,
        urgency,
        description: description.trim() || undefined,
      }
    );

    if (request) {
      setShowDialog(false);
      setDescription('');
    }
  };

  const handleCancel = async () => {
    if (activeRequest) {
      await cancelRequest(activeRequest.id);
    }
  };

  const handleVerifyOTP = async () => {
    if (!activeSession || !otpInput.trim()) return;
    
    setVerifying(true);
    const success = await verifyOTP(activeSession.id, otpInput.trim());
    if (success) {
      setOtpInput('');
    }
    setVerifying(false);
  };

  if (!user) {
    return null;
  }

  // Show OTP verification if session is active but not verified
  if (activeSession && !activeSession.otp_verified) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            Volunteer is Coming!
          </CardTitle>
          <CardDescription>
            Verify the volunteer when they arrive by sharing the OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-success/10 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Your OTP Code</p>
            <p className="text-3xl font-mono font-bold text-success tracking-widest">
              {activeSession.otp_code}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Share this with the volunteer when they arrive
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">Volunteer on the way</span>
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show active session in progress
  if (activeSession && activeSession.otp_verified) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Help in Progress</p>
                <p className="text-xs text-muted-foreground">
                  Volunteer is assisting you
                </p>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground">Active</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show active request waiting for volunteer
  if (activeRequest) {
    return (
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Hand className="w-5 h-5 text-warning animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-foreground">Looking for Volunteers</p>
                <p className="text-xs text-muted-foreground">
                  Nearby volunteers are being notified
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-warning" />
          Need Help?
        </CardTitle>
        <CardDescription>
          Request support from verified volunteers nearby
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {REQUEST_TYPES.slice(0, 4).map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => {
                  setRequestType(type.value);
                  setShowDialog(true);
                }}
                disabled={!location}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs text-center">{type.label}</span>
              </Button>
            );
          })}
        </div>

        {!location && (
          <div className="p-3 bg-destructive/10 rounded-lg text-center">
            <MapPin className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-xs text-destructive">Enable location to request support</p>
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Hand className="w-5 h-5 text-warning" />
                Request Support
              </DialogTitle>
              <DialogDescription>
                Nearby volunteers will be notified and can come to help
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type of Help</label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Urgency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant={urgency === level.value ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                      onClick={() => setUrgency(level.value as typeof urgency)}
                    >
                      <div className={`w-2 h-2 rounded-full ${level.color} mr-2`} />
                      {level.label.split(' - ')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Additional Details (Optional)</label>
                <Textarea
                  placeholder="Describe your situation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {location && (
                <div className="p-3 bg-success/10 rounded-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !location}
                className="gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Hand className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserRequestHelpCard;
