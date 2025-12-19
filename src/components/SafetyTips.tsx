import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Lightbulb, ChevronRight, Shield, Eye, Phone, MapPin } from 'lucide-react';

const tips = [
  {
    icon: Eye,
    title: "Stay Aware",
    description: "Always be aware of your surroundings. Avoid using headphones in unfamiliar areas.",
  },
  {
    icon: Phone,
    title: "Keep Phone Ready",
    description: "Keep your phone charged and emergency contacts easily accessible.",
  },
  {
    icon: MapPin,
    title: "Share Your Location",
    description: "Let trusted contacts know your whereabouts when traveling alone.",
  },
  {
    icon: Shield,
    title: "Trust Your Instincts",
    description: "If something feels wrong, trust your gut and remove yourself from the situation.",
  },
];

const SafetyTips = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }

    // Auto-rotate tips
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.fromTo('.tip-content',
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [activeIndex]);

  const currentTip = tips[activeIndex];
  const Icon = currentTip.icon;

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h2 className="text-lg font-semibold text-foreground">Safety Tips</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
        <div className="tip-content">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{currentTip.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTip.description}</p>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Emergency Numbers */}
      <div className="mt-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
        <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-2">Emergency Numbers</h3>
        <div className="grid grid-cols-2 gap-1.5 text-xs sm:text-sm">
          <a href="tel:100" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1">
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span>Police: 100</span>
          </a>
          <a href="tel:1091" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1">
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span>Women: 1091</span>
          </a>
          <a href="tel:112" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1">
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span>Emergency: 112</span>
          </a>
          <a href="tel:181" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1">
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span>Safety: 181</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
