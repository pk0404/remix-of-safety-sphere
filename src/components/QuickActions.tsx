import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Phone, MessageSquare, MapPin, Volume2, Camera, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface QuickActionsProps {
  location: Location | null;
}

const QuickActions = ({ location }: QuickActionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const shareLocation = async () => {
    if (!location) {
      toast({
        title: "Location Unavailable",
        description: "Unable to share location. Please enable location services.",
        variant: "destructive",
      });
      return;
    }

    const text = `My current location:\nhttps://maps.google.com/?q=${location.latitude},${location.longitude}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
        toast({ title: "Location Shared", description: "Your location has been shared successfully." });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Location Copied", description: "Location link copied to clipboard." });
    }
  };

  const triggerFakeCall = () => {
    toast({
      title: "📞 Incoming Call",
      description: "Fake call triggered. Your phone will ring in 5 seconds.",
    });
    // In a real app, this would trigger a fake incoming call
  };

  const startRecording = () => {
    toast({
      title: "🎙️ Recording Started",
      description: "Audio/video recording has been started.",
    });
    // In a real app, this would start recording
  };

  const triggerAlarm = () => {
    toast({
      title: "🔊 Alarm Triggered",
      description: "Loud alarm sound playing...",
      variant: "destructive",
    });
    // In a real app, this would play a loud alarm
  };

  const openSafetyGuide = () => {
    toast({
      title: "📖 Safety Guide",
      description: "Opening safety guidelines and resources.",
    });
  };

  const actions = [
    { icon: Phone, label: "Fake Call", color: "bg-success/10 text-success", action: triggerFakeCall },
    { icon: MessageSquare, label: "Quick SMS", color: "bg-primary/10 text-primary", action: () => {} },
    { icon: MapPin, label: "Share Location", color: "bg-warning/10 text-warning", action: shareLocation },
    { icon: Volume2, label: "Alarm", color: "bg-destructive/10 text-destructive", action: triggerAlarm },
    { icon: Camera, label: "Record", color: "bg-accent-foreground/10 text-accent-foreground", action: startRecording },
    { icon: FileText, label: "Safety Guide", color: "bg-muted-foreground/10 text-muted-foreground", action: openSafetyGuide },
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div ref={containerRef} className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
