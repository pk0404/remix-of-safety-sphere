import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface Analytics {
  totalVolunteers: number;
  activeVolunteers: number;
  totalRequests: number;
  pendingRequests: number;
  resolvedRequests: number;
  averageResponseTime: number;
  requestsByType: { name: string; value: number }[];
  requestsByDay: { day: string; requests: number }[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<any[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch volunteers count
      const { count: totalVolunteers } = await supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true });

      const { count: activeVolunteers } = await supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

      // Fetch requests count
      const { count: totalRequests } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true });

      const { count: pendingRequests } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'active']);

      const { count: resolvedRequests } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      // Fetch requests by type
      const { data: requestsData } = await supabase
        .from('support_requests')
        .select('request_type');

      const typeCount: Record<string, number> = {};
      (requestsData || []).forEach((r) => {
        typeCount[r.request_type] = (typeCount[r.request_type] || 0) + 1;
      });

      const requestsByType = Object.entries(typeCount).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      }));

      // Fetch requests by day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: weeklyData } = await supabase
        .from('support_requests')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const dayCount: Record<string, number> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach((day) => (dayCount[day] = 0));

      (weeklyData || []).forEach((r) => {
        const day = days[new Date(r.created_at).getDay()];
        dayCount[day]++;
      });

      const requestsByDay = days.map((day) => ({
        day,
        requests: dayCount[day],
      }));

      // Fetch recent requests
      const { data: recent } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentRequests(recent || []);

      // Fetch recent volunteers
      const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentVolunteers(volunteers || []);

      setAnalytics({
        totalVolunteers: totalVolunteers || 0,
        activeVolunteers: activeVolunteers || 0,
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        resolvedRequests: resolvedRequests || 0,
        averageResponseTime: 120, // Placeholder
        requestsByType,
        requestsByDay,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor volunteer activity and support requests</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volunteers</p>
                <p className="text-3xl font-bold text-primary">{analytics.totalVolunteers}</p>
              </div>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
            <p className="text-xs text-success mt-2">
              {analytics.activeVolunteers} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold text-warning">{analytics.totalRequests}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning/30" />
            </div>
            <p className="text-xs text-warning mt-2">
              {analytics.pendingRequests} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-success">{analytics.resolvedRequests}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.totalRequests > 0 
                ? Math.round((analytics.resolvedRequests / analytics.totalRequests) * 100)
                : 0}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-3xl font-bold text-info">{analytics.averageResponseTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-info/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Day */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Requests This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.requestsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Type */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Requests by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.requestsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.requestsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.requestsByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {analytics.requestsByType.map((type, index) => (
                <Badge key={type.name} variant="outline" className="capitalize">
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {type.name}: {type.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-warning" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No requests yet</p>
                ) : (
                  recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 bg-muted/50 rounded-lg flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {request.request_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {request.urgency}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Volunteers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              Recent Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentVolunteers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No volunteers yet</p>
                ) : (
                  recentVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="p-3 bg-muted/50 rounded-lg flex items-center gap-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          volunteer.is_available ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{volunteer.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {volunteer.total_responses} responses • Joined{' '}
                          {formatDistanceToNow(new Date(volunteer.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {volunteer.notification_radius_km} km
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
