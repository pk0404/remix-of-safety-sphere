import { useCallback } from 'react';
import { Share, ShareOptions, ShareResult } from '@capacitor/share';
import { isNative, isPluginAvailable } from '@/lib/capacitor';
import { toast } from 'sonner';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
  files?: string[];
}

interface UseNativeShareReturn {
  share: (data: ShareData) => Promise<ShareResult | null>;
  canShare: () => Promise<boolean>;
}

export const useNativeShare = (): UseNativeShareReturn => {
  
  const canShare = useCallback(async (): Promise<boolean> => {
    if (isNative && isPluginAvailable('Share')) {
      return true;
    }
    return 'share' in navigator;
  }, []);

  const share = useCallback(async (data: ShareData): Promise<ShareResult | null> => {
    try {
      if (isNative && isPluginAvailable('Share')) {
        const options: ShareOptions = {
          title: data.title,
          text: data.text,
          url: data.url,
          dialogTitle: data.dialogTitle,
          files: data.files
        };
        return await Share.share(options);
      } else if ('share' in navigator && typeof navigator.share === 'function') {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url
        });
        return { activityType: 'web-share' };
      } else if ('clipboard' in navigator && navigator.clipboard) {
        // Fallback: copy to clipboard
        const shareText = `${data.title}\n${data.text}\n${data.url || ''}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard');
        return { activityType: 'clipboard' };
      } else {
        toast.error('Sharing not supported on this device');
        return null;
      }
    } catch (e: unknown) {
      const error = e as { name?: string; message?: string };
      if (error.name !== 'AbortError') {
        console.error('Share failed:', e);
        toast.error('Failed to share');
      }
      return null;
    }
  }, []);

  return { share, canShare };
};
