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
import useGeolocation from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useShakeDetection } from '@/hooks/useShakeDetection';
import { useVoiceActivation } from '@/hooks/useVoiceActivation';
import { Button } from '@/components/ui/button';
import { LogIn, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const sosTriggeredRef = useRef(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading, refresh: refreshLocation } = useGeolocation();
  const { contacts, loading: contactsLoading } = useEmergencyContacts();
  const { settings } = useUserSettings();

  // Convert database contacts to the format expected by components
  const formattedContacts = contacts.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    relationship: c.relationship || ''
  }));

  // SOS trigger function
  const handleSOSTrigger = () => {
    if (sosTriggeredRef.current) return;
    sosTriggeredRef.current = true;
    toast.error('🚨 SOS Triggered via Gesture/Voice!', {
      description: 'Emergency alert initiated'
    });
    // Reset after 10 seconds
    setTimeout(() => {
      sosTriggeredRef.current = false;
    }, 10000);
  };

  // Shake detection
  useShakeDetection({
    onShake: handleSOSTrigger,
    enabled: settings.shake_to_sos && !!user
  });

  // Voice activation
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-background">
        <main ref={mainRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
          {/* Login prompt for unauthenticated users */}
          {!user && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Sign in for full protection</p>
                  <p className="text-sm text-muted-foreground">Save contacts, auto-backup evidence, cloud sync</p>
                </div>
              </div>
              <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </div>
          )}

          {/* Voice activation indicator */}
          {isListening && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success">Voice activation active - say "Help me" or "Emergency"</span>
            </div>
          )}

          {/* Desktop: Three column layout, Mobile: Single column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            
            {/* Left Column - Emergency Section */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              {/* SOS Section */}
              <section className="bg-card rounded-2xl border border-border p-4 lg:p-6 shadow-card">
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

              {/* Quick Actions */}
              <section>
                <QuickActions location={location} />
              </section>

              {/* Live Location (merged share + display) */}
              <section>
                <LiveLocation 
                  location={location} 
                  loading={locationLoading}
                  onRefresh={refreshLocation}
                  contacts={formattedContacts}
                />
              </section>

              {/* User Request Help Card */}
              <section>
                <UserRequestHelpCard />
              </section>

              {/* Volunteer Network Link */}
              <section className="p-4 bg-card rounded-2xl border border-border shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Volunteer Network</p>
                      <p className="text-xs text-muted-foreground">Join or view dashboard</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate('/volunteers')}>
                    Open
                  </Button>
                </div>
              </section>

              {/* Audio Recorder */}
              <section>
                <AudioRecorderComponent location={location} contacts={formattedContacts} />
              </section>

              {/* Journey Tracker */}
              <section>
                <JourneyTracker location={location} contacts={formattedContacts} />
              </section>

              {/* Check-In System */}
              <section>
                <CheckInSystem location={location} />
              </section>
            </div>

            {/* Middle Column - Map & Location */}
            <div className="lg:col-span-5 space-y-4 lg:space-y-6">
              {/* Real-Time Safety Map - Full Featured */}
              <section>
                <SafetyMapReal location={location} />
              </section>

              {/* Nearby Safety Locations with Map */}
              <section>
                <NearbyPlacesMap location={location} />
              </section>

              {/* Emergency Numbers - Fully Developed */}
              <section>
                <EmergencyNumbers />
              </section>
            </div>

            {/* Right Column - Info & Contacts */}
            <div className="lg:col-span-3 space-y-4 lg:space-y-6">
              {/* AI Safety Assistant */}
              <section>
                <AISafetyAssistant location={location} />
              </section>

              {/* Safety Analytics Dashboard */}
              <section>
                <SafetyAnalyticsDashboard />
              </section>

              {/* Emergency Contacts */}
              <section className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <ContactsManager 
                  contacts={formattedContacts} 
                  setContacts={() => {}}
                />
              </section>

              {/* Safety Tips */}
              <section>
                <SafetyTips />
              </section>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-6 mt-8 border-t border-border">
            <p className="font-semibold text-foreground mb-1">SafeHer v2.0</p>
            <p className="text-xs">Your safety is our priority • Powered by AI</p>
          </footer>
        </main>

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </GoogleMapsProvider>
  );
};

export default Index;
