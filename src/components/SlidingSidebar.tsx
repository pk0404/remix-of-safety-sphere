import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Shield,
  Users,
  Bell,
  Settings,
  Map,
  Phone,
  FileText,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  MapPin,
  AlertTriangle,
  Mic,
  Navigation,
  CheckCircle2,
  Award,
  BarChart3,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  section?: string;
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/', section: 'main' },
  { label: 'Safety Map', icon: Map, href: '/#map', section: 'safety' },
  { label: 'Live Location', icon: MapPin, href: '/#location', section: 'safety' },
  { label: 'Audio Recorder', icon: Mic, href: '/#record', section: 'safety' },
  { label: 'Journey Tracker', icon: Navigation, href: '/#journey', section: 'safety' },
  { label: 'Check-In', icon: CheckCircle2, href: '/#checkin', section: 'safety' },
  { label: 'Emergency Contacts', icon: Phone, href: '/#contacts', section: 'safety' },
  { label: 'Report Incident', icon: AlertTriangle, href: '/#report', section: 'safety' },
  { label: 'Analytics', icon: BarChart3, href: '/#analytics', section: 'insights' },
  { label: 'Volunteer Network', icon: Users, href: '/volunteers', section: 'community' },
  { label: 'Notifications', icon: Bell, href: '/notifications', section: 'account' },
  { label: 'Settings', icon: Settings, href: '/settings', section: 'account' },
  { label: 'Documentation', icon: FileText, href: '/documentation', section: 'account' },
  { label: 'Help & Support', icon: HelpCircle, href: '/#help', section: 'account' },
];

const helperNavItems: NavItem[] = [
  { label: 'Helper Dashboard', icon: Home, href: '/', section: 'main' },
  { label: 'Active Requests', icon: AlertTriangle, href: '/#requests', section: 'main' },
  { label: 'Map View', icon: Map, href: '/#map', section: 'main' },
  { label: 'My Rewards', icon: Award, href: '/#rewards', section: 'main' },
  { label: 'Volunteer Network', icon: Users, href: '/volunteers', section: 'community' },
  { label: 'Notifications', icon: Bell, href: '/notifications', section: 'account' },
  { label: 'Settings', icon: Settings, href: '/settings', section: 'account' },
  { label: 'Documentation', icon: FileText, href: '/documentation', section: 'account' },
  { label: 'Help & Support', icon: HelpCircle, href: '/#help', section: 'account' },
];

const SlidingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const navItems = role === 'helper' ? helperNavItems : userNavItems;

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href.startsWith('/#')) return location.pathname === '/';
    return location.pathname.startsWith(href.split('#')[0]);
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const section = href.substring(2);
      // Navigate to home first if not there
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getSectionItems = (section: string) => navItems.filter(item => item.section === section);

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    if (item.href.startsWith('/#')) {
      return (
        <button
          onClick={() => handleNavClick(item.href)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm w-full text-left',
            active
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </button>
      );
    }

    return (
      <SheetClose asChild>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
            active
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      </SheetClose>
    );
  };

  return (
    <>
      {/* Menu Toggle Button - Fixed Position */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 bg-card/90 backdrop-blur-sm shadow-md border border-border hover:bg-accent"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
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

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  Main
                </p>
                <nav className="space-y-1">
                  {getSectionItems('main').map((item) => (
                    <NavLink key={item.href + item.label} item={item} />
                  ))}
                </nav>
              </div>

              {/* Safety Features (User only) */}
              {role !== 'helper' && getSectionItems('safety').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Safety Features
                  </p>
                  <nav className="space-y-1">
                    {getSectionItems('safety').map((item) => (
                      <NavLink key={item.href + item.label} item={item} />
                    ))}
                  </nav>
                </div>
              )}

              {/* Insights */}
              {getSectionItems('insights').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Insights
                  </p>
                  <nav className="space-y-1">
                    {getSectionItems('insights').map((item) => (
                      <NavLink key={item.href + item.label} item={item} />
                    ))}
                  </nav>
                </div>
              )}

              {/* Community */}
              {getSectionItems('community').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Community
                  </p>
                  <nav className="space-y-1">
                    {getSectionItems('community').map((item) => (
                      <NavLink key={item.href + item.label} item={item} />
                    ))}
                  </nav>
                </div>
              )}

              {/* Account */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  Account
                </p>
                <nav className="space-y-1">
                  {getSectionItems('account').map((item) => (
                    <NavLink key={item.href + item.label} item={item} />
                  ))}
                </nav>
              </div>
            </div>
          </ScrollArea>

          {/* User Section */}
          <div className="p-4 border-t border-border mt-auto">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {role || 'user'} account
                    </p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <SheetClose asChild>
                <Link to="/auth">
                  <Button className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </SheetClose>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SlidingSidebar;
