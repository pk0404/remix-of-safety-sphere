import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Bell, Shield, MapPin, Phone, Moon, Sun, 
  Vibrate, Volume2, Lock, HelpCircle, FileText, ChevronRight 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    shakeToSOS: true,
    vibration: true,
    soundAlerts: true,
    autoLocation: true,
    countdownSound: true,
  });

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => {
      const newValue = !prev[key];
      toast({ 
        title: `${key.replace(/([A-Z])/g, ' $1').trim()} ${newValue ? 'enabled' : 'disabled'}` 
      });
      return { ...prev, [key]: newValue };
    });
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    settingKey?: keyof typeof settings;
  }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {settingKey && (
        <Switch 
          checked={settings[settingKey]} 
          onCheckedChange={() => toggleSetting(settingKey)} 
        />
      )}
    </div>
  );

  const LinkItem = ({ 
    icon: Icon, 
    title, 
    to 
  }: { 
    icon: any; 
    title: string; 
    to: string;
  }) => (
    <Link 
      to={to}
      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground text-sm">{title}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main ref={containerRef} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Profile
          </h2>
          <div className="space-y-2">
            <LinkItem icon={User} title="Edit Profile" to="/settings" />
            <LinkItem icon={Phone} title="Emergency Contacts" to="/" />
          </div>
        </section>

        {/* SOS Settings */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Emergency Settings
          </h2>
          <div className="space-y-2">
            <SettingItem 
              icon={Vibrate} 
              title="Shake to SOS" 
              description="Trigger SOS by shaking phone rapidly"
              settingKey="shakeToSOS"
            />
            <SettingItem 
              icon={Volume2} 
              title="Countdown Sound" 
              description="Play sound during SOS countdown"
              settingKey="countdownSound"
            />
            <SettingItem 
              icon={MapPin} 
              title="Auto Location" 
              description="Automatically include location in alerts"
              settingKey="autoLocation"
            />
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Notifications
          </h2>
          <div className="space-y-2">
            <SettingItem 
              icon={Bell} 
              title="Push Notifications" 
              description="Receive safety alerts and reminders"
              settingKey="notifications"
            />
            <SettingItem 
              icon={Vibrate} 
              title="Vibration" 
              description="Vibrate for notifications"
              settingKey="vibration"
            />
            <SettingItem 
              icon={Volume2} 
              title="Sound Alerts" 
              description="Play sound for notifications"
              settingKey="soundAlerts"
            />
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Appearance
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {settings.darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={() => toggleSetting('darkMode')} 
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Support
          </h2>
          <div className="space-y-2">
            <LinkItem icon={HelpCircle} title="Help & FAQ" to="/settings" />
            <LinkItem icon={Shield} title="Privacy Policy" to="/settings" />
            <LinkItem icon={FileText} title="Terms of Service" to="/settings" />
          </div>
        </section>

        {/* App Info */}
        <div className="text-center py-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">SafeHer v1.0.0</p>
          <p className="text-xs mt-1">Your Safety Companion</p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
