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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  { name: 'bronze', minPoints: 0, maxPoints: 200, icon: Medal, color: 'text-amber-600' },
  { name: 'silver', minPoints: 200, maxPoints: 500, icon: Star, color: 'text-gray-400' },
  { name: 'gold', minPoints: 500, maxPoints: 1000, icon: Trophy, color: 'text-yellow-500' },
  { name: 'platinum', minPoints: 1000, maxPoints: 2000, icon: Crown, color: 'text-purple-500' },
  { name: 'diamond', minPoints: 2000, maxPoints: Infinity, icon: Sparkles, color: 'text-blue-400' },
];

const BADGES = [
  { id: 'first_help', name: 'First Helper', description: 'Completed first help session', icon: '🎉' },
  { id: 'fast_responder', name: 'Fast Responder', description: 'Responded within 5 minutes', icon: '⚡' },
  { id: 'super_helper', name: 'Super Helper', description: '10 successful help sessions', icon: '🦸' },
  { id: 'guardian', name: 'Guardian', description: '25 successful help sessions', icon: '🛡️' },
  { id: 'hero', name: 'Community Hero', description: '50 successful help sessions', icon: '🏆' },
  { id: 'five_star', name: '5-Star Volunteer', description: 'Maintained 5-star rating', icon: '⭐' },
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
          .limit(20);

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

  return (
    <div className="space-y-6">
      {/* Points & Level Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Rewards & Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${currentLevel.color}`}>
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
                <span className="font-medium">{nextLevel.minPoints - currentPoints} points needed</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-success" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{volunteer.total_responses}</p>
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
              <p className="text-2xl font-bold text-warning">{earnedBadges.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="w-5 h-5 text-warning" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const isEarned = earnedBadges.some(b => b?.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isEarned 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-muted opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Recent Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : rewardHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No rewards yet</p>
              <p className="text-xs">Complete help sessions to earn points!</p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {rewardHistory.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{reward.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reward.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      +{reward.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerRewards;
