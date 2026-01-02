import { Capacitor } from '@capacitor/core';

// Check if running as native app
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android', 'ios', or 'web'

// Helper to check if a plugin is available
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

console.log(`Running on platform: ${platform}, isNative: ${isNative}`);
