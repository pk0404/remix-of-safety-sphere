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

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRoleState(null);
      return;
    }

    try {
      // Query from the secure user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setRoleState((data?.role as UserRole) || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRoleState(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const setRole = async (newRole: UserRole): Promise<boolean> => {
    if (!user) return false;

    try {
      // Upsert into user_roles table
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
      return true;
    } catch (error) {
      console.error('Error setting user role:', error);
      return false;
    }
  };

  return {
    role,
    loading,
    setRole,
    hasRole: role !== null,
  };
};

export default useUserRole;
