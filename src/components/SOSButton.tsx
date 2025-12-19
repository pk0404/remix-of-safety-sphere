import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Phone, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const SOSButton = ({ location, contacts }: SOSButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isHolding, setIsHolding] = useState(false);
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

    const message = `🚨 EMERGENCY SOS ALERT 🚨\n\nI need immediate help!\n${locationText}\n\nGoogle Maps: https://maps.google.com/?q=${location?.latitude},${location?.longitude}`;

    // Log the alert (in production, this would send SMS/notifications)
    console.log('Emergency Alert Sent:', {
      message,
      contacts: contacts.map(c => c.phone),
      timestamp: new Date().toISOString()
    });

    toast({
      title: "🚨 Emergency Alert Sent!",
      description: `Alert sent to ${contacts.length} contacts and emergency services.`,
      variant: "destructive",
    });

    setIsTriggered(false);
    setCountdown(5);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Animated rings */}
      <div ref={ringsRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-48 h-48 rounded-full border-2 border-emergency/30" />
        <div className="absolute w-48 h-48 rounded-full border-2 border-emergency/30" />
        <div className="absolute w-48 h-48 rounded-full border-2 border-emergency/30" />
      </div>

      {/* Main SOS Button */}
      <button
        ref={buttonRef}
        onMouseDown={!isTriggered ? startHold : undefined}
        onMouseUp={!isTriggered ? endHold : undefined}
        onMouseLeave={!isTriggered ? endHold : undefined}
        onTouchStart={!isTriggered ? startHold : undefined}
        onTouchEnd={!isTriggered ? endHold : undefined}
        className={`relative w-44 h-44 rounded-full gradient-emergency shadow-emergency flex flex-col items-center justify-center transition-all duration-300 ${isTriggered ? 'animate-pulse' : ''} ${isHolding ? 'ring-4 ring-emergency/50' : ''}`}
      >
        {isTriggered ? (
          <>
            <span className="text-5xl font-bold text-primary-foreground">{countdown}</span>
            <span className="text-primary-foreground/90 text-sm mt-1">Sending...</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 text-primary-foreground mb-1" />
            <span className="text-2xl font-bold text-primary-foreground">SOS</span>
            <span className="text-primary-foreground/80 text-xs mt-1">Hold 2 seconds</span>
          </>
        )}
      </button>

      {/* Cancel button */}
      {isTriggered && (
        <button
          onClick={cancelSOS}
          className="mt-6 px-6 py-3 bg-card border border-border rounded-full text-foreground font-medium hover:bg-muted transition-colors animate-fade-in"
        >
          Cancel Alert
        </button>
      )}

      {/* Quick call button */}
      {!isTriggered && (
        <a
          href="tel:100"
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full text-foreground font-medium hover:bg-muted transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Police (100)
        </a>
      )}
    </div>
  );
};

export default SOSButton;
