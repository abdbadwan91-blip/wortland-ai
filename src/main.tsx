import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './styles/global.css';
import App from './App.tsx';
import {
  notifyNativeAppReady,
  startOtaBackgroundCheck,
} from './modules/Ota/liveUpdate';

// CRITICAL: tell Capgo the JS bundle booted — otherwise it auto-rolls back (~10s).
void notifyNativeAppReady();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Self-hosted OTA: download in background; apply on next launch/background.
if (Capacitor.isNativePlatform()) {
  const lang =
    (typeof localStorage !== 'undefined' &&
      (() => {
        try {
          const raw = localStorage.getItem('deutsch-quest-profile-v1');
          if (!raw) return 'en';
          const parsed = JSON.parse(raw) as { appLanguage?: string };
          return parsed.appLanguage || 'en';
        } catch {
          return 'en';
        }
      })()) ||
    'en';
  const toastByLang: Record<string, string> = {
    ar: 'تحديث جديد جاهز — سيُطبَّق عند فتح اللعبة مرة أخرى',
    de: 'Neues Update bereit — wird beim nächsten Öffnen angewendet',
    en: 'New update ready — it will apply the next time you open the game',
  };
  startOtaBackgroundCheck(toastByLang[lang] || toastByLang.en);
}

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
