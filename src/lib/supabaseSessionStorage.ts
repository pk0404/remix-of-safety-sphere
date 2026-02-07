/**
 * Custom SessionStorage adapter for Supabase
 * ============================================
 * Uses sessionStorage instead of localStorage to allow
 * different browser tabs to have different login sessions.
 * 
 * This is critical for testing multiple roles (user/helper) simultaneously.
 */

export const supabaseSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};
