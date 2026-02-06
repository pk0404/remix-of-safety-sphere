import { useState, useEffect } from 'react';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  User,
  Loader2,
  Star,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useVolunteers, VolunteerAlert } from '@/hooks/useVolunteers';
import { useHelpSession } from '@/hooks/useHelpSession';
import useGeolocation from '@/hooks/useGeolocation';
import GoogleMapsProvider from '@/components/GoogleMapsProvider';
import SlidingSidebar from '@/components/SlidingSidebar';
import OfflineIndicator from '@/components/OfflineIndicator';
import VolunteerRegistration from '@/components/volunteer/VolunteerRegistration';
import VolunteerRewards from '@/components/volunteer/VolunteerRewards';
import HelperMapView from '@/components/volunteer/HelperMapView';
import HelperNavigationView from '@/components/volunteer/HelperNavigationView';
import { formatDistanceToNow } from 'date-fns';

const HelperDashboard = () => {
  const { location } = useGeolocation();
  const {
    volunteer,
    isVolunteer,
    loading,
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

  // Update location periodically when available
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

  const handleAcceptRequest = async (alert: VolunteerAlert) => {
    const request = alert.support_request;
    if (!request || !volunteer) return;

    setAcceptingAlert(alert.id);
    await respondToAlert(alert.id, 'accepted');
    await createSession(
      request.id,
      volunteer.id,
      request.requester_id,
      location?.latitude,
      location?.longitude,
      request.latitude,
      request.longitude
    );
    setAcceptingAlert(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-warning text-warning-foreground';
      default: return 'bg-success text-success-foreground';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show registration if not a volunteer
  if (!isVolunteer) {
    return (
      <div className="min-h-screen bg-background">
        <SlidingSidebar />
        <div className="max-w-lg mx-auto px-4 py-8 pt-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Become a Community Helper</h1>
            <p className="text-muted-foreground">
              Register to receive alerts and help people in your community
            </p>
          </div>
          <VolunteerRegistration />
        </div>
      </div>
    );
  }

  // Show full-screen navigation view when there's an active session
  if (activeSession) {
    return (
      <GoogleMapsProvider>
        <HelperNavigationView />
        <OfflineIndicator />
      </GoogleMapsProvider>
    );
  }

  const pendingAlerts = alerts.filter(a => a.status === 'sent');

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-background">
        <SlidingSidebar />
        
        <div className="max-w-4xl mx-auto px-4 py-4 pt-16">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Helper Dashboard</h1>
            <p className="text-muted-foreground text-sm">Respond to help requests in your area</p>
          </div>

          {/* Status Header */}
          <Card className="mb-4 border-border shadow-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{volunteer?.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {volunteer?.is_available ? '🟢 Online' : '🔴 Offline'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={volunteer?.is_available}
                  onCheckedChange={toggleAvailability}
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{volunteer?.total_responses || 0}</p>
                  <p className="text-xs text-muted-foreground">Helped</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-warning" />
                    {volunteer?.rating || 5.0}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{volunteer?.reward_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{pendingAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocationUpdate}
                  disabled={updatingLocation || !location}
                  className="flex-1"
                >
                  {updatingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-1" />
                  )}
                  Update Location
                </Button>
                <Button variant="outline" size="sm" onClick={refreshData} className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map View with Nearby Requests */}
          <section id="map" className="mb-4">
            <HelperMapView 
              location={location}
              activeRequests={activeRequests}
              onNavigate={openDirections}
            />
          </section>

          {/* Pending Alerts */}
          <section id="requests">
            {pendingAlerts.length > 0 && (
              <Card className="mb-4 border-destructive/50 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Bell className="w-5 h-5 animate-pulse" />
                    Help Requests ({pendingAlerts.length})
                  </CardTitle>
                  <CardDescription>
                    People nearby need assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingAlerts.map((alert) => {
                      const request = alert.support_request;
                      if (!request) return null;

                      return (
                        <div
                          key={alert.id}
                          className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={getUrgencyColor(request.urgency)}>
                                  {request.urgency.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{request.request_type}</Badge>
                                {alert.distance_km && (
                                  <Badge variant="secondary">{alert.distance_km} km</Badge>
                                )}
                              </div>
                              {request.description && (
                                <p className="text-sm mb-2">{request.description}</p>
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

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={acceptingAlert === alert.id}
                              onClick={() => handleAcceptRequest(alert)}
                            >
                              {acceptingAlert === alert.id ? (
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
                              onClick={() => openDirections(request.latitude, request.longitude)}
                            >
                              <Navigation className="w-4 h-4" />
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
          </section>

          {/* No Active Requests Message */}
          {pendingAlerts.length === 0 && (
            <Card className="mb-4">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success opacity-50" />
                <h3 className="font-semibold mb-1">All Clear!</h3>
                <p className="text-sm text-muted-foreground">
                  No pending help requests in your area. Stay online to receive alerts.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Rewards Section */}
          <section id="rewards">
            <VolunteerRewards />
          </section>
        </div>

        <OfflineIndicator />
      </div>
    </GoogleMapsProvider>
  );
};

export default HelperDashboard;
