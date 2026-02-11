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
  MessageSquare,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Location {
  latitude: number;
  longitude: number;
}

interface CheckInSystemProps {
  location: Location | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LATE_REASONS = [
  'I was busy and forgot',
  'My phone was on silent',
  'I was driving',
  'I was in a meeting',
  'I fell asleep',
  'I didn\'t have signal',
  'Other reason',
];

const CheckInSystem = ({ location }: CheckInSystemProps) => {
  const { user } = useAuth();
  const { contacts } = useEmergencyContacts();
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
    selectedContacts,
    setSelectedContacts,
  } = useCheckIn(location);

  const [selectedInterval, setSelectedInterval] = useState('30');
  const [showHistory, setShowHistory] = useState(false);
  const [showLateDialog, setShowLateDialog] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showContactSelector, setShowContactSelector] = useState(false);

  const totalSeconds = settings.intervalMinutes * 60;
  const progressPercent =
    timeUntilNextCheckIn !== null
      ? ((totalSeconds - timeUntilNextCheckIn) / totalSeconds) * 100
      : 0;

  const getUrgencyLevel = (): 'safe' | 'warning' | 'danger' => {
    if (timeUntilNextCheckIn === null) return 'safe';
    if (timeUntilNextCheckIn <= 60) return 'danger';
    if (timeUntilNextCheckIn <= 180) return 'warning';
    return 'safe';
  };

  const urgency = getUrgencyLevel();

  const handleCheckInWithReason = () => {
    if (missedCount > 0) {
      setShowLateDialog(true);
    } else {
      performCheckIn();
    }
  };

  const handleSubmitLateCheckIn = () => {
    const reason = lateReason === 'Other reason' ? customReason : lateReason;
    performCheckIn(undefined, reason || 'Late check-in - no reason provided');
    setShowLateDialog(false);
    setLateReason('');
    setCustomReason('');
  };

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
    <>
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
              <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Check-In History</DialogTitle>
                    <DialogDescription>Your recent safety check-ins</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    {checkInHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No check-ins yet</p>
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
                                  {checkIn.status === 'active' && <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />}
                                  {checkIn.status === 'missed' && <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />}
                                  {checkIn.status === 'alerted' && <Phone className="w-5 h-5 text-destructive mt-0.5" />}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-lg font-bold">
                                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {checkIn.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">{checkIn.notes}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={checkIn.status === 'active' ? 'default' : checkIn.status === 'missed' ? 'secondary' : 'destructive'}
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

              {isActive && (
                <Badge variant={missedCount > 0 ? 'destructive' : 'default'} className="animate-pulse">
                  {missedCount > 0 ? `${missedCount} Missed` : 'Active'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isActive ? (
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

              {/* Emergency Contact Selector */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowContactSelector(true)}
                >
                  <Users className="w-4 h-4" />
                  Select Emergency Contacts ({selectedContacts.length} selected)
                </Button>
              </div>

              {/* Start Button */}
              <Button
                onClick={() => startCheckInSession(parseInt(selectedInterval))}
                disabled={loading || contacts.length === 0}
                className="w-full gap-2"
              >
                <Play className="w-4 h-4" />
                Start Safety Session
              </Button>
              {contacts.length === 0 && (
                <p className="text-xs text-destructive text-center">
                  Please add emergency contacts first
                </p>
              )}
            </div>
          ) : (
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
                  {timeUntilNextCheckIn !== null ? formatTime(timeUntilNextCheckIn) : '--:--'}
                </div>
                <p className="text-sm text-muted-foreground mt-2">until next check-in required</p>
              </div>

              <Progress
                value={progressPercent}
                className={cn(
                  'h-2',
                  urgency === 'danger' && '[&>div]:bg-destructive',
                  urgency === 'warning' && '[&>div]:bg-warning'
                )}
              />

              {/* Escalation Warning Messages */}
              {missedCount > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">
                      {missedCount} missed check-in{missedCount > 1 ? 's' : ''}!
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {missedCount === 1 && '⏰ Are you okay? Please check in to confirm you are safe.'}
                    {missedCount === 2 && '⚠️ Emergency email will be sent to your contacts if you don\'t check in!'}
                    {missedCount >= 3 && '🚨 Emergency contacts have been notified! Police will be alerted with your live location.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCheckInWithReason}
                  disabled={loading}
                  className="flex-1 gap-2"
                  variant={urgency === 'danger' ? 'destructive' : 'default'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I'm Safe
                </Button>
                <Button onClick={stopCheckInSession} variant="outline" className="gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </div>

              {lastCheckIn && (
                <p className="text-xs text-center text-muted-foreground">
                  Last check-in: {formatDate(lastCheckIn.checked_in_at)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Late Check-In Dialog - Conversational */}
      <Dialog open={showLateDialog} onOpenChange={setShowLateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Welcome back! Are you okay?
            </DialogTitle>
            <DialogDescription>
              We noticed you missed {missedCount} check-in{missedCount > 1 ? 's' : ''}. 
              We're glad you're safe! Could you let us know what happened?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium">What happened?</p>
            <div className="grid grid-cols-1 gap-2">
              {LATE_REASONS.map((reason) => (
                <Button
                  key={reason}
                  variant={lateReason === reason ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start text-left h-auto py-2.5"
                  onClick={() => setLateReason(reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>

            {lateReason === 'Other reason' && (
              <Textarea
                placeholder="Tell us what happened..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowLateDialog(false);
              performCheckIn(undefined, 'Late check-in');
            }}>
              Skip & Check In
            </Button>
            <Button
              onClick={handleSubmitLateCheckIn}
              disabled={!lateReason}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              I'm Safe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Selector Dialog */}
      <Dialog open={showContactSelector} onOpenChange={setShowContactSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Emergency Contacts</DialogTitle>
            <DialogDescription>
              Choose which contacts should be notified when you miss check-ins
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No emergency contacts added yet. Add contacts first.
              </p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact.id]);
                      } else {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    {contact.email && (
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContactSelector(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInSystem;
