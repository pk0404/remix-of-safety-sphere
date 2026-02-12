import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Navigation, MapPin, Clock, Users, Play, Square, Share2, CheckCircle2, AlertCircle, Timer, Car, PersonStanding, Bus, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface JourneyTrackerProps {
  location: Location | null;
  contacts: Contact[];
}

interface Journey {
  id: string;
  startLocation: Location;
  destination: string;
  estimatedTime: number;
  startTime: Date;
  isActive: boolean;
  checkIns: Date[];
  sharedWith: string[];
  transportMode: string;
}

const TRANSPORT_MODES = [
  { value: 'walking', label: 'Walking', icon: PersonStanding },
  { value: 'driving', label: 'Driving', icon: Car },
  { value: 'public_transport', label: 'Public Transport', icon: Bus },
  { value: 'cycling', label: 'Cycling', icon: Bike },
];

const JourneyTracker = ({ location, contacts }: JourneyTrackerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [destination, setDestination] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [transportMode, setTransportMode] = useState('walking');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nextCheckIn, setNextCheckIn] = useState<number>(0);
  const [missedCheckIns, setMissedCheckIns] = useState(0);
  const [journeyHistory, setJourneyHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  // Load journey history
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setJourneyHistory(data || []);
    };
    loadHistory();
  }, [user, activeJourney]);

  // Timer for elapsed time and check-in countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeJourney.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        const checkInInterval = 5 * 60;
        const timeSinceLastCheckIn = elapsed % checkInInterval;
        setNextCheckIn(checkInInterval - timeSinceLastCheckIn);
        
        const expectedCheckIns = Math.floor(elapsed / checkInInterval);
        const actualCheckIns = activeJourney.checkIns.length;
        if (expectedCheckIns > actualCheckIns + 1) {
          setMissedCheckIns(expectedCheckIns - actualCheckIns - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  // Auto check-in reminder
  useEffect(() => {
    if (nextCheckIn === 60 && activeJourney) {
      toast.warning('Check-in reminder', {
        description: 'Please check in within 1 minute or contacts will be alerted'
      });
    }
    if (nextCheckIn === 0 && activeJourney && missedCheckIns > 0) {
      notifyContactsOfMissedCheckIn();
    }
  }, [nextCheckIn, activeJourney, missedCheckIns]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const startJourney = async () => {
    if (!location) { toast.error('Location required'); return; }
    if (!destination.trim()) { toast.error('Please enter destination'); return; }
    if (selectedContacts.length === 0) { toast.error('Please select at least one contact'); return; }

    const journey: Journey = {
      id: Date.now().toString(),
      startLocation: location,
      destination: destination.trim(),
      estimatedTime: parseInt(estimatedTime),
      startTime: new Date(),
      isActive: true,
      checkIns: [],
      sharedWith: selectedContacts,
      transportMode,
    };

    if (user) {
      try {
        await supabase.from('journeys').insert({
          user_id: user.id,
          start_latitude: location.latitude,
          start_longitude: location.longitude,
          destination_name: journey.destination,
          expected_arrival: new Date(Date.now() + parseInt(estimatedTime) * 60 * 1000).toISOString(),
          status: 'active',
        });
      } catch (error) {
        console.error('Error saving journey:', error);
      }
    }

    setActiveJourney(journey);
    setShowStartDialog(false);

    // Send email to selected contacts about journey start
    sendJourneyNotification(journey, 'started');
    
    toast.success('Journey started', {
      description: `Tracking your ${transportMode} journey to ${destination}`
    });
  };

  const sendJourneyNotification = async (journey: Journey, type: 'started' | 'arrived' | 'missed_checkin') => {
    if (!user || !location) return;
    
    try {
      await supabase.functions.invoke('send-emergency-email', {
        body: {
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          missed_count: type === 'missed_checkin' ? missedCheckIns : 0,
          selected_contact_ids: selectedContacts.length > 0 ? selectedContacts : undefined,
          journey_notification: true,
          journey_type: type,
          journey_destination: journey.destination,
          transport_mode: journey.transportMode,
          estimated_arrival: new Date(journey.startTime.getTime() + journey.estimatedTime * 60 * 1000).toISOString(),
        },
      });
      console.log(`[Journey] ${type} notification sent`);
    } catch (error) {
      console.error(`[Journey] Error sending ${type} notification:`, error);
    }
  };

  const checkIn = useCallback(() => {
    if (!activeJourney) return;
    
    const updatedJourney = {
      ...activeJourney,
      checkIns: [...activeJourney.checkIns, new Date()],
    };
    setActiveJourney(updatedJourney);
    setMissedCheckIns(0);
    
    toast.success('Checked in safely', {
      description: 'Your contacts have been notified'
    });
  }, [activeJourney]);

  const endJourney = async (arrived: boolean) => {
    if (!activeJourney) return;

    if (user) {
      try {
        await supabase.from('journeys')
          .update({
            status: arrived ? 'completed' : 'cancelled',
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('status', 'active');
      } catch (error) {
        console.error('Error updating journey:', error);
      }
    }

    if (arrived) {
      sendJourneyNotification(activeJourney, 'arrived');
    }

    setActiveJourney(null);
    setElapsedTime(0);
    setMissedCheckIns(0);
    
    toast.success(arrived ? 'Arrived safely!' : 'Journey ended', {
      description: 'Your contacts have been notified'
    });
  };

  const notifyContactsOfMissedCheckIn = () => {
    if (!activeJourney || !location) return;
    sendJourneyNotification(activeJourney, 'missed_checkin');
    toast.error('Check-in missed!', {
      description: 'Your emergency contacts are being alerted'
    });
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const shareCurrentLocation = () => {
    if (!location || !activeJourney) return;
    
    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

    if (navigator.share) {
      navigator.share({
        title: 'My Live Location',
        text: `I'm on my way to ${activeJourney.destination}. Track me here:`,
        url: locationUrl,
      });
    } else {
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location link copied');
    }
  };

  const TransportIcon = TRANSPORT_MODES.find(m => m.value === (activeJourney?.transportMode || transportMode))?.icon || PersonStanding;

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Journey Tracker</h2>
        </div>
        {!activeJourney && journeyHistory.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide' : 'History'}
          </Button>
        )}
      </div>

      {activeJourney ? (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="default" className="bg-green-500">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Active Journey
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TransportIcon className="w-3 h-3" />
              {TRANSPORT_MODES.find(m => m.value === activeJourney.transportMode)?.label}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{activeJourney.destination}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-background rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-mono font-semibold">{formatDuration(elapsedTime)}</p>
                <p className="text-xs text-muted-foreground">Elapsed</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <Timer className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-mono font-semibold">{formatDuration(nextCheckIn)}</p>
                <p className="text-xs text-muted-foreground">Check-in</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-mono font-semibold">{activeJourney.checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </div>
            </div>

            {missedCheckIns > 0 && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  {missedCheckIns} missed check-in(s) - Contacts alerted!
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={checkIn} className="flex-1" variant="default">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                I'm Safe
              </Button>
              <Button onClick={shareCurrentLocation} variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => endJourney(true)} variant="outline" className="flex-1 text-green-600 border-green-600 hover:bg-green-50">
                I've Arrived
              </Button>
              <Button onClick={() => endJourney(false)} variant="outline" className="flex-1 text-destructive border-destructive hover:bg-destructive/10">
                <Square className="w-4 h-4 mr-2" />
                End
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Track your journey with live location sharing. Contacts receive real-time updates and alerts.
          </p>
          <Button onClick={() => setShowStartDialog(true)} className="w-full" disabled={!location}>
            <Play className="w-4 h-4 mr-2" />
            Start Journey Tracking
          </Button>

          {/* Journey History */}
          {showHistory && journeyHistory.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Recent Journeys</p>
              {journeyHistory.map((j) => (
                <div key={j.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{j.destination_name || 'Unknown'}</span>
                    <Badge variant={j.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {j.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Start Journey Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Journey Tracking</DialogTitle>
            <DialogDescription>Your contacts will receive live location updates and alerts if you miss check-ins.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Starting Point</label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <MapPin className="w-4 h-4 inline mr-1 text-primary" />
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Detecting...'}
                <span className="text-xs text-muted-foreground ml-2">(Auto-detected)</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Destination</label>
              <Input
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Mode of Transport</label>
              <Select value={transportMode} onValueChange={setTransportMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_MODES.map(mode => {
                    const Icon = mode.icon;
                    return (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {mode.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Estimated time (minutes)</label>
              <Input
                type="number"
                placeholder="30"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                <Users className="w-4 h-4 inline mr-1" />
                Share with contacts (they'll receive email with your live location)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contacts added</p>
                ) : (
                  contacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => toggleContact(contact.id)}
                      className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${
                        selectedContacts.includes(contact.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-muted-foreground ml-2">({contact.relationship})</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p>📍 Your starting location will be shared via email</p>
              <p>⏰ Check-in reminders every 5 minutes</p>
              <p>🚨 Missed check-ins will email your contacts with live location</p>
              <p>📧 Contacts receive trackable Google Maps link</p>
            </div>

            <Button onClick={startJourney} className="w-full">
              <Navigation className="w-4 h-4 mr-2" />
              Start Tracking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JourneyTracker;
