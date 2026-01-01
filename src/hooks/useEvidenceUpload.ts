import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadEvidenceParams {
  file: File | Blob;
  mediaType: 'photo' | 'video' | 'audio';
  incidentId?: string;
  latitude?: number;
  longitude?: number;
}

export const useEvidenceUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadEvidence = useCallback(async (params: UploadEvidenceParams) => {
    if (!user) {
      toast.error('Please sign in to upload evidence');
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const extension = params.mediaType === 'photo' ? 'jpg' : params.mediaType === 'video' ? 'webm' : 'webm';
      const fileName = `${user.id}/${timestamp}_${params.mediaType}.${extension}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, params.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setProgress(50);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('evidence')
        .getPublicUrl(fileName);

      // Create evidence record
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          user_id: user.id,
          incident_id: params.incidentId,
          media_type: params.mediaType,
          file_url: urlData.publicUrl,
          file_size: params.file.size,
          latitude: params.latitude,
          longitude: params.longitude,
          captured_at: new Date().toISOString()
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      setProgress(100);
      toast.success('Evidence uploaded securely');
      return evidenceData;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Failed to upload evidence');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user]);

  return {
    uploading,
    progress,
    uploadEvidence
  };
};
