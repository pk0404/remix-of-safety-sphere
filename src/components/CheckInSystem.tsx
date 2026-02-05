/**
 * CheckInSystem Component
 * ========================
 * The "proof of life" attendance check-in system that monitors user safety.
 * 
 * Features:
 * - Start/stop check-in sessions
 * - Configurable check-in intervals
 * - Visual countdown timer
 * - Check-in history
 * - Emergency escalation on missed check-ins
 * 
 * Developer Notes:
 * - Escalation levels: Reminder → Warning → Alert → Emergency Call
 * - Uses the useCheckIn hook for all logic
 * - Integrates with emergency contacts for escalation
 */

import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  History,
  Settings,
  Heart,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Location {
  latitude: number;
  longitude: number;
}

interface CheckInSystemProps {
  location: Location | null;
}

/**
 * Format seconds into MM:SS display
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CheckInSystem = ({ location }: CheckInSystemProps) => {
  const { user } = useAuth();
  const {
    isActive,
    nextCheckInDue,
    missedCount,
    lastCheckIn,
    checkInHistory,
    loading,
    settings,
    startCheckInSession,
    performCheckIn,
    stopCheckInSession,
    updateSettings,
    timeUntilNextCheckIn,
  } = useCheckIn(location);

  const [selectedInterval, setSelectedInterval] = useState('30');
  const [showHistory, setShowHistory] = useState(false);

  // Calculate progress percentage
  const totalSeconds = settings.intervalMinutes * 60;
  const progressPercent =
    timeUntilNextCheckIn !== null
      ? ((totalSeconds - timeUntilNextCheckIn) / totalSeconds) * 100
      : 0;

  // Determine urgency level based on time remaining
  const getUrgencyLevel = (): 'safe' | 'warning' | 'danger' => {
    if (timeUntilNextCheckIn === null) return 'safe';
    if (timeUntilNextCheckIn <= 60) return 'danger';
    if (timeUntilNextCheckIn <= 180) return 'warning';
    return 'safe';
  };

  const urgency = getUrgencyLevel();

  if (!user) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="py-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to use safety check-ins</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border shadow-card transition-colors duration-300',
        isActive && urgency === 'danger' && 'border-destructive bg-destructive/5',
        isActive && urgency === 'warning' && 'border-warning bg-warning/5',
        !isActive && 'border-border'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-primary" />
            Safety Check-In
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* History Button */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Check-In History</DialogTitle>
                  <DialogDescription>
                    Your recent safety check-ins
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  {checkInHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No check-ins yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {checkInHistory.map((checkIn) => {
                        const date = new Date(checkIn.checked_in_at);
                        return (
                          <div
                            key={checkIn.id}
                            className={cn(
                              'p-4 rounded-lg border',
                              checkIn.status === 'active' && 'bg-success/5 border-success/20',
                              checkIn.status === 'missed' && 'bg-warning/5 border-warning/20',
                              checkIn.status === 'alerted' && 'bg-destructive/5 border-destructive/20'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {checkIn.status === 'active' && (
                                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                                )}
                                {checkIn.status === 'missed' && (
                                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                                )}
                                {checkIn.status === 'alerted' && (
                                  <Phone className="w-5 h-5 text-destructive mt-0.5" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {date.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-lg font-bold">
                                    {date.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                  {checkIn.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {checkIn.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  checkIn.status === 'active'
                                    ? 'default'
                                    : checkIn.status === 'missed'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="text-xs"
                              >
                                {checkIn.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            {/* Status Badge */}
            {isActive && (
              <Badge
                variant={missedCount > 0 ? 'destructive' : 'default'}
                className="animate-pulse"
              >
                {missedCount > 0 ? `${missedCount} Missed` : 'Active'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isActive ? (
          // Start Session View
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable periodic check-ins to let your contacts know you're safe. 
              If you miss check-ins, your emergency contacts will be alerted.
            </p>

            {/* Interval Selection */}
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Check-in every:</span>
              <Select
                value={selectedInterval}
                onValueChange={(value) => {
                  setSelectedInterval(value);
                  updateSettings({ intervalMinutes: parseInt(value) });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Button */}
            <Button
              onClick={() => startCheckInSession(parseInt(selectedInterval))}
              disabled={loading}
              className="w-full gap-2"
            >
              <Play className="w-4 h-4" />
              Start Safety Session
            </Button>
          </div>
        ) : (
          // Active Session View
          <div className="space-y-4">
            {/* Timer Display */}
            <div className="text-center py-4">
              <div
                className={cn(
                  'text-5xl font-bold font-mono',
                  urgency === 'danger' && 'text-destructive animate-pulse',
                  urgency === 'warning' && 'text-warning',
                  urgency === 'safe' && 'text-foreground'
                )}
              >
                {timeUntilNextCheckIn !== null
                  ? formatTime(timeUntilNextCheckIn)
                  : '--:--'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                until next check-in required
              </p>
            </div>

            {/* Progress Bar */}
            <Progress
              value={progressPercent}
              className={cn(
                'h-2',
                urgency === 'danger' && '[&>div]:bg-destructive',
                urgency === 'warning' && '[&>div]:bg-warning'
              )}
            />

            {/* Missed Check-in Warning */}
            {missedCount > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">
                    {missedCount} missed check-in{missedCount > 1 ? 's' : ''}!
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {missedCount >= 3
                    ? 'Emergency contacts will be notified soon!'
                    : 'Please check in to confirm you are safe.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => performCheckIn()}
                disabled={loading}
                className="flex-1 gap-2"
                variant={urgency === 'danger' ? 'destructive' : 'default'}
              >
                <CheckCircle2 className="w-4 h-4" />
                I'm Safe
              </Button>
              <Button
                onClick={stopCheckInSession}
                variant="outline"
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>

            {/* Last Check-in Info */}
            {lastCheckIn && (
              <p className="text-xs text-center text-muted-foreground">
                Last check-in: {formatDate(lastCheckIn.checked_in_at)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckInSystem;
