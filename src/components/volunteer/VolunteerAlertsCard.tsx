import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Navigation,
  Loader2,
  AlertTriangle,
  Phone,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface VolunteerAlert {
  id: string;
  support_request_id: string;
  volunteer_id: string;
  status: string;
  distance_km: number | null;
  sent_at: string;
  support_requests: {
    id: string;
    requester_id: string;
    requester_name: string | null;
    request_type: string;
    urgency: string;
    description: string | null;
    latitude: number;
    longitude: number;
    status: string;
  };
}

interface VolunteerAlertsCardProps {
  volunteerId: string;
}

const VolunteerAlertsCard = ({ volunteerId }: VolunteerAlertsCardProps) => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { activeSession, createSession, verifyOTP, loading: sessionLoading } = useHelpSession();
  
  const [alerts, setAlerts] = useState<VolunteerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<VolunteerAlert | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!volunteerId) return;

    try {
      const { data, error } = await supabase
        .from('volunteer_alerts')
        .select('*, support_requests(*)')
        .eq('volunteer_id', volunteerId)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [volunteerId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time subscription
  useEffect(() => {
    if (!volunteerId) return;

    const channel = supabase
      .channel('volunteer-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteer_alerts',
          filter: `volunteer_id=eq.${volunteerId}`,
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [volunteerId, fetchAlerts]);

  const handleAccept = async (alert: VolunteerAlert) => {
    if (!user || !location) return;

    try {
      // Update alert status
      await supabase
        .from('volunteer_alerts')
        .update({ status: 'accepted', responded_at: new Date().toISOString(), response: 'accepted' })
        .eq('id', alert.id);

      // Create help session
      await createSession(
        alert.support_request_id,
        volunteerId,
        alert.support_requests.requester_id,
        location.latitude,
        location.longitude,
        alert.support_requests.latitude,
        alert.support_requests.longitude
      );

      setSelectedAlert(null);
      fetchAlerts();
    } catch (error) {
      console.error('Error accepting alert:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (alertId: string) => {
    try {
      await supabase
        .from('volunteer_alerts')
        .update({ status: 'declined', responded_at: new Date().toISOString(), response: 'declined' })
        .eq('id', alertId);

      fetchAlerts();
      toast.info('Request declined');
    } catch (error) {
      console.error('Error declining alert:', error);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      escort: 'Need Escort',
      feeling_unsafe: 'Feeling Unsafe',
      stranded: 'Stranded/Lost',
      harassment: 'Harassment',
      medical: 'Medical Help',
      general: 'General Support',
    };
    return labels[type] || type;
  };

  const pendingAlerts = alerts.filter(
    a => a.status === 'sent' && a.support_requests.status === 'active'
  );

  // Show OTP verification if session is active but not verified
  if (activeSession && !activeSession.otp_verified) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Navigation className="w-5 h-5" />
            Navigate to Requester
          </CardTitle>
          <CardDescription>
            Head to the requester's location and verify with OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {activeSession.requester_lat?.toFixed(4)}, {activeSession.requester_lng?.toFixed(4)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                window.open(
                  `https://maps.google.com/maps?daddr=${activeSession.requester_lat},${activeSession.requester_lng}`,
                  '_blank'
                );
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enter OTP from Requester</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 4-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={4}
                className="font-mono text-center text-lg"
              />
              <Button onClick={handleVerifyOTP} disabled={verifying || otpInput.length !== 4}>
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show active session in progress
  if (activeSession && activeSession.otp_verified) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Helping in Progress</p>
                <p className="text-xs text-muted-foreground">
                  OTP verified - provide assistance
                </p>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground">Active</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Help Requests
          {pendingAlerts.length > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {pendingAlerts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Respond to nearby support requests</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : pendingAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending requests</p>
            <p className="text-xs">You'll be notified when someone nearby needs help</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(alert.support_requests.urgency)}>
                      {alert.support_requests.urgency.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.sent_at), { addSuffix: true })}
                    </span>
                  </div>
                  {alert.distance_km !== null && (
                    <span className="text-xs text-muted-foreground">
                      {alert.distance_km.toFixed(1)} km away
                    </span>
                  )}
                </div>

                <p className="font-medium text-sm mb-1">
                  {getRequestTypeLabel(alert.support_requests.request_type)}
                </p>

                {alert.support_requests.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {alert.support_requests.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAccept(alert)}
                    disabled={sessionLoading}
                  >
                    {sessionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolunteerAlertsCard;
