import { useState, useEffect } from 'react';
import {
  Award,
  Star,
  TrendingUp,
  Gift,
  Medal,
  Crown,
  Sparkles,
  Trophy,
  Clock,
  Target,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useVolunteers } from '@/hooks/useVolunteers';
import { formatDistanceToNow } from 'date-fns';

interface RewardHistory {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

const LEVELS = [
  { name: 'Bronze', minPoints: 0, maxPoints: 200, icon: Medal, color: 'text-orange-600', bg: 'bg-orange-100' },
  { name: 'Silver', minPoints: 200, maxPoints: 500, icon: Star, color: 'text-muted-foreground', bg: 'bg-muted' },
  { name: 'Gold', minPoints: 500, maxPoints: 1000, icon: Trophy, color: 'text-warning', bg: 'bg-warning/10' },
  { name: 'Platinum', minPoints: 1000, maxPoints: 2000, icon: Crown, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Diamond', minPoints: 2000, maxPoints: Infinity, icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const BADGES = [
  { id: 'first_help', name: 'First Helper', description: 'Completed first help session', icon: '🎉', requirement: '1 session' },
  { id: 'fast_responder', name: 'Fast Responder', description: 'Responded within 5 minutes', icon: '⚡', requirement: '<5 min response' },
  { id: 'super_helper', name: 'Super Helper', description: '10 successful help sessions', icon: '🦸', requirement: '10 sessions' },
  { id: 'guardian', name: 'Guardian', description: '25 successful help sessions', icon: '🛡️', requirement: '25 sessions' },
  { id: 'hero', name: 'Community Hero', description: '50 successful help sessions', icon: '🏆', requirement: '50 sessions' },
  { id: 'five_star', name: '5-Star Volunteer', description: 'Maintained 5-star rating', icon: '⭐', requirement: '5.0 rating' },
];

const MILESTONES = [
  { points: 50, reward: 'First Helper Badge', icon: Target },
  { points: 200, reward: 'Silver Level Unlock', icon: Star },
  { points: 500, reward: 'Gold Level + Priority Alerts', icon: Trophy },
  { points: 1000, reward: 'Platinum Level + Community Lead', icon: Crown },
  { points: 2000, reward: 'Diamond Level + Mentor Status', icon: Sparkles },
];

const VolunteerRewards = () => {
  const { volunteer } = useVolunteers();
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!volunteer) return;

      try {
        const { data, error } = await supabase
          .from('volunteer_rewards')
          .select('*')
          .eq('volunteer_id', volunteer.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setRewardHistory(data || []);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [volunteer]);

  if (!volunteer) return null;

  const currentPoints = volunteer.reward_points || 0;
  const currentLevel = LEVELS.find(
    (level) => currentPoints >= level.minPoints && currentPoints < level.maxPoints
  ) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  
  const progressToNextLevel = nextLevel
    ? ((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const CurrentLevelIcon = currentLevel.icon;

  const earnedBadges = (volunteer.badges || []).map((badgeId: string) => 
    BADGES.find(b => b.id === badgeId)
  ).filter(Boolean);

  const totalPointsEarned = rewardHistory.reduce((acc, r) => acc + r.points, 0);
  const avgPointsPerSession = volunteer.total_responses 
    ? Math.round(currentPoints / volunteer.total_responses)
    : 0;

  return (
    <div className="space-y-4">
      {/* Points & Level Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Rewards & Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <div className={`w-20 h-20 rounded-2xl ${currentLevel.bg} flex items-center justify-center ${currentLevel.color}`}>
              <CurrentLevelIcon className="w-10 h-10" />
            </div>
            <div>
              <p className="text-3xl font-bold">{currentPoints}</p>
              <p className="text-muted-foreground text-sm">Total Points</p>
              <Badge className="mt-1 capitalize">{currentLevel.name} Level</Badge>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextLevel.name}</span>
                <span className="font-medium">{nextLevel.minPoints - currentPoints} pts needed</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different reward sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Impact Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-success" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{volunteer.total_responses || 0}</p>
                  <p className="text-xs text-muted-foreground">People Helped</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-success flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" />
                    {volunteer.rating || '5.0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{avgPointsPerSession}</p>
                  <p className="text-xs text-muted-foreground">Avg Pts/Session</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-info">{earnedBadges.length}/{BADGES.length}</p>
                  <p className="text-xs text-muted-foreground">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MILESTONES.map((milestone) => {
                  const achieved = currentPoints >= milestone.points;
                  const MilestoneIcon = milestone.icon;
                  return (
                    <div
                      key={milestone.points}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        achieved 
                          ? 'bg-success/5 border-success/20' 
                          : 'bg-muted/30 border-muted opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achieved ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        <MilestoneIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.reward}</p>
                        <p className="text-xs text-muted-foreground">{milestone.points} points</p>
                      </div>
                      {achieved && (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          ✓ Achieved
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Points Earning Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-warning" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Complete a help session</span>
                  <Badge variant="secondary">+50 base</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Respond within 5 mins</span>
                  <Badge variant="secondary">+50 bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Respond within 10 mins</span>
                  <Badge variant="secondary">+30 bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Travel 5+ km to help</span>
                  <Badge variant="secondary">+30 bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Travel 2+ km to help</span>
                  <Badge variant="secondary">+20 bonus</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-warning" />
                All Badges ({earnedBadges.length}/{BADGES.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGES.map((badge) => {
                  const isEarned = earnedBadges.some(b => b?.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isEarned 
                          ? 'bg-primary/5 border-primary/20 shadow-sm' 
                          : 'bg-muted/30 border-muted opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-primary mt-1 font-medium">
                            {isEarned ? '✓ Earned' : `Requirement: ${badge.requirement}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Points History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : rewardHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No rewards yet</p>
                  <p className="text-xs mt-1">Complete help sessions to earn points!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {rewardHistory.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{reward.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reward.created_at), { addSuffix: true })}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerRewards;
