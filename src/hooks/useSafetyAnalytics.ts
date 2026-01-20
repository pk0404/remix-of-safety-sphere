/**
 * useSafetyAnalytics Hook
 * ========================
 * Provides comprehensive safety analytics and insights for the user.
 * 
 * Features:
 * - Track safety-related events (SOS, journeys, check-ins, etc.)
 * - Calculate safety scores and trends
 * - Generate AI-powered insights
 * - Provide historical data for visualization
 * 
 * Developer Notes:
 * - Analytics are stored in the safety_analytics table
 * - Scores are calculated based on multiple factors
 * - Data is aggregated for different time periods
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for analytics data
interface AnalyticMetric {
  id: string;
  metric_type: 'sos_triggered' | 'journey_completed' | 'check_in_missed' | 'location_shared' | 'evidence_recorded';
  metric_value: number;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

interface DailyStats {
  date: string;
  sosCount: number;
  journeysCompleted: number;
  checkInsMissed: number;
  locationsShared: number;
  evidenceRecorded: number;
  safetyScore: number;
}

interface SafetyTrend {
  period: string;
  score: number;
  change: number; // Percentage change from previous period
}

interface AIInsight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface UseSafetyAnalyticsReturn {
  loading: boolean;
  safetyScore: number;
  weeklyStats: DailyStats[];
  monthlyTrend: SafetyTrend[];
  insights: AIInsight[];
  totalStats: {
    totalSOS: number;
    totalJourneys: number;
    totalCheckIns: number;
    totalEvidence: number;
    streakDays: number;
  };
  recordEvent: (
    eventType: AnalyticMetric['metric_type'],
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  generateAIInsights: () => Promise<void>;
}

/**
 * Calculate safety score based on user activity
 * Score ranges from 0-100
 */
const calculateSafetyScore = (stats: DailyStats[]): number => {
  if (stats.length === 0) return 75; // Default score for new users

  const recentStats = stats.slice(0, 7); // Last 7 days
  let score = 100;

  // Deductions
  const totalSOS = recentStats.reduce((sum, s) => sum + s.sosCount, 0);
  const totalMissedCheckIns = recentStats.reduce((sum, s) => sum + s.checkInsMissed, 0);

  score -= totalSOS * 15; // -15 for each SOS
  score -= totalMissedCheckIns * 5; // -5 for each missed check-in

  // Bonuses
  const totalJourneys = recentStats.reduce((sum, s) => sum + s.journeysCompleted, 0);
  const totalShares = recentStats.reduce((sum, s) => sum + s.locationsShared, 0);

  score += Math.min(totalJourneys * 2, 10); // +2 per journey, max +10
  score += Math.min(totalShares * 1, 5); // +1 per share, max +5

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const useSafetyAnalytics = (): UseSafetyAnalyticsReturn => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticMetric[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<SafetyTrend[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [safetyScore, setSafetyScore] = useState(75);
  const [totalStats, setTotalStats] = useState({
    totalSOS: 0,
    totalJourneys: 0,
    totalCheckIns: 0,
    totalEvidence: 0,
    streakDays: 0,
  });

  /**
   * Fetch analytics data from database
   */
  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all analytics for this user (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('safety_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      const typedMetrics: AnalyticMetric[] = (data || []).map((item) => ({
        id: item.id,
        metric_type: item.metric_type as AnalyticMetric['metric_type'],
        metric_value: item.metric_value || 1,
        metadata: item.metadata as Record<string, unknown> | null,
        recorded_at: item.recorded_at,
      }));

      setMetrics(typedMetrics);

      // Process into daily stats
      const dailyStatsMap = new Map<string, DailyStats>();
      const now = new Date();

      // Initialize last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyStatsMap.set(dateStr, {
          date: dateStr,
          sosCount: 0,
          journeysCompleted: 0,
          checkInsMissed: 0,
          locationsShared: 0,
          evidenceRecorded: 0,
          safetyScore: 0,
        });
      }

      // Aggregate metrics by day
      typedMetrics.forEach((metric) => {
        const dateStr = metric.recorded_at.split('T')[0];
        const stats = dailyStatsMap.get(dateStr);
        if (stats) {
          switch (metric.metric_type) {
            case 'sos_triggered':
              stats.sosCount += metric.metric_value;
              break;
            case 'journey_completed':
              stats.journeysCompleted += metric.metric_value;
              break;
            case 'check_in_missed':
              stats.checkInsMissed += metric.metric_value;
              break;
            case 'location_shared':
              stats.locationsShared += metric.metric_value;
              break;
            case 'evidence_recorded':
              stats.evidenceRecorded += metric.metric_value;
              break;
          }
        }
      });

      const statsArray = Array.from(dailyStatsMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate safety score for each day
      statsArray.forEach((stats, index) => {
        const recentStats = statsArray.slice(index, index + 7);
        stats.safetyScore = calculateSafetyScore(recentStats);
      });

      setWeeklyStats(statsArray);

      // Calculate overall safety score
      const overallScore = calculateSafetyScore(statsArray);
      setSafetyScore(overallScore);

      // Calculate totals
      const totals = typedMetrics.reduce(
        (acc, metric) => {
          switch (metric.metric_type) {
            case 'sos_triggered':
              acc.totalSOS += metric.metric_value;
              break;
            case 'journey_completed':
              acc.totalJourneys += metric.metric_value;
              break;
            case 'check_in_missed':
              // Note: We track check-in misses, not successful ones
              break;
            case 'evidence_recorded':
              acc.totalEvidence += metric.metric_value;
              break;
          }
          return acc;
        },
        { totalSOS: 0, totalJourneys: 0, totalCheckIns: 0, totalEvidence: 0, streakDays: 0 }
      );

      // Calculate streak (days without missed check-ins)
      let streak = 0;
      for (const stats of statsArray) {
        if (stats.checkInsMissed === 0) {
          streak++;
        } else {
          break;
        }
      }
      totals.streakDays = streak;

      setTotalStats(totals);

      // Calculate monthly trend
      const trends: SafetyTrend[] = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const weekStats = statsArray.filter((s) => {
          const date = new Date(s.date);
          return date >= weekStart && date < weekEnd;
        });

        const weekScore = calculateSafetyScore(weekStats);
        const prevScore = trends.length > 0 ? trends[trends.length - 1].score : weekScore;
        const change = prevScore !== 0 ? ((weekScore - prevScore) / prevScore) * 100 : 0;

        trends.push({
          period: `Week ${4 - i}`,
          score: weekScore,
          change: Math.round(change),
        });
      }
      setMonthlyTrend(trends.reverse());

      console.log('[Analytics] Data fetched successfully');
    } catch (error) {
      console.error('[Analytics] Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Record a new analytics event
   */
  const recordEvent = useCallback(
    async (
      eventType: AnalyticMetric['metric_type'],
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      if (!user) {
        console.warn('[Analytics] Cannot record event: user not logged in');
        return;
      }

      try {
        const insertData = {
          user_id: user.id,
          metric_type: eventType,
          metric_value: 1,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        };
        
        const { error } = await supabase.from('safety_analytics').insert(insertData);

        if (error) throw error;

        console.log(`[Analytics] Event recorded: ${eventType}`);
        await fetchAnalytics(); // Refresh data
      } catch (error) {
        console.error('[Analytics] Error recording event:', error);
      }
    },
    [user, fetchAnalytics]
  );

  /**
   * Generate AI-powered insights based on user data
   */
  const generateAIInsights = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // Generate insights based on current stats
      const newInsights: AIInsight[] = [];

      // Check for SOS patterns
      if (totalStats.totalSOS > 0) {
        newInsights.push({
          type: 'warning',
          title: 'Recent Emergency Alerts',
          description: `You've triggered ${totalStats.totalSOS} SOS alerts recently. Consider reviewing your routes and travel times.`,
          priority: 'high',
        });
      }

      // Check for journey patterns
      if (totalStats.totalJourneys >= 5) {
        newInsights.push({
          type: 'positive',
          title: 'Active Traveler',
          description: `Great job tracking ${totalStats.totalJourneys} journeys! This helps keep you safer.`,
          priority: 'low',
        });
      }

      // Check for streak
      if (totalStats.streakDays >= 3) {
        newInsights.push({
          type: 'positive',
          title: `${totalStats.streakDays} Day Streak!`,
          description: 'You\'ve maintained consistent check-ins. Keep it up!',
          priority: 'low',
        });
      }

      // Safety score suggestions
      if (safetyScore < 70) {
        newInsights.push({
          type: 'suggestion',
          title: 'Improve Your Safety Score',
          description: 'Try using journey tracking more often and completing regular check-ins.',
          priority: 'medium',
        });
      }

      // Evidence recording suggestion
      if (totalStats.totalEvidence === 0) {
        newInsights.push({
          type: 'suggestion',
          title: 'Record Evidence',
          description: 'Use the audio/video recorder to document situations. This can be crucial in emergencies.',
          priority: 'medium',
        });
      }

      setInsights(newInsights);
      console.log('[Analytics] AI insights generated');
    } catch (error) {
      console.error('[Analytics] Error generating insights:', error);
    }
  }, [user, totalStats, safetyScore]);

  // Generate insights when data changes
  useEffect(() => {
    if (!loading && user) {
      generateAIInsights();
    }
  }, [loading, user, generateAIInsights]);

  return {
    loading,
    safetyScore,
    weeklyStats,
    monthlyTrend,
    insights,
    totalStats,
    recordEvent,
    refreshAnalytics: fetchAnalytics,
    generateAIInsights,
  };
};

export default useSafetyAnalytics;
