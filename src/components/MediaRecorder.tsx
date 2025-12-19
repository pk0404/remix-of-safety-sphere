import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Video, Camera, Square, Circle, Send, X, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface MediaRecorderProps {
  location: Location | null;
  contacts: Contact[];
}

const MediaRecorderComponent = ({ location, contacts }: MediaRecorderProps) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ type: 'video' | 'photo'; url: string; blob: Blob } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

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

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast({
        title: "Camera Access Denied",
        description: "Please grant camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia({ type: 'video', url, blob });
      setShowPreview(true);
      closeCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    toast({
      title: "🔴 Recording Started",
      description: "Video recording is in progress...",
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "⬛ Recording Stopped",
        description: "Processing your video...",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !stream) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedMedia({ type: 'photo', url, blob });
          setShowPreview(true);
          closeCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const sendToContacts = async () => {
    if (!capturedMedia || contacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "Please add emergency contacts first.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString();
    const locationText = location 
      ? `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\nGoogle Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';

    const message = `🚨 EMERGENCY EVIDENCE\n\nType: ${capturedMedia.type === 'video' ? 'Video' : 'Photo'}\nTime: ${timestamp}\n${locationText}\n\n⚠️ This is an emergency alert with captured evidence.`;

    // Create shareable content
    const files = [new File([capturedMedia.blob], `emergency_${capturedMedia.type}_${Date.now()}.${capturedMedia.type === 'video' ? 'webm' : 'jpg'}`, { type: capturedMedia.blob.type })];

    if (navigator.canShare && navigator.canShare({ files })) {
      try {
        await navigator.share({
          title: 'Emergency Evidence',
          text: message,
          files: files
        });
        
        toast({
          title: "📤 Evidence Shared",
          description: "Media sent to your contacts successfully.",
        });
      } catch (err) {
        // Fallback to SMS with location
        sendSMSFallback(message);
      }
    } else {
      sendSMSFallback(message);
    }

    setShowPreview(false);
    setCapturedMedia(null);
  };

  const sendSMSFallback = (message: string) => {
    contacts.forEach((contact) => {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    });

    toast({
      title: "📱 SMS Opened",
      description: `Alert sent to ${contacts.length} contacts with location info.`,
    });
  };

  const discardMedia = () => {
    if (capturedMedia) {
      URL.revokeObjectURL(capturedMedia.url);
    }
    setCapturedMedia(null);
    setShowPreview(false);
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Evidence Recorder</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
        <p className="text-sm text-muted-foreground mb-4">
          Capture photo or video evidence. Media will be automatically shared with your emergency contacts.
        </p>

        <Button
          onClick={openCamera}
          className="w-full gradient-primary text-primary-foreground"
        >
          <Camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>
      </div>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg p-0 overflow-hidden">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover"
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-emergency/90 rounded-full animate-pulse">
                <Circle className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                <span className="text-primary-foreground text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}

            {/* Location indicator */}
            {location && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full">
                <MapPin className="w-3 h-3 text-primary-foreground" />
                <span className="text-primary-foreground text-xs">GPS</span>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-6">
                {/* Close button */}
                <button
                  onClick={closeCamera}
                  className="w-12 h-12 rounded-full bg-muted/30 backdrop-blur flex items-center justify-center text-primary-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Record/Stop button */}
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-emergency flex items-center justify-center shadow-lg animate-pulse"
                  >
                    <Square className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-emergency flex items-center justify-center shadow-lg"
                  >
                    <Circle className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
                  </button>
                )}

                {/* Capture photo button */}
                <button
                  onClick={capturePhoto}
                  disabled={isRecording}
                  className={`w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center ${isRecording ? 'opacity-50' : 'hover:bg-primary-foreground/80'} transition-colors`}
                >
                  <Camera className="w-6 h-6 text-background" />
                </button>
              </div>
              
              <p className="text-center text-primary-foreground/70 text-xs mt-3">
                {isRecording ? 'Tap square to stop recording' : 'Tap circle to record video • Tap camera for photo'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Evidence to Contacts</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {capturedMedia && (
              <div className="rounded-xl overflow-hidden bg-muted">
                {capturedMedia.type === 'video' ? (
                  <video
                    src={capturedMedia.url}
                    controls
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <img
                    src={capturedMedia.url}
                    alt="Captured evidence"
                    className="w-full aspect-video object-cover"
                  />
                )}
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardMedia}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={sendToContacts}
                className="flex-1 gradient-emergency text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaRecorderComponent;
