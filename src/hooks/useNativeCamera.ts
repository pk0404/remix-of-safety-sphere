import { useCallback, useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isNative, isPluginAvailable } from '@/lib/capacitor';
import { toast } from 'sonner';

interface CapturedMedia {
  type: 'photo' | 'video';
  dataUrl: string;
  path?: string;
}

interface UseNativeCameraReturn {
  capturedMedia: CapturedMedia | null;
  capturing: boolean;
  takePhoto: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  clearMedia: () => void;
}

export const useNativeCamera = (): UseNativeCameraReturn => {
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [capturing, setCapturing] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNative && isPluginAvailable('Camera')) {
      try {
        const permission = await Camera.requestPermissions();
        return permission.camera === 'granted' && permission.photos === 'granted';
      } catch (e) {
        console.error('Camera permission request failed:', e);
        return false;
      }
    }
    return true;
  }, []);

  const takePhoto = useCallback(async () => {
    setCapturing(true);
    
    try {
      if (isNative && isPluginAvailable('Camera')) {
        // Use Capacitor Camera for native
        const photo: Photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          saveToGallery: true
        });

        if (photo.dataUrl) {
          setCapturedMedia({
            type: 'photo',
            dataUrl: photo.dataUrl,
            path: photo.path
          });
          toast.success('Photo captured successfully');
        }
      } else {
        // Web fallback - use MediaDevices API
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();

          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());

          setCapturedMedia({
            type: 'photo',
            dataUrl
          });
          toast.success('Photo captured successfully');
        } catch (e) {
          throw new Error('Camera access denied');
        }
      }
    } catch (e: any) {
      console.error('Failed to capture photo:', e);
      toast.error(e.message || 'Failed to capture photo');
    } finally {
      setCapturing(false);
    }
  }, []);

  const clearMedia = useCallback(() => {
    setCapturedMedia(null);
  }, []);

  return {
    capturedMedia,
    capturing,
    takePhoto,
    requestPermission,
    clearMedia
  };
};
