import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Check, Trash2, AlertTriangle, MapPin, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'alert' | 'location' | 'safety' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'safety',
    title: 'Safety Tip',
    message: 'Remember to share your live location when traveling alone at night.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'system',
    title: 'App Update',
    message: 'New shake-to-SOS feature is now available in settings.',
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'location',
    title: 'Location Shared',
    message: 'Your location was shared with Mom successfully.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Emergency Test',
    message: 'You tested the SOS feature. All contacts were notified.',
    time: '3 days ago',
    read: true,
  },
];

const Notifications = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-emergency" />;
      case 'location': return <MapPin className="w-5 h-5 text-warning" />;
      case 'safety': return <Shield className="w-5 h-5 text-success" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({ title: "All notifications cleared" });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-1" />
              Mark read
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main ref={containerRef} className="max-w-2xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 bg-card rounded-xl border shadow-card transition-colors ${
                  notification.read ? 'border-border' : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground text-sm">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length > 0 && (
              <Button variant="outline" className="w-full mt-4" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Notifications
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
