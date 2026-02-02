import { useState } from 'react';
import { User, HeartHandshake, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface RoleSelectionProps {
  onComplete: () => void;
}

const RoleSelection = ({ onComplete }: RoleSelectionProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { setRole } = useUserRole();

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    const success = await setRole(selectedRole);
    setLoading(false);

    if (success) {
      toast.success(`You're now registered as a ${selectedRole === 'user' ? 'User' : 'Community Helper'}!`);
      onComplete();
    } else {
      toast.error('Failed to set role. Please try again.');
    }
  };

  const roles = [
    {
      id: 'user' as UserRole,
      title: 'User',
      subtitle: 'I need safety support',
      description: 'Access emergency SOS, journey tracking, share location with contacts, and request help from nearby volunteers.',
      icon: User,
      color: 'primary',
    },
    {
      id: 'helper' as UserRole,
      title: 'Community Helper',
      subtitle: 'I want to help others',
      description: 'Receive alerts when someone nearby needs help, respond to emergencies, and earn rewards for your service.',
      icon: HeartHandshake,
      color: 'success',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">How will you use SafeGuard?</h1>
          <p className="text-muted-foreground">Choose your role to personalize your experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg border-2',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-transparent hover:border-border'
                )}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription className="text-sm">{role.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full h-12 text-base"
        >
          {loading ? 'Setting up...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can change your role later in Settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
