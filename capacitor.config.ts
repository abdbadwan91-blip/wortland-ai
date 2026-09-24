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
  },
};

export default config;
