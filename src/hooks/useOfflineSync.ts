/**
 * useOfflineSync Hook
 * ====================
 * Manages offline data synchronization with IndexedDB for local storage
 * and syncs with Supabase when online.
 * 
 * Features:
 * - Detects online/offline status
 * - Queues actions when offline
 * - Syncs automatically when connection restored
 * - Provides offline-first data access
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// IndexedDB Database Name and Version
const DB_NAME = 'SafeGuardOfflineDB';
const DB_VERSION = 1;

// Store names for different data types
const STORES = {
  SYNC_QUEUE: 'syncQueue',
  CONTACTS: 'contacts',
  INCIDENTS: 'incidents',
  CHECK_INS: 'checkIns',
  SETTINGS: 'settings',
} as const;

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  syncNow: () => Promise<void>;
  queueAction: (action: SyncQueueItem) => Promise<void>;
  getOfflineData: <T>(storeName: string) => Promise<T[]>;
  saveOfflineData: <T extends Record<string, unknown>>(storeName: string, data: T[]) => Promise<void>;
}

/**
 * Opens IndexedDB database with all required object stores
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  /**
   * Update online status and trigger sync when coming online
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', { description: 'Syncing offline changes...' });
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline', { description: 'Changes will sync when connected' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Count pending changes in sync queue
   */
  const countPendingChanges = useCallback(async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        setPendingChanges(countRequest.result);
      };
    } catch (error) {
      console.error('Error counting pending changes:', error);
    }
  }, []);

  useEffect(() => {
    countPendingChanges();
  }, [countPendingChanges]);

  /**
   * Queue an action for later sync
   */
  const queueAction = useCallback(async (item: SyncQueueItem): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      await new Promise<void>((resolve, reject) => {
        const request = store.add(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await countPendingChanges();
      console.log('[OfflineSync] Action queued:', item.action, item.table);
    } catch (error) {
      console.error('[OfflineSync] Error queuing action:', error);
      throw error;
    }
  }, [countPendingChanges]);

  /**
   * Get all data from an offline store
   */
  const getOfflineData = useCallback(async <T>(storeName: string): Promise<T[]> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[OfflineSync] Error getting offline data:', error);
      return [];
    }
  }, []);

  /**
   * Save data to an offline store
   */
  const saveOfflineData = useCallback(async <T extends Record<string, unknown>>(
    storeName: string, 
    data: T[]
  ): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      // Clear existing data and add new data
      store.clear();
      data.forEach((item) => store.add(item));

      console.log(`[OfflineSync] Saved ${data.length} items to ${storeName}`);
    } catch (error) {
      console.error('[OfflineSync] Error saving offline data:', error);
      throw error;
    }
  }, []);

  /**
   * Sync all queued actions with Supabase
   */
  const syncNow = useCallback(async (): Promise<void> => {
    if (!isOnline || !user || isSyncing) return;

    setIsSyncing(true);
    console.log('[OfflineSync] Starting sync...');

    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      const items = await new Promise<SyncQueueItem[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      let syncedCount = 0;

      for (const item of items) {
        try {
          // Execute the queued action against Supabase
          // Note: Using any type here because table names are dynamic
          const table = item.table as 'check_ins' | 'incidents' | 'emergency_contacts';
          switch (item.action) {
            case 'create':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await supabase.from(table).insert(item.data as any);
              break;
            case 'update':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await supabase
                .from(table)
                .update(item.data as any)
                .eq('id', item.data.id as string);
              break;
            case 'delete':
              await supabase
                .from(table)
                .delete()
                .eq('id', item.data.id as string);
              break;
          }

          // Remove synced item from queue
          store.delete(item.id);
          syncedCount++;
        } catch (error) {
          console.error('[OfflineSync] Error syncing item:', error);
        }
      }

      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} offline changes`);
      }

      await countPendingChanges();
      console.log('[OfflineSync] Sync complete');
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      toast.error('Failed to sync offline changes');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, user, isSyncing, countPendingChanges]);

  return {
    isOnline,
    isSyncing,
    pendingChanges,
    syncNow,
    queueAction,
    getOfflineData,
    saveOfflineData,
  };
};

export default useOfflineSync;
