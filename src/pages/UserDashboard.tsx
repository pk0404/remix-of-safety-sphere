import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import SOSButton from '@/components/SOSButton';
import ContactsManager from '@/components/ContactsManager';
import QuickActions from '@/components/QuickActions';
import SafetyTips from '@/components/SafetyTips';
import AudioRecorderComponent from '@/components/AudioRecorder';
import JourneyTracker from '@/components/JourneyTracker';
import AISafetyAssistant from '@/components/AISafetyAssistant';
import CheckInSystem from '@/components/CheckInSystem';
import SafetyAnalyticsDashboard from '@/components/SafetyAnalyticsDashboard';
import SafetyMapReal from '@/components/SafetyMapReal';
import NearbyPlacesMap from '@/components/NearbyPlacesMap';
import GoogleMapsProvider from '@/components/GoogleMapsProvider';
import OfflineIndicator from '@/components/OfflineIndicator';
import EmergencyNumbers from '@/components/EmergencyNumbers';
import LiveLocation from '@/components/LiveLocation';
import UserRequestHelpCard from '@/components/volunteer/UserRequestHelpCard';
import BottomNavBar from '@/components/BottomNavBar';
import AudioEvidenceViewer from '@/components/AudioEvidenceViewer';
import useGeolocation from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useShakeDetection } from '@/hooks/useShakeDetection';
import { useVoiceActivation } from '@/hooks/useVoiceActivation';
import { toast } from 'sonner';

const UserDashboard = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const sosTriggeredRef = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, loading: locationLoading, refresh: refreshLocation } = useGeolocation();
  const { contacts } = useEmergencyContacts();
  const { settings } = useUserSettings();

  const formattedContacts = contacts.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    relationship: c.relationship || ''
  }));

  const handleSOSTrigger = () => {
    if (sosTriggeredRef.current) return;
    sosTriggeredRef.current = true;
    toast.error('🚨 SOS Triggered via Gesture/Voice!', {
      description: 'Emergency alert initiated'
    });
    setTimeout(() => {
      sosTriggeredRef.current = false;
    }, 10000);
  };

  useShakeDetection({
    onShake: handleSOSTrigger,
    enabled: settings.shake_to_sos && !!user
  });

  const { startListening, isListening, isSupported: voiceSupported } = useVoiceActivation({
    onTrigger: handleSOSTrigger,
    triggerWords: settings.trigger_words,
    enabled: settings.voice_activation && !!user
  });

  useEffect(() => {
    if (settings.voice_activation && voiceSupported && user) {
      startListening();
    }
  }, [settings.voice_activation, voiceSupported, user, startListening]);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-background pb-20">
        <main ref={mainRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Voice activation indicator */}
          {isListening && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success">Voice activation active - say "Help me" or "Emergency"</span>
            </div>
          )}

          {/* Two column layout for desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Left Column - Emergency & Actions */}
            <div className="space-y-4">
              {/* SOS Section */}
              <section className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-foreground mb-1">Emergency SOS</h2>
                  <p className="text-muted-foreground text-xs">
                    Hold the button for 2 seconds to trigger alert
                  </p>
                </div>
                <div className="flex justify-center">
                  <SOSButton location={location} contacts={formattedContacts} />
                </div>
              </section>

              {/* Request Help Card */}
              <UserRequestHelpCard />

              {/* Quick Actions */}
              <QuickActions location={location} />

              {/* Live Location */}
              <LiveLocation 
                location={location} 
                loading={locationLoading}
                onRefresh={refreshLocation}
                contacts={formattedContacts}
              />

              {/* Audio Recorder with Evidence Viewer */}
              <div className="space-y-4">
                <AudioRecorderComponent location={location} contacts={formattedContacts} />
                <AudioEvidenceViewer />
              </div>

              {/* Journey Tracker */}
              <JourneyTracker location={location} contacts={formattedContacts} />

              {/* Check-In System */}
              <CheckInSystem location={location} />
            </div>

            {/* Right Column - Map & Info */}
            <div className="space-y-4">
              {/* Safety Map with AI Integration */}
              <SafetyMapReal location={location} />

              {/* AI Safety Assistant */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <AISafetyAssistant location={location} />
              </div>

              {/* Analytics Dashboard */}
              <SafetyAnalyticsDashboard />

              {/* Nearby Places */}
              <NearbyPlacesMap location={location} />

              {/* Emergency Numbers */}
              <EmergencyNumbers />

              {/* Emergency Contacts */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <ContactsManager 
                  contacts={formattedContacts} 
                  setContacts={() => {}}
                />
              </div>

              {/* Safety Tips */}
              <SafetyTips />
            </div>
          </div>
        </main>

        <BottomNavBar />
        <OfflineIndicator />
      </div>
    </GoogleMapsProvider>
  );
};

export default UserDashboard;
