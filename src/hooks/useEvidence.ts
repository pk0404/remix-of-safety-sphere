import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Evidence {
  id: string;
  user_id: string;
  incident_id: string | null;
  media_type: string;
  file_url: string;
  file_size: number | null;
  latitude: number | null;
  longitude: number | null;
  captured_at: string;
  duration_seconds: number | null;
}

/**
 * Hook for securely accessing evidence files using time-limited signed URLs.
 * 
 * SECURITY: This hook generates signed URLs that expire after 1 hour,
 * preventing permanent URL exposure that could lead to data leaks.
 * Even if a URL is compromised, it will stop working after expiry.
 */
export const useEvidence = () => {
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const { user } = useAuth();

  /**
   * Generate a time-limited signed URL for accessing an evidence file.
   * URLs expire after 1 hour (3600 seconds) for security.
   * 
   * @param filePath - The storage path of the file (stored in file_url column)
   * @returns Signed URL string or null if generation fails
   */
  const getEvidenceUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      // Check if it's already a full URL (legacy data) - extract path if so
      let path = filePath;
      if (filePath.startsWith('http')) {
        // Extract path from legacy full URLs
        const urlParts = filePath.split('/evidence/');
        if (urlParts.length > 1) {
          path = urlParts[1];
        }
      }

      const { data, error } = await supabase.storage
        .from('evidence')
        .createSignedUrl(path, 3600); // 1 hour expiry for security
      
      if (error) {
        console.error('Error generating signed URL:', error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }, []);

  /**
   * Fetch all evidence records for the current user.
   * Note: This returns paths, not URLs. Use getEvidenceUrl() to get viewable URLs.
   */
  const fetchUserEvidence = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      
      setEvidence(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching evidence:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Delete an evidence record and its associated storage file.
   * 
   * @param evidenceId - The ID of the evidence record to delete
   * @param filePath - The storage path of the file to delete
   */
  const deleteEvidence = useCallback(async (evidenceId: string, filePath: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract path from legacy full URLs if needed
      let path = filePath;
      if (filePath.startsWith('http')) {
        const urlParts = filePath.split('/evidence/');
        if (urlParts.length > 1) {
          path = urlParts[1];
        }
      }

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue to delete database record even if storage fails
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('evidence')
        .delete()
        .eq('id', evidenceId)
        .eq('user_id', user.id); // Extra security check

      if (dbError) throw dbError;

      // Update local state
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      
      return true;
    } catch (error) {
      console.error('Error deleting evidence:', error);
      return false;
    }
  }, [user]);

  return {
    loading,
    evidence,
    getEvidenceUrl,
    fetchUserEvidence,
    deleteEvidence
  };
};
