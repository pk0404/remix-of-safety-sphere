import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Shield,
  Users,
  BarChart3,
  ChevronLeft,
  LogIn,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import VolunteerRegistration from '@/components/volunteer/VolunteerRegistration';
import VolunteerDashboard from '@/components/volunteer/VolunteerDashboard';
import SupportRequestButton from '@/components/volunteer/SupportRequestButton';
import AdminDashboard from '@/components/volunteer/AdminDashboard';
import VolunteerRewards from '@/components/volunteer/VolunteerRewards';
import HelpSessionTracker from '@/components/volunteer/HelpSessionTracker';
import { useVolunteers } from '@/hooks/useVolunteers';
import { useHelpSession } from '@/hooks/useHelpSession';
import { useAuth } from '@/contexts/AuthContext';

const Volunteers = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isVolunteer, loading: volunteerLoading } = useVolunteers();
  const { activeSession } = useHelpSession();
  const [activeTab, setActiveTab] = useState('request');

  useEffect(() => {
    if (isVolunteer) {
      setActiveTab('dashboard');
    }
  }, [isVolunteer]);

  if (authLoading || volunteerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Button>

        {/* Active Help Session Tracker */}
        {activeSession && (
          <div className="mb-6">
            <HelpSessionTracker isVolunteer={isVolunteer} />
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Community Support Network
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with verified volunteers in your area or become a volunteer
            to help women stay safe. Together, we create a safer community.
          </p>
        </div>

        {/* Auth Check */}
        {!user ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to access the volunteer network
            </h2>
            <p className="text-muted-foreground mb-6">
              Create an account to request support or register as a volunteer
            </p>
            <Button onClick={() => navigate('/auth')} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="request" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Request Help</span>
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Become Volunteer</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2" disabled={!isVolunteer}>
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">My Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2" disabled={!isVolunteer}>
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <SupportRequestButton />
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-card rounded-xl border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Nearby Volunteers</h3>
                  <p className="text-sm text-muted-foreground">
                    Verified volunteers in your area are ready to help
                  </p>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Safe & Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    All volunteers go through verification process
                  </p>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Quick Response</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered alerts ensure fastest response time
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="max-w-2xl mx-auto">
              {isVolunteer ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-success mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    You're already a volunteer!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Go to your dashboard to manage your availability and respond to requests
                  </p>
                  <Button onClick={() => setActiveTab('dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <VolunteerRegistration onSuccess={() => setActiveTab('dashboard')} />
              )}
            </TabsContent>

            <TabsContent value="dashboard">
              {isVolunteer ? (
                <VolunteerDashboard />
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Register to access the dashboard
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Become a volunteer to help people in your community
                  </p>
                  <Button onClick={() => setActiveTab('register')}>
                    Register as Volunteer
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rewards">
              {isVolunteer ? (
                <VolunteerRewards />
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Register to view rewards
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Earn points and badges by helping others in your community
                  </p>
                  <Button onClick={() => setActiveTab('register')}>
                    Register as Volunteer
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Volunteers;
