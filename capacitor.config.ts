import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.andretti.raceweekend',
  appName: 'Race Weekend Manager',
  webDir: 'dist',
  server: {
    // In development, point to the Vite dev server
    // Uncomment the line below during local development:
    // url: 'http://YOUR_LOCAL_IP:5173',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#818cf8',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
