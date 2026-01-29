import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Shield,
  Users,
  Bell,
  Settings,
  Map,
  Phone,
  Heart,
  FileText,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  MapPin,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  requiresAuth?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Safety Map', icon: Map, href: '/#map' },
  { label: 'Volunteer Network', icon: Users, href: '/volunteers' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
];

const safetyItems: NavItem[] = [
  { label: 'Emergency Contacts', icon: Phone, href: '/#contacts' },
  { label: 'Live Location', icon: MapPin, href: '/#location' },
  { label: 'Report Incident', icon: AlertTriangle, href: '/#report' },
];

const accountItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Documentation', icon: FileText, href: '/documentation' },
  { label: 'Help & Support', icon: HelpCircle, href: '/#help' },
];

const MainNavSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('#')[0]);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        to={item.href}
        onClick={() => setIsOpen(false)}
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
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">SafeHer</h2>
            <p className="text-xs text-muted-foreground">Safety Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Main
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {/* Safety Features */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Safety Features
            </p>
            <nav className="space-y-1">
              {safetyItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Account
            </p>
            <nav className="space-y-1">
              {accountItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Logged in</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Link to="/auth" onClick={() => setIsOpen(false)}>
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default MainNavSidebar;
