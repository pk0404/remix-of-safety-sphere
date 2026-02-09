import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import RoleSelection from '@/components/RoleSelection';
import UserDashboard from '@/pages/UserDashboard';
import HelperDashboard from '@/pages/HelperDashboard';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, Loader2, Heart, Users, MapPin, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasRole } = useUserRole();

  // Show loading only if auth is loading OR role hasn't resolved yet (and no cache)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 shadow-lg relative">
            <Shield className="w-10 h-10 text-primary-foreground" />
            <Heart className="absolute w-4 h-4 text-primary-foreground fill-current" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            SafeHer
          </h1>
          <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
            Your personal safety companion. Emergency SOS, location sharing, 
            journey tracking, and community support at your fingertips.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
            <div className="bg-card border border-border rounded-xl p-3 text-left">
              <Shield className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Emergency SOS</p>
              <p className="text-xs text-muted-foreground">One-touch alerts</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-left">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Live Location</p>
              <p className="text-xs text-muted-foreground">Share with contacts</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-left">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Community Help</p>
              <p className="text-xs text-muted-foreground">Nearby volunteers</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-left">
              <Bell className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Smart Alerts</p>
              <p className="text-xs text-muted-foreground">Check-in reminders</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="w-full"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup')} 
              variant="outline"
              size="lg" 
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // Show brief loader only if role is still loading from DB (no cache hit)
  if (roleLoading && !hasRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // Show role selection if user hasn't chosen a role
  if (!hasRole) {
    return <RoleSelection onComplete={() => window.location.reload()} />;
  }

  // Show appropriate dashboard based on role
  if (role === 'helper') {
    return <HelperDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
