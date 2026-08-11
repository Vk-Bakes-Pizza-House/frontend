import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Improve production chunking to avoid very large single bundles.
  // - `manualChunks` splits vendor code (React and other node_modules) into separate files.
  // - `chunkSizeWarningLimit` raised slightly to avoid noisy warnings while still keeping an eye on big bundles.
  build: {
    chunkSizeWarningLimit: 1200, // KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor.react';
            if (id.includes('zustand') || id.includes('lodash')) return 'vendor.state-utils';
            return 'vendor';
          }
        },
      },
    },
  },
})
