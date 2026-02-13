import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useVolunteers } from '@/hooks/useVolunteers';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  reward_points: number;
  total_responses: number;
  rating: number;
  level: string;
  badges: string[];
}

const LEVEL_ICONS: Record<string, any> = {
  bronze: Medal,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
  diamond: Sparkles,
};

const LEVEL_COLORS: Record<string, string> = {
  bronze: 'text-orange-600',
  silver: 'text-muted-foreground',
  gold: 'text-warning',
  platinum: 'text-primary',
  diamond: 'text-blue-500',
};

const VolunteerLeaderboard = () => {
  const { volunteer } = useVolunteers();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('volunteers')
          .select('id, full_name, reward_points, total_responses, rating, level, badges')
          .eq('is_available', true)
          .order('reward_points', { ascending: false })
          .limit(20);

        if (error) throw error;
        setLeaderboard((data || []).map((v: any) => ({
          id: v.id,
          full_name: v.full_name,
          reward_points: v.reward_points || 0,
          total_responses: v.total_responses || 0,
          rating: v.rating || 5,
          level: v.level || 'bronze',
          badges: v.badges || [],
        })));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-warning/10 border-warning/30';
    if (index === 1) return 'bg-muted/50 border-muted-foreground/20';
    if (index === 2) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30';
    return 'bg-background border-border';
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-warning" />
          Community Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No volunteers on the leaderboard yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const LevelIcon = LEVEL_ICONS[entry.level] || Medal;
                const isCurrentUser = volunteer?.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankStyle(index)} ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}`}
                  >
                    <div className="w-8 text-center font-bold text-lg">
                      {getRankEmoji(index)}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${LEVEL_COLORS[entry.level] || ''}`}>
                      <LevelIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.full_name}
                        {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.total_responses} helped</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-warning" />
                          {Number(entry.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{entry.reward_points}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default VolunteerLeaderboard;
