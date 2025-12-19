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
      
      <main ref={mainRef} className="w-full max-w-4xl mx-auto px-4 py-6 pb-8">
        {/* Desktop: Two column layout, Mobile: Single column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Emergency Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* SOS Section */}
            <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-foreground mb-1">Emergency SOS</h2>
                <p className="text-muted-foreground text-xs">
                  Hold the button for 2 seconds to trigger alert
                </p>
              </div>
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
          </div>

          {/* Right Column - Info & Contacts */}
          <div className="lg:col-span-7 space-y-6">
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
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-6 mt-8 border-t border-border">
          <p className="font-semibold text-foreground mb-1">SafeHer v1.0</p>
          <p className="text-xs">Your safety is our priority • Made with ❤️ for women's safety</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
