import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initNativePlatform } from './lib/capacitor';
import './index.css';

// Initialize native platform features (StatusBar, SplashScreen)
// No-op on web — only activates inside Capacitor shell
initNativePlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
