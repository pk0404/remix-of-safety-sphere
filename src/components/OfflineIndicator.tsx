/**
 * OfflineIndicator Component
 * ===========================
 * Displays the current online/offline status and pending sync changes.
 * 
 * Features:
 * - Visual indicator of connection status
 * - Shows number of pending changes
 * - Manual sync button
 * - Animated transitions
 */

import { WifiOff, Wifi, RefreshCw, CloudOff, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingChanges, syncNow } = useOfflineSync();

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300',
        isOnline 
          ? 'bg-success/10 border border-success/20' 
          : 'bg-destructive/10 border border-destructive/20'
      )}
    >
      {/* Connection Status Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isOnline ? 'bg-success/20' : 'bg-destructive/20'
        )}
      >
        {isOnline ? (
          <Cloud className="w-5 h-5 text-success" />
        ) : (
          <CloudOff className="w-5 h-5 text-destructive" />
        )}
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-semibold',
            isOnline ? 'text-success' : 'text-destructive'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {pendingChanges > 0 && (
          <span className="text-xs text-muted-foreground">
            {pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'}
          </span>
        )}
      </div>

      {/* Pending Changes Badge */}
      {pendingChanges > 0 && (
        <Badge variant="secondary" className="ml-2">
          {pendingChanges}
        </Badge>
      )}

      {/* Sync Button */}
      {isOnline && pendingChanges > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncNow}
          disabled={isSyncing}
          className="ml-2"
        >
          <RefreshCw
            className={cn('w-4 h-4', isSyncing && 'animate-spin')}
          />
        </Button>
      )}
    </div>
  );
};

export default OfflineIndicator;
