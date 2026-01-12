import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Navigation, MapPin, Clock, Users, Play, Square, Share2, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
  estimatedTime: number; // minutes
  startTime: Date;
  isActive: boolean;
  checkIns: Date[];
  sharedWith: string[];
}

const JourneyTracker = ({ location, contacts }: JourneyTrackerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkInIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [destination, setDestination] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nextCheckIn, setNextCheckIn] = useState<number>(0);
  const [missedCheckIns, setMissedCheckIns] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  // Timer for elapsed time and check-in countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeJourney.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        // Check-in every 5 minutes
        const checkInInterval = 5 * 60; // 5 minutes in seconds
        const timeSinceLastCheckIn = elapsed % checkInInterval;
        setNextCheckIn(checkInInterval - timeSinceLastCheckIn);
        
        // Check for missed check-ins
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
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const startJourney = async () => {
    if (!location) {
      toast.error('Location required');
      return;
    }
    if (!destination.trim()) {
      toast.error('Please enter destination');
      return;
    }
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    const journey: Journey = {
      id: Date.now().toString(),
      startLocation: location,
      destination: destination.trim(),
      estimatedTime: parseInt(estimatedTime),
      startTime: new Date(),
      isActive: true,
      checkIns: [],
      sharedWith: selectedContacts,
    };

    // Save to database if logged in
    if (user) {
      try {
        await supabase.from('journeys').insert({
          user_id: user.id,
          start_latitude: location.latitude,
          start_longitude: location.longitude,
          destination: journey.destination,
          estimated_arrival: new Date(Date.now() + parseInt(estimatedTime) * 60 * 1000).toISOString(),
          status: 'active',
        });
      } catch (error) {
        console.error('Error saving journey:', error);
      }
    }

    setActiveJourney(journey);
    setShowStartDialog(false);
    notifyContactsJourneyStarted(journey);
    
    toast.success('Journey started', {
      description: `Tracking your journey to ${destination}`
    });
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

    // Notify contacts
    const message = `✅ Safe Check-in\n\n${user?.email || 'User'} has checked in safely on their journey to ${activeJourney.destination}.\n\nTime: ${new Date().toLocaleTimeString()}`;
    
    // In a real app, this would send notifications
    console.log('Check-in notification:', message);
  }, [activeJourney, user]);

  const endJourney = async (arrived: boolean) => {
    if (!activeJourney) return;

    if (user) {
      try {
        await supabase.from('journeys')
          .update({
            status: arrived ? 'completed' : 'cancelled',
            actual_arrival: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('status', 'active');
      } catch (error) {
        console.error('Error updating journey:', error);
      }
    }

    notifyContactsJourneyEnded(arrived);
    setActiveJourney(null);
    setElapsedTime(0);
    setMissedCheckIns(0);
    
    toast.success(arrived ? 'Arrived safely!' : 'Journey ended', {
      description: 'Your contacts have been notified'
    });
  };

  const notifyContactsJourneyStarted = (journey: Journey) => {
    const selectedContactDetails = contacts.filter(c => journey.sharedWith.includes(c.id));
    const locationUrl = `https://maps.google.com/?q=${location?.latitude},${location?.longitude}`;
    
    const message = `🚶 Journey Started\n\n${user?.email || 'User'} has started a journey.\n\nDestination: ${journey.destination}\nEstimated time: ${journey.estimatedTime} minutes\nStarting location: ${locationUrl}\n\n📍 You will receive check-in updates every 5 minutes.`;

    selectedContactDetails.forEach(contact => {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    });
  };

  const notifyContactsJourneyEnded = (arrived: boolean) => {
    if (!activeJourney) return;
    
    const selectedContactDetails = contacts.filter(c => activeJourney.sharedWith.includes(c.id));
    const message = arrived 
      ? `✅ Arrived Safely\n\n${user?.email || 'User'} has arrived at ${activeJourney.destination}.\n\nTotal journey time: ${formatDuration(elapsedTime)}`
      : `⚠️ Journey Ended\n\n${user?.email || 'User'} has ended their journey before arriving.`;

    selectedContactDetails.forEach(contact => {
      console.log(`Notifying ${contact.name}:`, message);
    });
  };

  const notifyContactsOfMissedCheckIn = () => {
    if (!activeJourney || !location) return;
    
    const selectedContactDetails = contacts.filter(c => activeJourney.sharedWith.includes(c.id));
    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    
    const message = `🚨 MISSED CHECK-IN ALERT\n\n${user?.email || 'User'} has missed a safety check-in during their journey to ${activeJourney.destination}.\n\nLast known location: ${locationUrl}\n\nPlease try to contact them immediately.`;

    selectedContactDetails.forEach(contact => {
      console.log(`ALERT to ${contact.name}:`, message);
    });

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
    const message = `📍 Live Location Update\n\n${user?.email || 'User'}'s current location during their journey to ${activeJourney.destination}:\n\n${locationUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Live Location',
        text: message,
        url: locationUrl,
      });
    } else {
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location copied to clipboard');
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Journey Tracker</h2>
      </div>

      {activeJourney ? (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="default" className="bg-green-500">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Active Journey
            </Badge>
            <span className="text-xs text-muted-foreground">
              {activeJourney.checkIns.length} check-ins
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{activeJourney.destination}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-mono font-semibold">{formatDuration(elapsedTime)}</p>
                <p className="text-xs text-muted-foreground">Elapsed</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <Timer className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-mono font-semibold">{formatDuration(nextCheckIn)}</p>
                <p className="text-xs text-muted-foreground">Next Check-in</p>
              </div>
            </div>

            {missedCheckIns > 0 && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  {missedCheckIns} missed check-in(s)
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={checkIn}
                className="flex-1"
                variant="default"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Check In
              </Button>
              <Button
                onClick={shareCurrentLocation}
                variant="outline"
                size="icon"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => endJourney(true)}
                variant="outline"
                className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
              >
                I've Arrived
              </Button>
              <Button
                onClick={() => endJourney(false)}
                variant="outline"
                className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
              >
                <Square className="w-4 h-4 mr-2" />
                End
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Share your journey with trusted contacts. They'll receive real-time updates and alerts if you miss check-ins.
          </p>
          <Button
            onClick={() => setShowStartDialog(true)}
            className="w-full"
            disabled={!location}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Journey Tracking
          </Button>
        </Card>
      )}

      {/* Start Journey Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Journey Tracking</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Destination</label>
              <Input
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
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
                Share with contacts
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
              <p>📍 Your starting location will be shared</p>
              <p>⏰ Check-in reminders every 5 minutes</p>
              <p>🚨 Missed check-ins will alert your contacts</p>
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
