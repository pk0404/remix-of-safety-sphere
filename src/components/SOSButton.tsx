import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Phone, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

interface SOSButtonProps {
  location: Location | null;
  contacts: Contact[];
}

const PREDEFINED_MESSAGES = [
  "🚨 EMERGENCY! I need immediate help! Please call me or contact authorities!",
  "🆘 I'm in danger and need help urgently! Please respond immediately!",
  "⚠️ DISASTER ALERT: I'm in an emergency situation. Please send help!",
  "🚨 SOS: I feel unsafe and need assistance. Please contact emergency services!",
];

const SOSButton = ({ location, contacts }: SOSButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isHolding, setIsHolding] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(PREDEFINED_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Continuous pulse animation for the rings
    const rings = ringsRef.current?.children;
    if (rings) {
      gsap.to(rings, {
        scale: 1.5,
        opacity: 0,
        duration: 2,
        stagger: 0.5,
        repeat: -1,
        ease: "power2.out"
      });
    }
  }, []);

  const startHold = () => {
    setIsHolding(true);
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.2
    });

    holdTimeoutRef.current = setTimeout(() => {
      triggerSOS();
    }, 2000);
  };

  const endHold = () => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.2
    });
  };

  const triggerSOS = () => {
    setIsTriggered(true);
    setCountdown(5);

    gsap.to(buttonRef.current, {
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 3
    });

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setIsTriggered(false);
    setCountdown(5);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  const sendEmergencyAlert = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    const locationText = location 
      ? `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}${location.altitude ? `, Alt: ${location.altitude.toFixed(1)}m` : ''}`
      : 'Location unavailable';

    const mapsLink = location 
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : '';

    const finalMessage = customMessage || selectedMessage;
    const fullMessage = `${finalMessage}\n\n${locationText}\n\nGoogle Maps: ${mapsLink}`;

    // Send SMS to all contacts using tel: and sms: protocols
    contacts.forEach((contact) => {
      // Open SMS with pre-filled message
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(fullMessage)}`;
      window.open(smsUrl, '_blank');
    });

    // Also trigger emergency call to first contact or police
    const emergencyNumber = contacts.length > 0 ? contacts[0].phone : '100';
    
    // Log the alert
    console.log('Emergency Alert Sent:', {
      message: fullMessage,
      contacts: contacts.map(c => c.phone),
      timestamp: new Date().toISOString()
    });

    toast({
      title: "🚨 Emergency Alert Sent!",
      description: `Alert sent to ${contacts.length} contacts. Opening call to ${emergencyNumber}...`,
      variant: "destructive",
    });

    // Trigger call after a short delay
    setTimeout(() => {
      window.location.href = `tel:${emergencyNumber}`;
    }, 1000);

    setIsTriggered(false);
    setCountdown(5);
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Animated rings - centered on button */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
        <div ref={ringsRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-emergency/30" />
          <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-emergency/30" />
          <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-emergency/30" />
        </div>

        {/* Main SOS Button */}
        <button
          ref={buttonRef}
          onMouseDown={!isTriggered ? startHold : undefined}
          onMouseUp={!isTriggered ? endHold : undefined}
          onMouseLeave={!isTriggered ? endHold : undefined}
          onTouchStart={!isTriggered ? startHold : undefined}
          onTouchEnd={!isTriggered ? endHold : undefined}
          className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full gradient-emergency shadow-emergency flex flex-col items-center justify-center transition-all duration-300 ${isTriggered ? 'animate-pulse' : ''} ${isHolding ? 'ring-4 ring-emergency/50' : ''}`}
        >
          {isTriggered ? (
            <>
              <span className="text-4xl sm:text-5xl font-bold text-primary-foreground">{countdown}</span>
              <span className="text-primary-foreground/90 text-xs sm:text-sm mt-1">Sending...</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground mb-1" />
              <span className="text-xl sm:text-2xl font-bold text-primary-foreground">SOS</span>
              <span className="text-primary-foreground/80 text-[10px] sm:text-xs mt-1">Hold 2 seconds</span>
            </>
          )}
        </button>
      </div>

      {/* Cancel button */}
      {isTriggered && (
        <button
          onClick={cancelSOS}
          className="mt-4 px-5 py-2.5 bg-card border border-border rounded-full text-foreground text-sm font-medium hover:bg-muted transition-colors animate-fade-in"
        >
          Cancel Alert
        </button>
      )}

      {/* Message Settings & Quick call */}
      {!isTriggered && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-4 w-full max-w-xs">
          <button
            onClick={() => setShowMessageDialog(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-muted/50 border border-border rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            Configure Message
          </button>
          <a
            href="tel:100"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border rounded-full text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Police
          </a>
        </div>
      )}

      {/* Message Configuration Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Emergency Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Select a predefined message:</p>
              <div className="space-y-2">
                {PREDEFINED_MESSAGES.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setCustomMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      selectedMessage === msg && !customMessage
                        ? 'border-emergency bg-emergency/10 text-foreground'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Or write a custom message:</p>
              <Textarea
                placeholder="Type your custom emergency message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <Button onClick={() => setShowMessageDialog(false)} className="w-full">
              Save Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SOSButton;
