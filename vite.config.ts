import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const config: UserConfig = {
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'script-defer',
      registerType: 'autoUpdate',
      manifest: {
        name: 'InCrop',
        short_name: 'InCrop',
        description: 'Redefine your images, your way! InCrop is the ultimate tool for inverse cropping, letting you seamlessly remove the center of your photos and bring edges together for a unique, standout effect. Crop smarter, not harder!',
        theme_color: '#ffffff',
        icons: [
          {
            'src': 'pwa-64x64.png',
            'sizes': '64x64',
            'type': 'image/png'
          },
          {
            'src': 'pwa-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'pwa-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          },
          {
            'src': 'maskable-icon-512x512.jpg',
            'sizes': '512x512',
            'type': 'image/jpeg',
            'purpose': 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
    vike({
      prerender: true
    })
  ],
  build: {
    rollupOptions: {
      external: ['workbox-window']
    }
  }
};

export default config;
