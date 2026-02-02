import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import RoleSelection from '@/components/RoleSelection';
import UserDashboard from '@/pages/UserDashboard';
import HelperDashboard from '@/pages/HelperDashboard';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasRole } = useUserRole();

  // Show loading while checking auth
  if (authLoading || (user && roleLoading)) {
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

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SafeGuard</h1>
          <p className="text-muted-foreground mb-8">
            Your personal safety companion. Sign in to access emergency features, location sharing, and community support.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="w-full max-w-xs">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In to Continue
          </Button>
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
