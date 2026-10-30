import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import seo from './seo.plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: {
    target: 'es2022',
    // three.js is one deliberate, long-cached vendor chunk
    chunkSizeWarningLimit: 1300,
    rolldownOptions: {
      output: {
        // vendors in their own long-cached chunks, so a content edit doesn't re-download three.js
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\/](three|@react-three|postprocessing|three-stdlib|troika-[^\/]+|maath|camera-controls)[\/]/ },
            { name: 'motion', test: /node_modules[\/](gsap|@gsap|lenis|motion|framer-motion|motion-dom|motion-utils|@floating-ui)[\/]/ },
            { name: 'react', test: /node_modules[\/](react|react-dom|scheduler)[\/]/ },
          ],
        },
      },
    },
  },
})
