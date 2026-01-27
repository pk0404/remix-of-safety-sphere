import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Bell,
  Loader2,
  Shield,
  Heart,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useVolunteers } from '@/hooks/useVolunteers';
import { useAuth } from '@/contexts/AuthContext';
import useGeolocation from '@/hooks/useGeolocation';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  notification_radius_km: z.number().min(1).max(50),
});

type FormData = z.infer<typeof formSchema>;

interface VolunteerRegistrationProps {
  onSuccess?: () => void;
}

const VolunteerRegistration = ({ onSuccess }: VolunteerRegistrationProps) => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { registerAsVolunteer } = useVolunteers();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: user?.email || '',
      notification_radius_km: 5,
    },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const success = await registerAsVolunteer({
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      notification_radius_km: data.notification_radius_km,
      location_lat: location?.latitude,
      location_lng: location?.longitude,
    });
    setSubmitting(false);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  if (!user) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please sign in to register as a volunteer</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Become a Volunteer
        </CardTitle>
        <CardDescription>
          Join our community of volunteers helping women stay safe
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-primary/5 rounded-xl text-center">
            <Bell className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Real-time Alerts</p>
            <p className="text-xs text-muted-foreground">Get notified when help is needed</p>
          </div>
          <div className="p-4 bg-success/5 rounded-xl text-center">
            <MapPin className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">Location-based</p>
            <p className="text-xs text-muted-foreground">Help people in your area</p>
          </div>
          <div className="p-4 bg-warning/5 rounded-xl text-center">
            <Users className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-sm font-medium">Make Impact</p>
            <p className="text-xs text-muted-foreground">Be part of the safety network</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your full name"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your phone number"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your email"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notification_radius_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notification Radius: {field.value} km
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    You'll receive alerts for support requests within this radius
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {location && (
              <div className="p-3 bg-success/10 rounded-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-success" />
                <span className="text-sm text-success">
                  Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Register as Volunteer
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VolunteerRegistration;
