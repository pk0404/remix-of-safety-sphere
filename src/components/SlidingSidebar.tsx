import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Shield, Bell, Settings, Map, Phone, Menu, LogIn, LogOut, User,
  MapPin, Mic, Navigation, CheckCircle2, Award, BarChart3, Heart,
  FileAudio, AlertTriangle, History, FileText, Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  section?: string;
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/', section: 'main' },
  { label: 'Live Map', icon: Map, href: '/#map', section: 'safety' },
  { label: 'Live Location', icon: MapPin, href: '/#location', section: 'safety' },
  { label: 'Safety Check-In', icon: CheckCircle2, href: '/#checkin', section: 'safety' },
  { label: 'Audio Recorder', icon: Mic, href: '/#record', section: 'safety' },
  { label: 'Audio Library', icon: FileAudio, href: '/audio-library', section: 'safety' },
  { label: 'Journey Tracker', icon: Navigation, href: '/#journey', section: 'safety' },
  { label: 'Emergency Contacts', icon: Phone, href: '/#contacts', section: 'safety' },
  { label: 'Nearby Places', icon: MapPin, href: '/#nearby', section: 'safety' },
  { label: 'Emergency Numbers', icon: Phone, href: '/#numbers', section: 'safety' },
  { label: 'Analytics', icon: BarChart3, href: '/#analytics', section: 'insights' },
  { label: 'Notifications', icon: Bell, href: '/notifications', section: 'account' },
  { label: 'Settings', icon: Settings, href: '/settings', section: 'account' },
  { label: 'Documentation', icon: FileText, href: '/documentation', section: 'account' },
];

const helperNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/', section: 'main' },
  { label: 'Requests Map', icon: Map, href: '/#map', section: 'main' },
  { label: 'Active Requests', icon: AlertTriangle, href: '/#requests', section: 'main' },
  { label: 'My Rewards', icon: Award, href: '/#rewards', section: 'main' },
  { label: 'Leaderboard', icon: BarChart3, href: '/#leaderboard', section: 'main' },
  { label: 'Session History', icon: History, href: '/#history', section: 'main' },
  { label: 'Helper Settings', icon: Sliders, href: '/#settings', section: 'account' },
  { label: 'Notifications', icon: Bell, href: '/notifications', section: 'account' },
  { label: 'Settings', icon: Settings, href: '/settings', section: 'account' },
  { label: 'Documentation', icon: FileText, href: '/documentation', section: 'account' },
];

const SlidingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const navItems = role === 'helper' ? helperNavItems : userNavItems;

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/' && !location.hash;
    if (href.startsWith('/#')) return location.hash === href.substring(1);
    return location.pathname === href;
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    
    if (href.startsWith('/#')) {
      const section = href.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const getSectionItems = (section: string) => navItems.filter(item => item.section === section);

  const NavLinkItem = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    if (item.href.startsWith('/#')) {
      return (
        <SheetClose asChild>
          <button
            onClick={() => handleNavClick(item.href)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm w-full text-left',
              active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
          </button>
        </SheetClose>
      );
    }

    return (
      <SheetClose asChild>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
            active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 bg-card/90 backdrop-blur-sm shadow-md border border-border hover:bg-accent">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center relative">
              <Shield className="w-5 h-5 text-primary-foreground" />
              <Heart className="absolute w-2 h-2 text-primary-foreground fill-current" />
            </div>
            <div>
              <SheetTitle className="text-left font-bold text-foreground">SafeHer</SheetTitle>
              <p className="text-xs text-muted-foreground">
                {role === 'helper' ? 'Helper Mode' : 'Your Safety Companion'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Main</p>
              <nav className="space-y-1">
                {getSectionItems('main').map((item) => (
                  <NavLinkItem key={item.href + item.label} item={item} />
                ))}
              </nav>
            </div>

            {getSectionItems('safety').length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Safety Features</p>
                <nav className="space-y-1">
                  {getSectionItems('safety').map((item) => (
                    <NavLinkItem key={item.href + item.label} item={item} />
                  ))}
                </nav>
              </div>
            )}

            {getSectionItems('insights').length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Insights</p>
                <nav className="space-y-1">
                  {getSectionItems('insights').map((item) => (
                    <NavLinkItem key={item.href + item.label} item={item} />
                  ))}
                </nav>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Account</p>
              <nav className="space-y-1">
                {getSectionItems('account').map((item) => (
                  <NavLinkItem key={item.href + item.label} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border mt-auto">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role || 'user'} account</p>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </SheetClose>
            </div>
          ) : (
            <SheetClose asChild>
              <Link to="/auth">
                <Button className="w-full">
                  <LogIn className="w-4 h-4 mr-2" /> Sign In
                </Button>
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SlidingSidebar;
