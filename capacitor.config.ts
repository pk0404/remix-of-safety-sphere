import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safetysphere.app',
  appName: 'Safety Sphere',
  webDir: 'dist',
  server: {
    url: 'https://4fd2c86d-2d16-4b24-a76f-1edb6c1e5918.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#ef4444'
    },
    Geolocation: {
      permissions: ['coarseLocation', 'fineLocation']
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
