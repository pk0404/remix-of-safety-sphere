import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Shield, Heart } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete
        });
      }
    });

    // Shield animation
    tl.fromTo(shieldRef.current, 
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }
    );

    // Text animation
    tl.fromTo(textRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.3"
    );

    // Progress bar animation
    tl.to({}, {
      duration: 1.5,
      onUpdate: function() {
        setProgress(Math.round(this.progress() * 100));
      }
    }, "-=0.2");

    // Pulse animation on shield
    gsap.to(shieldRef.current, {
      scale: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-primary"
    >
      <div ref={shieldRef} className="mb-8">
        <div className="relative">
          <Shield className="w-24 h-24 text-primary-foreground" strokeWidth={1.5} />
          <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-foreground fill-current" />
        </div>
      </div>

      <div ref={textRef} className="text-center">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">SafeHer</h1>
        <p className="text-primary-foreground/80 text-sm mb-8">Your Safety, Our Priority</p>
      </div>

      <div className="w-48">
        <div className="h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-primary-foreground rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-primary-foreground/60 text-xs mt-2">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
