import { useState, useEffect } from 'react';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  Phone,
  User,
  Loader2,
  Power,
  Star,
  TrendingUp,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVolunteers, VolunteerAlert, SupportRequest } from '@/hooks/useVolunteers';
import { useHelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';

const VolunteerDashboard = () => {
  const { location } = useGeolocation();
  const {
    volunteer,
    alerts,
    activeRequests,
    updateVolunteerLocation,
    toggleAvailability,
    respondToAlert,
    refreshData,
  } = useVolunteers();
  
  const { createSession, activeSession } = useHelpSession();

  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [acceptingAlert, setAcceptingAlert] = useState<string | null>(null);

  // Update location periodically
  useEffect(() => {
    if (location && volunteer?.is_available) {
      updateVolunteerLocation(location.latitude, location.longitude);
    }
  }, [location, volunteer?.is_available, updateVolunteerLocation]);

  const handleLocationUpdate = async () => {
    if (!location) return;
    setUpdatingLocation(true);
    await updateVolunteerLocation(location.latitude, location.longitude);
    setUpdatingLocation(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      case 'viewed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const openDirections = (lat: number, lng: number) => {
    if (location) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${lat},${lng}&travelmode=walking`,
        '_blank'
      );
    }
  };

  if (!volunteer) return null;

  const pendingAlerts = alerts.filter(a => a.status === 'sent');
  const respondedAlerts = alerts.filter(a => ['accepted', 'declined'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Volunteer Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {volunteer.is_available ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={volunteer.is_available}
                onCheckedChange={toggleAvailability}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{volunteer.total_responses}</p>
              <p className="text-xs text-muted-foreground">Total Responses</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-success flex items-center justify-center gap-1">
                <Star className="w-5 h-5" />
                {volunteer.rating}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-warning">{volunteer.notification_radius_km}</p>
              <p className="text-xs text-muted-foreground">Radius (km)</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-info">{pendingAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Pending Alerts</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Award className="w-5 h-5" />
                {volunteer.reward_points || 0}
              </p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLocationUpdate}
              disabled={updatingLocation || !location}
            >
              {updatingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-1" />
              )}
              Update Location
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <TrendingUp className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Alerts */}
      {pendingAlerts.length > 0 && (
        <Card className="border-destructive/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Bell className="w-5 h-5 animate-pulse" />
              Active Support Requests ({pendingAlerts.length})
            </CardTitle>
            <CardDescription>
              People nearby need help - respond to their requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAlerts.map((alert) => {
                const request = alert.support_request;
                if (!request) return null;

                return (
                  <div
                    key={alert.id}
                    className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{request.request_type}</Badge>
                          {alert.distance_km && (
                            <Badge variant="secondary">{alert.distance_km} km away</Badge>
                          )}
                        </div>
                        {request.description && (
                          <p className="text-sm text-foreground mb-2">{request.description}</p>
                        )}
                        {request.requester_name && (
                          <p className="text-xs text-muted-foreground">
                            From: {request.requester_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={acceptingAlert === alert.id || !!activeSession}
                        onClick={async () => {
                          setAcceptingAlert(alert.id);
                          // First respond to the alert
                          await respondToAlert(alert.id, 'accepted');
                          // Then create a help session with OTP
                          if (volunteer && request) {
                            await createSession(
                              request.id,
                              volunteer.id,
                              request.requester_id,
                              location?.latitude,
                              location?.longitude,
                              request.latitude,
                              request.longitude
                            );
                          }
                          setAcceptingAlert(null);
                        }}
                      >
                        {acceptingAlert === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Accept & Help
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDirections(request.latitude, request.longitude)}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => respondToAlert(alert.id, 'declined')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Active Requests Nearby */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            All Active Requests ({activeRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active requests at the moment</p>
              <p className="text-xs">Your area is safe!</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activeRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-muted/50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getUrgencyColor(request.urgency)} variant="secondary">
                          {request.urgency}
                        </Badge>
                        <span className="text-sm">{request.request_type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDirections(request.latitude, request.longitude)}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Response History */}
      {respondedAlerts.length > 0 && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Response History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {respondedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-muted/30 rounded-lg flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${getAlertStatusColor(alert.status)}`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        {alert.status === 'accepted' ? 'Helped' : 'Declined'} a {alert.support_request?.request_type} request
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.responded_at && formatDistanceToNow(new Date(alert.responded_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VolunteerDashboard;
