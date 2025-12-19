import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, Heart, Bell, Settings } from 'lucide-react';

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            <Heart className="absolute w-2.5 h-2.5 text-primary-foreground fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">SafeHer</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Your Safety Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
