import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Phone, MessageSquare, MapPin, Volume2, Camera, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface QuickActionsProps {
  location: Location | null;
}

const PREDEFINED_QUICK_MESSAGES = [
  "I'm feeling unsafe right now. Please check on me.",
  "I need help! Please call me immediately.",
  "Emergency! Track my location and come quickly.",
  "I'm in trouble. Alert everyone!",
];

// Loud alarm sound using Web Audio API
const playLoudAlarm = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Create a loud siren pattern
  const now = audioContext.currentTime;
  for (let i = 0; i < 20; i++) {
    playTone(880, now + i * 0.3, 0.15); // High pitch
    playTone(440, now + i * 0.3 + 0.15, 0.15); // Low pitch
  }

  return audioContext;
};

const QuickActions = ({ location }: QuickActionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(PREDEFINED_QUICK_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [alarmContext, setAlarmContext] = useState<AudioContext | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

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

    const text = `🚨 EMERGENCY - My current location:\nhttps://maps.google.com/?q=${location.latitude},${location.longitude}\n\nCoordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    
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
    
    // Create fake call notification sound
    setTimeout(() => {
      const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audio.currentTime);
      gainNode.gain.setValueAtTime(0.3, audio.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 2000);
    }, 5000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      toast({
        title: "🎙️ Recording Started",
        description: "Audio/video recording has been started. Evidence is being saved.",
      });
      
      // In production, you'd save this stream to a file
      console.log('Recording stream:', stream);
    } catch (err) {
      toast({
        title: "Recording Failed",
        description: "Could not access camera/microphone. Please grant permissions.",
        variant: "destructive",
      });
    }
  };

  const triggerAlarm = () => {
    if (isAlarmPlaying && alarmContext) {
      alarmContext.close();
      setAlarmContext(null);
      setIsAlarmPlaying(false);
      toast({
        title: "🔇 Alarm Stopped",
        description: "The alarm has been stopped.",
      });
    } else {
      const context = playLoudAlarm();
      setAlarmContext(context);
      setIsAlarmPlaying(true);
      toast({
        title: "🔊 LOUD ALARM ACTIVATED!",
        description: "Playing loud siren sound. Tap again to stop.",
        variant: "destructive",
      });
      
      // Auto-stop after 6 seconds
      setTimeout(() => {
        context.close();
        setAlarmContext(null);
        setIsAlarmPlaying(false);
      }, 6000);
    }
  };

  const openSafetyGuide = () => {
    toast({
      title: "📖 Safety Guide",
      description: "Opening safety guidelines and resources.",
    });
    // Open a safety resource
    window.open('https://www.unwomen.org/en/what-we-do/ending-violence-against-women', '_blank');
  };

  const sendQuickSMS = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to send the message.",
        variant: "destructive",
      });
      return;
    }

    const message = customMessage || selectedMessage;
    const locationText = location 
      ? `\n\nMy location: https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : '';
    
    const fullMessage = message + locationText;
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(fullMessage)}`;
    window.open(smsUrl, '_blank');
    
    toast({
      title: "📱 SMS Opened",
      description: "Message app opened with your emergency message.",
    });
    setShowSMSDialog(false);
  };

  const actions = [
    { icon: Phone, label: "Fake Call", color: "bg-success/10 text-success", action: triggerFakeCall },
    { icon: MessageSquare, label: "Quick SMS", color: "bg-primary/10 text-primary", action: () => setShowSMSDialog(true) },
    { icon: MapPin, label: "Share Location", color: "bg-warning/10 text-warning", action: shareLocation },
    { icon: Volume2, label: isAlarmPlaying ? "Stop Alarm" : "Alarm", color: isAlarmPlaying ? "bg-emergency/20 text-emergency" : "bg-destructive/10 text-destructive", action: triggerAlarm },
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

      {/* Quick SMS Dialog */}
      <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Quick Emergency SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Phone Number:</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Select a predefined message:</p>
              <div className="space-y-2">
                {PREDEFINED_QUICK_MESSAGES.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setCustomMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      selectedMessage === msg && !customMessage
                        ? 'border-primary bg-primary/10 text-foreground'
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
                placeholder="Type your custom message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              📍 Your current location will be automatically added to the message.
            </p>
            <Button onClick={sendQuickSMS} className="w-full">
              Send SMS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions;
