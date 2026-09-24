import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.wortland.app',
  appName: 'WortLand AI',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    TextToSpeech: {},
    CapacitorUpdater: {
      // Manual / self-hosted OTA — we fetch our own latest.json and call download/next.
      autoUpdate: false,
      // Disable Capgo cloud stats / channel traffic
      statsUrl: '',
      channelUrl: '',
      updateUrl: '',
      appReadyTimeout: 10000,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
    },
  },
};

export default config;
