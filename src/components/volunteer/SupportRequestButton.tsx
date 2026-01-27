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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth } from '@/contexts/AuthContext';
import useGeolocation from '@/hooks/useGeolocation';

interface SupportRequestButtonProps {
  variant?: 'compact' | 'full';
}

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

const SupportRequestButton = ({ variant = 'full' }: SupportRequestButtonProps) => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { loading, activeRequest, createSupportRequest, cancelRequest, fetchMyActiveRequest } = useSupportRequest();

  const [showDialog, setShowDialog] = useState(false);
  const [requestType, setRequestType] = useState('general');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const [description, setDescription] = useState('');

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

  if (!user) {
    return null;
  }

  // Show active request status
  if (activeRequest) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Hand className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-foreground">Support Request Active</p>
                <p className="text-xs text-muted-foreground">
                  Volunteers are being notified in your area
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

  if (variant === 'compact') {
    return (
      <>
        <Button
          onClick={() => setShowDialog(true)}
          className="w-full gradient-warning text-primary-foreground"
          disabled={!location}
        >
          <Hand className="w-4 h-4 mr-2" />
          Request Volunteer Support
        </Button>

        <RequestDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          requestType={requestType}
          setRequestType={setRequestType}
          urgency={urgency}
          setUrgency={setUrgency}
          description={description}
          setDescription={setDescription}
          loading={loading}
          location={location}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-warning" />
          Request Volunteer Support
        </CardTitle>
        <CardDescription>
          Get help from verified volunteers in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {REQUEST_TYPES.slice(0, 6).map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={requestType === type.value ? 'default' : 'outline'}
                size="sm"
                className="h-auto py-2 flex-col gap-1"
                onClick={() => {
                  setRequestType(type.value);
                  setShowDialog(true);
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{type.label}</span>
              </Button>
            );
          })}
        </div>

        {!location && (
          <div className="p-3 bg-destructive/10 rounded-lg text-center">
            <MapPin className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-xs text-destructive">
              Enable location to request support
            </p>
          </div>
        )}

        <RequestDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          requestType={requestType}
          setRequestType={setRequestType}
          urgency={urgency}
          setUrgency={setUrgency}
          description={description}
          setDescription={setDescription}
          loading={loading}
          location={location}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestType: string;
  setRequestType: (type: string) => void;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  setUrgency: (urgency: 'low' | 'normal' | 'high' | 'critical') => void;
  description: string;
  setDescription: (desc: string) => void;
  loading: boolean;
  location: { latitude: number; longitude: number } | null;
  onSubmit: () => void;
}

const RequestDialog = ({
  open,
  onOpenChange,
  requestType,
  setRequestType,
  urgency,
  setUrgency,
  description,
  setDescription,
  loading,
  location,
  onSubmit,
}: RequestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <label className="text-sm font-medium mb-2 block">
              Additional Details (Optional)
            </label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
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
  );
};

export default SupportRequestButton;
