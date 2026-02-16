import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Initialize native platform features when running inside Capacitor.
 * Safe to call on web — checks for native platform first.
 */
export async function initNativePlatform(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Set status bar to match our dark header
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch {
    // StatusBar not available on this platform
  }

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide();
  } catch {
    // SplashScreen not available
  }
}

/**
 * Check if running inside a native Capacitor shell.
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform: 'ios', 'android', or 'web'.
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}
