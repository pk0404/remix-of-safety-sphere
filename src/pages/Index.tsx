import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import ContactsManager, { Contact } from '@/components/ContactsManager';
import LocationDisplay from '@/components/LocationDisplay';
import QuickActions from '@/components/QuickActions';
import SafetyTips from '@/components/SafetyTips';
import ShareLocation from '@/components/ShareLocation';
import MediaRecorderComponent from '@/components/MediaRecorder';
import useGeolocation from '@/hooks/useGeolocation';

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);
  const { location, loading: locationLoading, refresh: refreshLocation } = useGeolocation();

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main ref={mainRef} className="w-full max-w-lg mx-auto px-4 py-4 pb-8 space-y-6">
        {/* Hero Section with SOS */}
        <section className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Emergency SOS</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4">
            Hold the button for 2 seconds to trigger an emergency alert
          </p>
          
          <div className="flex justify-center">
            <SOSButton location={location} contacts={contacts} />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <QuickActions location={location} />
        </section>

        {/* Share Location */}
        <section>
          <ShareLocation location={location} contacts={contacts} />
        </section>

        {/* Media Recorder */}
        <section>
          <MediaRecorderComponent location={location} contacts={contacts} />
        </section>

        {/* Location Display */}
        <section>
          <LocationDisplay 
            location={location} 
            loading={locationLoading}
            onRefresh={refreshLocation}
          />
        </section>

        {/* Emergency Contacts */}
        <section>
          <ContactsManager contacts={contacts} setContacts={setContacts} />
        </section>

        {/* Safety Tips */}
        <section>
          <SafetyTips />
        </section>

        {/* App Info Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4 border-t border-border">
          <p className="font-semibold text-foreground mb-1">SafeHer v1.0</p>
          <p className="text-xs">Your safety is our priority.</p>
          <p className="text-xs mt-1">Made with ❤️ for women's safety</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
