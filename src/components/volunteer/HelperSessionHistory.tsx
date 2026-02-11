import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Star, Award, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVolunteers } from '@/hooks/useVolunteers';
import { formatDistanceToNow, format } from 'date-fns';

interface SessionRecord {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  distance_km: number | null;
  response_time_seconds: number | null;
  rating: number | null;
  feedback: string | null;
  points_earned: number | null;
  otp_verified: boolean | null;
}

interface RewardRecord {
  id: string;
  points: number;
  reason: string;
  created_at: string | null;
}

const HelperSessionHistory = () => {
  const { user } = useAuth();
  const { volunteer } = useVolunteers();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!volunteer) return;

      try {
        const [sessionsRes, rewardsRes] = await Promise.all([
          supabase
            .from('help_sessions')
            .select('id, status, started_at, completed_at, distance_km, response_time_seconds, rating, feedback, points_earned, otp_verified')
            .eq('volunteer_id', volunteer.id)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('volunteer_rewards')
            .select('id, points, reason, created_at')
            .eq('volunteer_id', volunteer.id)
            .order('created_at', { ascending: false })
            .limit(50),
        ]);

        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (rewardsRes.data) setRewards(rewardsRes.data);
      } catch (error) {
        console.error('Error fetching session history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [volunteer]);

  if (!volunteer) return null;

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalEarnings = rewards.reduce((sum, r) => sum + r.points, 0);
  const avgRating = completedSessions.length > 0
    ? (completedSessions.reduce((sum, s) => sum + (s.rating || 5), 0) / completedSessions.length).toFixed(1)
    : '5.0';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Session History & Earnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-xl font-bold text-success">{completedSessions.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-xl font-bold text-warning flex items-center justify-center gap-1">
              <Star className="w-4 h-4" />{avgRating}
            </p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xl font-bold text-primary">{totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>

        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings Log</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No sessions yet</p>
                <p className="text-xs">Accept help requests to start earning</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className={`p-3 rounded-lg border ${getStatusColor(session.status)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(session.status)}
                          <span className="text-sm font-medium capitalize">{session.status}</span>
                        </div>
                        {session.points_earned ? (
                          <Badge variant="secondary" className="text-xs font-mono">
                            +{session.points_earned} pts
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {session.started_at && (
                          <span>{format(new Date(session.started_at), 'MMM d, h:mm a')}</span>
                        )}
                        {session.distance_km && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{session.distance_km} km
                          </span>
                        )}
                        {session.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />{session.rating}/5
                          </span>
                        )}
                      </div>
                      {session.feedback && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{session.feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="earnings">
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No earnings yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                          <Award className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{reward.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {reward.created_at && formatDistanceToNow(new Date(reward.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono text-success">
                        +{reward.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HelperSessionHistory;
