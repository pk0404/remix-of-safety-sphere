/**
 * SafetyAnalyticsDashboard Component
 * ====================================
 * Comprehensive analytics dashboard showing safety metrics, trends, and AI insights.
 * 
 * Features:
 * - Safety score with visual gauge
 * - Weekly activity chart
 * - Trend analysis
 * - AI-generated insights
 * - Event tracking statistics
 * 
 * Developer Notes:
 * - Uses Recharts for data visualization
 * - Safety score calculated from multiple factors
 * - Insights generated based on user patterns
 */

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Video,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSafetyAnalytics } from '@/hooks/useSafetyAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/**
 * Get color class based on safety score
 */
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

/**
 * Get background gradient based on score
 */
const getScoreGradient = (score: number): string => {
  if (score >= 80) return 'from-success/20 to-success/5';
  if (score >= 60) return 'from-warning/20 to-warning/5';
  return 'from-destructive/20 to-destructive/5';
};

const SafetyAnalyticsDashboard = () => {
  const { user } = useAuth();
  const {
    loading,
    safetyScore,
    weeklyStats,
    monthlyTrend,
    insights,
    totalStats,
    refreshAnalytics,
  } = useSafetyAnalytics();

  const [showInsights, setShowInsights] = useState(true);

  // Prepare chart data
  const chartData = weeklyStats
    .slice(0, 7)
    .reverse()
    .map((stat) => ({
      day: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
      journeys: stat.journeysCompleted,
      sos: stat.sosCount,
      missed: stat.checkInsMissed,
      score: stat.safetyScore,
    }));

  const trendData = monthlyTrend.map((trend) => ({
    week: trend.period,
    score: trend.score,
    change: trend.change,
  }));

  if (!user) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to view your safety analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Safety Analytics
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshAnalytics}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Safety Score Section */}
        <div
          className={cn(
            'rounded-xl p-6 bg-gradient-to-br',
            getScoreGradient(safetyScore)
          )}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Safety Score</p>
            <div className="relative inline-flex items-center justify-center">
              <div
                className={cn(
                  'text-6xl font-bold',
                  getScoreColor(safetyScore)
                )}
              >
                {safetyScore}
              </div>
              <span className="text-2xl text-muted-foreground ml-1">/100</span>
            </div>
            <Progress
              value={safetyScore}
              className={cn(
                'mt-4 h-3',
                safetyScore >= 80 && '[&>div]:bg-success',
                safetyScore >= 60 && safetyScore < 80 && '[&>div]:bg-warning',
                safetyScore < 60 && '[&>div]:bg-destructive'
              )}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {safetyScore >= 80
                ? '🛡️ Excellent! You\'re maintaining great safety habits.'
                : safetyScore >= 60
                ? '⚡ Good, but there\'s room for improvement.'
                : '⚠️ Consider using more safety features.'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold">{totalStats.totalSOS}</p>
            <p className="text-xs text-muted-foreground">SOS Alerts</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalStats.totalJourneys}</p>
            <p className="text-xs text-muted-foreground">Journeys</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Video className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalStats.totalEvidence}</p>
            <p className="text-xs text-muted-foreground">Evidence</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold">{totalStats.streakDays}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Weekly Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="journeys" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Safety Score Trend</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {trendData.length >= 2 && (
              <Badge
                variant={trendData[trendData.length - 1].change >= 0 ? 'default' : 'destructive'}
                className="gap-1"
              >
                {trendData[trendData.length - 1].change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trendData[trendData.length - 1].change)}% this week
              </Badge>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <Collapsible open={showInsights} onOpenChange={setShowInsights}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                AI Insights ({insights.length})
              </span>
              {showInsights ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {insights.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">
                Keep using the app to generate personalized insights
              </p>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border',
                    insight.type === 'positive' && 'bg-success/5 border-success/20',
                    insight.type === 'warning' && 'bg-warning/5 border-warning/20',
                    insight.type === 'suggestion' && 'bg-primary/5 border-primary/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {insight.type === 'positive' && (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-success shrink-0" />
                    )}
                    {insight.type === 'warning' && (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                    )}
                    {insight.type === 'suggestion' && (
                      <Lightbulb className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SafetyAnalyticsDashboard;
