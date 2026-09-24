import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './styles/global.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service workers are for the web/PWA build only — skip inside native WebViews
// to avoid stale Capacitor asset caching.
if (
  import.meta.env.PROD &&
  !Capacitor.isNativePlatform() &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => {
        // Pick up a new sw.js as soon as the tab loads / focuses
        reg.update().catch(() => {});
        const onFocus = () => {
          reg.update().catch(() => {});
        };
        window.addEventListener('focus', onFocus);
        // Activate waiting worker immediately so reload gets the new build
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available — next navigation/reload uses it (skipWaiting already in sw)
            }
          });
        });
      })
      .catch(() => {
        // Service workers are optional; the app remains usable without offline caching.
      });
  });
}
