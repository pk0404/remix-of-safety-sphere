import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'helper';

interface UseUserRoleReturn {
  role: UserRole | null;
  loading: boolean;
  setRole: (role: UserRole) => Promise<boolean>;
  hasRole: boolean;
}

const ROLE_CACHE_KEY = 'safeher_role_cache';

const getCachedRole = (userId: string): UserRole | null => {
  try {
    const cached = sessionStorage.getItem(ROLE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.userId === userId && parsed.role) {
        return parsed.role as UserRole;
      }
    }
  } catch {}
  return null;
};

const setCachedRole = (userId: string, role: UserRole | null) => {
  try {
    if (role) {
      sessionStorage.setItem(ROLE_CACHE_KEY, JSON.stringify({ userId, role }));
    } else {
      sessionStorage.removeItem(ROLE_CACHE_KEY);
    }
  } catch {}
};

export const useUserRole = (): UseUserRoleReturn => {
  const { user, loading: authLoading } = useAuth();
  
  // Initialize from cache immediately to prevent flash
  const [role, setRoleState] = useState<UserRole | null>(() => {
    if (user?.id) return getCachedRole(user.id);
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRoleState(null);
      setLoading(false);
      setFetched(true);
      return;
    }

    // If we have a cached role, set loading false immediately
    const cached = getCachedRole(user.id);
    if (cached) {
      setRoleState(cached);
      setLoading(false);
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      const fetchedRole = (data?.role as UserRole) || null;
      setRoleState(fetchedRole);
      setCachedRole(user.id, fetchedRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Keep cached role if fetch fails
      if (!cached) setRoleState(null);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchRole();
    }
  }, [fetchRole, authLoading]);

  const setRole = async (newRole: UserRole): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role: newRole,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;
      setRoleState(newRole);
      setCachedRole(user.id, newRole);
      return true;
    } catch (error) {
      console.error('Error setting user role:', error);
      return false;
    }
  };

  return {
    role,
    loading: authLoading || loading,
    setRole,
    hasRole: role !== null,
  };
};

export default useUserRole;
