import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import ContactsManager, { Contact } from '@/components/ContactsManager';
import LocationDisplay from '@/components/LocationDisplay';
import QuickActions from '@/components/QuickActions';
import SafetyTips from '@/components/SafetyTips';
import useGeolocation from '@/hooks/useGeolocation';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
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
    if (!isLoading && mainRef.current) {
      gsap.fromTo(mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main ref={mainRef} className="container mx-auto px-4 py-6 pb-24">
        {/* Hero Section with SOS */}
        <section className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Emergency SOS</h2>
            <p className="text-muted-foreground text-sm">
              Hold the button for 2 seconds to trigger an emergency alert
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <SOSButton location={location} contacts={contacts} />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <QuickActions location={location} />
        </section>

        {/* Location Display */}
        <section className="mb-8">
          <LocationDisplay 
            location={location} 
            loading={locationLoading}
            onRefresh={refreshLocation}
          />
        </section>

        {/* Emergency Contacts */}
        <section className="mb-8">
          <ContactsManager contacts={contacts} setContacts={setContacts} />
        </section>

        {/* Safety Tips */}
        <section className="mb-8">
          <SafetyTips />
        </section>

        {/* App Info Footer */}
        <section className="text-center text-sm text-muted-foreground py-6 border-t border-border">
          <p className="font-semibold text-foreground mb-1">SafeHer v1.0</p>
          <p>Your safety is our priority.</p>
          <p className="text-xs mt-2">Made with ❤️ for women's safety</p>
        </section>
      </main>

      {/* Bottom Safe Area Spacer */}
      <div className="h-safe-area-bottom" />
    </div>
  );
};

export default Index;
