import { useState } from 'react';
import { Settings, MapPin, Bell, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useVolunteers } from '@/hooks/useVolunteers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HelperSettings = () => {
  const { volunteer } = useVolunteers();
  const [radius, setRadius] = useState(volunteer?.notification_radius_km || 5);
  const [autoLocation, setAutoLocation] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!volunteer) return null;

  const handleRadiusChange = async (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ notification_radius_km: newRadius })
        .eq('id', volunteer.id);
      if (error) throw error;
      toast.success(`Notification radius updated to ${newRadius} km`);
    } catch {
      toast.error('Failed to update radius');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-primary" />
          Helper Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Notification Radius */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notification Radius</span>
            </div>
            <Badge variant="secondary">{radius} km</Badge>
          </div>
          <Slider
            value={[radius]}
            onValueChange={handleRadiusChange}
            min={1}
            max={25}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            You'll receive alerts for help requests within {radius} km of your location
          </p>
        </div>

        {/* Auto Location */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Auto-Update Location</p>
              <p className="text-xs text-muted-foreground">Automatically share location when online</p>
            </div>
          </div>
          <Switch checked={autoLocation} onCheckedChange={setAutoLocation} />
        </div>

        {/* Alert Notifications */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sound Alerts</p>
              <p className="text-xs text-muted-foreground">Play sound for new help requests</p>
            </div>
          </div>
          <Switch checked={true} />
        </div>

        {/* Community Impact */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Your Impact</p>
          <p className="text-sm">
            You've helped <strong className="text-primary">{volunteer.total_responses || 0}</strong> people
            and earned <strong className="text-primary">{volunteer.reward_points || 0}</strong> points.
            {(volunteer.total_responses || 0) >= 10 ? ' You\'re a Super Helper! 🦸' :
             (volunteer.total_responses || 0) >= 5 ? ' Great work! Keep going! 💪' :
             ' Start accepting requests to make an impact!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelperSettings;
