import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const config: UserConfig = {
  plugins: [
    react(),
    vike({
      // Use default settings:
      prerender: true
    }),
    VitePWA({ registerType: 'autoUpdate' })
  ]
};

export default config;
