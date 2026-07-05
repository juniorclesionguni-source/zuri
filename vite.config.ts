import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zuri',
        short_name: 'Zuri',
        description: 'Leitura digital por subscrição',
        theme_color: '#C96A58',
        background_color: '#FEF8F5',
        display: 'standalone',
        orientation: 'any', // responsivo: adapta-se a retrato/paisagem (telemóvel, tablet, laptop)
        start_url: '/',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com/, handler: 'CacheFirst' as const },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com/, handler: 'CacheFirst' as const },
        ],
      },
    }),
  ],
})
