import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Mic, Square, Send, X, Clock, MapPin, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useEvidenceUpload } from '@/hooks/useEvidenceUpload';
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

interface AudioRecorderProps {
  location: Location | null;
  contacts: Contact[];
}

const AudioRecorderComponent = ({ location, contacts }: AudioRecorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedAudio, setCapturedAudio] = useState<{ url: string; blob: Blob } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { uploadEvidence, uploading, progress } = useEvidenceUpload();
  const { user } = useAuth();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setCapturedAudio({ url, blob });
        setShowPreview(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      toast.success('🎙️ Recording started', {
        description: 'Audio recording is in progress...'
      });
    } catch (err) {
      toast.error('Microphone Access Denied', {
        description: 'Please grant microphone permissions.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast.success('⬛ Recording stopped', {
        description: 'Processing your audio...'
      });
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sendToContacts = async () => {
    if (!capturedAudio) return;

    // Upload to cloud if user is logged in
    if (user) {
      const result = await uploadEvidence({
        file: capturedAudio.blob,
        mediaType: 'audio',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      if (result) {
        toast.success('Audio evidence saved to cloud');
      }
    }

    if (contacts.length === 0) {
      toast.error('No Contacts', {
        description: 'Please add emergency contacts first.'
      });
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString();
    const locationText = location 
      ? `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\nGoogle Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';

    const message = `🚨 EMERGENCY AUDIO EVIDENCE\n\nTime: ${timestamp}\n${locationText}\n\n⚠️ This is an emergency alert with captured audio evidence.`;

    const files = [new File([capturedAudio.blob], `emergency_audio_${Date.now()}.webm`, { type: capturedAudio.blob.type })];

    if (navigator.canShare && navigator.canShare({ files })) {
      try {
        await navigator.share({
          title: 'Emergency Audio Evidence',
          text: message,
          files: files
        });
        
        toast.success('📤 Audio shared');
      } catch (err) {
        sendSMSFallback(message);
      }
    } else {
      sendSMSFallback(message);
    }

    setShowPreview(false);
    discardAudio();
  };

  const sendSMSFallback = (message: string) => {
    contacts.forEach((contact) => {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    });

    toast.success('📱 SMS Opened', {
      description: `Alert sent to ${contacts.length} contacts.`
    });
  };

  const discardAudio = () => {
    if (capturedAudio) {
      URL.revokeObjectURL(capturedAudio.url);
    }
    setCapturedAudio(null);
    setShowPreview(false);
    setIsPlaying(false);
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Audio Evidence</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
        <p className="text-sm text-muted-foreground mb-4">
          Record audio evidence discreetly. Audio is automatically saved to cloud and shared with contacts.
        </p>

        {isRecording ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-destructive/10 rounded-xl">
              <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
              <span className="text-lg font-mono font-semibold text-destructive">
                {formatTime(recordingTime)}
              </span>
            </div>
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-full"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        ) : (
          <Button
            onClick={startRecording}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Audio Recording
          </Button>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Audio Evidence Preview</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {capturedAudio && (
              <div className="rounded-xl overflow-hidden bg-muted p-6">
                <audio
                  ref={audioRef}
                  src={capturedAudio.url}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-primary" />
                  </div>
                  <Button
                    onClick={togglePlayback}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
              </div>
            )}

            {uploading && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardAudio}
                className="flex-1"
                disabled={uploading}
              >
                <X className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={sendToContacts}
                className="flex-1"
                disabled={uploading}
              >
                <Send className="w-4 h-4 mr-2" />
                Save & Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudioRecorderComponent;
