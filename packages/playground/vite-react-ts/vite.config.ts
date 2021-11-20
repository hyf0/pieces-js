import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pieces from '@pieces-js/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pieces.vite()],
})
